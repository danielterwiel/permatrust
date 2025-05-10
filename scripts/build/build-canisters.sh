#!/usr/bin/env bash
set -eo pipefail

dfx build tenant_canister
dfx build main_canister
dfx generate
dfx build pt_frontend
dfx build internet_identity
