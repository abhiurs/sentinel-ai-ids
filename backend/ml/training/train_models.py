import os
import sys
import json
import time
import joblib
import pandas as pd

from ml.config import (
    DATASETS_ROOT,
    MODELS_ROOT,
    EVALUATION_ROOT,
)
from sklearn.tree import DecisionTreeClassifier


from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
)

from sklearn.neighbors import KNeighborsClassifier

from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

# ======================================
# Dataset Configuration
# ======================================

if len(sys.argv) < 2:
    raise ValueError("Usage: python -m ml.training.train_models <DATASET_NAME>")

DATASET_NAME = sys.argv[1]

from ml.config import (
    DATASETS_ROOT,
    MODELS_ROOT,
    EVALUATION_ROOT,
    DATASET_CONFIG,
)

if DATASET_NAME not in DATASET_CONFIG:
    raise ValueError(
        f"Unsupported dataset: {DATASET_NAME}\n"
        f"Supported datasets: {', '.join(DATASET_CONFIG.keys())}"
    )

# ======================================
# Folder Paths
# ======================================

DATASET_DIR = os.path.join(
    DATASETS_ROOT,
    DATASET_NAME,
)

PROCESSED_DIR = os.path.join(
    DATASET_DIR,
    "processed",
)

MODEL_PATH = os.path.join(
    MODELS_ROOT,
    DATASET_NAME,
)

EVALUATION_PATH = os.path.join(
    EVALUATION_ROOT,
    DATASET_NAME,
)

os.makedirs(
    MODEL_PATH,
    exist_ok=True,
)

os.makedirs(
    EVALUATION_PATH,
    exist_ok=True,
)


# ======================================
# Processed Dataset Files
# ======================================

X_TRAIN_PATH = os.path.join(PROCESSED_DIR, "X_train.csv")

X_TEST_PATH = os.path.join(PROCESSED_DIR, "X_test.csv")

Y_TRAIN_PATH = os.path.join(PROCESSED_DIR, "y_train.csv")

Y_TEST_PATH = os.path.join(PROCESSED_DIR, "y_test.csv")

LABEL_ENCODER_PATH = os.path.join(
    MODEL_PATH,
    "label_encoder.pkl",
)

# ======================================
# Load Preprocessed Dataset
# ======================================

print("=" * 60)
print(f"LOADING PREPROCESSED DATASET : {DATASET_NAME}")
print("=" * 60)

# Load feature matrices
X_train = pd.read_csv(X_TRAIN_PATH)

X_test = pd.read_csv(X_TEST_PATH)

# Load label vectors
y_train = pd.read_csv(Y_TRAIN_PATH).squeeze("columns")

y_test = pd.read_csv(Y_TEST_PATH).squeeze("columns")

# Load label encoder
label_encoder = joblib.load(LABEL_ENCODER_PATH)

print("\nPreprocessed Dataset Loaded Successfully!")

print(f"\nTraining Samples : {X_train.shape[0]}")
print(f"Testing Samples  : {X_test.shape[0]}")

print(f"\nTraining Features : {X_train.shape[1]}")
print(f"Testing Features  : {X_test.shape[1]}")

print(f"\nNumber of Classes : {len(label_encoder.classes_)}")


# ====================================================
# Generic Model Trainer
# ====================================================


