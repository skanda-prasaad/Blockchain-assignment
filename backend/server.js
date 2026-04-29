const express = require("express");
const cors = require("cors");
const Block = require("./block");
const Blockchain = require("./blockchain");
const WalletManager = require("./wallets");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

// ─── CORE STATE (IN-MEMORY) ───────────────────────────────────────────────────
const chain = new Blockchain();
const wallets = new WalletManager();

// 🔥 BRICK 1 FIXES: The Mempool and The Admin Logs
let pendingTransactions = [];
let adminLogs = [];
let blockedNodes = [];

console.log("\n🚀 G13Coin Protocol Simulator starting...");
console.log(`✅ Genesis block mined. Network ready.\n`);

// ─── STANDARD GET ROUTES ──────────────────────────────────────────────────────
app.get("/blocks", (req, res) => res.json(chain.chain));
app.get("/stats", (req, res) => res.json(chain.getStats()));
app.get("/wallets", (req, res) => res.json(wallets.getAll()));
app.get("/validate", (req, res) => {
  for (let i = 1; i < chain.chain.length; i++) {
    const currentBlock = chain.chain[i];
    const previousBlock = chain.chain[i - 1];

    // The system recalculates what the hash SHOULD be based on the current data
    const hashString =
      currentBlock.index +
      currentBlock.timestamp +
      JSON.stringify(currentBlock.data) +
      currentBlock.previousHash +
      currentBlock.nonce;
    const recalculatedHash = crypto
      .createHash("sha256")
      .update(hashString)
      .digest("hex");

    // Compare the locked hash with the newly calculated hash
    if (currentBlock.hash !== recalculatedHash) {
      return res.json({
        valid: false,
        brokenBlockIndex: currentBlock.index,
        storedHash: currentBlock.hash,
        actualCalculatedHash: recalculatedHash,
        reason: "Data Alteration Detected",
      });
    }

    // Check if the chain links are broken
    if (currentBlock.previousHash !== previousBlock.hash) {
      return res.json({ valid: false, reason: "Chain Link Broken" });
    }
  }
  return res.json({ valid: true });
});

// NEW: Endpoints for the frontend to read the mempool and logs
app.get("/pending", (req, res) => res.json(pendingTransactions));
app.get("/logs", (req, res) => res.json(adminLogs));

// ─── POST /transaction (THE MEMPOOL) ──────────────────────────────────────────
// Replaces the old instant-mine. Now it just waits in the pool.
app.post("/transaction", (req, res) => {
  const { fromId, toId, amount, memo } = req.body;
  if (blockedNodes.includes(fromId)) {
    return res.status(403).json({
      error: "Your node has been banned by the Network Administrator.",
    });
  }
  if (fromId === undefined || toId === undefined || !amount) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const from = wallets.getById(fromId);
  const to = wallets.getById(toId);
  if (!from || !to) return res.status(400).json({ error: "Invalid Node IDs" });

  // Validate balances before adding to mempool
  const transfer = wallets.transfer(fromId, toId, amount);
  if (!transfer.success) return res.status(400).json({ error: transfer.error });

  const txData = {
    type: "transfer",
    txId: "TX-" + Math.floor(Math.random() * 1000000),
    sender: from.name,
    receiver: to.name,
    amount: amount,
    memo: memo || "Standard Transfer",
    timestamp: new Date().toISOString(),
  };

  pendingTransactions.push(txData);
  console.log(`⏳ Mempool: Transaction added (${from.name} -> ${to.name})`);

  res.json({
    message: "Added to pending pool",
    pendingTransactions,
    wallets: wallets.getAll(),
  });
});
app.post("/ban", (req, res) => {
  const { nodeId } = req.body;
  if (!blockedNodes.includes(nodeId)) {
    blockedNodes.push(nodeId);
  }
  const nodeName = wallets.getById(nodeId)?.name || "Unknown";
  adminLogs.unshift({
    id: Date.now(),
    message: `CRITICAL: Node '${nodeName}' has been permanently banned from the network.`,
    type: "danger",
  });
  res.json({ message: "Node banned successfully" });
});

