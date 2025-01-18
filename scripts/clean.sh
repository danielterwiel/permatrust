#!/bin/bash
set -e

# Stop dfx if running
if pgrep -x "dfx" > /dev/null; then
    dfx stop
fi

# Clean build artifacts
cargo clean
rm -rf .dfx
rm -rf src/declarations
rm -rf src/pt_frontend/dist

# Clean node modules (optional)
# rm -rf node_modules
# rm -rf src/pt_frontend/node_modules
