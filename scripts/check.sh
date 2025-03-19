#!/usr/bin/env bash
set -eo pipefail

# Function to handle errors
handle_error() {
    echo "Error: $1 check failed"
    exit 1
}

# Add CI-specific checks
if [ "$CI" = "true" ]; then
    cargo audit --ignore RUSTSEC-2024-0333 || handle_error "cargo audit"
    cargo fmt --check || handle_error "cargo fmt"
fi

# Run auto-fixes for linters
if [ "$CI" = "true" ]; then
    echo "Running auto-fixes for linters..."
    pnpm run --filter pt_frontend format || handle_error "eslint format/fix"
fi

# Check if fixes resolved all issues
echo "Running linters in check mode..."
cargo clippy -- -D warnings || handle_error "cargo clippy"

# Run TypeScript typecheck and fail if it fails
echo "Running TypeScript typecheck..."
pnpm run --filter pt_frontend typecheck || handle_error "TypeScript typecheck"

# Continue with other checks and fail if linting fails
echo "Running ESLint..."
pnpm run --filter pt_frontend lint || handle_error "ESLint"
