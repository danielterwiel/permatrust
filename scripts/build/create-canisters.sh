#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# Validate dfx.json and populate canister arrays
validate_dfx_config
populate_canister_arrays

# Parse arguments
CANISTER_ARG="${1:-}"

if [[ -n "$CANISTER_ARG" ]]; then
    # Build specific canister
    CANISTERS=("$CANISTER_ARG")
    log_info "Creating canister: $CANISTER_ARG"
else
    # Build all canisters
    CANISTERS=("${ALL_CANISTERS[@]}")
    log_info "Creating all canisters..."
fi

for canister in "${CANISTERS[@]}"; do
    create_canister_with_retry "$canister"
done

# Create asset canister interface only if pt_frontend is being built
if [[ -z "$CANISTER_ARG" ]] || printf '%s\n' "${ASSET_CANISTERS[@]}" | grep -q "^${CANISTER_ARG}$"; then
    log_info "Creating asset canister interface..."
    ensure_directory ".dfx/local/canisters/pt_frontend"
    cat >.dfx/local/canisters/pt_frontend/assetstorage.did <<EOL
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
fi
