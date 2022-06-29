import React from 'react'
import { FunctionComponent } from 'react'
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { Text } from '@rneui/base'
import { RectButton } from '../../../../components/rect-button'
import { colors, metrics, spacing, typography } from '../../../../themes'

interface Item {
  label?: string
  date?: string
  amount?: string
  denom?: string
}

interface TransactionItemProps {
  item: Item
  onPress?: () => void
  containerStyle?: ViewStyle
}

export const TransactionItem: FunctionComponent<TransactionItemProps> = ({
  item,
  onPress,
  containerStyle
}) => {
  const renderChildren = () => {
    return (
      <View
        style={{
          ...styles.innerButton,
          flex: 1
        }}
      >
        <View>
          <Text
            style={{
              ...styles.textInfo
            }}
          >
            {item?.label || 'Send token'}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end'
          }}
        >
          <Text
            style={{
              ...styles.textInfo,
              color: colors['gray-300']
            }}
          >
            {item?.date || 'Apr 25, 2022'}
          </Text>
          <Text
            style={{
              ...styles.textAmount,
              marginTop: spacing['8'],
              color: item?.amount.includes('-')
                ? colors['red-500']
                : colors['green-500']
            }}
          >
            {item?.amount || '-100.02'} {item?.denom || 'ORAI'}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <RectButton
      style={{
        ...styles.container, // default style for container
        ...containerStyle
      }}
      onPress={onPress}
    >
      {renderChildren()}
    </RectButton>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: spacing['24'],
    marginRight: spacing['24'],
    borderRadius: spacing['8'],
    backgroundColor: colors['red-50'],
    marginTop: spacing['4'],
    marginBottom: spacing['8']
  },
  textInfo: {
    ...typography.h7,
    color: colors['gray-900'],
    fontWeight: '600'
  },
  textAmount: {
    ...typography.h6,
    fontWeight: '800'
  },
  innerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing['8'],
    marginHorizontal: spacing['16']
  }
})
