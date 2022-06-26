import React, { FunctionComponent } from 'react'
import { View, ViewStyle } from 'react-native'
import { colors, spacing } from '../../themes'

export const CardDivider: FunctionComponent<{
  style?: ViewStyle
}> = ({ style: propStyle }) => {
  return (
    <View
      style={{
        height: 1,
        marginHorizontal: spacing['card-horizontal'],
        backgroundColor: colors['divider'],
        ...propStyle
      }}
    />
  )
}
