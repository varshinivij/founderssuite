import subprocess
import sys
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

def run(script_path, cwd=None):
    full_path = os.path.join(ROOT, script_path)
    print(f"\n{'='*50}")
    print(f"Running {script_path}")
    print('='*50)
    result = subprocess.run(
        [sys.executable, full_path],
        cwd=cwd or os.path.join(ROOT, os.path.dirname(script_path))
    )
    if result.returncode != 0:
        print(f"Failed at {script_path}")
        sys.exit(1)

if __name__ == '__main__':
    run('data/generate.py')
    run('model/train.py')
    run('evaluate/evaluate.py')
    print("\nDone. Check data/evaluation.png for results.")