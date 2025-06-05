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
    if is_rust_canister "$CANISTER_ARG"; then
        BUILD_RUST_CANISTERS=("$CANISTER_ARG")
        BUILD_OTHER_CANISTERS=()
        log_info "Building Rust canister: $CANISTER_ARG"
    else
        BUILD_RUST_CANISTERS=()
        BUILD_OTHER_CANISTERS=("$CANISTER_ARG")
        log_info "Building canister: $CANISTER_ARG"
    fi
else
    # Build all canisters
    BUILD_RUST_CANISTERS=("${RUST_CANISTERS[@]}")
    BUILD_OTHER_CANISTERS=("${NON_RUST_CANISTERS[@]}")
    log_info "Building all canisters..."
fi

# Build Rust canisters
if [[ ${#BUILD_RUST_CANISTERS[@]} -gt 0 ]]; then
    log_info "Building Rust canisters..."
    for canister in "${BUILD_RUST_CANISTERS[@]}"; do
        log_info "Building $canister..."
        run_dfx_with_env dfx build "$canister"
    done
fi

# Generate types only if Rust canisters were built or if building all
if [[ ${#BUILD_RUST_CANISTERS[@]} -gt 0 || -z "$CANISTER_ARG" ]]; then
    log_info "Generating types..."
    ./scripts/generate.sh
fi

# Build other canisters
if [[ ${#BUILD_OTHER_CANISTERS[@]} -gt 0 ]]; then
    log_info "Building other canisters..."
    for canister in "${BUILD_OTHER_CANISTERS[@]}"; do
        log_info "Building $canister..."
        dfx build "$canister"
    done
fi

if [[ -n "$CANISTER_ARG" ]]; then
    log_success "Canister $CANISTER_ARG built successfully!"
else
    log_success "All canisters built successfully!"
fi
