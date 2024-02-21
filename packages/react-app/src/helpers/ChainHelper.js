export const getBLockExplorer = (chain, name) => getBLockExplorers(chain).find(blockExplorer => blockExplorer.name == name);

export const getBLockExplorers = (chain) => chain.explorers.filter(explorer => isEIP3091Explorer(explorer));

export const getChain = (chainId) => chains.find(chain => chain.chainId == chainId)

const isEIP3091Explorer = (explorer) => explorer.standard == "EIP3091";

// This chain list is from
// https://github.com/ethereum-lists/
// https://chainid.network/chains.json

// ToDo: Update the list from time to time, e.g.:
//    https://github.com/DefiLlama/chainlist/blob/8f1c353d70e9a1b00a0b6bb07391a298561ab567/utils/fetch.js#L99
//    https://github.com/FrederikBolding/chainlist/blob/0395aa6ee3bb35c513c39afa0af9f80a3bfa4165/src/pages/index.tsx#L11

const getChains = async () => {
   const response = await fetch('https://chainid.network/chains.json');
   if (!response.ok) {
      // In case of error use currentChains
      throw new Error('Couldn\'t fetch chains');
   }
   const json = await response.json();
   return json;
}

const getLocalChains = async () => {
   const response = await require('../constants/chains.json');
   return response;
}

export async function initChains() {
   const chains = await getChains() || await getLocalChains();
   return chains;
}

// ONLY For testing
let chains = [];
initChains().then(result => {
   chains = result
   console.log(result)
});
