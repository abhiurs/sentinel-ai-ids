import os
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

MODELS_DIR = os.path.join(CURRENT_DIR, "..", "models")


SUPPORTED_DATASETS = [
    "CICIDS2017",
    "CSE-CIC-IDS2018",
    "NSL-KDD",
    "UNSW-NB15",
]


def detect_dataset(dataframe):
    """
    Detect the dataset by comparing uploaded CSV columns
    with each dataset's feature_names.pkl.
    """

    uploaded_columns = set(dataframe.columns)

    best_dataset = None
    best_percentage = 0

    for dataset in SUPPORTED_DATASETS:

        feature_path = os.path.join(MODELS_DIR, dataset, "feature_names.pkl")

        if not os.path.exists(feature_path):
            continue

        try:

            expected_features = joblib.load(feature_path)

        except Exception as e:

            print(f"{dataset} -> skipped " f"(unable to load feature metadata): {e}")

            continue

        expected_features = set(expected_features)

        if not expected_features:
            print(f"{dataset} -> skipped (no expected features)")
            continue

        matched = uploaded_columns.intersection(expected_features)

        percentage = (len(matched) / len(expected_features)) * 100

        print(f"{dataset} -> {percentage:.2f}%")

        if percentage > best_percentage:
            best_percentage = percentage
            best_dataset = dataset

    if best_dataset is None:
        raise Exception("Unable to detect dataset.")

    if best_percentage < 95:
        raise Exception(
            f"Unsupported dataset. Best match: "
            f"{best_dataset} ({best_percentage:.2f}%)"
        )

    return best_dataset
