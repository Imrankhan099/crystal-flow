import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, type Gradient } from '@/lib/theme';

export function GradientBackground({ variant = 'bg', children }: { variant?: 'bg' | 'hero'; children: React.ReactNode }) {
  const colors = (variant === 'hero' ? Gradients.backgroundHero : Gradients.background) as Gradient;
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
