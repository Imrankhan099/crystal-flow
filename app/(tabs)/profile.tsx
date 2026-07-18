import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { Crystal } from '@/components/Crystal';
import { Colors, Radius, Typography, Spacing } from '@/lib/theme';
import { usePlayer } from '@/components/PlayerProvider';
import { xpForLevel } from '@/lib/storage';

const ACHIEVEMENTS = [
  { id: 'first', name: 'First Light', desc: 'Solve your first puzzle' },
  { id: 'streak7', name: 'Week Flow', desc: '7-day login streak' },
  { id: 'stars50', name: 'Star Collector', desc: 'Earn 50 stars' },
  { id: 'perfect10', name: 'Flawless', desc: '10 perfect solves' },
  { id: 'level50', name: 'Deep Flow', desc: 'Reach level 50' },
  { id: 'endless', name: 'Endless', desc: 'Play an endless level' },
];

export default function ProfileScreen() {
  const { player, reset } = usePlayer();
  const xpNeeded = xpForLevel(player.level);
  const xpPct = Math.min(100, (player.xp / xpNeeded) * 100);

  const unlockedAch = ACHIEVEMENTS.filter((a) => {
    if (a.id === 'first') return player.stats.puzzlesSolved >= 1;
    if (a.id === 'streak7') return player.loginStreak >= 7;
    if (a.id === 'stars50') return player.stats.totalStars >= 50;
    if (a.id === 'perfect10') return player.stats.perfectSolves >= 10;
    if (a.id === 'level50') return player.storyProgress >= 50;
    if (a.id === 'endless') return player.storyProgress > 100;
    return false;
  });
  const lockedAch = ACHIEVEMENTS.filter((a) => !unlockedAch.find((u) => u.id === a.id));

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Crystal crystal={{ id: 'p', cell: { r: 0, c: 0 }, kind: 'source', color: 'purple', lit: true }} size={88} lit isSource />
        <Text style={styles.name}>Crystal Master</Text>
        <Text style={styles.level}>Level {player.level}</Text>
      </View>

      <GlassCard style={styles.xpCard} radius={Radius.lg}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>Experience</Text>
          <Text style={styles.xpValue}>{player.xp} / {xpNeeded}</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
        </View>
      </GlassCard>

      <View style={styles.statsGrid}>
        <StatBox label="Coins" value={player.coins} color={Colors.warning[500]} />
        <StatBox label="Diamonds" value={player.diamonds} color={Colors.purple[500]} />
        <StatBox label="Stars" value={player.stars} color={Colors.cyan[500]} />
        <StatBox label="Streak" value={player.loginStreak} color={Colors.success[500]} />
        <StatBox label="Solved" value={player.stats.puzzlesSolved} color={Colors.blue[500]} />
        <StatBox label="Perfect" value={player.stats.perfectSolves} color={Colors.purple[400]} />
      </View>

      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achGrid}>
        {unlockedAch.map((a) => (
          <GlassCard key={a.id} style={styles.achCard} radius={Radius.md}>
            <Text style={styles.achName}>{a.name}</Text>
            <Text style={styles.achDesc}>{a.desc}</Text>
            <Text style={styles.achBadge}>Unlocked</Text>
          </GlassCard>
        ))}
        {lockedAch.map((a) => (
          <GlassCard key={a.id} style={[styles.achCard, styles.achLocked]} radius={Radius.md}>
            <Text style={[styles.achName, { color: Colors.textTertiary }]}>{a.name}</Text>
            <Text style={styles.achDesc}>{a.desc}</Text>
          </GlassCard>
        ))}
      </View>

      <Button title="Reset Progress" variant="ghost" size="sm" onPress={() => reset()} style={styles.resetBtn} />
    </ScrollView>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <GlassCard style={styles.statBox} radius={Radius.md}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg, paddingBottom: 100 },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  name: { ...Typography.h1, color: Colors.textPrimary },
  level: { ...Typography.h3, color: Colors.purple[500], fontFamily: 'Inter-SemiBold' },
  xpCard: { padding: 18, gap: 12 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { ...Typography.bodySmall, color: Colors.textSecondary, fontFamily: 'Inter-Medium' },
  xpValue: { ...Typography.bodySmall, color: Colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  xpTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(120,140,190,0.15)', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.purple[400] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: { width: '31%', flexGrow: 1, padding: 14, alignItems: 'center' },
  statValue: { ...Typography.number, fontSize: 24 },
  statLabel: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, paddingHorizontal: 4 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achCard: { width: '48%', flexGrow: 1, padding: 14, gap: 4 },
  achLocked: { opacity: 0.55 },
  achName: { ...Typography.h3, color: Colors.textPrimary, fontSize: 15 },
  achDesc: { ...Typography.bodySmall, color: Colors.textSecondary },
  achBadge: { ...Typography.caption, color: Colors.success[500], marginTop: 4, fontFamily: 'Inter-SemiBold' },
  resetBtn: { marginTop: 8 },
});
