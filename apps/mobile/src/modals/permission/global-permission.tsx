import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
// import {BaseModalHeader} from './modal';
import { useIntl } from "react-intl";
import { Image, Text } from "react-native";
import { registerModal } from "@src/modals/base";
import { Box } from "@components/box";
import OWText from "@components/text/ow-text";
import { Gutter } from "@components/gutter";
import { GuideBox } from "@components/guide-box";
import { XAxis } from "@components/axis";
import images from "@assets/images";
import { OWButton } from "@components/button";
// import {XAxis} from '../axis';
// import {Button} from '../button';
// import {Gutter} from '../gutter';
// import {Box} from '../box';
// import {registerCardModal} from './card';
// import * as ExpoImage from 'expo-image';
// import {GuideBox} from '../guide-box';

export const GlobalPermissionModal = registerModal(
  observer<{
    isOpen: boolean;
    // setIsOpen: (isOpen: boolean) => void;
  }>(() => {
    const intl = useIntl();
    const style = useStyle();
    const { permissionStore } = useStore();

    const waitingPermission = permissionStore.waitingGlobalPermissionData;

    const host = useMemo(() => {
      if (waitingPermission) {
        return waitingPermission.data.origins
          .map((origin) => {
            return new URL(origin).host;
          })
          .join(", ");
      } else {
        return "";
      }
    }, [waitingPermission]);

    return (
      <Box paddingX={12} paddingBottom={12} alignX="center">
        {/*<BaseModalHeader*/}
        {/*  title={intl.formatMessage({*/}
        {/*    id: 'page.permission.requesting-connection-title',*/}
        {/*  })}*/}
        {/*/>*/}
        <OWText>
          {intl.formatMessage({
            id: "page.permission.requesting-connection-title",
          })}
        </OWText>
        <Gutter size={16} />

        <Image
          style={{ width: 74, height: 74 }}
          source={images.carbon_notification}
          // contentFit="contain"
        />

        <Gutter size={16} />

        <Text style={style.flatten(["body2", "color-text-middle"])}>
          {host}
        </Text>

        <Gutter size={16} />

        <Box width="100%">
          <GuideBox
            title={intl.formatMessage({ id: "page.permission.guide-title" })}
            paragraph={intl.formatMessage({
              id: "page.permission.guide-paragraph",
            })}
          />
        </Box>

        <Gutter size={16} />

        <XAxis>
          <OWButton
            fullWidth={false}
            size="large"
            label="Reject"
            // color="secondary"
            style={{ flex: 1, width: "100%" }}
            onPress={async () => {
              if (waitingPermission) {
                await permissionStore.rejectGlobalPermissionAll();
              }
            }}
          />

          <Gutter size={16} />

          <OWButton
            size="large"
            label="Approve"
            style={{ flex: 1, width: "100%" }}
            onPress={async () => {
              if (waitingPermission) {
                await permissionStore.approveGlobalPermissionWithProceedNext(
                  waitingPermission.id,
                  () => {}
                );
              }
            }}
          />
        </XAxis>
      </Box>
    );
  })
);