#!/usr/bin/env bash
set -eo pipefail

# Define WASM file paths
MAIN_WASM="target/wasm32-unknown-unknown/release/main_canister.wasm"
TENANT_WASM="target/wasm32-unknown-unknown/release/tenant_canister.wasm"

# Ensure directories exist
mkdir -p src/declarations/tenant_canister
mkdir -p src/declarations/main_canister
mkdir -p src/declarations/shared

# Generate Candid from Rust WASMs
echo "Generating Candid interface from WASM files..."
mkdir -p src/main_canister
mkdir -p src/tenant_canister

candid-extractor "$TENANT_WASM" >src/tenant_canister/tenant_canister.did
candid-extractor "$MAIN_WASM" >src/main_canister/main_canister.did

dfx generate
