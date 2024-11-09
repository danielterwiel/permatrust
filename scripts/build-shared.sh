#!/bin/bash

# Function to determine the correct didc binary
get_didc_binary() {
    local platform=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)
    local didc_bin=""

    if [ "$platform" = "darwin" ]; then
        didc_bin="didc-macos"
    elif [ "$platform" = "linux" ]; then
        if [ "$arch" = "x86_64" ]; then
            didc_bin="didc-linux64"
        elif [ "$arch" = "armv7l" ]; then
            didc_bin="didc-arm32"
        else
            echo "Unsupported Linux architecture: $arch"
            exit 1
        fi
    else
        echo "Unsupported platform: $platform"
        exit 1
    fi

    echo "./scripts/$didc_bin"
}

# Function to run commands on given source file path and build directory
run_commands() {
    local src_file_path=$1
    local build_dir=$2
    local didc_binary=$(get_didc_binary)

    # Check if the binary exists and is executable
    if [ ! -f "$didc_binary" ]; then
        echo "Error: $didc_binary not found"
        exit 1
    fi

    chmod +x "$didc_binary"

    # Define the base name for the generated files
    local base_name_dirty=$(basename "$src_file_path" .did)
    # Replace all hyphens with underscores
    local base_name=${base_name_dirty//-/_}

    # Define the paths for the generated files
    local generated_rust_file="$build_dir/${base_name}_generated.rs"

    # Run the commands for Rust
    rm -rf "$generated_rust_file"
    touch "$generated_rust_file"
    "$didc_binary" bind "$src_file_path" -t rs | tee -a "$generated_rust_file"
}

# Array of source file paths
source_files=(
    "src/pt_backend/pt_backend.did"
    # "candid/nns-ledger.did"
)

# Build directory
build_dir="./src/shared/src"

# Loop through the source files and run the commands
for src_file in "${source_files[@]}"; do
    run_commands "$src_file" "$build_dir"
done

./scripts/build-traits.sh
