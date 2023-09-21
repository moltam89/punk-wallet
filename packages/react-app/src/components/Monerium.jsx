import React, { useState, useEffect } from "react";

import { Button, Modal, Select, Spin } from "antd";
import { EuroOutlined, LoginOutlined, LogoutOutlined, DownloadOutlined, ExportOutlined } from "@ant-design/icons";

import { MoneriumClientData, QRPunkBlockie } from "./";

import { getAuthFlowURI, authorize, authorizeWithRefreshToken, cleanStorage, getData, linkAddress } from "../helpers/MoneriumHelper";
import { signMessage } from "../helpers/WalletConnectV2Helper";

import { IBANTransferForm } from "./";

const { ethers } = require("ethers");

const { MoneriumClient, placeOrderMessage, constants } = require("@monerium/sdk");

let client = new MoneriumClient('production');

//const IBAN = "LT153250091752681397";
const IBAN = "LT953250086231898476";
const PUNK_ADDR = "0xc54C244200d657650087455869f1aD168537d3B3";

export default function Monerium( { moneriumConnected, setMoneriumConnected, currentPunkAddress } ) {
    const [open, setOpen] = useState(false);

    const [clientData, setClientData] = useState(null);

    const authorizeClient = async (code) => {
        await authorize(client, code);
        setOpen(true);
        setMoneriumConnected(true);
    }

    const authorizeClientWithRefreshToken = async (code) => {
        const authorizationSuccessful = await authorizeWithRefreshToken(client);
        console.log("authorizationSuccessful", authorizationSuccessful);
        if (authorizationSuccessful) {
            setMoneriumConnected(true);
        }
    }

    const disconnectClient = () => {
        cleanStorage();

        client = new MoneriumClient('production');

        setMoneriumConnected(false);
        setClientData(null);
    }

    const getClientData = async () => {
        if (!currentPunkAddress) {
            return;
        }

        const data = await getData(client, currentPunkAddress.toLowerCase());
        console.log("data", data);
        setClientData(data);
    }

    const getDataaa = async () => {
        // Authcontext
        const authContext = await client.getAuthContext();
        console.log("authContext", authContext);

        // Balances
        const balances = await client.getBalances();
        console.log("balances", balances);

        // Profile  
        const profileId = authContext.profiles[0].id;
        console.log("profileId", profileId);
        const profile = await client.getProfile(profileId);
        console.log("profile", profile);

        // Orders
        const orders = await client.getOrders(
            // Can be filtered by address, txHash, profile, memo, accountId and state
            //{
            //    address:"0xc54C244200d657650087455869f1aD168537d3B3",
            //    memo: 'Powered by Monerium SDK' 
            //}
        );
        console.log("orders", orders);

        //const orderId = "898fb847-4bde-11ee-b24c-426283d74da7";
        //const order = await client.getOrder(orderId);
        //console.log("order", order);
    }

    const linkAddresssss = async () => {
        const LINK_MESSAGE = constants.LINK_MESSAGE;
        console.log("LINK_MESSAGE", LINK_MESSAGE);

        //const signedMessage = await signMessage(LINK_MESSAGE);
        //console.log("signedMessage", signedMessage);


        const authContext = await client.getAuthContext();

        try {
            const result = await client.linkAddress(authContext.defaultProfile, {
                address: address,
                message: LINK_MESSAGE,
                signature: signedMessage,
                accounts: [
                    {
                        network: 'mainnet',
                        chain: 'ethereum',
                        currency: 'eur',
                    },
                    {
                        network: 'mainnet',
                        chain: 'gnosis',
                        currency: 'eur',
                    },
                    {
                        network: 'mainnet',
                        chain: 'polygon',
                        currency: 'eur',
                    },
                ],
            });

            console.log("result", result);
        }
        catch(error) {
            console.log("Something went wrong", error);
        }

    }

    const placeOrderIBAN = async () => {
        const placeOrderMessageString =  placeOrderMessage(1, IBAN);
        //const placeOrderMessageString =  "Send EUR 1 to LT953250086231898476 at 2023-09-25T17:37:36+02:00";
        console.log("placeOrderMessageString", placeOrderMessageString);

        const signedPlaceOrderMessage = await signMessage(placeOrderMessageString);
        //const signedPlaceOrderMessage = "0x4d93d718c6bf4dddc7b4c3b56e241d9f66b2e766e4938b628ad95ca3a6ed95661fe365ae8472ff7f6eafdaf5e7c35a8ce99ed4417422077197a915dde53fa3a51c";
        console.log("signedPlaceOrderMessage", signedPlaceOrderMessage);

    /* IBAN counterpart
        const counterpart = {
            identifier: {
                //standard: PaymentStandard.iban,
                standard: 'iban',
                iban: IBAN,
            },
            details: {
                firstName: 'Tamas',
                lastName: 'Molnar',
            },
        }
    */
        // counterpart for crosschain transfer
        const counterpart = {
            identifier: {
                //standard: PaymentStandard.iban,
                standard: 'chain',
                address: "0x44b7Cda759e46cdb427495C702cA5B67c1A07e82",
                //chain: "gnosis",
                chain: "polygon",
                network: "mainnet"
            },
            details: {}
        }

        try {
            const order = await client.placeOrder({
                amount: '0.01',
                signature: signedPlaceOrderMessage,
                address: PUNK_ADDR,
                counterpart: counterpart,
                message: placeOrderMessageString,
                memo: 'Powered by Monerium SDK',
                chain: 'gnosis',
                //chain: 'gnosis',
                //network: 'ethereum',
            });

            console.log("order", order);
        }
        catch(error) {
            console.log("Something went wrong", error);
        }
    }

    useEffect(() => {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // http://localhost:3000/?code=8DzQ69GXTS-BpNc1traTUA&state=
            // Remove the code and state from the URL

            // https://auth0.com/docs/secure/attack-protection/state-parameters
            // State is not used currently        

            const newUrl = window.location.href.replace(`?code=${code}&state=`, '');
            window.history.replaceState({}, document.title, newUrl);

            authorizeClient(code);
        }
    }, []);

    useEffect(() => {
        authorizeClientWithRefreshToken(client);
    }, []);

    useEffect(() => {
        if (!moneriumConnected) {
            return;
        }

        //getDataaa();
        //placeOrderIBAN();
        //linkAddress();
        //getClientData();
    }, [moneriumConnected]);

    useEffect(() => {
        if (!moneriumConnected || !open) {
            return;
        }

        getClientData();
    }, [moneriumConnected, open, currentPunkAddress]);

    useEffect(() => {
        if (!moneriumConnected) {
            return;
        }

        getClientData();
    }, [moneriumConnected, currentPunkAddress]);

    const LogoOnLogo = ({ src1, src2, sizeMultiplier1 = 1, sizeMultiplier2 = 0.375, showImage2 = true, onClickAction = () => {} }) => {
        return (
            <div style={{ position: 'relative', display: 'inline-block' }} onClick={() => {onClickAction()}} >
                <img
                    src={src1}
                    alt={src1}
                    style={{
                        //width: '32px',
                        //height: '32px'

                        width: `${sizeMultiplier1}em`,
                        height: `${sizeMultiplier1}em`
                    }}
                />
                {showImage2 && <img
                    src={src2}
                    alt={src2}
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: `${sizeMultiplier1 * sizeMultiplier2}em`,
                        height: `${sizeMultiplier1 * sizeMultiplier2}em`
                    }}
                />}
            </div>
        );
    };

    const MoneriumConnect = () => {
        return (
            <Button
                type="primary"
                shape="round"
                icon={<LoginOutlined />}
                size={'large'}
                onClick={() => {getAuthFlowURI();}}
                //onClick={() => {
                //    setMoneriumConnected(true);
                //}}
            >
                Connect
            </Button>
        );
    };

    const MoneriumDisconnect = () => {
        return (
            <Button
                type="primary"
                shape="round"
                icon={<LogoutOutlined />}
                size={'large'}
                //onClick={() => {getAuthFlowURI();}}
                //onClick={() => {setMoneriumConnected(false);}}
                onClick={() => {disconnectClient()}}
            >
                Disconnect
            </Button>
        );
    };

