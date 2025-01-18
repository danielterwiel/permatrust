#!/bin/bash
set -e

# Ensure directories exist
mkdir -p src/candid
mkdir -p src/declarations

# Generate Candid from Rust WASM
candid-extractor target/wasm32-unknown-unknown/release/pt_backend.wasm > src/candid/pt_backend.did

# Download Internet Identity declarations
./scripts/candid/download-ii.sh

# Generate TypeScript declarations
dfx generate

# Create symbolic links for compatibility
mkdir -p src/pt_backend
ln -sf src/candid/pt_backend.did src/pt_backend/pt_backend.did
