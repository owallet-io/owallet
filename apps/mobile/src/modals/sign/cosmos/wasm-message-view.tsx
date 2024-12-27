import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Buffer } from "buffer/";
import { useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { Box } from "../../../components/box";
import { XAxis } from "../../../components/axis";
import { Button } from "../../../components/button";
import { StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { OWButton } from "@components/button";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";

export const WasmMessageView: FunctionComponent<{
  chainId: string;
  msg: object | string;
  isSecretWasm?: boolean;
}> = observer(({ chainId, msg, isSecretWasm }) => {
  const { accountStore } = useStore();
  const intl = useIntl();
  const style = useStyle();

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
  const { colors } = useTheme();
  return (
    <Box>
      {isOpen ? (
        <React.Fragment>
          <OWText
            style={StyleSheet.flatten([
              style.flatten(["body3"]),
              {
                width: 240,
                margin: 0,
                marginBottom: 8,
                color: colors["neutral-text-body"],
              },
            ])}
          >
            {isOpen ? detailsMsg : ""}
          </OWText>
          {warningMsg ? <View>{warningMsg}</View> : null}
        </React.Fragment>
      ) : null}
      <XAxis>
        <OWButton
          fullWidth={false}
          size="small"
          type="secondary"
          label={
            isOpen
              ? intl.formatMessage({
                  id: "page.sign.components.messages.wasm-message-view.close-button",
                })
              : intl.formatMessage({
                  id: "page.sign.components.messages.wasm-message-view.details-button",
                })
          }
          onPress={() => {
            toggleOpen();
          }}
        />
      </XAxis>
    </Box>
  );
});