const MoneriumDescription = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img
            src="/EURe.png"
            alt="EURe"
            style={{ width: '20%', height: '20%' }}
        />
        <div style={{ paddingLeft: '0.42em', fontSize: '1.2em' }}>
            <p>
                The <a href="https://monerium.com/" target="_blank" rel="noopener noreferrer" style={{color: '#2385c4', fontWeight: 'bold'}}>EURe</a> is a fully authorised and regulated euro stablecoin for web3 available on Ethereum, Polygon, and Gnosis. Send and receive euros between any bank account and Web3 wallet.
            </p>
        </div>
    </div>
  );
}

//<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
const MoneriumData = ( {} ) => {
    return (
        <div>
            {!clientData.punkConnected ?
                <PunkNotConnected/> :
                <>
                    <MoneriumClientData clientData={clientData} />
                    <EUReBalances balances={clientData.punkBalances}/>
                </>
            }
        </div>
    );
}

const MoneriumDataLoading = ( {} ) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin/>
    </div>
  );
}

const PunkNotConnected = ( {} ) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ padding: '1em', fontSize: '1.2em' }}>
            Your current Punk Wallet <b>{getShortAddress(currentPunkAddress)}</b> is not linked to your Monerium account.
        </div>
        <div>
            <Button
                key="submit"
                type="primary"
                loading={false}
                icon={<ExportOutlined />}
                onClick={() => {
                    linkAddress();
                }}
            >
                Link Punk Wallet
            </Button>
        </div>
    </div>
  );
}

