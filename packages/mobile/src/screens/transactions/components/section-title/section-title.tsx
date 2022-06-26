import React, { FunctionComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@rneui/base'
import { RefreshIcon } from '../../../../components/icon/refresh'
import { useStyle } from '../../../../styles'
import { colors, spacing, typography } from '../../../../themes'

export const TransactionSectionTitle: FunctionComponent<{
  title: string
  right?: React.ReactElement

  onPress?: () => void
}> = ({ title, right, onPress }) => {
  const style = useStyle()
  return (
    <View style={styles.container}>
      <Text h4 h4Style={styles.textTitle}>
        {title &&
          title.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}
      </Text>
      {right ? (
        right
      ) : (
        <RefreshIcon onPress={onPress} color={'#4334F1'} size={24} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing['20'],
    paddingTop: spacing['16'],
    paddingBottom: spacing['12'],
    marginTop: spacing['16'],
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textTitle: {
    color: colors['black'],
    ...typography.body2
  }
})
