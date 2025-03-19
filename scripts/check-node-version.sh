#!/bin/bash

# Check if Node.js version is 23.7.0
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION != "v23.7.0" ]]; then
  echo "Warning: You're using Node.js $NODE_VERSION, but this project requires v23.7.0"
  echo "If you have nvm installed, run: nvm use 23.7.0"
  echo "If you don't have Node.js 23.7.0 installed, run: nvm install 23.7.0"
  echo ""
  echo "Alternatively, use PNPM with the project configuration:"
  echo "  pnpm <command>   # PNPM will use Node.js 23.7.0 automatically"
  exit 1
fi

echo "Node.js version check passed. Using required version: v23.7.0"
exit 0