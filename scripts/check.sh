#!/usr/bin/env bash
set -eo pipefail

./scripts/check/check-node-version.sh
./scripts/check/check.sh
