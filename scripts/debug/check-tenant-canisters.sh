#!/usr/bin/env bash

# Debug script to check tenant canister health
# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

log_info "Checking tenant canister health..."

# Get all tenant canister IDs from main canister
log_info "Fetching tenant canister IDs from main canister..."
tenant_ids=$(dfx canister call main_canister get_all_tenant_canister_ids --output json | jq -r '.Ok[]? // empty' 2>/dev/null || echo "")

if [[ -z "$tenant_ids" ]]; then
    log_info "No tenant canisters found"
    exit 0
fi

log_info "Found tenant canisters:"
echo "$tenant_ids"

# Check each tenant canister status
for canister_id in $tenant_ids; do
    log_info "Checking canister: $canister_id"
    
    status=$(dfx canister status "$canister_id" 2>/dev/null)
    module_hash=$(echo "$status" | grep "Module hash:" | cut -d: -f2 | tr -d ' ')
    
    if [[ "$module_hash" == "None" ]]; then
        log_error "⚠️  Canister $canister_id has no WASM module installed!"
        echo "  Status: $status"
        echo "  Action needed: Delete this canister and let it be recreated properly"
        echo "  Command: dfx canister stop $canister_id && dfx canister delete $canister_id --yes"
    else
        log_success "✅ Canister $canister_id is healthy (Module hash: $module_hash)"
    fi
done

log_success "Tenant canister health check completed!"