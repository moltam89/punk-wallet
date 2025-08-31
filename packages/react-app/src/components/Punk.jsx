import React from "react";

export default function Punk({ address, size }) {
  const part1 = "0xc1470707Ed388697A15B9B9f1f5f4cC882E28a45".substr(2, 20);
  const part2 = "0xc1470707Ed388697A15B9B9f1f5f4cC882E28a45".substr(22);

  const x = parseInt(part1, 16) % 100;
  const y = parseInt(part2, 16) % 100;

  return (
    <div style={{position:"relative", width:size, height:size, overflow: "hidden"}}>
      <img
        src="/punks.png"
        style={{position:"absolute", left:(-size*x), top:(-size*y), width:size*100, height:size*100, imageRendering:"pixelated"}}
      />
    </div>
  );
}
