import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { HeaderLayout } from '../../layouts';
import style from './style.module.scss';
import { useStore } from '../../stores';
import { ChainIdEnum } from '@owallet/common';
import { useClientTestnet } from './use-client-testnet';

export const UserChat = ({ msg }) => {
  return (
    <div className={style.userMsg}>
      <p>{msg}</p>
    </div>
  );
};

const BACKEND_URL = "http://10.0.131.230:80";

export const ChatbotPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const userAddr = accountInfo._bech32Address;
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const client = useClientTestnet(accountOrai);
  console.log(userAddr);

  const callBot = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/swapNative`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_address: "orai",
          user_input: "Swap",
        }),
      });
      const data = await resp.json();
      // console.log(data);
      const {
        Action: action,
        Comment: botCmt,
        Pair_contract: contractAddr,
        inputamout: inputAmount,
        Parameters: params,
      } = data;
      const executeMsg = params.msg;
      const amount = inputAmount
        ? [{ amount: inputAmount, denom: 'orai' }]
        : undefined;
      // console.log(amount);
      const result = await handleBotResponse(
        userAddr,
        contractAddr,
        executeMsg,
        amount
      );
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  };

  async function handleBotResponse(
    senderAddr,
    contractAddr,
    executeMsg,
    amount
  ) {
    const result = await client.execute(
      senderAddr,
      contractAddr,
      executeMsg,
      'auto',
      undefined,
      amount
    );
    return result;
  }

  // useEffect(() => {
  //   fetch(
  //     'https://api.oraidex.io/price?base_denom=orai&quote_denom=orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh&tf=240'
  //   )
  //     .then((res) => res.json())
  //     .then((data) => console.log(data))
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, []);

  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <div className={style.container}>
        <div className="frame-wrapper">
          <div className="frame">
            <div className="div">
              <div className={style.header}>
                <img
                  className="img"
                  alt="WeMinimal Icon"
                  src={require('../../public/assets/img/we-minimal-icon.svg')}
                />
                <p>How can I help you?</p>
              </div>
              <div className={style.wrapperCommonPrompt}>
                <div className={style.commonPrompt}>
                  <p>Price of token today</p>
                </div>
                <div className={style.commonPrompt}>
                  <p>Deploy CW-20</p>
                </div>
                <div className={style.commonPrompt}>
                  <p>The fluctuation of token this year</p>
                </div>
              </div>
              {/* <div className={style.wrapperChat}>
                <div className={style.wrapperUserChat}>
                  <div className={style.userChat}>
                    <p>Price of token today</p>
                  </div>
                </div>
                <div className={style.wrapperBotChat}>
                  <div className={style.botChat}>
                    <p>Sure, wait me a minute</p>
                  </div>
                </div>
                <div className={style.wrapperBotChat}>
                  <div className={style.botChat}>
                    <p>
                      To get the latest price information for Orai Coin, I
                      recommend checking a reputable cryptocurrency exchange,
                      financial news website, or the official website of the
                      project. Keep in mind that prices can vary between
                      different exchanges.
                    </p>
                  </div>
                </div>
              </div> */}
              <div>
                <div className={style.inputWrapperContent}>
                  <input
                    className={style.inputBox}
                    type="text"
                    placeholder="Ask anything..."
                  />
                  <img
                    onClick={() => callBot()}
                    className="arrow-up-square"
                    alt="Arrow up square"
                    src={require('../../public/assets/img/arrow-up-square.svg')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeaderLayout>
  );
});