// ─── POST /mine (THE SYSTEM MINER) ────────────────────────────────────────────
// Takes everything in the mempool, hashes it, and clears the pool.
app.post("/mine", (req, res) => {
  if (pendingTransactions.length === 0) {
    return res.status(400).json({ error: "No pending transactions to mine." });
  }

  console.log(
    `⛏️  System executing Proof of Work on ${pendingTransactions.length} transaction(s)...`,
  );

  // Create a block with the entire array of pending transactions
  const newBlock = new Block(chain.chain.length, new Date().toISOString(), [
    ...pendingTransactions,
  ]);
  chain.addBlock(newBlock);

  // Clear the mempool now that it's mined
  pendingTransactions = [];

  res.json({
    message: "Block successfully mined and hashed",
    block: newBlock,
    validity: chain.isChainValid(),
  });
});

// ─── POST /tamper (THE PROFESSOR'S TRAP) ──────────────────────────────────────
// This intercepts manual raw data edits. If the hash breaks, it alerts the admin.
app.post("/tamper", (req, res) => {
  const { index, rawData, activeNodeName, newHash, newPrevHash } = req.body;
  const block = chain.chain[index];

  if (!block || index === 0)
    return res.status(400).json({ error: "Cannot tamper Genesis Block" });

  // 🔥 THE ULTIMATE HACK: Allow them to change Data AND Hashes!
  block.data = rawData;
  if (newHash) block.hash = newHash;
  if (newPrevHash) block.previousHash = newPrevHash;

  adminLogs.unshift({
    id: Date.now(),
    message: `CRITICAL: Node '${activeNodeName || "Unknown"}' altered Block #${index} (Data/Hashes manipulated). Chain integrity compromised.`,
    type: "danger",
  });

  res.json({ message: "Block altered. Network state corrupted." });
});
// app.post("/tamper", (req, res) => {
//   const { index, rawData, activeNodeName } = req.body;
//   const block = chain.chain[index];

//   if (!block || index === 0)
//     return res
//       .status(400)
//       .json({ error: "Cannot tamper Genesis or Invalid Block" });

//   // 1. Simulate what the hash WOULD be with this new tampered data
//   const testHashString =
//     block.index +
//     block.timestamp +
//     JSON.stringify(rawData) +
//     block.previousHash +
//     block.nonce;
//   const crypto = require("crypto");
//   const manipulatedHash = crypto
//     .createHash("sha256")
//     .update(testHashString)
//     .digest("hex");

//   // 2. Check it against the original locked hash
//   if (manipulatedHash !== block.hash) {
//     const time = new Date().toLocaleTimeString();
//     const alertMsg = `[${time}] CRITICAL: Node '${activeNodeName || "Unknown"}' attempted to alter payload in Block #${index}. Hash mismatch caught. Block rejected.`;

//     // Push to the admin's inbox
//     adminLogs.unshift({ id: Date.now(), message: alertMsg, type: "danger" });
//     console.log(`🚨 INTRUSION CAUGHT: ${alertMsg}`);

//     return res.status(403).json({
//       error: "Hash mismatch detected. Payload alteration rejected.",
//       logs: adminLogs,
//     });
//   }

//   // If someone literally guesses a valid SHA-256 hash collision (impossible), let it through
//   block.data = rawData;
//   res.json({
//     message: "Data successfully tampered (Warning: Chain may be invalid)",
//     block: block,
//   });
// });

// ─── POST /reset ──────────────────────────────────────────────────────────────
app.post("/reset", (req, res) => {
  chain.chain = [chain._createGenesisBlock()];
  wallets.reset();
  pendingTransactions = [];
  adminLogs = [];
  console.log("🔄 Network Reset. Genesis State restored.");
  res.json({ message: "Network Reset", wallets: wallets.getAll() });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ G13Coin Protocol live at http://localhost:${PORT}\n`);
});
