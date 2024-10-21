import React, { useLayoutEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
// import {BaseModalHeader} from './modal';
import { FormattedMessage, useIntl } from "react-intl";
import { Image, Text } from "react-native";
// import {XAxis} from '../axis';
// import {Button} from '../button';
// import {Gutter} from '../gutter';
import { PermissionData } from "@owallet/background";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";
import OWText from "@components/text/ow-text";
import { Box } from "@components/box";
import { Gutter } from "@components/gutter";
import { XAxis } from "@components/axis";
import { OWButton } from "@components/button";
import { registerModal } from "@src/modals/base";
// import * as ExpoImage from 'expo-image';
// import {Box} from '../box';
// import {registerCardModal} from './card';

export const WalletConnectAccessModal = registerModal(
  observer<{
    data: {
      ids: string[];
    } & PermissionData;

    isOpen: boolean;
    // setIsOpen: (isOpen: boolean) => void;
  }>(({ data }) => {
    const intl = useIntl();
    const style = useStyle();
    const { permissionStore, walletConnectStore } = useStore();

    const [peerMeta, setPeerMeta] = useState<
      { name?: string; url?: string; icons?: string[] } | undefined
    >(undefined);

    useLayoutEffect(() => {
      if (data.origins.length !== 1) {
        throw new Error("Invalid origins");
      }

      walletConnectStore
        .getSessionMetadata(
          WCMessageRequester.getIdFromVirtualURL(data.origins[0])
        )
        .then((r) => setPeerMeta(r));
    }, [data.origins, walletConnectStore]);

    const appName = peerMeta?.name || peerMeta?.url || "unknown";
    const chainIds = useMemo(() => {
      return data.chainIds.join(", ");
    }, [data]);

    const logoUrl = useMemo(() => {
      if (peerMeta?.icons && peerMeta.icons.length > 0) {
        return peerMeta.icons[peerMeta.icons.length - 1];
      }
    }, [peerMeta?.icons]);

    return (
      <Box paddingX={12} paddingBottom={12}>
        <OWText size={16} weight={"700"}>
          {intl.formatMessage({
            id: "page.permission.requesting-connection-title",
          })}
        </OWText>
        <Gutter size={32} />

        <Box alignX="center">
          <Image
            style={{ width: 74, height: 75 }}
            source={logoUrl}
            contentFit="contain"
          />
        </Box>

        <Gutter size={16} />

        <Text
          style={style.flatten(["body2", "color-text-middle", "text-center"])}
        >
          <FormattedMessage
            id="wallet-connect.information-text"
            values={{
              appName,
              chainIds,
            }}
          />
        </Text>

        <Gutter size={16} />

        <XAxis>
          <OWButton
            size="large"
            fullWidth={false}
            label={intl.formatMessage({ id: "button.reject" })}
            // color="secondary"
            style={{ flex: 1, width: "100%" }}
            onPress={async () => {
              await permissionStore.rejectPermissionWithProceedNext(
                data.ids,
                () => {}
              );
            }}
          />

          <Gutter size={16} />

          <OWButton
            fullWidth={false}
            size="large"
            label={intl.formatMessage({ id: "button.approve" })}
            style={{ flex: 1, width: "100%" }}
            onPress={async () => {
              await permissionStore.approvePermissionWithProceedNext(
                data.ids,
                () => {}
              );
            }}
          />
        </XAxis>
      </Box>
    );
  })
);
