import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../components/box";
import LottieView from "lottie-react-native";
import { useStyle } from "../../../styles";
import { Text } from "react-native";
import { Gutter } from "../../../components/gutter";
import { XAxis } from "../../../components/axis";
import { Toggle } from "../../../components/toggle";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
// import {RootStackParamList, StackNavProp} from '../../../navigation';
import { ScrollViewRegisterContainer } from "../components/scroll-view-register-container";
import { FormattedMessage, useIntl } from "react-intl";
import { resetTo, RootStackParamList } from "@src/router/root";
import { SCREENS } from "@common/constants";

export const WelcomeScreen: FunctionComponent = observer(() => {
  const { keychainStore } = useStore();
  const style = useStyle();
  const intl = useIntl();
  const route = useRoute<RouteProp<RootStackParamList, "Register.Welcome">>();
  const { password } = route.params;
  const navigation = useNavigation();

  const [isBiometricOn, setIsBiometricOn] = useState(false);

  return (
    <ScrollViewRegisterContainer
      forceEnableTopSafeArea={true}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
      }}
    >
      <Box alignX="center">
        <LottieView
          source={require("@assets/animations/loading.json")}
          style={{
            width: 300,
            height: 300,
            borderRadius: 28,
            overflow: "hidden",
          }}
          autoPlay
          loop
        />
      </Box>

      <Gutter size={30} />

      <Box alignX="center">
        <Text style={style.flatten(["mobile-h1", "color-text-high"])}>
          <FormattedMessage id="pages.register.pages.welcome.title" />
        </Text>
      </Box>

      <Gutter size={20} />

      <Box paddingX={50}>
        <Text
          style={style.flatten([
            "body1",
            "color-text-low",
            "padding-10",
            "text-center",
          ])}
        >
          <FormattedMessage id="pages.register.pages.welcome.sub-title" />
        </Text>
      </Box>

      <Gutter size={30} />

      {password && keychainStore.isBiometrySupported ? (
        <Box style={style.flatten(["padding-x-50"])}>
          <XAxis alignY="center">
            <Text
              style={style.flatten([
                "subtitle1",
                "color-text-middle",
                "flex-1",
              ])}
            >
              <FormattedMessage id="pages.register.pages.welcome.enable-bio-auth-toggle" />
            </Text>

            <Toggle on={isBiometricOn} onChange={setIsBiometricOn} />
          </XAxis>
          <Gutter size={20} />
        </Box>
      ) : null}

      <Gutter size={30} />

      <Box style={style.flatten(["padding-x-50"])}>
        <Button
          text={intl.formatMessage({ id: "button.done" })}
          size="large"
          onPress={async () => {
            if (password && isBiometricOn) {
              await keychainStore.turnOnBiometry(password);
            }
            // navigation.reset({routes: [{name: 'Home'}]});
            resetTo(SCREENS.STACK.MainTab);
          }}
        />
      </Box>

      <Gutter size={20} />
    </ScrollViewRegisterContainer>
  );
});
