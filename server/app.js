const Web3 = require("web3").Web3;

// Connect to an Ethereum node (This could be a local node or a node hosted by a service like Infura)
const web3 = new Web3("http://127.0.0.1:7545");

// Define a function to mine a block
function mineEmptyBlock() {
  web3.currentProvider.send(
    {
      jsonrpc: "2.0",
      method: "evm_mine",
      id: new Date().getTime(),
    },
    (err, result) => {
      if (err) {
        console.error("Error mining block:", err);
      } else {
        console.log("Block mined:", result);
      }
    }
  );
}

// Call mineEmptyBlock every second
setInterval(mineEmptyBlock, 1000);

/* web3.currentProvider.send(
  {
    jsonrpc: "2.0",
    method: "evm_mine",
    id: new Date().getTime(),
  },
  () => {}
); */

/* // Your account's private key (excluding the '0x' prefix)
const privateKey =
  "f5c040d3f14dc41d7b18cb015d98097233c42259a9ab983dbd5c92d911eeaf70";

// Add the account to web3
const account = web3.eth.accounts.privateKeyToAccount(
  "0xf5c040d3f14dc41d7b18cb015d98097233c42259a9ab983dbd5c92d911eeaf70"
);

// Now you can use this account to send transactions without needing MetaMask
const tx = {
  // This is the address of the account to which you are sending Ether
  from: account.address,
  to: "0xFD2753BAD84b215d09E192cd5E077b14a0AB1514",
  value: "0", // Amount of Wei to send, e.g., '1000000000000000000' Wei is 1 Ether
  gas: 21000,
  gasPrice: 10,
};

// Sign the transaction with the private key of the sender
account
  .signTransaction(tx)
  .then((signedTx) => {
    // Send the transaction
    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .then((receipt) => {
        console.log("Transaction receipt: ", receipt);
      })
      .catch((err) => {
        console.error("Error sending transaction", err);
      });
  })
  .catch((err) => {
    console.error("Error signing transaction", err);
  });
 */
