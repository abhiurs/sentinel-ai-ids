import os
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from ml.config import (
    DATASETS_ROOT,
    MODELS_ROOT,
)

# ======================================
# Folder Paths
# ======================================

# ======================================
# Dataset Configuration
# ======================================

import sys

if len(sys.argv) < 2:
    raise ValueError("Usage: python -m ml.preprocessing.preprocess_data <DATASET_NAME>")

DATASET_NAME = sys.argv[1]

from ml.config import (
    DATASETS_ROOT,
    MODELS_ROOT,
    DATASET_CONFIG,
)

config = DATASET_CONFIG[DATASET_NAME]

label_column = config["label_column"]

drop_columns = config["drop_columns"]

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

os.makedirs(
    MODEL_PATH,
    exist_ok=True,
)

DATASET_PATH = os.path.join(
    PROCESSED_DIR,
    "processed_dataset.csv",
)

X_TRAIN_PATH = os.path.join(PROCESSED_DIR, "X_train.csv")
X_TEST_PATH = os.path.join(PROCESSED_DIR, "X_test.csv")
Y_TRAIN_PATH = os.path.join(PROCESSED_DIR, "y_train.csv")
Y_TEST_PATH = os.path.join(PROCESSED_DIR, "y_test.csv")

# ======================================
# Load Dataset
# ======================================

print("=" * 60)
print("LOADING CLEAN DATASET")
print("=" * 60)

dataset = pd.read_csv(DATASET_PATH, low_memory=False)

print(f"\nDataset Loaded Successfully!")

print(f"\nRows    : {dataset.shape[0]}")
print(f"Columns : {dataset.shape[1]}")
print("\nValidating Dataset...")

if isinstance(label_column, int):

    if label_column >= len(dataset.columns):
        raise ValueError(f"Label column index {label_column} not found.")

    y = dataset.iloc[:, label_column]

    X = dataset.drop(columns=[dataset.columns[label_column]])

else:

    if label_column not in dataset.columns:
        raise ValueError(f"Label column '{label_column}' not found.")

    y = dataset[label_column]

    X = dataset.drop(columns=[label_column])

print(f"Missing Values : {dataset.isnull().sum().sum()}")

print(f"Duplicate Rows : {dataset.duplicated().sum()}")


numeric_columns = dataset.select_dtypes(include="number")

print("Infinite Values :", np.isinf(numeric_columns).sum().sum())


# ======================================
# Separate Features and Labels
# ======================================

print("\n" + "=" * 60)
print("SEPARATING FEATURES AND LABEL")
print("=" * 60)

if drop_columns:

    dataset.drop(columns=drop_columns, inplace=True, errors="ignore")


# ------------------------------------
# Keep only numeric features
# ------------------------------------

non_numeric_columns = X.select_dtypes(exclude=["number"]).columns.tolist()

if non_numeric_columns:

    print("\nRemoving non-numeric columns:")

    for column in non_numeric_columns:
        print(f" - {column}")

    X = X.drop(columns=non_numeric_columns)

print(f"\nFinal Feature Count : {X.shape[1]}")

print("\nRemaining Feature Types:\n")

print(X.dtypes.value_counts())

print(f"\nFeature Matrix Shape : {X.shape}")
print(f"Label Vector Shape   : {y.shape}")

print("\nAttack Classes:\n")

print(y.value_counts())

feature_names = X.columns.tolist()

feature_path = os.path.join(MODEL_PATH, "feature_names.pkl")

joblib.dump(feature_names, feature_path)

print("\nFeature Names Saved!")

print(feature_path)


# ======================================
# Encode Labels
# ======================================

print("\n" + "=" * 60)
print("ENCODING LABELS")
print("=" * 60)


label_encoder = LabelEncoder()

y_encoded = label_encoder.fit_transform(y)

print("\nAttack Label Mapping:\n")

for index, label in enumerate(label_encoder.classes_):
    print(f"{index} --> {label}")

# Save Label Encoder

label_encoder_path = os.path.join(MODEL_PATH, "label_encoder.pkl")

joblib.dump(label_encoder, label_encoder_path)

print("\nLabel Encoder Saved Successfully!")

print(label_encoder_path)

# ======================================
# Train-Test Split
# ======================================

print("\n" + "=" * 60)
print("TRAIN TEST SPLIT")
print("=" * 60)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
)

print("\nTraining Set")

print(f"Feature Matrix : {X_train.shape}")

print(f"Labels         : {y_train.shape}")

print("\nTesting Set")

print(f"Feature Matrix : {X_test.shape}")
print(f"Labels   : {y_test.shape}")

# ======================================
# Feature Scaling
# ======================================

print("\n" + "=" * 60)
print("FEATURE SCALING")
print("=" * 60)

scaler = StandardScaler()

print("\nFitting scaler on training data...")

X_train_scaled = scaler.fit_transform(X_train)

print("Transforming testing data...")

X_test_scaled = scaler.transform(X_test)

print("\nScaling Completed Successfully!")

print("\nScaler Mean Shape :", scaler.mean_.shape)

print("Scaler Scale Shape :", scaler.scale_.shape)

print(f"\nTraining Data Shape : {X_train_scaled.shape}")
print(f"Testing Data Shape  : {X_test_scaled.shape}")

# ======================================
# Save Processed Dataset
# ======================================

pd.DataFrame(X_train_scaled).to_csv(
    X_TRAIN_PATH,
    index=False,
)

pd.DataFrame(X_test_scaled).to_csv(
    X_TEST_PATH,
    index=False,
)

pd.DataFrame(y_train).to_csv(
    Y_TRAIN_PATH,
    index=False,
)

pd.DataFrame(y_test).to_csv(
    Y_TEST_PATH,
    index=False,
)

print("\nProcessed train/test datasets saved successfully!")

# ======================================
# Save Scaler
# ======================================

scaler_path = os.path.join(MODEL_PATH, "scaler.pkl")

joblib.dump(scaler, scaler_path)

print("\nScaler Saved Successfully!")

print(scaler_path)

print("\n" + "=" * 60)
print("PREPROCESSING SUMMARY")
print("=" * 60)

print(f"Dataset       : {DATASET_NAME}")

print(f"Rows          : {dataset.shape[0]}")

print(f"Columns       : {dataset.shape[1]}")

print(f"Training Size : {X_train.shape}")

print(f"Testing Size  : {X_test.shape}")

print(f"Classes       : {len(label_encoder.classes_)}")

print("\nArtifacts Saved")

print(f"Label Encoder : {label_encoder_path}")

print(f"Scaler        : {scaler_path}")

print(f"Feature Names : {feature_path}")
