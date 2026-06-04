import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, metaMask } from "wagmi/connectors";
const arcTestnet = defineChain({
  id: 46630, name: "Robinhood Testnet", nativeCurrency: { name:"ARC", symbol:"ARC", decimals:18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.chain.robinhood.com"] } },
  blockExplorers: { default: { name:"Robinhood Explorer", url:"https://explorer.testnet.chain.robinhood.com" } },
  testnet: true,
});
export const config = createConfig({
  chains: [arcTestnet],
  connectors: [injected(), metaMask()],
  transports: { [arcTestnet.id]: http() },
});