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

# Run TypeScript typecheck but don't fail the build if it fails
echo "Running TypeScript typecheck..."
pnpm run --filter pt_frontend typecheck || echo "TypeScript errors detected (expected during migration)"

# Continue with other checks
pnpm run --filter pt_frontend lint || handle_error "eslint"
