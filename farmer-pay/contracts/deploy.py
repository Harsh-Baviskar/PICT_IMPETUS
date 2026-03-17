"""
Deploy FarmerEscrow to Algorand TestNet.

Usage:
    python deploy.py

After deploy, paste the printed App ID into:
  - backend/.env  →  CONTRACT_APP_ID=<id>
  - This file's output goes into artifacts/app_id.txt automatically
"""

import os
import json
from pathlib import Path

# algokit deploy handles most of this via algokit.toml.
# This script is for manual / CI deploys.

def main():
    print("=" * 50)
    print("FarmerEscrow Deploy Script")
    print("=" * 50)
    print()
    print("Run the following commands instead of this script directly:")
    print()
    print("  algokit sandbox start          # start local node for testing")
    print("  algokit project run test       # run unit tests first")
    print("  algokit project deploy testnet # deploy to TestNet")
    print("  algokit project generate       # export ABI JSON to artifacts/")
    print()
    print("After deploy:")
    print("  1. Copy the printed App ID")
    print("  2. Paste into backend/.env  →  CONTRACT_APP_ID=<id>")
    print("  3. Commit artifacts/abi.json to the repo")
    print("  4. Post App ID in the group chat")

    # Write placeholder app_id.txt so the file exists in the repo
    artifacts_dir = Path(__file__).parent / "artifacts"
    artifacts_dir.mkdir(exist_ok=True)
    app_id_file = artifacts_dir / "app_id.txt"
    if not app_id_file.exists():
        app_id_file.write_text("REPLACE_WITH_APP_ID_AFTER_DEPLOY\n")
        print(f"\nCreated {app_id_file} — replace after deploy.")


if __name__ == "__main__":
    main()
