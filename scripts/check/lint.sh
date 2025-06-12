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

    log_info "Running Biome and Oxlint checks..."
    run_check "Biome format check" pnpm run format:check
    run_check "Biome lint check" pnpm run lint:check
    run_check "Oxlint check" pnpm run oxlint:check
else
    log_info "Running Biome and Oxlint auto-fixes..."
    run_check "Biome format" pnpm run format
    run_check "Biome lint" pnpm run lint
    run_check "Oxlint" pnpm run oxlint
fi

# Always run these linting checks
run_check "cargo clippy" cargo clippy -- -D warnings

log_success "All lint operations completed!"
