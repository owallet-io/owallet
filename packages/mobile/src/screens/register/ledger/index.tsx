import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { RegisterConfig } from "@owallet/hooks";

import { Controller, useForm } from "react-hook-form";
import { TextInput } from "../../../components/input";
import {
  Platform,
  PermissionsAndroid,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { useStore } from "../../../stores";
import { useBIP44Option } from "../bip44";
import { checkRouter, goBack, navigate, resetTo } from "../../../router/root";
import { metrics } from "../../../themes";
import OWButton from "../../../components/button/OWButton";
import OWIcon from "../../../components/ow-icon/ow-icon";
import { SCREENS } from "@src/common/constants";
import { KeyRingStatus } from "@owallet/background";
import OWText from "@src/components/text/ow-text";

import { tracking } from "@src/utils/tracking";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewLedgerScreen: FunctionComponent = observer((props) => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const { colors } = useTheme();
  const styles = useStyles();

  const { analyticsStore, chainStore, keyRingStore } = useStore();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option(chainStore.current.coinType ?? 118);
  const [mode] = useState(registerConfig.mode);

  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);
  const [statusPass, setStatusPass] = useState(false);
  const [statusConfirmPass, setStatusConfirmPass] = useState(false);
  useEffect(() => {
    tracking(`Connect Ledger Screen`);
    return () => {};
  }, []);

  const submit = handleSubmit(async () => {
    setIsCreating(true);

    try {
      // Re-create ledger when change network
      await registerConfig.createLedger(
        getValues("name"),
        getValues("password"),
        {
          ...bip44Option.bip44HDPath,
          coinType:
            bip44Option.bip44HDPath?.coinType ?? chainStore.current.coinType,
        }
      );

      if (keyRingStore.status !== KeyRingStatus.UNLOCKED) {
        return false;
      }
      if (checkRouter(route?.name, "RegisterNewLedgerMain")) {
        navigate(SCREENS.RegisterDone, {
          password: getValues("password"),
          walletName: getValues("name"),
        });
      } else {
        resetTo(SCREENS.RegisterDone, {
          password: getValues("password"),
          walletName: getValues("name"),
        });
      }
    } catch (e) {
      // Definitely, the error can be thrown when the ledger connection failed
      console.log(e);
      setIsCreating(false);
    }
  });
  const renderWalletName = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label=""
        topInInputContainer={
          <View style={{ paddingBottom: 4 }}>
            <OWText>Wallet Name</OWText>
          </View>
        }
        returnKeyType="next"
        onSubmitEditing={() => {
          if (mode === "add") {
            submit();
          }
          if (mode === "create") {
            setFocus("password");
          }
        }}
        inputStyle={styles.input}
        style={styles.textInput}
        inputLeft={
          <OWIcon
            size={22}
            name="wallet-outline"
            color={colors["primary-surface-default"]}
          />
        }
        error={errors.name?.message}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        ref={ref}
      />
    );
  };

  const validatePass = (value: string) => {
    if (value.length < 6) {
      return "Password must be longer than 6 characters";
    }
  };
  const renderPass = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label=""
        onSubmitEditing={() => {
          setFocus("confirmPassword");
        }}
        topInInputContainer={
          <View style={{ paddingBottom: 4 }}>
            <OWText>Passcode</OWText>
          </View>
        }
        returnKeyType="next"
        inputStyle={styles.input}
        style={styles.textInput}
        inputRight={
          <OWButton
            style={styles.padIcon}
            type="link"
            onPress={() => setStatusPass(!statusPass)}
            icon={
              <OWIcon
                name={!statusPass ? "eye" : "eye-slash"}
                color={colors["primary-surface-default"]}
                size={22}
              />
            }
          />
        }
        placeholder={"Enter your passcode"}
        secureTextEntry={!statusPass}
        error={errors.password?.message}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        ref={ref}
      />
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        if (
          granted["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          // alert('ok');
        } else {
          // alert('fail');
        }
      } catch (error) {
        console.log("error: ", error);
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const validateConfirmPass = (value: string) => {
    if (value.length < 6) {
      return "Password must be longer than 6 characters";
    }

    if (getValues("password") !== value) {
      return "Password doesn't match";
    }
  };
  const onGoBack = () => {
    if (checkRouter(route?.name, SCREENS.RegisterNewLedgerMain)) {
      goBack();
    } else {
      navigate(SCREENS.RegisterIntro, {});
    }
  };

  const renderConfirmPass = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label=""
        returnKeyType="done"
        topInInputContainer={
          <View style={{ paddingBottom: 4 }}>
            <OWText>Confirn Passcode</OWText>
          </View>
        }
        placeholder={"Enter your confirm passcode"}
        inputStyle={styles.input}
        style={styles.textInput}
        inputRight={
          <OWButton
            style={styles.padIcon}
            type="link"
            onPress={() => setStatusConfirmPass(!statusConfirmPass)}
            icon={
              <OWIcon
                name={!statusConfirmPass ? "eye" : "eye-slash"}
                color={colors["primary-surface-default"]}
                size={22}
              />
            }
          />
        }
        secureTextEntry={!statusConfirmPass}
        onSubmitEditing={() => {
          submit();
        }}
        error={errors.confirmPassword?.message}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        ref={ref}
      />
    );
  };
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onGoBack} style={styles.goBack}>
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>
        <View style={[styles.aic, styles.title]}>
          <OWText variant="heading" style={{ textAlign: "center" }} typo="bold">
            Import Ledger Nano X
          </OWText>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32,
            }}
          />
          <Controller
            control={control}
            rules={{
              required: "Wallet name is required",
            }}
            render={renderWalletName}
            name="name"
            defaultValue={`OWallet-${
              Math.floor(Math.random() * (100 - 1)) + 1
            }`}
          />
          {mode === "create" ? (
            <React.Fragment>
              <Controller
                control={control}
                rules={{
                  required: "Password is required",
                  validate: validatePass,
                }}
                render={renderPass}
                name="password"
                defaultValue=""
              />
              <Controller
                control={control}
                rules={{
                  required: "Confirm password is required",
                  validate: validateConfirmPass,
                }}
                render={renderConfirmPass}
                name="confirmPassword"
                defaultValue=""
              />
            </React.Fragment>
          ) : null}
        </View>
      </View>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32,
            }}
            label={mode === "add" ? "Import" : " Next"}
            loading={isCreating}
            disabled={isCreating}
            onPress={submit}
          />
        </View>
      </View>
    </View>
  );
});

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    padIcon: {
      width: 22,
      height: 22,
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
    goBack: {
      backgroundColor: colors["neutral-surface-action3"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 16,
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    input: {
      width: metrics.screenWidth - 32,
      borderColor: colors["neutral-border-strong"],
    },
    textInput: { fontWeight: "600", paddingLeft: 4, fontSize: 15 },
  });
};
