#!/usr/bin/env bash
set -eo pipefail

dfx deploy internet_identity --with-cycles 1000000000000
dfx deploy tenant_canister --with-cycles 1000000000000 --argument '(record { company_name = "hoax" })'
dfx deploy main_canister --with-cycles 1000000000000
dfx deploy pt_frontend --with-cycles 1000000000000
