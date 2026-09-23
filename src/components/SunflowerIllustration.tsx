import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { PlantGrowthStage } from '../types';

type HealthyStage = Exclude<PlantGrowthStage, 'withered'>;

const healthyImages = {
  seed: require('../assets/plants/sunflower/seed.png'),
  sprout: require('../assets/plants/sunflower/sprout.png'),
  small: require('../assets/plants/sunflower/small.png'),
  medium: require('../assets/plants/sunflower/medium.png'),
  large: require('../assets/plants/sunflower/large.png'),
  'almost-grown': require('../assets/plants/sunflower/almost-grown.png'),
  'fully-grown': require('../assets/plants/sunflower/fully-grown.png'),
} as const;

const witheredImages: Partial<Record<HealthyStage, number>> = {
  sprout: require('../assets/plants/sunflower/withered-sprout.png'),
  small: require('../assets/plants/sunflower/withered-small.png'),
  medium: require('../assets/plants/sunflower/withered-medium.png'),
  large: require('../assets/plants/sunflower/withered-large.png'),
  'almost-grown': require('../assets/plants/sunflower/withered-almost-grown.png'),
};

export function sunflowerImageFor(
  stage: PlantGrowthStage,
  witheredFromStage: PlantGrowthStage | null,
): number {
  if (stage !== 'withered') {
    return healthyImages[stage];
  }
  if (witheredFromStage && witheredFromStage !== 'withered') {
    return witheredImages[witheredFromStage] ?? healthyImages.seed;
  }
  return healthyImages.seed;
}

export function SunflowerIllustration({
  stage,
  witheredFromStage = null,
  watering = false,
  animationKey = 0,
}: {
  stage: PlantGrowthStage;
  witheredFromStage?: PlantGrowthStage | null;
  watering?: boolean;
  animationKey?: number;
}) {
  const appearance = useRef(new Animated.Value(1)).current;
  const grow = useRef(new Animated.Value(1)).current;
  const dropProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    appearance.setValue(0);
    grow.setValue(stage === 'withered' ? 1.04 : 0.94);
    const transition = Animated.parallel([
      Animated.timing(appearance, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(grow, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
    ]);
    transition.start();
    return () => transition.stop();
  }, [appearance, grow, stage, witheredFromStage, animationKey]);

  useEffect(() => {
    if (!watering) {
      dropProgress.setValue(0);
      return;
    }
    const drops = Animated.loop(
      Animated.timing(dropProgress, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
    );
    drops.start();
    return () => drops.stop();
  }, [dropProgress, watering]);

  const imageAnimatedStyle = {
    opacity: appearance,
    transform: [{ scale: grow }],
  };
  const dropAnimatedStyle = {
    opacity: dropProgress.interpolate({
      inputRange: [0, 0.15, 0.85, 1],
      outputRange: [0, 1, 1, 0],
    }),
    transform: [
      {
        translateY: dropProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 115],
        }),
      },
    ],
  };

  return (
    <View style={styles.frame}>
      <Animated.Image
        accessibilityLabel={
          stage === 'withered' ? 'Uvenuli suncokret' : 'Suncokret u fazi rasta'
        }
        source={sunflowerImageFor(stage, witheredFromStage)}
        resizeMode="contain"
        style={[styles.image, imageAnimatedStyle]}
      />
      {watering ? (
        <Animated.Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[styles.drop, dropAnimatedStyle]}
        >
          💧
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    height: 260,
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  drop: {
    position: 'absolute',
    top: 22,
    right: '35%',
    fontSize: 30,
  },
});
