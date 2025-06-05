#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# CI-specific configuration
if [[ "${CI:-false}" == "true" ]]; then
    log_info "CI environment detected - sourcing dfx environment"
    # shellcheck source=/dev/null
    source "$HOME/.local/share/dfx/env"
else
    # Local development install
    if ! command_exists dfx; then
        log_info "Installing dfx version ${DFX_VERSION:-0.26.0}"
        DFX_VERSION="${DFX_VERSION:-0.26.0}"
        sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    fi
fi

# Verify installation
if ! command_exists dfx; then
    log_error "dfx not found in PATH after installation attempt"
    exit 1
fi

log_success "dfx is available: $(dfx --version)"

# Start dfx if needed
start_dfx_if_needed
