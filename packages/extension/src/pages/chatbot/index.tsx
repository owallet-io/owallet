import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useReducer, useRef } from 'react';
import { HeaderLayout } from '../../layouts';
import style from './style.module.scss';
import { useStore } from '../../stores';
import { ChainIdEnum } from '@owallet/common';
import { useClientTestnet } from './use-client-testnet';
import { OptionEnum, StatusEnum } from './enum';
import { Dropdown } from './dropdown';
import { Messages } from './messages';

const BACKEND_URL = 'http://127.0.0.1:5000';

const initialState = {
  messages: JSON.parse(localStorage.getItem('messages')) || [],
  prompt: '',
  status: StatusEnum.READY,
  chosenOption: OptionEnum.ORAIDEX,
  pairContractAddr:
    'orai1agqfdtyd9lr0ntmfjtzl4f6gyswpeq4z4mdnq4npdxdc99tcw35qesmr9v',
};

function reducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case 'on_change_prompt':
      return {
        ...state,
        prompt: action.payload,
      };
    case 'chat':
      localStorage.setItem(
        'messages',
        JSON.stringify([...state.messages, payload])
      );
      return {
        ...state,
        messages: [...state.messages, payload],
        prompt: '',
        status: StatusEnum.CHAT,
      };
    case 'choose_option':
      return {
        ...state,
        chosenOption: payload,
      };
    case 'reset':
      localStorage.removeItem('messages');
      return {
        ...state,
        messages: [],
        prompt: '',
        status: StatusEnum.READY,
      };
    case 'on_change_pair_contract_addr':
      return {
        ...state,
        pairContractAddr: payload,
      };
    case 'reload_messages':
      return {
        ...state,
        messages: JSON.parse(localStorage.getItem('messages')),
      };
  }
  throw Error('Unknown action: ' + action.type);
}

