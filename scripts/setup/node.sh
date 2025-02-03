#!/usr/bin/env bash
set -eo pipefail

# Install Node.js dependencies
npm ci

# Install frontend dependencies
cd src/pt_frontend
npm ci
cd ../..
