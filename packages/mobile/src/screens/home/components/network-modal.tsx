import React, { ReactElement, useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { Text } from '@rneui/base'
import { RectButton } from '../../../components/rect-button'
import { colors, metrics, spacing, typography } from '../../../themes'
import { ScanIcon } from '../../../components/icon'
import { _keyExtract } from '../../../utils/helper'

const networkSupports = [
  {
    title: 'Oraichain network',
    icon: <ScanIcon color="black" size={38} />,
    price: '$312.24'
  },
  {
    title: 'OraiBridge Network',
    icon: <ScanIcon color="black" size={38} />,
    price: '$312.24'
  },
  {
    title: 'Kawaiiverse Network',
    icon: <ScanIcon color="black" size={38} />,
    price: '$312.24'
  },
  {
    title: 'Balcony Subnet Network',
    icon: <ScanIcon color="black" size={38} />,
    price: '$312.24'
  },
  {
    title: 'Cosmos Hub Network',
    icon: <ScanIcon color="black" size={38} />,
    price: '$312.24'
  },
  {
    title: 'Osmosis Network',
    icon: <ScanIcon color="black" size={38} />,
    price: '$312.24'
  },
  {
    title: 'BNB Chain',
    icon: <ScanIcon color="black" size={38} />,
    price: '$312.24'
  }
]

const _renderItem = ({ item }) => {
  return (
    <RectButton
      style={{
        ...styles.containerBtn
      }}
    >
      <View
        style={{
          justifyContent: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        {item.icon}
        <View
          style={{
            justifyContent: 'space-between',
            marginLeft: spacing['12']
          }}
        >
          <Text
            style={{
              ...typography.h6,
              color: colors['gray-900'],
              fontWeight: '900'
            }}
            numberOfLines={1}
          >{`${item.title}`}</Text>
          <Text
            style={{
              ...typography.h7,
              color: colors['gray-300'],
              fontWeight: '900',
              fontSize: 12
            }}
          >{`$${item.price}`}</Text>
        </View>
      </View>

      <View>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: spacing['32'],
            backgroundColor: colors['primary'],
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: spacing['32'],
              backgroundColor: colors['white']
            }}
          />
        </View>
      </View>
    </RectButton>
  )
}

export const NetworkModal = (account): ReactElement => {
  const [selected, isSelected] = useState<boolean>(false)

  return (
    // container
    <View
      style={{
        alignItems: 'center'
      }}
    >
      <View
        style={{
          justifyContent: 'flex-start'
        }}
      >
        <Text
          style={{
            ...typography.h6,
            fontWeight: '900',
            color: colors['gray-900']
          }}
        >
          {`Select networks`}
        </Text>
      </View>

      <View
        style={{
          marginTop: spacing['12'],
          width: metrics.screenWidth - 48,
          justifyContent: 'space-between',
          height: metrics.screenHeight / 2
        }}
      >
        <FlatList
          data={networkSupports}
          renderItem={_renderItem}
          keyExtractor={_keyExtract}
          ListFooterComponent={() => (
            <View
              style={{
                height: spacing['10']
              }}
            />
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  containerBtn: {
    backgroundColor: colors['gray-10'],
    paddingVertical: spacing['16'],
    borderRadius: spacing['8'],
    paddingHorizontal: spacing['16'],
    flexDirection: 'row',
    marginTop: spacing['16'],
    alignItems: 'center',
    justifyContent: 'space-between'
  }
})
