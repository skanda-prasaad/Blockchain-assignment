import { useState } from "react";

export default function ExplorerTab({ chain, validity }) {
  const [expanded, setExpanded] = useState(new Set([chain.length - 1]));

  const toggle = (i) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const reversed = [...chain].reverse();

  return (
    <div className="w-full animate-[fade-in_0.4s_ease-out] flex flex-col gap-6">
      {/* Alert banner */}
      {validity?.valid === false && (
        <div className="flex items-center gap-4 rounded-xl border border-danger bg-danger-dim/40 px-6 py-4 font-mono text-sm text-danger shadow-[0_0_20px_rgba(248,113,113,0.15)] animate-[pulse-slow_2s_infinite]">
          <span className="text-3xl">🚨</span>
          <div>
            <strong className="block text-base tracking-wide">
              CRITICAL SECURITY ALERT: Chain Integrity Compromised at Block #
              {validity.brokenAt}
            </strong>
            <span className="opacity-80 text-xs">
              {validity.reason === "hash_mismatch"
                ? "Cryptographic mismatch detected: payload data was tampered."
                : "Cryptographic link broken: previousHash pointer invalidated."}
            </span>
          </div>
        </div>
      )}

      {/* Block list */}
      <div className="rounded-xl border border-border bg-panel p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <span className="text-primary">⛓️</span> Immutable Ledger —{" "}
            {chain.length} Block{chain.length !== 1 ? "s" : ""}
          </h2>
          <span className="rounded bg-bg px-3 py-1.5 font-mono text-[10px] text-text-secondary border border-border shadow-inner">
            Click a block to inspect payload
          </span>
        </div>

        <div className="flex flex-col">
          {reversed.map((block) => {
            const i = block.index;
            const open = expanded.has(i);
            const isGen = block.data?.type === "genesis";
            const isTamp = block.tampered;

            return (
              <div key={i} className="animate-[fade-in_0.3s_ease]">
                {/* Block header */}
                <div
                  onClick={() => toggle(i)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 ${
                    isTamp || validity?.brokenAt === i
                      ? "border-danger bg-danger-dim/20 shadow-inner"
                      : open
                        ? "border-primary bg-primary-faint/40 shadow-md"
                        : "border-border bg-card hover:border-border-hover hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {/* Left edge colored accent */}
                  {(open || isTamp) && (
                    <div
                      className={`absolute left-0 top-0 h-full w-1.5 rounded-l-xl ${isTamp ? "bg-danger" : "bg-primary"}`}
                    ></div>
                  )}

                  <div className="flex items-center gap-4 min-w-0 pl-1">
                    <span
                      className={`font-mono text-lg font-bold ${isTamp ? "text-danger" : "text-primary"}`}
                    >
                      #{i}
                    </span>
                    {isGen && (
                      <span className="rounded border border-primary-dim bg-primary-faint px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-primary shadow-sm">
                        GENESIS
                      </span>
                    )}
                    {isTamp && (
                      <span className="rounded border border-danger-dark bg-danger-dim px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-danger shadow-sm animate-pulse">
                        TAMPERED
                      </span>
                    )}
                    {!isGen && !isTamp && (
                      <span className="truncate font-mono text-xs text-text-secondary max-w-[350px]">
                        <span className="text-text">{block.data.sender}</span>
                        <span className="mx-2 text-text-muted">→</span>
                        <span className="text-text">{block.data.receiver}</span>
                        <span className="mx-2 text-text-muted">·</span>
                        <span className="text-accent font-bold">
                          {block.data.amount?.toLocaleString()} G13C
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-5">
                    <span className="font-mono text-[10px] text-text-muted bg-bg px-2 py-1 rounded border border-border">
                      nonce: {block.nonce?.toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`font-mono text-xl text-text-muted transition-transform duration-300 ${
                        open
                          ? "rotate-90 text-primary"
                          : "group-hover:text-text"
                      }`}
                    >
                      ›
                    </span>
                  </div>
                </div>

                {/* Expanded body */}
                {open && (
                  <div
                    className={`-mt-2 rounded-b-xl border border-t-0 px-6 py-6 pt-8 shadow-inner ${
                      isTamp
                        ? "border-danger-dark bg-danger-dim/5"
                        : "border-primary-dim bg-card-alt"
                    }`}
                  >
                    <div className="grid gap-8 md:grid-cols-2">
                      {/* Data section */}
                      <div className="flex flex-col gap-4">
                        <h3 className="flex items-center gap-2 border-b border-border pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
                          <span className="text-text-secondary">📦</span>{" "}
                          Payload Data
                        </h3>
                        {isGen ? (
                          <p className="rounded-lg bg-bg p-4 font-mono text-xs italic text-text-secondary border border-border shadow-inner">
                            "{block.data.message}"
                          </p>
                        ) : (
                          <div className="flex flex-col gap-3 rounded-lg bg-bg p-4 border border-border shadow-inner">
                            <KV k="TX ID" v={block.data.txId} />
                            <KV
                              k="Sender"
                              v={`${block.data.sender} (${block.data.senderAddr?.slice(0, 12)}...)`}
                            />
                            <KV
                              k="Receiver"
                              v={`${block.data.receiver} (${block.data.receiverAddr?.slice(0, 12)}...)`}
                            />
                            <KV
                              k="Transfer Amount"
                              v={`${block.data.amount?.toLocaleString()} G13C`}
                              vClass={`font-bold ${isTamp ? "text-danger" : "text-accent"}`}
                            />
                            {block.data.memo && (
                              <KV
                                k="Memo"
                                v={`"${block.data.memo}"`}
                                vClass="italic text-text-secondary"
                              />
                            )}
                            {isTamp && (
                              <div className="mt-2 border-t border-danger-dark/50 pt-3">
                                <KV
                                  k="⚠ Status"
                                  v="DATA TAMPERED — hash mismatch"
                                  vClass="text-danger font-bold animate-pulse"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hash section */}
                      <div className="flex flex-col gap-4">
                        <h3 className="flex items-center gap-2 border-b border-border pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
                          <span className="text-text-secondary">🔐</span>{" "}
                          Cryptographic Proof
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                            Previous Hash Pointer
                          </p>
                          <div className="break-all rounded-lg border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-text-secondary shadow-inner">
                            {block.previousHash}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                            Block Hash{" "}
                            {isTamp ? (
                              <span className="text-danger font-bold ml-2">
                                (INVALIDATED)
                              </span>
                            ) : (
                              <span className="text-primary font-bold ml-2">
                                (VERIFIED)
                              </span>
                            )}
                          </p>
                          <div
                            className={`break-all rounded-lg border p-3 font-mono text-xs leading-relaxed shadow-inner transition-colors ${
                              isTamp
                                ? "border-danger bg-danger-dim/20 text-danger"
                                : "border-primary bg-primary-faint text-primary"
                            }`}
                          >
                            {block.hash}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connector Ring */}
                {i > 0 && (
                  <div className="flex flex-col items-center py-1.5 opacity-80">
                    <div
                      className={`h-4 w-0.5 ${isTamp ? "bg-danger" : "bg-primary"}`}
                    />
                    <div
                      className={`h-3 w-3 rounded-full ring-4 ${
                        isTamp
                          ? "bg-danger ring-danger/20"
                          : "bg-primary ring-primary/20"
                      }`}
                    />
                    <div
                      className={`h-4 w-0.5 ${isTamp ? "bg-danger" : "bg-primary"}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KV({ k, v, vClass = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {k}
      </span>
      <span
        className={`text-right font-mono text-[11px] truncate ${vClass || "text-text"}`}
      >
        {v}
      </span>
    </div>
  );
}