def train_and_evaluate_model(
    model,
    model_name,
    model_file,
    X_train_data,
    X_test_data,
    y_train_data,
    y_test_data,
):

    print("\n" + "=" * 70)
    print(f"TRAINING : {model_name.upper()}")
    print("=" * 70)

    # -------------------------
    # Train Model
    # -------------------------

    start_time = time.time()

    model.fit(X_train_data, y_train_data)

    training_time = time.time() - start_time

    print(f"\n{model_name} trained successfully.")

    print(f"Training Time : {training_time:.2f} seconds")

    # -------------------------
    # Prediction
    # -------------------------

    prediction_start = time.time()

    predictions = model.predict(X_test_data)

    print("Prediction shape:", predictions.shape)
    print("Prediction dtype:", predictions.dtype)
    print("y_test shape:", y_test_data.shape)

    prediction_time = time.time() - prediction_start

    print(f"Prediction Time : {prediction_time:.4f} seconds")

    # -------------------------
    # Performance Metrics
    # -------------------------

    accuracy = accuracy_score(
        y_test_data,
        predictions,
    )

    precision = precision_score(
        y_test_data,
        predictions,
        average="weighted",
        zero_division=0,
    )

    recall = recall_score(
        y_test_data,
        predictions,
        average="weighted",
        zero_division=0,
    )

    f1 = f1_score(
        y_test_data,
        predictions,
        average="weighted",
        zero_division=0,
    )

    print("\nPerformance")

    print(f"Accuracy  : {accuracy:.4f}")

    print(f"Precision : {precision:.4f}")

    print(f"Recall    : {recall:.4f}")

    print(f"F1 Score  : {f1:.4f}")

    # -------------------------
    # Save Model
    # -------------------------

    model_path = os.path.join(
        MODEL_PATH,
        model_file,
    )

    joblib.dump(
        model,
        model_path,
    )

    print("\nModel Saved Successfully!")

    print(model_path)

    # -------------------------
    # Confusion Matrix
    # -------------------------

    cm = confusion_matrix(
        y_test_data,
        predictions,
        labels=label_encoder.transform(label_encoder.classes_),
    )

    cm_df = pd.DataFrame(cm)

    cm_path = os.path.join(
        EVALUATION_PATH,
        f"{model_file.replace('.pkl','')}_confusion_matrix.csv",
    )

    cm_df.to_csv(
        cm_path,
        index=False,
    )

    # -------------------------
    # Classification Report
    # -------------------------

    report = classification_report(
        y_test_data,
        predictions,
        labels=label_encoder.transform(label_encoder.classes_),
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0,
    )

    report_df = pd.DataFrame(report).transpose()

    report_path = os.path.join(
        EVALUATION_PATH,
        f"{model_file.replace('.pkl','')}_classification_report.csv",
    )

    report_df.to_csv(
        report_path,
    )

    report_df.to_excel(
        os.path.join(
            EVALUATION_PATH,
            f"{model_file.replace('.pkl','')}_classification_report.xlsx",
        ),
        index=True,
    )

    print("Evaluation Reports Saved!")

    # -------------------------
    # Return Metrics
    # -------------------------

    return {
        "Model": model_name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1,
        "Training Time": training_time,
        "Prediction Time": prediction_time,
    }


# ====================================================
# Model Configuration
# ====================================================
num_classes = len(label_encoder.classes_)

if num_classes == 2:

    xgb_model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=8,
        min_child_weight=3,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
        tree_method="hist",
        n_jobs=-1,
    )

else:

    xgb_model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=8,
        min_child_weight=3,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1,
        objective="multi:softprob",
        num_class=num_classes,
        eval_metric="mlogloss",
        random_state=42,
        tree_method="hist",
        n_jobs=-1,
    )

models = [
    (
        DecisionTreeClassifier(
            criterion="gini",
            splitter="best",
            max_depth=30,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
        ),
        "Decision Tree",
        "decision_tree.pkl",
    ),
    (
        RandomForestClassifier(
            n_estimators=300,
            max_depth=30,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features="sqrt",
            bootstrap=True,
            random_state=42,
            n_jobs=-1,
        ),
        "Random Forest",
        "random_forest.pkl",
    ),
    (
        ExtraTreesClassifier(
            n_estimators=300,
            max_depth=30,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features="sqrt",
            random_state=42,
            n_jobs=-1,
        ),
        "Extra Trees",
        "extra_trees.pkl",
    ),
    (
        xgb_model,
        "XGBoost",
        "xgboost.pkl",
    ),
]

# ====================================================
# Train Models
# ====================================================

results = []

for model, model_name, model_file in models:

    results.append(
        train_and_evaluate_model(
            model=model,
            model_name=model_name,
            model_file=model_file,
            X_train_data=X_train,
            X_test_data=X_test,
            y_train_data=y_train,
            y_test_data=y_test,
        )
    )

# ====================================================
# Train KNN
# ====================================================

