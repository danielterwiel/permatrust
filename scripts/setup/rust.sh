#!/bin/bash
set -e

# Install Rust if not present
if ! command -v rustup &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Add wasm target
rustup target add wasm32-unknown-unknown

# Install candid-extractor: for candid declarations/ generation
cargo install candid-extractor

# Install cargo-audit: for Rust security audits
cargo install cargo-audit
