#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# Function to upgrade a single canister by ID
upgrade_canister_by_id() {
    local canister_id="$1"
    log_info "Upgrading canister: $canister_id"

    dfx canister install "$canister_id" \
        --wasm ".dfx/local/canisters/tenant_canister/tenant_canister.wasm" \
        --mode upgrade \
        --yes
}

# Function to get tenant canister IDs
get_tenant_canister_ids() {
    dfx canister call main_canister get_all_tenant_canister_ids --output json |
        jq -r '.Ok[]? // empty'
}

log_info "Preparing for tenant canister upgrade..."

./scripts/generate.sh
dfx build

log_info "Getting list of tenant canisters to upgrade..."
canister_ids=$(get_tenant_canister_ids)

if [[ -z "$canister_ids" ]]; then
    log_warn "No tenant canisters found to upgrade"
    exit 0
fi

log_info "Found tenant canisters:"
echo "$canister_ids"

# Upgrade each canister
for canister_id in $canister_ids; do
    upgrade_canister_by_id "$canister_id"
    log_success "Upgraded canister: $canister_id"
done

log_success "All tenant canisters upgraded successfully!"
