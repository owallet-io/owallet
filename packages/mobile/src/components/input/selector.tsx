import React, { FunctionComponent, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import { CText as Text } from '../text';
import { useStyle } from '../../styles';
import { registerModal } from '../../modals/base';
import { RectButton } from '../rect-button';
import { DownArrowIcon } from '../icon';
import { colors, spacing } from '../../themes';
import { useStore } from '../../stores';

export const SelectorModal: FunctionComponent<{
  items: {
    label: string;
    key: string;
  }[];
  maxItemsToShow?: number;
  selectedKey: string | undefined;
  modalPersistent?: boolean;
  setSelectedKey: (key: string | undefined) => void;
  closeModal: () => void;
}> = ({ items, selectedKey, setSelectedKey, maxItemsToShow, closeModal }) => {
  const style = useStyle();

  const renderBall = (selected: boolean) => {
    if (selected) {
      return (
        <View
          style={{
            ...style.flatten([
              'width-24',
              'height-24',
              'border-radius-32',
              'background-color-primary',
              'items-center',
              'justify-center'
            ]),
            backgroundColor: colors['purple-900']
          }}
        >
          <View
            style={style.flatten([
              'width-12',
              'height-12',
              'border-radius-32',
              'background-color-white'
            ])}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            ...style.flatten([
              'width-24',
              'height-24',
              'border-radius-32',
              'items-center',
              'justify-center'
            ]),
            backgroundColor: colors['purple-100']
          }}
        >
          <View
            style={style.flatten([
              'width-12',
              'height-12',
              'border-radius-32',
              'background-color-white'
            ])}
          />
        </View>
      );
    }
  };

  const scrollViewRef = useRef<ScrollView | null>(null);
  const initOnce = useRef<boolean>(false);

  const onInit = () => {
    if (!initOnce.current) {
      if (scrollViewRef.current) {
        scrollViewRef.current.flashScrollIndicators();

        if (maxItemsToShow) {
          const selectedIndex = items.findIndex(
            (item) => item.key === selectedKey
          );

          if (selectedIndex) {
            const scrollViewHeight = maxItemsToShow * 64;

            scrollViewRef.current.scrollTo({
              y: selectedIndex * 64 - scrollViewHeight / 2 + 32,
              animated: false
            });
          }
        }

        initOnce.current = true;
      }
    }
  };

  return (
    <View
      style={{
        ...style.flatten(['border-radius-8']),
        backgroundColor: colors['white'],
        borderRadius: 24,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors['gray-900'],
          marginBottom: spacing['12'],
        }}
      >
        Select a token
      </Text>
      <ScrollView
        style={{
          maxHeight: maxItemsToShow ? 99 * maxItemsToShow : undefined,
          width: '100%'
        }}
        ref={scrollViewRef}
        persistentScrollbar={true}
        onLayout={onInit}
      >
        {items.map((item) => {
          return (
            <RectButton
              key={item.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                backgroundColor: colors['gray-10'],
                borderRadius: 12,
                marginBottom: 16,
                width: '100%',
              }}
              onPress={async () => {
                setSelectedKey(item.key);
                await closeModal();
              }}
            >
              <Text
                style={style.flatten(['subtitle1', 'color-text-black-medium'])}
              >
                {item.label}
              </Text>
              {renderBall(item.key === selectedKey)}
            </RectButton>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const Selector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;

  label: string;
  placeHolder?: string;
  maxItemsToShow?: number;

  items: {
    label: string;
    key: string;
  }[];

  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;

  modalPersistent?: boolean;
}> = ({
  containerStyle,
  labelStyle,
  selectorContainerStyle,
  textStyle,
  label,
  maxItemsToShow,
  placeHolder,
  items,
  selectedKey,
  setSelectedKey,
  modalPersistent,
}) => {
  const selected = useMemo(() => {
    return items.find((item) => item.key === selectedKey);
  }, [items, selectedKey]);
  const { modalStore } = useStore();

  const onPress = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      <SelectorModal
        items={items}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        maxItemsToShow={maxItemsToShow}
        modalPersistent={modalPersistent}
        closeModal={() => modalStore.close()}
      />
    );
  };

  return (
    <React.Fragment>
      <SelectorButtonWithoutModal
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        selected={selected}
        onPress={onPress}
      />
    </React.Fragment>
  );
};

export const SelectorButtonWithoutModal: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;

  label: string;
  placeHolder?: string;

  selected:
    | {
        label: string;
        key: string;
      }
    | undefined;

  onPress: () => void;
}> = ({
  containerStyle,
  labelStyle,
  selectorContainerStyle,
  textStyle,
  label,
  placeHolder,
  selected,
  onPress
}) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["padding-bottom-28"]),
        containerStyle,
      ])}
    >
      <Text
        style={StyleSheet.flatten([
          style.flatten([
            "subtitle3",
            "color-text-black-medium",
            "margin-bottom-3",
          ]),
          labelStyle,
        ])}
      >
        {label}
      </Text>
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            "background-color-white",
            "padding-x-11",
            "padding-y-12",
            "border-radius-4",
            "border-width-1",
            "border-color-border-white",
          ]),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onPress={onPress}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten(
              ["body2", "color-text-black-medium", "padding-0"],
              [!selected && "color-text-black-low"]
            ),
            textStyle,
          ])}
        >
          {selected ? selected.label : placeHolder ?? ""}
        </Text>
      </RectButton>
    </View>
  );
};
