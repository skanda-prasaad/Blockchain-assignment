const COLORS = [
  "#7c6ef0",
  "#34d399",
  "#f0997b",
  "#fbbf24",
  "#60a5fa",
  "#a3e635",
];
const BGS = ["#2a2460", "#0a3a2e", "#3d1a0c", "#451a03", "#1e3a5f", "#1a3406"];

export default function WalletsTab({ wallets, txHistory }) {
  return (
    <div className="flex w-full flex-col gap-6 animate-[fade-in_0.4s_ease-out]">
      {/* Wallet cards grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {wallets.map((w, i) => (
          <WalletCard
            key={w.id}
            wallet={w}
            color={COLORS[i % COLORS.length]}
            bg={BGS[i % BGS.length]}
          />
        ))}
      </div>

      {/* Transaction feed */}
      <div className="rounded-xl border border-border bg-panel p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-text-muted">
            Transaction Feed
          </h2>
          <span className="rounded bg-border px-2 py-1 font-mono text-[10px] text-text-secondary">
            {txHistory.length} TXs
          </span>
        </div>

        {txHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 py-12">
            <span className="mb-2 text-2xl">💸</span>
            <p className="font-mono text-xs text-text-muted">
              No transactions yet — go to the Send tab to create one
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {txHistory.map((tx, i) => (
              <TxRow key={i} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WalletCard({ wallet, color, bg }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border-hover hover:shadow-lg hover:shadow-black/20">
      <div
        className="absolute left-0 top-0 h-1 w-full opacity-70"
        style={{ backgroundColor: color }}
      ></div>
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full font-mono text-xl font-bold shadow-sm"
        style={{ background: bg, color }}
      >
        {wallet.name[0]}
      </div>
      <p className="text-base font-semibold text-text">{wallet.name}</p>
      <p className="mb-4 font-mono text-[10px] tracking-wide text-text-muted opacity-80">
        {wallet.address}
      </p>
      <div className="mt-auto">
        <p
          className="font-mono text-2xl font-bold tracking-tight"
          style={{ color }}
        >
          {wallet.balance.toLocaleString()}
          <span className="ml-1.5 text-xs font-medium uppercase text-text-muted">
            G13C
          </span>
        </p>
      </div>
    </div>
  );
}

function TxRow({ tx }) {
  const time = new Date(tx.timestamp).toLocaleTimeString();
  return (
    <div className="flex items-center gap-4 py-4 transition-colors animate-[fade-in_0.3s_ease] hover:bg-card/40 px-2 -mx-2 rounded-lg">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-dim bg-primary-faint text-lg text-primary shadow-sm">
        ⇄
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
          <span className="rounded border border-border bg-card px-2 py-0.5 text-text">
            {tx.sender}
          </span>
          <span className="text-xs text-text-muted">→</span>
          <span className="rounded border border-border bg-card px-2 py-0.5 text-text">
            {tx.receiver}
          </span>
          {tx.memo && (
            <span className="ml-2 rounded bg-bg px-2 py-0.5 font-mono text-[11px] italic text-text-muted">
              "{tx.memo}"
            </span>
          )}
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-text-muted">
          {time} <span className="mx-1">•</span> Block #{tx.blockIndex}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="rounded border border-accent-dim bg-accent-dim/20 px-2 py-1 font-mono text-sm font-bold text-accent">
          +{tx.amount.toLocaleString()} G13C
        </span>
      </div>
    </div>
  );
}
