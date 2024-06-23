#!/bin/bash

# Function to replace the string
replace_allow() {
    local file=$1

    # Check if the file exists
    if [ ! -f "$file" ]; then
        echo "File not found: $file"
        return 1
    fi

    # Use sed to replace the string with macOS compatibility
    sed -i "" 's/#!\[allow(dead_code, unused_imports)\]/#!\[allow(dead_code, unused_imports, non_snake_case)\]/g' "$file"

    echo "Replacement complete in file: $file"
}

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <full_file_path>"
    exit 1
fi

# Call the function with the provided full file path
replace_allow "$1"
