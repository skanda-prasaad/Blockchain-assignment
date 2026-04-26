const Block = require("./block");

class Blockchain {
  constructor() {
    this.difficulty = 2;
    this.chain = [this._createGenesisBlock()];
  }

  _createGenesisBlock() {
    const block = new Block(
      0,
      new Date().toISOString(),
      {
        type: "genesis",
        message: "G13Coin Genesis Block — Blockchain Assignment",
      },
      "0000000000000000000000000000000000000000000000000000000000000000",
    );
    block.mineBlock(this.difficulty);
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) {
        return { valid: false, brokenAt: i, reason: "hash_mismatch" };
      }
      if (current.previousHash !== previous.hash) {
        return { valid: false, brokenAt: i, reason: "link_broken" };
      }
    }
    return { valid: true, brokenAt: null, reason: null };
  }

  tamperBlock(index, newData) {
    if (index <= 0 || index >= this.chain.length) return false;
    this.chain[index].data = newData;
    return true;
  }

  restoreBlock(index, originalData) {
    if (index <= 0 || index >= this.chain.length) return false;
    this.chain[index].data = originalData;
    return true;
  }

  getStats() {
    const transfers = this.chain.filter((b) => b.data.type === "transfer");
    return {
      totalBlocks: this.chain.length,
      totalTransactions: transfers.length,
      totalVolume: transfers.reduce((s, b) => s + (b.data.amount || 0), 0),
      difficulty: this.difficulty,
    };
  }
}

module.exports = Blockchain;
