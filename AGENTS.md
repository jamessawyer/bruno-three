# AGENTS.md

## Cursor Cloud specific instructions

This is a **pnpm workspace monorepo** of standalone Three.js + Vite chapter apps (`packages/ch01`–`packages/ch16`). There is no backend, no database, no `.env` files, and no automated tests.

### Key commands

See `README.md` and root `package.json` scripts for full reference. Quick summary:

- **Install deps**: `pnpm install` (enforced by `preinstall` script; do not use npm/yarn)
- **Lint**: `pnpm lint` (oxlint)
- **Format check**: `pnpm fmt:check` / **Format fix**: `pnpm fmt` (oxfmt)
- **Dev server (single chapter)**: `pnpm --filter @play/chXX dev` (Vite on port 5173)
- **Dev server (all chapters)**: `pnpm dev` (runs all in parallel)
- **Build all**: `pnpm build`

### Non-obvious caveats

- pnpm may warn about ignored build scripts for `esbuild`. Run `pnpm rebuild esbuild` after install if Vite fails to start due to a missing esbuild binary.
- Each chapter is an independent Vite app with zero-config (no `vite.config.*`); entry is `index.html`.
- The `pnpm fmt:check` command may report pre-existing formatting differences — these are not regressions.
- The `.cursor/rules/` file suggests Bun, but the project actually uses **pnpm** (lockfile: `pnpm-lock.yaml`, `preinstall` enforces pnpm via `only-allow`). Always use pnpm for dependency management.
- `mise.toml` specifies Node 22 and pnpm 10.29.3. The Cloud VM already has compatible versions pre-installed.
