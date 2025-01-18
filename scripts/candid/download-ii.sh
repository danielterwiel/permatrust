#!/bin/bash
set -e

# Create necessary directories
mkdir -p src/candid
mkdir -p .dfx/local/canisters/internet_identity

# Download latest II candid file to both locations
curl -o src/candid/internet_identity.did \
    https://github.com/dfinity/internet-identity/releases/latest/download/internet_identity.did

# Move to dfx location (needed for type generation)
# TODO: make a symlink in stead?
cp src/candid/internet_identity.did .dfx/local/canisters/internet_identity/internet_identity.did
