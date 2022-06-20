import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStyle } from '../../styles';
import { StackActions, useNavigation } from '@react-navigation/native';
import { TransactionSectionTitle, TransactionItem } from './components';
import { PageWithScrollViewInBottomTabView } from '../../components/page';

export const Transactions: FunctionComponent<any> = () => {
  const style = useStyle();
  const [tabs, setTabs] = useState<number>(1);
  const navigation = useNavigation();
  const array = [
    {
      label: 'Send token',
      date: 'Apr 25, 2022',
      amount: '-80.02',
      denom: 'ORAI',
    },
    {
      label: 'Send token',
      date: 'Apr 25, 2022',
      amount: '-100.02',
      denom: 'ORAI',
    },
    {
      label: 'Send token',
      date: 'Apr 25, 2022',
      amount: '-100.02',
      denom: 'ORAI',
    },
    {
      label: 'Send token',
      date: 'Apr 25, 2022',
      amount: '-100.02',
      denom: 'ORAI',
    },
    {
      label: 'Send token',
      date: 'Apr 25, 2022',
      amount: '-100.02',
      denom: 'ORAI',
    },
    {
      label: 'Send token 3',
      date: 'Apr 25, 2022',
      amount: '-100.02',
      denom: 'ORAI',
    },
    {
      label: 'Send token',
      date: 'Apr 25, 2022',
      amount: '-12.02',
      denom: 'ORAI',
    },
    {
      label: 'Send token',
      date: 'Apr 25, 2022',
      amount: '-100.02',
      denom: 'ORAI',
    },
  ];

  const arrayReceive = [
    {
      label: 'Receive token',
      date: 'Apr 25, 2022',
      amount: '-80.02',
      denom: 'ORAI',
    },
  ];
  const RenderTabs: FunctionComponent<any> = () => {
    let renderTabs;
    switch (tabs) {
      case 1:
        renderTabs = array.map((e, i) => (
          <TransactionItem
            label={e.label + ' ' + i}
            paragraph={e.date}
            amount={e.amount}
            denom={e.denom}
            key={i}
            onPress={() =>
              navigation.dispatch(StackActions.replace('TransactionsDetails'))
            }
            colorStyleAmount={style.flatten(['color-profile-red'])}
          />
        ));
        break;
      case 2:
        renderTabs = arrayReceive.map((e, i) => (
          <TransactionItem
            label={e.label + ' ' + i}
            key={i}
            paragraph={e.date}
            amount={e.amount}
            denom={e.denom}
            onPress={() =>
              navigation.dispatch(StackActions.replace('TransactionsDetails'))
            }
            colorStyleAmount={style.flatten(['color-profile-green'])}
          />
        ));
        break;
    }
    return renderTabs;
  };
  return (
    <PageWithScrollViewInBottomTabView>
      <View style={style.flatten(['background-color-white'])}>
        <View
          style={style.flatten([
            'padding-top-6',
            'padding-bottom-6',
            'padding-left-8',
            'margin-y-16',
            'margin-x-20',
            'background-color-border-white',
            'flex-row',
            'justify-around',
            'border-radius-16',
          ])}
        >
          <TouchableOpacity
            style={[
              StyleSheet.flatten([
                style.flatten([
                  'width-half',
                  'flex-row',
                  'items-center',
                  'justify-center',
                  'border-radius-12',
                  'height-44',
                ]),
                tabs === 1 && style.flatten(['background-color-primary']),
              ]),
            ]}
            onPress={() => setTabs(1)}
          >
            <Text
              style={[
                StyleSheet.flatten([
                  style.flatten(['color-white', 'body2']),
                  tabs === 2 && style.flatten(['color-black']),
                ]),
              ]}
            >
              Transfer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              StyleSheet.flatten([
                style.flatten([
                  'width-half',
                  'flex-row',
                  'items-center',
                  'justify-center',
                  'border-radius-12',
                  'height-44',
                ]),
                tabs === 2 && style.flatten(['background-color-primary']),
              ]),
            ]}
            onPress={() => setTabs(2)}
          >
            <Text
              style={[
                StyleSheet.flatten([
                  style.flatten(['color-white', 'body2']),
                  tabs === 1 && style.flatten(['color-black']),
                ]),
              ]}
            >
              Receive
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TransactionSectionTitle title={'Transfer list'} />
      <RenderTabs />
    </PageWithScrollViewInBottomTabView>
  );
};
