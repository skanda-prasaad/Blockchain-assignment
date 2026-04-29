import { useState } from "react";
import { api } from "../api";

export default function ExplorerTab({
  blocks,
  currentUser,
  refreshGlobalData,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [rawJson, setRawJson] = useState("");
  const [tamperError, setTamperError] = useState("");
  const [editHash, setEditHash] = useState(""); // 🔥 NEW
  const [editPrevHash, setEditPrevHash] = useState(""); // 🔥 NEW

  const handleEditClick = (block, index) => {
    // You cannot edit the Genesis Block (Index 0)
    if (index === 0) return;
    setEditingIndex(index);
    setRawJson(JSON.stringify(block.data, null, 2));
    setTamperError("");
    setEditHash(block.hash); // 🔥 NEW
    setEditPrevHash(block.previousHash || "");
  };
  const handleSaveHack = async (index) => {
    try {
      // Step 1: Make sure your typing is perfect
      let parsedData;
      try {
        parsedData = JSON.parse(rawJson);
      } catch (e) {
        setTamperError(
          "🚨 JSON FORMAT ERROR: You missed a quote, comma, or bracket. It must be perfect JSON!",
        );
        return; // Stop the hack until they fix the typo
      }

      // Step 2: Inject the Hack
      await api.tamper(
        index,
        parsedData,
        currentUser?.name,
        editHash,
        editPrevHash,
      );

      setEditingIndex(null);
      await refreshGlobalData(); // 🔥 This forces the TopBar to turn RED
    } catch (err) {
      setTamperError("Server rejected the connection.");
    }
  };
  // const handleSaveHack = async (index) => {
  //   try {
  //     const parsedData = JSON.parse(rawJson); // Make sure they didn't break the JSON format

  //     const response = await fetch("http://localhost:3001/tamper", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         index: index,
  //         rawData: parsedData,
  //         activeNodeName: currentUser?.name || "Unknown Hacker",
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       // 🔥 THIS IS THE SUCCESS STATE FOR YOUR DEMO! The system caught the hack.
  //       setTamperError(result.error);
  //       await refreshGlobalData(); // Refresh to pull the new Admin Logs
  //     } else {
  //       setEditingIndex(null);
  //       await refreshGlobalData();
  //     }
  //   } catch (err) {
  //     setTamperError(
  //       "Invalid JSON structure. Please check your brackets and commas.",
  //     );
  //   }
  // };

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
          🔍 Global Ledger Explorer
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-panel p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-4">
              <span className="font-mono text-lg font-bold text-accent">
                Block #{block.index}
              </span>
              <span className="font-mono text-xs text-text-muted">
                {block.timestamp}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 font-mono text-xs md:grid-cols-2">
              <div className="truncate">
                <span className="block text-[10px] uppercase text-text-muted">
                  Block Hash
                </span>
                <span className="text-primary">{block.hash}</span>
              </div>
              <div className="truncate">
                <span className="block text-[10px] uppercase text-text-muted">
                  Previous Hash
                </span>
                <span className="text-text-secondary">
                  {block.previousHash || "0".repeat(64)}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase text-text-muted font-bold">
                  Block Payload (Data)
                </span>
                {index !== 0 && editingIndex !== index && (
                  <button
                    onClick={() => handleEditClick(block, index)}
                    className="text-[10px] text-danger hover:text-danger-dark uppercase font-bold px-2 py-1 border border-danger/30 rounded bg-danger/10 transition-colors"
                  >
                    🛠️ Edit Raw Data
                  </button>
                )}
              </div>

              {/* THE HACKER TEXTBOX */}
              {editingIndex === index ? (
                <div className="mt-2 flex flex-col gap-3 animate-[fade-in_0.2s_ease-out]">
                  {/* 🔥 NEW: Hash Editing Fields */}
                  <div className="flex flex-col gap-2 bg-[#121212] p-3 rounded border border-danger/30">
                    <div>
                      <label className="text-[10px] text-danger-light font-bold uppercase mb-1 block">
                        Spoof Block Hash:
                      </label>
                      <input
                        type="text"
                        value={editHash}
                        onChange={(e) => setEditHash(e.target.value)}
                        className="w-full bg-[#1e1e1e] text-primary border border-border rounded p-2 text-xs font-mono outline-none focus:border-danger"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-danger-light font-bold uppercase mb-1 block">
                        Spoof Previous Hash:
                      </label>
                      <input
                        type="text"
                        value={editPrevHash}
                        onChange={(e) => setEditPrevHash(e.target.value)}
                        className="w-full bg-[#1e1e1e] text-text-secondary border border-border rounded p-2 text-xs font-mono outline-none focus:border-danger"
                      />
                    </div>
                  </div>

                  <textarea
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    className="w-full h-32 rounded border border-danger/50 bg-[#1e1e1e] p-3 font-mono text-xs text-green-400 outline-none focus:border-danger"
                  />

                  {tamperError && (
                    <div className="rounded border border-danger bg-danger/20 p-2 text-danger font-bold text-center animate-pulse">
                      🚨 {tamperError}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="rounded bg-card border border-border px-4 py-2 font-bold hover:bg-border transition-colors text-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveHack(index)}
                      className="rounded bg-danger px-4 py-2 font-bold text-white shadow hover:bg-danger-dark transition-colors"
                    >
                      Inject Tampered Data & Hashes
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="overflow-x-auto text-text-secondary text-xs p-2">
                  {JSON.stringify(block.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
