#!/bin/bash

add_traits() {
    local file="$1"
    shift
    local targets_and_customs=("$@")

    for pair in "${targets_and_customs[@]}"; do
        IFS=':' read -r target custom <<< "$pair"
        perl -i -pe '
            if ($_ =~ /'"$target"'/) {
                if ($prev =~ /#\[derive\(([^)]+)\)/) {
                    my $traits = $1;
                    my @new_traits = split(/,\s*/, "'"$custom"'");
                    foreach my $trait (@new_traits) {
                        $traits .= ", $trait" unless $traits =~ /\b$trait\b/;
                    }
                    $prev =~ s/#\[derive\([^)]+\)]/#[derive($traits)]/;
                }
                $_ = $prev . $_;
            }
            $prev = $_;
        ' "$file"
    done

    # Remove duplicate derive attributes
    perl -i -0777 -pe '
        s/#\[derive\(CandidType, Deserialize\)]\n#\[derive\(CandidType, Deserialize/#[derive(CandidType, Deserialize/g;
    ' "$file"
}

# Usage example
file_path="./src/shared/src/pt_backend_generated.rs"

# match and replacement separated by a ":"
targets_and_customs=(
    "pub enum AppError {:Debug"
    "struct Project {:Clone, Debug"
    "struct Document {:Clone, Debug"
    "struct Revision {:Clone, Debug"
)

add_traits "$file_path" "${targets_and_customs[@]}"
