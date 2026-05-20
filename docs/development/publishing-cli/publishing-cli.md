# @x-industry/elevolution-cli — Documentation

Complete documentation for the `@x-industry/elevolution-cli` scaffolding and code generation tool.

**Version:** 0.2.0  
**License:** MIT  
**Install:** `npm install -g @x-industry/elevolution-cli` or use via `npx @x-industry/elevolution-cli`

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Commands](#commands)
  - [create](#elevolution-create-name)
  - [add window](#elevolution-add-window-name)
  - [add plugin](#elevolution-add-plugin-name)
  - [add ipc](#elevolution-add-ipc-name)
  - [gen:ipc](#elevolution-genipc)
- [Template System](#template-system)
- [`create` Internals](#create-internals)
- [Generated File Details](#generated-file-details)
- [Configuration & Flags](#configuration--flags)
- [Extending the CLI](#extending-the-cli)

---

## Overview

`@x-industry/elevolution-cli` is a code generation tool that:

1. **Scaffolds complete Electron projects** with the Elevolution architecture
2. **Generates windows** (main process factory + renderer page + HTML entry)
3. **Generates plugins** with correct structure and boilerplate
4. **Generates IPC modules** with handler and listener definitions
5. **Auto-generates renderer IPC types** based on main process handler definitions

The CLI eliminates repetitive setup work and enforces consistent project structure.

---

## Installation

```bash
# Use directly via npx (recommended)
npx @x-industry/elevolution-cli create my-app

# Or install globally
npm install -g @x-industry/elevolution-cli
elevolution create my-app

# Or install as a dev dependency
pnpm add -D @x-industry/elevolution-cli
```

---

## Commands

### `elevolution create <name>`

Scaffold a complete, runnable Electron project.

```bash
elevolution create my-app
elevolution create my-app --local
```

**Arguments:**
- `<name>` — Project directory name (also used as package name)

**Flags:**
- `--local` — Link `@x-industry/elevolution-core` to the local monorepo path instead of the npm version. Used for development.

**Generated structure:**

```
my-app/
├── main-process/
│   ├── main.ts
│   ├── constant/index.ts
│   ├── ipc/
│   │   ├── index.ts
│   │   ├── store.ts
│   │   ├── senders.ts
│   │   └── window.ts
│   ├── plugins/
│   │   ├── devtools/index.ts
│   │   └── example-plugin/index.ts
│   ├── windows/
│   │   ├── index.ts
│   │   ├── main.ts
│   │   ├── child-a.ts
│   │   └── devtools.ts
│   ├── electron-store/index.ts
│   ├── global-short-cut/index.ts
│   └── utils/renderer-path.ts
├── renderer-process/
│   ├── shared/
│   │   ├── services/
│   │   │   ├── ipc.ts
│   │   │   └── ipc.generated.ts
│   │   └── styles/index.css
│   └── windows/
│       ├── main/
│       ├── child-a/
│       └── devtools/
├── preload/index.ts
├── types/
│   └── config/
│       ├── electron-store.d.ts
│       └── global.d.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── biome.json
├── electron-builder.json5
└── .npmrc
```

**Output:**

```
  ⚡ Creating project: my-app

  ✓ Scaffolded 28 files into ./my-app

  Next steps:

    cd my-app
    pnpm install
    pnpm dev
```

**Generated `package.json`:**
- `name` set to the project name
- `version` starts at `0.1.0`
- Only includes `dev` and `build` scripts
- `@x-industry/elevolution-core` added as dependency (`^0.2.0` or local link)

---

### `elevolution add window <name>`

Generate a new window with main process factory and renderer page.

```bash
elevolution add window settings
elevolution add window file-browser
```

**Arguments:**
- `<name>` — Window name in kebab-case

**Generated files:**

1. **`main-process/windows/<name>.ts`** — Window factory function
2. **`renderer-process/windows/<name>/App.tsx`** — React component
3. **`renderer-process/windows/<name>/main.tsx`** — React entry
4. **`renderer-process/windows/<name>/index.html`** — HTML entry

**Next steps (printed after generation):**
1. Import and add to `main-process/windows/index.ts`
2. Add to `vite.config.ts` `rollupOptions.input`

---

### `elevolution add plugin <name>`

Generate a plugin scaffold with IPC handlers, listeners, and correct structure.

```bash
elevolution add plugin file-manager
elevolution add plugin auth
```

**Arguments:**
- `<name>` — Plugin name in kebab-case

**Generated file:** `main-process/plugins/<name>/index.ts`

**Next steps (printed after generation):**
1. Import and install in `main-process/main.ts`
2. Run `pnpm gen:ipc` to update renderer types

---

### `elevolution add ipc <name>`

Generate an IPC module with handler and listener definitions.

```bash
elevolution add ipc user
elevolution add ipc notification
```

**Arguments:**
- `<name>` — Module name in kebab-case

**Generated file:** `main-process/ipc/<name>.ts`

**Next steps (printed after generation):**
1. Register in `main-process/ipc/index.ts`
2. Run `pnpm gen:ipc` to update renderer types

---

### `elevolution gen:ipc`

Auto-generate renderer IPC type definitions from main process handler implementations.

```bash
elevolution gen:ipc
```

**How it works:**
1. Scans all files in `main-process/` for `defineHandlers` and `defineListeners` calls
2. Extracts channel names, argument types, and return types
3. Generates `renderer-process/shared/services/ipc.generated.ts` with:
   - Type-safe `ipcInvoke` overloads (for handlers)
   - Type-safe `ipcSend` overloads (for listeners)
   - Channel name union types

---

## Template System

The CLI's `create` command copies files from the example app in the monorepo (`apps/electron-app/`).

### Template File List

The `packages/cli/template-files.ts` file exports a `TEMPLATE_FILES` array containing all relative paths to copy.

### Updating Templates

When you add files to the example app that should be included in scaffolded projects:

1. Add the file to `apps/electron-app/`
2. Add the relative path to `TEMPLATE_FILES` in `packages/cli/template-files.ts`
3. Test with `elevolution create test-project --local`

### Template Transformations

During `create`, the CLI applies the following transformations to `package.json`:
- Sets `name` to the project name
- Sets `version` to `0.1.0`
- Removes the `bin` field
- Keeps only `dev` and `build` scripts
- Sets `@x-industry/elevolution-core` dependency to `^0.2.0` (or local link with `--local`)

All other files are copied as-is.

---

## `create` Internals

```
┌─────────────────────────────────────────────────────┐
│  elevolution create my-app                        │
├─────────────────────────────────────────────────────┤
│  1. Resolve target directory (cwd + name)           │
│  2. Check directory doesn't exist                   │
│  3. Resolve template root (apps/electron-app/)      │
│  4. Iterate TEMPLATE_FILES array                    │
│  5. For each file:                                  │
│     - Read from template root                       │
│     - Apply transformations (package.json only)     │
│     - Write to target directory                     │
│  6. Print success message and next steps            │
└─────────────────────────────────────────────────────┘
```

**Key implementation details:**

- Uses `node:fs` directly (no external dependencies for file operations)
- Uses `mkdirSync({ recursive: true })` for directory creation
- Template root resolves relative to CLI's `__dirname` (`../../apps/electron-app`)
- `--local` flag creates a `link:` protocol dependency pointing to the monorepo's core package

---

## Generated File Details

### Window Generator Naming

| Input | Factory Name | Component Name |
|---|---|---|
| `settings` | `createSettingsWindow` | `Settings` |
| `file-browser` | `createFileBrowserWindow` | `FileBrowser` |
| `child-a` | `createChildAWindow` | `ChildA` |

Transformation rules:
- Factory: `create` + PascalCase(name) + `Window`
- Component: PascalCase(name)

### Plugin Generator Naming

| Input | Variable Name |
|---|---|
| `file-manager` | `fileManagerPlugin` |
| `auth` | `authPlugin` |
| `devtools` | `devtoolsPlugin` |

Transformation rule: camelCase(name) + `Plugin`

### IPC Generator Naming

| Input | Handlers Variable | Listeners Variable |
|---|---|---|
| `user` | `userHandlers` | `userListeners` |
| `file-system` | `fileSystemHandlers` | `fileSystemListeners` |

Transformation rule: camelCase(name) + `Handlers` / `Listeners`

---

## Configuration & Flags

### Global Flags

| Flag | Command | Description |
|---|---|---|
| `--local` | `create` | Link core to local monorepo path |
| `--help`, `-h` | any | Show help information |

### Environment Requirements

The CLI uses `tsx` to execute TypeScript directly. Requires:
- Node.js ≥ 20
- `tsx` (bundled as dependency)
- `typescript` (bundled as dependency)

---

## Extending the CLI

### Adding a New Command

1. Add a handler function in `packages/cli/index.ts`:

```ts
function generateMyThing(name: string) {
  console.log(`\n  ⚡ Adding my-thing: ${name}\n`);
  // Generate files...
}
```

2. Add to the switch statement:

```ts
case "my-thing":
  if (!subCommand) {
    console.error("Usage: elevolution my-thing <name>");
    process.exit(1);
  }
  generateMyThing(subCommand);
  break;
```

3. Update `printHelp()`:

```ts
console.log(`    ${c.cyan}elevolution my-thing${c.reset} <name>    Add a my-thing`);
```

### File Writing Utilities

The CLI provides the following internal utilities:

```ts
// Write a file, creating directories as needed
write(path: string, content: string): void

// Convert to PascalCase: "file-browser" → "FileBrowser"
toPascalCase(str: string): string

// Convert to camelCase: "file-browser" → "fileBrowser"
toCamelCase(str: string): string

// Ensure directory exists
ensureDir(dir: string): void
```

---

## Publishing

### Pre-Publish Checklist

- [ ] `template-files.ts` includes all files from the example app
- [ ] All generators produce valid, runnable code
- [ ] `gen:ipc` correctly parses handler definitions
- [ ] `create --local` generates a runnable project
- [ ] `create` (without --local) references the correct npm version
- [ ] Version is bumped in `package.json`

### Publish Command

```bash
cd packages/cli
npm publish --access public
```

### Package Contents

The published package includes (per `"files"` in package.json):
- `bin.mjs` — Entry file (shebang + tsx loader)
- `index.ts` — CLI logic
- `generate-ipc-types.ts` — Type generation
- `template-files.ts` — Template file list

Note: Actual template files are not included in the npm package. The `create` command reads from the monorepo's `apps/electron-app/` directory. For published versions, template content is embedded in `template-files.ts` or fetched from the registry.