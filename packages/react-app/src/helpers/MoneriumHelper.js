import { signMessage } from "./WalletConnectV2Helper";

const { MoneriumClient, placeOrderMessage, constants } = require("@monerium/sdk");

const MONERIUM_AUTHORIZATION_CLIENT_ID = process.env.REACT_APP_MONERIUM_AUTHORIZATION_CLIENT_ID;

const RELAYER_PK = process.env.REACT_APP_RELAYER_PK;

//const REDIRECT_URI = "https://punkwallet.io/";
//const REDIRECT_URI = "https://localhost:3000/";
//const REDIRECT_URI = "https://redirectmeto.com/http://localhost:3000";
const REDIRECT_URI = "https://redirectmeto.com/http://192.168.0.101:3000/";

const KEY_CODE_VERIFIER = "moneriumCodeVerifier";
const KEY_REFRESH_TOKEN = "moneriumRefreshToken";

export const getAuthFlowURI = async () => {
	try {
		const client = new MoneriumClient('production');

		// Construct the authFlowUrl for your application and redirect your customer.
        const authFlowUrl = await client.getAuthFlowURI({
            client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
        });
        console.log("authFlowUrl", authFlowUrl);

        // Store the code verifier in localStorage
        window.localStorage.setItem(KEY_CODE_VERIFIER, client.codeVerifier);
        console.log("codeVerifier", client.codeVerifier);

        // Redirecting to the Monerium onboarding / Authentication flow.
        window.location.replace(authFlowUrl)
    }
    catch(error) {
        console.log("Something went wrong", error); 
    }
}

export const authorize = async (client, code) => {
	const codeVerifier = window.localStorage.getItem(KEY_CODE_VERIFIER);
    console.log("codeVerifier", codeVerifier);

    await client.auth({
        client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
        code: code,
        code_verifier: codeVerifier,
        redirect_url: REDIRECT_URI,
    });

    console.log("client", client);

    window.localStorage.setItem(KEY_REFRESH_TOKEN, client.bearerProfile.refresh_token);
}

export const authorizeWithRefreshToken = async (client) => {
	try {
		const refreshToken = window.localStorage.getItem(KEY_REFRESH_TOKEN);

		if (!refreshToken) {
			return;
		}

		await client.auth({
	        client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
	        refresh_token : refreshToken
    	});

    	console.log("client", client);

    	window.localStorage.setItem(KEY_REFRESH_TOKEN, client.bearerProfile.refresh_token);

    	return true;
	}
    catch(error) {
    	localStorage.removeItem(KEY_REFRESH_TOKEN);
        console.log("Something went wrong", error); 

        return false;
    }
}

export const cleanStorage = async (client) => {
    localStorage.removeItem(KEY_CODE_VERIFIER);
    localStorage.removeItem(KEY_REFRESH_TOKEN);
}

export const getData = async (client, currentPunkAddress) => {
    try {
        const authContext = await client.getAuthContext();

        const profileId = authContext.profiles[0].id;

        const profile = await client.getProfile(profileId);

        let accountIBAN;
        const addressesSet = new Set();
    
        for (const account of profile.accounts) {
            addressesSet.add(account.address.toLowerCase());

            if (account.iban) {
                accountIBAN = account;
            }
        }
        
        const addressesArray = Array.from(addressesSet);

        console.log("addressesArray", addressesArray);
        console.log("currentPunkAddress", currentPunkAddress);

        const punkConnected = addressesArray.includes(currentPunkAddress);

        let punkBalances = {}

        if (punkConnected) {
            const balancesObjectArray = await client.getBalances(profileId);

            console.log("balancesObjectArray", balancesObjectArray);

            for (const balanceObject of balancesObjectArray) {
                if (balanceObject.address.toLowerCase() != currentPunkAddress) {
                    continue;
                }

                const balancesArray = balanceObject.balances;

                for (const balance of balancesArray) {
                    if (!balance.currency == 'eur') {
                        continue;
                    }

                    punkBalances[balanceObject.chain] = Number(balance.amount).toFixed(2);
                }
            }
        }

        return {
            accountIBAN,
            addressesArray,
            punkConnected,
            punkBalances
        };
    }
    catch(error) {
        console.log("Something went wrong", error); 

        return {};
    }
}

export const linkAddress = async (client, currentPunkAddress) => {
    const LINK_MESSAGE = constants.LINK_MESSAGE;

    const signedMessage = await signMessage(LINK_MESSAGE);
    console.log("signedMessage", signedMessage);
}

/*
export const getAuthFlowURI = async (client) => {
	try {
        const code = new URLSearchParams(window.location.search).get('code');

        if (client.bearerProfile) {
            const authContext = await client.getAuthContext();
            console.log("authContext", authContext);

            // Balances
            const balances = await client.getBalances();
            console.log("balances", balances);
        }
        else if (!code) {
            // Construct the authFlowUrl for your application and redirect your customer.
            const authFlowUrl = await client.getAuthFlowURI({
                client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
                redirect_uri: REDIRECT_URI,
            });

            // Store the code verifier in localStorage
            window.localStorage.setItem("myCodeVerifier", client.codeVerifier);
            console.log("myCodeVerifier", client.codeVerifier);

            // Redirecting to the Monerium onboarding / Authentication flow.
            window.location.replace(authFlowUrl)
            console.log("authFlowUrl", authFlowUrl);
        }
        else {
            const codeVerifier = window.localStorage.getItem('myCodeVerifier');
            console.log("codeVerifier", codeVerifier);

            await client.auth({
                client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
                code: code,
                code_verifier: codeVerifier,
                redirect_url: REDIRECT_URI,
            });

            console.log("client", client);
            console.log("client.bearerProfile", client.bearerProfile);

            window.localStorage.setItem("access_token", "ajTP1WJ2Q2Wg4yKr7M-slA");

            //window.location.href = 'https://www.example.com'
        }
    }
    catch(error) {
        console.log("Something went wrong", error); 
    }
}
*/