const getShortAddress  = (address) => {
    return address.slice(0, 6) + "..." + address.slice(address.length - 2);
}

const Punk = ( {} ) => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
        <div>
            {getShortAddress(currentPunkAddress)}
        </div>
        <div style={{ position:"relative",left:-220, top:-120 }}>
            <QRPunkBlockie scale={0.4} address={currentPunkAddress} />
        </div>
    </div>
  );
}

const EUReBalance = ( {chainImgSrc, balance} ) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <LogoOnLogo
                src1={"EURe.png"}
                src2={chainImgSrc}
                sizeMultiplier1={3}
                sizeMultiplier2={0.5}
            />
        </div>
        <div style={{ fontSize: '1.8em', paddingLeft: '0.24em' }}>
            €{balance ? balance : "0.00"}
        </div>
    </div>
  );
}

const EUReBalances = ( {balances} ) => {
    const ethereumImgSrc = "ethereum-bgfill-icon.svg";
    const ethereumBalance = balances.ethereum;
    
    const polygonImgSrc = "polygon-bgfill-icon.svg";
    const polygonBalance = balances.polygon;
    
    const gnosisImgSrc = "gnosis-bgfill-icon.svg";
    const gnosisBalance = balances.gnosis;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <EUReBalance chainImgSrc={ethereumImgSrc} balance={ethereumBalance}/>
            <EUReBalance chainImgSrc={polygonImgSrc} balance={polygonBalance}/>
            <EUReBalance chainImgSrc={gnosisImgSrc} balance={gnosisBalance}/>
        </div>
    );
}

    return (
        <>
            <>
                <LogoOnLogo src1={"MoneriumLogo.png"} src2={"greenCheckmark.svg"} showImage2={moneriumConnected} onClickAction={() => {setOpen(!open)}}/>
            </>
            <Modal
                visible={open}
                title={
                    <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                        <div
                            style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}
                            onClick={() => window.open('https://monerium.com/', '_blank')}>

                            <LogoOnLogo
                                src1={"MoneriumLogo.png"}
                                src2={"greenCheckmark.svg"}
                                sizeMultiplier1={2}
                                showImage2={moneriumConnected}
                            />

                            <div style={{ fontWeight: 'bold' }}>
                                MONERIUM
                            </div>

                            <img
                                src="/open_in_new.svg"
                                alt="open_in_new.svg"
                            />
                        </div>
                        
                        <div>
                            {!moneriumConnected ? <MoneriumConnect/> : <MoneriumDisconnect/>}
                        </div>
                    </div>
                }
                onOk={() => {
                    setOpen(!open);
                }}
                onCancel={() => {
                    setOpen(!open);
                }}
                footer={[
                <Button
                    key="submit"
                    type="primary"
                    loading={false}
                    onClick={() => {
                        setOpen(!open);
                    }}
                >
                    OK
                </Button>,
                ]}
            >
                <div>
                    {!moneriumConnected && <MoneriumDescription/>}
                    {moneriumConnected && !clientData && <MoneriumDataLoading/>}
                    {moneriumConnected && clientData && <MoneriumData/>}

                </div>
            </Modal>
        </>
    );
    
}
