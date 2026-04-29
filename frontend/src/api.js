const BASE = "http://localhost:3001";

const req = async (method, path, body) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

export const api = {
  // Standard Network Calls
  getLogs: () => req("GET", "/logs"),
  banNode: (nodeId) => req("POST", "/ban", { nodeId }),
  getBlocks: () => req("GET", "/blocks"),
  getWallets: () => req("GET", "/wallets"),
  getStats: () => req("GET", "/stats"),
  validate: () => req("GET", "/validate"),

  // The Trap / Hacker Routes
  tamper: (index, rawData, activeNodeName, newHash, newPrevHash) => 
    req("POST", "/tamper", { index, rawData, activeNodeName, newHash, newPrevHash }),

  // System Controls
  reset: () => req("POST", "/reset"),
  addWallet: (name) => req("POST", "/wallets", { name }),

  // 🔥 NEW: The Mempool & Mining Routes
  getPending: () => req("GET", "/pending"),
  sendTransaction: (data) => req("POST", "/transaction", data),
  minePending: () => req("POST", "/mine"),
};
