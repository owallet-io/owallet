const { BitcoinUnit } = require("bitcoin-units");
const { walletHelpers } = require("./walletApi");
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");
const bip39 = require("bip39");
const bip32 = require("bip32");
const moment = require("moment");
const bip21 = require("bip21");
const Url = require("url-parse");
const {
  networks,
  availableCoins,
  defaultWalletShape,
  getCoinData,
} = require("./networks");
const {
  getTransaction,
  getTransactionHex,
  getTransactionHexByBlockStream,
} = require("./electrum");
const { validate, getAddressInfo } = require("bitcoin-address-validation");
const BigNumber = require("bignumber.js");
const accumulative = require("coinselect/accumulative");
const { MIN_FEE_RATE } = require("@owallet/common");
/*
This batch sends addresses and returns the balance of utxos from them
 */
const processBalanceFromUtxos = ({
  utxos,
  address,
  path,
  currentBlockHeight = 0,
}) => {
  let balance = 0;
  let utxosData = [];
  if (!utxos || utxos?.length === 0) {
    return {
      balance,
      utxos: utxosData,
    };
  }
  utxos.forEach((utxo) => {
    balance = balance + Number(utxo.value);
    const data = {
      address: address, //Required
      path: path, //Required
      value: utxo.value, //Required
      confirmations: currentBlockHeight - Number(utxo.status.block_height ?? 0), //Required
      blockHeight: utxo.status.block_height ?? 0,
      txid: utxo.txid, //Required (Same as tx_hash_big_endian)
      vout: utxo.vout, //Required (Same as tx_output_n)
      tx_hash: utxo.txid,
      tx_hash_big_endian: utxo.txid,
      tx_output_n: utxo.vout,
    };
    utxosData.push(data);
  });
  return {
    balance,
    utxos: utxosData,
  };
};
const getBalanceFromUtxos = async ({
  addresses = [],
  changeAddresses = [],
  selectedCrypto,
} = {}) => {
  try {
    const result = await walletHelpers.utxos.default({
      addresses,
      changeAddresses,
      selectedCrypto,
    });
    return result;
  } catch (e) {
    console.log(e);
    return { error: false, data: [] };
  }
};

const getFeeRate = async ({ blocksWillingToWait = 2, url }) => {
  const feeRate = await (await fetch(`${url}/fee-estimates`)).json();
  const feeRateByBlock = feeRate?.[blocksWillingToWait];
  if (!feeRateByBlock) {
    throw Error("Not found Fee rate");
  }
  return feeRateByBlock > MIN_FEE_RATE ? feeRateByBlock : MIN_FEE_RATE;
};
//Returns: { error: bool, isPrivateKey: bool, network: Object }
const validatePrivateKey = (privateKey = "") => {
  try {
    let verified = false;
    let network = "";
    for (let key in networks) {
      if (verified === true) return;
      try {
        bitcoin.ECPair.fromWIF(privateKey, networks[key]);
        verified = true;
        network = key;
        break;
      } catch (e) {
        verified = false;
      }
    }
    return { error: false, isPrivateKey: verified, network };
  } catch (e) {
    console.log(e);
    return false;
  }
};

const validateAddress = (address = "", selectedCrypto = "") => {
  try {
    //Validate address for a specific network
    if (selectedCrypto !== "") {
      const network = getCoinNetwork(selectedCrypto);
      bitcoin.address.toOutputScript(address, network);
    } else {
      //Validate address for all available networks
      let isValid = false;
      let coin = bitcoin;
      for (let i = 0; i < availableCoins.length; i++) {
        if (validateAddress(address, availableCoins[i]).isValid) {
          isValid = true;
          coin = availableCoins[i];
          break;
        }
      }
      return { isValid, coin };
    }
    return { isValid: true, coin: selectedCrypto };
  } catch (e) {
    // console.log('🚀 ~ file: helpers.js:83 ~ validateAddress ~ e:', e);
    return { isValid: false, coin: selectedCrypto };
  }
};

const parsePaymentRequest = (data = "") => {
  const failure = (errorMsg = "Unable To Read The QR Code.") => {
    return { error: true, data: errorMsg };
  };
  try {
    //Determine how to handle the data
    if (data) {
      let validateAddressResult = validateAddress(data);
      //If is a string and Bitcoin Address
      if (
        validateAddressResult.isValid &&
        typeof data === "string" &&
        !data.includes(":" || "?" || "&" || "//")
      ) {
        return {
          error: false,
          data: {
            address: data,
            coin: validateAddressResult.coin,
            amount: "",
            label: "",
          },
        };
      }

      //Determine if we need to parse the data.
      if (data.includes(":" || "?" || "&" || "//")) {
        try {
          //Remove slashes
          if (data.includes("//")) data = data.replace("//", "");
          //bip21.decode will throw if anything other than "bitcoin" is passed to it.
          //Replace any instance of "testnet" or "litecoin" with "bitcoin"
          if (data.includes(":")) {
            data = data.substring(data.indexOf(":") + 1);
            data = `bitcoin:${data}`;
          }
          const result = bip21.decode(data);
          const address = result.address;
          validateAddressResult = validateAddress(address);
          //Ensure address is valid
          if (!validateAddressResult.isValid) {
            return failure(data);
          }
          let amount = "";
          let message = "";
          try {
            amount = result.options.amount || "";
          } catch (e) {}
          try {
            message = result.options.message || "";
          } catch (e) {}
          return {
            error: false,
            data: {
              address,
              coin: validateAddressResult.coin,
              amount,
              message,
              label: message,
            },
          };
        } catch (e) {
          console.log(e);
          return failure(data);
        }
      } else {
        return failure(data);
      }
    } else {
      return failure();
    }
  } catch (e) {
    console.log(e);
    return failure();
  }
};

