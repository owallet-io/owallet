const ethUtil = require("ethereumjs-util");

const ERC20_ABI = require("ethereumjs-abi");
console.log("start test");

const message =
  "0x095ea7b30000000000000000000000009a0a02b296240d2620e339ccde386ff612f07be500000000000000000000000000000000000000000000000000000000003dcbe8";

// Remove the leading "0x" from the message
const cleanedMessage = message.slice(2);

const Web3 = require("web3");
const baseUrl = "https://rpc.ankr.com/eth";

const web3 = new Web3(new Web3.providers.HttpProvider(baseUrl)); // Replace with your Infura Project ID or Ethereum node URL

// Extract the method signature from the message
const methodSignature = cleanedMessage.slice(0, 8);
console.log("methodSignature", methodSignature);

// Get the method name from the ABI
const methodName = Object.keys(ERC20_ABI).find(key => {
  console.log("key", key);
  return ERC20_ABI[key].signature === methodSignature;
});
if (!methodName) {
  console.error("Method name not found in ABI");
  return;
}

// Get the method inputs from the ABI
const methodInputs = ERC20_ABI[methodName].inputs;

console.log("methodInputs", methodInputs);

// Extract the encoded parameters from the message
const encodedParameters = cleanedMessage.slice(8);

// Decode the parameters using the ABI
const decodedParameters = web3.eth.abi.decodeParameters(methodInputs, encodedParameters);

console.log(decodedParameters);
