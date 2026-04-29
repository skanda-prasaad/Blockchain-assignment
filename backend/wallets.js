const INITIAL_WALLETS = [
  // 🔥 THE NEW ADMIN NODE
  {
    id: 0,
    name: "Admin-Console-0",
    address: "0x00000000...0000",
    balance: "N/A",
    color: "#ff5555",
    bg: "#3a0a0a",
  },
  {
    id: 1,
    name: "Skanda",
    address: "0xA1c3f4B2...f8e2",
    balance: 1000,
    color: "#7f77dd",
    bg: "#26215c",
  },
  {
    id: 2,
    name: "Smithi",
    address: "0xB0b2c9D1...a3d1",
    balance: 750,
    color: "#5dcaa5",
    bg: "#04342c",
  },
  {
    id: 3,
    name: "Siddarth",
    address: "0xC4a7e3F9...b912",
    balance: 500,
    color: "#f0997b",
    bg: "#4a1b0c",
  },
  {
    id: 4,
    name: "Sairaj",
    address: "0xD1a5b8C6...c6e0",
    balance: 1250,
    color: "#ef9f27",
    bg: "#412402",
  },
  {
    id: 5,
    name: "Susheep",
    address: "0xE9b3d2A7...d2f7",
    balance: 600,
    color: "#85b7eb",
    bg: "#042c53",
  },
  {
    id: 6,
    name: "Ram",
    address: "0xF7d1e5B4...e5a4",
    balance: 900,
    color: "#97c459",
    bg: "#173404",
  },
];

class WalletManager {
  constructor() {
    this.wallets = INITIAL_WALLETS.map((w) => ({ ...w }));
  }

  getAll() {
    return this.wallets;
  }

  getById(id) {
    return this.wallets.find((w) => w.id === id);
  }

  transfer(fromId, toId, amount) {
    const from = this.getById(fromId);
    const to = this.getById(toId);
    if (!from || !to) return { success: false, error: "Wallet not found" };
    if (fromId === toId)
      return { success: false, error: "Cannot send to yourself" };
    if (amount <= 0)
      return { success: false, error: "Amount must be positive" };
    if (from.balance < amount)
      return { success: false, error: "Insufficient balance" };
    from.balance -= amount;
    to.balance += amount;
    return { success: true };
  }

  reverseTransfer(fromId, toId, amount) {
    const from = this.getById(fromId);
    const to = this.getById(toId);
    if (!from || !to) return;
    from.balance += amount;
    to.balance -= amount;
  }

  reset() {
    this.wallets = INITIAL_WALLETS.map((w) => ({ ...w }));
  }
}

module.exports = WalletManager;
