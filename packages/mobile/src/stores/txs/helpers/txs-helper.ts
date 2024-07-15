import Web3 from "web3";
import { TxsCurrencies } from "./txs-currencies";
import { find } from "lodash";
import { ChainInfoInner } from "@owallet/stores";
import { ChainIdEnum } from "@owallet/common";
import { ChainInfo } from "@owallet/types";
import Big from "big.js";
import moment from "moment";
import { formatContractAddress, get, limitString } from "@src/utils/helper";
import { isArray, isString } from "util";
import { TYPE_ACTIONS_COSMOS_HISTORY } from "@src/common/constants";
import { Bech32Address } from "@owallet/cosmos";
import { formatBalance } from "@owallet/bitcoin";
export class TxsHelper {
  public readonly INFO_API_EVM = {
    [ChainIdEnum.TRON]: {
      BASE_URL: "https://apilist.tronscanapi.com",
      API_KEY: "",
    },
    [ChainIdEnum.BNBChain]: {
      BASE_URL: "https://api.bscscan.com",
      API_KEY: process.env.API_KEY_BSC_SCAN,
    },
    [ChainIdEnum.KawaiiEvm]: {
      BASE_URL: "https://developers.kawaii.global/mintscan",
      API_KEY: "",
    },
    [ChainIdEnum.Ethereum]: {
      BASE_URL: "https://api.etherscan.io",
      API_KEY: process.env.API_KEY_ETH_SCAN,
    },
  };
  public readonly INFO_API_BITCOIN = {
    [ChainIdEnum.BitcoinTestnet]: {
      BASE_URL: "https://blockstream.info/testnet/api",
      API_KEY: "",
    },
    [ChainIdEnum.Bitcoin]: {
      BASE_URL: "https://blockstream.info/api",
      API_KEY: "",
    },
  };
  public readonly TxsCurrencies: TxsCurrencies;
  constructor() {
    this.TxsCurrencies = new TxsCurrencies();
  }
  totalFromDecimal(decimals = 6) {
    return new Big(10).pow(decimals);
  }
  replaceZero(str) {
    if (!str)
      throw new Error(
        "str params in replaceZero function not empty or undefined"
      );
    return str.replace(/(\.\d*[1-9])0+/g, "$1");
  }
  checkZeros(input) {
    if (!input) return false;
    // Find the position of the decimal point
    const dotIndex = input.indexOf(".");
    // Check if the input has a decimal point
    if (dotIndex !== -1) {
      // Get the part after the decimal point
      const fraction = input.slice(dotIndex + 1);
      // Check if the fraction is all zeros
      if (fraction === "0".repeat(fraction.length)) {
        // Return true if the fraction is all zeros
        return true;
      } else {
        // Return false if the fraction has any non-zero
        return false;
      }
    } else {
      // Return false if the input does not have a decimal point
      return false;
    }
  }
  sortByTimestamp(array: Partial<ResTxsInfo>[]): Partial<ResTxsInfo>[] {
    if (!array) throw new Error("Array is not empty to sort txs by timestamp");
    return array.sort((a, b) => b.time.timestamp - a.time.timestamp);
  }
  uniqueArrayByHash<T>(array: T[]): T[] {
    const hashSet: { [key: string]: boolean } = {};
    const uniqueArray: T[] = [];

    for (const item of array) {
      const hash = item?.txHash;
      if (!hashSet[hash]) {
        hashSet[hash] = true;
        uniqueArray.push(item);
      }
    }

    return uniqueArray;
  }
  removeZeroNumberLast(str) {
    if (!str) return str;
    if (this.checkZeros(str)) {
      return parseFloat(str);
    } else if (`${this.replaceZero(str)}`.indexOf(".") == -1) {
      return parseInt(this.replaceZero(str)).toFixed(1);
    }
    return this.replaceZero(str);
  }
  formatNumberSeparateThousand(num) {
    if (!num) return num;
    if (`${num}`.includes(".")) {
      const numSplit = num && num.split(".");
      if (numSplit?.length > 1) {
        return (
          numSplit[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
          "." +
          numSplit[1]
        );
      }
    }
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") || "0";
  }
  calculateTransactionFee(gasPrice, gasUsed, decimals = 18): string {
    return (
      (gasPrice &&
        gasUsed &&
        new Big(parseInt(gasUsed))
          .mul(parseInt(gasPrice))
          .div(this.totalFromDecimal(decimals))
          .toFixed(decimals)) ||
      "0"
    );
  }
  calculateTransactionFeeCosmos(fee, decimals = 18): string {
    return (
      (fee &&
        new Big(parseInt(fee))
          .div(this.totalFromDecimal(decimals))
          .toFixed(decimals)) ||
      "0"
    );
  }
  formatTime(timestamp): timeTxs {
    if (timestamp) {
      // Create a moment object from the timestamp
      const myMoment = moment.unix(timestamp);

      // Format the moment object using tokens
      const formatted = myMoment.format("YYYY-MM-DD HH:mm:ss");

      // Get the relative time from the moment object to now
      const relative = this.capitalizeFirstLetter(myMoment.fromNow());

      // Combine the formatted and relative strings
      return {
        timeLong: relative + " (" + formatted + ")",
        timeShort: relative,
        date: formatted,
        timestamp,
      };
    } else {
      return {
        timeLong: "",
        date: "",
        timeShort: "",
        timestamp: 0,
      };
    }
  }
  formatTimeTron(timestamp): timeTxs {
    if (timestamp) {
      // Create a moment object from the timestamp
      const myMoment = moment(timestamp);

      // Format the moment object using tokens
      const formatted = myMoment.format("YYYY-MM-DD HH:mm:ss");

      // Get the relative time from the moment object to now
      const relative = this.capitalizeFirstLetter(myMoment.fromNow());

      // Combine the formatted and relative strings
      return {
        timeLong: relative + " (" + formatted + ")",
        timeShort: relative,
        timestamp,
        date: formatted,
      };
    } else {
      return {
        timeLong: "",
        timeShort: "",
        date: "",
        timestamp: 0,
      };
    }
  }
  formatTimeBitcoin(time): timeTxs {
    if (time) {
      // Create a moment object from the timestamp
      const myMoment = moment(time);

      // Format the moment object using tokens
      const formatted = myMoment.format("YYYY-MM-DD HH:mm:ss");

      // Get the relative time from the moment object to now
      const relative = this.capitalizeFirstLetter(myMoment.fromNow());

      // Combine the formatted and relative strings
      return {
        timeLong: relative + " (" + formatted + ")",
        timeShort: relative,
        timestamp: 0,
        date: formatted,
      };
    } else {
      return {
        timeLong: "",
        timeShort: "",
        date: "",
        timestamp: 0,
      };
    }
  }
  addSpacesToString(str) {
    return str && str.replace(/([a-z])([A-Z])/g, "$1 $2");
  }
  getFunctionName(input: string): string {
    // Split the input string by "(" and get the first element of the array
    const output = input && input.split("(")[0];
    // Return the output string
    return output;
  }
  capitalizeFirstLetter(input: string): string {
    // Check if the input is empty or null
    if (!input) {
      return input;
    }
    // Get the first character of the input and convert it to uppercase
    const firstChar = input.charAt(0).toUpperCase();
    // Get the rest of the input and convert it to lowercase
    const rest = input.slice(1).toLowerCase();
    // Return the concatenated string
    return firstChar + rest;
  }
  capitalizedWords(str, splitCharacter = "_") {
    const words = str && str.split(splitCharacter);
    const capitalizedWords =
      words &&
      words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords && capitalizedWords.join(" ")?.trim();
  }

  convertToWord(str) {
    if (!str) return null;
    if (str.indexOf("_") !== -1) {
      return this.capitalizedWords(str, "_");
    } else if (str.indexOf(".") !== -1) {
      const splitCapitalize = str.split(".");
      return this.convertVarCapitalizeToWord(
        splitCapitalize[splitCapitalize?.length - 1]
      );
    }
    return this.capitalizedWords(str, " ");
  }
  convertValueTransactionToDisplay(str, label, currentChain) {
    if (!str || !label || !currentChain) return null;
    if (this.isAmount(str, label)) {
      const matchesAmount = str?.match(/\d+/g);
      const matchesDenom = str?.replace(/^\d+/g, "");
      return {
        amount: this.removeZeroNumberLast(
          this.formatNumberSeparateThousand(
            this.formatAmount(
              matchesAmount && matchesAmount[0],
              matchesDenom
                ? this.TxsCurrencies.getCurrencyInfoByMinimalDenom(
                    matchesDenom?.trim()?.toUpperCase()
                  ).coinDecimals
                : currentChain.stakeCurrency.coinDecimals
            )
          )
        ),
        token:
          matchesDenom &&
          limitString(
            this.TxsCurrencies.getCurrencyInfoByMinimalDenom(
              matchesDenom?.trim()?.toUpperCase()
            ).coinDenom?.toUpperCase(),
            10
          ),
      };
    } else if (this.isAddress(str, currentChain.networkType)) {
      return formatContractAddress(str);
    }
    return str;
  }
  isAlphaNumeric(input) {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).*$/;
    return regex.test(input);
  }
  isDigitsOnly(input) {
    const regex = /^\d+$/;
    return regex.test(input);
  }
  isAmount(str, label) {
    if (!str || !label) return false;
    if (
      str?.indexOf(" ") === -1 &&
      this.isAlphaNumeric(str) &&
      label?.toLowerCase()?.indexOf("amount") !== -1
    ) {
      const regex = /^(\d+)(.+)$/;
      return regex.test(str);
    } else if (
      label?.toLowerCase()?.indexOf("amount") !== -1 &&
      this.isDigitsOnly(str)
    ) {
      return true;
    }
    return false;
  }
  convertVarCapitalizeToWord(str) {
    if (!str) return null;
    let converted = str?.replace(/([a-z])([A-Z])/g, "$1 $2");
    converted = converted?.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
    converted = converted?.replace(/(\d+)([A-Za-z]+)/g, "$1 $2");
    return converted?.trim();
  }
  formatAmount(amount, decimals = 6) {
    if (!amount) {
      return amount;
    }
    if (!decimals) {
      decimals = 6;
    }
    const amountRs =
      new Big(parseInt(amount))
        .div(this.totalFromDecimal(decimals))
        .toFixed(decimals) || "0";
    return amountRs;
  }
  handleTransferDetailEthAndBsc(
    data: InfoTxEthAndBsc,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<TransferDetail>[] {
    const transferItem: Partial<TransferDetail> = {};
    const isMinus = data?.from?.toLowerCase() == addressAccount?.toLowerCase();
    const isPlus = data?.to?.toLowerCase() == addressAccount?.toLowerCase();
    transferItem.typeEvent = data?.functionName
      ? this.capitalizedWords(
          this.addSpacesToString(this.getFunctionName(data?.functionName)),
          " "
        )
      : isMinus && !isPlus
      ? "Sent"
      : isPlus && !isMinus
      ? "Received"
      : isPlus && isMinus
      ? "Refund"
      : "";
    transferItem.transferInfo = [
      {
        from: data?.from,
        to: data?.to,
        amount: this.removeZeroNumberLast(
          this.formatNumberSeparateThousand(
            this.formatAmount(
              data?.value,
              currentChain?.stakeCurrency?.coinDecimals
            )
          )
        ),
        token: currentChain.stakeCurrency.coinDenom?.toUpperCase(),
        isMinus,
        isPlus,
      },
    ];
    return [transferItem];
  }
  handleTransferDetailBtc(
    data: txBitcoinResult,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<TransferDetail>[] {
    const transferItem: Partial<TransferDetail> = {};
    transferItem.transferInfo = [];

    const transferItemIn: Partial<TransferDetail> = {};
    transferItemIn.transferInfo = [];
    if (data?.vin?.length > 0 && data?.vout?.length > 0) {
      const found = data.vin.some(
        (item) => item.prevout.scriptpubkey_address === addressAccount
      );
      if (found) {
        const arrVoutFilter = data.vout.filter(
          (item) => item.scriptpubkey_address !== addressAccount
        );
        const totalBalance = arrVoutFilter.reduce((total, data) => {
          return total + data.value;
        }, 0);
        transferItem.transferInfo.push({
          amount: formatBalance({
            balance: Number(totalBalance),
            cryptoUnit: "BTC",
            coin: currentChain.chainId,
          }),
          isMinus: true,
        });
      } else {
        const arrVoutFilter = data.vout.filter(
          (item) => item.scriptpubkey_address === addressAccount
        );
        const totalBalance = arrVoutFilter.reduce((total, data) => {
          return total + data.value;
        }, 0);
        transferItem.transferInfo.push({
          amount: formatBalance({
            balance: Number(totalBalance),
            cryptoUnit: "BTC",
            coin: currentChain.chainId,
          }),
          isPlus: true,
        });
      }
    }
    transferItem.typeEvent = "Transaction";
    return [transferItem];
  }
  handleItemTxsEthAndBsc(
    data: InfoTxEthAndBsc,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    const item: Partial<ResTxsInfo> = {};
    item.fee = this.removeZeroNumberLast(
      this.formatNumberSeparateThousand(
        this.calculateTransactionFee(
          data.gasPrice,
          data.gasUsed,
          currentChain?.feeCurrencies[0]?.coinDecimals
        )
      )
    );
    item.denomFee = currentChain?.feeCurrencies[0]?.coinDenom?.toUpperCase();
    item.time = this.formatTime(data?.timeStamp);
    item.txHash = data?.hash;
    item.height = this.formatNumberSeparateThousand(data?.blockNumber);
    item.status = data?.isError == "0" ? "success" : "fail";
    item.memo = null;
    item.countTypeEvent = 0;
    item.gasUsed = this.formatNumberSeparateThousand(data?.gasUsed);
    item.gasWanted = this.formatNumberSeparateThousand(data?.gas);
    item.transfers = this.handleTransferDetailEthAndBsc(
      data,
      currentChain,
      addressAccount
    );
    item.isRefreshData = false;
    return item;
  }

  handleItemTxsBtc(
    data: txBitcoinResult,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    const item: Partial<ResTxsInfo> = {};
    item.fee = formatBalance({
      balance: Number(data.fee),
      cryptoUnit: "BTC",
      coin: currentChain.chainId,
    });
    item.denomFee = "";
    item.time = data?.status?.confirmed
      ? this.formatTimeBitcoin(data?.status?.block_time * 1000)
      : null;
    item.txHash = data?.txid;
    item.height = data?.status?.confirmed
      ? this.formatNumberSeparateThousand(data?.status?.block_height)
      : "--";
    item.status = data?.status?.confirmed ? "success" : "pending";
    item.memo = null;
    item.confirmations = 0;
    item.countTypeEvent = 0;
    item.gasUsed = null;
    item.gasWanted = null;
    item.transfers = this.handleTransferDetailBtc(
      data,
      currentChain,
      addressAccount
    );
    item.isRefreshData = false;
    return item;
  }

  cleanDataEthAndBscResToStandFormat(
    data: InfoTxEthAndBsc[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    const dataConverted: Partial<ResTxsInfo>[] = [];
    if (data && data?.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let item: Partial<ResTxsInfo>;
        const itData = data[i];
        switch (currentChain.chainId) {
          case ChainIdEnum.Ethereum:
            item = this.handleItemTxsEthAndBsc(
              itData,
              currentChain,
              addressAccount
            );
            dataConverted.push(item);
            break;
          case ChainIdEnum.BNBChain:
            item = this.handleItemTxsEthAndBsc(
              itData,
              currentChain,
              addressAccount
            );
            dataConverted.push(item);
            break;
        }
      }
    }
    return dataConverted;
  }
  cleanDataBtcResToStandFormat(
    data: txBitcoinResult[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    const dataConverted: Partial<ResTxsInfo>[] = [];
    if (data && data?.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let item: Partial<ResTxsInfo>;
        const itData = data[i];
        item = this.handleItemTxsBtc(itData, currentChain, addressAccount);
        dataConverted.push(item);
      }
    }
    return dataConverted;
  }
  handleTransferDetailEthAndBscByToken(
    data: ResultEthAndBscByToken,
    addressAccount: string
  ): Partial<TransferDetail>[] {
    const transferItem: Partial<TransferDetail> = {};
    const isMinus = data?.from?.toLowerCase() == addressAccount?.toLowerCase();
    const isPlus = data?.to?.toLowerCase() == addressAccount?.toLowerCase();
    transferItem.typeEvent =
      isMinus && !isPlus
        ? "Sent"
        : isPlus && !isMinus
        ? "Received"
        : isPlus && isMinus
        ? "Refund"
        : "";
    transferItem.transferInfo = [
      {
        from: data?.from,
        to: data?.to,
        amount: this.removeZeroNumberLast(
          this.formatNumberSeparateThousand(
            this.formatAmount(
              data?.value,
              data?.tokenDecimal ? parseInt(data?.tokenDecimal) : 18
            )
          )
        ),
        token: data?.tokenSymbol?.toUpperCase(),
        isMinus,
        isPlus,
      },
    ];
    return [transferItem];
  }
  handleItemTxsEthAndBscByToken(
    data: ResultEthAndBscByToken,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    const item: Partial<ResTxsInfo> = {};
    item.fee = this.removeZeroNumberLast(
      this.formatNumberSeparateThousand(
        this.calculateTransactionFee(
          data.gasPrice,
          data.gasUsed,
          currentChain?.feeCurrencies[0]?.coinDecimals
        )
      )
    );
    item.denomFee = currentChain?.feeCurrencies[0]?.coinDenom?.toUpperCase();
    item.time = this.formatTime(data?.timeStamp);
    item.txHash = data?.hash;
    item.height = data?.blockNumber;
    item.status = data?.value !== "0" ? "success" : "fail";
    item.memo = null;
    item.countTypeEvent = 0;
    item.gasUsed = this.formatNumberSeparateThousand(data?.gasUsed);
    item.gasWanted = this.formatNumberSeparateThousand(data?.gas);
    item.transfers = this.handleTransferDetailEthAndBscByToken(
      data,
      addressAccount
    );
    item.isRefreshData = false;
    return item;
  }
  cleanDataEthAndBscResByTokenToStandFormat(
    data: ResultEthAndBscByToken[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    const dataConverted: Partial<ResTxsInfo>[] = [];
    if (data && data?.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let item: Partial<ResTxsInfo>;
        const itData = data[i];
        switch (currentChain.chainId) {
          case ChainIdEnum.Ethereum:
            item = this.handleItemTxsEthAndBscByToken(
              itData,
              currentChain,
              addressAccount
            );
            dataConverted.push(item);
            break;
          case ChainIdEnum.BNBChain:
            item = this.handleItemTxsEthAndBscByToken(
              itData,
              currentChain,
              addressAccount
            );
            dataConverted.push(item);
            break;
        }
      }
    }
    return dataConverted;
  }
  getModuleFromAction(action) {
    if (action && action?.includes(".")) {
      const splitData = action?.split(".");
      if (splitData?.length > 3) {
        return splitData[splitData?.length - 3];
      }
    }
    return null;
  }
  convertLastActionToVar(actionValue) {
    if (actionValue && actionValue?.includes(".")) {
      const splitData = actionValue?.split(".");
      return this.convertStringToVar(splitData[splitData?.length - 1]);
    }
    return null;
  }
  checkAmountHasDenom = (array) => {
    // loop through the array
    if (array) {
      for (const item of array) {
        // if the key is "amount" and the value is only a number
        if (item?.key === "amount" && /^\d+$/.test(item?.value)) {
          // store the value as a number
          const amount = Number(item?.value);
          // loop through the array again
          for (const other of array) {
            // if the key is not "amount" and the value starts with the same number followed by some text
            if (
              !!amount &&
              other?.key !== "amount" &&
              other?.value.startsWith(amount.toString()) &&
              other?.value?.length > amount.toString()?.length
            ) {
              // return the item and the other item
              return other;
            }
          }
          return item;
        }
      }
      return null;
    }
    // if no match is found, return null
    return null;
  };
  sortTransferFirst(inputArray) {
    if (!inputArray || inputArray?.length <= 0) return null;
    if (Array.isArray(inputArray)) {
      for (let i = 0; i < inputArray.length; i++) {
        const events = inputArray[i].events;
        if (Array.isArray(events)) {
          const transferIndex = events.findIndex(
            (event) => event.type === "transfer"
          );
          if (transferIndex !== -1 && transferIndex !== 0) {
            const transferEvent = events.splice(transferIndex, 1)[0];
            events.unshift(transferEvent);
          }
        }
      }
    }
    return inputArray;
  }
  sortTransferEvents(array) {
    if (!array || !isArray(array) || array?.length < 0) return null;
    const transferEvents = array.filter((item) => {
      return item.events && item?.events[0]?.type === "transfer";
    });
    if (transferEvents && transferEvents?.length > 0) {
      transferEvents.forEach((item) => {
        const attributes = item?.events[0]?.attributes;
        const sortedAttributes = [];
        const keys = ["sender", "recipient", "amount"];
        for (const key of keys) {
          const foundAttribute = attributes.find(
            (attr) => attr?.key && attr?.key?.toLowerCase()?.trim() == key
          );
          if (foundAttribute) {
            sortedAttributes.push(foundAttribute);
          }
        }
        item.events[0].attributes = sortedAttributes;
      });
      return transferEvents;
    }
    return array;
  }
  convertStringToVar = (string) => {
    // split the string by uppercase letters
    const words = string.split(/(?=[A-Z])/);
    // remove the first word "Msg"
    words.shift();
    // join the words with underscore and lowercase them
    return words.join("_").toLowerCase();
  };
  convertTypeEvent = (actionValue) => {
    return actionValue?.length > 0 &&
      actionValue?.toLowerCase()?.includes("msg")
      ? this.getStringAfterMsg(this.addSpacesToString(actionValue))
      : this.convertVarToWord(actionValue);
  };

  isAddress(value, networkType): boolean {
    if (!value) return value;
    if (networkType == "evm") {
      try {
        if (!Web3.utils.isAddress(value)) {
          return false;
        }
        return true;
      } catch (error) {
        return false;
      }
    }
    try {
      Bech32Address.validate(value);
      return true;
    } catch (error) {
      return false;
    }
  }
  trimQuotes(inputString) {
    if (!inputString) return null;
    if (inputString?.startsWith('"') && inputString?.endsWith('"')) {
      return inputString?.slice(1, -1);
    } else {
      return inputString;
    }
  }
  checkSendReceive(evType, evAttr, indexAttr, addressAcc) {
    if (!evType || evAttr?.length < 3 || !Array.isArray(evAttr)) return null;
    if (evType === "transfer") {
      if (
        evAttr[indexAttr - 2] &&
        evAttr[indexAttr - 2]?.key == "sender" &&
        evAttr[indexAttr - 2]?.value === addressAcc &&
        evAttr[indexAttr - 1]?.key == "recipient" &&
        evAttr[indexAttr - 1]?.value !== addressAcc
      ) {
        return { isPlus: false, isMinus: true };
      } else if (
        evAttr[indexAttr - 2] &&
        evAttr[indexAttr - 2]?.key == "sender" &&
        evAttr[indexAttr - 2]?.value !== addressAcc &&
        evAttr[indexAttr - 1]?.key == "recipient" &&
        evAttr[indexAttr - 1]?.value === addressAcc
      ) {
        return { isPlus: true, isMinus: false };
      }
      return { isPlus: false, isMinus: false };
    }
    return { isPlus: false, isMinus: false };
  }
  convertVarToWord(str) {
    if (!str) return str;
    const words = str && str.split("_");
    const capitalizedWords =
      words &&
      words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords && capitalizedWords.join(" ")?.trim();
  }
  getStringAfterMsg(str) {
    const msgIndex = str?.toUpperCase().indexOf("MSG");
    if (msgIndex === -1) {
      return "";
    }
    return str.substring(msgIndex + 3);
  }
  checkDuplicateAmount = (array) => {
    let count = 0;

    for (const element of array) {
      if (element.key === "amount") {
        count++;
      }
    }
    if (count >= 2) {
      return true;
    } else {
      return false;
    }
  };
  handleItemRawLogCosmos(
    itemLog,
    address,
    currentChain: ChainInfoInner<ChainInfo>
  ) {
    const transfer = "transfer";
    let isRecipient: boolean;
    const event = itemLog && find(get(itemLog, `events`), { type: "message" });
    const action = event && find(get(event, "attributes"), { key: "action" });
    const actionValue = action?.value;
    const moduleEvent = this.getModuleFromAction(actionValue);
    const lastAction = this.convertLastActionToVar(actionValue);
    const eventModule =
      moduleEvent && find(get(itemLog, `events`), { type: moduleEvent });
    const eventLastAction =
      moduleEvent && find(get(itemLog, `events`), { type: lastAction });
    const moduleAction =
      eventModule && find(get(eventModule, "attributes"), { key: "action" });
    const moduleValue = moduleAction && moduleAction?.value;
    const eventType = this.convertTypeEvent(
      moduleValue ? moduleValue : actionValue
    );

    const valueTransfer =
      itemLog &&
      find(get(itemLog, `events`), {
        type: transfer,
      });
    let transferInfo;
    if (
      valueTransfer?.attributes &&
      this.checkDuplicateAmount(valueTransfer?.attributes)
    ) {
      transferInfo = this.convertFormatArrayTransfer(valueTransfer?.attributes);
    } else {
      transferInfo = [
        {
          amountData: valueTransfer
            ? find(valueTransfer?.attributes, { key: "amount" })
            : this.checkAmountHasDenom(get(eventModule, "attributes"))
            ? this.checkAmountHasDenom(get(eventModule, "attributes"))
            : find(get(eventModule, "attributes"), { key: "amount" }) ||
              this.checkAmountHasDenom(get(eventLastAction, "attributes"))
            ? this.checkAmountHasDenom(get(eventLastAction, "attributes"))
            : find(get(eventLastAction, "attributes"), { key: "amount" }),
          from: valueTransfer
            ? find(valueTransfer?.attributes, { key: "sender" })?.value
            : find(get(eventModule, "attributes"), { key: "from" }) ||
              find(get(eventModule, "attributes"), { key: "sender" }),
          to: valueTransfer
            ? find(valueTransfer?.attributes, { key: "recipient" })?.value
            : find(get(eventModule, "attributes"), { key: "to" }) ||
              find(get(eventModule, "attributes"), { key: "recipient" }),
        },
      ];
    }

    transferInfo.forEach((itDataTransfer) => {
      isRecipient =
        itDataTransfer?.recipient?.value === address &&
        (actionValue === TYPE_ACTIONS_COSMOS_HISTORY["bank/MsgSend"] ||
          actionValue === TYPE_ACTIONS_COSMOS_HISTORY.send);

      const matchesAmount = get(itDataTransfer, "amountData.value")
        ? itDataTransfer?.amountData?.value?.match(/\d+/g)
        : isString(itDataTransfer?.amountData)
        ? itDataTransfer?.amountData?.match(/\d+/g)
        : "";
      const matchesDenom = get(itDataTransfer, "amountData.value")
        ? itDataTransfer?.amountData?.value?.replace(/^\d+/g, "")
        : isString(itDataTransfer?.amountData)
        ? itDataTransfer?.amountData?.replace(/^\d+/g, "")
        : "";
      const amountFormated = this.formatAmount(
        matchesAmount && matchesAmount[0],
        matchesDenom
          ? this.TxsCurrencies.getCurrencyInfoByMinimalDenom(
              matchesDenom?.trim()?.toUpperCase()
            ).coinDecimals
          : currentChain.stakeCurrency.coinDecimals
      );
      itDataTransfer.amount = this.removeZeroNumberLast(
        this.formatNumberSeparateThousand(amountFormated)
      );
      itDataTransfer.token =
        matchesDenom &&
        this.TxsCurrencies.getCurrencyInfoByMinimalDenom(
          matchesDenom?.trim()?.toUpperCase()
        ).coinDenom?.toUpperCase();

      if (
        itDataTransfer?.to?.value === address ||
        itDataTransfer?.to === address
      ) {
        itDataTransfer.isPlus = true;
      } else if (
        (itDataTransfer?.to?.value !== address &&
          itDataTransfer?.from?.value === address) ||
        (itDataTransfer?.from && itDataTransfer?.to !== address)
      ) {
        itDataTransfer.isMinus = true;
      }
    });

    return {
      transferInfo,
      typeEvent: isRecipient ? "Received" : eventType && eventType?.trim(),
      moduleValue: moduleEvent,
      eventValue: moduleValue ? moduleValue : actionValue,
      pathEvent: moduleValue ? `${moduleEvent}.action` : `message.action`,
    };
  }
  convertDateToTimeStamp(da: Date): number {
    const date = new Date(da);
    const timestamp = date.getTime();
    return timestamp;
  }
  convertFormatArrayTransfer = (array) => {
    const newArray = [];

    let tempObject: {
      amountData?: string;
      from?: string;
      to?: string;
    } = {};

    for (const element of array) {
      if (element.key === "amount") {
        tempObject["amountData"] = element.value;
      } else if (element.key === "sender") {
        tempObject["from"] = element.value;
      } else if (element.key === "recipient") {
        tempObject["to"] = element.value;
      }

      if (tempObject?.amountData && tempObject?.from && tempObject?.to) {
        newArray.push(tempObject);
        tempObject = {};
      }
    }

    return newArray;
  };
  handleItemCosmos(
    data: TxResponseLcdCosmos,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    const item: Partial<ResTxsInfo> = {};
    const dataEvents = [];
    item.status = data?.code === 0 ? "success" : "fail";
    item.txHash = data?.txhash;
    item.fee = this.removeZeroNumberLast(
      this.formatNumberSeparateThousand(
        this.calculateTransactionFeeCosmos(
          data?.tx?.auth_info?.fee?.amount[0]?.amount,
          currentChain?.feeCurrencies[0]?.coinDecimals
        )
      )
    );
    item.stdFee = data?.tx?.auth_info?.fee;
    item.denomFee = currentChain?.feeCurrencies[0]?.coinDenom?.toUpperCase();
    item.gasUsed = this.formatNumberSeparateThousand(data?.gas_used);
    item.gasWanted = this.formatNumberSeparateThousand(data?.gas_wanted);
    item.height = this.formatNumberSeparateThousand(data?.height);
    item.memo = data?.tx?.body?.memo;
    item.infoTransaction = [];
    item.time = this.formatTimeTron(
      this.convertDateToTimeStamp(data?.timestamp)
    );
    if (data?.code === 0) {
      const logs = data?.raw_log && JSON.parse(data?.raw_log);
      item.countTypeEvent = logs?.length > 1 ? logs?.length - 1 : 0;
      if (logs?.length > 0) {
        item.infoTransaction = this.sortTransferEvents(
          this.sortTransferFirst(this.filterEventsNotUse(logs))
        );
        logs.forEach((itemLog) => {
          const itemDataTransferDetail = this.handleItemRawLogCosmos(
            itemLog,
            addressAccount,
            currentChain
          );
          dataEvents.push(itemDataTransferDetail);
        });
      }
    }

    item.transfers = dataEvents;
    item.isRefreshData = false;
    item.isCosmos = true;

    return item;
  }
  filterEventsNotUse(eventsArray) {
    const messages = eventsArray.flatMap((item) =>
      item?.events?.filter((event) => event?.type === "message")
    );
    const filteredEvents = eventsArray?.map((item) => ({
      events: item.events.filter(
        (event) =>
          ![
            "coin_received",
            "coin_spent",
            "execute",
            "message",
            "wasm",
          ].includes(event?.type)
      ),
      messages:
        messages &&
        messages[0]?.attributes.find((item, data) => item?.key == "action"),
    }));
    return filteredEvents;
  }
  cleanDataCosmosToStandFormat(
    tx_responses: TxResponseLcdCosmos[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    const dataConverted: Partial<ResTxsInfo>[] = [];
    if (tx_responses?.length > 0) {
      for (let i = 0; i < tx_responses.length; i++) {
        let item: Partial<ResTxsInfo>;
        const elementTx = tx_responses[i];
        item = this.handleItemCosmos(elementTx, currentChain, addressAccount);
        dataConverted.push(item);
      }
    }
    return dataConverted;
  }
  handleItemRpcCosmos(
    data: TxRpcCosmos,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    const item: Partial<ResTxsInfo> = {};
    const dataEvents = [];
    item.status = data?.tx_result?.code === 0 ? "success" : "fail";
    item.txHash = data?.hash;
    item.fee = "0";
    item.denomFee = currentChain?.feeCurrencies[0]?.coinDenom?.toUpperCase();
    item.gasUsed = this.formatNumberSeparateThousand(data?.tx_result?.gas_used);
    item.gasWanted = this.formatNumberSeparateThousand(
      data?.tx_result?.gas_wanted
    );
    item.height = this.formatNumberSeparateThousand(data?.height);
    item.memo = "";
    item.time = {
      timeLong: "",
      timeShort: "",
      date: "",
      timestamp: 0,
    };
    item.infoTransaction = [];
    if (data?.tx_result?.code === 0) {
      const logs = data?.tx_result?.log && JSON.parse(data?.tx_result?.log);
      item.countTypeEvent = logs?.length > 1 ? logs?.length - 1 : 0;
      if (logs?.length > 0) {
        item.infoTransaction = this.sortTransferEvents(
          this.filterEventsNotUse(logs)
        );
        logs.forEach((itemLog) => {
          const itemDataTransferDetail = this.handleItemRawLogCosmos(
            itemLog,
            addressAccount,
            currentChain
          );
          dataEvents.push(itemDataTransferDetail);
        });
      }
    }
    item.transfers = dataEvents;
    item.isRefreshData = true;
    return item;
  }
  cleanDataRpcCosmosToStandFormat(
    txs: TxRpcCosmos[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    const dataConverted: Partial<ResTxsInfo>[] = [];
    if (txs?.length > 0) {
      for (let i = 0; i < txs.length; i++) {
        let item: Partial<ResTxsInfo>;
        const elementTx = txs[i];
        item = this.handleItemRpcCosmos(
          elementTx,
          currentChain,
          addressAccount
        );
        dataConverted.push(item);
      }
    }
    return dataConverted;
  }
  handleTransferDetailTron(
    data: ResultDataTron,
    addressAccount: string,
    currentChain: ChainInfoInner<ChainInfo>
  ): Partial<TransferDetail>[] {
    const transferItem: Partial<TransferDetail> = {};
    const isMinus =
      data?.ownerAddress?.toLowerCase() == addressAccount?.toLowerCase();
    const isPlus =
      data?.toAddress?.toLowerCase() == addressAccount?.toLowerCase();
    transferItem.typeEvent = data?.trigger_info?.methodName
      ? this.capitalizedWords(
          this.addSpacesToString(data?.trigger_info?.methodName),
          " "
        )
      : isMinus && !isPlus
      ? "Sent"
      : isPlus && !isMinus
      ? "Received"
      : isPlus && isMinus
      ? "Refund"
      : "";

    transferItem.transferInfo = [
      {
        from: data?.ownerAddress,
        to: data?.toAddress,
        amount: this.removeZeroNumberLast(
          this.formatNumberSeparateThousand(
            this.formatAmount(
              data?.amount,
              data?.tokenInfo?.tokenDecimal ||
                currentChain?.feeCurrencies[0]?.coinDecimals
            )
          )
        ),
        token: data?.tokenInfo?.tokenAbbr?.toUpperCase() || "",
        isMinus,
        isPlus,
      },
    ];
    return [transferItem];
  }
  handleItemTron(
    data: ResultDataTron,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    const item: Partial<ResTxsInfo> = {};
    item.fee = `${data.cost.fee}`;
    item.height = `${this.formatNumberSeparateThousand(data.block)}`;
    item.denomFee = `${currentChain?.feeCurrencies[0]?.coinDenom?.toUpperCase()}`;
    item.txHash = data.hash;
    item.status = data.contractRet == "SUCCESS" ? "success" : "fail";
    item.time = this.formatTimeTron(data?.timestamp);
    item.gasUsed = "0";
    item.gasWanted = "0";
    item.countTypeEvent = 0;
    item.transfers = this.handleTransferDetailTron(
      data,
      addressAccount,
      currentChain
    );
    item.isRefreshData = false;
    return item;
  }
  removeEmptyElements(array) {
    if (isArray(array)) {
      return array.filter((element) => !!element);
    }
    return array;
  }
  cleanDataTronResToStandFormat(
    data: ResultDataTron[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    const dataConverted: Partial<ResTxsInfo>[] = [];
    if (data && data?.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let item: Partial<ResTxsInfo>;
        const itData = data[i];
        item = this.handleItemTron(itData, currentChain, addressAccount);
        dataConverted.push(item);
      }
    }
    return dataConverted;
  }
}
