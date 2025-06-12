#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Running all autofix commands..."

# Run Biome format and lint autofix
if pnpm run format; then
  log_success "Biome format completed"
else
  log_error "Biome format failed"
  exit 1
fi

if pnpm run lint; then
  log_success "Biome lint completed"
else
  log_error "Biome lint failed"
  exit 1
fi

if pnpm run oxlint; then
  log_success "Oxlint completed"
else
  log_error "Oxlint failed"
  exit 1
fi

# Add more autofix commands here if needed

log_success "All autofix operations completed!"
