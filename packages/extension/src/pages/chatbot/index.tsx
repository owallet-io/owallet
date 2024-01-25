import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { HeaderLayout } from '../../layouts';
import style from './style.module.scss';
import { useStore } from '../../stores';
import { ChainIdEnum } from '@owallet/common';
import { useClientTestnet } from './use-client-testnet';
import { OptionEnum, StatusEnum } from './enum';
import { Dropdown } from './dropdown';
import { Messages } from './messages';
import { Loader } from './loader';

const BACKEND_URL = 'https://oraidex-tools.fly.dev';

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
  const userAddr = accountInfo.bech32Address;
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const client = useClientTestnet(accountOrai);

  const messagesEndRef = useRef(null);

  const [
    { messages, prompt, status, chosenOption, pairContractAddr },
    dispatch,
  ] = useReducer(reducer, initialState);

  const [isLoading, setIsLoading] = useState(false);

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
    chosenOption,
    setIsLoading
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
      setIsLoading(true);
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
        setIsLoading(false);
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
        const messages = JSON.parse(localStorage.getItem('messages'));
        // because when execute it will redirect to signing page so the component will be unmount so we need to save messages to localstorage (temp solution)
        localStorage.setItem(
          'messages',
          JSON.stringify([
            ...messages,
            {
              isUser: false,
              msg: `${answer}. Go to here https://testnet.scan.orai.io/txs/${transactionHash} to see transaction`,
            },
          ])
        );
      } catch (err) {
        console.log(err);
      }
    } else {
      endPoint = `${BACKEND_URL}/chatoraidex`;
      try {
        dispatch({
          type: 'chat',
          payload: {
            isUser: true,
            msg: prompt,
          },
        });
        setIsLoading(true);
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
        setIsLoading(false);
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
                        payload: (evt.target as HTMLDivElement).innerText,
                      })
                    }
                  >
                    <p>Compare current price of AIRight with 20 days ago</p>
                  </div>
                  <div
                    className={style.commonPrompt}
                    onClick={(evt) =>
                      dispatch({
                        type: 'on_change_prompt',
                        payload: (evt.target as HTMLDivElement).innerText,
                      })
                    }
                  >
                    <p>Analyze the current trends of Orai tokens on Oraidex</p>
                  </div>
                  <div
                    className={style.commonPrompt}
                    onClick={(evt) =>
                      dispatch({
                        type: 'on_change_prompt',
                        payload: (evt.target as HTMLDivElement).innerText,
                      })
                    }
                  >
                    <p>Compare the price of Airight on Oraidex</p>
                  </div>
                </div>
              )}

              {(status === StatusEnum.CHAT || messages.length != 0) && (
                <Messages messages={messages} />
              )}

              {isLoading && <Loader />}

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
                        callBot(
                          userAddr,
                          dispatch,
                          prompt,
                          pairContractAddr,
                          chosenOption,
                          setIsLoading
                        );
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
                        chosenOption,
                        setIsLoading
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