print("\n" + "=" * 70)
print("PREPARING DATA FOR KNN")
print("=" * 70)

# ----------------------------------------------------
# KNN performs better on smaller datasets.
# Limit the subset size while remaining compatible
# with every supported dataset.
# ----------------------------------------------------

max_train_samples = min(50000, len(X_train))

max_test_samples = min(20000, len(X_test))

X_train_knn = X_train.iloc[:max_train_samples]
y_train_knn = y_train[:max_train_samples]

X_test_knn = X_test.iloc[:max_test_samples]
y_test_knn = y_test[:max_test_samples]


print(f"\nKNN Training Samples : {len(X_train)}")
print(f"KNN Testing Samples  : {len(X_test)}")

results.append(
    train_and_evaluate_model(
        model=KNeighborsClassifier(
            n_neighbors=5,
            weights="distance",
            algorithm="ball_tree",
            leaf_size=30,
            metric="minkowski",
            p=2,
            n_jobs=-1,
        ),
        model_name="KNN",
        model_file="knn.pkl",
        X_train_data=X_train_knn,
        X_test_data=X_test_knn,
        y_train_data=y_train_knn,
        y_test_data=y_test_knn,
    )
)

# ====================================================
# Model Comparison
# ====================================================

print("\n" + "=" * 80)
print("MODEL COMPARISON")
print("=" * 80)

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="Accuracy",
    ascending=False,
).reset_index(drop=True)

print(results_df)

comparison_csv = os.path.join(
    EVALUATION_PATH,
    "model_comparison.csv",
)

results_df.to_csv(
    comparison_csv,
    index=False,
)

comparison_excel = os.path.join(
    EVALUATION_PATH,
    "model_comparison.xlsx",
)

results_df.to_excel(
    comparison_excel,
    index=False,
)

print("\nModel comparison reports saved successfully!")

# ====================================================
# Best Model
# ====================================================

best_model = results_df.iloc[0]

print("\n" + "=" * 80)
print("BEST MODEL")
print("=" * 80)

print(f"Model           : {best_model['Model']}")

print(f"Accuracy        : {best_model['Accuracy']:.4f}")

print(f"Precision       : {best_model['Precision']:.4f}")

print(f"Recall          : {best_model['Recall']:.4f}")

print(f"F1 Score        : {best_model['F1 Score']:.4f}")

print(f"Training Time   : {best_model['Training Time']:.2f} sec")

print(f"Prediction Time : {best_model['Prediction Time']:.4f} sec")

# ====================================================
# Save metrics.json
# ====================================================

metrics = {
    "dataset": DATASET_NAME,
    "best_model": best_model["Model"],
    "total_models": len(results_df),
    "models": {},
}

for _, row in results_df.iterrows():

    metrics["models"][row["Model"]] = {
        "accuracy": round(float(row["Accuracy"]) * 100, 2),
        "precision": round(float(row["Precision"]) * 100, 2),
        "recall": round(float(row["Recall"]) * 100, 2),
        "f1_score": round(float(row["F1 Score"]) * 100, 2),
        "training_time_seconds": round(
            float(row["Training Time"]),
            2,
        ),
        "prediction_time_seconds": round(
            float(row["Prediction Time"]),
            4,
        ),
    }

metrics_path = os.path.join(
    MODEL_PATH,
    "metrics.json",
)

with open(metrics_path, "w") as file:

    json.dump(
        metrics,
        file,
        indent=4,
    )

print("\nmetrics.json saved successfully!")

print(metrics_path)

# ====================================================
# Training Summary
# ====================================================

print("\n" + "=" * 80)
print("TRAINING COMPLETED SUCCESSFULLY")
print("=" * 80)

print(f"Dataset            : {DATASET_NAME}")

print(f"Models Trained     : {len(results_df)}")

print(f"Best Model         : {best_model['Model']}")

print(f"Best Accuracy      : {best_model['Accuracy']:.4f}")

print(f"Evaluation Folder  : {EVALUATION_PATH}")

print(f"Models Folder      : {MODEL_PATH}")

print("=" * 80)
