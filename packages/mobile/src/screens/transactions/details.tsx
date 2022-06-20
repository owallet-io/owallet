import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { CopyIcon } from '../../components/icon';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { useStyle } from '../../styles';
import { TransactionItem, TransactionSectionTitle } from './components';

export const CopyIc: FunctionComponent<{
  paragraph?: string;
}> = ({ paragraph }) => {
  const style = useStyle();
  return (
    <React.Fragment>
      {paragraph ? (
        <Text
          style={style.flatten([
            'body1',
            'color-text-black-low',
            'margin-right-16',
          ])}
        >
          {paragraph}
        </Text>
      ) : null}
      <CopyIcon color={style.get('color-primary').color} size={24} />
    </React.Fragment>
  );
};

export const DetailsItems: FunctionComponent<{
  label?: string;
  paragraph?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  colorStyleAmount?: TextStyle;
  styleReactButton?: TextStyle;
  amount?: string;
  denom?: string;
  topBorder?: boolean;
  onPress?: () => void;
  bottomBorder?: boolean;

  colorParagraph?: TextStyle;
}> = ({
  label,
  onPress,
  paragraph,
  colorStyleAmount,
  topBorder,
  amount,
  denom,
  right,
  styleReactButton,
  colorParagraph,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <React.Fragment>
        <View
          style={StyleSheet.flatten([
            style.flatten([
              'flex-row',
              'justify-between',
              'items-center',
              'width-full',
            ]),
          ])}
        >
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten(['border-color-text-black-very-very-low']),
              ])}
            >
              {label}
            </Text>
            {paragraph ? (
              <Text
                style={StyleSheet.flatten([
                  style.flatten(['body2', 'margin-top-4']),
                  colorParagraph
                    ? colorParagraph
                    : style.flatten(['color-text-black-low']),
                ])}
              >
                {paragraph}
              </Text>
            ) : null}
          </View>
          <View>
            {right ? (
              right
            ) : (
              <Text
                style={StyleSheet.flatten([
                  style.flatten(['h5']),
                  colorStyleAmount,
                ])}
              >
                {amount} {denom}
              </Text>
            )}
          </View>
        </View>
      </React.Fragment>
    );
  };

  return (
    <View style={style.flatten(['padding-x-20'])}>
      {topBorder ? (
        <View
          style={style.flatten([
            'height-1',
            'margin-x-20',
            'background-color-border-white',
          ])}
        />
      ) : null}
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'height-62',
            'flex-row',
            'items-center',
            'padding-x-20',
            'background-color-white',
          ]),
          styleReactButton
            ? styleReactButton
            : style.flatten(['border-radius-8']),
        ])}
        onPress={onPress}
      >
        {renderChildren()}
      </RectButton>
    </View>
  );
};

export const TransactionDetail: FunctionComponent<any> = () => {
  const style = useStyle();
  return (
    <PageWithScrollViewInBottomTabView>
      <View
        style={style.flatten([
          'padding-x-20',
          'padding-top-16',
          'padding-bottom-16',
          'background-color-white',
        ])}
      >
        <Text style={style.flatten(['h5'])}>Transaction Detail</Text>
      </View>
      <TransactionSectionTitle title={'Received token'} right={<></>} />
      <View>
        <DetailsItems
          label="From"
          topBorder={true}
          paragraph={'orai1nc752...74u9uylc'}
          right={<CopyIc />}
        />
        <DetailsItems
          label="To"
          topBorder={true}
          paragraph={'orai1nc752...74u9322'}
          right={<CopyIc />}
        />
        <DetailsItems
          label="Transaction hash"
          topBorder={true}
          paragraph={'051E23F9...87C52492'}
          right={<CopyIc />}
        />
        <DetailsItems
          label="Amount"
          topBorder={true}
          paragraph={'+125,000 ORAI'}
          colorParagraph={style.flatten(['color-primary'])}
        />
      </View>
      <TransactionSectionTitle title={'Detail'} right={<></>} />
      {[
        {
          label: 'Result',
          content: 'Success',
        },
        {
          label: 'Block height',
          content: '2464586',
        },
        {
          label: 'Message size',
          content: '01',
        },
        {
          label: 'Gas (used/ wanted)',
          content: '44,840/200,000',
        },
        {
          label: 'Fee',
          content: '0.1 ORAI',
        },
        {
          label: 'Amount',
          content: '125,000 ORAI',
        },
        {
          label: 'Time',
          content: 'Apr 25, 2022 at 06:20',
        },
      ].map((e) => (
        <DetailsItems
          label={e.label}
          topBorder={true}
          right={<Text>{e.content}</Text>}
        />
      ))}
    </PageWithScrollViewInBottomTabView>
  );
};
