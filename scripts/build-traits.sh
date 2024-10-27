#!/bin/bash

# TODO: one day this should be replaced by ast-grep or some magic rust macro
# that I cannot figure out.

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
    "struct User {:Clone, Debug"
    "struct Edge \(:Clone, Debug" # NOTE the "(" in stead of "{" because Edge is a oneliner
    "struct WorkflowGraph {:Clone, Debug"
    "struct Workflow {:Clone, Debug"
    "struct Organisation {:Clone, Debug"
    "struct Project {:Clone, Debug"
    "struct Document {:Clone, Debug"
    "struct Revision {:Clone, Debug"
    "struct FilterCriteria {:Clone, Debug"
    "struct SortCriteria {:Clone, Debug"
    "pub enum Entity {:Clone, Debug"
    "pub enum SortOrder {:Clone, Debug"
    "pub enum FilterOperator {:Clone, Debug"
    "pub enum FilterField {:Clone, Debug"
    "pub enum UserFilterField {:Clone, Debug"
    "pub enum OrganisationFilterField {:Clone, Debug"
    "pub enum ProjectFilterField {:Clone, Debug"
    "pub enum DocumentFilterField {:Clone, Debug"
    "pub enum RevisionFilterField {:Clone, Debug"
    "pub enum WorkflowFilterField {:Clone, Debug"
)

add_traits "$file_path" "${targets_and_customs[@]}"
