import { FC, useEffect, useState, useCallback } from "react";

interface PluginInfo { name: string; version: string; state: string }
interface IpcLogEntry { timestamp: number; direction: string; channel: string; duration?: number }
interface Stats { plugins: number; windows: number; ipcLogSize: number; uptime: number; memory: { heapUsed: number; heapTotal: number; rss: number } }

type Tab = "overview" | "plugins" | "ipc-log" | "windows" | "store";

const App: FC = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [ipcLog, setIpcLog] = useState<IpcLogEntry[]>([]);
  const [windows, setWindows] = useState<string[]>([]);
  const [store, setStore] = useState<any>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, p, l, w] = await Promise.all([
        window.ipcRenderer.invoke("devtools:getStats"),
        window.ipcRenderer.invoke("devtools:getPlugins"),
        window.ipcRenderer.invoke("devtools:getIpcLog"),
        window.ipcRenderer.invoke("devtools:getWindows"),
      ]);
      setStats(s); setPlugins(p); setIpcLog(l); setWindows(w);
      if (tab === "store") {
        const storeData = await window.ipcRenderer.invoke("devtools:getStore");
        setStore(storeData);
      }
    } catch (err) { console.error("DevTools refresh failed:", err); }
  }, [tab]);

  useEffect(() => { refresh(); const i = setInterval(refresh, 2000); return () => clearInterval(i); }, [refresh]);

  const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const formatTime = (ms: number) => new Date(ms).toLocaleTimeString("en-US", { hour12: false, fractionalSecondDigits: 3 });
  const formatDuration = (d?: number) => d == null ? "" : d > 100 ? `${d.toFixed(0)}ms` : d > 1 ? `${d.toFixed(1)}ms` : `${(d * 1000).toFixed(0)}μs`;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "plugins", label: "Plugins", icon: "🔌" },
    { id: "ipc-log", label: "IPC Log", icon: "📡" },
    { id: "windows", label: "Windows", icon: "🪟" },
    { id: "store", label: "Store", icon: "💾" },
  ];

  return (
    <div className="h-full bg-[#0c0c12] text-white flex flex-col overflow-hidden">
      <header className="drag-region flex items-center justify-between px-4 h-10 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛠</span>
          <span className="text-xs font-medium text-white/60">Revolution DevTools</span>
        </div>
        <div className="no-drag-region flex gap-2">
          <button onClick={() => { window.ipcRenderer.invoke("devtools:clearIpcLog"); refresh(); }} className="px-2 py-1 text-[10px] text-white/40 border border-white/10 rounded hover:bg-white/5 cursor-pointer">Clear Log</button>
          <button onClick={refresh} className="px-2 py-1 text-[10px] text-white/40 border border-white/10 rounded hover:bg-white/5 cursor-pointer">Refresh</button>
        </div>
      </header>

      <nav className="flex gap-0 border-b border-white/5 shrink-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-all border-b-2 ${tab === t.id ? "text-white/90 border-indigo-400" : "text-white/40 border-transparent hover:text-white/60"}`}>
            <span className="mr-1.5">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-auto p-4">
        {tab === "overview" && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <StatCard label="Plugins" value={stats.plugins} icon="🔌" />
              <StatCard label="Windows" value={stats.windows} icon="🪟" />
              <StatCard label="IPC Calls" value={stats.ipcLogSize} icon="📡" />
              <StatCard label="Uptime" value={`${Math.floor(stats.uptime)}s`} icon="⏱" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] text-white/40 mb-2">Heap Memory</p>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${(stats.memory.heapUsed / stats.memory.heapTotal) * 100}%` }} />
                </div>
                <p className="text-[10px] text-white/30 mt-1">{formatBytes(stats.memory.heapUsed)} / {formatBytes(stats.memory.heapTotal)}</p>
              </div>
              <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] text-white/40 mb-2">RSS</p>
                <p className="text-lg font-bold text-white/80">{formatBytes(stats.memory.rss)}</p>
              </div>
            </div>
            {ipcLog.length > 0 && (
              <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] text-white/40 mb-2">Slow Calls (&gt;50ms)</p>
                {ipcLog.filter((e) => e.duration && e.duration > 50).length === 0 ? (
                  <p className="text-xs text-green-400/60">None — all calls are fast ✓</p>
                ) : (
                  <div className="space-y-1">
                    {ipcLog.filter((e) => e.duration && e.duration > 50).slice(-5).map((e, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-white/60">{e.channel}</span>
                        <span className="text-red-400">{formatDuration(e.duration)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "plugins" && (
          <div className="space-y-2">
            {plugins.map((p) => (
              <div key={p.name} className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{p.name}</p>
                    <p className="text-[10px] text-white/30">v{p.version}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.state === "active" ? "bg-green-500/10 text-green-400" : p.state === "error" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/30"}`}>
                    {p.state}
                  </span>
                </div>
                <div className="mt-2 flex gap-3 text-[10px] text-white/30">
                  <span>IPC: {ipcLog.filter((e) => e.channel.startsWith(p.name + ":")).length} calls</span>
                  <span>Avg: {(() => { const calls = ipcLog.filter((e) => e.channel.startsWith(p.name + ":") && e.duration); return calls.length ? formatDuration(calls.reduce((s, e) => s + (e.duration ?? 0), 0) / calls.length) : "—"; })()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "ipc-log" && (
          <div className="space-y-0.5">
            {ipcLog.length === 0 && <p className="text-xs text-white/30">No events recorded</p>}
            {[...ipcLog].reverse().slice(0, 100).map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded bg-white/[0.02] hover:bg-white/[0.04] font-mono text-[11px]">
                <span className="text-white/20 w-20 shrink-0">{formatTime(entry.timestamp)}</span>
                <span className={`w-14 shrink-0 text-center rounded px-1 py-0.5 text-[9px] font-bold uppercase ${entry.direction === "handle" ? "bg-blue-500/10 text-blue-400" : entry.direction === "on" ? "bg-green-500/10 text-green-400" : "bg-purple-500/10 text-purple-400"}`}>
                  {entry.direction}
                </span>
                <span className="text-white/70 truncate flex-1">{entry.channel}</span>
                {entry.duration != null && (
                  <span className={`text-[10px] shrink-0 ${entry.duration > 50 ? "text-red-400" : entry.duration > 10 ? "text-yellow-400/60" : "text-white/20"}`}>
                    {formatDuration(entry.duration)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "windows" && (
          <div className="space-y-2">
            {windows.map((name) => (
              <div key={name} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🪟</span>
                  <p className="text-sm font-medium text-white/80">{name}</p>
                </div>
                <span className="text-[10px] text-white/30">registered</span>
              </div>
            ))}
          </div>
        )}

        {tab === "store" && (
          <div className="space-y-2">
            {store === null ? (
              <p className="text-xs text-white/30">Store not available</p>
            ) : (
              <pre className="p-4 rounded-lg border border-white/5 bg-white/[0.02] text-xs text-white/60 overflow-auto whitespace-pre-wrap">
                {JSON.stringify(store, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
  <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl font-bold text-white/90">{value}</p>
  </div>
);

export default App;
