---

### 🇯🇵 日本語版：`README.ja.md`

```markdown
# 🚀 Electronest - 次世代の Electron アプリアーキテクチャテンプレート

**Electronest** は [Electron](https://www.electronjs.org/)、[Vite](https://vitejs.dev/)、[NestJS](https://nestjs.com/) を統合した、構造化・型安全・スケーラブルなデスクトップアプリ構築用テンプレートです。

> ✨ **マイクロサービス的アーキテクチャとデコレータベースの IPC を採用し、Electron メインプロセスの構築を再定義します。**

---

## 🔥 特徴

### 🧠 1. 革新的なマルチウィンドウ構成

- 🪟 `@AutoRegisterWindows()` と `@RegisterWindow(name)` による宣言的ウィンドウ登録
- 🧩 ウィンドウごとのモジュール化管理
- 🌉 ウィンドウ間通信対応、識別子による精密ルーティング

### 🔌 2. NestJS スタイルの IPC 封装

- ⚙️ `@IPCHandle('channel')` による簡潔な通信定義
- 🧾 型安全な API、補完機能付き
- 🧬 `@AutoRegisterIPC()` による自動登録・DI 対応

### 🧱 3. メインプロセスでの NestJS 統合

- `@Module()` / `@Injectable()` によるサービス構築
- モジュールごとの分離でスケーラブルな構成

### ⚙️ 4. 本番対応の構成

- TypeScript・エイリアス付き
- セキュアな Preload 設定・Context Isolation
- `electron-builder` によるクロスプラットフォームビルド

---

## 🧪 適用ケース

- 大規模マルチウィンドウ Electron アプリ
- 高度な IPC が必要なツールアプリ
- NestJS を活用した構造的開発

---

## 📦 開発手順

```bash
git clone https://github.com/X29w/electronest.git
cd electronest
pnpm install
pnpm dev      # 開発用起動
pnpm build    # パッケージング
```
