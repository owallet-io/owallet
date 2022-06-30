import React, { FunctionComponent, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { PageWithScrollView } from '../../../components/page'
import { useStyle } from '../../../styles'
import { RouteProp, useRoute } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'
import { useStore } from '../../../stores'
import { useDelegateTxConfig } from '@owallet/hooks'
import { EthereumEndpoint } from '@owallet/common'
import { AmountInput, FeeButtons, MemoInput } from '../../../components/input'
import { Button } from '../../../components/button'
import { useSmartNavigation } from '../../../navigation.provider'
import { BondStatus } from '@owallet/stores'
import { colors, spacing, typography } from '../../../themes'
import { CText as Text } from '../../../components/text'
import { RectButton } from '../../../components/rect-button'

export const DelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string
        }
      >,
      string
    >
  >()

  const validatorAddress = route.params.validatorAddress

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore()

  const style = useStyle()
  const smartNavigation = useSmartNavigation()

  const account = accountStore.getAccount(chainStore.current.chainId)
  const queries = queriesStore.get(chainStore.current.chainId)

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts["delegate"].gas,
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  )

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress)
  }, [sendConfigs.recipientConfig, validatorAddress])

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError()
  const txStateIsValid = sendConfigError == null

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  )

  const validator = bondedValidators.getValidator(validatorAddress)

  return (
    <PageWithScrollView
      style={{
        ...styles.page
      }}
      contentContainerStyle={{
        flexGrow: 1
      }}
    >
      <Text
        style={{
          ...typography.h3,
          fontWeight: '700',
          textAlign: 'center',
          color: colors['gray-900'],
          marginTop: spacing['12'],
          marginBottom: spacing['12']
        }}
      >
        Staking
      </Text>

      <View style={{
        ...styles.containerStaking,
        padding: spacing['24']
      }}>
        <AmountInput labels={["Amount", "Total: 250 ORAI"]} amountConfig={sendConfigs.amountConfig} />
        <MemoInput
          label={"Memo (Optional)"}
          memoConfig={sendConfigs.memoConfig}
        />
        <FeeButtons
          label="Fee"
          gasLabel="gas"
          feeConfig={sendConfigs.feeConfig}
          gasConfig={sendConfigs.gasConfig}
        />
        {/* <Button
          text="Stake"
          size="large"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          loading={account.isSendingMsg === 'delegate'}
          onPress={async () => {
            if (account.isReadyToSendMsgs && txStateIsValid) {
              try {
                await account.cosmos.sendDelegateMsg(
                  sendConfigs.amountConfig.amount,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.memoConfig.memo,
                  sendConfigs.feeConfig.toStdFee(),
                  {
                    preferNoSetMemo: true,
                    preferNoSetFee: true
                  },
                  {
                    onBroadcasted: txHash => {
                      analyticsStore.logEvent('Delegate tx broadcasted', {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        validatorName: validator?.description.moniker,
                        feeType: sendConfigs.feeConfig.feeType
                      })
                      smartNavigation.pushSmart('TxPendingResult', {
                        txHash: Buffer.from(txHash).toString('hex')
                      })
                    }
                  }
                )
              } catch (e) {
                if (e?.message === 'Request rejected') {
                  return
                }
                console.log(e)
                smartNavigation.navigateSmart('Home', {})
              }
            }
          }}
        /> */}
      </View>
      <RectButton
        style={{ ...styles.containerBtn }}
        onPress={() => {
          smartNavigation.navigateSmart('Delegate', {
            validatorAddress: validatorAddress
          })
        }}
      >
        <Text
          style={{ ...styles.textBtn, textAlign: 'center' }}
        >{`Submit`}</Text>
      </RectButton>
    </PageWithScrollView>
  )
})

const styles = StyleSheet.create({
  page: {
    padding: spacing['page']
  },
  containerStaking: {
    borderRadius: spacing['24'],
    backgroundColor: colors['white'],
  },
  containerBtn: {
    backgroundColor: colors['purple-900'],
    marginLeft: spacing['24'],
    marginRight: spacing['24'],
    borderRadius: spacing['8'],
    marginTop: spacing['20'],
    paddingVertical: spacing['16']
  },
  textBtn: {
    ...typography.h6,
    color: colors['white'],
    fontWeight: '700'
  },
})
