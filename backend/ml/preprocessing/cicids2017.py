import os
import pandas as pd


def load_cicids2017(raw_dataset_path):
    """
    Load and merge all CICIDS2017 parquet files.

    Parameters
    ----------
    raw_dataset_path : str
        Path to datasets/CICIDS2017/raw

    Returns
    -------
    pandas.DataFrame
        Merged dataset
    """

    print("=" * 60)
    print("LOADING CICIDS2017 DATASET")
    print("=" * 60)

    parquet_files = sorted(
        [file for file in os.listdir(raw_dataset_path) if file.endswith(".parquet")]
    )

    if len(parquet_files) == 0:
        raise FileNotFoundError("No parquet files found.")

    dataframes = []

    total_rows = 0

    for file in parquet_files:

        path = os.path.join(raw_dataset_path, file)

        print(f"\nLoading : {file}")

        df = pd.read_parquet(path)

        print(f"Rows    : {df.shape[0]}")
        print(f"Columns : {df.shape[1]}")

        total_rows += df.shape[0]

        dataframes.append(df)

    print("\nMerging datasets...")

    dataset = pd.concat(dataframes, ignore_index=True)

    print("\nMerge Completed Successfully!")

    print(f"\nTotal Files : {len(parquet_files)}")
    print(f"Total Rows  : {total_rows}")

    return dataset
