import { useState, useEffect } from "react";

export default function Login({ wallets, onLogin }) {
  const [selectedId, setSelectedId] = useState("");

  // Auto-select the first wallet once they load from the backend
  useEffect(() => {
    if (wallets.length > 0 && selectedId === "") {
      setSelectedId(wallets[0].id);
    }
  }, [wallets, selectedId]);

  const handleBoot = (e) => {
    e.preventDefault();
    const activeNode = wallets.find((w) => w.id === Number(selectedId));
    if (activeNode) {
      onLogin(activeNode);
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-primary font-mono animate-pulse">
        Establishing connection to Mainnet...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 font-sans text-text">
      <div className="w-full max-w-md rounded-xl border border-border bg-panel p-8 shadow-2xl animate-[fade-in_0.5s_ease-out]">
        <div className="mb-8 text-center">
          <h1 className="font-mono text-3xl font-bold text-white tracking-widest">
            G13<span className="text-primary">Coin</span>
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-muted">
            Enterprise Node Simulator
          </p>
        </div>

        <form onSubmit={handleBoot} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase text-text-muted">
              Select Active Node Identity
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text outline-none focus:border-primary transition-colors"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.balance} G13C)
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-primary py-3.5 font-sans text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-hover hover:scale-[1.02]"
          >
            Boot Node Environment →
          </button>
        </form>

        <div className="mt-8 border-t border-border/50 pt-6 text-center font-mono text-[10px] text-text-muted">
          <p>WARNING: Authorized Personnel Only.</p>
          <p>All network activity is cryptographically logged.</p>
        </div>
      </div>
    </div>
  );
}
