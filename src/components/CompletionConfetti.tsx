import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const colors = ['#F1C75B', '#78AD68', '#E8866B', '#8AA8E8', '#D98AB7'];

export function CompletionConfetti() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      {Array.from({ length: 24 }, (_, index) => {
        const column = index % 8;
        const row = Math.floor(index / 8);
        const drift = (column - 3.5) * (8 + row * 2);
        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: `${8 + column * 12}%`,
                top: -12 - row * 18,
                backgroundColor: colors[index % colors.length],
                opacity: progress.interpolate({
                  inputRange: [0, 0.12, 0.82, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 275 + row * 20],
                    }),
                  },
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, drift, -drift / 2],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${360 + index * 24}deg`],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  particle: {
    position: 'absolute',
    width: 9,
    height: 15,
    borderRadius: 2,
  },
});
