import React from "react";

import {  NETWORKS } from "../constants";
import { Select } from "antd";



export default function ERC20Selector( {targetNetwork, token, setToken} ) {

    const options = [];

    options.push(
        <Select.Option key={targetNetwork.nativeToken} value={""}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly", fontSize: 24 }}>
                <img style={{height: "1em", width: "1em"}} src={targetNetwork.nativeTokenImg}/>
                {targetNetwork.nativeToken}
            </div>
        </Select.Option>
    );

    for (const tokenSymbol in targetNetwork.ERC20Tokens) {
        const token = targetNetwork.ERC20Tokens[tokenSymbol];

        options.push(
            <Select.Option key={tokenSymbol} value={tokenSymbol}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly", fontSize: 24 }}>
                    <img style={{height: "1em", width: "1em"}} src={targetNetwork.ERC20Tokens[tokenSymbol].img}/>
                    {token.symbol}
                </div>
            </Select.Option>
        );
    }

    const buidlSelect = (
        <div>
            <Select
                size="large"
                defaultValue={token ? targetNetwork.ERC20Tokens[token].symbol : targetNetwork.nativeToken}
                style={{ textAlign: "left", width: 170, fontSize: 30 }}
                listHeight={1024}
                onChange={value => {
                        setToken(value);    
                    }
                }
                >
                {options}
            </Select>
        </div>
    );

    return (
        <div>
            {buidlSelect}
        </div>
    );
}
