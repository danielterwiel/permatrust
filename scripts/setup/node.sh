#!/usr/bin/env bash
set -eo pipefail

# Ensure corepack is enabled to enforce the correct npm version
corepack enable

npm install -g nvm # Install nvm globally

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash completion

# Read Node.js version from .nvmrc
if [ -f ".nvmrc" ]; then
  REQUIRED_VERSION=$(cat .nvmrc)
  echo "Using Node.js version from .nvmrc: $REQUIRED_VERSION"
else
  echo "Error: .nvmrc file not found.  Please create one with the desired Node.js version."
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)

if [[ "$NODE_VERSION" != "$REQUIRED_VERSION" ]]; then
  echo "Incorrect Node.js version.  Required: $REQUIRED_VERSION, Found: $NODE_VERSION"
  echo "Attempting to use nvm to install and use the correct version."
  nvm install "$REQUIRED_VERSION"
  nvm use "$REQUIRED_VERSION"
  NODE_VERSION=$(node -v) # Update NODE_VERSION after nvm use
  if [[ "$NODE_VERSION" != "$REQUIRED_VERSION" ]]; then
    echo "Error: Failed to switch to the correct Node.js version using nvm."
    exit 1
  fi
fi

# Install Node.js dependencies
npm ci

# Install frontend dependencies
cd src/pt_frontend
npm ci
cd ../..
