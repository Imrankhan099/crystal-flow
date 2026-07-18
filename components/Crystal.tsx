import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Defs, RadialGradient, Stop, Circle, Path, Svg } from 'react-native-svg';
import { Colors } from '../lib/theme';
import type { Crystal as CrystalT } from '../lib/types';

const COLOR_MAP: Record<CrystalT['color'], { core: string; glow: string; ring: string; edge: string }> = {
  cyan: { core: '#F0FDFF', glow: Colors.crystalCyan, ring: Colors.cyan[400], edge: '#34E0F0' },
  blue: { core: '#EEF6FF', glow: Colors.crystalBlue, ring: Colors.blue[400], edge: '#3D72F5' },
  purple: { core: '#F7F2FF', glow: Colors.crystalPurple, ring: Colors.purple[400], edge: '#9C72F0' },
};

interface Props {
  crystal: CrystalT;
  size: number;
  lit: boolean;
  isSource?: boolean;
  touched?: boolean;
}

export function Crystal({ crystal, size, lit, isSource, touched }: Props) {
  const palette = COLOR_MAP[crystal.color];
  const pulse = useSharedValue(0);
  const glowOpacity = useSharedValue(lit ? 1 : 0.35);
  const touchScale = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withTiming(lit ? 1 : 0.35, { duration: 450 });
    if (lit) {
      pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })), -1, false);
    } else { pulse.value = 0; }
  }, [lit]);

  useEffect(() => {
    if (touched) touchScale.value = withSequence(withTiming(1.18, { duration: 120, easing: Easing.out(Easing.cubic) }), withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }));
  }, [touched]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value, transform: [{ scale: 1 + pulse.value * 0.18 }] }));
  const gemStyle = useAnimatedStyle(() => ({ transform: [{ scale: touchScale.value }] }));

  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.glowWrap, glowStyle]} pointerEvents="none">
        <View style={[styles.bloom, { width: size * 1.1, height: size * 1.1, borderRadius: size * 0.55, backgroundColor: palette.glow, opacity: lit ? 0.4 : 0.18, shadowColor: palette.glow, shadowRadius: lit ? 28 : 10, shadowOpacity: lit ? 0.7 : 0.25, shadowOffset: { width: 0, height: 0 } }]} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, gemStyle]} pointerEvents="none">
        <SvgGem width={size} height={size} cx={cx} cy={cy} r={r} palette={palette} lit={lit} isSource={isSource} />
      </Animated.View>
      {crystal.kind === 'locked' && !crystal.hasKey && (
        <View style={styles.lockBadge}><View style={styles.lockInner} /></View>
      )}
      {crystal.kind === 'split' && (
        <View style={[styles.splitBadge, { borderColor: palette.edge }]} />
      )}
    </View>
  );
}

function SvgGem({ width, height, cx, cy, r, palette, lit, isSource }: { width: number; height: number; cx: number; cy: number; r: number; palette: { core: string; glow: string; ring: string; edge: string }; lit: boolean; isSource?: boolean }) {
  const id = `grad-${palette.edge.replace('#', '')}-${isSource ? 's' : 'n'}`;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="42%" r="60%">
          <Stop offset="0%" stopColor={palette.core} stopOpacity="1" />
          <Stop offset="55%" stopColor={palette.ring} stopOpacity={lit ? '0.95' : '0.55'} />
          <Stop offset="100%" stopColor={palette.edge} stopOpacity={lit ? '0.9' : '0.5'} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} stroke={palette.edge} strokeWidth={lit ? 2.2 : 1.4} />
      <Path d={`M ${cx - r * 0.5} ${cy - r * 0.55} L ${cx + r * 0.05} ${cy - r * 0.2} L ${cx - r * 0.25} ${cy + r * 0.1} Z`} fill={palette.core} opacity={lit ? 0.85 : 0.5} />
      {isSource && <Circle cx={cx} cy={cy} r={r * 0.18} fill={palette.core} opacity={0.95} />}
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glowWrap: { alignItems: 'center', justifyContent: 'center' },
  bloom: {},
  lockBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.warning[500], borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  lockInner: { width: 7, height: 5, borderRadius: 1, backgroundColor: '#fff' },
  splitBadge: { position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff', borderWidth: 2, zIndex: 5 },
});
