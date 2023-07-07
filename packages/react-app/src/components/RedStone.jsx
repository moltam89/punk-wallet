import React, { useEffect, useState } from "react";

import { Provider, Contract } from "zksync-web3";

const { ethers, BigNumber, utils } = require("ethers");

const { WrapperBuilder } = require("@redstone-finance/evm-connector");

const abi = [
    "function getLatestEthPrice() view returns (uint256)",
    "function getLatestUSDCPrice() view returns (uint256)"
];

//const RAPID_EXAMPLE_ADDRESS = "0x402CdcE5F1f4e85b37264EcAc1F35aCF40E609f5";
const RAPID_EXAMPLE_ADDRESS = "0x717CE2Df7fc98792852fb6d45Cd4Cb165a5D159e";
const GET_ORACLE_PRICE_ADDRESS = "0xeD1894b58500e55e95A86fB0FCa8964Bd8799017";


const ZK_SYNC_TESTNET_RPC = "https://testnet.era.zksync.dev";

const provider = new ethers.providers.StaticJsonRpcProvider(ZK_SYNC_TESTNET_RPC);
//const provider = new Provider(ZK_SYNC_TESTNET_RPC);

const contract = new Contract(RAPID_EXAMPLE_ADDRESS, abi, provider);

const wrappedContract = WrapperBuilder.wrap(contract).usingDataService(
  {
    dataServiceId: "redstone-rapid-demo",
    uniqueSignersCount: 1,
    dataFeeds: ["ETH", "USDC"],
  },
  ["https://d33trozg86ya9x.cloudfront.net"]
);

const oracleContract = new Contract(GET_ORACLE_PRICE_ADDRESS, abi, provider);

const oracleWrappedContract = WrapperBuilder.wrap(contract).usingDataService(
  {
    dataServiceId: "redstone-rapid-demo",
    uniqueSignersCount: 1,
    dataFeeds: ["ETH", "USDC"],
  },
  ["https://d33trozg86ya9x.cloudfront.net"]
);

export default function RedStone({}) {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        async function getETHPrice() {
            const ethPrice = await wrappedContract.getLatestEthPrice();

            console.log("ethPrice", ethPrice);
        }
        async function getUSDCPrice() {
            const USDCPrice = await wrappedContract.getLatestUSDCPrice();

            console.log("USDCPrice", USDCPrice);
        }

        async function getOracleUSDCPrice() {
            const USDCPrice = await oracleWrappedContract.getLatestUSDCPrice();

            console.log("USDCPrice", USDCPrice);
        }

        getETHPrice();
        getUSDCPrice();
        getOracleUSDCPrice();
    }, [])

    return (
        <div>
            RedStone
        </div>
    );
}
