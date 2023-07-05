import React, { useEffect, useState } from "react";

const { ethers, BigNumber, utils } = require("ethers");

const { WrapperBuilder } = require("@redstone-finance/evm-connector");

//import { getTokenBalance } from "../helpers/ERC20Helper";

const abi = [
    "function getLatestEthPrice() view returns (uint256)"
];

const RAPID_EXAMPLE_ADDRESS = "0x402CdcE5F1f4e85b37264EcAc1F35aCF40E609f5";
const ZK_SYNC_TESTNET_RPC = "https://testnet.era.zksync.dev";

const provider = new ethers.providers.StaticJsonRpcProvider(ZK_SYNC_TESTNET_RPC);

const contract = new ethers.Contract(RAPID_EXAMPLE_ADDRESS, abi, provider);

const wrappedContract = WrapperBuilder.wrap(contract).usingDataService(
  {
    dataServiceId: "redstone-main-demo",
    uniqueSignersCount: 1,
    dataFeeds: ["ETH"],
  },
  //["https://d33trozg86ya9x.cloudfront.net"]
);

export default function RedStone({}) {
    console.log("contract", contract);

    const [balance, setBalance] = useState(null);

    useEffect(() => {
        async function getBalance() {
            const ethPrice = await wrappedContract.getLatestEthPrice();
        }

        getBalance();
    }, [])

    return (
        <div>
            RedStone
        </div>
    );
}
