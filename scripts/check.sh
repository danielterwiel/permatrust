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
    npm run lint:eslint --prefix src/pt_frontend || handle_error "eslint auto-fix"
    npm run format:write --prefix src/pt_frontend || handle_error "biome format"
fi

# Check if fixes resolved all issues
echo "Running linters in check mode..."
cargo clippy -- -D warnings || handle_error "cargo clippy"
npm run typecheck --prefix src/pt_frontend || handle_error "typescript"
npm run lint:biome --prefix src/pt_frontend || handle_error "biome lint"
npm run lint:eslint --prefix src/pt_frontend --no-fix || handle_error "eslint"
