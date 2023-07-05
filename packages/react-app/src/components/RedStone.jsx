import React, { useEffect, useState } from "react";

//import { getTokenBalance } from "../helpers/ERC20Helper";

export default function RedStone({}) {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        async function getBalance() {

        }

        getBalance();
    }, [])

    return (
        <div>
            RedStone
        </div>
    );
}
