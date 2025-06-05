#!/usr/bin/env bash

# Source common utilities
# shellcheck source=../lib/common.sh
source "$(dirname "$0")/../lib/common.sh"
load_env

readonly CHUNK_SIZE=1048576  # 1MB chunks
readonly WASM_FILE_PATH=".dfx/local/canisters/tenant_canister/tenant_canister.wasm"

# Function to get the next WASM version
get_next_wasm_version() {
    local decoded_json
    decoded_json=$(dfx canister call upgrade_canister get_all_wasm_versions --output json)
    
    local last_version
    last_version=$(echo "$decoded_json" | jq '
        if .Ok then
            .Ok | if length > 0 then max else 0 end
        else
            0
        end
    ')
    
    if [[ -z "$last_version" || "$last_version" == "null" ]]; then
        log_warn "Could not determine last WASM version. Assuming 0."
        last_version=0
    fi
    
    log_info "Highest WASM Version: $last_version"
    echo $((last_version + 1))
}

# Function to upload WASM in chunks
upload_wasm_chunks() {
    local wasm_version="$1"
    local wasm_size total_chunks
    
    # Get file size (cross-platform)
    wasm_size=$(stat -f%z "$WASM_FILE_PATH" 2>/dev/null || stat -c%s "$WASM_FILE_PATH")
    total_chunks=$(( (wasm_size + CHUNK_SIZE - 1) / CHUNK_SIZE ))
    
    log_info "WASM file size: $wasm_size bytes"
    log_info "Uploading in $total_chunks chunks of $CHUNK_SIZE bytes each"
    
    for ((chunk_id=0; chunk_id<total_chunks; chunk_id++)); do
        local offset=$((chunk_id * CHUNK_SIZE))
        
        log_info "Uploading chunk $((chunk_id + 1))/$total_chunks (offset: $offset)"
        
        # Extract chunk data and convert to hex format for Candid blob
        local chunk_hex
        chunk_hex=$(dd if="$WASM_FILE_PATH" bs=$CHUNK_SIZE skip=$chunk_id count=1 2>/dev/null | hexdump -v -e '/1 "\\%02x"')
        
        if [[ -z "$chunk_hex" ]]; then
            log_error "Failed to extract chunk $chunk_id"
            exit 1
        fi
        
        # Create temporary file for this chunk
        local temp_chunk_file
        temp_chunk_file=$(mktemp)
        echo "(record { version = $wasm_version : nat32; chunk = record { chunk_id = $chunk_id : nat32; total_chunks = $total_chunks : nat32; data = blob \"$chunk_hex\" } })" > "$temp_chunk_file"
        
        # Upload chunk with error checking
        if ! dfx canister call upgrade_canister store_wasm_chunk --argument-file "$temp_chunk_file"; then
            log_error "Failed to upload chunk $chunk_id"
            rm "$temp_chunk_file"
            exit 1
        fi
        
        # Clean up
        rm "$temp_chunk_file"
    done
}

# Main execution
log_info "Starting WASM upload to upgrade canister..."

# Check if WASM file exists
if [[ ! -f "$WASM_FILE_PATH" ]]; then
    log_error "WASM file not found at $WASM_FILE_PATH"
    exit 1
fi

# Get next version number
next_wasm_version=$(get_next_wasm_version)
log_info "Attempting to store new WASM version: $next_wasm_version"

# Upload WASM in chunks
upload_wasm_chunks "$next_wasm_version"

# Finish the upload
log_info "Finalizing WASM upload..."
if ! dfx canister call upgrade_canister finish_wasm_upload "($next_wasm_version : nat32)"; then
    log_error "Failed to finalize WASM upload"
    exit 1
fi

log_success "WASM module storage completed successfully for version $next_wasm_version"
