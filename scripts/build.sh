#!/usr/bin/env bash
set -eo pipefail

# Get script directory
SCRIPT_DIR=$(dirname "$(realpath "$0")")
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

# Clean existing build
./scripts/clean.sh

# Setup environment
./scripts/setup/dfx.sh
./scripts/setup/rust.sh
./scripts/setup/node.sh

# Build backend
./scripts/build/backend.sh

# Build frontend
./scripts/build/frontend.sh

echo "Build process completed successfully!"
