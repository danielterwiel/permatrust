#!/bin/bash
set -e

# Ensure backend is built first
if [ ! -f "target/wasm32-unknown-unknown/release/pt_backend.wasm" ]; then
    ./scripts/build/backend.sh
fi

# Build frontend canister
dfx build pt_frontend