const getDifferenceBetweenDates = ({
  start = "",
  end = "",
  time = "minutes",
} = {}) => {
  try {
    if (!moment.isMoment(start)) start = moment(start);
    if (!moment.isMoment(end)) end = moment(end);
    if (start.isValid() && end.isValid) {
      return end.diff(start, time);
    }
    return 0;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

//Retrived from : https://github.com/bitcoinjs/bitcoinjs-lib/issues/1238
/*
const convert_zpub_to_xpub = (z) => {
  let data = b58.decode(z);
  data = data.slice(4);
  data = Buffer.concat([Buffer.from("0488b21e","hex"), data]);
  return b58.encode(data);
};
*/

const getTransactionData = async ({
  txId = "",
  selectedCrypto = "bitcoin",
} = {}) => {
  const failure = (data = "") => {
    return { error: true, data };
  };
  try {
    const network = getNetworkType(selectedCrypto);
    const url =
      network === "mainnet"
        ? `https://api.blockcypher.com/v1/btc/main/txs/${txId}`
        : `https://api.blockcypher.com/v1/btc/test3/txs/${txId}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    try {
      if (jsonResponse.error) {
        return failure("No transaction data found.");
      }
    } catch (e) {}
    return { error: false, data: jsonResponse };
  } catch (e) {
    console.log(e);
    return failure(e);
  }
};

const getExchangeRate = async ({
  selectedCrypto = "bitcoin",
  selectedCurrency = "usd",
  selectedService = "coingecko",
} = {}) => {
  const failure = (errorTitle = "", errorMsg = "") => {
    return { error: true, errorTitle, errorMsg };
  };

  // const isConnected = await isOnline();
  // if (!isConnected) {
  //   return failure('Offline');
  // }

  let exchangeRate = 0;
  try {
    exchangeRate = await walletHelpers.exchangeRate.default({
      service: selectedService,
      selectedCurrency,
      selectedCrypto,
    });
    if (exchangeRate.error) failure("Invalid Exchange Rate Data");
    return { error: false, data: exchangeRate.data };
  } catch (e) {
    return failure(e.message);
  }
};
const btcToFiat = ({ amount = 0, exchangeRate = 0, currencyFiat = "usd" }) => {
  amount = Number(amount);
  BitcoinUnit.setFiat(currencyFiat, exchangeRate);
  return new BitcoinUnit(amount, "BTC").to(currencyFiat).getValue().toFixed(2);
};
const getAddressTransactions = async ({
  address = "",
  addresses = [],
  changeAddresses = [],
  currentBlockHeight = 0,
  selectedCrypto = "bitcoin",
} = {}) => {
  const failure = (data = "") => {
    return { error: true, data };
  };

  const isConnected = await Promise.all(isOnline());
  if (!isConnected || isConnected === false) {
    return failure("Offline");
  }

  try {
    const response = await walletHelpers.history.default({
      address,
      addresses,
      changeAddresses,
      currentBlockHeight,
      selectedCrypto,
    });
    if (response.error === true) {
      return failure("No transaction data found.");
    }
    const transactions = response.data;
    return { error: false, data: transactions };
  } catch (e) {
    return failure(e);
  }
};

const getAllTransactions = async ({
  allAddresses = [],
  addresses = [],
  changeAddresses = [],
  currentBlockHeight = 0,
  selectedCrypto = "bitcoin",
} = {}) => {
  const failure = (data = "") => {
    return { error: true, data };
  };

  const isConnected = await isOnline();
  if (!isConnected || isConnected === false) {
    return failure("Offline");
  }

  try {
    const response = await walletHelpers.history.default({
      allAddresses,
      addresses,
      changeAddresses,
      currentBlockHeight,
      selectedCrypto,
    });
    if (response.error === true) {
      return failure("No transaction data found.");
    }
    return response;
  } catch (e) {
    return failure(e);
  }
};

const isOnline = async () => {
  try {
    const connectionInfo = await NetInfo.fetch();
    return connectionInfo.isConnected;
  } catch {
    return false;
  }
};

//Remove any duplicates based off of matches from the provided value
const removeDupsFromArrOfObj = (arr = [], value = "") => {
  try {
    return arr.reduce(
      (x, y) => (x.findIndex((e) => e[value] === y[value]) < 0 ? [...x, y] : x),
      []
    );
  } catch (e) {
    console.log(e);
    return arr;
  }
};

//This returns either "mainnet" or "testnet" and assumes the following selectedCrypto format "coinTestnet"
const getNetworkType = (selectedCrypto = "bitcoin") => {
  try {
    selectedCrypto = selectedCrypto.toLowerCase();
    const isTestnet = selectedCrypto.includes("testnet");
    return isTestnet ? "testnet" : "mainnet";
  } catch (e) {
    return "testnet";
  }
};

const getTransactionSize = (numInputs, numOutputs) => {
  return numInputs * 180 + numOutputs * 34 + 10 + numInputs;
};
const convertStringToMessage = (str) => {
  if (!str) return "";
  const text = Buffer.from(str, "utf8").toString("hex").toUpperCase();
  const textHex = Buffer.from(text, "hex");
  return textHex;
};
const calculatorFee = ({ utxos = [], transactionFee = 1, message = "" }) => {
  if (message && message.length > 80) {
    throw new Error("message too long, must not be longer than 80 chars.");
  }
  if (utxos.length === 0) return 0;
  const feeRateWhole = Math.ceil(transactionFee);
  const compiledMemo = message ? compileMemo(message) : null;
  const fee = getFeeFromUtxos(utxos, feeRateWhole, compiledMemo);
  return fee;
};
const createMsg = ({
  address,
  amount,
  totalFee,
  changeAddress,
  confirmedBalance,
  message = "",
  selectedCrypto,
}) => {
  const network = networks[selectedCrypto];
  let targets = [];
  if (amount > 0) {
    targets.push({ address, value: amount });
  }

  //Change address and amount to send back to wallet.
  if (changeAddress) {
    targets.push({
      address: changeAddress,
      value: confirmedBalance - (amount + totalFee),
    });
  }

  //Embed any OP_RETURN messages.
  if (message !== "") {
    const messageLength = message.length;
    const lengthMin = 5;
    //This is a patch for the following: https://github.com/coreyphillips/moonshine/issues/52
    const buffers = [message];
    if (messageLength > 0 && messageLength < lengthMin)
      buffers.push(Buffer.from(" ".repeat(lengthMin - messageLength), "utf8"));
    const data = Buffer.concat(buffers);
    const embed = bitcoin.payments.embed({ data: [data], network });
    targets.push({ script: embed.output, value: 0 });
  }
  return targets;
};
const signAndCreateTransaction = async ({
  selectedCrypto,
  mnemonic,
  utxos,
  blacklistedUtxos,
  targets,
}) => {
  try {
    const network = networks[selectedCrypto];
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, network);
    const psbt = new bitcoin.Psbt({ network });

    //Add Inputs
    const utxosLength = utxos.length;
    for (let i = 0; i < utxosLength; i++) {
      try {
        const utxo = utxos[i];
        if (blacklistedUtxos.includes(utxo.tx_hash)) continue;
        const path = utxo.path;
        const keyPair = root.derivePath(path);

        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network,
        });
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: p2wpkh.output,
            value: utxo.value,
          },
        });
      } catch (e) {
        console.log(e);
      }
    }

    //Shuffle and add outputs.
    try {
      targets = shuffleArray(targets);
    } catch (e) {}

    targets.forEach((target) => {
      //Check if OP_RETURN
      let isOpReturn = false;
      try {
        isOpReturn = !!target.script;
      } catch (e) {}
      if (isOpReturn) {
        psbt.addOutput({
          script: target.script,
          value: target.value,
        });
      } else {
        psbt.addOutput({
          address: target.address,
          value: target.value,
        });
      }
    });

    //Loop through and sign
    let index = 0;
    for (let i = 0; i < utxosLength; i++) {
      try {
        const utxo = utxos[i];
        if (blacklistedUtxos.includes(utxo.tx_hash)) continue;
        const path = utxo.path;
        const keyPair = root.derivePath(path);
        psbt.signInput(index, keyPair);
        index++;
      } catch (e) {
        console.log(e);
      }
    }
    psbt.finalizeAllInputs();
    const rawTx = psbt.extractTransaction(true).toHex();
    const data = { error: false, data: rawTx };

    return data;
  } catch (e) {
    console.log("🚀 ~ file: helpers.js:501 ~ e:", e);

    return { error: true, data: e };
  }
};
//amount = Amount to send to recipient.
//transactionFee = fee per byte.
const createTransaction = async ({
  recipient = "",
  transactionFee = MIN_FEE_RATE,
  amount = 0,
  utxos = [],
  sender = "",
  keyPair,
  selectedCrypto = "bitcoin",
  message = "",
  totalFee = 0,
} = {}) => {
  try {
    const { psbt } = await buildTx({
      recipient: recipient,
      amount: amount,
      utxos: utxos,
      sender: sender,
      memo: message,
      selectedCrypto,
      totalFee,
      transactionFee,
      keyPair,
      isLedger: false,
    });
    psbt.signAllInputs(keyPair); // Sign all inputs
    psbt.finalizeAllInputs(); // Finalise inputs

    const rawTx = psbt.extractTransaction(true).toHex();
    const data = { error: false, data: rawTx };

    return data;
  } catch (e) {
    console.log(e);
    return { error: true, data: e };
  }
};
/**
 * Compile memo.
 *
 * @param {string} memo The memo to be compiled.
 * @returns {Buffer} The compiled memo.
 */
const compileMemo = (memo) => {
  const data = Buffer.from(memo, "utf8"); // converts MEMO to buffer
  return bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, data]); // Compile OP_RETURN script
};

const buildTx = async ({
  recipient = "",
  transactionFee = 1,
  amount = 0,
  utxos = [],
  sender = "",
  selectedCrypto = "bitcoin",
  memo = "",
  totalFee,
  keyPair,
  isLedger = false,
}) => {
  if (memo && memo.length > 80) {
    throw new Error("message too long, must not be longer than 80 chars.");
  }
  if (!validateAddress(recipient, selectedCrypto).isValid)
    throw new Error("Invalid address");
  if (utxos.length === 0)
    throw new Error("Insufficient Balance for transaction");

  const utxosWithHex = await Promise.all(
    utxos.map(async (item, index) => {
      const transaction = await getTransactionHexByBlockStream({
        txId: item.txid,
        coin: selectedCrypto,
      });
      if (!transaction.error) {
        return {
          hex: transaction.data,
          ...item,
        };
      }
      throw Error(`Not get transactionHex By TxId + ${item.txid}`);
    })
  );

  const addressType = getAddressTypeByAddress(sender);
  const utxosData =
    addressType === "bech32" && !isLedger ? utxos : utxosWithHex;
  const feeRateWhole = Math.ceil(transactionFee);
  const compiledMemo = memo ? compileMemo(memo) : null;
  const targetOutputs = [];

  //1. add output amount and recipient to targets
  targetOutputs.push({
    address: recipient,
    value: amount,
  });
  //2. add output memo to targets (optional)
  if (compiledMemo) {
    targetOutputs.push({ script: compiledMemo, value: 0 });
  }
  const { inputs, outputs, fee } = accumulative(
    utxosData,
    targetOutputs,
    feeRateWhole
  );

  if (!fee) throw new Error("Not Found Fee");
  const MIN_FEE = 600;
  const maxFee = Math.max(fee + 100, MIN_FEE);
  const minFee = Math.max(fee - 100, MIN_FEE);
  if (totalFee > maxFee || totalFee < minFee) throw new Error("Fee not match");
  // .inputs and .outputs will be undefined if no solution was found
  if (!inputs || !outputs)
    throw new Error("Insufficient Balance for transaction");

  const psbt = new bitcoin.Psbt({ network: networks[selectedCrypto] }); // Network-specific

  // psbt add input from accumulative inputs
  inputs.forEach((utxo) => {
    const extraData = (() => {
      if (addressType === "legacy") {
        return { nonWitnessUtxo: Buffer.from(utxo.hex, "hex") };
      } else if (addressType === "bech32") {
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network: networks[selectedCrypto],
        });
        return {
          witnessUtxo: {
            script: p2wpkh.output,
            value: utxo.value,
          },
        };
      }
    })();

    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      ...extraData,
    });
  });

  // psbt add outputs from accumulative outputs
  outputs.forEach((output) => {
    if (!output.address) {
      //an empty address means this is the  change ddress
      output.address = sender;
    }
    if (!output.script) {
      psbt.addOutput(output);
    } else {
      //we need to add the compiled memo this way to
      //avoid dust error tx when accumulating memo output with 0 value
      if (compiledMemo) {
        psbt.addOutput({ script: compiledMemo, value: 0 });
      }
    }
  });
  return { psbt, utxos: utxosData, inputs, fee };
};
const fetchData = (type, params) => {
  switch (type.toLowerCase()) {
    case "post":
      return {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
        }),
      };
    default:
      return {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
  }
};

const getCoinNetwork = (coin = "") => {
  return networks[coin];
};
const getKeyPairByPrivateKey = ({ selectedCrypto = "bitcoin", privateKey }) => {
  if (!privateKey) throw Error("Private Key is not Empty");
  const network = networks[selectedCrypto]; //Returns the network object based on the selected crypto.
  const keyPair = bitcoin.ECPair.fromPrivateKey(privateKey, {
    network: network,
  });
  return keyPair;
};
const getKeyPairByMnemonic = ({
  selectedCrypto = "bitcoin",
  keyDerivationPath = "84",
  addressIndex = 0,
  mnemonic,
}) => {
  const coinTypePath = defaultWalletShape.coinTypePath[selectedCrypto];
  const network = networks[selectedCrypto]; //Returns the network object based on the selected crypto.

  const root = bip32.fromSeed(bip39.mnemonicToSeedSync(mnemonic), network);
  const addressPath = `m/${keyDerivationPath}'/${coinTypePath}'/0'/0/${addressIndex}`;
  const keyPair = root.derivePath(addressPath);
  return keyPair;
};

const generateAddresses = async ({
  addressAmount = 0,
  changeAddressAmount = 0,
  mnemonic,
  addressIndex = 0,
  changeAddressIndex = 0,
  selectedCrypto = "bitcoin",
  keyDerivationPath = "84",
  addressType = "bech32",
} = {}) => {
  const failure = (data) => {
    return { error: true, data };
  };
  try {
    const coinTypePath = defaultWalletShape.coinTypePath[selectedCrypto];
    const network = networks[selectedCrypto]; //Returns the network object based on the selected crypto.

    addressType = addressType.toLowerCase();

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, network);
    let addresses = [];
    let changeAddresses = [];

    //Generate Addresses
    let addressArray = new Array(addressAmount).fill(null);
    let changeAddressArray = new Array(changeAddressAmount).fill(null);
    await Promise.all(
      addressArray.map(async (item, i) => {
        try {
          const addressPath = `m/${keyDerivationPath}'/${coinTypePath}'/0'/0/${
            i + addressIndex
          }`;
          const addressKeypair = root.derivePath(addressPath);
          const address = getAddress(addressKeypair, network, addressType);
          const scriptHash = getScriptHash(address, network);
          addresses.push({ address, path: addressPath, scriptHash });
          return { address, path: addressPath, scriptHash };
        } catch (e) {}
      }),
      changeAddressArray.map(async (item, i) => {
        try {
          const changeAddressPath = `m/${keyDerivationPath}'/${coinTypePath}'/0'/1/${
            i + changeAddressIndex
          }`;
          const changeAddressKeypair = root.derivePath(changeAddressPath);
          const address = getAddress(
            changeAddressKeypair,
            network,
            addressType
          );
          const scriptHash = getScriptHash(address, network);
          changeAddresses.push({
            address,
            path: changeAddressPath,
            scriptHash,
          });
          return { address, path: changeAddressPath, scriptHash };
        } catch (e) {}
      })
    );
    return { error: false, data: { addresses, changeAddresses } };
  } catch (e) {
    console.log(e);
    return failure(e);
  }
};

const getAddress = (keyPair, network, type = "bech32") => {
  try {
    if (typeof network === "string" && network in networks)
      network = networks[network];
    switch (type) {
      case "bech32":
        //Get Native Bech32 (bc1) addresses
        return bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network })
          .address;
      case "segwit":
        //Get Segwit P2SH Address (3)
        return bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey,
            network,
          }),
          network,
        }).address;
      //Get Legacy Address (1)
      case "legacy":
        return bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network })
          .address;
    }
  } catch {
    return "";
  }
};

