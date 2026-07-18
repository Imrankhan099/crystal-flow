import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Star } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Radius, Typography, Spacing } from '@/lib/theme';
import { usePlayer } from '@/components/PlayerProvider';

const CHAPTERS = [
  { name: 'Awakening', range: [1, 10], mechanic: 'Split Crystals' },
  { name: 'Reflection', range: [11, 20], mechanic: 'Rotating Mirrors' },
  { name: 'Warp', range: [21, 30], mechanic: 'Teleport Portals' },
  { name: 'Sealed', range: [31, 40], mechanic: 'Locked Crystals' },
  { name: 'Prism', range: [41, 50], mechanic: 'Color Filters' },
  { name: 'Surge', range: [51, 60], mechanic: 'Energy Amplifiers' },
  { name: 'Drift', range: [61, 70], mechanic: 'Moving Blockers' },
  { name: 'Tempo', range: [71, 80], mechanic: 'Time Challenge' },
  { name: 'Switch', range: [81, 90], mechanic: 'Switch Gates' },
  { name: 'Master', range: [91, 100], mechanic: 'Combine All' },
];

export default function LevelsScreen() {
  const router = useRouter();
  const { player } = usePlayer();

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Levels</Text>
      <Text style={styles.subtitle}>100 handcrafted puzzles · endless procedural</Text>

      {CHAPTERS.map((ch) => {
        const levels = [];
        for (let i = ch.range[0]; i <= ch.range[1]; i++) levels.push(i);
        return (
          <View key={ch.name} style={styles.chapter}>
            <View style={styles.chapterHeader}>
              <View>
                <Text style={styles.chapterName}>{ch.name}</Text>
                <Text style={styles.chapterMech}>{ch.mechanic}</Text>
              </View>
              <Text style={styles.chapterRange}>{ch.range[0]}–{ch.range[1]}</Text>
            </View>
            <View style={styles.grid}>
              {levels.map((id) => {
                const locked = id > player.storyProgress;
                const completed = id < player.storyProgress;
                return (
                  <Pressable key={id} disabled={locked} onPress={() => router.push(`/play/${id}`)} style={({ pressed }) => [pressed && styles.pressed]}>
                    <GlassCard style={[styles.levelCard, locked && styles.lockedCard]} radius={Radius.md}>
                      <Text style={[styles.levelNum, locked && styles.lockedText]}>{id}</Text>
                      {locked ? <Lock size={14} color={Colors.textTertiary} /> : completed ? <Star size={14} color={Colors.warning[500]} fill={Colors.warning[500]} /> : <View style={styles.dot} />}
                    </GlassCard>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={styles.chapter}>
        <View style={styles.chapterHeader}>
          <View>
            <Text style={styles.chapterName}>Endless</Text>
            <Text style={styles.chapterMech}>Procedural · unlimited</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push(`/play/${player.storyProgress + 50}`)} style={({ pressed }) => [pressed && styles.pressed]}>
          <GlassCard style={styles.endlessCard} radius={Radius.lg}>
            <Text style={styles.endlessTitle}>Play Endless</Text>
            <Text style={styles.endlessSub}>Fresh procedural puzzles, forever</Text>
          </GlassCard>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg, paddingBottom: 100 },
  title: { ...Typography.hero, color: Colors.textPrimary },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary, fontFamily: 'Inter-Medium', marginTop: -8 },
  chapter: { gap: 12 },
  chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  chapterName: { ...Typography.h2, color: Colors.textPrimary },
  chapterMech: { ...Typography.bodySmall, color: Colors.textSecondary, fontFamily: 'Inter-Medium' },
  chapterRange: { ...Typography.bodySmall, color: Colors.textTertiary, fontFamily: 'Inter-SemiBold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  levelCard: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', gap: 2 },
  lockedCard: { opacity: 0.5 },
  levelNum: { ...Typography.h3, color: Colors.textPrimary, fontFamily: 'Inter-Bold' },
  lockedText: { color: Colors.textTertiary },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.blue[400] },
  endlessCard: { padding: 20, alignItems: 'center' },
  endlessTitle: { ...Typography.h2, color: Colors.purple[500] },
  endlessSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
});
