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



