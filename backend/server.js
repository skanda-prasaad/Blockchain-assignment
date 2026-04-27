const express = require("express");
const cors = require("cors");
const Block = require("./block");
const Blockchain = require("./blockchain");
const WalletManager = require("./wallets");

const app = express();
app.use(express.json());
app.use(cors());

const chain = new Blockchain();
const wallets = new WalletManager();

const originalBlockData = new Map();

console.log("\n🚀 G13Coin Blockchain Server starting...");
console.log(`  Genesis block mined. Chain initialized.\n`);

app.get("/blocks", (req, res) => {
  res.json(chain.chain);
});

app.get("/stats", (req, res) => {
  res.json(chain.getStats());
});


app.get("/wallets", (req, res) => {
  res.json(wallets.getAll());
});


app.get("/validate", (req, res) => {
  res.json(chain.isChainValid());
});

app.post("/mine", (req, res) => {
  const { fromId, toId, amount, memo } = req.body;

  if (fromId === undefined || toId === undefined || !amount) {
    return res.status(400).json({ error: "Missing fromId, toId, or amount" });
  }

  const from = wallets.getById(fromId);
  const to = wallets.getById(toId);
  if (!from || !to)
    return res.status(400).json({ error: "Invalid wallet IDs" });

  const transfer = wallets.transfer(fromId, toId, amount);
  if (!transfer.success) return res.status(400).json({ error: transfer.error });

  const txData = {
    type: "transfer",
    txId: "TX" + Date.now(),
    sender: from.name,
    senderAddr: from.address,
    senderId: fromId,
    receiver: to.name,
    receiverAddr: to.address,
    receiverId: toId,
    amount: amount,
    memo: memo || null,
    timestamp: new Date().toISOString(),
  };

  console.log(`⛏️  Mining: ${from.name} → ${to.name} | ${amount} G13C`);
  const newBlock = chain.addBlock(
    new Block(chain.chain.length, new Date().toISOString(), txData),
  );

  originalBlockData.set(newBlock.index, JSON.parse(JSON.stringify(txData)));

  res.json({
    message: "Block mined successfully",
    block: newBlock,
    wallets: wallets.getAll(),
    validity: chain.isChainValid(),
  });
});

app.post("/tamper", (req, res) => {
  const { index, attackType } = req.body;
  const block = chain.chain[index];

  if (!block || index === 0) {
    return res.status(400).json({ error: "Invalid block index" });
  }
  if (block.data.type !== "transfer") {
    return res
      .status(400)
      .json({ error: "Can only tamper with transfer blocks" });
  }

  const orig = JSON.parse(JSON.stringify(block.data));

  if (attackType === "amount") {
    block.data.amount = 999999;
  } else if (attackType === "receiver") {
    block.data.receiver = "Eve (HACKER)";
    block.data.receiverAddr = "0xH4ck3r...0000";
  } else if (attackType === "wipe") {
    block.data.amount = 0;
    block.data.memo = "[DATA WIPED BY ATTACKER]";
  }

  block.tampered = true;
  console.log(`🚨 TAMPER: Block #${index} attacked — type: ${attackType}`);

  res.json({
    message: `Block #${index} tampered (${attackType})`,
    block: block,
    originalData: orig,
    validity: chain.isChainValid(),
  });
});

app.post("/restore", (req, res) => {
  let restored = 0;
  chain.chain.forEach((block, i) => {
    if (block.tampered && originalBlockData.has(i)) {
      block.data = JSON.parse(JSON.stringify(originalBlockData.get(i)));
      block.tampered = false;
      restored++;
    }
  });
  console.log(`✅ Chain restored — ${restored} block(s) fixed`);
  res.json({
    message: `Restored ${restored} block(s)`,
    validity: chain.isChainValid(),
    wallets: wallets.getAll(),
  });
});

app.post("/reset", (req, res) => {
  chain.chain = [chain._createGenesisBlock()];
  wallets.reset();
  originalBlockData.clear();
  console.log("🔄 Full reset — new genesis block mined");
  res.json({
    message: "Blockchain and wallets reset",
    wallets: wallets.getAll(),
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API live at http://localhost:${PORT}`);
  console.log(`   Endpoints: GET /blocks /stats /wallets /validate`);
  console.log(`              POST /mine /tamper /restore /reset\n`);
});
