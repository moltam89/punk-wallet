import React, {useState} from "react";

import { formatEther, parseEther } from "@ethersproject/units";

import { Button} from "antd";

import { Balance, ERC20Balance, NetworkDisplay, SelectorWithSettings, TokenDisplay} from "./";

import { useBalance } from "../hooks";
import { Transactor } from "../helpers";

export default function BalancePanel( {localProvider, address, gasPrice, selectedErc20Token, targetNetwork, price, erc20Tokens, networkSettingsHelper, setNetworkSettingsModalOpen, tokenSettingsHelper, setTokenSettingsModalOpen } ) {
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
    );
}