//Used to validate price inputs.
//Removes multiple decimal places and only allows for 2 chars after a decimal place.
const parseFiat = (text) => {
  function removeDecimals(str) {
    return str.replace(/^([^.]*\.)(.*)$/, function (a, b, c) {
      return b + c.replace(/\./g, "");
    });
  }
  try {
    text = text.toString();
    text = removeDecimals(text);
    const decimalIndex = text.indexOf(".");
    if (decimalIndex !== -1) {
      text = text.substr(0, decimalIndex + 3);
    }
    text = text.replace(/[^\d\.]/g, "");
    return text;
  } catch (e) {
    console.log(e);
  }
};

const capitalize = (str = "") => {
  try {
    //Add a space before any non-consecutive capital letter
    str = str.replace(/([A-Z]+)/g, " $1").trim();
    //Capitalize the first letter of the final string
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (e) {
    return str;
  }
};

const openUrl = (url = "") => {
  try {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  } catch (e) {
    console.log(e);
  }
};

const openTxId = (txid = "", selectedCrypto = "") => {
  if (!txid || !selectedCrypto) return;
  let url = "";
  if (selectedCrypto === "bitcoin") url = `https://blockstream.info/tx/${txid}`;
  if (selectedCrypto === "bitcoinTestnet")
    url = `https://blockstream.info/testnet/tx/${txid}`;
  if (selectedCrypto === "litecoin") url = `https://chain.so/tx/LTC/${txid}`;
  if (selectedCrypto === "litecoinTestnet")
    url = `https://chain.so/tx/LTCTEST/${txid}`;
  openUrl(url);
};

const pauseExecution = (duration = 500) => {
  return new Promise(async (resolve) => {
    try {
      const wait = () => resolve({ error: false });
      setTimeout(wait, duration);
    } catch (e) {
      console.log(e);
      resolve({ error: true });
    }
  });
};

const vibrate = (type = "impactHeavy") => {
  try {
    if (type === "default") {
      Vibration.vibrate(1000);
      return;
    }
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    ReactNativeHapticFeedback.trigger(type, options);
  } catch (e) {
    console.log(e);
  }
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//Get the nth pattern in a string.
const nthIndex = (str, pat, n) => {
  let L = str.length,
    i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
};

//Get info from an address path ("m/49'/0'/0'/0/1")
const getInfoFromAddressPath = async (path = "") => {
  try {
    if (path === "") return { error: true, data: "No path specified" };
    let isChangeAddress = false;
    const lastIndex = path.lastIndexOf("/");
    const addressIndex = Number(path.substr(lastIndex + 1));
    const firstIndex = path.lastIndexOf("/", lastIndex - 1);
    const addressType = path.substr(firstIndex + 1, lastIndex - firstIndex - 1);
    if (Number(addressType) === 1) isChangeAddress = true;
    return { error: false, isChangeAddress, addressIndex };
  } catch (e) {
    console.log(e);
    return { error: true, isChangeAddress: false, addressIndex: 0 };
  }
};
const TX_EMPTY_SIZE = 4 + 1 + 1 + 4; //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4; // 41
const TX_INPUT_PUBKEYHASH = 107;
const TX_OUTPUT_BASE = 8 + 1; //9
const TX_OUTPUT_PUBKEYHASH = 25;
const inputBytes = (input) => {
  return (
    TX_INPUT_BASE +
    (input.witnessUtxo?.script
      ? input.witnessUtxo?.script.length
      : TX_INPUT_PUBKEYHASH)
  );
};
const MIN_TX_FEE = 1000;
const getFeeFromUtxos = (utxos, feeRate, data) => {
  const inputSizeBasedOnInputs =
    utxos.length > 0
      ? utxos.reduce((a, x) => a + inputBytes(x), 0) + utxos.length // +1 byte for each input signature
      : 0;
  let sum =
    TX_EMPTY_SIZE +
    inputSizeBasedOnInputs +
    TX_OUTPUT_BASE +
    TX_OUTPUT_PUBKEYHASH +
    TX_OUTPUT_BASE +
    TX_OUTPUT_PUBKEYHASH;

  if (data) {
    sum += TX_OUTPUT_BASE + data.length;
  }
  const fee = sum * feeRate;
  return fee > MIN_TX_FEE ? fee : MIN_TX_FEE;
};

//Solution located here: https://stackoverflow.com/questions/3753483/javascript-thousand-separator-string-format/19840881
//This inserts commas appropriately in a number and does not insert commas after a decimal.
const formatNumber = (num) => {
  const n = String(num),
    p = n.indexOf(".");
  return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) =>
    p < 0 || i < p ? `${m},` : m
  );
};

