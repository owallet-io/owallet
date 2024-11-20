import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AppChainInfo } from '@owallet/types';
import { Text } from '../../../components/common/text';
import colors from '../../../theme/colors';
import { Address } from '../../../components/address';
import { useStore } from '../../../stores';
import { assets } from 'chain-registry';

const getIconWithChainRegistry = baseDenom => {
  if (!baseDenom) return undefined;

  const supportedChains = new Set([
    'osmosis',
    'cosmoshub',
    'injective',
    'noble',
    'celestia',
    'oraichain',
    'neutaro',
    'binancesmartchain',
    'bitcoin',
    'ethereum',
    'tron',
    'ton'
  ]);

  const baseDenomUpper = baseDenom.toUpperCase();

  const assetList = assets.flatMap(({ chain_name, assets }) => (supportedChains.has(chain_name) ? assets : []));

  const isMatchingAsset = asset => {
    const [chain, token] = asset.base.split(':');
    const tokenAddressMatch = asset?.address?.toUpperCase() === baseDenomUpper;
    const denomMatch = (token || chain).toUpperCase() === baseDenomUpper;

    return denomMatch || tokenAddressMatch;
  };

  return assetList.find(isMatchingAsset);
};

const TokenRenderer: FunctionComponent<{ token: any }> = ({ token }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      margin: '4px 0'
    }}
  >
    {token?.logo_URIs?.png || token?.imgUrl || token?.coinImageUrl ? (
      <img
        style={{ width: 14, height: 14, borderRadius: 28, marginRight: 4 }}
        src={token?.logo_URIs?.png ?? token?.imgUrl ?? token?.coinImageUrl}
      />
    ) : null}
    <Text weight="600">{token.symbol ?? token?.abbr ?? token?.coinDenom ?? token?.denom}</Text>
  </div>
);

const PathRenderer: FunctionComponent<{
  inToken?: any;
  outToken?: any;
  inContract?: string;
  outContract?: string;
}> = ({ inToken, outToken, inContract, outContract }) => (
  <div style={{ marginTop: 14, height: 'auto', alignItems: 'center' }}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14
      }}
    >
      <div style={{ maxWidth: '50%' }}>
        <div style={{ flexDirection: 'column', display: 'flex' }}>
          <Text color={colors['neutral-text-body']}>Pay token</Text>
          {inToken ? <TokenRenderer token={inToken} /> : <Text color={colors['neutral-text-body']}>-</Text>}
          {inContract && inContract !== '-' ? (
            <Address
              maxCharacters={8}
              lineBreakBeforePrefix={false}
              textDecor={'underline'}
              textColor={colors['neutral-text-body']}
            >
              {inContract}
            </Address>
          ) : (
            <Text color={colors['neutral-text-body']}>-</Text>
          )}
        </div>
      </div>
      <img style={{ paddingRight: 4 }} src={require('assets/icon/tdesign_arrow-right.svg')} />
      <div style={{ maxWidth: '50%' }}>
        <div style={{ flexDirection: 'column', display: 'flex' }}>
          <Text color={colors['neutral-text-body']}>Receive token</Text>
          {outToken ? <TokenRenderer token={outToken} /> : <Text color={colors['neutral-text-body']}>-</Text>}
          {outContract && outContract !== '-' ? (
            <Address
              maxCharacters={8}
              lineBreakBeforePrefix={false}
              textDecor={'underline'}
              textColor={colors['neutral-text-body']}
            >
              {outContract}
            </Address>
          ) : (
            <Text color={colors['neutral-text-body']}>-</Text>
          )}
        </div>
      </div>
    </div>
    <div
      style={{
        width: '100%',
        height: 1,
        backgroundColor: colors['neutral-border-default']
      }}
    />
  </div>
);

const FromToRenderer: FunctionComponent<{
  fromToken?: any;
  toToken?: any;
}> = ({ fromToken, toToken }) => (
  <div style={{ marginTop: 14, height: 'auto', alignItems: 'center' }}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14
      }}
    >
      <div style={{ maxWidth: '50%' }}>
        <div style={{ flexDirection: 'column', display: 'flex' }}>
          <Text color={colors['neutral-text-body']}>Pay token</Text>
          {fromToken ? <TokenRenderer token={fromToken} /> : <Text color={colors['neutral-text-body']}>-</Text>}
        </div>
      </div>
      <img style={{ paddingRight: 4 }} src={require('assets/icon/tdesign_arrow-right.svg')} />
      <div style={{ maxWidth: '50%' }}>
        <div style={{ flexDirection: 'column', display: 'flex' }}>
          <Text color={colors['neutral-text-body']}>Receive token</Text>
          {toToken ? <TokenRenderer token={toToken} /> : <Text color={colors['neutral-text-body']}>-</Text>}
        </div>
      </div>
    </div>
    <div
      style={{
        width: '100%',
        height: 1,
        backgroundColor: colors['neutral-border-default']
      }}
    />
  </div>
);

