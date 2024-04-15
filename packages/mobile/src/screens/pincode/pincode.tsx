import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { observer } from "mobx-react-lite";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { RegisterConfig } from "@owallet/hooks";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import OWText from "@src/components/text/ow-text";
import { metrics } from "@src/themes";
import NumericPad from "react-native-numeric-pad";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { useSmartNavigation } from "@src/navigation.provider";
import { Controller, useForm } from "react-hook-form";
import { checkRouter } from "@src/router/root";
import { TextInput } from "@src/components/input";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { showToast } from "@src/utils/helper";
import { useStore } from "@src/stores";
import { LoadingWalletScreen } from "../register/loading-wallet";
import { Pincode } from "@src/components/pincode/pincode-component";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const PincodeScreen: FunctionComponent = observer((props) => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          onVerifyPincode: Function;
          needConfirmation: boolean;
          label?: string;
        }
      >,
      string
    >
  >();
  const { appInitStore } = useStore();

  const { onVerifyPincode, needConfirmation, label } = route?.params;

  const { colors } = useTheme();
  const smartNavigation = useSmartNavigation();

  const [statusPass, setStatusPass] = useState(false);
  const [isNumericPad, setNumericPad] = useState(true);
  const [confirmCode, setConfirmCode] = useState(null);
  const [prevPad, setPrevPad] = useState(null);
  const [counter, setCounter] = useState(0);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const navigation = useNavigation();

  const [isCreating, setIsCreating] = useState(false);

  const {
    control,
    formState: { errors },
  } = useForm<FormData>();

  const onGoBack = () => {
    if (checkRouter(route?.name, "RegisterMain")) {
      smartNavigation.goBack();
    } else {
      smartNavigation.navigateSmart("Register.Intro", {});
    }
  };

  const showPass = () => setStatusPass(!statusPass);

  const pinRef = useRef(null);
  const numpadRef = useRef(null);

  const [code, setCode] = useState("");

  const handleSetPassword = () => {
    setConfirmCode(code);
    setCode("");
    numpadRef?.current?.clearAll();
    setPrevPad("numeric");
    appInitStore.updateKeyboardType("numeric");
  };

  const handleContinue = () => {
    setPrevPad("numeric");
    appInitStore.updateKeyboardType("numeric");
    if (password.length >= 6) {
      if (!confirmCode) {
        setConfirmCode(password);
        setPassword("");
      } else {
        handleCheckConfirm(password);
      }
    } else {
      showToast({
        message: "*The password must be at least 6 characters",
        type: "danger",
      });
    }
  };

  const onSwitchPad = (type) => {
    setCode("");
    if (type === "numeric") {
      setNumericPad(true);
    } else {
      setNumericPad(false);
    }
  };

  const onHandeCreateMnemonic = () => {
    numpadRef?.current?.clearAll();
  };

  const onHandleConfirmPincodeError = () => {
    showToast({
      message: `${counter} times false. Please try again`,
      type: "danger",
    });
    setConfirmCode(null);
    pinRef?.current?.shake().then(() => setCode(""));
    numpadRef?.current?.clearAll();
    setCounter(0);
    setPassword("");
  };

  const onHandleResetPincode = () => {
    showToast({
      message: `Password doesn't match`,
      type: "danger",
    });
    pinRef?.current?.shake().then(() => setCode(""));
    setPassword("");
    numpadRef?.current?.clearAll();
  };

  const handleCheckConfirm = (confirmPass) => {
    if (confirmCode === confirmPass && counter < 3) {
      onHandeCreateMnemonic();
    } else {
      setCounter(counter + 1);
      if (counter > 3) {
        onHandleConfirmPincodeError();
      } else {
        onHandleResetPincode();
      }
    }
  };

  const handleConfirm = () => {
    if (prevPad === "numeric") {
      handleCheckConfirm(code);
    } else {
      handleCheckConfirm(password);
    }
  };

  useEffect(() => {
    if (code.length >= 6) {
      if (confirmCode) {
        handleConfirm();
      } else {
        handleSetPassword();
      }
    }
  }, [code]);

  const renderPassword = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        accessibilityLabel="password"
        returnKeyType="done"
        secureTextEntry={statusPass}
        value={password}
        error={isFailed ? "Invalid password" : undefined}
        onChangeText={(txt) => {
          setPassword(txt);
        }}
        inputContainerStyle={{
          width: metrics.screenWidth - 32,
          borderWidth: 2,
          borderColor: colors["primary-surface-default"],
          borderRadius: 8,
          minHeight: 56,
          alignItems: "center",
          justifyContent: "center",
        }}
        placeholder="Enter your passcode"
        inputRight={
          <OWButtonIcon
            style={styles.padIcon}
            onPress={showPass}
            name={statusPass ? "eye" : "eye-slash"}
            colorIcon={colors["neutral-text-title"]}
            sizeIcon={22}
          />
        }
      />
    );
  };
  const validatePassword = (value: string) => {
    if (value.length < 6) {
      return "Password must be longer than 6 characters";
    }
  };

  const styles = useStyles();

  return (
    <>
      <Pincode />
    </>
  );
});

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    padIcon: {
      paddingLeft: 10,
      width: "auto",
    },
    icon: {
      width: 22,
      height: 22,
      tintColor: colors["icon-primary-surface-default-gray"],
    },

    title: {
      fontSize: 24,
      lineHeight: 34,
      fontWeight: "700",
      color: colors["text-title"],
    },
    headerContainer: {
      height: 72,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    container: {
      paddingTop: metrics.screenHeight / 14,
      justifyContent: "space-between",
      height: "100%",
      backgroundColor: colors["neutral-surface-card"],
    },
    signIn: {
      width: "100%",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      padding: 16,
    },
    aic: {
      alignItems: "center",
      paddingBottom: 20,
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonTextStyle: {
      fontSize: 22,
      color: colors["neutral-text-title"],
      fontFamily: "SpaceGrotesk-SemiBold",
    },
    buttonItemStyle: {
      backgroundColor: colors["neutral-surface-action3"],
      width: 110,
      height: 80,
      borderRadius: 8,
    },
    switch: {
      backgroundColor: colors["neutral-surface-action3"],
      padding: 4,
      borderRadius: 999,
      marginTop: 32,
    },
    switchText: {
      paddingHorizontal: 24,
      paddingVertical: 6,
    },
    switchTextActive: {
      backgroundColor: colors["neutral-surface-toggle-active"],
      borderRadius: 999,
    },
    goBack: {
      backgroundColor: colors["neutral-surface-action3"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 16,
    },
  });
};
