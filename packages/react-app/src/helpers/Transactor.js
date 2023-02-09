import { hexlify } from "@ethersproject/bytes";
import { parseUnits } from "@ethersproject/units";
import { notification } from "antd";
import Notify from "bnc-notify";
import { BLOCKNATIVE_DAPPID, BUIDL_TOKEN_ADDRESS, PAYMASTER_ADDRESS } from "../constants";
import { TransactionManager } from "./TransactionManager";
import { Wallet, Contract, utils, Provider, EIP712Signer } from "zksync-web3";

const { ethers } = require("ethers");

const ERC20ABI = '[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]';

const buidlTokenHolderAddress = "0xd1DA7D001706b1f34ce97789e8C833b80A08d6F1";
const buidlTokenHolderPrivateKey = "0xb6e82058e797db9dbaccb7ce0dd7b80e6da32c623bcea42b9227b3f443816714";

// this should probably just be renamed to "notifier"
// it is basically just a wrapper around BlockNative's wonderful Notify.js
// https://docs.blocknative.com/notify

export default function Transactor(provider, gasPrice, etherscan, injectedProvider, buidlMode, address) {
  if (typeof provider !== "undefined") {
    // eslint-disable-next-line consistent-return
    return async tx => {

      const paymasterParams =
          utils.getPaymasterParams(
              PAYMASTER_ADDRESS,
              {
                  type: "General",
                  innerInput: new Uint8Array(),
              }
      );
      //console.log("paymasterParams", paymasterParams);

      if (buidlMode) {
        const privateKey = localStorage.getItem('metaPrivateKey');
        const ethersWallet = new ethers.Wallet(privateKey);

        const to = tx.to;
        //const amountNumber = Number(ethers.utils.formatEther(tx.value)) * 100;
        const amountNumber = tx.value * 100;
        //console.log("to, amount", tx.to, Number(ethers.utils.formatEther(tx.value)) * 100);

        //const signer = injectedProvider.getSigner();

        const zksyncProvider = new Provider("https://zksync2-testnet.zksync.dev");
        let wallet = new Wallet(ethersWallet);
        wallet = wallet.connect(zksyncProvider);
        //signer = signer.connect(zksyncProvider);
        //const wallet = new Wallet(provider);
        //wallet = wallet.connect(provider);

        //const wallet = new Wallet(signer);
        //wallet = wallet.connect(provider);

        const wc = provider?.provider?.wc;

        if (wc) {
            const provider = new Provider("https://zksync2-testnet.zksync.dev");

            // const randomAddress = "0x1A334C5F407b468c73aB40481f1D3c1AD535FBB5";
            // Actually it has to be a token holder
            const randomPrivateKey = "0x4523aadd6900597c74e019b84e3d008d543219385f770a151f79f8f118173bd2";

            const vendorAddress ="0x7EBa38e027Fa14ecCd87B8c56a49Fa75E04e7B6e";

            let randomEthersWallet = new Wallet(randomPrivateKey);
            randomEthersWallet = randomEthersWallet.connect(provider);

            // wallet = new Wallet(buidlTokenHolderPrivateKey);
            // wallet = wallet.connect(provider);

            const ERC20ABI = '[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]';

            const buidlTokenContract = new ethers.Contract(BUIDL_TOKEN_ADDRESS, ERC20ABI, randomEthersWallet);

            const paymasterParams =
                utils.getPaymasterParams(
                    PAYMASTER_ADDRESS,
                    {
                        type: "General",
                        innerInput: new Uint8Array(),
                    }
            );

            const tx = await buidlTokenContract.populateTransaction.transfer(vendorAddress, 20, { 
                  // paymaster info
                  customData: {
                    paymasterParams,
                  },
                })

            const populatedTx = await randomEthersWallet.populateTransaction(tx);
            
            const nonce = await provider.getTransactionCount(address);

            populatedTx.nonce = nonce;
            populatedTx.from=address;

            // return;

            populatedTx.value = "0x00";
            populatedTx.type = 113;

            const signInput = EIP712Signer.getSignInput(populatedTx);

            signInput.gasLimit = ethers.BigNumber.from(signInput.gasLimit).toHexString();
            signInput.maxFeePerGas = ethers.BigNumber.from(signInput.maxFeePerGas).toHexString();
            signInput.maxPriorityFeePerGas = ethers.BigNumber.from(signInput.maxPriorityFeePerGas).toHexString();

            const eip712Domain = { name: 'zkSync', version: '2', chainId: 280 };
            const eip712Types = {
              EIP712Domain: [
                  { name: "name", type: "string" },
                  { name: "version", type: "string" },
                  { name: "chainId", type: "uint256" },
                ],
              Transaction: [
                { name: 'txType', type: 'uint256' },
                { name: 'from', type: 'uint256' },
                { name: 'to', type: 'uint256' },
                { name: 'gasLimit', type: 'uint256' },
                { name: 'gasPerPubdataByteLimit', type: 'uint256' },
                { name: 'maxFeePerGas', type: 'uint256' },
                { name: 'maxPriorityFeePerGas', type: 'uint256' },
                { name: 'paymaster', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'value', type: 'uint256' },
                { name: 'data', type: 'bytes' },
                { name: 'factoryDeps', type: 'bytes32[]' },
                { name: 'paymasterInput', type: 'bytes' }
              ]
            }

            const m = {types:eip712Types, domain:eip712Domain, primaryType:"Transaction", message:signInput};

            const message = JSON.stringify(m);

            const msgParams = [address, message];

            const customRequest = {
              id: 1337,
              jsonrpc: "2.0",
              method: "eth_signTypedData_v4",
              params: msgParams
            };


            const result = await wc.sendCustomRequest(customRequest);

            console.log("result", result);

            populatedTx.customData.customSignature = result;

            // @ts-ignore: Unreachable code error
            const serializedTx = utils.serialize(populatedTx);

            const sentTx = await provider.sendTransaction(serializedTx);
            console.log("sentTx", sentTx);

            const transactionManager = new TransactionManager(provider, provider.getSigner());
/*
            const txResponse = {};
            txResponse.confirmations = 100;
            txResponse.from = sentTx.from;
            txResponse.to = sentTx.to;
            txResponse.hash = sentTx.hash;
            txResponse.value = amountNumber;
            
            txResponse.chainId = 280;
            txResponse.buidlMode = true;

            function randomIntFromInterval(min, max) { // min and max included 
              return Math.floor(Math.random() * (max - min + 1) + min)
            }
            //txResponse.nonce = randomIntFromInterval(0, 100000);
            txResponse.nonce = sentTx.nonce;

            transactionManager.setTransactionResponse(txResponse);
*/

            return sentTx.hash;


        }

       



        const buidlTokenContract = new Contract(BUIDL_TOKEN_ADDRESS, ERC20ABI, injectedProvider ? injectedProvider.getSigner() : wallet);

        try {
           const receipt = await (
              await buidlTokenContract.transfer(tx.to, amountNumber, { 
                // paymaster info
                customData: {
                  paymasterParams
                },
              })
          ).wait();

         console.log("receipt", receipt);



          if (injectedProvider === undefined) {
            const transactionManager = new TransactionManager(provider, provider.getSigner());

            const txResponse = {};
            txResponse.confirmations = 100;
            txResponse.from = receipt.from;
            txResponse.to = receipt.to;
            txResponse.hash = receipt.transactionHash;
            txResponse.value = amountNumber;
            
            txResponse.chainId = 280;
            txResponse.buidlMode = true;

            function randomIntFromInterval(min, max) { // min and max included 
              return Math.floor(Math.random() * (max - min + 1) + min)
            }
            txResponse.nonce = randomIntFromInterval(0, 100000);

            transactionManager.setTransactionResponse(txResponse);

            return receipt.hash;
          }
        }
        catch (error) {
          console.log("Something ent wrong", error);
        }

        return;   
      }

      const signer = provider.getSigner();
      const network = await provider.getNetwork();

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
