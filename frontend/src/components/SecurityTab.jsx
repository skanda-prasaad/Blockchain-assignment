import { useState, useEffect } from "react";
import { api } from "../api";

export default function SecurityTab({
  chain,
  validity,
  wallets,
  refreshGlobalData,
}) {
  const [logs, setLogs] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  // Poll the backend for Admin Alerts
  const fetchLogs = async () => {
    try {
      const data = await api.getLogs();
      setLogs(data);
    } catch (err) {
      console.error("Could not fetch admin logs");
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000); // Check for new hacks every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRunDiagnostics = () => {
    setIsChecking(true);
    setCheckResult(null);
    // Simulate a deep system scan for the presentation
    setTimeout(() => {
      setIsChecking(false);
      setCheckResult(validity);
    }, 1500);
  };

  const handleBanNode = async (nodeId, nodeName) => {
    const confirmBan = window.confirm(
      `CRITICAL WARNING: Are you sure you want to permanently BAN ${nodeName} from the network?`,
    );
    if (confirmBan) {
      try {
        await api.banNode(nodeId);
        await fetchLogs(); // Refresh logs to show the ban message
        alert(`${nodeName} has been blacklisted.`);
      } catch (err) {
        alert("Failed to ban node.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fade-in_0.4s_ease-out]">
      {/* LEFT PANEL: The Admin Audit Logs */}
      <div className="rounded-xl border border-border bg-panel p-6 shadow-lg flex flex-col h-[600px]">
        <h2 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-primary flex items-center justify-between">
          <span>🛡️ Live Audit Logs</span>
          <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded animate-pulse">
            RECORDING
          </span>
        </h2>

        <div className="flex-1 overflow-y-auto border border-border bg-bg rounded-lg p-4">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted font-mono text-xs opacity-50">
              <span className="text-2xl mb-2">✅</span>
              No network anomalies detected.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border font-mono text-xs animate-[fade-in_0.3s_ease-out] ${
                    log.type === "danger"
                      ? "bg-danger/10 border-danger/50 text-danger-light"
                      : "bg-card border-border text-text"
                  }`}
                >
                  <span className="font-bold">⚠️ SYSTEM ALERT:</span>{" "}
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Controls */}
      <div className="flex flex-col gap-6 h-[600px]">
        {/* Hash Diagnostics */}
        <div className="rounded-xl border border-border bg-panel p-6 shadow-lg flex flex-col flex-1">
          <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-accent">
            🔗 Cryptographic Diagnostics
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-text-secondary font-sans leading-relaxed mb-4">
              Recalculate the SHA-256 hash of all blocks. If any user has
              tampered with the ledger data bypassing the miner, the hash
              pointers will misalign.
            </p>
            <button
              onClick={handleRunDiagnostics}
              disabled={isChecking}
              className="w-full py-3 rounded bg-accent/20 border border-accent text-accent font-bold text-sm hover:bg-accent/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isChecking
                ? "Recalculating Global Hashes..."
                : "Run System Hash Verification"}
            </button>
            {checkResult !== null && (
              <div className="mt-4 animate-[fade-in_0.3s_ease-out]">
                {checkResult.valid ? (
                  <div className="p-3 rounded text-center font-bold text-sm border bg-green-500/10 border-green-500/50 text-green-400">
                    ✅ SUCCESS: Blockchain integrity verified.
                  </div>
                ) : (
                  <div className="p-4 rounded border bg-danger/10 border-danger/50 flex flex-col gap-3">
                    <div className="text-center font-bold text-sm text-danger border-b border-danger/30 pb-2">
                      🚨 FAILURE: HASH MISMATCH DETECTED
                    </div>

                    <div className="font-mono text-[10px] flex flex-col gap-2">
                      <div className="text-text-muted">
                        <span className="text-danger-light font-bold">
                          FAULT LOCATION:
                        </span>{" "}
                        Block #{checkResult.brokenBlockIndex}
                      </div>

                      <div className="bg-bg p-2 rounded border border-border overflow-hidden">
                        <span className="block text-text-muted uppercase mb-1">
                          Original Locked Hash (Expected):
                        </span>
                        <span className="text-green-400 select-all">
                          {checkResult.storedHash}
                        </span>
                      </div>

                      <div className="bg-[#3a0a0a] p-2 rounded border border-danger/50 overflow-hidden">
                        <span className="block text-danger uppercase mb-1">
                          Recalculated Hash (From Hacked Data):
                        </span>
                        <span className="text-danger-light select-all">
                          {checkResult.actualCalculatedHash}
                        </span>
                      </div>

                      <p className="text-text-secondary mt-1">
                        <span className="text-danger font-bold">
                          CONCLUSION:
                        </span>{" "}
                        The data in Block #{checkResult.brokenBlockIndex} was
                        altered after mining. The calculated hash no longer
                        matches the stored hash.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Node Management (The Ban Hammer) */}
        <div className="rounded-xl border border-danger/30 bg-panel p-6 shadow-lg flex flex-col flex-1">
          <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-danger">
            🔨 Node Management
          </h2>
          <div className="overflow-y-auto max-h-[150px] pr-2">
            {wallets
              .filter((w) => w.name !== "Admin-Console-0")
              .map((w) => (
                <div
                  key={w.id}
                  className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                >
                  <span className="font-mono text-xs text-text">
                    {w.name}{" "}
                    <span className="text-text-muted">({w.balance} G13C)</span>
                  </span>
                  <button
                    onClick={() => handleBanNode(w.id, w.name)}
                    className="px-3 py-1 bg-danger/10 text-danger border border-danger/30 rounded text-[10px] font-bold hover:bg-danger hover:text-white transition-colors cursor-pointer"
                  >
                    BAN NODE
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
