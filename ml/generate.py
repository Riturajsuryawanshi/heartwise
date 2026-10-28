"""
Wrapper entrypoint for synthetic data generation.
"""
from generate_synthetic_cardiac_india import generate_data, os

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_csv = os.path.join(out_dir, "synthetic_cardiac_india.csv")
    df = generate_data(num_samples=300_000, random_seed=42)
    print(f"Saving to {out_csv}...")
    df.to_csv(out_csv, index=False)
    print("Done.")
