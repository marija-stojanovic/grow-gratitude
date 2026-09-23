import { sunflowerImageFor } from '../src/components/SunflowerIllustration';

const witheredSources = {
  sprout: require('../src/assets/plants/sunflower/withered-sprout.png'),
  small: require('../src/assets/plants/sunflower/withered-small.png'),
  medium: require('../src/assets/plants/sunflower/withered-medium.png'),
  large: require('../src/assets/plants/sunflower/withered-large.png'),
  'almost-grown': require('../src/assets/plants/sunflower/withered-almost-grown.png'),
};

test.each(['sprout', 'small', 'medium', 'large', 'almost-grown'] as const)(
  'uvenula faza %s koristi odgovarajuću sliku',
  stage => {
    expect(sunflowerImageFor('withered', stage)).toBe(witheredSources[stage]);
  },
);

test('završena biljka koristi potpuno odrasli suncokret', () => {
  expect(sunflowerImageFor('fully-grown', null)).toBe(
    require('../src/assets/plants/sunflower/fully-grown.png'),
  );
});
