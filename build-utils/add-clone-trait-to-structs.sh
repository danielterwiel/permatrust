#!/bin/bash

# Check if a file path is provided
# if [ $# -eq 0 ]; then
#     echo "Usage: $0 <file_path>"
#     exit 1
# fi

file_path="/Users/dani/code/pt/src/shared/src/pt_backend_generated.rs"


# Check if the file exists
if [ ! -f "$file_path" ]; then
    echo "Error: File not found: $file_path"
    exit 1
fi

# Use sed to perform the replacement
sed -i '' -E '
    /^#\[derive\(CandidType,[ ]*Deserialize\)]/,/^pub struct/ {
        /^#\[derive\(CandidType,[ ]*Deserialize\)]/ {
            s/#\[derive\(CandidType,[ ]*Deserialize\)]/#[derive(CandidType, Deserialize, Clone)]/
        }
    }
' "$file_path"

echo "Replacement completed in $file_path"
