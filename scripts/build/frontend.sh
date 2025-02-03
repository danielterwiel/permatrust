#!/usr/bin/env bash
set -eo pipefail

# Ensure backend is built first
if [ ! -f "target/wasm32-unknown-unknown/release/pt_backend.wasm" ]; then
    ./scripts/build/backend.sh
fi

dfx generate

# Build frontend canister
dfx build pt_frontend
