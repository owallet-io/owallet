import React, { FunctionComponent, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../../stores'
import { PageWithSectionList } from '../../../components/page'
import { StyleSheet, View } from 'react-native'
import { CText as Text } from '../../../components/text'
import { BondStatus, Validator } from '@owallet/stores'
import { useStyle } from '../../../styles'
import { SelectorModal, TextInput } from '../../../components/input'
import { GradientBackground } from '../../../components/svg'
import { CardDivider } from '../../../components/card'
import { useSmartNavigation } from '../../../navigation.provider'
import { CoinPretty, Dec } from '@owallet/unit'
import {
  ArrowOpsiteUpDownIcon,
  ValidatorOutlineIcon
} from '../../../components/icon'
import { ValidatorThumbnail } from '../../../components/thumbnail'
import { RouteProp, useRoute } from '@react-navigation/native'
import { RectButton } from '../../../components/rect-button'
import { ValidatorThumbnails } from '@owallet/common'
import { colors, spacing, typography } from '../../../themes'

type Sort = 'APY' | 'Voting Power' | 'Name'

export const ValidatorListScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorSelector?: (validatorAddress: string) => void
        }
      >,
      string
    >
  >()

  const { chainStore, queriesStore } = useStore()

  const queries = queriesStore.get(chainStore.current.chainId)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('Voting Power')
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  )

  const data = useMemo(() => {
    let data = bondedValidators.validators
    if (search) {
      data = data.filter(val =>
        val.description.moniker?.toLowerCase().includes(search.toLowerCase())
      )
    }
    switch (sort) {
      case 'APY':
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(
            new Dec(val2.commission.commission_rates.rate)
          )
            ? 1
            : -1
        })
        break
      case 'Name':
        data.sort((val1, val2) => {
          if (!val1.description.moniker) {
            return 1
          }
          if (!val2.description.moniker) {
            return -1
          }
          return val1.description.moniker > val2.description.moniker ? -1 : 1
        })
        break
      case 'Voting Power':
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? -1 : 1
        })
        break
    }

    return data
  }, [bondedValidators.validators, search, sort])

  useLogScreenView("Validator list", {
    chainId: chainStore.current.chainId,
    chainName: chainStore.current.chainName,
  });

  const items = useMemo(() => {
    return [
      { label: 'APY', key: 'APY' },
      { label: 'Amount Staked', key: 'Voting Power' },
      { label: 'Name', key: 'Name' }
    ]
  }, [])

  const sortItem = useMemo(() => {
    const item = items.find(item => item.key === sort)
    if (!item) {
      throw new Error(`Can't find the item for sort (${sort})`)
    }
    return item
  }, [items, sort])

  return (
    <React.Fragment>
      <SelectorModal
        close={() => {
          setIsSortModalOpen(false)
        }}
        isOpen={isSortModalOpen}
        items={items}
        selectedKey={sort}
        setSelectedKey={key => setSort(key as Sort)}
      />

      <PageWithSectionList
        sections={[
          {
            data
          }
        ]}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item: Validator) => item.operator_address}
        renderItem={({ item, index }: { item: Validator; index: number }) => {
          return (
            <View
              style={{
                marginHorizontal: spacing['24'],
                marginVertical: spacing['8'],
                borderRadius: spacing['8']
              }}
            >
              <ValidatorItem
                validatorAddress={item.operator_address}
                index={index}
                sort={sort}
                onSelectValidator={route.params.validatorSelector}
              />
            </View>
          )
        }}
        ItemSeparatorComponent={() => <CardDivider />}
        renderSectionHeader={() => {
          return (
            <View>
              <Text
                style={{
                  ...typography.h3,
                  fontWeight: '700',
                  textAlign: 'center',
                  color: colors['gray-900']
                }}
              >
                {`Active validators`}
              </Text>
              <View
                style={{
                  paddingHorizontal: spacing['20'],
                  paddingTop: spacing['12'],
                  paddingBottom: spacing['4']
                }}
              >
                <TextInput
                  label="Search"
                  placeholder="Search"
                  labelStyle={{
                    display: 'none'
                  }}
                  containerStyle={{
                    padding: 0
                  }}
                  value={search}
                  onChangeText={text => {
                    setSearch(text)
                  }}
                  paragraph={
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: spacing['32'],
                        marginBottom: spacing['16']
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row'
                        }}
                      >
                        <ValidatorOutlineIcon
                          color={colors['gray-900']}
                          size={16}
                        />
                        <Text
                          style={{
                            ...styles.title,
                            marginLeft: spacing['8']
                          }}
                        >
                          {`Validator list`}
                        </Text>
                      </View>
                      <RectButton
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: spacing['2']
                        }}
                        onPress={() => {
                          setIsSortModalOpen(true)
                        }}
                      >
                        <Text
                          style={{
                            ...styles.title,
                            marginRight: spacing['10'],
                            textTransform: 'uppercase'
                          }}
                        >
                          {sortItem.label}
                        </Text>
                        <ArrowOpsiteUpDownIcon
                          size={24}
                          color={colors['gray-900']}
                        />
                      </RectButton>
                    </View>
                  }
                />
              </View>
            </View>
          )
        }}
      />
    </React.Fragment>
  )
})

