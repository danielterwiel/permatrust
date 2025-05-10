#!/usr/bin/env bash
set -eo pipefail

export DFX_CACHE_PATH=~/.cache/dfx

./scripts/setup.sh
./scripts/build/create-canisters.sh
./scripts/build/build-canisters.sh
./scripts/generate.sh
