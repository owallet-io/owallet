import React, { FunctionComponent, PropsWithChildren } from "react";
import { registerModal } from "../v2";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useModalBase } from "../v2/provider";
import Reanimated, {
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";
import { useStyle } from "@src/styles";
import { useTheme } from "@src/themes/theme-provider";

type CardBaseModalOption = {
  disabledSafeArea?: boolean;
  isDetached?: boolean;
  disableGesture?: boolean;
};

export const registerCardModal: <P>(
  element: React.ElementType<P>,
  options?: CardBaseModalOption
) => FunctionComponent<
  P & {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }
> = (element, options = {}) => {
  return registerModal(element, {
    align: "bottom",
    container: CardModalBase,
    containerProps: {
      options,
    },
  });
};

export const CardModalBase: FunctionComponent<
  PropsWithChildren<{
    options?: CardBaseModalOption;
  }>
> = ({ children, options }) => {
  const safeAreaInsets = useSafeAreaInsets();

  const style = useStyle();
  const { colors } = useTheme();
  const {
    translateY,
    duringModalTransition,
    detachModal,
    closeModalWithTransitionDelegate,
    layoutHeightShared,
  } = useModalBase();

  const touchStartPosition = useSharedValue<number | null>(null);
  const lastTranslateY = useSharedValue<number | null>(null);
  const velocity1 = useSharedValue<number>(0);
  const velocity2 = useSharedValue<number>(0);
  const velocity3 = useSharedValue<number>(0);
  const velocityI = useSharedValue<number>(0);
  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      if (options?.disableGesture) {
        return;
      }

      touchStartPosition.value = e.absoluteY;
    })
    .onUpdate((e) => {
      if (options?.disableGesture) {
        return;
      }

      if (duringModalTransition.value === "close") {
        return;
      }

      if (touchStartPosition.value != null) {
        const diff = e.absoluteY - touchStartPosition.value;
        if (diff > 10) {
          if (lastTranslateY.value == null && translateY.value != null) {
            lastTranslateY.value = translateY.value;
          }
        }
        if (lastTranslateY.value != null) {
          switch (velocityI.value) {
            case 0:
              velocity1.value = e.velocityY;
              break;
            case 1:
              velocity2.value = e.velocityY;
              break;
            case 2:
              velocity3.value = e.velocityY;
              break;
          }
          velocityI.value = (velocityI.value + 1) % 3;

          translateY.value = lastTranslateY.value + diff;

          translateY.value = Math.max(0, translateY.value);
        }
      }
    })
    .onFinalize((e) => {
      if (options?.disableGesture) {
        return;
      }

      if (duringModalTransition.value === "close") {
        return;
      }

      const velocity =
        (velocity1.value + velocity2.value + velocity3.value) / 3;

      if (
        layoutHeightShared.value != null &&
        touchStartPosition.value != null &&
        e.absoluteY > touchStartPosition.value &&
        (velocity > 800 ||
          (layoutHeightShared.value -
            (e.absoluteY - touchStartPosition.value)) /
            layoutHeightShared.value <=
            2 / 5)
      ) {
        runOnJS(closeModalWithTransitionDelegate)();
        duringModalTransition.value = "close";
        translateY.value = withDecay(
          {
            velocity: Math.max(800, velocity),
            clamp: [0, layoutHeightShared.value],
            deceleration: 1,
          },
          (finished) => {
            if (finished) {
              duringModalTransition.value = "not";
              runOnJS(detachModal)();
            }
          }
        );
      } else {
        translateY.value = withDecay(
          {
            velocity: Math.min(-1300, velocity),
            clamp: [0, 9999999],
            deceleration: 1,
          },
          (finished) => {
            if (finished) {
              duringModalTransition.value = "not";
            }
          }
        );
      }

      touchStartPosition.value = null;
      lastTranslateY.value = null;

      velocity1.value = 0;
      velocity2.value = 0;
      velocity3.value = 0;
      velocityI.value = 0;
    });

  const keyboard = (() => {
    if (Platform.OS === "ios") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useAnimatedKeyboard();
    } else {
      return {
        height: {
          value: 0,
        },
      };
    }
  })();

  const backgroundColor = colors["neutral-surface-card"];
  const innerContainerStyle = useAnimatedStyle(() => {
    if (options?.isDetached) {
      return {
        marginBottom: safeAreaInsets.bottom + 20,
        marginHorizontal: 12,
        borderRadius: 8,
        backgroundColor: backgroundColor,
      };
    }
    return {
      paddingBottom:
        Math.max(
          (options?.disabledSafeArea ? 0 : safeAreaInsets.bottom) -
            keyboard.height.value,
          0
        ) + keyboard.height.value,

      backgroundColor: backgroundColor,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Reanimated.View style={innerContainerStyle}>
        {!options?.isDetached ? (
          <View
            style={style.flatten([
              "items-center",
              "padding-top-10",
              "padding-bottom-12",
            ])}
          >
            <View
              style={{
                width: 58,
                height: 5,
                borderRadius: 9999,
                backgroundColor: colors["neutral-surface-card"],
              }}
            />
          </View>
        ) : null}

        {children}
      </Reanimated.View>
    </GestureDetector>
  );
};
