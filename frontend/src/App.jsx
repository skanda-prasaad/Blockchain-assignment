import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import TopBar from "./components/TopBar";
import WalletsTab from "./components/WalletsTab";
import SendTab from "./components/SendTab";
import ExplorerTab from "./components/ExplorerTab";
import SecurityTab from "./components/SecurityTab";
import Login from "./components/Login";
import SystemLogsTab from "./components/SystemLogsTab";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // 🔥 State for Login
  const [tab, setTab] = useState("Wallets");
  const [chain, setChain] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [stats, setStats] = useState({});
  const [validity, setValidity] = useState({ valid: true });
  const [txHistory, setTxHistory] = useState([]);
  const [mining, setMining] = useState(false);
  const [error, setError] = useState("");

const refresh = useCallback(async () => {
    try {
      const [blocks, ws, st, v] = await Promise.all([
        api.getBlocks(),
        api.getWallets(),
        api.getStats(),
        api.validate(),
      ]);
      setChain(blocks);
      setWallets(ws);
      setStats(st);
      setValidity(v);

      // 🔥 BULLETPROOF EXTRACTOR: Grabs everything, even if hacked!
      let allTxs = [];
      blocks.forEach((b) => {
        if (Array.isArray(b.data)) {
          b.data.forEach((tx) => {
            // As long as there is a sender, count it as a transaction
            if (tx.sender) allTxs.push({ ...tx, blockIndex: b.index });
          });
        } else if (typeof b.data === "object" && b.data !== null && b.data.sender) {
          allTxs.push({ ...b.data, blockIndex: b.index });
        }
      });
      setTxHistory(allTxs.reverse());
    } catch {
      setError("Cannot connect to backend. Make sure server is running.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSend = async (fromId, toId, amount, memo) => {
    setMining(true);
    setError("");
    try {
      await api.mine(fromId, toId, amount, memo);
      await refresh();
    } catch {
      setError("Mining failed. Check the server console.");
    }
    setMining(false);
  };

  const handleTamper = async (index, attackType) => {
    const result = await api.tamper(index, attackType);
    await refresh();
    return result;
  };

  const handleRestore = async () => {
    await api.restore();
    await refresh();
  };

  const handleReset = async () => {
    await api.reset();
    setTxHistory([]);
    setCurrentUser(null); // Kicks you back to login screen on reset
    await refresh();
  };

  const handleAddWallet = async (name) => {
    try {
      await api.addWallet(name);
      await refresh();
    } catch {
      setError("Failed to deploy new node.");
    }
  };

  // 🔥 BRICK 1: The Doorway Logic
  return (
    <>
      {!currentUser ? (
        // If NO user is logged in, show this:
        <Login wallets={wallets} onLogin={setCurrentUser} />
      ) : (
        // If a user IS logged in, show the app:
        <div className="min-h-screen bg-bg text-text flex flex-col font-sans antialiased">
          <div className="grow flex flex-col w-full max-w-7xl mx-auto px-4 py-4">
            <TopBar
              stats={stats}
              validity={validity}
              wallets={wallets}
              activeTab={tab}
              onTabChange={setTab}
              mining={mining}
              currentUser={currentUser}
            />

            {error && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-danger-dark bg-danger-dim px-4 py-3 font-mono text-xs text-danger">
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="ml-4 cursor-pointer border-none bg-transparent text-base text-danger hover:text-danger/70"
                >
                  ✕
                </button>
              </div>
            )}

            <main className="grow mt-6">
              {chain.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted">
                  <div className="mb-3 text-3xl">⛏</div>
                  <p className="font-mono text-sm">
                    Connecting to blockchain...
                  </p>
                </div>
              ) : (
                <>
                  {tab === "Wallets" && (
                    <WalletsTab wallets={wallets} txHistory={txHistory} />
                  )}
                  {tab === "Send" && (
                    <SendTab
                      wallets={wallets}
                      refreshGlobalData={refresh}
                      currentUser={currentUser} // 🔥 Now uses real logged in user
                    />
                  )}
                  {tab === "Explorer" && (
                    <ExplorerTab
                      blocks={chain}
                      currentUser={currentUser} // 🔥 Now uses real logged in user
                      refreshGlobalData={refresh}
                    />
                  )}
                  {tab === "Security" && (
                    <SecurityTab
                  chain={chain}
                  validity={validity}
                  wallets={wallets}           // 🔥 FIX: Passed wallets for the Ban list!
                  refreshGlobalData={refresh} // 🔥 FIX: Passed refresh so it can update!
                />
                  )}
                  {tab === "System Logs" && (
                    <SystemLogsTab txHistory={txHistory} />
                  )}
                </>
                
              )}
            </main>
          </div>

          <footer className="w-full border-t border-border px-5 py-5 text-center bg-bg">
            <button
              onClick={handleReset}
              className="mt-2 cursor-pointer rounded border border-border bg-transparent px-3 py-1 font-mono text-[10px] text-text-muted transition-colors hover:border-border-hover hover:text-text-secondary"
            >
              Reset Chain & Logout
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
