import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@src/components/spinner';
import { colors } from '@src/themes';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

const LoadingScreenOverlay = ({ isOpen }: { isOpen: boolean }) => {
  const [doneFadeOut, setDoneFadeOut] = useState(false);
  const fadeValue = useSharedValue(1);
  const fadeAnimStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value
  }));

  const handleFadeOut = () => {
    fadeValue.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onAnimationFinish)();
    });
  };
  const onAnimationFinish = () => {
    // Action to be executed after animation finishes
    setDoneFadeOut(true);
    fadeValue.value = 1;
  };

  useEffect(() => {
    setDoneFadeOut(false);
    if (!isOpen) {
      handleFadeOut();
      return;
    }

    return () => cancelAnimation(fadeValue);
  }, [isOpen]);
  if (doneFadeOut) return null;
  return (
    <Animated.View style={[styles.container, fadeAnimStyle]}>
      <LoadingSpinner color={colors['primary-surface-default']} size={25} />
    </Animated.View>
  );
};

export default LoadingScreenOverlay;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
