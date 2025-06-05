#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

# Ensure corepack is enabled to enforce the correct pnpm version
log_info "Enabling corepack..."
corepack enable

# Load nvm environment
export NVM_DIR="$HOME/.nvm"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
fi
if [[ -s "$NVM_DIR/bash_completion" ]]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/bash_completion"
fi

# Install nvm if needed
if ! command_exists nvm; then
    log_warn "nvm not found - you may need to install it manually"
    log_warn "Visit: https://github.com/nvm-sh/nvm#installing-and-updating"
fi

# Check and set Node.js version
check_node_version

# Install dependencies with pnpm
log_info "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

log_success "Node.js setup completed successfully!"
