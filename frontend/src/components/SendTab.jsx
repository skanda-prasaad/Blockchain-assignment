import { useState, useEffect } from "react";

export default function SendTab({ wallets, onSend, mining }) {
  const [fromId, setFromId] = useState(0);
  const [toId, setToId] = useState(1);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  const from = wallets.find((w) => w.id === fromId);
  const to = wallets.find((w) => w.id === toId);
  const amt = Number(amount) || 0;

  const validate = () => {
    if (fromId === toId) return "Cannot send to yourself";
    if (!amt || amt <= 0) return "Enter a valid amount";
    if (amt > from?.balance)
      return `Insufficient balance (${from?.balance} G13C available)`;
    return "";
  };

  useEffect(() => {
    setError(validate());
  }, [fromId, toId, amount, wallets]);

  const handleSend = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    await onSend(fromId, toId, amt, memo.trim());
    setAmount("");
    setMemo("");
  };

  const isValid = !validate() && !mining;

  return (
    <div className="w-full animate-[fade-in_0.4s_ease-out]">
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Form Column */}
        <div className="rounded-xl border border-border bg-panel p-6 shadow-sm">
          <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <span className="text-primary">⚡</span> New Transaction
          </h2>

          <Field label="From Wallet">
            <select
              value={fromId}
              onChange={(e) => setFromId(Number(e.target.value))}
              className="w-full cursor-pointer rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border-hover"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-panel">
                  {w.name} — {w.balance.toLocaleString()} G13C
                </option>
              ))}
            </select>
          </Field>

          <Field label="To Wallet">
            <select
              value={toId}
              onChange={(e) => setToId(Number(e.target.value))}
              className="w-full cursor-pointer rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border-hover"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-panel">
                  {w.name} — {w.address}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Amount (G13C)">
            <input
              type="number"
              min="1"
              max={from?.balance}
              placeholder="e.g. 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border-hover"
            />
          </Field>

          <Field label="Memo (optional)">
            <input
              type="text"
              maxLength={60}
              placeholder="e.g. rent payment, loan repayment..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border-hover"
            />
          </Field>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger-dark bg-danger-dim/40 px-4 py-3 font-mono text-xs text-danger animate-[fade-in_0.2s_ease]">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!isValid}
            className={`mt-2 w-full rounded-lg py-3.5 font-sans text-sm font-bold tracking-wide transition-all shadow-md ${
              isValid
                ? "bg-primary text-white hover:bg-primary-hover hover:shadow-primary/20 hover:-translate-y-0.5 cursor-pointer"
                : "bg-primary-dim text-text-muted cursor-not-allowed opacity-60 border border-primary-faint"
            }`}
          >
            {mining ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Broadcasting & Mining...
              </span>
            ) : (
              "Broadcast Transaction →"
            )}
          </button>
        </div>

        {/* Preview Column */}
        <div className="rounded-xl border border-border bg-panel p-6 shadow-sm h-full flex flex-col">
          <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <span className="text-text-secondary">📄</span> Transaction Preview
          </h2>

          {!from || !to || !amt ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 py-12">
              <span className="mb-3 text-3xl opacity-50">🧾</span>
              <p className="font-mono text-xs text-text-muted">
                Fill the form to generate receipt
              </p>
            </div>
          ) : (
            <div className="flex-1 rounded-lg border border-border bg-card p-5 shadow-inner">
              <Preview
                from={from}
                to={to}
                amt={amt}
                memo={memo}
                valid={!validate()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Preview({ from, to, amt, memo, valid }) {
  const afterFrom = from.balance - amt;
  return (
    <div className="flex flex-col">
      <div className="pb-4 border-b border-dashed border-border mb-4">
        <p className="text-center font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">
          Status
        </p>
        <p
          className={`text-center font-mono text-sm font-bold ${valid ? "text-accent" : "text-danger"}`}
        >
          {valid ? "READY TO BROADCAST" : "INVALID TRANSACTION"}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <Row k="Transaction ID" v={"TX-" + Date.now().toString().slice(-6)} />
        <Row k="From" v={`${from.name} (${from.address.slice(0, 8)}...)`} />
        <Row k="To" v={`${to.name} (${to.address.slice(0, 8)}...)`} />
        <Row
          k="Amount"
          v={`${amt.toLocaleString()} G13C`}
          vClass="text-accent font-bold"
        />
        {memo && <Row k="Memo" v={`"${memo}"`} />}
      </div>

      <div className="my-4 border-b border-dashed border-border" />

      <div className="flex flex-col gap-1">
        <Row
          k={`${from.name} Balance After`}
          v={`${afterFrom.toLocaleString()} G13C`}
          vClass={afterFrom < 0 ? "text-danger" : "text-warning"}
        />
        <Row
          k={`${to.name} Balance After`}
          v={`${(to.balance + amt).toLocaleString()} G13C`}
          vClass="text-accent"
        />
        <Row k="Confirmation" v="Next Mined Block" />
      </div>
    </div>
  );
}

function Row({ k, v, vClass = "" }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="shrink-0 font-mono text-[10px] text-text-muted">
        {k}
      </span>
      <span
        className={`text-right font-mono text-[11px] ${vClass || "text-text"}`}
      >
        {v}
      </span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted pl-1">
        {label}
      </label>
      {children}
    </div>
  );
}
