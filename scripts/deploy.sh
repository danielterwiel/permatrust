#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Starting deployment process..."

./scripts/build.sh
./scripts/deploy/deploy.sh

log_success "Deployment completed successfully!"
