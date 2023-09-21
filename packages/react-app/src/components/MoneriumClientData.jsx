import React from "react";

import { Select } from "antd";

export const tokenDisplay = (name, imgSrc) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
        <img style={{ height: "1em", width: "1em" }} src={imgSrc} />
        {name}
    </div>
);

const getShortAddress  = (address) => {
    return address.slice(0, 6);
}

export default function MoneriumClientData({ clientData }) {
    const tokenOption = (name, value, imgSrc) => (
        <Select.Option key={name} value={value} style={{lineHeight:2, fontSize:24}}>
            {tokenDisplay(name, imgSrc)}
        </Select.Option>
    );

    const DEFAULT_VALUE = getShortAddress(clientData.addressesArray[0]);
    
    const options = [];

    options.push(tokenOption(DEFAULT_VALUE, DEFAULT_VALUE, "/EURe.png"));

    for (const address of clientData.addressesArray) {
        options.push(tokenOption(getShortAddress(address), getShortAddress(address), "/EURe.png"));
    }

    return (
        <div>
            <Select
                size="large"
                defaultValue={DEFAULT_VALUE}
                style={{ width: 170, fontSize: 24 }}
                listHeight={1024}
                onChange={value => {
                    console.log("value", value);
                }}
            >
                {options}
            </Select>
        </div>
    );
}
