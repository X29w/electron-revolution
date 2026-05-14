import { FC, useEffect, useState, useCallback } from "react";

interface PluginInfo {
  name: string;
  version: string;
  state: string;
}

interface IpcLogEntry {
  timestamp: number;
  direction: string;
  channel: string;
  args?: any[];
}

interface Stats {
  plugins: number;
  windows: number;
  ipcLogSize: number;
  uptime: number;
  memory: { heapUsed: number; heapTotal: number; rss: number };
}

type Tab = "overview" | "plugins" | "ipc-log" | "windows";

const App: FC = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [ipcLog, setIpcLog] = useState<IpcLogEntry[]>([]);
  const [windows, setWindows] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [s, p, l, w] = await Promise.all([
        window.ipcRenderer.invoke("devtools:getStats"),
        window.ipcRenderer.invoke("devtools:getPlugins"),
        window.ipcRenderer.invoke("devtools:getIpcLog"),
        window.ipcRenderer.invoke("devtools:getWindows"),
      ]);
      setStats(s);
      setPlugins(p);
      setIpcLog(l);
      setWindows(w);
    } catch (err) {
      console.error("DevTools refresh failed:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatTime = (ms: number) => {
    const date = new Date(ms);
    return date.toLocaleTimeString("en-US", { hour12: false, fractionalSecondDigits: 3 });
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "plugins", label: "Plugins", icon: "🔌" },
    { id: "ipc-log", label: "IPC Log", icon: "📡" },
    { id: "windows", label: "Windows", icon: "🪟" },
  ];

  return (
    <div className="h-full bg-[#0c0c12] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="drag-region flex items-center justify-between px-4 h-10 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛠</span>
          <span className="text-xs font-medium text-white/60">Revolution DevTools</span>
        </div>
        <button
          onClick={refresh}
          className="no-drag-region px-2 py-1 text-[10px] text-white/40 border border-white/10 rounded hover:bg-white/5 cursor-pointer transition-colors"
        >
          Refresh
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex gap-0 border-b border-white/5 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              px-4 py-2.5 text-xs font-medium cursor-pointer transition-all border-b-2
              ${tab === t.id
                ? "text-white/90 border-indigo-400"
                : "text-white/40 border-transparent hover:text-white/60"
              }
            `}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {tab === "overview" && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Plugins" value={stats.plugins} icon="🔌" />
              <StatCard label="Windows" value={stats.windows} icon="🪟" />
              <StatCard label="IPC Events" value={stats.ipcLogSize} icon="📡" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Uptime"
                value={`${Math.floor(stats.uptime)}s`}
                icon="⏱"
              />
              <StatCard
                label="Memory (Heap)"
                value={formatBytes(stats.memory.heapUsed)}
                subtitle={`/ ${formatBytes(stats.memory.heapTotal)}`}
                icon="💾"
              />
            </div>
            <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
              <h3 className="text-xs font-semibold text-white/50 mb-2">RSS Memory</h3>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500/60 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.memory.heapUsed / stats.memory.rss) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">{formatBytes(stats.memory.rss)} total</p>
            </div>
          </div>
        )}

        {tab === "plugins" && (
          <div className="space-y-2">
            {plugins.length === 0 && (
              <p className="text-xs text-white/30">No plugins installed</p>
            )}
            {plugins.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]"
              >
                <div>
                  <p className="text-sm font-medium text-white/80">{p.name}</p>
                  <p className="text-[10px] text-white/30">v{p.version}</p>
                </div>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-[10px] font-medium
                    ${p.state === "active"
                      ? "bg-green-500/10 text-green-400"
                      : p.state === "error"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-white/5 text-white/30"
                    }
                  `}
                >
                  {p.state}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "ipc-log" && (
          <div className="space-y-1">
            {ipcLog.length === 0 && (
              <p className="text-xs text-white/30">No IPC events recorded</p>
            )}
            <div className="space-y-0.5">
              {[...ipcLog].reverse().slice(0, 100).map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-1.5 rounded bg-white/[0.02] hover:bg-white/[0.04] font-mono text-[11px]"
                >
                  <span className="text-white/20 w-20 shrink-0">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span
                    className={`
                      w-12 shrink-0 text-center rounded px-1 py-0.5 text-[9px] font-bold uppercase
                      ${entry.direction === "invoke"
                        ? "bg-blue-500/10 text-blue-400"
                        : entry.direction === "send"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-purple-500/10 text-purple-400"
                      }
                    `}
                  >
                    {entry.direction}
                  </span>
                  <span className="text-white/70 truncate">{entry.channel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "windows" && (
          <div className="space-y-2">
            {windows.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🪟</span>
                  <p className="text-sm font-medium text-white/80">{name}</p>
                </div>
                <span className="text-[10px] text-white/30">registered</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: FC<{
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}> = ({ label, value, subtitle, icon }) => (
  <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl font-bold text-white/90">
      {value}
      {subtitle && <span className="text-xs text-white/30 ml-1">{subtitle}</span>}
    </p>
  </div>
);

export default App;
