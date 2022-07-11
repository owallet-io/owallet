import React, { FunctionComponent, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../../stores';
import { PageWithScrollViewInBottomTabView } from '../../../../components/page';
import { KeyStoreItem } from '../../components';
import { useSmartNavigation } from '../../../../navigation.provider';
import { View } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { useStyle } from '../../../../styles';

const SectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        'padding-x-20',
        'padding-top-16',
        'padding-bottom-12',
        'margin-top-16',
        'flex-row',
        'items-center'
      ])}
    >
      <Text style={style.flatten(['color-text-black-low', 'subtitle1'])}>
        {title}
      </Text>
    </View>
  );
};

export const SettingSelectLangScreen: FunctionComponent = observer(() => {
  const { priceStore } = useStore();
  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: key.toUpperCase()
      };
    });
  }, [priceStore.supportedVsCurrencies]);

  const smartNavigation = useSmartNavigation();
  const renderKeyStores = (title: string, currencyItems: any) => {
    return (
      <>
        <>
          <SectionTitle title={title} />
          {currencyItems.map((cur, i) => {
            return (
              <KeyStoreItem
                key={i.toString()}
                label={cur.label || 'USD'}
                onPress={async () => {
                  priceStore.setDefaultVsCurrency(cur.key || 'usd');
                  smartNavigation.navigateSmart('Setting', {});
                }}
              />
            );
          })}
        </>
      </>
    );
  };

  return (
    <PageWithScrollViewInBottomTabView>
      {renderKeyStores('Fiat List', currencyItems)}
    </PageWithScrollViewInBottomTabView>
  );
});