export const ChatbotPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const userAddr = accountInfo._bech32Address;
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const client = useClientTestnet(accountOrai);

  const messagesEndRef = useRef(null);

  const [
    { messages, prompt, status, chosenOption, pairContractAddr },
    dispatch,
  ] = useReducer(reducer, initialState);

  console.log(userAddr);

  useEffect(() => {
    dispatch({
      type: 'reload_messages',
    });
  }, []);

  const testChatUI = () => {
    dispatch({
      type: 'chat',
      payload: {
        isUser: true,
        msg: prompt,
      },
    });

    dispatch({
      type: 'chat',
      payload: {
        isUser: false,
        msg: 'Answer',
      },
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callBot = async (
    userAddr,
    dispatch,
    prompt,
    pairContractAddr,
    chosenOption
  ) => {
    let endPoint = '';
    if (chosenOption === OptionEnum.SWAP) {
      endPoint = `${BACKEND_URL}/swapNative`;
      dispatch({
        type: 'chat',
        payload: {
          isUser: true,
          msg: prompt,
        },
      });
      try {
        const resp = await fetch(endPoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_address: userAddr,
            user_input: prompt,
            pair_contract: pairContractAddr,
          }),
        });
        const data = await resp.json();
        console.log(data);
        const { answer, msg } = data;
        const msgObject = JSON.parse(msg);
        const {
          Action: action,
          Pair_contract: contractAddr,
          inputamout: inputAmount,
          Parameters: params,
        } = msgObject;
        const executeMsg = params.msg;
        const amount = inputAmount
          ? [{ amount: inputAmount, denom: 'orai' }]
          : undefined;
        console.log(amount);
        const result = await handleBotResponse(
          userAddr,
          contractAddr,
          executeMsg,
          amount
        );
        const { transactionHash } = result;
        dispatch({
          type: 'chat',
          payload: {
            isUser: false,
            msg: `${answer}. Go to here https://testnet.scan.orai.io/txs/${transactionHash} to see transaction`,
          },
        });
        console.log(result);
      } catch (err) {
        console.log(err);
      }
    } else {
      endPoint = `${BACKEND_URL}/chatoraidex`;
      try {
        // console.log(userAddr);
        // console.log(prompt);
        dispatch({
          type: 'chat',
          payload: {
            isUser: true,
            msg: prompt,
          },
        });
        const resp = await fetch(endPoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_address: userAddr,
            user_input: prompt,
          }),
        });
        const data = await resp.json();
        const { output } = data;
        console.log(data);
        dispatch({
          type: 'chat',
          payload: {
            isUser: false,
            msg: output,
          },
        });
        // console.log(result);
      } catch (err) {
        console.log(err);
      }
    }
    console.log(endPoint);
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
  //   document.addEventListener('keypress', (evt) => {
  //     if (evt.key == 'Enter') {
  //       testChatUI();
  //     }
  //   });

  //   return () => {
  //     document.removeEventListener('keypress', (evt) => {
  //       if (evt.key == 'Enter') {
  //         testChatUI();
  //       }
  //     });
  //   };
  // }, [testChatUI]);

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
              {status === StatusEnum.READY && messages.length == 0 && (
                <div className={style.wrapperCommonPrompt}>
                  <div
                    className={style.commonPrompt}
                    onClick={(evt) =>
                      dispatch({
                        type: 'on_change_prompt',
                        payload: evt.target.innerText,
                      })
                    }
                  >
                    <p>Price of token today</p>
                  </div>
                  <div
                    className={style.commonPrompt}
                    onClick={(evt) =>
                      dispatch({
                        type: 'on_change_prompt',
                        payload: evt.target.innerText,
                      })
                    }
                  >
                    <p>Deploy CW-20</p>
                  </div>
                  <div
                    className={style.commonPrompt}
                    onClick={(evt) =>
                      dispatch({
                        type: 'on_change_prompt',
                        payload: evt.target.innerText,
                      })
                    }
                  >
                    <p>The fluctuation of token this year</p>
                  </div>
                </div>
              )}

              {(status === StatusEnum.CHAT || messages.length != 0) && (
                <Messages messages={messages} />
              )}

              {/* <div className={style.wrapperChat}>
                <UserChat msg="Price of token today" />
                <BotChat msg="Sure, wait me a minute" />
                <BotChat
                  msg="To get the latest price information for Orai Coin, I
                      recommend checking a reputable cryptocurrency exchange,
                      financial news website, or the official website of the
                      project. Keep in mind that prices can vary between
                      different exchanges."
                />
              </div> */}

              <div>
                <div className={style.inputWrapperContent}>
                  <input
                    value={prompt}
                    onChange={(e) =>
                      dispatch({
                        payload: e.target.value,
                        type: 'on_change_prompt',
                      })
                    }
                    onKeyDown={(evt) => {
                      if (evt.key === 'Enter') {
                        testChatUI();
                        // callBot(userAddr, dispatch, prompt);
                      }
                    }}
                    className={style.inputBox}
                    type="text"
                    placeholder="Ask anything..."
                  />
                  <i
                    onClick={() => {
                      dispatch({
                        type: 'reset',
                      });
                    }}
                    className={`fas fa-trash-alt ${style.iconTrash}`}
                  />
                  <img
                    onClick={() =>
                      callBot(
                        userAddr,
                        dispatch,
                        prompt,
                        pairContractAddr,
                        chosenOption
                      )
                    }
                    // onClick={() => testChatUI()}
                    style={{ cursor: 'pointer' }}
                    className="arrow-up-square"
                    alt="Arrow up square"
                    src={require('../../public/assets/img/arrow-up-square.svg')}
                  />
                </div>
                <div className={style.inputWrapperContent}>
                  <Dropdown chosenOption={chosenOption} dispatch={dispatch} />
                </div>
                <div className={style.inputWrapperContent}>
                  <input
                    className={style.inputBox}
                    placeholder="Pair contract address"
                    value={pairContractAddr}
                    onChange={(e) =>
                      dispatch({
                        payload: e.target.value,
                        type: 'on_change_pair_contract_addr',
                      })
                    }
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={messagesEndRef} />
      </div>
    </HeaderLayout>
  );
});
