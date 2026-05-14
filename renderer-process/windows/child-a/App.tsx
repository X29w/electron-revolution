import { ipcSend } from "@renderer-process/shared/services/ipc";
import { FC, useState } from "react";

const pluginExample = `import { definePlugin, defineHandlers } from "../../core";

const handlers = defineHandlers({
  "my-plugin:greet": (_, name: string) => {
    return \`Hello, \${name}!\`;
  },
});

export const myPlugin = definePlugin({
  meta: { name: "my-plugin", version: "1.0.0" },
  setup(ctx) {
    ctx.ipc(handlers.routes);
    ctx.command("my-plugin:run", () => {
      ctx.log.info("running");
    });
  },
});`;

const ipcExample = `// main-process (define)
export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "test" }),
});

// renderer-process (call)
const user = await ipcInvoke("user:get", "123");
// ✅ typed as { id: string; name: string }`;

const tabs = [
  { id: "plugin", label: "Plugin", code: pluginExample },
  { id: "ipc", label: "IPC", code: ipcExample },
] as const;

const App: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("plugin");
  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="h-full bg-[#0a0a0f] text-white overflow-auto">
      {/* Header */}
      <header className="drag-region flex items-center justify-between px-5 h-10 border-b border-white/5">
        <span className="text-xs font-medium text-white/50 tracking-wide">Playground</span>
        <div className="no-drag-region">
          <button
            onClick={() => ipcSend("window:close", "child-a")}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/80 cursor-pointer transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" className="text-white/50" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Code Examples</h1>
          <p className="text-sm text-white/40">
            See how Revolution's core APIs work in practice.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-white/[0.03] rounded-lg w-fit border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all
                ${activeTab === tab.id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/40 hover:text-white/60"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="relative rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          {/* Dot decoration */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="ml-3 text-[10px] text-white/20 font-mono">
              {activeTab === "plugin" ? "plugins/my-plugin/index.ts" : "ipc/user.ts"}
            </span>
          </div>

          <pre className="p-5 overflow-x-auto">
            <code className="text-xs leading-relaxed font-mono text-white/60">
              {currentTab.code}
            </code>
          </pre>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <div className="text-sm mb-1">🔌</div>
            <h3 className="text-xs font-semibold text-white/80 mb-1">Plugins</h3>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Define with a single function. Register IPC, commands, and events through context.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <div className="text-sm mb-1">🧠</div>
            <h3 className="text-xs font-semibold text-white/80 mb-1">Type Inference</h3>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Write handlers once, types flow to renderer automatically via gen:ipc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
