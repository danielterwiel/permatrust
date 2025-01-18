#!/bin/bash
set -e

# Ensure everything is built
./scripts/build.sh

# Deploy canisters
dfx deploy internet_identity
dfx deploy pt_backend
dfx deploy pt_frontend

echo "Deployment completed successfully!"
