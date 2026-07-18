import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Radius, Colors } from '../lib/theme';

type Variant = 'primary' | 'cyan' | 'purple' | 'ghost' | 'success';
type Size = 'md' | 'lg' | 'sm';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', disabled, loading, style, icon }: Props) {
  const grad = variant === 'primary' ? Gradients.primary : variant === 'cyan' ? Gradients.cyanBlue : variant === 'purple' ? Gradients.purpleCyan : variant === 'success' ? Gradients.success : null;
  const pad = size === 'lg' ? { paddingVertical: 18, paddingHorizontal: 28 } : size === 'sm' ? { paddingVertical: 10, paddingHorizontal: 16 } : { paddingVertical: 14, paddingHorizontal: 22 };
  const fontSize = size === 'lg' ? 17 : size === 'sm' ? 13 : 15;

  if (variant === 'ghost') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.ghost, pad, pressed && styles.pressed, disabled && styles.disabled, style]}>
        {icon}
        <Text style={[styles.ghostText, { fontSize }]}>{title}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.wrap, pressed && styles.pressed, disabled && styles.disabled, style]}>
      <LinearGradient colors={grad!} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.grad, pad]}>
        {loading ? <ActivityIndicator color="#fff" /> : (<>{icon}<Text style={[styles.text, { fontSize }]}>{title}</Text></>)}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.lg, overflow: 'hidden' },
  grad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.lg },
  text: { color: '#fff', fontFamily: 'Inter-SemiBold', letterSpacing: 0.2 },
  ghost: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: Colors.glassBorder },
  ghostText: { color: Colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  disabled: { opacity: 0.5 },
});
