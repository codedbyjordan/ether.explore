import dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";

export const provider = new ethers.providers.WebSocketProvider(
  `wss://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
);

export const etherscanProvider = new ethers.providers.EtherscanProvider(
  "homestead",
  process.env.ETHERSCAN_KEY
);
