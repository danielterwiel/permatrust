# PermatrustDev Commands & Style Guide

## Build/Test/Lint Commands
- Build: `npm run build` (all) or `npm run build --prefix src/pt_frontend` (frontend only)
- Test: `npm run test` or `npm run test --prefix src/pt_frontend -- [test-file]` (specific test)
- Lint: `npm run lint --prefix src/pt_frontend` (combines ESLint & Biome)
- Typecheck: `npm run typecheck --prefix src/pt_frontend`
- Format: `npm run format:write --prefix src/pt_frontend` (Biome)

## Style Guidelines
- **TypeScript**: Strict mode, verbatim module syntax
- **Formatting**: Biome for JS/TS, Cargo fmt for Rust
- **Imports**: Use path aliases (`@/*` for src/, `~/icon-name` for icons)
- **Components**: React 19, functional components with TypeScript
- **State Management**: XState for complex flows, React Query for API data
- **Error Handling**: Use Result/Option patterns from API
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **CSS**: TailwindCSS with class-variance-authority for variants

## Tech Stack
- React 19 + TypeScript + Vite
- @tanstack/react-query for data fetching
- @tanstack/react-router for routing
- XState for state machines
- Zod for validation
- Rust + DFX for backend