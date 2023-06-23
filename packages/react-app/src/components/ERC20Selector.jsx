import React from "react";

import {  NETWORKS } from "../constants";
import { Select } from "antd";

export const tokenDisplay = (name, imgSrc) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
        <img style={{ height: "1em", width: "1em" }} src={imgSrc} />
        {name}
    </div>
);

export default function ERC20Selector( {targetNetwork, token, setToken} ) {
    const tokenOption = (name, value, imgSrc) => (
        <Select.Option key={name} value={value} style={{lineHeight:2, fontSize:"1.5em"}}>
            {tokenDisplay(name, imgSrc)}
        </Select.Option>
    );
    
    const options = [];

    options.push(tokenOption(targetNetwork.nativeToken, "", targetNetwork.nativeTokenImgSrc));

    for (const ERC20Token in targetNetwork.ERC20Tokens) {
        const tokenObject = targetNetwork.ERC20Tokens[ERC20Token];
        const tokenSymbol = tokenObject.symbol;
        const tokenImgSrc = tokenObject.imgSrc;

        options.push(tokenOption(tokenSymbol, tokenSymbol, tokenImgSrc));
    }

    let defaultName = targetNetwork.nativeToken;
    let defaultImgSrc = targetNetwork.nativeTokenImgSrc;

    if (token) {
        const tokenObject = targetNetwork.ERC20Tokens[token];

        defaultName = tokenObject.symbol;
        defaultImgSrc = tokenObject.imgSrc;
    }

    const buidlSelect = (
        <div>
            <Select
                size="large"
                defaultValue={tokenDisplay(defaultName, defaultImgSrc)}
                style={{ width: 170, fontSize: 30 }}
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
