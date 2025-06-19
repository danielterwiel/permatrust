#!/usr/bin/env bash

# Permatrust Build Script
#
# This script builds canisters for the Permatrust project.
# It supports building all canisters or a specific canister.
#
# Features:
# - Builds all canisters when no argument is provided
# - Builds a specific canister when a canister name is provided
# - Validates canister names and provides helpful error messages
# - Optimizes WASM files for Rust canisters
# - Creates necessary directories and interfaces
#
# Usage: ./scripts/build.sh [CANISTER_NAME]

# Source common utilities and load environment
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

export DFX_CACHE_PATH=~/.cache/dfx

# Validate dfx.json and populate canister arrays
validate_dfx_config
populate_canister_arrays

# Usage function
show_usage() {
    echo "Usage: $0 [CANISTER_NAME]"
    echo ""
    echo "Build canisters for the Permatrust project."
    echo ""
    echo "Arguments:"
    echo "  CANISTER_NAME    Optional. Build only the specified canister."
    echo "                   If not provided, builds all canisters."
    echo ""
    echo "Available canisters:"
    printf "  %s\n" "${ALL_CANISTERS[@]}"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build all canisters"
    echo "  $0 main_canister     # Build only main_canister"
    echo "  $0 pt_frontend       # Build only pt_frontend"
}

# Parse arguments
CANISTER_ARG="${1:-}"

# Handle help flags
if [[ "$CANISTER_ARG" == "-h" || "$CANISTER_ARG" == "--help" ]]; then
    show_usage
    exit 0
fi

# Validate canister argument if provided
if [[ -n "$CANISTER_ARG" ]]; then
    if ! canister_exists "$CANISTER_ARG"; then
        log_error "Invalid canister: $CANISTER_ARG"
        echo ""
        show_usage
        exit 1
    fi
    log_info "Building single canister: $CANISTER_ARG"
else
    log_info "Building all canisters..."
fi

./scripts/setup.sh
./scripts/build/create-canisters.sh "$CANISTER_ARG"
./scripts/build/build-canisters.sh "$CANISTER_ARG"

if [[ -n "$CANISTER_ARG" ]]; then
    log_success "Build completed successfully for $CANISTER_ARG!"
else
    log_success "Build completed successfully for all canisters!"
fi
