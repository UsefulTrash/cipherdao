require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEED_PHRASE =
  process.env.SEED_PHRASE ||
  "test test test test test test test test test test test junk";

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.28", settings: { optimizer: { enabled: true, runs: 200 } } },
      { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
    ],
  },
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    robinhoodTestnet: {
      url: "https://rpc.testnet.chain.robinhood.com",
      chainId: 46630,
      accounts: {
        mnemonic: SEED_PHRASE,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 1,
      },
    },
  },
};
