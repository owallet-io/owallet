import React, { FunctionComponent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Box } from "../box";
import { useStyle } from "../../styles";
import { Text } from "react-native";
import { Columns } from "../column";
import { XAxis, YAxis } from "../axis";
import { Gutter } from "../gutter";
// import {UserIcon} from '../icon/user';
import { Bech32Address } from "@owallet/cosmos";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import OWIcon from "@components/ow-icon/ow-icon";
import { useTheme } from "@src/themes/theme-provider";
import OWText from "@components/text/ow-text";
import { shortenAddress } from "@utils/helper";
// import OWIcon from "@components/ow-icon/ow-icon";

export const AddressItem: FunctionComponent<{
  timestamp?: number;
  name?: string;
  address: string;
  memo?: string;
  isShowMemo?: boolean;
  onClick?: () => void;

  // true면 border를 추가함.
  highlight?: boolean;
}> = ({
  timestamp,
  name,
  address,
  memo,
  isShowMemo,
  onClick,

  highlight,
}) => {
  const intl = useIntl();
  const style = useStyle();
  const { colors } = useTheme();
  return (
    <TouchableWithoutFeedback onPress={onClick}>
      <Box
        paddingX={16}
        paddingY={16}
        backgroundColor={colors["neutral-surface-action"]}
        borderRadius={6}
        // borderWidth={highlight ? 1 : undefined}
        // borderColor={highlight ? style.get("color-gray-400").color : undefined}
      >
        <Columns sum={1} alignY="center">
          <YAxis>
            {timestamp ? (
              <React.Fragment>
                <OWText style={style.flatten(["h5"])}>
                  <FormattedMessage
                    id="components.address-item.sent-on-date"
                    values={{
                      date: intl.formatDate(new Date(timestamp), {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      }),
                    }}
                  />
                </OWText>

                <Gutter size={4} />
              </React.Fragment>
            ) : null}

            {name ? (
              <React.Fragment>
                <OWText style={style.flatten(["h5"])}>{name}</OWText>

                <Gutter size={4} />
              </React.Fragment>
            ) : null}

            <XAxis alignY="center">
              <OWIcon
                name={"tdesignuser"}
                size={12}
                color={colors["neutral-icon-on-light"]}
              />
              <Gutter size={4} />
              <OWText
                style={{
                  ...style.flatten(["body2"]),
                  color: colors["neutral-text-body"],
                  flexWrap: "wrap",
                  paddingRight: 20,
                }}
              >
                {shortenAddress(address, 16)}
              </OWText>
            </XAxis>

            {isShowMemo ? (
              <XAxis alignY="center">
                {memo ? (
                  <Text
                    style={{
                      ...style.flatten(["body2"]),
                      color: colors["neutral-text-body"],
                    }}
                  >
                    {memo}
                  </Text>
                ) : (
                  <OWText
                    style={{
                      ...style.flatten(["body2"]),
                      color: colors["neutral-text-body"],
                    }}
                  >
                    <FormattedMessage id="components.address-item.empty-memo" />
                  </OWText>
                )}
              </XAxis>
            ) : null}
          </YAxis>
        </Columns>
      </Box>
    </TouchableWithoutFeedback>
  );
};
