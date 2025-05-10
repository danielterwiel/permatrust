#!/usr/bin/env bash
set -eo pipefail

CANISTERS=("main_canister" "tenant_canister" "internet_identity" "pt_frontend")
for CANISTER in "${CANISTERS[@]}"; do
  for _i in {1..4}; do
    dfx canister create "$CANISTER" && break || sleep 5
  done
done

# Create asset canister interface
mkdir -p .dfx/local/canisters/pt_frontend
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
