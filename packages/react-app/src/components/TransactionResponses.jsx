import React, { useEffect, useState } from "react";
import { TransactionManager } from "../helpers/TransactionManager";
import { TransactionHistory } from "./";

export default function TransactionResponses({provider, signer, injectedProvider, address, chainId, blockExplorer, buidlMode}) {
  const transactionManager = new TransactionManager(provider, signer, true);

  const [transactionResponsesArray, setTransactionResponsesArray] = useState([]);

  const initTransactionResponsesArray = () => {
    if (injectedProvider !== undefined) {
      setTransactionResponsesArray([]);
    }
    else {
      setTransactionResponsesArray(
        filterResponsesAddressAndChainId(
          transactionManager.getTransactionResponsesArray()));    
    }
  }

  const filterResponsesAddressAndChainId = (transactionResponsesArray) => {
    return transactionResponsesArray.filter(
      transactionResponse => {
        if (transactionResponse.from != address) {
          return false;
        }

        if (transactionResponse.chainId != chainId) {
          return false;
        }

        let transactionResponseBuidlMode = false;
        if (transactionResponse?.buidlMode) {
          transactionResponseBuidlMode = true;
        }

        if (buidlMode) {
          return transactionResponseBuidlMode;
        }
        else {
          return !transactionResponseBuidlMode;
        }
      })
  }

  useEffect(() => {
    initTransactionResponsesArray();

    // Listen for storage change events from the same and from other windows as well
    window.addEventListener("storage", initTransactionResponsesArray);
    window.addEventListener(transactionManager.getLocalStorageChangedEventName(), initTransactionResponsesArray);

    return () => {
      window.removeEventListener("storage", initTransactionResponsesArray);
      window.removeEventListener(transactionManager.getLocalStorageChangedEventName(), initTransactionResponsesArray);
    }
  }, [injectedProvider, address, chainId]);
  
    return (
      <>
      {(transactionResponsesArray.length > 0) && <TransactionHistory transactionResponsesArray={transactionResponsesArray} transactionManager={transactionManager} blockExplorer={blockExplorer} buidlMode={buidlMode}/>}
      </>
    );  
  }
