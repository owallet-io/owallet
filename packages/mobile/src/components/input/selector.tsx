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
import { colors, spacing, typography } from '../../themes';

export const SelectorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  items: {
    label: string;
    key: string;
  }[];
  maxItemsToShow?: number;
  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;
  modalPersistent?: boolean;
}> = registerModal(
  ({
    close,
    items,
    selectedKey,
    setSelectedKey,
    maxItemsToShow,
    modalPersistent
  }) => {
    const style = useStyle();

    const renderBall = (selected: boolean) => {
      if (selected) {
        return (
          <View
            style={{
              ...styles.ball,
              backgroundColor: colors['purple-900']
            }}
          >
            <View
              style={{
                height: spacing['12'],
                width: spacing['12'],
                borderRadius: spacing['32'],
                backgroundColor: colors['white']
              }}
            />
          </View>
        );
      } else {
        return (
          <View
            style={{
              ...styles.ball,
              backgroundColor: colors['gray-100']
            }}
          >
            <View
              style={{
                height: spacing['12'],
                width: spacing['12'],
                borderRadius: spacing['32'],
                backgroundColor: colors['white']
              }}
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
              item => item.key === selectedKey
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
      <View>
        <View
          style={{
            borderRadius: spacing['8'],
            overflow: 'hidden',
            backgroundColor: colors['white'],
            paddingVertical: spacing['16']
          }}
        >
          <ScrollView
            style={{
              maxHeight: maxItemsToShow ? 64 * maxItemsToShow : undefined,
              paddingHorizontal: spacing['24']
            }}
            ref={scrollViewRef}
            persistentScrollbar={true}
            onLayout={onInit}
          >
            {items.map(item => {
              return (
                <View
                  style={{
                    backgroundColor: colors['gray-100'],
                    borderRadius: spacing['12'],
                    marginTop: spacing['8'],
                    marginBottom: spacing['8'],
                    paddingHorizontal: spacing['18']
                  }}
                >
                  <RectButton
                    key={item.key}
                    style={{
                      height: 64,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onPress={() => {
                      setSelectedKey(item.key);
                      if (!modalPersistent) {
                        close();
                      }
                    }}
                  >
                    <Text style={{ ...styles.label }}>{item.label}</Text>
                    {renderBall(item.key === selectedKey)}
                  </RectButton>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }
);

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
  modalPersistent
}) => {
  const selected = useMemo(() => {
    return items.find(item => item.key === selectedKey);
  }, [items, selectedKey]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <React.Fragment>
      <SelectorModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        items={items}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        maxItemsToShow={maxItemsToShow}
        modalPersistent={modalPersistent}
      />
      <SelectorButtonWithoutModal
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        selected={selected}
        onPress={() => setIsModalOpen(true)}
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
        style.flatten(['padding-bottom-28']),
        containerStyle
      ])}
    >
      <Text
        style={StyleSheet.flatten([
          style.flatten([
            'subtitle3',
            'color-text-black-medium',
            'margin-bottom-3'
          ]),
          labelStyle
        ])}
      >
        {label}
      </Text>
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'background-color-white',
            'padding-x-11',
            'padding-y-12',
            'border-radius-4',
            'border-width-1',
            'border-color-border-white'
          ]),
          selectorContainerStyle
        ])}
        onPress={onPress}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten(
              ['body2', 'color-text-black-medium', 'padding-0'],
              [!selected && 'color-text-black-low']
            ),
            textStyle
          ])}
        >
          {selected ? selected.label : placeHolder ?? ''}
        </Text>
      </RectButton>
    </View>
  );
};

const styles = StyleSheet.create({
  ball: {
    width: spacing['24'],
    height: spacing['24'],
    borderRadius: spacing['32'],
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    ...typography.h5,
    fontWeight: '700',
    color: colors['gray-900']
  }
});
