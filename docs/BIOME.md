# Biome Setup Documentation

## Overview

This project uses [Biome](https://biomejs.dev/) v1.9.4 for code formatting and linting. Biome is a fast formatter and linter for JavaScript, TypeScript, JSON, and other web technologies.

## Installation

Biome is installed as a dev dependency in the root workspace:
```bash
pnpm add -D @biomejs/biome@latest -w
```

## Configuration

### Root Configuration (`/biome.json`)
- Global configuration with overrides for `src/pt_frontend/`
- Includes VCS integration with Git
- Ignores generated files, dependencies, and build artifacts

### Frontend Configuration (`/src/pt_frontend/biome.json`)
- Extends the root configuration
- Additional TypeScript/React-specific rules
- Enhanced linting rules for modern React development

## Available Scripts

### Root Level
```bash
# Format files
pnpm run format:fix          # Format and write changes
pnpm run format:check        # Check formatting without changes

# Lint files  
pnpm run lint                # Lint files
pnpm run lint:fix            # Lint and fix issues

# Complete check and fix
pnpm run biome:check         # Check formatting + linting
pnpm run biome:fix           # Fix formatting + linting issues
```

### Frontend Level (`src/pt_frontend/`)
```bash
# Format files
pnpm run format:fix          # Format and write changes
pnpm run format:check        # Check formatting without changes

# Lint files
pnpm run lint                # Lint files with Biome
pnpm run lint:fix            # Lint and fix issues with Biome

# Complete operations
pnpm run biome:check         # Check formatting + linting
pnpm run biome:fix           # Fix formatting + linting issues

# ESLint (separate)
pnpm run eslint              # Run ESLint
pnpm run eslint:fix          # Run ESLint with fixes
```

## Git Integration

### Pre-commit Hook
Automatically formats and lints staged files before commit:
- Located at `.git/hooks/pre-commit`
- Only processes TypeScript/JavaScript files in `src/pt_frontend/`
- Re-stages files after formatting
- Prevents commits if linting fails

### Check Scripts
The `scripts/check/lint-and-typecheck.sh` includes Biome:
- **CI mode**: Runs format check and lint check (no auto-fix)
- **Local mode**: Runs auto-fix with `biome check --write`

## GitHub Actions CI

The CI workflow (`.github/workflows/ci.yml`) includes:
- Biome format checking
- Biome lint checking
- ESLint checking (separate)
- TypeScript type checking
- Rust formatting and linting

## Configuration Features

### Formatting
- 2-space indentation
- 80 character line width
- Single quotes for JavaScript
- Double quotes for JSX attributes
- Always semicolons
- ES5 trailing commas

### Linting Rules
- All recommended rules enabled
- Enhanced TypeScript rules:
  - No explicit `any` (warning)
  - No array index keys (warning)
  - Exhaustive dependencies for hooks (warning)
  - No non-null assertions (error)
  - Use optional chains (fixable)

### File Processing
- **Included**: `src/pt_frontend/**/*.{ts,tsx,js,jsx,json,md}`
- **Ignored**: Generated files, node_modules, build artifacts, Git files

## Integration with Other Tools

### ESLint Compatibility
- Uses `eslint-config-biome` for compatibility
- ESLint runs separately for additional React-specific rules
- Both tools complement each other

### TypeScript
- Full TypeScript support
- Import organization
- Type-aware linting rules

## Troubleshooting

### Common Issues

1. **"Biome not found"**: Ensure Biome is installed in root workspace
2. **Pre-commit fails**: Check that files are properly formatted
3. **CI failures**: Run `pnpm run biome:fix` locally first

### Manual Commands

```bash
# Check specific files
npx biome check path/to/file.ts

# Format specific files
npx biome format --write path/to/file.ts

# Lint specific files
npx biome lint path/to/file.ts

# Run on all TypeScript files
npx biome check --write src/pt_frontend/src/**/*.{ts,tsx}
```

## Performance

Biome is extremely fast:
- **Formatted**: 202 files in ~108ms
- **Checked**: 215 files in ~72ms
- Much faster than ESLint + Prettier combination

## Future Improvements

1. Add checksum-based formatting for better caching
2. Integrate with VS Code for real-time formatting
3. Add custom rules for project-specific patterns
4. Consider migrating more ESLint rules to Biome

## Links

- [Biome Documentation](https://biomejs.dev/)
- [Biome CLI Reference](https://biomejs.dev/reference/cli/)
- [Biome Configuration](https://biomejs.dev/reference/configuration/)
