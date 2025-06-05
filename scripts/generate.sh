#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Generating Candid declarations..."

./scripts/generate/generate.sh

log_success "Generation completed successfully!"
