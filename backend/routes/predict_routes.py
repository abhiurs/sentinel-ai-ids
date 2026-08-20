from fileinput import filename

from flask import Blueprint, request, jsonify
import pandas as pd
import os
import json
import tempfile
import time
from collections import Counter
from database.mongodb import db
from datetime import datetime

from utils.auth_middleware import token_required

from ml.prediction.predictor import predict_attack
from ml.prediction.dataset_detector import detect_dataset

history_collection = db["analysis_history"]
predict_bp = Blueprint("predict", __name__, url_prefix="/api/predict")

# --------------------------------------------------
# Load Trained Model Metrics
# --------------------------------------------------


def load_model_metrics(dataset_name):

    metrics_path = os.path.join(
        "ml",
        "models",
        dataset_name,
        "metrics.json",
    )

    print("=" * 60)
    print("Loading Metrics")
    print(metrics_path)
    print("Exists:", os.path.exists(metrics_path))
    print("=" * 60)

    if not os.path.exists(metrics_path):
        return {}

    with open(metrics_path, "r") as file:
        metrics = json.load(file)

    print("=" * 60)
    print("Metrics Loaded Successfully")
    print(metrics)
    print("=" * 60)

    model_metrics = {}

    for model_name, values in metrics["models"].items():

        model_metrics[model_name] = {
            "accuracy": values["accuracy"],
            "precision": values["precision"],
            "recall": values["recall"],
            "f1_score": values["f1_score"],
            "training_time": values["training_time_seconds"],
            "prediction_time": values["prediction_time_seconds"],
        }

    print("=" * 60)
    print(model_metrics)
    print("=" * 60)

    return model_metrics


@predict_bp.route("/", methods=["POST"], strict_slashes=False)
@token_required
def predict(payload):

    try:
        start_time = time.perf_counter()

        # --------------------------------------------------
        # Check Upload
        # --------------------------------------------------

        if "file" not in request.files:
            return jsonify({"success": False, "message": "No file uploaded."}), 400

        uploaded_file = request.files["file"]

        if uploaded_file.filename == "":
            return (
                jsonify({"success": False, "message": "Please select a CSV file."}),
                400,
            )

        filename = uploaded_file.filename.lower()

        if not filename.endswith(".csv"):
            return (
                jsonify({"success": False, "message": "Only CSV files are supported."}),
                400,
            )

        allowed_models = {
            "Random Forest",
            "Extra Trees",
            "XGBoost",
            "Decision Tree",
            "KNN",
        }

        selected_model = request.form.get("model", "XGBoost")

        if selected_model not in allowed_models:
            return (
                jsonify({"success": False, "message": "Unsupported model selected."}),
                400,
            )

        # --------------------------------------------------
        # Save Temporarily
        # --------------------------------------------------

        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as temp_file:
            temp_path = temp_file.name

        uploaded_file.save(temp_path)

        # --------------------------------------------------
        # Read CSV
        # --------------------------------------------------

        dataset = pd.read_csv(temp_path)

        detected_dataset = detect_dataset(dataset)

        print("\n" + "=" * 60)
        print("DATASET DETECTED")
        print(f"Dataset : {detected_dataset}")
        print("=" * 60 + "\n")

        total_records = len(dataset)
        if total_records == 0:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "The uploaded CSV file contains no records.",
                    }
                ),
                400,
            )
        total_features = len(dataset.columns)

        if "Label" in dataset.columns:
            dataset = dataset.drop(columns=["Label"])

        missing_values = int(dataset.isnull().sum().sum())

        # --------------------------------------------------
        # Run AI Prediction
        # --------------------------------------------------

        predictions = predict_attack(dataset, detected_dataset, selected_model)

        prediction_counter = Counter(predictions)

        benign_count = prediction_counter.get("Benign", 0)

        malicious_count = total_records - benign_count

        safe_percentage = round((benign_count / total_records) * 100, 2)

        malicious_percentage = round((malicious_count / total_records) * 100, 2)

        # --------------------------------------------------
        # Severity
        # --------------------------------------------------

        critical = 0
        high = 0
        medium = 0
        low = 0

        for attack, count in prediction_counter.items():

            attack_lower = attack.lower()

            if attack_lower == "benign":
                continue

            elif "dos" in attack_lower or "ddos" in attack_lower:
                critical += count

            elif "portscan" in attack_lower or "bruteforce" in attack_lower:
                high += count

            elif "bot" in attack_lower or "web" in attack_lower:
                medium += count

            else:
                low += count

        # --------------------------------------------------
        # Overall Prediction
        # --------------------------------------------------

        overall_prediction = "Benign"

        if malicious_count > 0:
            overall_prediction = "Malicious"

        confidence = round(max(safe_percentage, malicious_percentage), 2)

        # --------------------------------------------------
        # Load Model Metrics
        # --------------------------------------------------

        model_metrics = load_model_metrics(detected_dataset)

        print("=" * 60)
        print(model_metrics)
        print("=" * 60)

        # --------------------------------------------------
        # Response
        # --------------------------------------------------

        analysis_time = round(time.perf_counter() - start_time, 2)

        response_data = {
            "success": True,
            "datasetName": detected_dataset,
            "uploadedFile": uploaded_file.filename,
            "model": selected_model,
            "modelMetrics": model_metrics,
            "prediction": overall_prediction,
            "confidence": confidence,
            "totalRecords": total_records,
            "packetsAnalyzed": total_records,
            "safeTraffic": safe_percentage,
            "maliciousTraffic": malicious_percentage,
            "missingValues": missing_values,
            "totalFeatures": total_features,
            "fileSize": f"{round(os.path.getsize(temp_path)/(1024*1024),2)} MB",
            "analysisTime": f"{analysis_time} sec",
            "severity": (
                "Critical"
                if critical > 0
                else "High" if high > 0 else "Medium" if medium > 0 else "Low"
            ),
            "attackSummary": dict(prediction_counter),
            "severityBreakdown": {
                "critical": critical,
                "high": high,
                "medium": medium,
                "low": low,
            },
        }

        history_collection.insert_one(
            {
                "user_id": payload["user_id"],
                "datasetName": response_data["datasetName"],
                "model": response_data["model"],
                "prediction": response_data["prediction"],
                "confidence": response_data["confidence"],
                "totalRecords": response_data["totalRecords"],
                "packetsAnalyzed": response_data["packetsAnalyzed"],
                "safeTraffic": response_data["safeTraffic"],
                "maliciousTraffic": response_data["maliciousTraffic"],
                "missingValues": response_data["missingValues"],
                "totalFeatures": response_data["totalFeatures"],
                "fileSize": response_data["fileSize"],
                "analysisTime": response_data["analysisTime"],
                "severity": response_data["severity"],
                "attackSummary": response_data["attackSummary"],
                "severityBreakdown": response_data["severityBreakdown"],
                "createdAt": datetime.utcnow(),
            }
        )

        print("=" * 60)
        print(response_data)
        print("=" * 60)
        return jsonify(response_data)

    except Exception as e:

        print("Prediction error:", e)

        return jsonify({"success": False, "message": "Dataset analysis failed."}), 500

    finally:

        if "temp_path" in locals() and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
