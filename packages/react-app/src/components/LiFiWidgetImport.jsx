import React from "react";
import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import { supportedWallets, LiFiWalletManagement } from '@lifi/wallet-management';
import WalletConnectProvider from '@walletconnect/ethereum-provider';

const liFiWalletManagement = new LiFiWalletManagement();

const METAMASK_WALLET = supportedWallets.find(
  (wallet) => wallet.name === 'WalletConnect',
);

//const options = WALLET_CONNECT_WALLET.options;
//options.showQrModal = false;


const { ethers } = require("ethers");

console.log("supportedWallets", supportedWallets);

export default function LiFiWidgetImport( {setWalletConnectUrl} ) {
  console.log("setWalletConnectUrl", setWalletConnectUrl);

  const widgetConfig = {
    walletManagement: {
      connect: async () => {
              console.log("METAMASK_WALLETtt", METAMASK_WALLET)

              const wallet = METAMASK_WALLET;

              console.log("wallet", wallet);
              console.log("wallet.options", wallet.options)
              console.log("wallet.connect", wallet.connect)

              //const connectooo = () => {
              //  console.log("connectooo");
              //  wallet.connect;
              //}

              

              wallet.options.showQrModal = false;

              wallet.walletConnectProvider = await WalletConnectProvider.init(wallet.options);
              console.log("wallet after init", wallet);

              //wallet.connect = connectooo;

              //wallet.options.showQrModal = false;
              //console.log("wallet.options modified", wallet.options)

              //await wallet.init(wallet.options);
              //console.log("wallet after init", wallet);
              wallet.on('display_uri', (uri) => {
                console.log("uri")
              })

              console.log("wallet.walletConnectProvider", wallet.walletConnectProvider);

              if (wallet.walletConnectProvider) wallet.walletConnectProvider.on('display_uri', (uri) => {
                console.log(uri);
                setWalletConnectUrl(uri);
              })

              await liFiWalletManagement.connect(wallet);
              //await wallet.connect();

              console.log("wallet after connect", wallet);


              //await connect(METAMASK_WALLET);
              //return account.signer!;
            },
      disconnect: async () => {
        console.log("maki disconnect");
      },
    },
    variant: 'drawer',
    containerStyle: {
      border: '1px solid rgb(234, 234, 234)',
      borderRadius: '16px',
    },
  };


  return (
    <LiFiWidget integrator="PunkWallet" config={widgetConfig} />
  );
}
