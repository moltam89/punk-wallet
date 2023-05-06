import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";

import { NETWORKS } from "../constants";
import { getSdkError } from "@walletconnect/utils";

import { buildApprovedNamespaces } from "@walletconnect/utils";

export const createWeb3wallet = async () => {
  const core = new Core({
    logger: 'debug',
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
  });

  return await Web3Wallet.init({
    core, // <- pass the shared `core` instance
    metadata: {
      description: "Forkable web wallet for small/quick transactions.",
      url: "https://punkwallet.io",
      icons: ["https://punkwallet.io/punk.png"],
      name: "🧑‍🎤 PunkWallet.io",
    },
  });
}

export const onSessionProposal = async (web3wallet, address, proposal, disconnectFromWalletConnect, setWalletConnectUrl, setWalletConnectConnected, setWalletConnectPeerMeta) => {
	console.log("proposal", proposal);

  if (isWalletConnectV2Connected(web3wallet)) {
    await disconnectFromWalletConnect(undefined, web3wallet);
  }

  const { id, params } = proposal;
  const { proposer, requiredNamespaces, relays } = params;

  console.log("chainIds", getSupportedChainIds().map(chainId => "eip155:" + chainId))

  // https://docs.walletconnect.com/2.0/web/web3wallet/wallet-usage#-namespaces-builder-util
  let approvedNamespaces;
  try {
  	approvedNamespaces= buildApprovedNamespaces({
	    proposal: params,
	    supportedNamespaces: {
	        eip155: {
	            chains: getSupportedChainIds().map(chainId => "eip155:" + chainId), // ["eip155:1", "eip155:137", ...] 
	            methods: ["eth_sendTransaction", "eth_signTransaction", "eth_sign", "personal_sign", "eth_signTypedData"],
	            events: ["accountsChanged", "chainChanged"],
	            accounts:getSupportedChainIds().map(chainId => "eip155:" + chainId + ":" + address) // ["eip155:1:0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d", "eip155:137:0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d", ...] 
	      },
	    },
	  });
  }
  catch(error) {
  	console.error("Something is wrong with the namespaces", error);
  	setWalletConnectUrl("");
  	
  	// ToDo display error
  	web3wallet.rejectSession({
	    id: id,
	    reason: getSdkError('USER_REJECTED_METHODS')
	  })

	  return;
  }


  console.log("proposer", proposer);
  console.log("approvedNamespaces", approvedNamespaces);

  await web3wallet.approveSession({
    id,
    relayProtocol: relays[0].protocol,
    namespaces:approvedNamespaces
  })

  connectWalletConnectV2(web3wallet, setWalletConnectConnected, setWalletConnectPeerMeta);
}

// Get All 
const getSupportedChainIds = () => {
	const supportedChainIds = [];

	for (const network of Object.values(NETWORKS)) {
		supportedChainIds.push(network.chainId);
	}

	return supportedChainIds;
}

export const getWalletConnectV2ActiveSession = (web3wallet) => {
	return Object.values(web3wallet.getActiveSessions())[0];
}

export const isWalletConnectV2Connected = (web3wallet) => {
	const activeSession = getWalletConnectV2ActiveSession(web3wallet);
	if (activeSession) {
		return true;
	}
	return false;
}

export const connectWalletConnectV2 = (web3wallet, setWalletConnectConnected, setWalletConnectPeerMeta) => {
	const activeSession = getWalletConnectV2ActiveSession(web3wallet);

  if (activeSession) {
    setWalletConnectConnected(true);
    setWalletConnectPeerMeta(activeSession?.peer?.metadata);
  }
}

export const disconnectWallectConnectV2Sessions = async (web3wallet) => {
	console.log("Disconnecting from Wallet Connect 2 session");

	// Wallet Connect V2 has a lot more options than V1, we could have multiple sessions and pairings
	// But for now let's use only one session and disconnect from all sessions (there should be only one though right now)

	const topics = Object.keys(web3wallet.getActiveSessions());

	for (const topic of topics) {
		console.log("Disconnecting from session ", topic);
		await web3wallet.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
	}

	/*  We could also disconnect from the pairings, but I think it is a better user experience if we keep them
		  Dapps can keep the pairings and reconnect

		web3wallet.engine.signClient.core.pairing.pairings.values
		.forEach(
		  async (pairing) => {
		      const topic = pairing.topic;
		      console.log("Disconnecting from pair ", topic);
		      await web3wallet.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
		});
	*/
}

export const updateWalletConnectSession = (wallectConnectConnector, address, localChainId) => {
  wallectConnectConnector.updateSession({
    accounts: [address],
    chainId: localChainId,
  });
};

