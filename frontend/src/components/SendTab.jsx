import { useState, useEffect } from "react";
import { api } from "../api";

export default function SendTab({ wallets, refreshGlobalData, currentUser }) {
  const defaultToId = wallets.find((w) => w.id !== currentUser?.id)?.id || "";

  const [toId, setToId] = useState(defaultToId);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [pending, setPending] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔥 NEW: Custom Toast State
  const [toast, setToast] = useState(null);

  // 🔥 NEW: Function to show a beautiful popup and hide it after 3 seconds
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadPending = async () => {
    try {
      const data = await api.getPending();
      setPending(data);
    } catch (err) {
      console.error("Failed to load mempool");
    }
  };

  useEffect(() => {
    loadPending();
    const interval = setInterval(loadPending, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.sendTransaction({
        fromId: currentUser.id,
        toId: Number(toId),
        amount: Number(amount),
        memo,
      });
      setAmount("");
      setMemo("");
      await loadPending();
      await refreshGlobalData();
      showToast("Broadcasted to Mempool. Waiting for miner...", "success"); // Sleek notification
    } catch (err) {
      showToast("Transaction failed: Insufficient G13C balance.", "danger"); // Error notification
    }
    setIsProcessing(false);
  };

  const handleMine = async () => {
    setIsProcessing(true);
    try {
      await api.minePending();
      await loadPending();
      await refreshGlobalData();
      showToast(
        "✅ Proof-of-Work complete! Block added to the ledger.",
        "success",
      ); // Sleek notification
    } catch (err) {
      showToast("Mining failed. Check server connection.", "danger");
    }
    setIsProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fade-in_0.4s_ease-out] relative">
      {/* LEFT PANEL: Broadcast Interface */}
      <div className="rounded-xl border border-border bg-panel p-6 shadow-lg">
        <h2 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-primary">
          ⚡ Broadcast New Transaction
        </h2>
        <form onSubmit={handleSend} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase text-text-muted">
              From Node (Active Session)
            </label>
            <div className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text-muted">
              {currentUser?.name || "Unknown"} — {currentUser?.balance} G13C
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase text-text-muted">
              To Node
            </label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text outline-none focus:border-primary transition-colors"
            >
              {wallets
                .filter((w) => w.id !== currentUser?.id)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.address.slice(0, 8)}...)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase text-text-muted">
              Amount (G13C)
            </label>
            <input
              type="number"
              required
              min="1"
              max={currentUser?.balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text outline-none focus:border-primary transition-colors"
              placeholder="e.g. 50"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="mt-4 rounded-lg bg-primary py-3.5 font-sans text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? "Transmitting..." : "Add to Mempool →"}
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: Network Mempool & Miner */}
      <div className="rounded-xl border border-border bg-panel p-6 shadow-lg flex flex-col">
        <h2 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest flex justify-between text-accent">
          <span>⏳ Network Mempool</span>
          <span>{pending.length} Pending</span>
        </h2>

        <div className="flex-1 overflow-y-auto min-h-[200px] border border-border bg-bg rounded-lg p-4 mb-6">
          {pending.length === 0 ? (
            <div className="h-full flex items-center justify-center text-text-muted font-mono text-xs text-center">
              Mempool is empty.
              <br />
              Waiting for network activity...
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map((tx, idx) => (
                <div
                  key={idx}
                  className="border border-border/50 bg-card rounded p-3 font-mono text-xs text-text shadow-sm animate-[fade-in_0.2s_ease-out]"
                >
                  <div className="flex justify-between text-[10px] text-text-muted mb-2 border-b border-border/50 pb-1">
                    <span>{tx.txId}</span>
                    <span className="text-accent animate-pulse">
                      Unconfirmed
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {tx.sender} → {tx.receiver}
                    </span>
                    <span className="font-bold text-primary">
                      {tx.amount} G13C
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The System Execution Button */}
        <button
          onClick={handleMine}
          disabled={pending.length === 0 || isProcessing}
          className="w-full rounded-lg border-2 border-accent bg-accent/10 py-3.5 font-mono text-sm font-bold text-accent transition-all hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          <span>⛏️</span>
          [SYSTEM] Execute Proof-of-Work & Mine Block
        </button>
      </div>

      {/* 🔥 THE CUSTOM TOAST POPUP */}
      {toast && (
        <div
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-full shadow-2xl font-mono text-sm font-bold z-50 animate-[fade-in_0.3s_ease-out] flex items-center gap-3 backdrop-blur-md ${
            toast.type === "success"
              ? "bg-green-500/20 border border-green-500/50 text-green-400"
              : "bg-danger/20 border border-danger/50 text-danger"
          }`}
        >
          <span>{toast.type === "success" ? "⚡" : "🚨"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
