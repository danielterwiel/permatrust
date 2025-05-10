#!/usr/bin/env bash
set -eo pipefail

./scripts/build.sh
./scripts/deploy/deploy.sh
