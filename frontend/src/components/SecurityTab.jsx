import { useState } from "react";

const ATTACK_TYPES = [
  {
    id: "amount",
    label: "Inflate Amount",
    desc: "Changes transaction amount to 999,999 G13C",
    icon: "💰",
  },
  {
    id: "receiver",
    label: "Redirect Funds",
    desc: "Redirects payment to a hacker wallet",
    icon: "🔀",
  },
  {
    id: "wipe",
    label: "Wipe Data",
    desc: "Erases all transaction data from block",
    icon: "🗑",
  },
];

export default function SecurityTab({ chain, onTamper, onRestore, validity }) {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedAttack, setSelectedAttack] = useState("amount");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const targets = chain.filter((b) => b.data?.type === "transfer");
  const isCorrupted = validity?.valid === false;

  const handleAttack = async () => {
    if (selectedBlock === null) return;
    setLoading(true);
    const result = await onTamper(selectedBlock, selectedAttack);
    setLog((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        blockIndex: selectedBlock,
        attackType: selectedAttack,
        success: true,
        detail: result,
      },
      ...prev,
    ]);
    setLoading(false);
  };

  const handleRestore = async () => {
    setLoading(true);
    await onRestore();
    setLog((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        attackType: "restore",
        success: true,
        detail: { message: "Chain restored — all hashes revalidated" },
      },
      ...prev,
    ]);
    setSelectedBlock(null);
    setLoading(false);
  };

  return (
    <div className="w-full animate-[fade-in_0.4s_ease-out]">
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Attack Panel */}
        <div className="rounded-xl border border-border bg-panel p-6 shadow-sm">
          <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <span className="text-danger">⚔️</span> Threat Simulation
          </h2>

          {/* Step 1 */}
          <div className="mb-6">
            <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Step 1 — Select Target Block
            </h3>
            {targets.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-card/50 py-8 text-center">
                <p className="font-mono text-xs text-text-muted">
                  Mine some transactions first (go to Send tab)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {targets.map((b) => (
                  <button
                    key={b.index}
                    onClick={() => setSelectedBlock(b.index)}
                    className={`cursor-pointer rounded-lg border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      selectedBlock === b.index
                        ? "border-danger bg-danger-dim/20 shadow-[0_0_15px_rgba(248,113,113,0.1)]"
                        : "border-border bg-card hover:border-border-hover hover:bg-card/80"
                    }`}
                  >
                    <div
                      className={`font-mono text-lg font-bold ${selectedBlock === b.index ? "text-danger" : "text-text"}`}
                    >
                      #{b.index}
                    </div>
                    <div className="mt-1 font-mono text-[9px] text-text-muted truncate px-1">
                      {b.data.sender} → {b.data.receiver}
                    </div>
                    <div
                      className={`mt-1.5 inline-block rounded bg-bg px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                        b.tampered ? "text-danger" : "text-accent"
                      }`}
                    >
                      {b.tampered
                        ? "⚠ COMPROMISED"
                        : `${b.data.amount?.toLocaleString()} G13C`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="mb-6">
            <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Step 2 — Choose Attack Vector
            </h3>
            <div className="flex flex-col gap-3">
              {ATTACK_TYPES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAttack(a.id)}
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-3 text-left transition-all duration-200 ${
                    selectedAttack === a.id
                      ? "border-primary bg-primary-faint shadow-[0_0_15px_rgba(124,110,240,0.1)]"
                      : "border-border bg-card hover:border-border-hover hover:bg-card/80"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-xl shadow-inner">
                    {a.icon}
                  </span>
                  <div>
                    <div
                      className={`font-mono text-sm font-bold ${selectedAttack === a.id ? "text-primary" : "text-text"}`}
                    >
                      {a.label}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                      {a.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Launch button */}
          <button
            onClick={handleAttack}
            disabled={selectedBlock === null || loading}
            className={`w-full rounded-lg py-3.5 font-mono text-sm font-bold tracking-wide transition-all shadow-md ${
              selectedBlock !== null && !loading
                ? "bg-danger border border-danger-dark text-white cursor-pointer hover:bg-danger-dark hover:-translate-y-0.5 hover:shadow-danger/20"
                : "bg-danger-dim border border-danger-dark/50 text-danger/50 cursor-not-allowed opacity-60"
            }`}
          >
            {loading
              ? "Executing Exploit..."
              : `⚠ Launch Attack on Block #${selectedBlock ?? "?"}`}
          </button>

          {isCorrupted && (
            <button
              onClick={handleRestore}
              disabled={loading}
              className="mt-4 w-full cursor-pointer rounded-lg border border-accent bg-accent-dim/20 py-3.5 font-mono text-sm font-bold tracking-wide text-accent transition-all hover:bg-accent-dim/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span className="animate-pulse">🛡️</span> Restore Ecosystem
              Integrity
            </button>
          )}
        </div>

        {/* Log Panel */}
        <div className="rounded-xl border border-border bg-panel p-6 shadow-sm flex flex-col h-full">
          <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <span className="text-text-secondary">📋</span> System Logs
          </h2>

          <div className="flex-1 rounded-lg border border-border bg-bg p-4 shadow-inner overflow-hidden flex flex-col">
            {log.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-50">
                <span className="text-3xl mb-2">📟</span>
                <p className="font-mono text-xs text-text-muted">
                  Awaiting system events...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[300px]">
                {log.map((entry, i) => (
                  <LogEntry key={i} entry={entry} />
                ))}
              </div>
            )}
          </div>

          {/* Explanation */}
          {/* <div className="mt-6 rounded-lg bg-card border border-border p-5">
            <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-2">
              Security Architecture: Tampering Defense
            </h3>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] leading-relaxed text-text-muted">
                Every block contains a{" "}
                <span className="font-bold text-primary">SHA-256 hash</span> — a
                unique cryptographic fingerprint. The next block stores this
                hash as{" "}
                <code className="rounded bg-bg px-1 py-0.5 text-primary border border-border">
                  previousHash
                </code>
                .
              </p>
              <p className="font-mono text-[10px] leading-relaxed text-text-muted">
                Tampering with Block #N alters its data, invalidating the
                original hash. Since{" "}
                <code className="rounded bg-bg px-1 py-0.5 text-primary border border-border">
                  block.hash ≠ calculateHash()
                </code>
                , the{" "}
                <span className="font-bold text-danger">
                  integrity check fails
                </span>
                .
              </p>
              <p className="font-mono text-[10px] leading-relaxed text-text-muted">
                Even if the hash is recalculated, Block #(N+1)'s{" "}
                <code className="rounded bg-bg px-1 py-0.5 text-primary border border-border">
                  previousHash
                </code>{" "}
                points to the old value, resulting in a{" "}
                <span className="font-bold text-danger">broken link</span>. This
                is the core immutable guarantee.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

function LogEntry({ entry }) {
  const isRestore = entry.attackType === "restore";
  return (
    <div
      className={`rounded border-l-4 p-3 animate-[slide-in_0.3s_ease] ${
        isRestore
          ? "border-accent bg-accent-dim/10"
          : "border-danger bg-danger-dim/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] font-bold tracking-widest uppercase ${
            isRestore ? "text-accent" : "text-danger"
          }`}
        >
          {isRestore ? "[SYS_RESTORE]" : `[EXPLOIT_B${entry.blockIndex}]`}
        </span>
        <span className="font-mono text-[9px] text-text-muted opacity-70">
          {entry.time}
        </span>
      </div>
      {!isRestore && (
        <p className="mt-1.5 font-mono text-[11px] text-text">
          <span className="text-text-muted">Vector:</span> {entry.attackType}
        </p>
      )}
      <p
        className={`mt-1 font-mono text-[10px] ${isRestore ? "text-accent" : "text-danger/80"}`}
      >
        &gt; {entry.detail?.message || "Execution successful."}
      </p>
    </div>
  );
}
