#!/bin/bash

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$DIR/.."

cd "$ROOT_DIR"

echo "Installing requirements..."
pip install -r ingestion/requirements.txt

echo "Running ingestion pipeline..."
export PYTHONPATH="$ROOT_DIR"
python ingestion/pipeline.py "$ROOT_DIR/knowledge-base/public"
