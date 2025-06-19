#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# Validate dfx.json and populate canister arrays
validate_dfx_config
populate_canister_arrays

# Function to get and display WASM file size
show_wasm_size() {
    local canister_name="$1"
    local wasm_file="target/wasm32-unknown-unknown/release/${canister_name}.wasm"

    if [[ -f "$wasm_file" ]]; then
        local file_size
        file_size=$(stat -f%z "$wasm_file" 2>/dev/null || stat -c%s "$wasm_file" 2>/dev/null)

        # Simple size formatting
        if [[ "$file_size" -ge 1048576 ]]; then
            local mb_size=$(echo "scale=2; $file_size / 1048576" | bc 2>/dev/null || echo "$((file_size / 1048576))")
            log_info "  WASM size: ${mb_size} MB (${file_size} bytes)"
        elif [[ "$file_size" -ge 1024 ]]; then
            local kb_size=$(echo "scale=2; $file_size / 1024" | bc 2>/dev/null || echo "$((file_size / 1024))")
            log_info "  WASM size: ${kb_size} KB (${file_size} bytes)"
        else
            log_info "  WASM size: ${file_size} bytes"
        fi
    else
        log_warn "  WASM file not found: $wasm_file"
    fi
}

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
        show_wasm_size "$canister"
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
