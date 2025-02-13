#!/usr/bin/env bash
set -eo pipefail

# Check if WASM file exists
WASM_FILE="target/wasm32-unknown-unknown/release/pt_backend.wasm"
if [ ! -f "$WASM_FILE" ]; then
    echo "WASM file not found. Building project..."
    cargo build --target wasm32-unknown-unknown --release
fi

# Ensure directories exist
mkdir -p src/declarations/pt_backend

# Generate Candid from Rust WASM
echo "Generating Candid interface from WASM..."
candid-extractor "$WASM_FILE" > src/pt_backend/pt_backend.did

# Download Internet Identity declarations
echo "Downloading Internet Identity declarations..."
./scripts/codegen/download-ii.sh

# Generate TypeScript declarations
echo "Generating TypeScript bindings..."
dfx generate

echo "Generation complete!"
