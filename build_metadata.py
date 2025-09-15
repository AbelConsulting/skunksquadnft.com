def auto_generate_txid_files(images_dir="."):
    base = Path(images_dir)
    pngs = list(base.glob("*.png"))
    for img in pngs:
        token_id = Path(img.name).stem.split("__")[0]
        txid_file = base / f"{token_id}.txid"
        if not txid_file.exists():
            dummy_txid = f"DUMMY_TXID_{token_id}"
            txid_file.write_text(dummy_txid)
            print(f"Created {txid_file} with dummy TXID: {dummy_txid}")
    print(f"Auto-generated .txid files for {len(pngs)} PNGs.")

def generate_txid_files_from_csv(csv_path="txid_map.csv", output_dir="."):
    base = Path(output_dir)
    if not Path(csv_path).exists():
        print(f"ERROR: {csv_path} not found.", file=sys.stderr)
        return
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            token_id = str(row.get("token_id", "")).strip()
            txid = str(row.get("image_txid", "")).strip()
            if not token_id or not txid:
                print(f"Skipping row missing token_id/image_txid: {row}")
                continue
            txid_file = base / f"{token_id}.txid"
            txid_file.write_text(txid)
            print(f"Created {txid_file} with TXID: {txid}")
    print(f".txid files generated from {csv_path}.")
def simulate_test_images(num_images=10):
    print(f"Simulating {num_images} test images and .txid files...")
    # First image: user-specified background and TXID
    first_name = "0001__Background-Bo.png"
    first_txid = "BTgPmylg9Yc4jni_TF-0tcEyY7YCL9zEYLZa92i__Bo"
    Path(first_name).write_text("dummy image content")
    Path("0001.txid").write_text(first_txid)
    # Remaining images: generic traits and TXIDs
    for i in range(2, num_images + 1):
        fname = f"{i:04d}__Background-Test__Trait-Value{i}.png"
        txid = f"TXID_{i:04d}"
        Path(fname).write_text("dummy image content")
        Path(f"{i:04d}.txid").write_text(txid)
    print("Test files created.")
    option_b_from_filenames(".")
    print("Test run complete. Output in metadata_out/")
    # Clean up dummy files (optional)
    for i in range(1, num_images + 1):
        Path(f"{i:04d}__Background-Test__Trait-Value{i}.png").unlink(missing_ok=True)
        Path(f"{i:04d}.txid").unlink(missing_ok=True)
    Path(first_name).unlink(missing_ok=True)
    print("Dummy files cleaned up.")

#!/usr/bin/env python3
# Skunk Squad NFT asset storage:
# ArDrive: https://app.ardrive.io/#/drives/a7009e14-f5ab-4485-b955-c80db1a7f350?name=SkunkSquadNFT

ARDRIVE_LINK = "https://app.ardrive.io/#/drives/a7009e14-f5ab-4485-b955-c80db1a7f350?name=SkunkSquadNFT"
IMAGE_URL_PREFIX = ARDRIVE_LINK + "/"
import csv
import json
import os
import re
import sys
from pathlib import Path

OUT_DIR = Path("metadata_out")
OUT_DIR.mkdir(exist_ok=True)

# Fixed columns for Option A
COL_FIXED = ["token_id", "image_txid", "name", "description"]

def row_to_metadata(row, image_url_prefix=IMAGE_URL_PREFIX):
    token_id = int(row["token_id"])
    name = row.get("name", f"Skunk Squad #{token_id:04d}")
    description = row.get("description", "Member of the Skunk Squad NFT collection")
    txid = row["image_txid"].strip()
    image_url = image_url_prefix + txid
    attributes = [
        {"trait_type": k, "value": v}
        for k, v in row.items()
        if k not in COL_FIXED and v not in (None, "")
    ]
    meta = {
        "name": name,
        "description": description,
        "image": image_url,
        "attributes": attributes
    }
    return token_id, meta

def option_a_from_csv(csv_path="metadata_input.csv"):
    if not Path(csv_path).exists():
        print(f"ERROR: {csv_path} not found. For Option B, delete this file and use filenames.", file=sys.stderr)
        sys.exit(1)
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("token_id") or not row.get("image_txid"):
                print(f"Skipping row missing token_id/image_txid: {row}")
                continue
            token_id, meta = row_to_metadata(row)
            (OUT_DIR / f"{token_id}.json").write_text(
                json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
            )

    
    stem = Path(fname).stem
    parts = stem.split("__")
    try:
        token_id = int(parts[0])
    except Exception:
        token_id = int(re.sub(r"\D+", "", parts[0]) or "0")
    attrs = {}
    for part in parts[1:]:
        if "-" not in part:
            continue
        k, v = part.split("-", 1)
        k = k.replace("_", " ").replace("-", " ").strip().title()
        v = v.replace("_", " ").replace("-", " ").strip()
        attrs[k] = v
    return token_id, attrs

if __name__ == "__main__":
    # Run the simulation test for 10 images:
    # simulate_test_images(10)
    if Path("metadata_input.csv").exists():
        option_a_from_csv("metadata_input.csv")
        print(f"Done. Wrote JSONs to {OUT_DIR.resolve()}")

