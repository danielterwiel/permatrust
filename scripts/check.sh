#!/usr/bin/env bash
set -eo pipefail

# Add CI-specific checks
if [ "$CI" = "true" ]; then
    cargo audit --ignore RUSTSEC-2024-0333
    cargo fmt --check
fi

# Existing parallel checks
cargo clippy -- -D warnings &
npm run typecheck --prefix src/pt_frontend &
npm run lint --prefix src/pt_frontend &
wait
