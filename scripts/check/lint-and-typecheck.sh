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

    log_info "Running Biome format check..."
    run_check "Biome format check" pnpm run format:check
    run_check "Biome lint check" pnpm run lint:check
else
    log_info "Running Biome auto-fixes..."
    run_check "Biome format and fix" pnpm run format:fix
    run_check "Biome lint and fix" pnpm run lint:fix
fi

# Always run these checks
run_check "cargo clippy" cargo clippy -- -D warnings
run_check "TypeScript typecheck" pnpm run --filter pt_frontend typecheck
run_check "ESLint" pnpm run --filter pt_frontend eslint:check

log_success "All lint and typecheck operations completed!"
