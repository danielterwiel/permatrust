#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

export CARGO_HOME="$HOME/.cargo"
export RUSTUP_HOME="$HOME/.rustup"

# Install Rust if not present
if ! command_exists rustup; then
    log_info "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    # shellcheck source=/dev/null
    source "$HOME/.cargo/env"
fi

log_success "Rust is available: $(rustc --version)"

# Add wasm target
log_info "Adding wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown

# Install required tools
readonly TOOLS=("candid-extractor" "cargo-audit" "ic-wasm")

for tool in "${TOOLS[@]}"; do
    if ! command_exists "$tool"; then
        log_info "Installing $tool..."
        cargo install "$tool"
    else
        log_info "$tool is already installed"
    fi
done

log_success "Rust setup completed successfully!"
