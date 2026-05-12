import subprocess
import sys
import os

ROOT = os.path.dirname(os.path.abspath(__file__))  # .../FounderSuite/Backend


def run(script_path: str):
    full_path = os.path.join(ROOT, script_path)

    if not os.path.exists(full_path):
        print(f"Script not found: {full_path}")
        sys.exit(1)

    print(f"\n{'=' * 50}")
    print(f"Running {script_path}")
    print('=' * 50)

    result = subprocess.run(
        [sys.executable, full_path],
        cwd=ROOT,
    )

    if result.returncode != 0:
        print(f"\nFailed at {script_path} (exit code {result.returncode})")
        sys.exit(result.returncode)


if __name__ == '__main__':
    run('data/generate.py')
    run('model/train.py')
    run('evaluate/evaluate.py')

    print("\nDone.")