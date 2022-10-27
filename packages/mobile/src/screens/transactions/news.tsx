import React, { FunctionComponent } from 'react';
import { FlatList, View } from 'react-native';
import { PageWithScrollView } from '../../components/page';
import { CText as Text } from '../../components/text';
import { colors, metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';

const data = [
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  }
];

export const NewsTab: FunctionComponent<{}> = () => {
  const _renderItem = ({ item, index }) => {
    return <Text></Text>;
  };
  return (
    <View style={{ height: metrics.screenHeight }}>
      <View>
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={_keyExtract}
          data={[]}
          renderItem={_renderItem}
          ListFooterComponent={<View style={{ height: spacing['12'] }} />}
          ListEmptyComponent={
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: metrics.screenHeight / 4
              }}
            >
              <Text
                style={{
                  ...typography.subtitle1,
                  color: colors['gray-300']
                }}
              >
                {'Comming Soon!'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};
