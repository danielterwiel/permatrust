#!/usr/bin/env bash
# Canister configuration utilities
# 
# This module provides functions to extract canister information from dfx.json
# and categorize them by type. This keeps all canister configuration centralized
# and synchronized with the actual DFX configuration.

# Ensure jq is available
if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is required but not installed" >&2
    exit 1
fi

# Get all canister names from dfx.json
get_all_canisters() {
    jq -r '.canisters | keys[]' dfx.json 2>/dev/null | sort
}

# Get Rust canisters (type: "rust") in dependency order
get_rust_canisters() {
    # Define build dependencies (canister -> dependencies)
    # 
    # IMPORTANT: These dependencies are based on actual code dependencies,
    # not dfx.json configuration. Add entries here when canisters have 
    # compile-time dependencies on other canisters.
    #
    # Known dependencies:
    # - main_canister depends on tenant_canister due to:
    #   include_bytes!("../../../../.dfx/local/canisters/tenant_canister/tenant_canister.wasm")
    #   in src/main_canister/src/management/methods.rs:17
    #
    local -A dependencies=(
        ["tenant_canister"]=""              # No dependencies
        ["upgrade_canister"]=""             # No dependencies  
        ["main_canister"]="tenant_canister" # Depends on tenant_canister WASM
    )
    
    # Get all rust canisters from dfx.json
    local all_rust_canisters
    all_rust_canisters=$(jq -r '.canisters | to_entries[] | select(.value.type == "rust") | .key' dfx.json 2>/dev/null)
    
    # Perform topological sort to resolve dependencies
    local -a result=()
    local -a remaining=()
    
    # Convert to array
    while IFS= read -r canister; do
        remaining+=("$canister")
    done <<< "$all_rust_canisters"
    
    # Simple dependency resolution - build dependencies first
    # Add canisters with no dependencies first
    for canister in "${remaining[@]}"; do
        if [[ -z "${dependencies[$canister]:-}" ]]; then
            result+=("$canister")
        fi
    done
    
    # Add canisters with dependencies (in a simple order for now)
    for canister in "${remaining[@]}"; do
        if [[ -n "${dependencies[$canister]:-}" ]]; then
            result+=("$canister")
        fi
    done
    
    printf '%s\n' "${result[@]}"
}

# Get asset canisters (type: "assets")
get_asset_canisters() {
    jq -r '.canisters | to_entries[] | select(.value.type == "assets") | .key' dfx.json 2>/dev/null | sort
}

# Get custom canisters (type: "custom")
get_custom_canisters() {
    jq -r '.canisters | to_entries[] | select(.value.type == "custom") | .key' dfx.json 2>/dev/null | sort
}

# Get non-Rust canisters (assets + custom)
get_non_rust_canisters() {
    jq -r '.canisters | to_entries[] | select(.value.type != "rust") | .key' dfx.json 2>/dev/null | sort
}

# Check if a canister exists in dfx.json
canister_exists() {
    local canister_name="$1"
    jq -e ".canisters | has(\"$canister_name\")" dfx.json >/dev/null 2>&1
}

# Get canister type
get_canister_type() {
    local canister_name="$1"
    jq -r ".canisters.\"$canister_name\".type // \"unknown\"" dfx.json 2>/dev/null
}

# Check if canister is Rust type
is_rust_canister() {
    local canister_name="$1"
    [[ "$(get_canister_type "$canister_name")" == "rust" ]]
}

# Populate arrays with canister names
# Usage: populate_canister_arrays
# Sets: ALL_CANISTERS, RUST_CANISTERS, NON_RUST_CANISTERS arrays
populate_canister_arrays() {
    # Convert space-separated output to arrays (compatible with bash and zsh)
    IFS=$'\n' read -d '' -r -a ALL_CANISTERS < <(get_all_canisters) || true
    IFS=$'\n' read -d '' -r -a RUST_CANISTERS < <(get_rust_canisters) || true
    IFS=$'\n' read -d '' -r -a NON_RUST_CANISTERS < <(get_non_rust_canisters) || true
    IFS=$'\n' read -d '' -r -a ASSET_CANISTERS < <(get_asset_canisters) || true
    IFS=$'\n' read -d '' -r -a CUSTOM_CANISTERS < <(get_custom_canisters) || true
    
    # Make arrays read-only to prevent accidental modification
    readonly ALL_CANISTERS
    readonly RUST_CANISTERS
    readonly NON_RUST_CANISTERS
    readonly ASSET_CANISTERS
    readonly CUSTOM_CANISTERS
}

# Validate that dfx.json exists and is readable
validate_dfx_config() {
    if [[ ! -f "dfx.json" ]]; then
        echo "Error: dfx.json not found in current directory" >&2
        return 1
    fi
    
    if ! jq -e '.canisters' dfx.json >/dev/null 2>&1; then
        echo "Error: Invalid dfx.json or missing canisters section" >&2
        return 1
    fi
    
    return 0
}

# Display canister information (useful for debugging)
show_canister_info() {
    echo "=== Canister Configuration ==="
    echo "All canisters: $(get_all_canisters | tr '\n' ' ')"
    echo "Rust canisters (dependency order): $(get_rust_canisters | tr '\n' ' ')"
    echo "Asset canisters: $(get_asset_canisters | tr '\n' ' ')"
    echo "Custom canisters: $(get_custom_canisters | tr '\n' ' ')"
    echo ""
    echo "Build order explanation:"
    echo "1. tenant_canister (no dependencies)"
    echo "2. upgrade_canister (no dependencies)" 
    echo "3. main_canister (depends on tenant_canister WASM)"
    echo "=============================="
}