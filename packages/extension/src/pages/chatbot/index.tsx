import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useReducer, useRef } from 'react';
import { HeaderLayout } from '../../layouts';
import style from './style.module.scss';
import { useStore } from '../../stores';
import { ChainIdEnum } from '@owallet/common';
import { useClientTestnet } from './use-client-testnet';

export const UserChat = ({ msg }) => {
  return (
    <div className={style.wrapperUserChat}>
      <div className={style.userChat}>
        <p>{msg}</p>
      </div>
    </div>
  );
};

export const BotChat = ({ msg }) => {
  return (
    <div className={style.wrapperBotChat}>
      <div className={style.botChat}>
        <p>{msg}</p>
      </div>
    </div>
  );
};

export const Messages = ({ messages }) => {
  return (
    <div className={style.wrapperChat}>
      {messages.map((msg) => {
        if (msg.isUser) {
          return <UserChat msg={msg.msg} />;
        }
        return <BotChat msg={msg.msg} />;
      })}
    </div>
  );
};

const BACKEND_URL = 'http://10.0.131.230:80';

enum StatusEnum {
  READY = 'ready',
  CHAT = 'chat',
}

const initialState = {
  messages: [],
  prompt: '',
  status: StatusEnum.READY,
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
      return {
        ...state,
        messages: [...state.messages, payload],
        prompt: '',
        status: StatusEnum.CHAT,
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

  // const [prompt, setPrompt] = useState('');
  // const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  const [{ messages, prompt, status }, dispatch] = useReducer(
    reducer,
    initialState
  );

  console.log(userAddr);

  // const testChatUI = useCallback(() => {
  //   setMessages([
  //     ...messages,
  //     {
  //       isUser: true,
  //       msg: prompt,
  //     },
  //     {
  //       isUser: false,
  //       msg: 'Answer',
  //     },
  //   ]);
  //   setPrompt('');
  // }, null);

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

    // setMessages([
    //   ...messages,
    //   {
    //     isUser: true,
    //     msg: prompt,
    //   },
    //   {
    //     isUser: false,
    //     msg: 'Answer',
    //   },
    // ]);
    // setPrompt('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callBot = async () => {
    // setMessages([
    //   ...messages,
    //   {
    //     isUser: true,
    //     msg: prompt,
    //   },
    // ]);
    // setPrompt('');
    try {
      const resp = await fetch(`${BACKEND_URL}/swapNative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_address: 'orai',
          user_input: 'Swap',
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
      // setMessages([
      //   ...messages,
      //   {
      //     isUser: false,
      //     msg: botCmt,
      //   },
      // ]);
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
              {status === StatusEnum.READY && (
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

              {status === StatusEnum.CHAT && <Messages messages={messages} />}

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
                    className={style.inputBox}
                    type="text"
                    placeholder="Ask anything..."
                  />
                  <img
                    // onClick={() => callBot()}
                    onClick={() => testChatUI()}
                    style={{ cursor: 'pointer' }}
                    className="arrow-up-square"
                    alt="Arrow up square"
                    src={require('../../public/assets/img/arrow-up-square.svg')}
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
