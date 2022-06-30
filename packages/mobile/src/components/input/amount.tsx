import React, { FunctionComponent, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { TextInput } from './input'
import { TextStyle, View, ViewStyle } from 'react-native'
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError
} from '@owallet/hooks'
import { Button } from '../button'
import { useStyle } from '../../styles'
import { colors, spacing } from '../../themes'

export const AmountInput: FunctionComponent<{
  labelStyle?: TextStyle
  containerStyle?: ViewStyle
  inputContainerStyle?: ViewStyle
  errorLabelStyle?: TextStyle
  placeholder?: string
  placeholderTextColor?: string
  labels: string[]

  amountConfig: IAmountConfig
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    labels,
    amountConfig,
    placeholder,
    placeholderTextColor
  }) => {
    const error = amountConfig.getError()
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            return
          case InvalidNumberAmountError:
            return 'Invalid number'
          case ZeroAmountError:
            return 'Amount is zero'
          case NegativeAmountError:
            return 'Amount is negative'
          case InsufficientAmountError:
            return 'Insufficient fund'
          default:
            return 'Unknown error'
        }
      }
    }, [error])

    return (
      <TextInput
        labels={labels}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        value={amountConfig.amount}
        onChangeText={text => {
          amountConfig.setAmount(text.replace(/,/g, '.'))
        }}
        inputRight={
          <View
            style={{
              height: 1,
              overflow: 'visible',
              justifyContent: 'center'
            }}
          >
            <Button
              text="MAX"
              mode={'light'}
              size="small"
              style={{
                paddingHorizontal: spacing['5'],
                paddingVertical: spacing['3']
              }}
              containerStyle={{
                height: 24,
                borderRadius: spacing['4'],
                backgroundColor: colors['white'],
                borderColor: colors['purple-900'],
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              textStyle={{
                color: colors['purple-900'],
                textTransform: 'uppercase'
              }}
              onPress={() => {
                amountConfig.setIsMax(!amountConfig.isMax)
              }}
            />
          </View>
        }
        error={errorText}
        keyboardType="numeric"
      />
    )
  }
)
