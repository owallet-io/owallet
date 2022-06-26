import React, { FunctionComponent } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useStyle } from '../../styles'
import { colors } from '../../themes'
import { PersonIcon } from '../icon'

export const ValidatorThumbnail: FunctionComponent<{
  style?: ViewStyle
  url?: string
  size: number
}> = ({ style: propStyle, url, size }) => {
  const style = useStyle()

  return (
    <View
      style={{
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors['white'],
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: size,
        ...propStyle
      }}
    >
      {url ? (
        <FastImage
          style={{
            width: size,
            height: size
          }}
          source={{
            uri: url
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <PersonIcon size={size} color="black" />
      )}
    </View>
  )
}
