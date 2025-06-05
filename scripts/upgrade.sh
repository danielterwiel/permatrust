#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Starting upgrade process..."

./scripts/upgrade/upgrade.sh

log_success "Upgrade completed successfully!"
