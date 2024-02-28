import { ExportKeyRingData } from "@owallet/background";
import { BIP44HDPath } from "@owallet/types";
import { NewMnemonicConfig } from "./screens/register/mnemonic";
import {
  AddressBookConfig,
  AddressBookData,
  IMemoConfig,
  IRecipientConfig,
  RegisterConfig,
} from "@owallet/hooks";

import { createSmartNavigatorProvider, SmartNavigator } from "./hooks";

const { SmartNavigatorProvider, useSmartNavigation } =
  createSmartNavigatorProvider(
    new SmartNavigator({
      "Register.Intro": {
        upperScreenName: "Register",
      },
      NewUser: {
        upperScreenName: "Register.NewUser",
      },
      "Register.NewUser": {
        upperScreenName: "Register",
      },
      "Register.NotNewUser": {
        upperScreenName: "Register",
      },
      "Register.NewMnemonic": {
        upperScreenName: "Register",
      },
      "Register.NewPincode": {
        upperScreenName: "Register",
      },
      "Register.VerifyMnemonic": {
        upperScreenName: "Register",
      },
      "Register.RecoverMnemonic": {
        upperScreenName: "Register",
      },
      "Register.RecoverPhrase": {
        upperScreenName: "Register",
      },
      "Register.NewLedger": {
        upperScreenName: "Register",
      },
      "Register.ImportFromExtension.Intro": {
        upperScreenName: "Register",
      },
      "Register.ImportFromExtension": {
        upperScreenName: "Register",
      },
      "Register.ImportFromExtension.SetPassword": {
        upperScreenName: "Register",
      },
      "Register.End": {
        upperScreenName: "Register",
      },
      Home: {
        upperScreenName: "Main",
      },
      Send: {
        upperScreenName: "Others",
      },
      SendTron: {
        upperScreenName: "Others",
      },
      SendOasis: {
        upperScreenName: "Others",
      },
      TransferNFT: {
        upperScreenName: "Others",
      },
      Tokens: {
        upperScreenName: "Main",
      },
      "Tokens.Detail": {
        upperScreenName: "Main",
      },
      Nfts: {
        upperScreenName: "Main",
      },
      "Nfts.Detail": {
        upperScreenName: "Main",
      },
      Camera: {
        upperScreenName: "Others",
      },
      "Staking.Dashboard": {
        upperScreenName: "Others",
      },
      "Validator.Details": {
        upperScreenName: "Invest",
      },
      "Validator.List": {
        upperScreenName: "Invest",
      },
      Delegate: {
        upperScreenName: "Invest",
      },
      "Delegate.Detail": {
        upperScreenName: "Invest",
      },
      Undelegate: {
        upperScreenName: "Invest",
      },
      Redelegate: {
        upperScreenName: "Invest",
      },
      Governance: {
        upperScreenName: "Others",
      },
      "Governance.Details": {
        upperScreenName: "Others",
      },
      Setting: {
        upperScreenName: "Settings",
      },
      Invest: {
        upperScreenName: "Invest",
      },
      SettingSelectAccount: {
        upperScreenName: "Settings",
      },

      "Setting.ViewPrivateData": {
        upperScreenName: "Settings",
      },
      "Setting.BackupMnemonic": {
        upperScreenName: "Settings",
      },
      "Setting.Version": {
        upperScreenName: "Settings",
      },
      AddressBook: {
        upperScreenName: "AddressBooks",
      },
      AddAddressBook: {
        upperScreenName: "AddressBooks",
      },
      Result: {
        upperScreenName: "Others",
      },
      TxPendingResult: {
        upperScreenName: "Others",
      },
      TxSuccessResult: {
        upperScreenName: "Others",
      },
      TxFailedResult: {
        upperScreenName: "Others",
      },
      Transactions: {
        upperScreenName: "Others",
      },
      Dashboard: {
        upperScreenName: "Others",
      },
      "Transactions.Detail": {
        upperScreenName: "Others",
      },
      "Network.select": {
        upperScreenName: "Others",
      },
      "Network.token": {
        upperScreenName: "Others",
      },
      "Web.Intro": {
        upperScreenName: "Web",
      },
      "Web.dApp": {
        upperScreenName: "Web",
      },
      TransferTokensScreen: {
        upperScreenName: "SendNavigation",
      },
      UniversalSwapScreen: {
        upperScreenName: "SendNavigation",
      },
    }).withParams<{
      "Register.NewMnemonic": {
        registerConfig: RegisterConfig;
      };
      "Register.NewPincode": {
        registerConfig: RegisterConfig;
        words?: string;
        walletName?: string;
      };
      "Register.VerifyMnemonic": {
        registerConfig: RegisterConfig;
        newMnemonicConfig: NewMnemonicConfig;
        bip44HDPath: BIP44HDPath;
      };
      "Register.RecoverMnemonic": {
        registerConfig: RegisterConfig;
      };
      "Register.RecoverPhrase": {
        registerConfig: RegisterConfig;
      };
      "Register.Register.": {
        registerConfig: RegisterConfig;
      };
      "Register.NewLedger": {
        registerConfig: RegisterConfig;
      };
      "Register.ImportFromExtension.Intro": {
        registerConfig: RegisterConfig;
      };
      "Register.ImportFromExtension": {
        registerConfig: RegisterConfig;
      };
      "Register.ImportFromExtension.SetPassword": {
        registerConfig: RegisterConfig;
        exportKeyRingDatas: ExportKeyRingData[];
        addressBooks: { [chainId: string]: AddressBookData[] | undefined };
      };
      "Register.End": {
        password?: string;
      };
      Send: {
        chainId?: string;
        coinGeckoId?: string;
        currency?: string;
        recipient?: string;
        contractAddress?: string;
      };
      "Validator.Details": {
        validatorAddress: string;
        apr: number;
      };
      "Validator.List": {
        validatorSelector?: (validatorAddress: string) => void;
      };
      Delegate: {
        validatorAddress: string;
      };
      Undelegate: {
        validatorAddress: string;
      };
      Redelegate: {
        validatorAddress: string;
      };
      "Governance.Details": {
        proposalId: string;
      };
      "Setting.ViewPrivateData": {
        privateData: string;
        privateDataType: string;
      };
      "Setting.BackupMnemonic": {
        privateData: string;
        privateDataType: string;
      };
      AddressBook: {
        recipientConfig?: IRecipientConfig;
        memoConfig?: IMemoConfig;
      };
      AddAddressBook: {
        chainId?: string;
        addressBookConfig?: AddressBookConfig;
        recipient?: Object;
      };
      TxPendingResult: {
        chainId?: string;
        txHash: string;
        tronWeb?: any;
      };
      TxSuccessResult: {
        chainId?: string;
        txHash?: string;
      };
      TxFailedResult: {
        chainId?: string;
        txHash: string;
      };
    }>()
  );

export { SmartNavigatorProvider, useSmartNavigation };
