#!/bin/bash
set -e

# Create all necessary directories
mkdir -p src/declarations/internet_identity
mkdir -p .dfx/local/canisters/internet_identity

# Define the target file path
TARGET_FILE="src/declarations/internet_identity/internet_identity.did"
DFX_TARGET=".dfx/local/canisters/internet_identity/internet_identity.did"

# Only download if the file doesn't exist
if [ ! -f "$TARGET_FILE" ]; then
    if curl -L -o "$TARGET_FILE" \
        https://github.com/dfinity/internet-identity/releases/latest/download/internet_identity.did; then
        # Move to dfx location (needed for type generation)
        cp "$TARGET_FILE" "$DFX_TARGET"
        echo "Successfully downloaded internet_identity.did"
    else
        echo "Failed to download internet_identity.did"
        exit 1
    fi
else
    echo "File already exists, skipping download"
    # Ensure dfx copy exists even if we skip download
    cp "$TARGET_FILE" "$DFX_TARGET"
fi
