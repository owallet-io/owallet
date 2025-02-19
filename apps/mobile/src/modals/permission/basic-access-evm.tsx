import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../styles";
// import {BaseModalHeader} from './modal';
import { FormattedMessage, useIntl } from "react-intl";
import { Image, Text } from "react-native";
import { PermissionData } from "@owallet/background";
import { useStore } from "../../stores";
import { registerModal } from "@src/modals/base";
import { Box } from "@components/box";
import { Gutter } from "@components/gutter";
import { XAxis } from "@components/axis";
import { OWButton } from "@components/button";
import images from "@assets/images";
import OWText from "@components/text/ow-text";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import { useTheme } from "@src/themes/theme-provider";
import { registerCardModal } from "@src/modals/card/card-modal-base";

export const BasicAccessEVMModal = registerCardModal(
  observer<{
    isOpen: boolean;
    // close: (isOpen: boolean) => void;

    data: {
      ids: string[];
    } & PermissionData;
  }>(({ data }) => {
    const intl = useIntl();
    const style = useStyle();

    const { permissionStore } = useStore();

    const host = useMemo(() => {
      return data.origins
        .map((origin) => {
          return new URL(origin).host;
        })
        .join(", ");
    }, [data]);

    const chainIds = useMemo(() => {
      return data.chainIds.join(", ");
    }, [data]);
    const { colors } = useTheme();
    return (
      <WrapViewModal
        title={intl.formatMessage({
          id: "page.permission.requesting-connection-title",
        })}
      >
        <Box paddingX={12} paddingBottom={12}>
          <Gutter size={16} />

          <Box paddingX={22} alignX="center">
            <Image
              style={{ width: 74, height: 74 }}
              source={images.logo_owallet}
              // contentFit="contain"
            />

            <Gutter size={16} />

            <OWText
              style={{
                ...style.flatten(["body2", "text-center"]),
                color: colors["neutral-text-body"],
              }}
            >
              <FormattedMessage
                id="wallet-connect.information-text"
                values={{
                  appName: host,
                  chainIds,
                }}
              />{" "}
            </OWText>
          </Box>

          <Gutter size={16} />

          <XAxis>
            <OWButton
              // fullWidth={false}
              size="large"
              label={intl.formatMessage({ id: "button.reject" })}
              type="secondary"
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
              // fullWidth={false}
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
      </WrapViewModal>
    );
  })
);
