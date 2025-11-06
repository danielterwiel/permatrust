# Permatrust

## Getting started

### Local Deployment

```sh
chmod +x scripts/**/*.sh
pnpm run deploy
pnpm start
```

## Requirements

- brew
- Rust
- pnpm
- dfx
- candid-extractor

## Icons

We're using `@sly-cli/cly` for adding icons and `svg-icons-cli` to build the SVG's
into a sprite. As of date Sly hangs after an add. But you can just ctrl+c the
session as it does add the file.

```sh
pnpm icons:add # ctrl+c to close
pnpm build:icons
```
