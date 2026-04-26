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
  getBlocks: () => req("GET", "/blocks"),
  getWallets: () => req("GET", "/wallets"),
  getStats: () => req("GET", "/stats"),
  validate: () => req("GET", "/validate"),
  mine: (fromId, toId, amount, memo) =>
    req("POST", "/mine", { fromId, toId, amount, memo }),
  tamper: (index, attackType) => req("POST", "/tamper", { index, attackType }),
  restore: () => req("POST", "/restore"),
  reset: () => req("POST", "/reset"),

  // 🔥 NEW: Dynamic wallet deployment endpoint
  addWallet: (name) => req("POST", "/wallets", { name }),
};
