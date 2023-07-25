import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { Keyboard, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyle } from '../../styles';

import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints
} from '@gorhom/bottom-sheet';
import { BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { useTheme } from '@src/themes/theme-provider';
export interface ModalBaseProps {
  align?: 'top' | 'center' | 'bottom';
  isOpen: boolean;
  onOpenTransitionEnd?: () => void;
  onCloseTransitionEnd?: () => void;
  close?: () => void;
  containerStyle?: ViewStyle;
  disableSafeArea?: boolean;
  bottomSheetModalConfig?: Omit<
    BottomSheetModalProps,
    'snapPoints' | 'children'
  >;
}

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  children,
  align = 'bottom',
  isOpen,
  onOpenTransitionEnd,
  onCloseTransitionEnd,
  containerStyle,
  disableSafeArea,
  close,
  bottomSheetModalConfig
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (openTransitionRef.current && index > 0) {
      openTransitionRef.current();
    }
  }, []);

  const style = useStyle();

  const openTransitionRef = useRef(onOpenTransitionEnd);
  openTransitionRef.current = onOpenTransitionEnd;
  const closeTransitionRef = useRef(onCloseTransitionEnd);
  closeTransitionRef.current = onCloseTransitionEnd;
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    }
    if (bottomSheetModalRef.current.dismiss) {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={'close'}
      />
    ),
    []
  );
  const handleDismiss = useCallback(() => {
    if (closeRef.current) {
      closeRef.current();
      Keyboard.dismiss();
    }
    if (closeTransitionRef.current) {
      closeTransitionRef.current();
    }
  }, []);
  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);
  const { colors } = useTheme();
  return (
    <View
      style={style.flatten(['absolute-fill', 'overflow-visible'])}
      pointerEvents="box-none"
    >
      {!disableSafeArea ? (
        <SafeAreaView
          style={style.flatten(
            ['flex-1', 'overflow-visible'],
            [
              align === 'center' && 'justify-center',
              align === 'top' && 'justify-start',
              align === 'bottom' && 'justify-end'
            ]
          )}
          pointerEvents="box-none"
        >
          <BottomSheetModal
            {...bottomSheetModalConfig}
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
            keyboardBlurBehavior={'restore'}
            onDismiss={handleDismiss}
            android_keyboardInputMode="adjustResize"
          >
            <View style={containerStyle} onLayout={handleContentLayout}>
              {children}
            </View>
          </BottomSheetModal>
        </SafeAreaView>
      ) : (
        <View
          style={style.flatten(
            ['flex-1', 'overflow-visible'],
            [
              align === 'center' && 'justify-center',
              align === 'top' && 'justify-start',
              align === 'bottom' && 'justify-end'
            ]
          )}
          pointerEvents="box-none"
        >
          <BottomSheetModal
            {...bottomSheetModalConfig}
            ref={bottomSheetModalRef}
            backgroundStyle={{
              backgroundColor: colors['background-box']
            }}
            handleIndicatorStyle={{
              backgroundColor: colors['title-modal-login-failed'],
              width: 50
            }}
            index={0}
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
            keyboardBlurBehavior={'restore'}
            onDismiss={handleDismiss}
            android_keyboardInputMode="adjustResize"
          >
            <View style={containerStyle} onLayout={handleContentLayout}>
              {children}
            </View>
          </BottomSheetModal>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey'
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center'
  }
});
