import os
import pandas as pd
import numpy as np

CHUNK_SIZE = 100000


def normalize_columns(columns):
    """
    Normalize column names.
    """

    return [col.strip().lower().replace(" ", "_") for col in columns]


def discover_master_schema(csv_files, raw_dataset_path):
    """
    Discover the union of all columns across every CSV.
    Only reads the header row of each file.
    """

    print("=" * 60)
    print("DISCOVERING MASTER SCHEMA")
    print("=" * 60)

    master_columns = set()

    for file in csv_files:

        path = os.path.join(raw_dataset_path, file)

        header = pd.read_csv(path, nrows=0, low_memory=False)

        columns = normalize_columns(header.columns)

        master_columns.update(columns)

        print(f"{file:<25}" f"{len(columns):>5} columns")

    master_columns = sorted(master_columns)

    print("\nMaster Schema")

    print(f"Total Columns : {len(master_columns)}")

    return master_columns


def align_chunk_to_schema(chunk, master_columns):
    """
    Align a chunk to the master schema.
    """

    # Add missing columns
    for column in master_columns:

        if column not in chunk.columns:

            chunk[column] = np.nan

    # Remove extra columns
    extra_columns = [column for column in chunk.columns if column not in master_columns]

    if extra_columns:

        chunk.drop(columns=extra_columns, inplace=True)

    # Remove duplicate column names
    chunk = chunk.loc[:, ~chunk.columns.duplicated()]

    # Reorder
    chunk = chunk[master_columns]

    return chunk


def clean_chunk(chunk):
    """
    Clean a chunk before saving.
    """

    chunk.replace([np.inf, -np.inf], np.nan, inplace=True)

    chunk.dropna(inplace=True)

    chunk.drop_duplicates(inplace=True)

    return chunk


def save_chunk(chunk, output_file, first_write):
    """
    Save a processed chunk.
    """

    chunk.to_csv(
        output_file, mode="w" if first_write else "a", header=first_write, index=False
    )

    return False


def load_cicids2018(raw_dataset_path, output_file):
    """
    Load and preprocess the CSE-CIC-IDS2018 dataset.

    - Reads all CSV files in chunks.
    - Aligns columns across all files.
    - Cleans each chunk.
    - Writes a single processed CSV.
    - Returns a sample DataFrame for summary.
    """

    print("=" * 60)
    print("LOADING CSE-CIC-IDS2018 DATASET")
    print("=" * 60)

    csv_files = sorted(
        [file for file in os.listdir(raw_dataset_path) if file.endswith(".csv")]
    )

    if len(csv_files) == 0:
        raise FileNotFoundError("No CSV files found.")

    print(f"\nFound {len(csv_files)} CSV files.\n")

    master_columns = discover_master_schema(csv_files, raw_dataset_path)
    first_write = True

    for file in csv_files:

        file_path = os.path.join(raw_dataset_path, file)

        print(f"\nProcessing : {file}")

        for chunk in pd.read_csv(file_path, chunksize=100000, low_memory=False):

            chunk.columns = normalize_columns(chunk.columns)

            # ---------------------------------
            # Create master schema
            # ---------------------------------

            # ---------------------------------
            # Add missing columns
            # ---------------------------------

            chunk = align_chunk_to_schema(chunk, master_columns)

            # ---------------------------------
            # Cleaning
            # ---------------------------------

            chunk = clean_chunk(chunk)

            # ---------------------------------
            # Save
            # ---------------------------------

            first_write = save_chunk(chunk, output_file, first_write)

    print("\nDataset Processing Completed Successfully!")

    print("\nReading sample for summary...\n")

    sample = pd.read_csv(
        output_file,
        nrows=1000,
        low_memory=False,
    )

    return sample
