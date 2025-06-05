#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"

# Validate dfx.json and populate canister arrays
validate_dfx_config
populate_canister_arrays

# Parse arguments
CANISTER_ARG="${1:-}"

# Function to get WASM file path for a canister
get_canister_wasm_path() {
    local canister="$1"
    case "$canister" in
        "main_canister") echo "$MAIN_WASM" ;;
        "tenant_canister") echo "$TENANT_WASM" ;;
        "upgrade_canister") echo "$UPGRADE_WASM" ;;
        *) echo "" ;;
    esac
}

if [[ -n "$CANISTER_ARG" ]]; then
    # Optimize specific canister's WASM (only if it's a Rust canister)
    if is_rust_canister "$CANISTER_ARG"; then
        wasm_path=$(get_canister_wasm_path "$CANISTER_ARG")
        if [[ -n "$wasm_path" ]]; then
            WASM_FILES=("$wasm_path")
            log_info "Optimizing WASM file for $CANISTER_ARG..."
        else
            log_warn "No WASM mapping found for Rust canister: $CANISTER_ARG"
            exit 0
        fi
    else
        # Non-Rust canisters don't have WASM files to optimize
        log_info "Skipping optimization for $CANISTER_ARG (not a Rust canister)"
        exit 0
    fi
else
    # Optimize all WASM files for all Rust canisters
    WASM_FILES=()
    for canister in "${RUST_CANISTERS[@]}"; do
        wasm_path=$(get_canister_wasm_path "$canister")
        if [[ -n "$wasm_path" ]]; then
            WASM_FILES+=("$wasm_path")
        fi
    done
    log_info "Optimizing all WASM files..."
fi

for wasm_file in "${WASM_FILES[@]}"; do
    optimize_wasm "$wasm_file"
done

if [[ -n "$CANISTER_ARG" ]] && is_rust_canister "$CANISTER_ARG"; then
    log_success "WASM file optimized successfully for $CANISTER_ARG!"
elif [[ -z "$CANISTER_ARG" ]]; then
    log_success "All WASM files optimized successfully!"
fi