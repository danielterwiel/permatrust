#!/usr/bin/env bash

# Source common utilities
# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
load_env

log_info "Running all autofix commands..."

# Run Biome format and lint autofix
if pnpm run format:fix; then
  log_success "Biome format:fix completed"
else
  log_error "Biome format:fix failed"
  exit 1
fi

if pnpm run lint:fix; then
  log_success "Biome lint:fix completed"
else
  log_error "Biome lint:fix failed"
  exit 1
fi

if pnpm run eslint:fix; then
  log_success "ESLint eslint:fix completed"
else
  log_error "ESLint eslint:fix failed"
  exit 1
fi

# Add more autofix commands here if needed

log_success "All autofix operations completed!"
