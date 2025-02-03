#!/usr/bin/env bash
set -eo pipefail

# Stop dfx if running
if pgrep -x "dfx" > /dev/null; then
    dfx stop
fi

# Clean build artifacts
rm -rf .dfx
rm -rf src/declarations
rm -rf src/pt_frontend/dist
