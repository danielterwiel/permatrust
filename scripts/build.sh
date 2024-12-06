#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

SCRIPT_DIR=$(dirname "$(realpath "$0")")
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

# Clean up
echo "Cleaning up..."
cargo clean
rm -rf .dfx
rm -rf src/declarations/

echo "Installing root npm dependencies..."
npm ci

echo "Building Rust project..."
cargo build --release --target wasm32-unknown-unknown --package pt_backend

# Create .dfx/local/canisters directory structure
mkdir -p .dfx/local/canisters/pt_frontend
# Create canisters first
echo "Creating canisters..."
CANISTERS=("pt_backend" "internet_identity" "pt_frontend")
for CANISTER in "${CANISTERS[@]}"; do
    echo "Creating canister $CANISTER..."
    dfx canister create "$CANISTER"
    sleep 1
done
# assetstorage.did file
echo "Creating asset canister interface..."
mkdir -p .dfx/local/canisters/pt_frontend
cat > .dfx/local/canisters/pt_frontend/assetstorage.did << EOL
type BatchId = nat;
type ChunkId = nat;
type Key = text;
type Time = int;
service : {
    get: (record {
        key: Key;
        accept_encodings: vec text;
    }) -> (record {
        content: blob;
        content_type: text;
        content_encoding: text;
        total_length: nat;
        sha256: opt blob;
    }) query;
    list: (record {}) -> (vec record {
        key: Key;
        content_type: text;
        encodings: vec record {
            content_encoding: text;
            total_length: nat;
            modified: Time;
        };
    }) query;
    create_batch: (record {}) -> (record { batch_id: BatchId });
    create_chunk: (record { batch_id: BatchId; content: blob }) -> (record { chunk_id: ChunkId });
    commit_batch: (record { batch_id: BatchId; operations: vec record {
        key: Key;
        content_encoding: text;
        content_type: text;
        content: blob;
        sha256: opt blob;
    } }) -> ();
}
EOL
echo "Install candid-extractor"
cargo install candid-extractor
echo "Generating Candid definitions..."
candid-extractor target/wasm32-unknown-unknown/release/pt_backend.wasm > src/pt_backend/pt_backend.did
echo "Downloading Internet Identity candid file..."
mkdir -p .dfx/local/canisters/internet_identity
curl -o .dfx/local/canisters/internet_identity/internet_identity.did \
    https://github.com/dfinity/internet-identity/releases/latest/download/internet_identity.did
echo "Generate declarations..."
dfx generate
echo "Building all canisters..."
dfx build

echo "Building pt_frontend using Vite..."
npm run build

echo "Build process completed successfully!"
