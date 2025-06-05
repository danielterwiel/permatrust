#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# Validate dfx.json and populate canister arrays
validate_dfx_config
populate_canister_arrays

readonly CYCLES="1000000000000"

# Define deployment order (based on dependencies and original working order)
# This order ensures dependencies are deployed before dependents:
#
# 1. internet_identity: External auth service, no dependencies
# 2. main_canister: Core backend service, may reference internet_identity
# 3. upgrade_canister: Upgrade management service, works with main_canister  
# 4. pt_frontend: Frontend assets, depends on all backend services
#
# Note: This order was determined from the original working deployment
# and ensures proper dependency resolution.
readonly DEPLOY_CANISTERS=(
    "internet_identity"   
    "main_canister"       
    "upgrade_canister"    
    "pt_frontend"         
)

# Note: tenant_canister is excluded as it's handled separately with special initialization

# Validate that all deployment canisters exist in dfx.json
for canister in "${DEPLOY_CANISTERS[@]}"; do
    if ! canister_exists "$canister"; then
        log_error "Canister '$canister' not found in dfx.json"
        exit 1
    fi
done

# Deploy canisters in order
for canister in "${DEPLOY_CANISTERS[@]}"; do
    log_info "Deploying $canister..."
    dfx deploy "$canister" --with-cycles "$CYCLES"
    log_success "Deployed $canister"
done

# Get the main canister ID for reference
main_canister_id=$(dfx canister id main_canister)
log_info "Main canister ID: $main_canister_id"

# Note: tenant_canister deployment is commented out
# Uncomment and modify as needed:
# dfx deploy tenant_canister --with-cycles "$CYCLES" --argument \
#   "(record { \"principal\" = principal \"aaaaa-aa\"; user = record { first_name = \"Pjetro\"; last_name = \"Raksis\" }; organization = record { name = \"hoax\" }; project = record { name = \"Project\" }; main_canister_id = principal \"$main_canister_id\" })"

log_success "All canisters deployed successfully!"
