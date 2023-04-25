import { find } from 'lodash';
import { ChainInfoInner } from '@owallet/stores';
import { ChainIdEnum } from './txs-enums';
import { ChainInfo } from '@owallet/types';
import Big from 'big.js';
import moment from 'moment';
import { get, getCurrencyByMinimalDenom } from '@src/utils/helper';
import { isArray } from 'util';
import { TYPE_ACTIONS_COSMOS_HISTORY } from '@src/common/constants';
export class TxsHelper {
  public readonly INFO_API_EVM = {
    [ChainIdEnum.TRON]: {
      BASE_URL: 'https://apilist.tronscanapi.com',
      API_KEY: ''
    },
    [ChainIdEnum.BNBChain]: {
      BASE_URL: 'https://api.bscscan.com',
      API_KEY: process.env.API_KEY_BSC_SCAN
    },
    [ChainIdEnum.KawaiiEvm]: {
      BASE_URL: 'https://developers.kawaii.global/mintscan',
      API_KEY: ''
    },
    [ChainIdEnum.Ethereum]: {
      BASE_URL: 'https://api.etherscan.io',
      API_KEY: process.env.API_KEY_ETH_SCAN
    }
  };
  totalFromDecimal(decimals = 6) {
    return new Big(10).pow(decimals);
  }
  replaceZero(str) {
    if (!str)
      throw new Error(
        'str params in replaceZero function not empty or undefined'
      );
    return str.replace(/(\.\d*[1-9])0+/g, '$1');
  }
  checkZeros(input) {
    if (!input) return false;
    // Find the position of the decimal point
    let dotIndex = input.indexOf('.');
    // Check if the input has a decimal point
    if (dotIndex !== -1) {
      // Get the part after the decimal point
      let fraction = input.slice(dotIndex + 1);
      // Check if the fraction is all zeros
      if (fraction === '0'.repeat(fraction.length)) {
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
  removeZeroNumberLast(str) {
    if (!str) return str;
    if (this.checkZeros(str)) {
      return parseFloat(str);
    } else if (`${this.replaceZero(str)}`.indexOf('.') == -1) {
      return parseInt(this.replaceZero(str)).toFixed(1);
    }
    return this.replaceZero(str);
  }
  formatNumberSeparateThousand(num) {
    if (!num) return num;
    if (`${num}`.includes('.')) {
      const numSplit = num && num.split('.');
      if (numSplit?.length > 1) {
        return (
          numSplit[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +
          '.' +
          numSplit[1]
        );
      }
    }
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') || '0';
  }
  calculateTransactionFee(gasPrice, gasUsed, decimals = 18): string {
    return (
      (gasPrice &&
        gasUsed &&
        new Big(parseInt(gasUsed))
          .mul(parseInt(gasPrice))
          .div(this.totalFromDecimal(decimals))
          .toFixed(decimals)) ||
      '0'
    );
  }
  formatTime(timestamp): timeTxs {
    if (timestamp) {
      // Create a moment object from the timestamp
      var myMoment = moment.unix(timestamp);

      // Format the moment object using tokens
      var formatted = myMoment.format('YYYY-MM-DD HH:mm:ss');

      // Get the relative time from the moment object to now
      var relative = this.capitalizeFirstLetter(myMoment.fromNow());

      // Combine the formatted and relative strings
      return {
        timeLong: relative + ' (' + formatted + ')',
        timeShort: relative
      };
    } else {
      return {
        timeLong: '',
        timeShort: ''
      };
    }
  }
  formatTimeTron(timestamp): timeTxs {
    if (timestamp) {
      // Create a moment object from the timestamp
      var myMoment = moment(timestamp);

      // Format the moment object using tokens
      var formatted = myMoment.format('YYYY-MM-DD HH:mm:ss');

      // Get the relative time from the moment object to now
      var relative = this.capitalizeFirstLetter(myMoment.fromNow());

      // Combine the formatted and relative strings
      return {
        timeLong: relative + ' (' + formatted + ')',
        timeShort: relative
      };
    } else {
      return {
        timeLong: '',
        timeShort: ''
      };
    }
  }
  addSpacesToString(str) {
    return str && str.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  getFunctionName(input: string): string {
    // Split the input string by "(" and get the first element of the array
    let output = input && input.split('(')[0];
    // Return the output string
    return output;
  }
  capitalizeFirstLetter(input: string): string {
    // Check if the input is empty or null
    if (!input) {
      return input;
    }
    // Get the first character of the input and convert it to uppercase
    let firstChar = input.charAt(0).toUpperCase();
    // Get the rest of the input and convert it to lowercase
    let rest = input.slice(1).toLowerCase();
    // Return the concatenated string
    return firstChar + rest;
  }
  capitalizedWords(str, splitCharacter = '_') {
    const words = str && str.split(splitCharacter);
    const capitalizedWords =
      words &&
      words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords && capitalizedWords.join(' ');
  }
  formatAmount(amount, decimals = 6) {
    if (!amount) {
      return amount;
    }
    return (
      new Big(parseInt(amount))
        .div(this.totalFromDecimal(decimals))
        .toFixed(decimals) || '0'
    );
  }
  handleTransferDetailEthAndBsc(
    data: InfoTxEthAndBsc,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<TransferDetail>[] {
    let transferItem: Partial<TransferDetail> = {};
    transferItem.typeEvent = this.capitalizedWords(
      this.addSpacesToString(this.getFunctionName(data?.functionName)),
      ' '
    );
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
        isMinus: data?.from?.toLowerCase() == addressAccount?.toLowerCase(),
        isPlus: data?.to?.toLowerCase() == addressAccount?.toLowerCase()
      }
    ];
    return [transferItem];
  }
  handleItemTxsEthAndBsc(
    data: InfoTxEthAndBsc,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    let item: Partial<ResTxsInfo> = {};
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
    item.status = data?.isError == '0' ? 'success' : 'fail';
    item.memo = null;
    item.countTypeEvent = 0;
    item.gasUsed = this.formatNumberSeparateThousand(data?.gasUsed);
    item.gasWanted = this.formatNumberSeparateThousand(data?.gas);
    item.transfers = this.handleTransferDetailEthAndBsc(
      data,
      currentChain,
      addressAccount
    );
    return item;
  }

  cleanDataEthAndBscResToStandFormat(
    data: InfoTxEthAndBsc[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    let dataConverted: Partial<ResTxsInfo>[] = [];
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
  getModuleFromAction(action) {
    if (action && action?.includes('.')) {
      const splitData = action?.split('.');
      if (splitData?.length > 3) {
        return splitData[splitData?.length - 3];
      }
    }
    return null;
  }
  convertLastActionToVar(actionValue) {
    if (actionValue && actionValue?.includes('.')) {
      const splitData = actionValue?.split('.');
      return this.convertStringToVar(splitData[splitData?.length - 1]);
    }
    return null;
  }
  checkAmountHasDenom = (array) => {
    // loop through the array
    if (array) {
      for (let item of array) {
        // if the key is "amount" and the value is only a number
        if (item?.key === 'amount' && /^\d+$/.test(item?.value)) {
          // store the value as a number
          let amount = Number(item?.value);
          // loop through the array again
          for (let other of array) {
            // if the key is not "amount" and the value starts with the same number followed by some text
            if (
              other?.key !== 'amount' &&
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
  convertStringToVar = (string) => {
    // split the string by uppercase letters
    let words = string.split(/(?=[A-Z])/);
    // remove the first word "Msg"
    words.shift();
    // join the words with underscore and lowercase them
    return words.join('_').toLowerCase();
  };
  convertTypeEvent = (actionValue) => {
    return actionValue?.length > 0 &&
      actionValue?.toLowerCase()?.includes('msg')
      ? this.getStringAfterMsg(this.addSpacesToString(actionValue))
      : this.convertVarToWord(actionValue);
  };
  convertVarToWord(str) {
    const words = str && str.split('_');
    const capitalizedWords =
      words &&
      words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords && capitalizedWords.join(' ');
  }
  getStringAfterMsg(str) {
    const msgIndex = str?.toUpperCase().indexOf('MSG');
    if (msgIndex === -1) {
      return '';
    }
    return str.substring(msgIndex + 3);
  }
  checkDuplicateAmount = (array) => {
    let count = 0;

    for (let element of array) {
      if (element.key === 'amount') {
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
    const transfer = 'transfer';
    let isRecipient: boolean;
    const event = itemLog && find(get(itemLog, `events`), { type: 'message' });
    const action = event && find(get(event, 'attributes'), { key: 'action' });
    const actionValue = action?.value;
    const moduleEvent = this.getModuleFromAction(actionValue);
    const lastAction = this.convertLastActionToVar(actionValue);
    const eventModule =
      moduleEvent && find(get(itemLog, `events`), { type: moduleEvent });
    const eventLastAction =
      moduleEvent && find(get(itemLog, `events`), { type: lastAction });
    const moduleAction =
      eventModule && find(get(eventModule, 'attributes'), { key: 'action' });
    const moduleValue = moduleAction && moduleAction?.value;
    const eventType = this.convertTypeEvent(
      moduleValue ? moduleValue : actionValue
    );

    const valueTransfer =
      itemLog &&
      find(get(itemLog, `events`), {
        type: transfer
      });
    let dataTransfer;
    if (
      valueTransfer?.attributes &&
      this.checkDuplicateAmount(valueTransfer?.attributes)
    ) {
      dataTransfer = this.convertFormatArrayTransfer(valueTransfer?.attributes);
    } else {
      dataTransfer = [
        {
          amountData: valueTransfer
            ? find(valueTransfer?.attributes, { key: 'amount' })
            : this.checkAmountHasDenom(get(eventModule, 'attributes'))
            ? this.checkAmountHasDenom(get(eventModule, 'attributes'))
            : find(get(eventModule, 'attributes'), { key: 'amount' }) ||
              this.checkAmountHasDenom(get(eventLastAction, 'attributes'))
            ? this.checkAmountHasDenom(get(eventLastAction, 'attributes'))
            : find(get(eventLastAction, 'attributes'), { key: 'amount' }),
          from: valueTransfer
            ? find(valueTransfer?.attributes, { key: 'sender' })?.value
            : find(get(eventModule, 'attributes'), { key: 'from' }) ||
              find(get(eventModule, 'attributes'), { key: 'sender' }),
          to: valueTransfer
            ? find(valueTransfer?.attributes, { key: 'recipient' })?.value
            : find(get(eventModule, 'attributes'), { key: 'to' }) ||
              find(get(eventModule, 'attributes'), { key: 'recipient' })
        }
      ];
    }

    dataTransfer.forEach((itDataTransfer) => {
      isRecipient =
        itDataTransfer?.recipient?.value === address &&
        (actionValue === TYPE_ACTIONS_COSMOS_HISTORY['bank/MsgSend'] ||
          actionValue === TYPE_ACTIONS_COSMOS_HISTORY.send);

      const matchesAmount = get(itDataTransfer, 'amountData.value')
        ? itDataTransfer?.amountData?.value?.match(/\d+/g)
        : itDataTransfer?.amountData?.match(/\d+/g);
      const matchesDenom = get(itDataTransfer, 'amountData.value')
        ? itDataTransfer?.amountData?.value?.replace(/^\d+/g, '')
        : itDataTransfer?.amountData?.replace(/^\d+/g, '');
      itDataTransfer.amount = this.removeZeroNumberLast(
        this.formatNumberSeparateThousand(
          this.formatAmount(
            matchesAmount && matchesAmount[0],
            matchesDenom
              ? getCurrencyByMinimalDenom(currentChain.currencies, matchesDenom)
                  .coinDecimals
              : null
          )
        )
      );
      itDataTransfer.token =
        matchesDenom &&
        getCurrencyByMinimalDenom(
          currentChain.currencies,
          matchesDenom
        )?.coinDenom?.toUpperCase();

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
      dataTransfer,
      typeEvent: isRecipient ? 'Received' : eventType && eventType?.trim(),
      moduleValue: moduleEvent,
      eventValue: moduleValue ? moduleValue : actionValue,
      pathEvent: moduleValue ? `${moduleEvent}.action` : `message.action`
    };
  }
  convertDateToTimeStamp(da: Date): number {
    const date = new Date(da);
    const timestamp = date.getTime();
    return timestamp;
  }
  convertFormatArrayTransfer = (array) => {
    let newArray = [];

    let tempObject: {
      amountData?: string;
      from?: string;
      to?: string;
    } = {};

    for (let element of array) {
      if (element.key === 'amount') {
        tempObject['amountData'] = element.value;
      } else if (element.key === 'sender') {
        tempObject['from'] = element.value;
      } else if (element.key === 'recipient') {
        tempObject['to'] = element.value;
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
    let item: Partial<ResTxsInfo> = {};
    let dataEvents = [];
    item.status = data?.code === 0 ? 'success' : 'fail';
    item.txHash = data?.txhash;
    item.fee = this.removeZeroNumberLast(
      this.formatNumberSeparateThousand(
        this.calculateTransactionFee(
          data?.tx?.auth_info?.fee?.amount[0]?.amount,
          data?.gas_used,
          currentChain?.feeCurrencies[0]?.coinDecimals
        )
      )
    );
    item.denomFee = currentChain?.feeCurrencies[0]?.coinDenom?.toUpperCase();
    item.gasUsed = this.formatNumberSeparateThousand(data?.gas_used);
    item.gasWanted = this.formatNumberSeparateThousand(data?.gas_wanted);
    item.height = data?.height;
    item.memo = data?.tx?.body?.memo;
    item.time = this.formatTimeTron(
      this.convertDateToTimeStamp(data?.timestamp)
    );
    if (data?.code === 0) {
      const logs = data?.raw_log && JSON.parse(data?.raw_log);
      item.countTypeEvent = logs?.length > 1 ? logs?.length - 1 : 0;
      if (logs?.length > 0) {
        logs.forEach((itemLog) => {
          let itemDataTransferDetail = this.handleItemRawLogCosmos(
            itemLog,
            addressAccount,
            currentChain
          );
          dataEvents.push(itemDataTransferDetail);
        });
      }
    }
    item.transfers = dataEvents;

    return item;
  }
  cleanDataCosmosToStandFormat(
    tx_responses: TxResponseLcdCosmos[],
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo>[] {
    let dataConverted: Partial<ResTxsInfo>[] = [];
    if (tx_responses?.length > 0) {
      for (let i = 0; i < tx_responses.length; i++) {
        let item: Partial<ResTxsInfo>;
        const elementTx = tx_responses[i];
        item = this.handleItemCosmos(elementTx, currentChain, addressAccount);
        dataConverted.push(item);
      }
    }
    console.log('dataConverted: ', dataConverted);
    return dataConverted;
  }
  handleTransferDetailTron(
    data: ResultDataTron,
    addressAccount: string
  ): Partial<TransferDetail>[] {
    let transferItem: Partial<TransferDetail> = {};
    transferItem.typeEvent = this.capitalizedWords(
      this.addSpacesToString(data?.trigger_info?.methodName),
      ' '
    );
    transferItem.transferInfo = [
      {
        from: data?.ownerAddress,
        to: data?.toAddress,
        amount: this.removeZeroNumberLast(
          this.formatNumberSeparateThousand(
            this.formatAmount(data?.amount, data?.tokenInfo?.tokenDecimal)
          )
        ),
        token: data?.tokenInfo?.tokenAbbr?.toUpperCase() || '',
        isMinus:
          data?.ownerAddress?.toLowerCase() == addressAccount?.toLowerCase(),
        isPlus: data?.toAddress?.toLowerCase() == addressAccount?.toLowerCase()
      }
    ];
    return [transferItem];
  }
  handleItemTron(
    data: ResultDataTron,
    currentChain: ChainInfoInner<ChainInfo>,
    addressAccount: string
  ): Partial<ResTxsInfo> {
    let item: Partial<ResTxsInfo> = {};
    item.fee = `${data.cost.fee}`;
    item.height = `${data.block}`;
    item.denomFee = `${currentChain?.feeCurrencies[0]?.coinDenom?.toUpperCase}`;
    item.txHash = data.hash;
    item.status = data.contractRet == 'SUCCESS' ? 'success' : 'fail';
    item.time = this.formatTimeTron(data?.timestamp);
    item.gasUsed = '0';
    item.gasWanted = '0';
    item.countTypeEvent = 0;
    item.transfers = this.handleTransferDetailTron(data, addressAccount);
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
    let dataConverted: Partial<ResTxsInfo>[] = [];
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
