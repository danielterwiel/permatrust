#!/bin/bash
set -e

# Download II candid first
./scripts/candid/download-ii.sh

# Install dfx if not present
if ! command -v dfx &> /dev/null; then
    DFX_VERSION=$(cat dfx.json | grep -o '"dfx": "[^"]*' | cut -d'"' -f4 || echo "0.15.1")
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
fi

# Start dfx if not running
if ! pgrep -x "dfx" > /dev/null; then
    dfx start --background
    sleep 2
fi

# Create canisters if they don't exist
CANISTERS=("pt_backend" "internet_identity" "pt_frontend")
for CANISTER in "${CANISTERS[@]}"; do
    dfx canister create "$CANISTER" || true
done

# Create asset canister interface
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
