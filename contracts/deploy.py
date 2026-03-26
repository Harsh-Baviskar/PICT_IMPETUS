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
import subprocess
from pathlib import Path


def main():
    print("=" * 50)
    print("FarmerEscrow Deploy Script")
    print("=" * 50)
    print()

    # First compile the contract
    print("Compiling contract...")
    python_path = r"C:\Users\ASUS\AppData\Local\Programs\Python\Python312\python.exe"
    env = os.environ.copy()
    env["PYTHONPATH"] = r"C:\Users\ASUS\AppData\Local\Programs\Python\Python312"
    env["PATH"] = r"C:\Users\ASUS\AppData\Local\Programs\Python\Python312;" + env.get("PATH", "")
    compile_result = subprocess.run([
        "algokit", "compile", "python", "contract.py"
    ], capture_output=True, text=True, cwd=Path(__file__).parent, env=env)

    if compile_result.returncode != 0:
        print("❌ Compilation failed:")
        print("STDOUT:", compile_result.stdout)
        print("STDERR:", compile_result.stderr)
        return

    print("✅ Contract compiled successfully")

    # Check if artifacts were created
    artifacts_dir = Path(__file__).parent / "artifacts"
    if not artifacts_dir.exists():
        print("❌ No artifacts directory found after compilation")
        return

    # Look for the compiled contract file
    arc56_files = list(artifacts_dir.glob("*.arc56.json"))
    if not arc56_files:
        print("❌ No .arc56.json file found in artifacts")
        return

    app_spec_path = arc56_files[0]
    print(f"Found app spec: {app_spec_path}")

    # Now deploy using algokit-utils
    print("Deploying to TestNet...")
    deploy_result = subprocess.run([
        "algokit", "project", "deploy", "testnet"
    ], capture_output=True, text=True, cwd=Path(__file__).parent)

    if deploy_result.returncode != 0:
        print("❌ Deployment failed:")
        print(deploy_result.stderr)
        return

    print("✅ Contract deployed successfully!")
    print(deploy_result.stdout)

    # Try to extract app ID from output
    output_lines = deploy_result.stdout.split('\n')
    for line in output_lines:
        if 'App ID:' in line or 'app_id' in line.lower():
            print(line.strip())


if __name__ == "__main__":
    main()
