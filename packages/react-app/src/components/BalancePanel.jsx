import React, {useState, useEffect} from "react";

import { formatEther, parseEther } from "@ethersproject/units";

import { Button} from "antd";

import { Balance, ERC20Balance, NetworkDetailedDisplay, NetworkDisplay, SelectorWithSettings, SettingsModal, TokenDisplay} from "./";

import { useBalance, useLocalStorage } from "../hooks";

import { Transactor } from "../helpers";
import { getChain} from "../helpers/ChainHelper";
import { SELECTED_BLOCK_EXPORER_NAME_KEY, getBLockExplorer, migrateSelectedNetworkStorageSetting } from "../helpers/NetworkSettingsHelper";
import { SettingsHelper } from "../helpers/SettingsHelper";

import { NETWORKS } from "../constants";

const networkSettingsStorageKey = "networkSettings";
const networks = Object.values(NETWORKS);

export default function BalancePanel( {localProvider, address, gasPrice, selectedErc20Token, targetNetwork, price, erc20Tokens, tokenSettingsHelper, setTokenSettingsModalOpen } ) {
    const [networkSettingsModalOpen, setNetworkSettingsModalOpen] = useState(false);
    const [networkSettings, setNetworkSettings] = useLocalStorage(networkSettingsStorageKey, {});
    const networkSettingsHelper = networks ? new SettingsHelper(networkSettingsStorageKey, networks, networkSettings, setNetworkSettings) : undefined;

    useEffect(() => {
        migrateSelectedNetworkStorageSetting(networkSettingsHelper);
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
