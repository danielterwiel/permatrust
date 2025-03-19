#!/usr/bin/env bash
set -eo pipefail

# Get script directory and project root
SCRIPT_DIR=$(dirname "$(realpath "$0")")
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Change to project root directory
cd "$PROJECT_ROOT"

# Force a clean rebuild to ensure up-to-date WASM with latest type definitions
echo "Cleaning previous build artifacts..."
cargo clean

# Build the backend with latest types
echo "Building project with latest type definitions..."
cargo build --target wasm32-unknown-unknown --release

# Define WASM file paths
BACKEND_WASM="target/wasm32-unknown-unknown/release/pt_backend.wasm"
SHARED_WASM="target/wasm32-unknown-unknown/release/shared.wasm"

# Ensure directories exist
mkdir -p src/declarations/pt_backend
mkdir -p src/declarations/shared

# Generate Candid from Rust WASMs
echo "Generating Candid interface from WASM files..."
mkdir -p src/pt_backend
candid-extractor "$BACKEND_WASM" > src/pt_backend/pt_backend.did

# Only extract shared candid if it's an actual canister (not just a library)
if [ -f "$SHARED_WASM" ]; then
  if candid-extractor "$SHARED_WASM" >/dev/null 2>&1; then
    echo "Extracting shared workspace Candid..."
    mkdir -p src/shared
    candid-extractor "$SHARED_WASM" > src/shared/shared.did
  else
    echo "Shared workspace doesn't expose Candid interface (likely a library only)"
  fi
fi

# Download Internet Identity declarations
echo "Downloading Internet Identity declarations..."
"$SCRIPT_DIR/download-ii.sh"

# Generate TypeScript declarations
echo "Generating TypeScript bindings..."
dfx generate

echo "Generation complete!"
