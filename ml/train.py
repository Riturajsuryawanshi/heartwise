"""
Entrypoint for training HeartWise India models.
"""
from train_baseline import train_and_evaluate, os

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_csv = os.path.join(base_dir, "..", "data", "synthetic_cardiac_india.csv")
    models_dir = os.path.join(base_dir, "models")
    reports_dir = os.path.join(base_dir, "reports")

    train_and_evaluate(data_csv, models_dir, reports_dir)