const removeDecimals = (str) => {
  return str.replace(/^([^.]*\.)(.*)$/, function (a, b, c) {
    return b + c.replace(/\./g, "");
  });
};

const removeAllButFirstInstanceOfPeriod = (s) => {
  try {
    if (s.length >= 2 && s.charAt(0) === "0" && s.charAt(1) !== ".") {
      while (s.charAt(0) === "0" && s.charAt(1) !== ".") {
        s = s.substr(1);
      }
    }
    if (s.charAt(0) === "." && s.length === 1) s = "0.";
    s = removeDecimals(s);
    const decimalIndex = s.includes(".");
    if (decimalIndex) {
      s = s.substr(0, decimalIndex + 9);
    }
    s = s.replace(/[^\d\.]/g, "");
    //Remove Leading Zeroes
    s = s.replace(/^00+/g, "0");
    return s;
  } catch (e) {
    console.log(e);
  }
};

//Returns an array of messages from an OP_RETURN message
const decodeOpReturnMessage = (opReturn = "") => {
  try {
    //Remove OP_RETURN from the string & trim the string.
    if (opReturn.includes("OP_RETURN")) {
      opReturn = opReturn.replace("OP_RETURN", "");
      opReturn = opReturn.trim();
    }

    const regex = /[0-9A-Fa-f]{6}/g;
    let messages = [];
    //Separate the string into an array based upon a space and insert each message into an array to be returned
    const data = opReturn.split(" ");
    data.forEach((message) => {
      try {
        //Ensure the message is in fact a hex
        if (regex.test(message)) {
          message = new Buffer(message, "hex");
          message = message.toString();
          messages.push(message);
        }
      } catch (e) {}
    });
    return messages;
  } catch (e) {
    console.log(e);
  }
};

