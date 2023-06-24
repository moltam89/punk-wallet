import { Input } from "antd";
import React, { useEffect, useState } from "react";
import { useBalance } from "eth-hooks";

import {tokenDisplay} from "./ERC20Selector";

const { utils } = require("ethers");

export default function ERC20Input({token, targetNetwork, setAmount}) {
  const tokenObject = targetNetwork.ERC20Tokens[token];
  const tokenSymbol = tokenObject.symbol;
  const tokenImgSrc = tokenObject.imgSrc;

  return (
    <div>
      <Input
        placeholder={"amount in " + tokenSymbol}
        addonAfter={tokenDisplay(tokenSymbol, tokenImgSrc)}
        onChange={async e => {
          setAmount(e.target.value);
        }}
      />
    </div>
  );
}
