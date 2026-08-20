import os
import sys
import pandas as pd
import numpy as np

from .cicids2017 import load_cicids2017
from .cicids2018 import load_cicids2018
from .nsl_kdd import load_nsl_kdd
from .unsw_nb15 import load_unsw_nb15
from ml.config import DATASETS_ROOT

# ======================================
# Dataset Selection
# ======================================

if len(sys.argv) < 2:
    raise ValueError("Usage: python -m ml.preprocessing.prepare_dataset <DATASET_NAME>")

DATASET_NAME = sys.argv[1]

# ======================================
# Folder Paths
# ======================================

DATASET_DIR = os.path.join(
    DATASETS_ROOT,
    DATASET_NAME,
)

RAW_DATASET_PATH = os.path.join(
    DATASET_DIR,
    "raw",
)

PROCESSED_DATASET_PATH = os.path.join(
    DATASET_DIR,
    "processed",
)

os.makedirs(
    PROCESSED_DATASET_PATH,
    exist_ok=True,
)

OUTPUT_FILE = os.path.join(
    PROCESSED_DATASET_PATH,
    "processed_dataset.csv",
)

print("=" * 70)
print(f"Preparing Dataset : {DATASET_NAME}")
print("=" * 70)

# ======================================
# Dataset Configuration
# ======================================

from ml.config import (
    DATASETS_ROOT,
    DATASET_CONFIG,
)

# ======================================
# Load Dataset
# ======================================

config = DATASET_CONFIG[DATASET_NAME]

loader = config["loader"]

streaming = config["streaming"]

label_column = config["label_column"]

if streaming:

    loader(
        RAW_DATASET_PATH,
        OUTPUT_FILE,
    )

    dataset = pd.read_csv(
        OUTPUT_FILE,
        low_memory=False,
    )

else:

    dataset = loader(RAW_DATASET_PATH)

# ======================================
# Common Cleaning
# ======================================

print("\nCleaning Dataset...")

dataset.replace([np.inf, -np.inf], np.nan, inplace=True)

dataset.dropna(inplace=True)

dataset.drop_duplicates(inplace=True)

print("Cleaning Completed.")

# ======================================
# Save Dataset
# ======================================

dataset.to_csv(OUTPUT_FILE, index=False)

print("\nDataset Saved Successfully!")

print(OUTPUT_FILE)

# ======================================
# Summary
# ======================================

print("\nDataset Summary")

print("-" * 70)

print("Rows :", dataset.shape[0])

print("Columns :", dataset.shape[1])

print("\nLabel Distribution\n")

LABEL_COLUMNS = {
    "CICIDS2017": "label",
    "CSE-CIC-IDS2018": "label",
    "NSL-KDD": 41,
    "UNSW-NB15": "label",
}

label_column = LABEL_COLUMNS[DATASET_NAME]

if isinstance(label_column, int):

    if label_column >= len(dataset.columns):
        raise ValueError(f"Label column index {label_column} not found.")

    print(dataset.iloc[:, label_column].value_counts())

else:

    if label_column not in dataset.columns:
        raise ValueError(
            f"Label column '{label_column}' not found.\n"
            f"Available Columns:\n{list(dataset.columns)}"
        )

    print(dataset[label_column].value_counts())

print(dataset[label_column].value_counts())
