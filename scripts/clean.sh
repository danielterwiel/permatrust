#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Cleaning build artifacts..."

# Stop dfx if running
stop_dfx_if_running

# Clean build artifacts
log_info "Cleaning Rust artifacts..."
cargo clean

log_info "Cleaning DFX artifacts..."
rm -rf .dfx

log_info "Cleaning generated files..."
rm -rf src/declarations
rm -rf src/pt_frontend/dist

log_success "Clean completed successfully!"
