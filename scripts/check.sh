#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Running checks..."

./scripts/check/check-node-version.sh
./scripts/check/lint-and-typecheck.sh

log_success "All checks completed!"
