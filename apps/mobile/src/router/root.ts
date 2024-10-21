import * as React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// eslint-disable-next-line import/no-extraneous-dependencies
import { StackActions } from "@react-navigation/routers";
import { SCREENS } from "@src/common/constants";
import { HeaderOptions } from "@react-navigation/elements";
import { StackNavigationOptions } from "@react-navigation/stack";
import { PlainObject } from "@owallet/background";

interface Params {
  params?: any;
  screen?: string | "Other";
}
export const navigationRef: any = React.createRef();

export const NavigationAction = navigationRef.current;

export const setOptions = (options: StackNavigationOptions) => {
  // Ensure `NavigationAction` exists before calling `setOptions`
  if (NavigationAction) {
    NavigationAction.setOptions(options);
  }
};
export function navigate(name, params?: any) {
  if (
    !Object.values(SCREENS).includes(name) &&
    Object.values(SCREENS.TABS).includes(name)
  ) {
    return navigate(SCREENS.STACK.MainTab, { screen: name });
  }
  const pushAction = StackActions.push(name, params);
  const { routes = [] } = navigationRef.current?.getRootState?.() || {};
  const isExist =
    routes.findIndex((item) => {
      if (
        item.name === name
        //   &&
        // JSON.stringify(item.params) === JSON.stringify(params)
      ) {
        return true;
      }
      return false;
    }) >= 0;
  if (isExist || params?.forceNavigate) {
    navigationRef.current?.navigate?.(name, params);
    return;
  }
  navigationRef.current?.dispatch?.(pushAction);
}

export function resetTo(name: string, params?: any) {
  navigationRef.current?.reset({
    index: 0,
    routes: [
      {
        name: name,
        params,
      },
    ],
  });
}

export function getRouteName() {
  return navigationRef.current.getCurrentRoute().name;
}

export function goBack(fallback?: any) {
  if (navigationRef.current?.canGoBack?.()) {
    navigationRef.current?.goBack?.();
  } else {
    fallback?.();
  }
}

export const popTo = (screenName) => {
  const { routes = [] } = navigationRef.current?.getRootState?.() || {};

  const index = routes.reverse().findIndex((item) => item.name === screenName);
  if (navigationRef.current?.canGoBack?.() && index > 0) {
    navigationRef.current?.dispatch(StackActions.pop(index));
  }
};

export const popToTop = () => {
  const { routes = [] } = navigationRef.current?.getRootState?.() || {};

  if (routes?.length > 1) {
    navigationRef.current.dispatch(StackActions.popToTop());
    return;
  }
  goBack();
};

export const checkRouter = (uri, route) => {
  return uri == route;
};

function BottomTabBar() {
  // const bottomTabBarHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return bottom + 100;
}

export const checkRouterPaddingBottomBar = (uri, route) => {
  if (BottomTabBar()) return uri == route ? BottomTabBar() : 0;
  return 0;
};
type DefaultRegisterParams = {
  hideBackButton?: boolean;
};

