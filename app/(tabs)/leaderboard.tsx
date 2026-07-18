import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Radius, Typography, Spacing } from '@/lib/theme';
import { usePlayer } from '@/components/PlayerProvider';

const RIVALS = [
  { name: 'Aurora', stars: 1240 }, { name: 'Lumen', stars: 980 },
  { name: 'Prism', stars: 760 }, { name: 'Echo', stars: 540 },
  { name: 'Nova', stars: 320 }, { name: 'Glow', stars: 210 },
  { name: 'Shimmer', stars: 150 },
];

export default function LeaderboardScreen() {
  const { player } = usePlayer();
  const entries = [...RIVALS, { name: 'You', stars: player.stats.totalStars, you: true }].sort((a, b) => b.stars - a.stars);
  const myRank = entries.findIndex((e) => (e as any).you) + 1;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Weekly Tournament</Text>
      <Text style={styles.subtitle}>Resets in 3 days · top 3 earn diamonds</Text>

      <GlassCard style={styles.myCard} radius={Radius.lg} glow>
        <View style={styles.myRow}>
          <Text style={styles.rankNum}>#{myRank}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.myName}>You</Text>
            <Text style={styles.mySub}>{player.stats.totalStars} stars this week</Text>
          </View>
          <View style={styles.prizeBadge}><Text style={styles.prizeText}>{myRank <= 3 ? '🏆' : `${myRank}`}</Text></View>
        </View>
      </GlassCard>

      <View style={styles.list}>
        {entries.map((e, i) => (
          <GlassCard key={e.name + i} style={[styles.row, (e as any).you && styles.rowYou]} radius={Radius.md}>
            <View style={[styles.rankPill, i === 0 && styles.gold, i === 1 && styles.silver, i === 2 && styles.bronze]}>
              <Text style={styles.rankText}>{i + 1}</Text>
            </View>
            <Text style={[styles.name, (e as any).you && styles.nameYou]}>{e.name}{(e as any).you ? ' (you)' : ''}</Text>
            <Text style={styles.stars}>{e.stars} ★</Text>
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg, paddingBottom: 100 },
  title: { ...Typography.hero, color: Colors.textPrimary },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary, fontFamily: 'Inter-Medium', marginTop: -8 },
  myCard: { padding: 18 },
  myRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rankNum: { ...Typography.h1, color: Colors.purple[500], fontSize: 28 },
  myName: { ...Typography.h3, color: Colors.textPrimary },
  mySub: { ...Typography.bodySmall, color: Colors.textSecondary },
  prizeBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.warning[500], alignItems: 'center', justifyContent: 'center' },
  prizeText: { fontSize: 20 },
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowYou: { borderWidth: 1.5, borderColor: Colors.purple[300] },
  rankPill: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(120,140,190,0.15)', alignItems: 'center', justifyContent: 'center' },
  gold: { backgroundColor: Colors.warning[500] },
  silver: { backgroundColor: '#C0CCD8' },
  bronze: { backgroundColor: '#D9A06B' },
  rankText: { ...Typography.h3, color: '#fff', fontSize: 14 },
  name: { ...Typography.h3, color: Colors.textPrimary, flex: 1, fontSize: 15 },
  nameYou: { color: Colors.purple[500] },
  stars: { ...Typography.bodySmall, fontFamily: 'Inter-SemiBold', color: Colors.warning[500] },
});
