import { hexlify } from "@ethersproject/bytes";
import { parseUnits } from "@ethersproject/units";
import { notification } from "antd";
import Notify from "bnc-notify";
import { BLOCKNATIVE_DAPPID } from "../constants";
import { TransactionManager } from "./TransactionManager";
import { Wallet, Contract, utils, Provider } from "zksync-web3";

const { ethers } = require("ethers");

const ERC20ABI = '[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]';

const buidlTokenAddress = "0x1426BB23Ad8F7029618Cab37E39202a4B434508a";
const paymasterAddress = "0xBcC8D0FE2549a0078d8295a4e4B08b2B0a126963";

const randomBuidlTokenHolderAddress = "0x1A334C5F407b468c73aB40481f1D3c1AD535FBB5";
const randomBuidlTokenHolderPrivateKey = "0x19517dbcdbdf28f52e8a8da0eb62e79b0631818efe6bf75cc4a66f0505082531";

const buidlTokenHolderAddress = "0x62c21EDc94f2ac82072e0b17e7890320F8E68bB2";
const buidlTokenHolderPrivateKey = "0xca89244353d38d33bc8146a1832a8d0005c6a8a4da448ddce327622ed68c4483";

//const vendorAddresses =["0x2d4BBCc282Ea9167D1d24Df9B92227f7B2C060A8", "0x0dc01C03207fB73937B4aC88d840fBBB32e8026d"];
const vendorAddresses =["0x2d4BBCc282Ea9167D1d24Df9B92227f7B2C060A8"];



// this should probably just be renamed to "notifier"
// it is basically just a wrapper around BlockNative's wonderful Notify.js
// https://docs.blocknative.com/notify

export default function Transactor(provider, gasPrice, etherscan, injectedProvider) {
  if (typeof provider !== "undefined") {
    // eslint-disable-next-line consistent-return
    return async tx => {
      console.log("to, amount", tx.to, Number(ethers.utils.formatEther(tx.value)) * 100);
      //return;

      const signer = injectedProvider.getSigner();
      const network = await provider.getNetwork();

      //const zksyncProvider = new Provider("https://zksync2-testnet.zksync.dev");
      //signer = signer.connect(zksyncProvider);
      //const wallet = new Wallet(provider);
      //wallet = wallet.connect(provider);

      //const wallet = new Wallet(signer);
      //wallet = wallet.connect(provider);

      const buidlTokenContract = new Contract(buidlTokenAddress, ERC20ABI, signer);

      const paymasterParams =
          utils.getPaymasterParams(
              paymasterAddress,
              {
                  type: "General",
                  innerInput: new Uint8Array(),
              }
      );

      console.log("paymasterParams", paymasterParams);    

      try {
         const receipt =      await (
            await buidlTokenContract.transfer(tx.to, Number(ethers.utils.formatEther(tx.value)) * 100, { 
              // paymaster info
              customData: {
                paymasterParams,
                ergsPerPubdata: ethers.BigNumber.from(utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT).toHexString(),
              },
            })
        ).wait();

       console.log("receipt", receipt);
      }
      catch (error) {
        console.log("Something ent wrong", error);
      }

    

      return;

      console.log("network", network);
      const options = {
        dappId: BLOCKNATIVE_DAPPID, // GET YOUR OWN KEY AT https://account.blocknative.com
        system: "ethereum",
        networkId: network.chainId,
        // darkMode: Boolean, // (default: false)
        transactionHandler: txInformation => {
          console.log("HANDLE TX", txInformation);
        },
      };
      const notify = Notify(options);

      let etherscanNetwork = "";
      if (network.name && network.chainId > 1) {
        etherscanNetwork = network.name + ".";
      }

      let etherscanTxUrl = "https://" + etherscanNetwork + "etherscan.io/tx/";
      if (network.chainId === 100) {
        etherscanTxUrl = "https://blockscout.com/poa/xdai/tx/";
      }

      try {
        let result;
        if (tx instanceof Promise) {
          console.log("AWAITING TX", tx);
          result = await tx;
        } else {
          //if (!tx.gasPrice) {
          //  tx.gasPrice = gasPrice || parseUnits("4.1", "gwei");
          //}
          //if (!tx.gasLimit) {
          //  tx.gasLimit = hexlify(120000);
          //}
          console.log("RUNNING TX", tx);
          result = await signer.sendTransaction(tx);

          // Store transactionResponse in localStorage, so we can speed up the transaction if needed
          // Injected providers like MetaMask can manage their transactions on their own
          if (injectedProvider === undefined) {
            const transactionManager = new TransactionManager(provider, provider.getSigner());

            transactionManager.setTransactionResponse(result);  
          } 
          
        }
        console.log("RESULT:", result);
        // console.log("Notify", notify);

        // if it is a valid Notify.js network, use that, if not, just send a default notification
        if ([1, 3, 4, 5, 42, 100].indexOf(network.chainId) >= 0) {
          const { emitter } = notify.hash(result.hash);
          emitter.on("all", transaction => {
            return {
              onclick: () => window.open((etherscan || etherscanTxUrl) + transaction.hash),
            };
          });
        } else {
          notification.info({
            message: "Local Transaction Sent",
            description: result.hash,
            placement: "bottomRight",
          });
        }

        return result;
      } catch (e) {
        console.log(e);
        console.log("Transaction Error:", e.message);
        notification.error({
          message: "Transaction Error",
          description: e.message,
        });
      }
    };
  }
}