const InfoRenderer: FunctionComponent<{
  condition: any;
  label: string;
  leftContent: JSX.Element;
}> = ({ condition, label, leftContent }) =>
  condition && condition !== '' ? (
    <div style={{ marginTop: 14, height: 'auto', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 14
        }}
      >
        <div>
          <Text weight="600">{label}</Text>
        </div>
        <div
          style={{
            alignItems: 'flex-end',
            maxWidth: '65%',
            wordBreak: 'break-all'
          }}
        >
          <div>{leftContent}</div>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: 1,
          backgroundColor: colors['neutral-border-default']
        }}
      />
    </div>
  ) : null;

export const CosmosRenderArgs: FunctionComponent<{
  msg: any;
  i: Number;
  chain: AppChainInfo;
}> = observer(({ msg, chain, i }) => {
  const { chainStore } = useStore();
  const [isMore, setIsMore] = useState(true);
  const txInfo = msg ? { ...msg } : {};
  const decodeMsg = msg?.unpacked?.msg ? JSON.parse(Buffer.from(msg.unpacked.msg).toString()) : msg?.unpacked;

  txInfo.decode = decodeMsg;

  console.log('txInfo', txInfo);

  const parseJSON = data => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const extractLastOperation = operations => operations?.[operations.length - 1];

  const getSwapTokens = swapData => {
    const firstOperation = swapData?.operations?.[0];
    const lastOperation = extractLastOperation(swapData?.operations);

    return {
      fromToken: firstOperation ? getIconWithChainRegistry(firstOperation.denom_in) : null,
      toToken: lastOperation ? getIconWithChainRegistry(lastOperation.denom_out) : null
    };
  };

  const getTokenFromCW20 = (chainStore, chainId, address) => {
    const chainInfo = chainStore.chainInfos.find(c => c.chainId === chainId);
    return chainInfo?.currencies.find(cur => cur.contractAddress === address) ?? null;
  };

  // Decode extra information
  const extraInfo = decodeMsg?.send?.msg ? atob(decodeMsg.send.msg) : null;
  txInfo.extraInfo = extraInfo ? parseJSON(extraInfo) : null;

  const decodeData = txInfo.extraInfo ?? txInfo.decode;

  let fromToken = null;
  let toToken = null;
  let toAddress = null;

  // Handle swap and transfer data
  if (decodeData.swap_and_action) {
    const swapAction = decodeData.swap_and_action;

    // Extract toAddress from post-swap actions
    toAddress =
      swapAction.post_swap_action?.transfer?.to_address ||
      swapAction.post_swap_action?.ibc_transfer?.ibc_info?.receiver;

    // Extract tokens from swap operations
    if (swapAction.user_swap?.swap_exact_asset_in) {
      const swapTokens = getSwapTokens(swapAction.user_swap.swap_exact_asset_in);
      fromToken = swapTokens.fromToken;
      toToken = swapTokens.toToken;
    }

    // Handle IBC transfer memo
    const ibcMemo = swapAction.post_swap_action?.ibc_transfer?.ibc_info?.memo;
    if (ibcMemo) {
      const info = parseJSON(ibcMemo);
      const next = parseJSON(info?.forward?.next);
      if (next) {
        const lastDes = extractLastOperation(
          next.wasm?.msg?.swap_and_action?.user_swap?.swap_exact_asset_in?.operations
        );
        if (lastDes) {
          toToken = getIconWithChainRegistry(lastDes.denom_out);
        }
      }
    }

    // Extract token from CW20 asset
    const minAsset = swapAction.min_asset?.cw20;
    if (minAsset) {
      toToken = getTokenFromCW20(chainStore, chain?.chainId, minAsset.address);
    }
  }

  // Handle memo data
  if (decodeData.memo && !decodeData.memo.startsWith('orai')) {
    const info = parseJSON(decodeData.memo);
    if (info) {
      const swapTokens = getSwapTokens(info.wasm?.msg?.swap_and_action?.user_swap?.swap_exact_asset_in);
      fromToken = swapTokens.fromToken || fromToken;
      toToken = swapTokens.toToken || toToken;
    }
  }

  console.log('fromToken', fromToken);
  console.log('toToken', toToken);
  console.log('toAddress', toAddress);
  // let minimum_receive;
  // let ask_asset_info;
  // const execute_swap_operations = txInfo.extraInfo?.execute_swap_operations || txInfo.decode?.execute_swap_operations;

  // if (execute_swap_operations) {
  //   const lastDes = execute_swap_operations.operations?.pop();
  //   const ask_asset = lastDes?.orai_swap?.ask_asset_info?.token?.contract_addr;
  //   minimum_receive = execute_swap_operations.minimum_receive;

  //   if (ask_asset) {
  //     EmbedChainInfos.forEach(c => {
  //       if (c.chainId === chain?.chainId) {
  //         ask_asset_info = c.currencies.find(
  //           //@ts-ignore
  //           cur => cur.contractAddress === ask_asset
  //         );
  //       }
  //     });
  //   }
  // }

  // let contractInfo;
  // let receiveToken;
  // let tokenOut;
  // let tokensIn = [];

  // if (txInfo.unpacked?.contract) {
  //   EmbedChainInfos.forEach(c => {
  //     if (c.chainId === chain?.chainId) {
  //       contractInfo = c.currencies.find(
  //         //@ts-ignore
  //         cur => cur.contractAddress === txInfo.unpacked.contract
  //       );
  //     }
  //   });
  // }

  // if (txInfo.unpacked?.token) {
  //   const { denom, amount } = txInfo.unpacked.token;
  //   if (denom && amount) {
  //     const coin = new Coin(denom, amount);
  //     const parsed = CoinUtils.parseDecAndDenomFromCoin(chainStore.current.currencies, coin);

  //     if (parsed) {
  //       receiveToken = {
  //         amount: clearDecimals(parsed.amount),
  //         denom: parsed.denom
  //       };
  //       tokenOut = parsed.currency || {
  //         amount: clearDecimals(parsed.amount),
  //         denom: parsed.denom
  //       };
  //     }
  //   }
  // }

  // if (txInfo.unpacked?.funds) {
  //   txInfo.unpacked.funds.forEach(coinPrimitive => {
  //     const { denom, amount } = coinPrimitive;
  //     if (denom && amount) {
  //       const coin = new Coin(denom, amount);
  //       const parsed = CoinUtils.parseDecAndDenomFromCoin(chainStore.current.currencies, coin);
  //       if (parsed) {
  //         tokensIn.push(
  //           parsed.currency || {
  //             amount: clearDecimals(parsed.amount),
  //             denom: parsed.denom
  //           }
  //         );
  //       }
  //     }
  //   });
  // }

  return (
    <div>
      {i === 0 && chain?.chainName && (
        <InfoRenderer
          condition={chain.chainName}
          label="Network"
          leftContent={
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <img
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 28,
                  marginRight: 4
                }}
                src={chain.chainSymbolImageUrl ?? chain.stakeCurrency?.coinImageUrl}
              />
              <Text weight="600">{chain.chainName}</Text>
            </div>
          }
        />
      )}
      {txInfo?.unpacked?.sender && (
        <InfoRenderer
          condition={txInfo.unpacked.sender}
          label="Sender"
          leftContent={<Text color={colors['neutral-text-body']}>{txInfo.unpacked.sender}</Text>}
        />
      )}
      {toAddress && (
        <InfoRenderer
          condition={toAddress}
          label="To Address"
          leftContent={<Text color={colors['neutral-text-body']}>{toAddress}</Text>}
        />
      )}
      {fromToken || toToken ? <FromToRenderer fromToken={fromToken} toToken={toToken} /> : null}
      {!isMore && (
        <>
          {txInfo?.unpacked?.funds?.map((fund, index) => (
            <InfoRenderer
              key={index}
              condition={fund}
              label="Fund"
              leftContent={
                <Text color={colors['neutral-text-body']}>
                  {fund?.amount} {fund?.denom}
                </Text>
              }
            />
          ))}
          {/* {contractInfo && (
            <InfoRenderer
              condition={contractInfo}
              label="Amount"
              leftContent={
                <Text color={colors['neutral-text-body']}>
                  {toDisplay(txInfo?.decode?.send?.amount, contractInfo.coinDecimals)} {contractInfo.coinDenom}
                </Text>
              }
            />
          )} */}
          {/* {ask_asset_info && minimum_receive && (
            <InfoRenderer
              condition={ask_asset_info && minimum_receive}
              label="Min. Receive"
              leftContent={
                <Text color={colors['neutral-text-body']}>
                  {toDisplay(minimum_receive, ask_asset_info.coinDecimals)} {ask_asset_info.coinDenom}
                </Text>
              }
            />
          )} */}
          {/* {txInfo?.unpacked?.receiver && (
            <InfoRenderer
              condition={txInfo.unpacked.receiver}
              label="Receiver"
              leftContent={<Text color={colors['neutral-text-body']}>{txInfo.unpacked.receiver}</Text>}
            />
          )} */}
          {/* {receiveToken && (
            <InfoRenderer
              condition={receiveToken}
              label="Transfer"
              leftContent={
                <Text color={colors['neutral-text-body']}>
                  {receiveToken.amount} {receiveToken.denom}
                </Text>
              }
            />
          )} */}
        </>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          cursor: 'pointer',
          justifyContent: 'flex-end',
          width: '100%',
          marginTop: 8
        }}
        onClick={() => setIsMore(!isMore)}
      >
        <Text size={14} weight="500">{`View ${isMore ? 'more' : 'less'}`}</Text>
        <img src={require(`assets/icon/tdesign_chevron-${isMore ? 'down' : 'up'}.svg`)} />
      </div>
    </div>
  );
});
