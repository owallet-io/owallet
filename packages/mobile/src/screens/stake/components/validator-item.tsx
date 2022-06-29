import React, { FunctionComponent } from 'react'
import { Image, StyleSheet, View, ViewStyle } from 'react-native'
import { colors, spacing } from '../../../themes'
import { CText as Text } from '../../../components/text'

interface Validator {
  imageUri?: string
  name?: string
  amount?: string
  denom?: string
  staked?: number
}

interface ValidatorItemProps {
  validator?: Validator
  containerStyle?: ViewStyle
}

export const ValidatorItem: FunctionComponent<ValidatorItemProps> = ({
  validator,
  containerStyle
}) => {
  return (
    <View
      style={{
        ...styles.container,
        ...containerStyle
      }}
    >
      <Image source={{ uri: validator.imageUri }} height={38} width={38} />
      <Text>{validator.name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors['white'],
    borderRadius: spacing['8'],
    marginVertical: spacing['8'],
    flexDirection: 'row'
  }
})