export type RootStackParamList = {
  Home?: { showAddressChainId?: string };
  "Home.Main": undefined;
  "Home.Stake.Dashboard": { chainId: string };
  Camera?: {
    importFromExtensionOnly?: boolean;
  };

  Register: undefined;
  "Register.Intro": undefined;

  "Register.VerifyMnemonic": {
    mnemonic: string;
    stepPrevious: number;
    stepTotal: number;
  } & DefaultRegisterParams;
  "Register.Intro.ExistingUser"?: DefaultRegisterParams;
  "Register.BackupPrivateKey": {
    name: string;
    password: string;
    privateKey: {
      hexValue: string;
      meta: PlainObject;
    };
    stepPrevious: number;
    stepTotal: number;
  };
  "Register.RecoverMnemonic"?: DefaultRegisterParams;
  "Register.ConnectLedger": {
    name: string;
    password: string;
    stepPrevious: number;
    stepTotal: number;
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    };
    app: "Ethereum";
    // append mode일 경우 위의 name, password는 안쓰인다. 대충 빈 문자열 넣으면 된다.
    appendModeInfo?: {
      vaultId: string;
      afterEnableChains: string[];
    };
  } & DefaultRegisterParams;
  "Register.GoogleSignIn": {};
  "Register.AppleSignIn": {};
  "Register.ImportFromExtension": undefined;

  "Register.FinalizeKey": {
    name: string;
    password: string;
    stepPrevious: number;
    stepTotal: number;
    mnemonic?: {
      value: string;
      // If mnemonic is not recovered, but newly generated,
      // it should be set to true.
      isFresh?: boolean;
      bip44Path: {
        account: number;
        change: number;
        addressIndex: number;
      };
    };
    ledger?: {
      pubKey: Uint8Array;
      app: string;
      bip44Path: {
        account: number;
        change: number;
        addressIndex: number;
      };
    };
  };
  "Register.EnableChain": {
    vaultId: string;
    candidateAddresses?: {
      chainId: string;
      bech32Addresses: {
        coinType: number;
        address: string;
      }[];
    }[];
    isFresh?: boolean;
    skipWelcome?: boolean;
    initialSearchValue?: string;
    fallbackEthereumLedgerApp?: boolean;
    stepPrevious?: number;
    stepTotal?: number;
    password?: string;
  };
  "Register.SelectDerivationPath": {
    chainIds: string[];
    vaultId: string;
    totalCount: number;
    password?: string;
    skipWelcome?: boolean;
  };
  "Register.Welcome": {
    password?: string;
  };
  Send: {
    chainId: string;
    coinMinimalDenom: string;
    recipientAddress?: string;
  };
  "Send.SelectAsset": {
    isIBCSwap?: boolean;
    chainId?: string;
    coinMinimalDenom?: string;
    outChainId?: string;
    outCoinMinimalDenom?: string;
  };
  "Setting.Intro": undefined;

  "Setting.General": undefined;
  "Setting.General.Intro": undefined;
  "Setting.General.Lang": undefined;
  "Setting.General.Currency": undefined;
  "Setting.General.ContactList": { chainId?: string } | undefined;
  "Setting.General.ContactAdd": { chainId: string; editIndex?: number };
  "Setting.General.WC": undefined;
  "Setting.General.ManageNonActiveChains": undefined;
  "Setting.General.ManageChainVisibility": undefined;
  "Setting.General.Version": undefined;

  "Setting.SecurityAndPrivacy": undefined;
  "Setting.SecurityAndPrivacy.Intro": undefined;
  "Setting.SecurityAndPrivacy.Permission": undefined;
  "Setting.SecurityAndPrivacy.ManageWalletConnect": undefined;
  "Setting.SecurityAndPrivacy.ChangePassword": undefined;
  "Setting.SecurityAndPrivacy.BioAuthentication": undefined;

  "Setting.ManageTokenList": undefined;
  "Setting.ManageTokenList.Add":
    | { chainId?: string; contractAddress?: string }
    | undefined;

  Unlock?: {
    disableAutoBioAuth?: boolean;
  };
  Migration: { password: string };
  "Migration.Welcome": undefined;
  "Migration.Backup.AccountList": {
    password: string;
  };
  "Migration.Backup.ShowSensitive": {
    index: string;
    password: string;
    type?: "mnemonic" | "privateKey" | "ledger" | "keystone";
  };

  SelectWallet: undefined;
  "SelectWallet.Intro": undefined;
  "SelectWallet.Delete": { id: string };
  "SelectWallet.ChangeName": { id: string };
  "SelectWallet.ViewRecoveryPhrase": { id: string };
  Web: { url: string; isExternal: true };

  TxPending: {
    chainId: string;
    txHash: string;
    isEvmTx?: boolean;
  };
  TxSuccess: {
    chainId: string;
    txHash: string;
    isEvmTx?: boolean;
  };
  TxFail: {
    chainId: string;
    txHash: string;
    isEvmTx?: boolean;
  };
  Swap: {
    chainId?: string;
    coinMinimalDenom?: string;
    outChainId?: string;
    outCoinMinimalDenom?: string;
    initialAmountFraction?: string;
    initialAmount?: string;
    initialRecipient?: string;
    initialMemo?: string;
    initialFeeCurrency?: string;
    initialFeeType?: string;
    initialGasAmount?: string;
    initialGasAdjustment?: string;
    tempSwitchAmount?: string;
  };
  "Swap.SelectAsset": {
    excludeKey: string;
    chainId?: string;
    coinMinimalDenom?: string;
    outChainId?: string;
    outCoinMinimalDenom?: string;
    initialAmountFraction?: string;
    initialAmount?: string;
    initialRecipient?: string;
    initialMemo?: string;
    initialFeeCurrency?: string;
    initialFeeType?: string;
    initialGasAmount?: string;
    initialGasAdjustment?: string;
    tempSwitchAmount?: string;
  };
  Activities: undefined;
  TokenDetail: {
    chainId: string;
    coinMinimalDenom: string;
  };
};
