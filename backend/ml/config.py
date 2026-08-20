import os

# ==========================================================
# Project Root
# ==========================================================

ML_ROOT = os.path.dirname(os.path.abspath(__file__))

# backend/
BACKEND_ROOT = os.path.dirname(ML_ROOT)

# Sentinel-AI-IDS/
PROJECT_ROOT = os.path.dirname(BACKEND_ROOT)

# ==========================================================
# Main ML Folders
# ==========================================================

DATASETS_ROOT = os.path.join(ML_ROOT, "datasets")

MODELS_ROOT = os.path.join(ML_ROOT, "models")

EVALUATION_ROOT = os.path.join(ML_ROOT, "evaluation")

PREDICTION_ROOT = os.path.join(ML_ROOT, "prediction")

PREPROCESSING_ROOT = os.path.join(ML_ROOT, "preprocessing")

TRAINING_ROOT = os.path.join(ML_ROOT, "training")

from ml.preprocessing.cicids2017 import load_cicids2017
from ml.preprocessing.cicids2018 import load_cicids2018
from ml.preprocessing.nsl_kdd import load_nsl_kdd
from ml.preprocessing.unsw_nb15 import load_unsw_nb15

# ==========================================================
# Supported Dataset Configuration
# ==========================================================

DATASET_CONFIG = {
    "CICIDS2017": {
        "loader": load_cicids2017,
        "streaming": False,
        "label_column": "Label",
        "drop_columns": [],
    },
    "CSE-CIC-IDS2018": {
        "loader": load_cicids2018,
        "streaming": True,
        "label_column": "label",
        "drop_columns": [],
    },
    "NSL-KDD": {
        "loader": load_nsl_kdd,
        "streaming": False,
        "label_column": 41,
        "drop_columns": [42],
    },
    "UNSW-NB15": {
        "loader": load_unsw_nb15,
        "streaming": False,
        "label_column": "label",
        "drop_columns": [],
    },
}
