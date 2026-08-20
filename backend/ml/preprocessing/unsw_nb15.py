import os
import pandas as pd


def load_unsw_nb15(raw_dataset_path):
    """
    Load and merge the UNSW-NB15 dataset.

    Parameters
    ----------
    raw_dataset_path : str
        Path to datasets/UNSW-NB15/raw

    Returns
    -------
    pandas.DataFrame
        Combined training and testing dataset.
    """

    print("=" * 60)
    print("LOADING UNSW-NB15 DATASET")
    print("=" * 60)

    train_file = os.path.join(raw_dataset_path, "UNSW_NB15_training-set.parquet")

    test_file = os.path.join(raw_dataset_path, "UNSW_NB15_testing-set.parquet")

    if not os.path.exists(train_file):
        raise FileNotFoundError(f"Missing file: {train_file}")

    if not os.path.exists(test_file):
        raise FileNotFoundError(f"Missing file: {test_file}")

    print("\nLoading training dataset...")

    train_df = pd.read_parquet(train_file)

    print(f"Training Rows    : {train_df.shape[0]}")
    print(f"Training Columns : {train_df.shape[1]}")

    print("\nLoading testing dataset...")

    test_df = pd.read_parquet(test_file)

    print(f"Testing Rows    : {test_df.shape[0]}")
    print(f"Testing Columns : {test_df.shape[1]}")

    print("\nMerging datasets...")

    dataset = pd.concat([train_df, test_df], ignore_index=True)

    print("\nMerge Completed Successfully!")

    print(f"Total Rows    : {dataset.shape[0]}")
    print(f"Total Columns : {dataset.shape[1]}")

    return dataset
