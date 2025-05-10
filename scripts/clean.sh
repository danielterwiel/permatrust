#!/usr/bin/env bash
set -eo pipefail

# Stop dfx if running
if pgrep -x "dfx" >/dev/null; then
  dfx stop
fi

# Clean build artifacts
cargo clean
rm -rf .dfx
rm -rf src/declarations
rm -rf src/pt_frontend/dist
rm -f src/main_canister/src/main_canister.did
rm -f src/tenant_canister/src/tenant_canister.did
