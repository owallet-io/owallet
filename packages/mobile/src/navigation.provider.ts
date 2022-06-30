import { BIP44HDPath, ExportKeyRingData } from '@owallet/background'
import { NewMnemonicConfig } from './screens/register/mnemonic'
import {
  AddressBookConfig,
  AddressBookData,
  IMemoConfig,
  IRecipientConfig,
  RegisterConfig
} from '@owallet/hooks'

import { createSmartNavigatorProvider, SmartNavigator } from './hooks'

const { SmartNavigatorProvider, useSmartNavigation } =
  createSmartNavigatorProvider(
    new SmartNavigator({
      'Register.Intro': {
        upperScreenName: 'Register'
      },
      NewUser: {
        upperScreenName: 'Register.NewUser'
      },
      'Register.NewUser': {
        upperScreenName: 'Register'
      },
      'Register.NotNewUser': {
        upperScreenName: 'Register'
      },
      'Register.NewMnemonic': {
        upperScreenName: 'Register'
      },
      'Register.VerifyMnemonic': {
        upperScreenName: 'Register'
      },
      'Register.RecoverMnemonic': {
        upperScreenName: 'Register'
      },
      'Register.NewLedger': {
        upperScreenName: 'Register'
      },
      'Register.ImportFromExtension.Intro': {
        upperScreenName: 'Register'
      },
      'Register.ImportFromExtension': {
        upperScreenName: 'Register'
      },
      'Register.ImportFromExtension.SetPassword': {
        upperScreenName: 'Register'
      },
      'Register.End': {
        upperScreenName: 'Register'
      },
      Home: {
        upperScreenName: 'Main'
      },
      Send: {
        upperScreenName: 'Others'
      },
      Tokens: {
        upperScreenName: 'Main'
      },
      'Tokens.Detail': {
        upperScreenName: 'Main'
      },
      Nfts: {
        upperScreenName: 'Main'
      },
      'Nfts.Detail': {
        upperScreenName: 'Main'
      },
      Camera: {
        upperScreenName: 'Others'
      },
      'Staking.Dashboard': {
        upperScreenName: 'Others'
      },
      'Validator.Details': {
        upperScreenName: 'Invest'
      },
      'Validator.List': {
        upperScreenName: 'Invest'
      },
      Delegate: {
        upperScreenName: 'Invest'
      },
      Undelegate: {
        upperScreenName: 'Others'
      },
      Redelegate: {
        upperScreenName: 'Others'
      },
      Governance: {
        upperScreenName: 'Others'
      },
      'Governance Details': {
        upperScreenName: 'Others'
      },
      Setting: {
        upperScreenName: 'Settings'
      },
      SettingSelectAccount: {
        upperScreenName: 'Settings'
      },
      SettingSelectLang: {
        upperScreenName: 'Settings'
      },
      'Setting.ViewPrivateData': {
        upperScreenName: 'Settings'
      },
      'Setting.Version': {
        upperScreenName: 'Settings'
      },
      AddressBook: {
        upperScreenName: 'AddressBooks'
      },
      AddAddressBook: {
        upperScreenName: 'AddressBooks'
      },
      Result: {
        upperScreenName: 'Others'
      },
      TxPendingResult: {
        upperScreenName: 'Others'
      },
      TxSuccessResult: {
        upperScreenName: 'Others'
      },
      TxFailedResult: {
        upperScreenName: 'Others'
      },
      'Web.Intro': {
        upperScreenName: 'Web'
      },
      'Web.dApp': {
        upperScreenName: 'Web'
      },

      Transactions: {
        upperScreenName: 'Main'
      },
      'Transactions.Detail': {
        upperScreenName: 'Main'
      }
    }).withParams<{
      'Register.NewMnemonic': {
        registerConfig: RegisterConfig
      }
      'Register.VerifyMnemonic': {
        registerConfig: RegisterConfig
        newMnemonicConfig: NewMnemonicConfig
        bip44HDPath: BIP44HDPath
      }
      'Register.RecoverMnemonic': {
        registerConfig: RegisterConfig
      }
      'Register.NewLedger': {
        registerConfig: RegisterConfig
      }
      'Register.ImportFromExtension.Intro': {
        registerConfig: RegisterConfig
      }
      'Register.ImportFromExtension': {
        registerConfig: RegisterConfig
      }
      'Register.ImportFromExtension.SetPassword': {
        registerConfig: RegisterConfig
        exportKeyRingDatas: ExportKeyRingData[]
        addressBooks: { [chainId: string]: AddressBookData[] | undefined }
      }
      'Register.End': {
        password?: string
      }
      Send: {
        chainId?: string
        currency?: string
        recipient?: string
      }
      'Validator.Details': {
        validatorAddress: string
      }
      'Validator.List': {
        validatorSelector?: (validatorAddress: string) => void
      }
      Delegate: {
        validatorAddress: string
      }
      Undelegate: {
        validatorAddress: string
      }
      Redelegate: {
        validatorAddress: string
      }
      'Governance Details': {
        proposalId: string
      }
      'Setting.ViewPrivateData': {
        privateData: string
        privateDataType: string
      }
      AddressBook: {
        recipientConfig?: IRecipientConfig
        memoConfig?: IMemoConfig
      }
      AddAddressBook: {
        chainId: string
        addressBookConfig: AddressBookConfig
      }
      TxPendingResult: {
        chainId?: string
        txHash: string
      }
      TxSuccessResult: {
        chainId?: string
        txHash: string
      }
      TxFailedResult: {
        chainId?: string
        txHash: string
      }
    }>()
  )

export { SmartNavigatorProvider, useSmartNavigation }
