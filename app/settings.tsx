import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Volume2, Vibrate, RotateCcw, Info, Star } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { Colors, Radius, Typography, Spacing } from '@/lib/theme';
import { usePlayer } from '@/components/PlayerProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { player, update, reset } = usePlayer();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <GlassCard style={styles.group} radius={Radius.lg}>
          <Row icon={<Volume2 size={20} color={Colors.blue[500]} strokeWidth={2.2} />} label="Sound Effects">
            <Switch value={player.soundEnabled ?? true} onValueChange={(v) => update((p) => ({ ...p, soundEnabled: v }))} trackColor={{ false: 'rgba(120,140,190,0.2)', true: Colors.blue[400] }} thumbColor="#fff" />
          </Row>
          <Divider />
          <Row icon={<Vibrate size={20} color={Colors.purple[500]} strokeWidth={2.2} />} label="Haptic Feedback">
            <Switch value={player.hapticsEnabled ?? true} onValueChange={(v) => update((p) => ({ ...p, hapticsEnabled: v }))} trackColor={{ false: 'rgba(120,140,190,0.2)', true: Colors.purple[400] }} thumbColor="#fff" />
          </Row>
        </GlassCard>

        <Text style={styles.sectionTitle}>Progress</Text>
        <GlassCard style={styles.group} radius={Radius.lg}>
          <Pressable onPress={() => router.push('/(tabs)/profile')} style={({ pressed }) => [pressed && styles.pressed]}>
            <Row icon={<Star size={20} color={Colors.warning[500]} strokeWidth={2.2} />} label="View Profile & Stats" chevron />
          </Pressable>
          <Divider />
          <Pressable onPress={() => { reset(); }} style={({ pressed }) => [pressed && styles.pressed]}>
            <Row icon={<RotateCcw size={20} color={Colors.error[500]} strokeWidth={2.2} />} label="Reset All Progress" labelColor={Colors.error[500]} chevron />
          </Pressable>
        </GlassCard>

        <Text style={styles.sectionTitle}>About</Text>
        <GlassCard style={styles.group} radius={Radius.lg}>
          <Row icon={<Info size={20} color={Colors.cyan[500]} strokeWidth={2.2} />} label="Crystal Flow">
            <Text style={styles.version}>v1.0.0</Text>
          </Row>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>A premium puzzle experience.</Text>
          <Text style={styles.footerSub}>Draw the flow. Light every crystal.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ icon, label, children, chevron, labelColor }: { icon: React.ReactNode; label: string; children?: React.ReactNode; chevron?: boolean; labelColor?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : null]} numberOfLines={1}>{label}</Text>
      {children}
      {chevron && <Text style={styles.chev}>›</Text>}
    </View>
  );
}

function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.h1, color: Colors.textPrimary },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 100 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, paddingHorizontal: 4 },
  group: { paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { ...Typography.h3, color: Colors.textPrimary, flex: 1, fontSize: 16 },
  chev: { fontSize: 22, color: Colors.textTertiary },
  version: { ...Typography.bodySmall, color: Colors.textTertiary, fontFamily: 'Inter-SemiBold' },
  divider: { height: 1, backgroundColor: 'rgba(120,140,190,0.12)', marginHorizontal: 16 },
  footer: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
  footerText: { ...Typography.bodySmall, color: Colors.textSecondary, fontFamily: 'Inter-Medium' },
  footerSub: { ...Typography.caption, color: Colors.textTertiary },
  pressed: { opacity: 0.7 },
});
