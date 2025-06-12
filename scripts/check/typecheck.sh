#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# Function to run check with error handling
run_check() {
    local check_name="$1"
    shift

    log_info "Running $check_name..."
    if "$@"; then
        log_success "$check_name passed"
    else
        log_error "$check_name failed"
        exit 1
    fi
}

# TypeScript typecheck
run_check "TypeScript typecheck" pnpm run --filter pt_frontend typecheck

log_success "All typecheck operations completed!"