const signMessage = async ({
  message = "",
  addressType = "bech32",
  path = "m/84'/0'/0'/0/0",
  mnemonic,
  selectedCrypto = "bitcoin",
} = {}) => {
  try {
    if (message === "") return { error: true, data: "No message to sign." };
    const network = networks[selectedCrypto];
    const messagePrefix = network.messagePrefix;
    const seed = bip39.mnemonicToSeedSync(mnemonic, bip39Passphrase);
    const root = bip32.fromSeed(seed, network);
    const keyPair = root.derivePath(path);
    const privateKey = keyPair.privateKey;

    let sigOptions = { extraEntropy: randomBytes(32) };
    if (addressType === "bech32") sigOptions["segwitType"] = "p2wpkh";
    if (addressType === "segwit") sigOptions["segwitType"] = "p2sh(p2wpkh)";

    let signature = "";
    if (addressType === "legacy") {
      signature = bitcoinMessage.signElectrum(
        message,
        privateKey,
        keyPair,
        messagePrefix
      );
    } else {
      signature = bitcoinMessage.signElectrum(
        message,
        privateKey,
        keyPair.compressed,
        messagePrefix,
        sigOptions
      );
    }
    signature = signature.toString("base64");

    const address = getAddress(keyPair, network, addressType);
    const isVerified = verifyMessage({
      message,
      address,
      signature,
      selectedCrypto,
    });
    if (isVerified === true)
      return { error: false, data: { address, message, signature } };
    return { error: true, data: "Unable to verify signature." };
  } catch (e) {
    return { error: true, data: e };
  }
};

