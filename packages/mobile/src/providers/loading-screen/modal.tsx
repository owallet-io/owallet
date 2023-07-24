import React, { FunctionComponent, useEffect, useRef } from 'react';
import { registerModal, useModalState } from '../../modals/base';
import { LoadingSpinner } from '../../components/spinner';
import { View } from 'react-native';
import { BottomSheetModalProps } from '@gorhom/bottom-sheet';
export const LoadingScreenModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<
    BottomSheetModalProps,
    'snapPoints' | 'children'
  >;
  onOpenComplete?: () => void;
}> = registerModal(
  ({ onOpenComplete }) => {

    const onOpenCompleteRef = useRef(onOpenComplete);
    onOpenCompleteRef.current = onOpenComplete;

    const modal = useModalState();
    useEffect(() => {
      if (!modal.isTransitionOpening) {
        if (onOpenCompleteRef.current) {
          onOpenCompleteRef.current();
        }
      }
    }, [modal.isTransitionOpening]);

    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingSpinner size={30} color="white" />
      </View>
    );
  },
  {
    align: 'center',
    transitionVelocity: 0,
    backdropMaxOpacity: 1
  }
);
