import { Input } from "antd";
import React, { useEffect, useState } from "react";
import { useBalance } from "eth-hooks";

import {tokenDisplay} from "./ERC20Selector";

const { utils } = require("ethers");



export default function ERC20Input(props) {
  const token = props.token;
  const targetNetwork = props.targetNetwork;

  const tokenObject = targetNetwork.ERC20Tokens[token];
  const tokenSymbol = tokenObject.symbol;
  const tokenImgSrc = tokenObject.imgSrc;

  const [mode, setMode] = useState(props.price ? "USD" : props.token);
  const [display, setDisplay] = useState();
  const [value, setValue] = useState();
  const [displayMax, setDisplayMax] = useState();

  const currentValue = typeof props.value !== "undefined" ? props.value : value;

  const balance = useBalance(props.provider, props.address, 1000);
  let floatBalance = parseFloat("0.00");
  let usingBalance = balance;

  let gasCost = 0;

  if (usingBalance) {
    if (props.gasPrice) {
      gasCost = (parseInt(props.gasPrice, 10) * 150000) / 10 ** 18;
    }

    const etherBalance = utils.formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance - gasCost);
    if (floatBalance < 0) {
      floatBalance = 0;
    }
  }

  let displayBalance = floatBalance.toFixed(4);

  const price = props.price;

  function getBalance(_mode) {
    setValue(floatBalance);
    if (_mode === "USD") {
      displayBalance = (floatBalance * price).toFixed(2);
    } else {
      displayBalance = floatBalance.toFixed(4);
    }
    return displayBalance;
  }

  const option = title => {
    if (!props.price) return "";
    return (
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (mode === "USD") {
            setMode(props.token);
            displayMax ? setDisplay(getBalance("ETH")) : setDisplay(currentValue);
          } else if (mode === "ETH") {
            setMode("USD");
            if (currentValue) {
              const usdValue = "" + (parseFloat(currentValue) * props.price).toFixed(2);
              displayMax ? setDisplay(getBalance("USD")) : setDisplay(usdValue);
            } else {
              setDisplay(currentValue);
            }
          }
        }}
      >
        {title}
      </div>
    );
  };

  let prefix;
  let addonAfter;
  if (mode === "USD") {
    prefix = "$";
    addonAfter = option("USD 🔀");
  } else {
    prefix = "Ξ";
    addonAfter = option(props.token + " 🔀");
  }

/*
  const tokenDisplay = (name, imgSrc) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
      <img style={{ height: "1em", width: "1em" }} src={imgSrc} />
      {name}
    </div>
  );
*/

  useEffect(() => {
    if (!currentValue && !displayMax) {
      setDisplay("");
    }
  }, [currentValue]);

  return (
    <div>
      <span
        style={{ cursor: "pointer", color: "red", float: "right", marginTop: "-5px" }}
        onClick={() => {
          setDisplay(getBalance(mode));
          setDisplayMax(true);
          if (typeof props.onChange === "function") {
            props.onChange(floatBalance);
          }
        }}
      >
        max
      </span>
      <Input
        placeholder={props.placeholder ? props.placeholder : "amount in " + tokenSymbol}
        autoFocus={props.autoFocus}
        value={display}
        addonAfter={tokenDisplay(tokenSymbol, tokenImgSrc)}
        onChange={async e => {
          const newValue = e.target.value;
          setDisplayMax(false);
          if (mode === "USD") {
            const possibleNewValue = parseFloat(newValue);
            if (possibleNewValue) {
              const ethValue = possibleNewValue / props.price;
              setValue(ethValue);
              if (typeof props.onChange === "function") {
                props.onChange(ethValue);
              }
              setDisplay(newValue);
            } else {
              setDisplay(newValue);
            }
          } else {
            setValue(newValue);
            if (typeof props.onChange === "function") {
              props.onChange(newValue);
            }
            setDisplay(newValue);
          }
        }}
      />
    </div>
  );
}
