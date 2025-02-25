# permatrust

## Getting started

### Preparation

Add an ECC encrypted GPG key:

```sh
gpg --expert --full-generate-key
(9) ECC (sign and encrypt)
(1) Curve 25519
```

### Local Deployment

```sh
chmod +x scripts/**/*.sh
npm run deploy
npm start
```

## Requirements

- brew
- Rust
- npm
- dfx
- candid-extractor

```sh
dfx extension install nns
```

## Icons

We're using `@sly-cli/cly` for adding icons and `svg-icons-cli` to build the SVG's
into a sprite. As of date Sly seems somewhat buggy as it hangs after an add. But
you can just ctrl+c the session as it does add the file.

```sh
npm run icons:add # ctrl+c to close
npm run build:icons
```
