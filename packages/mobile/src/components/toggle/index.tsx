import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  View
} from 'react-native'
import { useStyle } from '../../styles'
import { spacing } from '../../themes'

export const Toggle: FunctionComponent<{
  on: boolean
  onChange(onOrOff: boolean): void
}> = ({ on, onChange }) => {
  const style = useStyle()

  const offColor = style.get('color-white').color
  const offBackgroundColor = style.get(
    'color-text-black-very-very-very-low'
  ).color
  const onColor = style.get('color-border-purple').color
  const onBackgroundColor = style.get('color-purple-10').color

  const [animatedOnValue] = useState(() => new Animated.Value(on ? 1 : 0))

  const ballLeft = useMemo(() => {
    return animatedOnValue.interpolate({
      inputRange: [0, 1],
      outputRange: Platform.OS === 'android' ? [-8, 18] : [4, 26]
    })
  }, [animatedOnValue])

  const color = useMemo(() => {
    return animatedOnValue.interpolate({
      inputRange: [0, 1],
      outputRange: [offColor, onColor]
    })
  }, [animatedOnValue, offColor, onColor])

  const backgroundColor = useMemo(() => {
    return animatedOnValue.interpolate({
      inputRange: [0, 1],
      outputRange: [offBackgroundColor, onBackgroundColor]
    })
  }, [animatedOnValue, offBackgroundColor, onBackgroundColor])

  const borderColorForAndroid = useMemo(() => {
    return animatedOnValue.interpolate({
      inputRange: [0, 1],
      outputRange: [offBackgroundColor, onColor]
    })
  }, [animatedOnValue, offBackgroundColor, onColor])

  useEffect(() => {
    if (on) {
      Animated.timing(animatedOnValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false
      }).start()
    } else {
      Animated.timing(animatedOnValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false
      }).start()
    }
  }, [animatedOnValue, on])

  if (Platform.OS === 'android') {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          onChange(!on)
        }}
      >
        <View
          style={{
            paddingVertical: spacing['6'],
            paddingHorizontal: spacing['8']
          }}
        >
          <Animated.View
            style={{
              ...styles.containerAnimated,
              position: 'relative',
              marginVertical: spacing['12'],
              width: 34,
              height: 18,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor
            }}
          >
            <Animated.View
              style={{
                ...styles.containerAnimated,
                position: 'absolute',
                borderWidth: 1,
                backgroundColor: color,
                borderColor: borderColorForAndroid,
                transform: [{ translateX: ballLeft }]
              }}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    )
  } else {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          onChange(!on)
        }}
      >
        <Animated.View
          style={{
            ...styles.containerAnimated,
            width: 54,
            height: 30,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor
          }}
        >
          <Animated.View
            style={{
              ...styles.containerAnimated,
              backgroundColor: color,
              transform: [{ translateX: ballLeft }]
            }}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  containerAnimated: {
    borderRadius: spacing['64'],
    width: spacing['24'],
    height: spacing['24'],
  }
})
