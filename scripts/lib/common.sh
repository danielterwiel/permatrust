#!/usr/bin/env bash
# Common utilities for Permatrust scripts

# Exit on error, undefined variables, and pipe failures
set -euo pipefail

# Source canister utilities
# shellcheck source=canisters.sh
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
source "$script_dir/canisters.sh"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $*${NC}" >&2
}

log_success() {
    echo -e "${GREEN}✅ $*${NC}" >&2
}

log_warn() {
    echo -e "${YELLOW}⚠️  $*${NC}" >&2
}

log_error() {
    echo -e "${RED}❌ $*${NC}" >&2
}

# Error handling
handle_error() {
    local exit_code=$?
    local line_no=$1
    log_error "Script failed at line $line_no with exit code $exit_code"
    exit $exit_code
}

# Set up error trapping
trap 'handle_error $LINENO' ERR

# Load environment variables from .env file
load_env() {
    local env_file="${1:-.env}"

    if [[ -f "$env_file" ]]; then
        log_info "Loading environment from $env_file"
        set -o allexport
        # shellcheck source=/dev/null
        source "$env_file"
        set +o allexport
    else
        log_warn "$env_file file not found. Proceeding with potentially incomplete configuration."
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" &>/dev/null
}

# Check if process is running
process_running() {
    pgrep -x "$1" >/dev/null
}



# WASM file paths
get_wasm_path() {
    local canister_name="$1"
    echo "target/wasm32-unknown-unknown/release/${canister_name}.wasm"
}

# Common WASM paths
readonly MAIN_WASM="$(get_wasm_path main_canister)"
readonly TENANT_WASM="$(get_wasm_path tenant_canister)"
readonly UPGRADE_WASM="$(get_wasm_path upgrade_canister)"

# Node.js version management
check_node_version() {
    local nvmrc_file="${1:-.nvmrc}"

    if [[ ! -f "$nvmrc_file" ]]; then
        log_error "$nvmrc_file file not found. Please create one with the desired Node.js version."
        exit 1
    fi

    local required_version
    required_version=$(cat "$nvmrc_file")
    local current_version
    current_version=$(node -v)

    log_info "Required Node.js version: $required_version"
    log_info "Current Node.js version: $current_version"

    if [[ "$current_version" != "$required_version" ]]; then
        log_warn "Node.js version mismatch. Attempting to switch using nvm..."

        # Load nvm if available
        if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
            # shellcheck source=/dev/null
            source "$HOME/.nvm/nvm.sh"
        fi

        if command_exists nvm; then
            nvm install "$required_version"
            nvm use "$required_version"
            current_version=$(node -v)

            if [[ "$current_version" != "$required_version" ]]; then
                log_error "Failed to switch to the correct Node.js version using nvm."
                exit 1
            fi
        else
            log_error "nvm not found. Please install nvm or manually switch to Node.js $required_version"
            exit 1
        fi
    fi

    log_success "Node.js version check passed: $current_version"
}

# DFX management
start_dfx_if_needed() {
    if ! process_running "dfx"; then
        log_info "Starting dfx in background..."
        dfx start --background
        sleep 5
    else
        log_info "dfx is already running"
    fi
}

stop_dfx_if_running() {
    if process_running "dfx"; then
        log_info "Stopping dfx..."
        dfx stop
    fi
}

# Canister management
create_canister_with_retry() {
    local canister_name="$1"
    local max_attempts=4

    log_info "Creating canister: $canister_name"

    for attempt in $(seq 1 $max_attempts); do
        if dfx canister create "$canister_name" 2>/dev/null; then
            log_success "Created canister: $canister_name"
            return 0
        else
            log_warn "Attempt $attempt/$max_attempts failed for $canister_name, retrying in 5s..."
            sleep 5
        fi
    done

    log_error "Failed to create canister $canister_name after $max_attempts attempts"
    return 1
}



# Directory creation with error handling
ensure_directory() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        log_info "Creating directory: $dir"
        mkdir -p "$dir"
    fi
}

# Export environment variables for dfx commands
export_dfx_env() {
    # Set default values for variables that might not be in .env
    export LOCAL_IDENTITY="${LOCAL_IDENTITY:-4utfr-vvzwz-h62h4-xxl23-jvlck-dxw5q-je4tf-t6nr4-nk7ry-rywf6-bae}"
    export APP_ENV="${APP_ENV:-development}"
    export DEBUG="${DEBUG:-false}"

    # Export all DFX-related variables
    export DFX_VERSION
    export DFX_NETWORK
    export CANISTER_ID_MAIN_CANISTER
    export CANISTER_ID_PT_FRONTEND
    export CANISTER_ID_TENANT_CANISTER
    export CANISTER_ID_UPGRADE_CANISTER
    export CANISTER_ID_INTERNET_IDENTITY
}

# Run dfx command with environment variables
run_dfx_with_env() {
    export_dfx_env
    "$@"
}
