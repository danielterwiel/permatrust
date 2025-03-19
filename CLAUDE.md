# Permatrust Commands & Style Guide

## Build/Test/Lint Commands

- Build: `pnpm run build`
- Start dev server: `pnpm run start`
- Lint: `pnpm run lint`
- Lint fix: `pnpm run lint:fix`
- Typecheck: `pnpm run typecheck`
- Format: `pnpm run format`
- Build icons: `pnpm run build:icons`
- Add icons: `pnpm run add:icons`

## Style Guidelines

- **TypeScript**: Strict mode, verbatim module syntax with path aliases. Never
  use `any` or `unknown` types. Neither use @ts-ignore.
- **Formatting**: Biome for JS/TS, 2-space indent, 80-char line length
- **Imports**: Use path aliases (`@/*` for src/, `~/icon-name` for icons)
- **Import Order**: builtin → external → internal → parent → sibling
- **Components**: React 19 functional components with TypeScript
- **State Management**: XState for complex flows (camelCase states), React Query for API data
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
