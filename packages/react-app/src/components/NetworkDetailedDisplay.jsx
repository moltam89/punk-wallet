import React, { useState, useEffect } from "react";

import { Select, Tooltip } from "antd";

import { CustomRPC } from ".";

import { getBLockExplorer, getBLockExplorers, getChain } from "../helpers/ChainHelper";
import { validateRPC, CUSTOM_RPC_KEY, SELECTED_BLOCK_EXPORER_NAME_KEY } from "../helpers/NetworkSettingsHelper";

export default function NetworkDetailedDisplay({
  networkSettingsHelper,
  network,
  networkCoreDisplay,
  setTargetNetwork,
  currentPunkAddress,
}) {
  const [chain, setChain] = useState(null);

  useEffect(() => {
    const getCurrentChain = async () => {
      return await getChain(network.chainId);
    };

    getCurrentChain().then(data => setChain(data));
  }, []);

  const networkSettings = networkSettingsHelper.getItemSettings(network);
  const storedRPC = networkSettings[CUSTOM_RPC_KEY];

  const [userValue, setUserValue] = useState(storedRPC ?? undefined);
  const [validRPC, setValidRPC] = useState();
  const [loading, setLoading] = useState();

  useEffect(() => {
    if (userValue === undefined) {
      return;
    }

    if (userValue === "") {
      setValidRPC(undefined);

      return;
    }

    validateRPC(
      setLoading,
      network,
      userValue,
      currentPunkAddress,
      networkSettingsHelper,
      setTargetNetwork,
      setValidRPC,
    );
  }, [userValue]);

  return (
    chain && (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1em" }}>
          {networkCoreDisplay && networkCoreDisplay(network)}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em" }}>
          <div style={{ display: "flex", flexDirection: "column", paddingTop: "1em" }}>
            <DataDisplay description={"Name"} data={chain.name} />
            <DataDisplay description={"Chain ID"} data={chain.chainId} />
            <DataDisplay description={"Native Currency"} data={chain.nativeCurrency.symbol} />

            <div style={{ paddingTop: "1em", paddingBottom: "1em" }}>
              <BlockExplorerSelector
                networkSettingsHelper={networkSettingsHelper}
                network={network}
                chain={chain}
                setTargetNetwork={setTargetNetwork}
              />
            </div>

            <div style={{ paddingBottom: "2em" }}>
              <CustomRPC
                network={network}
                userValue={userValue}
                setUserValue={setUserValue}
                validRPC={validRPC}
                setValidRPC={setValidRPC}
                loading={loading}
                storedRPC={storedRPC}
                networkSettingsHelper={networkSettingsHelper}
                setTargetNetwork={setTargetNetwork}
              />
            </div>

            <DataDisplay description={"Info"} data={chain.infoURL} isLink={true} />
          </div>
        </div>
      </>
    )
  );
}

const BlockExplorerSelector = ({ networkSettingsHelper, network, chain, setTargetNetwork }) => {
  const blockExplorers = getBLockExplorers(chain);
  const options = blockExplorers.map(blockExplorer => option(blockExplorer));

  const currentNetworkSettings = networkSettingsHelper.getItemSettings(network);

  const [currentBlockExplorerName, setCurrentBLockExplorerName] = useState(
    currentNetworkSettings[SELECTED_BLOCK_EXPORER_NAME_KEY] ?? blockExplorers[0].name,
  );

  const currentBlockExplorer = getBLockExplorer(chain, currentBlockExplorerName);

  return (
    <>
      {blockExplorers.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "0.25em" }}>
          <Select
            size="large"
            defaultValue={currentBlockExplorerName}
            style={{ width: 170, fontSize: "1em" }}
            listHeight={1024}
            onChange={blockExplorerName => {
              setCurrentBLockExplorerName(blockExplorerName);
              networkSettingsHelper.updateItemSettings(network, {
                [SELECTED_BLOCK_EXPORER_NAME_KEY]: blockExplorerName,
              });
              setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
            }}
            value={currentBlockExplorerName}
          >
            {options}
          </Select>
        </div>
      )}

      <DataDisplay description={"Block Explorer"} data={currentBlockExplorer.url} isLink={true} />
    </>
  );
};

const option = blockExplorer => (
  <Select.Option key={blockExplorer.name} value={blockExplorer.name} style={{ lineHeight: 2 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{blockExplorer.name}</div>
  </Select.Option>
);

const DataDisplay = ({ description, data, isLink }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "0.5em" }}>
    <Tooltip title={description}>
      {isLink ? (
        <a href={data} target="_blank" rel="noopener noreferrer" style={{ color: `var(--link-color)` }}>
          {data}
        </a>
      ) : (
        <div>{data}</div>
      )}
    </Tooltip>
  </div>
);

/*
const isBuiltInNetwork = (chainId) => {
  return Object.values(NETWORKS).some(network => network.chainId == chainId);
}

const getBuiltInNetwork = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId == chainId);
}
*/
