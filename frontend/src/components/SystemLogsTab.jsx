export default function SystemLogsTab({ txHistory }) {
  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-primary flex items-center justify-between">
        <span>🌐 Global Network Ledger</span>
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded">
          ALL TRANSACTIONS
        </span>
      </h2>

      <div className="rounded-xl border border-border bg-panel overflow-hidden shadow-lg">
        {txHistory.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-text-muted">
            No transactions have been recorded on the network yet.
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-card border-b border-border/50 text-text-muted">
              <tr>
                <th className="p-4 font-normal">TxID</th>
                <th className="p-4 font-normal">Timestamp</th>
                <th className="p-4 font-normal">Sender</th>
                <th className="p-4 font-normal">Receiver</th>
                <th className="p-4 font-normal text-right">Amount</th>
                <th className="p-4 font-normal text-right">Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {txHistory.map((tx, i) => (
                <tr key={i} className="hover:bg-bg/50 transition-colors">
                  <td className="p-4 text-text-secondary">
                    {tx.txId || "GENESIS"}
                  </td>
                  <td className="p-4 text-text-muted">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-4 text-danger-light font-bold">
                    {tx.sender || "System"}
                  </td>
                  <td className="p-4 text-green-400 font-bold">
                    {tx.receiver || "Network"}
                  </td>
                  <td className="p-4 text-right font-bold text-primary">
                    {tx.amount ? `${tx.amount} G13C` : "-"}
                  </td>
                  <td className="p-4 text-right text-text-muted">
                    #{tx.blockIndex}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
