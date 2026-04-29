export default function TopBar({
  stats,
  validity,
  activeTab,
  onTabChange,
  mining,
  currentUser, // 🔥 Added currentUser prop
}) {
  const chainOk = validity?.valid !== false;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-panel backdrop-blur-md rounded-t-xl mb-6 shadow-sm">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-4">
          <h1 className="font-mono text-2xl font-extrabold tracking-tight text-primary">
            G13<span className="text-text">Coin</span>
          </h1>
          {mining && (
            <div className="flex items-center gap-2 rounded-full border border-primary-dim bg-primary-faint px-3 py-1.5 font-mono text-xs text-primary shadow-inner">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-dim border-t-primary" />
              Mining...
            </div>
          )}
        </div>

        <div className="hidden items-center gap-6 divide-x divide-border md:flex">
          {[
            ["Blocks", stats?.totalBlocks ?? 1],
            ["Transactions", stats?.totalTransactions ?? 0],
          ].map(([label, val]) => (
            <div key={label} className="flex flex-col gap-1 pl-6 first:pl-0">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {label}
              </span>
              <span className="font-mono text-base font-bold text-primary">
                {val}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <div
            className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold tracking-wide border shadow-sm ${
              chainOk
                ? "border-accent-dim bg-accent-dim/20 text-accent"
                : "border-danger-dark bg-danger-dim/40 text-danger animate-[pulse-slow_2s_infinite]"
            }`}
          >
            {chainOk ? "● Secure" : "● Corrupted"}
          </div>
        </div>
      </div>

      <nav className="flex gap-2 px-6 pt-2">
        {currentUser?.name === "Admin-Console-0" ? (
          // 🔥 WHAT THE ADMIN SEES
          <>
            {["System Logs", "Security"].map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                className={`cursor-pointer border-b-2 px-6 py-3 font-mono text-sm font-semibold tracking-wide transition-all rounded-t-md ${
                  activeTab === t
                    ? "border-danger text-danger bg-danger/10 shadow-[inset_0_-2px_10px_rgba(255,85,85,0.1)]"
                    : "border-transparent text-danger-light hover:bg-danger/5 hover:text-danger"
                }`}
              >
                {t === "Security" ? "🛡️ Security" : t}
              </button>
            ))}
          </>
        ) : (
          // 👤 WHAT NORMAL USERS SEE
          <>
            {["Wallets", "Send", "Explorer"].map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                className={`cursor-pointer border-b-2 px-6 py-3 font-mono text-sm font-semibold tracking-wide transition-all rounded-t-md ${
                  activeTab === t
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-text-muted hover:bg-card hover:text-text-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </>
        )}
      </nav>
    </header>
  );
}
