#!/usr/bin/env bash
set -eo pipefail

# Download II candid first
./scripts/codegen/download-ii.sh

# CI-specific configuration
if [ "$CI" = "true" ]; then
    # Source environment for current shell
    source "$HOME/.local/share/dfx/env"
else
    # Local development install
    if ! command -v dfx &> /dev/null; then
        DFX_VERSION="0.24.3"  # Match CI version
        sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    fi
fi

# Verify installation
if ! command -v dfx &> /dev/null; then
    echo "❌ Critical Error: dfx not found in PATH after installation attempt"
    exit 1
fi

# Start dfx if not running
if ! pgrep -x "dfx" > /dev/null; then
    dfx start --background
    sleep 5  # Increased wait time for CI stability
fi

# Create canisters with retry logic
CANISTERS=("pt_backend" "internet_identity" "pt_frontend")
for CANISTER in "${CANISTERS[@]}"; do
    for i in {1..3}; do
        dfx canister create "$CANISTER" && break || sleep 5
    done
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
