# 🚀 Electronest - Next-Gen Electron App Architecture Template

**Electronest** is a cutting-edge Electron development template that integrates [Electron](https://www.electronjs.org/), [Vite](https://vitejs.dev/), and [NestJS](https://nestjs.com/), offering a modular, scalable, and type-safe architecture tailored for modern desktop applications.

> ✨ **Redefining main process architecture with microservice-style structure and decorator-based IPC.**

---

## 🔥 Highlights

### 🧠 1. Innovative Multi-Window System

- 🪟 **Declarative window registration** via `@AutoRegisterWindows()` and `@RegisterWindow(name)`
- 🧩 **Modular window management**: isolated lifecycle and communication
- 🌉 **Cross-window communication support** through unique window identifiers and message routing

### 🔌 2. NestJS-Style IPC System

- ⚙️ **Decorator-based IPC definition** with `@IPCHandle('channel')`
- 🧾 **Type-safe API** between renderer and main process with auto-completion
- 🧬 **DI-enabled IPC modules** using `@AutoRegisterIPC()`, no manual imports required

### 🧱 3. Full NestJS Integration in Main Thread

- 💡 Uses `@Module()`, `@Controller()`, `@Injectable()` in main process
- 🧠 Brings back structure, scalability, and clean architecture to Electron’s core logic

### ⚙️ 4. Production-Ready Configuration

- 🧪 TypeScript + Path aliases
- 🔐 Secure preload scripts + context isolation
- 📦 One-click build via `electron-builder`

---

## 🧪 Ideal For

- Large-scale multi-window desktop apps
- Tools requiring robust IPC architecture
- Teams familiar with NestJS patterns
- Developers looking for a scalable Electron foundation

---

## 📦 Getting Started

```bash
git clone https://github.com/X29w/electronest.git
cd electronest
pnpm install
pnpm dev      # start in development
pnpm build    # package into app
```
