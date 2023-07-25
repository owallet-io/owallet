import React, { useContext } from 'react';
import { BottomSheetModalProps } from '@gorhom/bottom-sheet';
export interface ModalStateContext {
  readonly key: string;
  readonly isTransitionOpening: boolean;
  readonly isTransitionClosing: boolean;

  readonly align?: 'top' | 'center' | 'bottom';
  readonly isOpen: boolean;
  // readonly transitionVelocity?: number;
  // readonly openTransitionVelocity?: number;
  // readonly closeTransitionVelocity?: number;
  // // Acceleration based on 100
  // readonly transitionAcceleration?: number;
  // readonly disableBackdrop?: boolean;
  // readonly disableClosingOnBackdropPress?: boolean;
  // readonly transparentBackdrop?: boolean;
  // readonly backdropMaxOpacity?: number;
  // readonly blurBackdropOnIOS?: boolean;
  readonly bottomSheetModalConfig?: Omit<
    BottomSheetModalProps,
    'snapPoints' | 'children'
  >;
  readonly close: () => void;
}

export const ModalContext = React.createContext<ModalStateContext | null>({
  bottomSheetModalConfig: null,
  align: 'bottom',
  isOpen: false,
  isTransitionOpening: true,
  isTransitionClosing: false,
  key: 'key1',
  close: null
});

export const useModalState = () => {
  const state = useContext(ModalContext);
  if (!state) {
    throw new Error('You forgot to use ModalProvider');
  }

  return state;
};
