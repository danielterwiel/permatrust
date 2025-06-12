# Permatrust Commands & Style Guide

## Build/Test/Lint Commands

- Build: `pnpm run build`
- Deploy: `pnpm run deploy`
- Start dev server: `pnpm run start`
- Generate types: `pnpm run generate`
- Lint (Biome): `pnpm run lint`
- Lint check (Biome): `pnpm run lint:check`
- Lint (Oxlint): `pnpm run oxlint`
- Lint check (Oxlint): `pnpm run oxlint:check`
- Typecheck: `pnpm run typecheck`
- Format (Biome): `pnpm run format`
- Format check (Biome): `pnpm run format:check`
- Build icons: `pnpm run build:icons`
- Add icons: `pnpm run add:icons`

## Style Guidelines

- Type generation: After changing Rust code, run generate to generate types
- **TypeScript**: Strict mode, verbatim module syntax with path aliases. Never
  use `any` or `unknown` types. Neither use @ts-ignore.
- **Formatting**: Biome for JS/TS, run from the root, 2-space indent, 80-char line length
- **Imports**: Use path aliases (`@/*` for src/, `~/icon-name` for icons)
- **Import Order**: builtin → external → internal → parent → sibling
- **Components**: React 19 functional components with TypeScript
- **State Management**: XState for complex flows (camelCase states), React
  Query for API data
- **Error Handling**: Use Result/Option patterns from API
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **CSS**: TailwindCSS with class-variance-authority for variants

## Tech Stack

- React 19 + TypeScript + Vite
- @tanstack/react-query for data fetching
- @tanstack/react-router for routing
- @tanstack/react-form for forms
- XState 5 for state machines
- Zod for validation
- Radix UI components + Shadcn/ui
- Rust + DFX (Internet Computer) for backend
- ic_cdk 0.18.2-alpha
