import React, {useState, useEffect} from "react";

import { formatEther, parseEther } from "@ethersproject/units";

import { Button} from "antd";

import { Balance, ERC20Balance, NetworkDetailedDisplay, NetworkDisplay, SelectorWithSettings, SettingsModal, TokenDetailedDisplay, TokenDisplay, TokenImportDisplay} from "./";

import { useBalance, useLocalStorage } from "../hooks";

import { Transactor } from "../helpers";
import { getChain} from "../helpers/ChainHelper";
import { getSelectedErc20Token, getStorageKey, getTokens, migrateSelectedTokenStorageSetting } from "../helpers/TokenSettingsHelper";
import { SELECTED_BLOCK_EXPORER_NAME_KEY, getBLockExplorer, migrateSelectedNetworkStorageSetting } from "../helpers/NetworkSettingsHelper";
import { SettingsHelper } from "../helpers/SettingsHelper";

import { NETWORKS } from "../constants";

const networkSettingsStorageKey = "networkSettings";
const networks = Object.values(NETWORKS);

export default function BalancePanel( {localProvider, address, gasPrice, targetNetwork, price, selectedErc20Token, setSelectedErc20Token } ) {
    const networkName = targetNetwork.networkName;

    const [networkSettingsModalOpen, setNetworkSettingsModalOpen] = useState(false);
    const [networkSettings, setNetworkSettings] = useLocalStorage(networkSettingsStorageKey, {});
    const networkSettingsHelper = networks ? new SettingsHelper(networkSettingsStorageKey, networks, networkSettings, setNetworkSettings) : undefined;

    const erc20Tokens = targetNetwork?.erc20Tokens;
    const tokens = getTokens(targetNetwork?.nativeToken, erc20Tokens);
    const tokenSettingsStorageKey = networkName + getStorageKey();

    const [tokenSettingsModalOpen, setTokenSettingsModalOpen] = useState(false);
    const [tokenSettings, setTokenSettings] = useLocalStorage(tokenSettingsStorageKey, {});
    const tokenSettingsHelper = tokens ? new SettingsHelper(tokenSettingsStorageKey, tokens, tokenSettings, setTokenSettings) : undefined;

    if (tokenSettingsHelper) {
        setSelectedErc20Token(getSelectedErc20Token(tokenSettingsHelper.getSelectedItem(), erc20Tokens.concat(tokenSettingsHelper.getCustomItems())));
    }

    useEffect(() => {
        migrateSelectedNetworkStorageSetting(networkSettingsHelper);
        migrateSelectedTokenStorageSetting(networkName, tokenSettingsHelper);
    }, []);

    if (networkSettingsHelper) {
        const selectedBlockExplorerName = networkSettingsHelper.getItemSettings(targetNetwork)[SELECTED_BLOCK_EXPORER_NAME_KEY];

        if (selectedBlockExplorerName) {
            const selectedBlockExplorer = getBLockExplorer(getChain(targetNetwork.chainId), selectedBlockExplorerName);

            if (selectedBlockExplorer) {
                //blockExplorer = selectedBlockExplorer.url + "/";
                targetNetwork.blockExplorer = selectedBlockExplorer.url + "/";
            }
        }
    }

    // Faucet Tx can be used to send funds from the faucet
    const faucetTx = Transactor(localProvider, gasPrice);

    // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
    const yourLocalBalance = useBalance(localProvider, address);

    const [faucetClicked, setFaucetClicked] = useState(false);

    let faucetHint = "";

      if (
        !faucetClicked &&
        localProvider &&
        localProvider._network &&
        localProvider._network.chainId == 31337 &&
        yourLocalBalance &&
        formatEther(yourLocalBalance) <= 0
      ) {
        faucetHint = (
          <div style={{ padding: 16 }}>
            <Button
              type="primary"
              onClick={() => {
                faucetTx({
                  to: address,
                  value: parseEther("0.01"),
                });
                setFaucetClicked(true);
              }}
            >
              💰 Grab funds from the faucet ⛽️
            </Button>
          </div>
        );
      }

    return (
        <>
            {networkSettingsHelper && 
                <SettingsModal
                  settingsHelper={networkSettingsHelper}
                  itemCoreDisplay={(network) => <NetworkDisplay network={network}/>}
                  itemDetailedDisplay={(networkSettingsHelper, network, networkCoreDisplay, setItemDetailed) => <NetworkDetailedDisplay networkSettingsHelper={networkSettingsHelper} network={network} networkCoreDisplay={networkCoreDisplay} setItemDetailed={setItemDetailed} />}
                  modalOpen={networkSettingsModalOpen}
                  setModalOpen={setNetworkSettingsModalOpen}
                  title={"Network Settings"} 
                />
            }

            {tokenSettingsHelper && 
                <SettingsModal
                    settingsHelper={tokenSettingsHelper}
                    itemCoreDisplay={(token) => <TokenDisplay token={token} divStyle={{display: "flex", alignItems: "center", justifyContent: "center"}} spanStyle={{paddingLeft:"0.2em"}}/>}
                    itemDetailedDisplay={(tokenSettingsHelper, token, tokenCoreDisplay, network, setItemDetailed) => <TokenDetailedDisplay tokenSettingsHelper={tokenSettingsHelper} token={token} tokenCoreDisplay={tokenCoreDisplay} network={network} setItemDetailed={setItemDetailed} />}
                    itemImportDisplay={(tokenSettingsHelper, tokenCoreDisplay, tokenDetailedDisplay, network, setImportView) => <TokenImportDisplay tokenSettingsHelper={tokenSettingsHelper} tokenCoreDisplay={tokenCoreDisplay} tokenDetailedDisplay={tokenDetailedDisplay} network={network} setImportView={setImportView}/>}
                    modalOpen={tokenSettingsModalOpen}
                    setModalOpen={setTokenSettingsModalOpen}
                    title={"Token Settings"} // ToDo: Reuse TOKEN_SETTINGS_STORAGE_KEY and colored network name
                    network={targetNetwork}
                />
                }

            <div
                style={{ clear: "both", opacity: yourLocalBalance ? 1 : 0.2, width: 500, margin: "auto", position: "relative" }}
            >
                <div>
                    {selectedErc20Token ?
                        <ERC20Balance
                        token={selectedErc20Token}
                        rpcURL={targetNetwork.rpcUrl}
                        size={12 + window.innerWidth / 16}
                        address={address}
                        />
                    :
                        <Balance
                        value={yourLocalBalance}
                        size={12 + window.innerWidth / 16}
                        price={price} />
                        }
                </div>

                <span style={{ verticalAlign: "middle" }}>
                    <div style={{ display: "flex", justifyContent: erc20Tokens ? "space-evenly" : "center", alignItems: "center" }}>
                        <div>
                            <SelectorWithSettings
                                settingsHelper={networkSettingsHelper}
                                settingsModalOpen={setNetworkSettingsModalOpen}
                                itemCoreDisplay={(network) => <NetworkDisplay network={network}/>}
                                onChange={() => setTimeout(
                                        () => {
                                            window.location.reload();
                                        },
                                        1
                                    )
                                }       
                                optionStyle={{lineHeight:1.1}}
                            />
                        </div>
                        <div> 
                            {tokenSettingsHelper &&
                                <SelectorWithSettings
                                    settingsHelper={tokenSettingsHelper}
                                    settingsModalOpen={setTokenSettingsModalOpen}
                                    itemCoreDisplay={(token) => <TokenDisplay token={token}/>}
                                />
                            }
                        </div>
                    </div>
                    {faucetHint}
                </span>
            </div>
        </>
    );
}
