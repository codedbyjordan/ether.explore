import express from "express";
import path from "path";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import { provider, etherscanProvider } from "./providers.js";
import { getEtherAmount } from "./utils/getEtherAmount.js";
import dotenv from "dotenv";
dotenv.config();

let __dirname = new URL(".", import.meta.url).pathname;
if (process.platform == "win32") __dirname = __dirname.replace("/", "");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/tx/:id", async (req, res) => {
  let txInfo = {};

  try {
    const tx = await provider.getTransaction(req.params.id);
    let etherPrice = await etherscanProvider.getEtherPrice();
    txInfo = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      blockHash: tx.blockHash,
      blockNum: tx.blockNumber,
      gasPrice: getEtherAmount(tx.gasPrice._hex),
      value: getEtherAmount(tx.value._hex),
      transactionFee: getEtherAmount(tx.gasPrice._hex * tx.gasLimit._hex),
      etherPrice,
      confirmations: tx.confirmations,
    };
  } catch (e) {
    txInfo = { error: "Invalid hash" };
  }
  res.render("tx", { txInfo });
});

app.get("/block/:num", async (req, res) => {
  let blockInfo = {};

  try {
    const block = await provider.getBlock(Number(req.params.num));

    const date = new Date(block.timestamp * 1000).toLocaleString();

    blockInfo = {
      hash: block.hash,
      parentHash: block.parentHash,
      difficulty: Number(block.difficulty).toLocaleString(),
      date,
      transactions: [...block.transactions],
      num: block.num,
      nonce: block.nonce,
      miner: block.miner,
    };
  } catch (e) {
    blockInfo = {
      error: "Invalid block number/hash",
    };
  }
  res.render("block", { blockInfo });
});

app.get("/address/:addr", async (req, res) => {
  const address = req.params.addr;
  let addrInfo = {};
  try {
    let balance = await provider.getBalance(address);
    balance = Number(getEtherAmount(balance));
    const transactionCount = await provider.getTransactionCount(address);
    const etherPrice = await etherscanProvider.getEtherPrice();

    addrInfo = {
      address,
      balance: balance.toFixed(2),
      balanceUsd: (balance * etherPrice).toLocaleString(),
      transactionCount,
    };
  } catch (e) {
    console.log(e);
    addrInfo = { error: "Invalid address" };
  }
  res.render("address", { addrInfo });
});

wss.on("connection", async (socket) => {
  let blockNum = await provider.getBlockNumber();
  let price = await etherscanProvider.getEtherPrice();

  socket.send(JSON.stringify({ blockNum, price }));

  provider.on("block", (blockNum) => {
    etherscanProvider.getEtherPrice().then((newPrice) => {
      price = newPrice;
      socket.send(JSON.stringify({ blockNum, price, prevPrice: price }));
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`The application started on port ${server.address().port}`);
});
