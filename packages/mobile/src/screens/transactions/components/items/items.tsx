import React from 'react'
import { FunctionComponent } from 'react'
import { StyleSheet, TextStyle, View } from 'react-native'
import { Text } from '@rneui/base'
import { RectButton } from '../../../../components/rect-button'
import { colors, metrics, spacing, typography } from '../../../../themes'

export const TransactionItem: FunctionComponent<{
  label?: string
  paragraph?: string
  left?: React.ReactElement
  right?: React.ReactElement

  colorStyleAmount?: TextStyle
  styleReactButton?: number
  amount?: string
  denom?: string
  topBorder?: boolean
  onPress?: () => void
  bottomBorder?: boolean
}> = ({
  label,
  onPress,
  paragraph,
  colorStyleAmount,
  topBorder,
  amount,
  denom,
  right,
  styleReactButton
}) => {
  const renderChildren = () => {
    return (
      <>
        <View style={styles.containerFragment}>
          <View style={{ flex: 1 }}>
            <Text h4 h4Style={styles.textLabel} numberOfLines={1}>
              {label}
            </Text>
            {paragraph ? (
              <Text style={styles.textParagraph}>{paragraph}</Text>
            ) : null}
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {
              <Text
                h4
                h4Style={{
                  ...styles.textAmount,
                  color: amount.includes('-')
                    ? colors['red-500']
                    : colors['green-500']
                }}
              >
                {amount} {denom}
              </Text>
            }
          </View>
        </View>
      </>
    )
  }

  return (
    <View style={styles.container}>
      {topBorder ? <View style={styles.topBorder} /> : null}
      <RectButton
        style={{
          ...styles.reactBtn,
          borderRadius: spacing['12'],
          paddingHorizontal: spacing['8']
        }}
        onPress={onPress}
      >
        {renderChildren()}
      </RectButton>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['20'],
    marginVertical: spacing['8']
  },
  topBorder: {
    height: 1,
    marginVertical: spacing['20'],
    backgroundColor: colors['white']
  },
  reactBtn: {
    flexDirection: 'row',
    height: 87,
    alignItems: 'center',
    paddingVertical: spacing['20'],
    backgroundColor: colors['white']
  },
  containerFragment: {
    width: metrics.screenWidth - 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing['20'],
    paddingVertical: spacing['14'],
    flex: 1
  },
  textLabel: {
    ...typography.h5,
    color: colors['text-black'],
    fontWeight: 'bold'
  },
  textParagraph: {
    marginTop: spacing['4'],
    fontSize: 12,
    color: colors['gray-600'],
    fontWeight: 'normal'
  },
  textAmount: {
    ...typography.h5,

    fontWeight: '800'
  }
})
