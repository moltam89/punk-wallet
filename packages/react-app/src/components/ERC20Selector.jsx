import React from "react";

import {  NETWORKS } from "../constants";
import { Select } from "antd";



export default function ERC20Selector( {targetNetwork, token, setToken} ) {

    const options = [];

    options.push(
        <Select.Option key={targetNetwork.nativeToken} value={""}>
            <span style={{fontSize: 24 }}>
                {targetNetwork.nativeToken}
            </span>
        </Select.Option>
    );

    for (const tokenSymbol in targetNetwork.ERC20Tokens) {
        const token = targetNetwork.ERC20Tokens[tokenSymbol];

        options.push(
            <Select.Option key={tokenSymbol} value={tokenSymbol}>
                <span style={{fontSize: 24 }}>
                    {token.symbol}
                </span>
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
