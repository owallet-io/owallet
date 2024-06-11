import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { EmbedChainInfos, getBase58Address, toDisplay } from "@owallet/common";
import { Text } from "../../../../components/common/text";
import colors from "../../../../theme/colors";
import { AppChainInfo } from "@owallet/types";
import {
  calculateJaccardIndex,
  findKeyBySimilarValue,
  getTokenInfo,
} from "../../helpers/helpers";
import { LIST_ORAICHAIN_CONTRACT } from "../../helpers/constant";
import { decodeBase64 } from "../../../../helpers/helper";

export const TronRenderParams: FunctionComponent<{
  params: Array<any>;
  chain: AppChainInfo;
  contractAddress: string;
  renderInfo: (condition, label, content) => ReactElement;
}> = observer(({ params, renderInfo, chain, contractAddress }) => {
  const [token, setToken] = useState(null);

  const findToken = async (contractAddress) => {
    if (chain?.chainId && contractAddress) {
      try {
        const token = await getTokenInfo(contractAddress, chain.chainId);
        setToken(token.data);
      } catch (err) {
        EmbedChainInfos.map((c) => {
          if (c.chainId === chain.chainId) {
            const token = c.currencies.find(
              //@ts-ignore
              (cu) => cu.contractAddress === contractAddress
            );

            setToken(token);
          }
        });
      }
    }
  };

  useEffect(() => {
    params?.map((p) => {
      if (p.type === "address") {
        findToken(getBase58Address(p.value));
      }
    });
  }, [params]);

  useEffect(() => {
    const fetchToken = async () => {
      if (chain?.chainId && contractAddress) {
        const token = await getTokenInfo(contractAddress, chain.chainId);
        setToken(token.data);
      }
    };
    fetchToken();
  }, [chain?.chainId, contractAddress]);

  const convertDestinationToken = (value) => {
    if (value) {
      const encodedData = value.split(":")?.[1];
      if (encodedData) {
        const decodedData = decodeBase64(encodedData);

        if (decodedData) {
          // Regular expression pattern to split the input string
          const pattern = /[\x00-\x1F]+/;

          const addressPattern = /[a-zA-Z0-9]+/g;

          // Split the input string using the pattern
          const array = decodedData.split(pattern).filter(Boolean);
          if (array.length < 1) {
            array.push(decodedData);
          }
          const des = array.shift();
          const token = array.pop();

          let tokenInfo;
          if (token) {
            EmbedChainInfos.find((chain) => {
              if (
                chain.stakeCurrency.coinMinimalDenom ===
                token.match(addressPattern).join("")
              ) {
                tokenInfo = chain.stakeCurrency;
                return;
              }
              if (
                chain.stakeCurrency.coinMinimalDenom ===
                token.match(addressPattern).join("")
              ) {
                tokenInfo = chain.stakeCurrency;
                return;
              }
              const foundCurrency = chain.currencies.find(
                (cr) =>
                  cr.coinMinimalDenom ===
                    token.match(addressPattern).join("") ||
                  //@ts-ignore
                  cr.contractAddress === token.match(addressPattern).join("") ||
                  calculateJaccardIndex(cr.coinMinimalDenom, token) > 0.85
              );

              if (foundCurrency) {
                tokenInfo = foundCurrency;
                return;
              }
            });
          }

          if (!tokenInfo && token) {
            const key = findKeyBySimilarValue(
              LIST_ORAICHAIN_CONTRACT,
              token.match(addressPattern).join("")
            )?.split("_")?.[0];

            if (key)
              tokenInfo = {
                coinDenom: key,
                contractAddress: token.match(addressPattern).join(""),
              };
          }

          return {
            des: des.match(addressPattern).join(""),
            tokenInfo: tokenInfo,
          };
        }
      }
    }
  };

  const renderParams = () => {
    return (
      <div>
        {params?.map((p) => {
          if (p.type === "uint256") {
            return renderInfo(
              p?.value,
              "Amount In",
              <Text>
                {toDisplay(
                  (p?.value).toString(),
                  chain.stakeCurrency.coinDecimals
                )}
              </Text>
            );
          }
          if (p.type === "address") {
            let toContractComponent;
            toContractComponent = renderInfo(
              p?.value,
              "To Contract",
              <Text>{getBase58Address(p?.value)}</Text>
            );

            return <>{toContractComponent}</>;
          }

          if (p.type === "string") {
            const { des, tokenInfo } = convertDestinationToken(p?.value);
            let desComponent, tokenComponent;

            if (des) {
              desComponent = renderInfo(
                des,
                "Destination Address",
                <Text>{des ? des : null}</Text>
              );
            }
            if (tokenInfo) {
              tokenComponent = renderInfo(
                tokenInfo.coinDenom,
                "Token Out",
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <img
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 28,
                      marginRight: 4,
                      backgroundColor: colors["neutral-surface-pressed"],
                    }}
                    src={tokenInfo?.coinImageUrl}
                  />
                  <Text weight="600">{tokenInfo?.coinDenom}</Text>
                </div>
              );
            }

            return (
              <>
                {desComponent}
                {tokenComponent}
              </>
            );
          }
        })}
      </div>
    );
  };
  return (
    <div>
      {renderParams()}
      {token
        ? renderInfo(
            token,
            "Token In",
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <img
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 28,
                  marginRight: 4,
                  backgroundColor: colors["neutral-surface-pressed"],
                }}
                src={token?.imgUrl ?? token?.coinImageUrl}
              />
              <Text weight="600">{token?.abbr ?? token?.coinDenom}</Text>
            </div>
          )
        : null}
    </div>
  );
});
