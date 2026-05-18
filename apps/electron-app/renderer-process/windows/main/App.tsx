import { ipcSend } from "@renderer-process/shared/services/ipc";
import { FC, useState } from "react";

const features = [
  {
    icon: "⚡",
    title: "Plugin System",
    desc: "Hot-swappable plugins with lifecycle management",
  },
  {
    icon: "🧠",
    title: "Type-safe IPC",
    desc: "Zero hand-written types, auto-generated from handlers",
  },
  {
    icon: "🛠",
    title: "CLI Generator",
    desc: "Scaffold windows, plugins, and IPC modules instantly",
  },
  {
    icon: "📦",
    title: "Purely Functional",
    desc: "No classes, no decorators — just functions and modules",
  },
];

const commands = [
  { cmd: "pnpm add:window", arg: "<name>", label: "Add Window" },
  { cmd: "pnpm add:plugin", arg: "<name>", label: "Add Plugin" },
  { cmd: "pnpm add:ipc", arg: "<name>", label: "Add IPC Module" },
  { cmd: "pnpm gen:ipc", arg: "", label: "Generate Types" },
];

const App: FC = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="h-full bg-[#0a0a0f] text-white overflow-auto">
      {/* Header */}
      <header className="drag-region flex items-center justify-between px-6 h-12 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-medium tracking-wide text-white/80">Revolution</span>
        </div>
        <div className="no-drag-region flex items-center gap-2">
          <button
            onClick={() => ipcSend("window:minimize", "main")}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 cursor-pointer transition-colors"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor" className="text-white/60">
              <rect width="10" height="1" />
            </svg>
          </button>
          <button
            onClick={() => ipcSend("window:maximize", "main")}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 cursor-pointer transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" className="text-white/60">
              <rect x="0.5" y="0.5" width="8" height="8" strokeWidth="1" />
            </svg>
          </button>
          <button
            onClick={() => ipcSend("window:close", "main")}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/80 cursor-pointer transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-white/60">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-12 pt-16 pb-12">
        {/* Gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">⚡</span>
            <h1 className="text-4xl font-bold tracking-tight">Revolution</h1>
          </div>
          <p className="text-lg text-white/50 max-w-md leading-relaxed">
            A functional, plugin-based Electron framework
            <br />
            with zero-config type-safe IPC.
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => ipcSend("window:open", "child-a")}
              className="px-5 py-2.5 bg-white/10 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/15 hover:border-white/20 cursor-pointer transition-all"
            >
              Open Child Window
            </button>
            <button
              onClick={() => ipcSend("window:open", "devtools")}
              className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 cursor-pointer transition-all"
            >
              🛠 DevTools
            </button>
            <a
              href="https://github.com/X29w/electron-revolution"
              className="px-5 py-2.5 text-white/50 border border-white/5 rounded-lg text-sm font-medium hover:text-white/70 hover:border-white/10 transition-all"
            >
              Documentation →
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-12 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`
                relative p-5 rounded-xl border transition-all duration-300 cursor-default
                ${hoveredFeature === i
                  ? "bg-white/[0.04] border-white/10 shadow-lg shadow-indigo-500/5"
                  : "bg-white/[0.02] border-white/5"
                }
              `}
            >
              <span className="text-xl mb-3 block">{f.icon}</span>
              <h3 className="text-sm font-semibold text-white/90 mb-1">{f.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLI Quick Reference */}
      <section className="px-12 pb-12">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
          CLI Commands
        </h2>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 font-mono text-xs">
          {commands.map((c, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <span className="text-indigo-400">$</span>
              <span className="text-white/70">{c.cmd}</span>
              {c.arg && <span className="text-white/30">{c.arg}</span>}
              <span className="ml-auto text-white/20 text-[10px]">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="px-12 pb-16">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
          Architecture
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "core/", desc: "IPC · Window · Plugin · EventBus", color: "from-indigo-500/20" },
            { label: "ipc/", desc: "Handler modules by feature", color: "from-purple-500/20" },
            { label: "plugins/", desc: "Extensible plugin directory", color: "from-pink-500/20" },
          ].map((item, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-white/5 p-4 bg-white/[0.02]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} to-transparent opacity-30 pointer-events-none`} />
              <div className="relative">
                <p className="text-sm font-semibold text-white/80 mb-1">{item.label}</p>
                <p className="text-[11px] text-white/35">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-12 pb-8">
        <div className="border-t border-white/5 pt-6 flex items-center justify-between">
          <span className="text-[11px] text-white/20">v0.2.0</span>
          <span className="text-[11px] text-white/20">Functional · Pluggable · Type-safe</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