const verifyMessage = ({
  message = "",
  address = "",
  signature = "",
  selectedCrypto = "",
} = {}) => {
  try {
    const network = networks[selectedCrypto];
    const messagePrefix = network.messagePrefix;
    let isValid = false;
    try {
      isValid = bitcoinMessage.verify(
        message,
        address,
        signature,
        messagePrefix
      );
    } catch (e) {}
    //This is a fix for https://github.com/bitcoinjs/bitcoinjs-message/issues/20
    if (!isValid)
      isValid = bitcoinMessage.verifyElectrum(
        message,
        address,
        signature,
        messagePrefix
      );
    return isValid;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getBaseDerivationPath = ({
  keyDerivationPath = "84",
  selectedCrypto = "bitcoin",
}) => {
  try {
    const networkValue = defaultWalletShape.coinTypePath[selectedCrypto];
    return `m/${keyDerivationPath}'/${networkValue}'/0'/0/0`;
  } catch (e) {
    return { error: true, data: e };
  }
};

const decodeURLParams = (url) => {
  const hashes = url.slice(url.indexOf("?") + 1).split("&");
  return hashes.reduce((params, hash) => {
    const split = hash.indexOf("=");
    if (split < 0) return Object.assign(params, { [hash]: null });
    const key = hash.slice(0, split);
    const val = hash.slice(split + 1);
    return Object.assign(params, { [key]: decodeURIComponent(val) });
  }, {});
};

const loginWithBitid = async ({
  url = "",
  addressType = "bech32",
  keyDerivationPath,
  selectedCrypto,
  selectedWallet,
} = {}) => {
  try {
    //Get the base derivation path based on the current derivation path key.
    const path = getBaseDerivationPath({ keyDerivationPath, selectedCrypto });
    //Sign the message
    const signMessageResponse = await signMessage({
      message: url,
      addressType,
      path,
      selectedWallet,
      selectedCrypto,
    });
    //Check for signing error
    if (signMessageResponse.error)
      return { error: true, data: signMessageResponse.data };
    const { address, signature } = signMessageResponse.data;
    const parsedURL = new Url(url);
    const response = await fetch(
      `https://${parsedURL.hostname}${parsedURL.pathname}`,
      fetchData("POST", { uri: url, address, signature })
    );
    const responseJson = await response.json();
    return { error: false, data: responseJson };
  } catch (e) {
    console.log(e);
    return { error: true, data: e };
  }
};

const sortArrOfObjByKey = (arr = [], key = "", ascending = true) => {
  try {
    if (ascending) return arr.sort((a, b) => a[key] - b[key]);
    return arr.sort((a, b) => b[key] - a[key]);
  } catch (e) {
    return arr;
  }
};

const getFiatBalance = ({ balance = 0, exchangeRate = 0 } = {}) => {
  try {
    BitcoinUnit.setFiat("usd", exchangeRate);
    const fiatBalance = new BitcoinUnit(balance, "satoshi")
      .to("usd")
      .getValue()
      .toFixed(2);
    if (isNaN(fiatBalance)) return 0;
    return Number(fiatBalance);
  } catch (e) {
    return 0;
  }
};

const cryptoToFiat = ({
  amount = 0,
  exchangeRate = 0,
  currencyFiat = "usd",
} = {}) => {
  try {
    amount = Number(amount);
    BitcoinUnit.setFiat(currencyFiat, exchangeRate);
    return new BitcoinUnit(amount, "satoshi")
      .to(currencyFiat)
      .getValue()
      .toFixed(2);
  } catch (e) {
    console.log(e);
  }
};

const satsToBtc = ({ amount = 0 } = {}) => {
  try {
    amount = Number(amount);
    return new BitcoinUnit(amount, "satoshi").to("BTC").getValue();
  } catch (e) {
    return amount;
  }
};

const fiatToCrypto = ({ amount = 0, exchangeRate = 0 } = {}) => {
  try {
    amount = Number(amount);
    BitcoinUnit.setFiat("usd", exchangeRate);
    return new BitcoinUnit(amount, "usd").to("satoshi").getValue().toFixed(0);
  } catch (e) {
    console.log(e);
  }
};

const getLastWordInString = (phrase = "") => {
  try {
    //const n = phrase.trim().split(" ");
    const n = phrase.split(" ");
    return n[n.length - 1];
  } catch (e) {
    return phrase;
  }
};

/*
  Source:
  https://gist.github.com/junderw/b43af3253ea5865ed52cb51c200ac19c
  Usage:
  getByteCount({'MULTISIG-P2SH:2-4':45},{'P2PKH':1}) Means "45 inputs of P2SH Multisig and 1 output of P2PKH"
  getByteCount({'P2PKH':1,'MULTISIG-P2SH:2-3':2},{'P2PKH':2}) means "1 P2PKH input and 2 Multisig P2SH (2 of 3) inputs along with 2 P2PKH outputs"
*/
const getByteCount = (inputs, outputs, message = "") => {
  try {
    let totalWeight = 0;
    let hasWitness = false;
    let inputCount = 0;
    let outputCount = 0;
    // assumes compressed pubkeys in all cases.
    let types = {
      inputs: {
        "MULTISIG-P2SH": 49 * 4,
        "MULTISIG-P2WSH": 6 + 41 * 4,
        "MULTISIG-P2SH-P2WSH": 6 + 76 * 4,
        P2PKH: 148 * 4,
        P2WPKH: 108 + 41 * 4,
        "P2SH-P2WPKH": 108 + 64 * 4,
        bech32: 108 + 41 * 4 + 1,
        segwit: 108 + 64 * 4 + 1,
        legacy: 148 * 4 + 1,
      },
      outputs: {
        P2SH: 32 * 4,
        P2PKH: 34 * 4,
        P2WPKH: 31 * 4,
        P2WSH: 43 * 4,
        bech32: 31 * 4 + 1,
        segwit: 32 * 4 + 1,
        legacy: 34 * 4 + 1,
      },
    };

    const checkUInt53 = (n) => {
      if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0)
        throw new RangeError("value out of range");
    };

    const varIntLength = (number) => {
      checkUInt53(number);

      return number < 0xfd
        ? 1
        : number <= 0xffff
        ? 3
        : number <= 0xffffffff
        ? 5
        : 9;
    };

    Object.keys(inputs).forEach(function (key) {
      checkUInt53(inputs[key]);
      if (key.slice(0, 8) === "MULTISIG") {
        // ex. "MULTISIG-P2SH:2-3" would mean 2 of 3 P2SH MULTISIG
        var keyParts = key.split(":");
        if (keyParts.length !== 2) throw new Error("invalid input: " + key);
        var newKey = keyParts[0];
        var mAndN = keyParts[1].split("-").map(function (item) {
          return parseInt(item);
        });

        totalWeight += types.inputs[newKey] * inputs[key];
        var multiplyer = newKey === "MULTISIG-P2SH" ? 4 : 1;
        totalWeight +=
          (73 * mAndN[0] + 34 * mAndN[1]) * multiplyer * inputs[key];
      } else {
        totalWeight += types.inputs[key] * inputs[key];
      }
      inputCount += inputs[key];
      if (key.indexOf("W") >= 0) hasWitness = true;
    });

    Object.keys(outputs).forEach(function (key) {
      checkUInt53(outputs[key]);
      totalWeight += types.outputs[key] * outputs[key];
      outputCount += outputs[key];
    });

    if (hasWitness) totalWeight += 2;

    totalWeight += 8 * 4;
    totalWeight += varIntLength(inputCount) * 4;
    totalWeight += varIntLength(outputCount) * 4;

    let messageByteCount = 0;
    try {
      messageByteCount = message.length;
      //Multiply by 2 to help ensure Electrum servers will broadcast the tx.
      messageByteCount = messageByteCount * 2;
    } catch {}
    return Math.ceil(totalWeight / 4) + messageByteCount;
  } catch (e) {
    return 256;
  }
};

const getScriptHash = (address = "", network = networks["bitcoin"]) => {
  if (typeof network === "string" && network in networks)
    network = networks[network];
  const script = bitcoin.address.toOutputScript(address, network);
  let hash = bitcoin.crypto.sha256(script);
  const reversedHash = Buffer.from(hash.reverse());
  return reversedHash.toString("hex");
};
const BtcToSats = (balance = 0) => {
  return new BitcoinUnit(balance, "BTC").to("sats").getValue();
};
const getBalanceValue = ({ cryptoUnit = "BTC", balance = 0 }) => {
  if (balance < 50000 && cryptoUnit === "BTC") {
    return (Number(balance) * 0.00000001).toFixed(8);
  } else {
    return new BitcoinUnit(balance, "satoshi").to(cryptoUnit).getValue();
  }
};
const formatBalance = ({ coin = "", cryptoUnit = "satoshi", balance = 0 }) => {
  try {
    let formattedBalance = "0";
    if (balance === 0 && cryptoUnit === "BTC") {
      formattedBalance = "0";
    } else {
      //This prevents the view from displaying 0 for values less than 50000 BTC
      formattedBalance = getBalanceValue({
        cryptoUnit,
        balance,
      });
    }
    formattedBalance = formatNumber(formattedBalance);
    return `${formattedBalance} ${
      getCoinData({ selectedCrypto: coin, cryptoUnit }).acronym
    }`;
  } catch (e) {
    console.log("🚀 ~ file: helpers.js:1175 ~ formatBalance ~ e:", e);
    return "0";
  }
};
function toBufferLE(num, width) {
  const hex = num.toString(16);
  const buffer = Buffer.from(
    hex.padStart(width * 2, "0").slice(0, width * 2),
    "hex"
  );
  buffer.reverse();
  return buffer;
}
const getAddressTypeByAddress = (address) => {
  const isValid = validate(address);
  if (!isValid) return null;
  const infoAdd = getAddressInfo(address);
  if (!infoAdd.bech32) {
    return "legacy";
  }
  return "bech32";
};

module.exports = {
  toBufferLE,
  getAddressTypeByAddress,
  validatePrivateKey,
  validateAddress,
  parsePaymentRequest,
  getDifferenceBetweenDates,
  getBalanceFromUtxos,
  getAddressTransactions,
  getAllTransactions,
  getTransactionData,
  getExchangeRate,
  isOnline,
  removeDupsFromArrOfObj,
  createTransaction,
  getTransactionSize,
  fetchData,
  getCoinNetwork,
  generateAddresses,
  getAddress,
  getKeyPairByMnemonic,
  getKeyPairByPrivateKey,
  parseFiat,
  getNetworkType,
  capitalize,
  openUrl,
  openTxId,
  pauseExecution,
  vibrate,
  shuffleArray,
  getInfoFromAddressPath,
  nthIndex,
  formatNumber,
  removeAllButFirstInstanceOfPeriod,
  decodeOpReturnMessage,
  signMessage,
  verifyMessage,
  wallet: walletHelpers,
  decodeURLParams,
  getBaseDerivationPath,
  loginWithBitid,
  getFiatBalance,
  removeDecimals,
  sortArrOfObjByKey,
  cryptoToFiat,
  fiatToCrypto,
  satsToBtc,
  getLastWordInString,
  getByteCount,
  getScriptHash,
  formatBalance,
  getBalanceValue,
  calculatorFee,
  createMsg,
  signAndCreateTransaction,
  BtcToSats,
  convertStringToMessage,
  btcToFiat,
  buildTx,
  getFeeRate,
  processBalanceFromUtxos,
};
