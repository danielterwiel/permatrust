#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Setting up development environment..."

./scripts/setup/dfx.sh
./scripts/setup/rust.sh
./scripts/setup/node.sh

log_success "Setup completed successfully!"
