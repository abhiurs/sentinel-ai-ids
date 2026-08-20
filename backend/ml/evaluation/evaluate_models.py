import os
import pandas as pd
import matplotlib.pyplot as plt

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_PATH = os.path.join(
    CURRENT_DIR,
    "model_comparison.csv"
)

CHART_PATH = os.path.join(
    CURRENT_DIR,
    "charts"
)

os.makedirs(CHART_PATH, exist_ok=True)

results = pd.read_csv(CSV_PATH)

print(results)

# ============================================================
# Function to Generate Comparison Charts
# ============================================================

def generate_chart(column_name, title, y_label, file_name):

    plt.figure(figsize=(10,6))

    plt.bar(
        results["Model"],
        results[column_name]
    )

    plt.title(title)
    plt.ylabel(y_label)
    plt.xticks(rotation=15)

    plt.tight_layout()

    plt.savefig(
        os.path.join(
            CHART_PATH,
            file_name
        )
    )

    plt.close()

    print(f"{file_name} generated successfully!")


# ===========================
# Generate Charts
# ===========================

generate_chart(
    "Accuracy",
    "Accuracy Comparison",
    "Accuracy",
    "accuracy.png"
)

generate_chart(
    "Precision",
    "Precision Comparison",
    "Precision",
    "precision.png"
)

generate_chart(
    "Recall",
    "Recall Comparison",
    "Recall",
    "recall.png"
)

generate_chart(
    "F1 Score",
    "F1 Score Comparison",
    "F1 Score",
    "f1_score.png"
)

generate_chart(
    "Training Time",
    "Training Time Comparison",
    "Seconds",
    "training_time.png"
)

generate_chart(
    "Prediction Time",
    "Prediction Time Comparison",
    "Seconds",
    "prediction_time.png"
)