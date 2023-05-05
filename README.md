
# This is a Demo for Wallet Connect V2.

You can check this version at:
https://parched-basketball.surge.sh/

**This version is only about the connection, signing with V2 is not yet implemented.**

Wallet Connect V2 has a lot more options than V1, we could have multiple sessions and pairings.
But for now let's use only one session and disconnect from the previous one.

For testing, you can use the Wallet Connect V2 official test Dapp:
https://react-app.walletconnect.com/
And as a reference,  here is the Wallet Connect V2 official test Wallet:
https://react-wallet.walletconnect.com/

With V2, we could connect to multiple Dapps, but I think it could make the UI confusing. So I decided to keep only 1 session at a time. I really like how the V2 Dapp can reconnect, by using the old "pairing".
So if a Dapp is connected, and another Dapp reconnects, I simply reconnect from the old session.

Use cases which worked for me:

		1. Connect V1
			Checking disconnection

		2. Connect V2 new Pairing
			Checking disconnection

		3. Connect V2 with stored session
			Checking disconnection

		Checking disconnection:
		a) Disconnect with bin icon
		b) Refresh, disconnect with bin icon
		c) Disconnect from Dapp
		d) Refresh disconnect from Dapp


	Connection while existing session:
		1. Connect V1
			Checking new connection

		2. Connect V2
			Checking new connection

		Checking new connection:
		a) Connect another V1 via scanner
		b) Connect V2 via scanner
		c) Connect V2 via existing session

