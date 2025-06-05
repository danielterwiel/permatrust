#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# Validate dfx.json and populate canister arrays
validate_dfx_config
populate_canister_arrays

# Ensure directories exist
log_info "Creating declaration directories..."
for canister in "${RUST_CANISTERS[@]}"; do
    ensure_directory "src/declarations/$canister"
    ensure_directory "src/$canister"
done
ensure_directory "src/declarations/shared"

# Generate Candid from Rust WASMs
log_info "Generating Candid interfaces from WASM files..."

for canister in "${RUST_CANISTERS[@]}"; do
    wasm_file=$(get_wasm_path "$canister")
    did_file="src/$canister/$canister.did"
    
    if [[ -f "$wasm_file" ]]; then
        log_info "Extracting Candid for $canister..."
        candid-extractor "$wasm_file" > "$did_file"
    else
        log_warn "WASM file not found: $wasm_file (skipping Candid extraction)"
    fi
done

log_info "Running dfx generate..."
dfx generate

log_success "Candid generation completed!"
