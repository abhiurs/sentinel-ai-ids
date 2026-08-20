import os
import joblib
import numpy as np
import pandas as pd

from functools import lru_cache

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(CURRENT_DIR, "..", "models")


MODEL_FILES = {
    "Decision Tree": "decision_tree.pkl",
    "Random Forest": "random_forest.pkl",
    "Extra Trees": "extra_trees.pkl",
    "KNN": "knn.pkl",
    "XGBoost": "xgboost.pkl",
}


SUPPORTED_DATASETS = {
    "CICIDS2017",
    "CSE-CIC-IDS2018",
    "NSL-KDD",
    "UNSW-NB15",
}


@lru_cache(maxsize=32)
def load_artifacts(dataset_name, model_name):
    """
    Load and cache the ML model and preprocessing
    artifacts for a dataset/model combination.
    """

    if dataset_name not in SUPPORTED_DATASETS:
        raise ValueError(f"Unsupported dataset: {dataset_name}")

    if model_name not in MODEL_FILES:
        raise ValueError(f"Unsupported model: {model_name}")

    dataset_path = os.path.join(
        MODELS_DIR,
        dataset_name,
    )

    model_path = os.path.join(
        dataset_path,
        MODEL_FILES[model_name],
    )

    scaler_path = os.path.join(
        dataset_path,
        "scaler.pkl",
    )

    encoder_path = os.path.join(
        dataset_path,
        "label_encoder.pkl",
    )

    feature_path = os.path.join(
        dataset_path,
        "feature_names.pkl",
    )

    artifact_paths = {
        "model": model_path,
        "scaler": scaler_path,
        "label_encoder": encoder_path,
        "feature_names": feature_path,
    }

    missing_artifacts = [
        name for name, path in artifact_paths.items() if not os.path.isfile(path)
    ]

    if missing_artifacts:

        raise FileNotFoundError(
            "Missing ML artifact(s): "
            + ", ".join(missing_artifacts)
            + f" for dataset '{dataset_name}' "
            f"and model '{model_name}'."
        )

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    label_encoder = joblib.load(encoder_path)
    feature_names = joblib.load(feature_path)

    if not feature_names:

        raise ValueError(f"No feature names found for dataset '{dataset_name}'.")

    feature_names = list(feature_names)

    if not all(isinstance(name, str) for name in feature_names):

        raise ValueError(f"Invalid feature names for dataset '{dataset_name}'.")

    return (
        model,
        scaler,
        label_encoder,
        feature_names,
    )


def prepare_features(features, feature_names):
    """
    Convert live/external features into the exact
    feature order expected by the trained model.
    """

    # -------------------------------------------------
    # CASE 1: Dictionary from live feature extractor
    # -------------------------------------------------
    if isinstance(features, dict):

        dataframe = pd.DataFrame([features])

        dataframe = dataframe.reindex(
            columns=feature_names,
            fill_value=0,
        )

        dataframe = dataframe.apply(
            pd.to_numeric,
            errors="coerce",
        )

        dataframe = dataframe.fillna(0)

        return dataframe

    # -------------------------------------------------
    # CASE 2: Pandas DataFrame
    # -------------------------------------------------
    if isinstance(features, pd.DataFrame):

        dataframe = features.copy()

        dataframe = dataframe.reindex(
            columns=feature_names,
            fill_value=0,
        )

        dataframe = dataframe.apply(
            pd.to_numeric,
            errors="coerce",
        )

        dataframe = dataframe.fillna(0)

        return dataframe

    # -------------------------------------------------
    # CASE 3: Numerical array/list
    # -------------------------------------------------
    array = np.asarray(features)

    if array.ndim == 1:
        array = array.reshape(1, -1)

    if array.shape[1] != len(feature_names):
        raise ValueError(
            f"Feature count mismatch. "
            f"Received {array.shape[1]}, "
            f"expected {len(feature_names)}."
        )

    return pd.DataFrame(
        array,
        columns=feature_names,
    )


def predict_attack(
    features,
    dataset_name,
    model_name="XGBoost",
):
    """
    Predict network traffic using the selected
    dataset and machine-learning model.

    Parameters
    ----------
    features:
        Dictionary, DataFrame, list, or NumPy array.

    dataset_name:
        CICIDS2017,
        CSE-CIC-IDS2018,
        NSL-KDD,
        UNSW-NB15

    model_name:
        Decision Tree,
        Random Forest,
        Extra Trees,
        KNN,
        XGBoost

    Returns
    -------
    list
        Predicted attack/traffic labels.
    """

    (
        model,
        scaler,
        label_encoder,
        feature_names,
    ) = load_artifacts(
        dataset_name,
        model_name,
    )

    prepared_features = prepare_features(
        features,
        feature_names,
    )

    scaled_features = scaler.transform(prepared_features)

    prediction = model.predict(scaled_features)

    if len(prediction) == 0:

        raise ValueError("ML model returned no prediction.")

    attack_names = label_encoder.inverse_transform(prediction)

    return attack_names.tolist()


def predict_attack_details(
    features,
    dataset_name,
    model_name="XGBoost",
):
    """
    Prediction function for live monitoring.

    Returns the predicted label and confidence
    when the selected model supports predict_proba().
    """

    (
        model,
        scaler,
        label_encoder,
        feature_names,
    ) = load_artifacts(
        dataset_name,
        model_name,
    )

    prepared_features = prepare_features(
        features,
        feature_names,
    )

    scaled_features = scaler.transform(prepared_features)

    prediction = model.predict(scaled_features)

    attack_names = label_encoder.inverse_transform(prediction)

    result = {
        "prediction": attack_names[0],
        "confidence": None,
    }

    # Some models support probability estimates.
    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(scaled_features)

        result["confidence"] = float(np.max(probabilities[0]))

    return result


if __name__ == "__main__":

    DATASET = "CICIDS2017"
    MODEL = "XGBoost"

    dataset_path = os.path.join(
        CURRENT_DIR,
        "..",
        "datasets",
        DATASET,
        "processed",
        "processed_dataset.csv",
    )

    dataset = pd.read_csv(dataset_path)

    if "Label" in dataset.columns:
        dataset = dataset.drop(columns=["Label"])

    sample = dataset.iloc[[0]]

    prediction = predict_attack(
        sample,
        DATASET,
        MODEL,
    )

    print("\nPrediction Result:")
    print(prediction)
