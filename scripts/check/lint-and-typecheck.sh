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

# CI-specific checks
if [[ "${CI:-false}" == "true" ]]; then
    run_check "cargo audit" cargo audit --ignore RUSTSEC-2024-0333
    run_check "cargo fmt check" cargo fmt --check
    
    log_info "Running auto-fixes for linters..."
    run_check "format" pnpm run --filter pt_frontend format
fi

# Always run these checks
run_check "cargo clippy" cargo clippy -- -D warnings
run_check "TypeScript typecheck" pnpm run --filter pt_frontend typecheck
run_check "ESLint" pnpm run --filter pt_frontend lint

log_success "All lint and typecheck operations completed!"
