#!/usr/bin/env bash
set -eo pipefail

# Build Rust to WASM
cargo build --release --target wasm32-unknown-unknown --package pt_backend

# Generate Candid and types
./scripts/candid/generate.sh

# Build canister
dfx build pt_backend
