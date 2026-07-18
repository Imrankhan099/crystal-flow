import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows } from '../lib/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  radius?: number;
  glow?: boolean;
}

export function GlassCard({ children, style, intensity = 40, radius = Radius.lg, glow }: GlassCardProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webGlass, { borderRadius: radius, shadowColor: Colors.glassShadow }, glow && styles.glow, style]}>
        {children}
      </View>
    );
  }
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, glow && styles.glow, style]}>
      <BlurView intensity={intensity} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
      <View style={[styles.border, { borderRadius: radius }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  border: { borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden' },
  webGlass: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Platform.select({ ios: Shadows.card, android: Shadows.card, default: {} }),
  } as ViewStyle,
  glow: {
    shadowColor: Colors.crystalCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 0,
  },
});
