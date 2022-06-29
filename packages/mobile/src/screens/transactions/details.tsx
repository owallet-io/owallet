import Clipboard from 'expo-clipboard'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Divider } from '@rneui/base'
import { CText as Text} from "../../components/text";
import { RectButton } from 'react-native-gesture-handler'
import { CopyFillIcon, CopyIcon } from '../../components/icon'
import { PageWithScrollViewInBottomTabView } from '../../components/page'
import { useStyle } from '../../styles'
import { TransactionSectionTitle } from './components'
import { colors, metrics, spacing, typography } from '../../themes'
import { formatContractAddress } from '../../utils/helper'

interface TransactionInfo {
  label: string
  value: string
}
interface TransactionDetail {
  amount: string
  result: 'Success' | 'Fail'
  height: number | string
  size: number | string
  gas: number | string
  time: string
}

const txInfo: TransactionInfo[] = [
  {
    label: 'From',
    value: 'orai1nc752...74u9uylc'
  },
  {
    label: 'To',
    value: 'orai1nc752...74u9uylc'
  },
  {
    label: 'Transaction hash',
    value: 'orai1nc752...74u9uylc'
  },
  {
    label: 'Amount',
    value: '+125,000 ORAI'
  }
]

const txDetail: TransactionInfo[] = [
  {
    label: 'Result',
    value: 'Failed'
  },
  {
    label: 'Block height',
    value: '2464586'
  },
  {
    label: 'Message size',
    value: '01'
  },
  {
    label: 'Gas (used/ wanted)',
    value: '44,840/200,000'
  },
  {
    label: 'Fee',
    value: '0.1 ORAI'
  },
  {
    label: 'Amount',
    value: '125,000 ORAI'
  },
  {
    label: 'Time',
    value: 'Apr 25, 2022 at 06:20'
  }
]

const bindStyleTxInfo = (
  label: string,
  value: string
): { color?: string; textTransform?: string; fontWeight?: string } => {
  switch (label) {
    case 'Transaction hash':
      return { color: colors['primary'], textTransform: 'uppercase' }
    case 'Amount':
      return value.includes('-')
        ? { color: colors['red-500'], fontWeight: '800' }
        : { color: colors['green-500'], fontWeight: '800' }
    default:
      return { color: colors['gray-900'] }
  }
}

const bindValueTxInfo = (label: string, value: string) => {
  switch (label) {
    case 'Transaction hash':
    case 'From':
    case 'To':
      return formatContractAddress(value)

    default:
      return value
  }
}

export const CopyIc: FunctionComponent<{
  paragraph?: string
  onPress?: () => void
}> = ({ paragraph, onPress }) => {
  return (
    <>
      <CopyFillIcon
        onPress={onPress}
        color={colors['color-primary']}
        size={24}
      />
    </>
  )
}

const InfoItems: FunctionComponent<{
  label: string
  value: string
  topBorder?: boolean
  onPress?: () => void
}> = ({ label, onPress, value, topBorder }) => {
  const style = useStyle()
  const renderChildren = () => {
    return (
      <>
        <View style={styles.containerDetailVertical}>
          <View
            style={{
              flex: 1
            }}
          >
            <Text
              h4
              h4Style={{
                color: colors['gray-600'],
                ...typography.h7
              }}
            >
              {label}
            </Text>
            <Text
              h4
              h4Style={{
                ...bindStyleTxInfo(label, value),
                marginTop: spacing['2'],
                ...typography.body2
              }}
            >
              {bindValueTxInfo(label, value)}
            </Text>
          </View>
          {label !== 'Amount' && (
            <View
              style={{
                flex: 1,
                alignItems: 'flex-end'
              }}
            >
              <CopyIc />
            </View>
          )}
          <View />
        </View>
      </>
    )
  }

  return (
    <View
      style={{
        paddingHorizontal: spacing['20']
      }}
    >
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'height-62',
            'flex-row',
            'items-center',
            'padding-x-20',
            'background-color-white'
          ])
        ])}
        onPress={onPress}
      >
        {renderChildren()}
      </RectButton>
      <Divider />
    </View>
  )
}

const DetailItems: FunctionComponent<{
  label: string
  value: string
  topBorder?: boolean
  onPress?: () => void
}> = ({ label, onPress, value, topBorder }) => {
  const style = useStyle()
  const renderChildren = () => {
    return (
      <>
        <View style={styles.containerDetailHorizontal}>
          <View style={{ flex: 1 }}>
            <Text
              h4
              h4Style={{
                color: colors['gray-600'],
                ...typography.h7
              }}
            >
              {label}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text
              h4
              h4Style={{
                ...typography.body2,
                color:
                  value === 'Success'
                    ? colors['green-500']
                    : value === 'Failed'
                    ? colors['red-500']
                    : colors['black']
              }}
            >
              {bindValueTxInfo(label, value)}
            </Text>
          </View>
          <View />
        </View>
      </>
    )
  }

  return (
    <View
      style={{
        paddingHorizontal: spacing['20']
      }}
    >
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'height-62',
            'flex-row',
            'items-center',
            'padding-x-20',
            'background-color-white'
          ])
        ])}
        onPress={onPress}
      >
        {renderChildren()}
      </RectButton>
      <Divider />
    </View>
  )
}

export const TransactionDetail: FunctionComponent<any> = () => {
  const style = useStyle()

  return (
    <PageWithScrollViewInBottomTabView>
      <View style={styles.containerTitle}>
        <Text style={styles.textTitle}>Transaction Detail</Text>
      </View>
      <TransactionSectionTitle title={'Received token'} right={<></>} />
      <View>
        {txInfo.map((item, index) => (
          <InfoItems
            key={index}
            label={item.label}
            topBorder={true}
            value={item.value}
          />
        ))}
      </View>
      <TransactionSectionTitle title={'Detail'} />

      <View>
        {txDetail.map(({ label, value }: TransactionInfo, index: number) => (
          <DetailItems
            key={index}
            label={label}
            topBorder={true}
            value={value}
          />
        ))}
      </View>

      <View style={style.flatten(['height-1', 'margin-y-20'])} />
    </PageWithScrollViewInBottomTabView>
  )
}

const styles = StyleSheet.create({
  container: {},
  containerTitle: {
    paddingHorizontal: spacing['20'],
    paddingVertical: spacing['16'],
    backgroundColor: colors['white']
  },
  textTitle: {
    ...typography.h3,
    color: colors['black'],
    lineHeight: 34,
    fontWeight: 'bold'
  },
  containerDetailVertical: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: metrics.screenWidth - 40
  },
  containerDetailHorizontal: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: metrics.screenWidth - 40
  },
  textParagraph: {}
})
