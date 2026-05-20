# Contributor Guide

This guide covers local development, code conventions, and publishing workflows for the `elevolution` monorepo.

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9.15 (activate via `corepack enable`)
- **Git**

## Repository Structure

```
elevolution/
├── packages/
│   ├── core/          → @x-industry/elevolution-core (runtime framework, published to npm)
│   └── cli/           → @x-industry/elevolution-cli (scaffolding tool, published to npm)
├── apps/
│   └── electron-app/  → Example app (also serves as CLI template source)
├── docs/              → Documentation
├── turbo.json         → Turborepo pipeline config
├── pnpm-workspace.yaml
└── package.json       → Workspace root
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/user/elevolution.git
cd elevolution

# Install dependencies
pnpm install

# Start development (runs the example app with HMR)
pnpm dev
```

The `pnpm dev` command uses Turborepo to start the example Electron app in `apps/electron-app` with Vite HMR enabled.

## Development Workflow

### Developing `@x-industry/elevolution-core`

The core package is located at `packages/core/`. It has no build step — it directly exports TypeScript source (consumed via `"main": "./index.ts"`).

```bash
# The example app imports core directly via workspace protocol
# Any changes to packages/core/ are immediately reflected in the running app
pnpm dev
```

**Module Structure:**

| File | Responsibility |
|---|---|
| `index.ts` | Public exports (barrel file) |
| `ipc.ts` | IPC definitions, registration, middleware, interceptors |
| `window.ts` | Window registry, lifecycle hooks, messaging |
| `plugin.ts` | Plugin definitions, installation, context, commands |
| `event-bus.ts` | EventBus for inter-plugin communication |
| `logger.ts` | Replaceable logger (Proxy-based) |
| `hot-reload.ts` | File watcher for plugin hot-reload in development |

**Adding new features to core:**

1. Create or modify the relevant module file
2. Export new symbols from `index.ts`
3. Add JSDoc comments in 4 languages (zh-CN, zh-TW, en, ja)
4. Test in the example app (`apps/electron-app`)
5. Update documentation

### Developing `@x-industry/elevolution-cli`

The CLI package is located at `packages/cli/`.

```bash
# Test CLI locally
cd packages/cli
node bin.mjs create test-project --local

# Or from workspace root
pnpm --filter @x-industry/elevolution-cli exec node bin.mjs --help
```

**Module Structure:**

| File | Responsibility |
|---|---|
| `bin.mjs` | Entry file (shebang, imports index.ts via tsx) |
| `index.ts` | CLI logic — command routing, generators |
| `template-files.ts` | File list copied by the `create` command |
| `generate-ipc-types.ts` | Type generation logic for `gen:ipc` |

**Adding a new CLI command:**

1. Add a command handler function in `index.ts`
2. Add a case in the `switch (command)` block
3. Update `printHelp()` output
4. If the command generates files, add a generator function following existing patterns
5. Test with `node bin.mjs <your-command>`

### Developing the Example App

The example app in `apps/electron-app/` serves a dual purpose:
- **Development sandbox**: for testing core features
- **Template source**: for the CLI's `create` command

Any structural changes to the example app should be reflected in `packages/cli/template-files.ts`.

## Code Conventions

### Functional Style

This project uses a purely functional style. No classes, no decorators.

```ts
// ✅ Correct
export const myFunction = (arg: string): Result => { ... };

// ❌ Wrong
export class MyService {
  constructor() { ... }
}
```

### Multi-Language Comments

All public-facing code must include JSDoc comments in 4 languages:

```ts
/**
 * @description [zh-CN] 中文简体描述
 * @description [zh-TW] 中文繁體描述
 * @description [en] English description
 * @description [ja] 日本語の説明
 */
export const myFunction = () => { ... };
```

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Functions | camelCase | `defineHandlers`, `registerRoutes` |
| Types/Interfaces | PascalCase | `IpcRoute`, `PluginContext` |
| Constants | UPPER_SNAKE_CASE | `IS_DEV`, `PRELOAD_PATH` |
| Files | kebab-case | `event-bus.ts`, `hot-reload.ts` |
| IPC channels | `namespace:action` | `"user:get"`, `"store:set"` |
| Plugin names | kebab-case | `"file-manager"`, `"devtools"` |

### Export Pattern

Use named exports only. No default exports.

```ts
// ✅ Correct
export const definePlugin = (def: PluginDef): PluginDef => def;

// ❌ Wrong
export default function definePlugin(def: PluginDef) { ... }
```

### Type Exports

Types are exported alongside their implementations:

```ts
export type IpcMiddleware = (...) => any;
export const useIpcMiddleware = (middleware: IpcMiddleware) => { ... };
```

## Linting & Formatting

The project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Lint
pnpm lint

# Format (in the example app)
cd apps/electron-app
npx biome check --write .
```

Biome configuration is located at `apps/electron-app/biome.json`.

## Testing

### Manual Testing

Since this is an Electron framework, most testing is done by running the example app:

```bash
pnpm dev
```

Verify:
- IPC calls work correctly (check DevTools panel)
- Plugins load properly (check console output)
- Windows open/close normally
- Hot-reload triggers on plugin file changes

### Testing the CLI

```bash
# Create a test project
cd /tmp
node /path/to/packages/cli/bin.mjs create test-app --local
cd test-app
pnpm install
pnpm dev
```

## Publishing

### Version Bumping

Both packages should be version-bumped in sync:

```bash
# Update versions for both packages
cd packages/core && npm version patch
cd packages/cli && npm version patch
```

### Publishing to npm

```bash
# Publish core first (cli conceptually depends on it)
cd packages/core
npm publish --access public

# Then publish cli
cd packages/cli
npm publish --access public
```

### Pre-Publish Checklist

- [ ] All newly exported symbols include comments in 4 languages
- [ ] `packages/core/index.ts` exports all new public symbols
- [ ] `packages/cli/template-files.ts` is in sync with the example app
- [ ] Documentation is updated (README + docs/)
- [ ] Version numbers are bumped in both `package.json` files
- [ ] Example app runs successfully via `pnpm dev`
- [ ] `elevolution create test --local` generates a runnable project

## Turborepo Pipeline

`turbo.json` defines the build pipeline:

- `dev` — starts the example app in development mode
- `build` — builds all packages (if applicable)
- `lint` — runs linting across the entire workspace

## Git Workflow

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes following code conventions
3. Test in the example app
4. Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
5. Push and create a Pull Request

## Troubleshooting

### `pnpm dev` reports module not found errors

```bash
# Clean and reinstall
rm -rf node_modules apps/electron-app/node_modules packages/*/node_modules
pnpm install
```

### CLI `create` generates outdated files

Update `packages/cli/template-files.ts` to include newly added files from the example app.

### Hot-reload not triggering

Ensure `IS_DEV` is `true` and plugins are installed with `installPluginHot` (not `installPlugin`).

### IPC types not generated

Run `pnpm gen:ipc` from the project root (or app directory). Ensure all handler files use `defineHandlers` / `defineListeners` from `@x-industry/elevolution-core`.
