#!/usr/bin/env bash
set -eo pipefail

# CI-specific configuration
if [ "$CI" = "true" ]; then
  # Source environment for current shell
  source "$HOME/.local/share/dfx/env"
else
  # Local development install
  if ! command -v dfx &>/dev/null; then
    DFX_VERSION="0.26.0" # Match CI version
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
  fi
fi

# Verify installation
if ! command -v dfx &>/dev/null; then
  echo "❌ Critical Error: dfx not found in PATH after installation attempt"
  exit 1
fi

# Start dfx if not running
if ! pgrep -x "dfx" >/dev/null; then
  dfx start --background
  sleep 5 # Increased wait time for CI stability
fi
