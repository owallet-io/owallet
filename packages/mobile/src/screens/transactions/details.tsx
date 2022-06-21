import Clipboard from 'expo-clipboard';
import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { CopyFillIcon, CopyIcon } from '../../components/icon';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { useStyle } from '../../styles';
import { TransactionSectionTitle } from './components';

export const CopyIc: FunctionComponent<{
  paragraph?: string;
  onPress?: () => void;
}> = ({ paragraph, onPress }) => {
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
      <CopyFillIcon
        onPress={onPress}
        color={style.get('color-primary').color}
        size={24}
      />
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

  styleParagraph?: TextStyle;
  styleLabel?: TextStyle;
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
  styleParagraph,
  styleLabel,
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
                styleLabel,
              ])}
            >
              {label}
            </Text>
            {paragraph ? (
              <Text
                style={StyleSheet.flatten([
                  style.flatten(['body2', 'margin-top-4']),
                  styleParagraph
                    ? styleParagraph
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

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
  };
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
        <Text style={style.flatten(['h3'])}>Transaction Detail</Text>
      </View>
      <TransactionSectionTitle title={'Received token'} right={<></>} />
      <View>
        <DetailsItems
          label="From"
          topBorder={true}
          paragraph={'orai1nc752...74u9uylc'}
          right={
            <CopyIc onPress={() => handleCopyText('orai1nc752...74u9uylc')} />
          }
          styleParagraph={style.flatten(['body1'])}
          styleLabel={{
            color: '#636366',
            fontSize: 16,
          }}
        />
        <DetailsItems
          label="To"
          topBorder={true}
          paragraph={'orai1nc752...74u9322'}
          right={<CopyIc />}
          styleParagraph={style.flatten(['body1'])}
          styleLabel={{
            color: '#636366',
            fontSize: 16,
          }}
        />
        <DetailsItems
          label="Transaction hash"
          topBorder={true}
          paragraph={'051E23F9...87C52492'}
          right={<CopyIc />}
          styleParagraph={{
            color: '#4334F1',
            fontSize: 18,
            fontWeight: '400',
          }}
          styleLabel={{
            color: '#636366',
            fontSize: 16,
          }}
        />
        <DetailsItems
          label="Amount"
          topBorder={true}
          paragraph={'+125,000 ORAI'}
          styleParagraph={{
            color: '#4BB10C',
            fontSize: 18,
            fontWeight: '700',
          }}
          styleLabel={{
            color: '#636366',
            fontSize: 16,
          }}
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
          right={
            <Text
              style={{
                color: e.label == 'Result' ? '#4BB10C' : '#1C1C1E',
                fontSize: 16,
              }}
            >
              {e.content}
            </Text>
          }
          styleLabel={{
            color: '#636366',
            fontSize: 16,
          }}
        />
      ))}
      <View style={style.flatten(['height-1', 'margin-y-20'])} />
    </PageWithScrollViewInBottomTabView>
  );
};
