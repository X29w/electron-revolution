---

### 🇹🇼 繁體中文版：`README.zh-TW.md`

```markdown
# 🚀 Electronest - 次世代 Electron 桌面應用程式架構模板

**Electronest** 是一個整合了 [Electron](https://www.electronjs.org/)、[Vite](https://vitejs.dev/)、[NestJS](https://nestjs.com/) 的先進模板，提供模組化、型別安全、結構清晰的桌面開發體驗。

> ✨ **以微服務架構重構 Electron 主程序，透過裝飾器封裝 IPC 通信。**

---

## 🔥 專案亮點

### 🧠 1. 創新式多視窗管理系統

- 🪟 `@AutoRegisterWindows()` + `@RegisterWindow(name)` 聲明式註冊視窗
- 🧩 每個視窗模組具備獨立生命週期與行為定義
- 🌉 支援跨視窗通信，並具唯一標識 ID

### 🔌 2. 類 NestJS 的 IPC 通信封裝

- ⚙️ `@IPCHandle('channel')` 裝飾器自動註冊 IPC
- 🧾 渲染端支援型別提示、返回值補全
- 🧬 主程序中以 `@AutoRegisterIPC()` 自動載入通信控制器

### 🧱 3. 主程序支援 NestJS 模組化

- 🧠 使用 `@Module()`、`@Injectable()` 等進行主程序邏輯架構設計
- 支援依賴注入、生命週期管理、服務分層

### ⚙️ 4. 完整開發環境

- TypeScript + 路徑別名支援
- 安全的 Preload 設定與上下文隔離
- `electron-builder` 一鍵打包跨平台應用程式

---

## 🧪 適用場景

- 多視窗桌面應用
- 涉及大量渲染與主程序通信的應用
- 適合習慣 NestJS 架構的團隊

---

## 📦 快速開始

```bash
git clone https://github.com/X29w/electronest.git
cd electronest
pnpm install
pnpm dev      # 啟動開發
pnpm build    # 建立應用程式
```
