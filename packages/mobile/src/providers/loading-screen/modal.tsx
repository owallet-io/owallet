import React, { FunctionComponent, useEffect, useRef } from "react";
import { registerModal, useModalState } from "../../modals/base";
import { LoadingSpinner } from "../../components/spinner";
import { View } from "react-native";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { metrics } from "@src/themes";
export const LoadingScreenModal: FunctionComponent<{
  isOpen: boolean;
  close?: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingSpinner size={30} color="white" />
      </View>
    );
  },
  {
    align: "center",
    containerStyle: {
      height: metrics.screenHeight,
      justifyContent: "center",
    },
  }
);
