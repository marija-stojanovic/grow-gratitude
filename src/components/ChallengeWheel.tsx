import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Text as SvgText,
} from 'react-native-svg';
import type { Challenge } from '../types';

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 141;

export function ChallengeWheel({ challenges }: { challenges: Challenge[] }) {
  const sliceAngle = 360 / challenges.length;

  return (
    <View accessibilityLabel={`Točak sa ${challenges.length} aktivnih izazova`} style={styles.frame}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <G>
          {challenges.map((challenge, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const middleAngle = startAngle + sliceAngle / 2;
            const labelPoint = polarPoint(CENTER, CENTER, RADIUS * 0.61, middleAngle);

            return (
              <G key={challenge.id}>
                <Path
                  d={wedgePath(CENTER, CENTER, RADIUS, startAngle, endAngle)}
                  fill={index % 2 === 0 ? '#86B96E' : '#F1CE62'}
                  stroke="#F8F3D9"
                  strokeWidth={2}
                />
                <SvgText
                  x={labelPoint.x}
                  y={labelPoint.y}
                  fill="#24412B"
                  fontSize={challenges.length > 14 ? 15 : 20}
                  fontWeight="700"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {index + 1}
                </SvgText>
              </G>
            );
          })}

          {challenges.map((challenge, index) => {
            const edge = polarPoint(CENTER, CENTER, RADIUS, index * sliceAngle);
            return (
              <Line
                key={`${challenge.id}-line`}
                x1={CENTER}
                y1={CENTER}
                x2={edge.x}
                y2={edge.y}
                stroke="#F8F3D9"
                strokeWidth={1.5}
              />
            );
          })}

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={37}
            fill="#376A43"
            stroke="#F8F3D9"
            strokeWidth={4}
          />
          <SvgText
            x={CENTER}
            y={CENTER - 6}
            fill="#FFFFFF"
            fontSize={19}
            fontWeight="700"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ✦
          </SvgText>
          <SvgText
            x={CENTER}
            y={CENTER + 15}
            fill="#FFFFFF"
            fontSize={11}
            fontWeight="700"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ZAVRTI
          </SvgText>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#4F764B"
            strokeWidth={5}
          />
        </G>
      </Svg>
    </View>
  );
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function wedgePath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 1,
  },
});
