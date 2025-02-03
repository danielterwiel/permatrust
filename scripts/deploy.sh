#!/usr/bin/env bash
set -eo pipefail

export DFX_CACHE_PATH=~/.cache/dfx

# Ensure everything is built
./scripts/build.sh

# Deploy canisters

dfx deploy internet_identity --with-cycles 1000000000000
dfx deploy pt_backend --with-cycles 1000000000000
dfx deploy pt_frontend --with-cycles 1000000000000

# dfx deploy --with-cycles 1000000000000

echo "Deployment completed successfully!"