const ValidatorItem: FunctionComponent<{
  validatorAddress: string
  index: number
  sort: Sort

  onSelectValidator?: (validatorAddress: string) => void
}> = observer(({ validatorAddress, index, sort, onSelectValidator }) => {
  const { chainStore, queriesStore } = useStore()

  const queries = queriesStore.get(chainStore.current.chainId)

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  )

  const style = useStyle()

  const validator = bondedValidators.getValidator(validatorAddress)

  const smartNavigation = useSmartNavigation()

  return validator ? (
    <RectButton
      style={{
        ...styles.container,
        flexDirection: 'row',
        backgroundColor: colors['white'],
        alignItems: 'center'
      }}
      // onPress={() => {
      //   if (onSelectValidator) {
      //     onSelectValidator(validatorAddress)
      //     smartNavigation.goBack()
      //   } else {
      //     smartNavigation.navigateSmart('Validator.Details', {
      //       validatorAddress
      //     })
      //   }
      // }}
    >
      <ValidatorThumbnail
        style={{
          marginRight: spacing['8']
        }}
        size={38}
        url={
          ValidatorThumbnails[validator.operator_address] ??
          bondedValidators.getValidatorThumbnail(validator.operator_address)
        }
      />

      <View
        style={{
          ...styles.containerInfo
        }}
      >
        <Text
          style={{
            ...styles.textInfo,
            color: colors['gray-900']
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {validator.description.moniker}
        </Text>

        <Text
          style={{
            ...styles.textInfo,
            color: colors['gray-300']
          }}
        >
          {new CoinPretty(
            chainStore.current.stakeCurrency,
            new Dec(validator.tokens)
          )
            .maxDecimals(0)
            .hideDenom(true)
            .toString() + ' staked'}
        </Text>
      </View>
      <View
        style={{
          flex: 1
        }}
      />
      <Text
        style={{
          ...styles.textInfo
        }}
      >
        {queries.cosmos.queryInflation.inflation
          .mul(
            new Dec(1).sub(new Dec(validator.commission.commission_rates.rate))
          )
          .maxDecimals(2)
          .trim(true)
          .toString() + '%'}
      </Text>
    </RectButton>
  ) : null
})

const styles = StyleSheet.create({
  title: {
    ...typography.h7,
    fontWeight: '400',
    color: colors['gray-700']
  },
  container: {
    backgroundColor: colors['white'],
    flexDirection: 'row',
    padding: spacing['8'],
    flex: 1,
    paddingLeft: spacing['8'],
    paddingRight: spacing['16']
  },
  containerInfo: {
    marginLeft: spacing['12']
  },
  textInfo: {
    ...typography.h6,
    fontWeight: '400',
    color: colors['gray-900']
  }
})
