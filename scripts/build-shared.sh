#!/bin/bash

# Function to run commands on given source file path and build directory
run_commands() {
    local src_file_path=$1
    local build_dir=$2

    # Define the base name for the generated files
    local base_name_dirty=$(basename "$src_file_path" .did)
    # Replace all hyphens with underscores
    local base_name=${base_name_dirty//-/_}

    # Define the paths for the generated files
    local generated_rust_file="$build_dir/${base_name}_generated.rs"

    # Run the commands for Rust
    rm -rf "$generated_rust_file"
    touch "$generated_rust_file"
    ./scripts/didc-macos bind "$src_file_path" -t rs | tee -a "$generated_rust_file"
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
