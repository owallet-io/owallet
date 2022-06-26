import React from 'react'
import { FunctionComponent } from 'react'
import { StyleSheet, TextStyle, View } from 'react-native'
import { Text } from '@rneui/base'
import { RectButton } from '../../../../components/rect-button'
import { useStyle } from '../../../../styles'
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
  const style = useStyle()

  const renderChildren = () => {
    return (
      <React.Fragment>
        <View style={styles.containerFragment}>
          <View>
            <Text h4 h4Style={styles.textLabel}>
              {label}
            </Text>
            {paragraph ? (
              <Text style={styles.textParagraph}>{paragraph}</Text>
            ) : null}
          </View>
          <View>
            {right ? (
              right
            ) : (
              <Text h4 h4Style={{ ...styles.textAmount, ...colorStyleAmount }}>
                {amount} {denom}
              </Text>
            )}
          </View>
        </View>
      </React.Fragment>
    )
  }

  return (
    <View style={styles.container}>
      {topBorder ? <View style={styles.topBorder} /> : null}
      <RectButton
        style={{
          ...styles.reactBtn,
          marginHorizontal: styleReactButton ? styleReactButton : spacing['8'],
          borderRadius: styleReactButton ? styleReactButton : spacing['12']
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
    paddingVertical: spacing['20']
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
    width: metrics.screenWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textLabel: {
    ...typography.h5,
    color: colors['text-black-low']
  },
  textParagraph: {
    marginTop: spacing['4'],
    ...typography.subtitle3,
    color: colors['text-black-low']
  },
  textAmount: {
    ...typography.h5,
    ...colorStyleAmount
  }
})
