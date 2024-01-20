import React from "react";

import { Blockie, Punk } from "./";
import { BLOCKIES_DEFAULT_SIZE } from "./QRPunkBlockie";

export default function PunkBlockie({ address, size }) {
  return (
    <div>
      <div class="outer">
        <div class="below" style={{ opacity: "0.5", width: size, height: size }}>
          <Blockie address={address} scale={size / BLOCKIES_DEFAULT_SIZE} />
        </div>
        <div class="top">
          <Punk address={address} size={size} />
        </div>
      </div>
    </div>
  );
}
