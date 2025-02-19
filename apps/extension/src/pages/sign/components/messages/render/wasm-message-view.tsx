import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Buffer } from "buffer/";
import { Button } from "../../../../../components/button";
import { Box } from "../../../../../components/box";
import { XAxis } from "../../../../../components/axis";
import { FormattedMessage } from "react-intl";
import Color from "color";
import styled, { css, useTheme } from "styled-components";
import { ColorPalette } from "src/styles";
import { ArrowDownIcon, ArrowUpIcon } from "components/icon";
import { VerticalCollapseTransition } from "components/transition/vertical-collapse";

const Styles = {
  ExpandButton: styled(Box)<{ viewTokenCount: number }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 1.5rem;

    cursor: pointer;

    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;

    ${({ viewTokenCount }) => {
      if (viewTokenCount === 0) {
        return css`
          cursor: not-allowed;
        `;
      }

      return css`
        :hover {
          background-color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["gray-10"]
              : Color(ColorPalette["gray-600"]).alpha(0.5).toString()};
        }

        :active {
          background-color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-500"]};
        }
      `;
    }};
  `,
};

export const WasmMessageView: FunctionComponent<{
  chainId: string;
  msg: object | string;
  isSecretWasm?: boolean;
}> = observer(({ chainId, msg, isSecretWasm }) => {
  const { accountStore } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via OWallet, OWallet cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that OWallet cannot decrypt it and allows the user to choose.
    if (isSecretWasm && typeof msg === "string") {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, "base64"));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          const owallet = await accountStore.getAccount(chainId).getOWallet();
          if (!owallet) {
            throw new Error("Can't get the owallet API");
          }

          const enigmaUtils = owallet.getEnigmaUtils(chainId);
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
          );

          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg("");
        } catch {
          setWarningMsg(
            "Failed to decrypt Secret message. This may be due to OWallet's encrypt/decrypt seed not matching the transaction seed."
          );
        }
      })();
    }
  }, [accountStore, chainId, isSecretWasm, msg]);

  return (
    <Box>
      <VerticalCollapseTransition
        collapsed={!isOpen}
        onTransitionEnd={() => {}}
      >
        <pre style={{ width: "15rem", margin: "0", marginBottom: "0.5rem" }}>
          {isOpen ? detailsMsg : ""}
        </pre>
        {warningMsg ? <div>{warningMsg}</div> : null}
      </VerticalCollapseTransition>
      {/* {isOpen ? (
        <React.Fragment>
          <pre style={{ width: "15rem", margin: "0", marginBottom: "0.5rem" }}>
            {isOpen ? detailsMsg : ""}
          </pre>
          {warningMsg ? <div>{warningMsg}</div> : null}
        </React.Fragment>
      ) : null}
      <XAxis>
        <Button
          size="extraSmall"
          color="secondary"
          text={
            isOpen ? (
              <FormattedMessage id="page.sign.components.messages.wasm-message-view.close-button" />
            ) : (
              <FormattedMessage id="page.sign.components.messages.wasm-message-view.details-button" />
            )
          }
          onClick={() => {
            toggleOpen();
          }}
        />
      </XAxis> */}
      <Styles.ExpandButton
        paddingX="0.125rem"
        alignX="center"
        onClick={() => {
          toggleOpen();
        }}
      >
        <Box
          style={{
            opacity: 1,
          }}
        >
          {!isOpen ? (
            <ArrowDownIcon
              width="1.25rem"
              height="1.25rem"
              color={ColorPalette["gray-300"]}
            />
          ) : (
            <ArrowUpIcon
              width="1.25rem"
              height="1.25rem"
              color={ColorPalette["gray-300"]}
            />
          )}
        </Box>
      </Styles.ExpandButton>
    </Box>
  );
});
