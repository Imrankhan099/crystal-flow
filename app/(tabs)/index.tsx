import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Calendar, Infinity as InfinityIcon, Trophy, User, Settings, Sparkles, ChevronRight } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { Crystal } from '@/components/Crystal';
import { Colors, Gradients, Radius, Typography, Spacing, type Gradient } from '@/lib/theme';
import { usePlayer, applyXp } from '@/components/PlayerProvider';
import { getDailyLevel } from '@/lib/engine';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - Spacing.lg * 2;

export default function HomeScreen() {
  const router = useRouter();
  const { player, update } = usePlayer();

  const heroY = useSharedValue(24);
  const heroOpacity = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    heroY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    heroOpacity.value = withTiming(1, { duration: 700 });
    float.value = withRepeat(withSequence(withTiming(-8, { duration: 2400, easing: Easing.inOut(Easing.ease) }), withTiming(8, { duration: 2400, easing: Easing.inOut(Easing.ease) })), -1, true);
  }, []);

  const heroStyle = useAnimatedStyle(() => ({ transform: [{ translateY: heroY.value }], opacity: heroOpacity.value }));
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  const startStory = () => router.push(`/play/${player.storyProgress}`);
  const startDaily = () => router.push(`/play/${getDailyLevel().id}`);
  const startEndless = () => router.push(`/play/${player.storyProgress + 50}`);

  const claimDaily = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (player.lastLogin === today) return;
    const streak = player.lastLogin && new Date(player.lastLogin).getTime() > Date.now() - 2 * 86400000 ? player.loginStreak + 1 : 1;
    update((p) => applyXp({ ...p, coins: p.coins + 50 + streak * 10, lastLogin: today, loginStreak: streak, xp: p.xp + 20 }, 20));
  };

  const today = new Date().toISOString().slice(0, 10);
  const canClaim = player.lastLogin !== today;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Crystal Flow</Text>
        </View>
        <GlassCard style={styles.currencyPill} radius={Radius.pill}>
          <View style={styles.currencyRow}>
            <Sparkles size={14} color={Colors.warning[500]} />
            <Text style={styles.currencyText}>{player.coins}</Text>
            <View style={styles.divider} />
            <Text style={styles.diamond}>{player.diamonds} 💎</Text>
          </View>
        </GlassCard>
      </View>

      <Animated.View style={[styles.heroWrap, heroStyle]}>
        <Animated.View style={[styles.heroFloat, floatStyle]}>
          <View style={styles.heroCrystals}>
            <Crystal crystal={{ id: 'h1', cell: { r: 0, c: 0 }, kind: 'source', color: 'cyan', lit: true }} size={72} lit isSource />
            <Crystal crystal={{ id: 'h2', cell: { r: 0, c: 0 }, kind: 'node', color: 'purple', lit: true }} size={60} lit />
            <Crystal crystal={{ id: 'h3', cell: { r: 0, c: 0 }, kind: 'node', color: 'blue', lit: true }} size={52} lit />
          </View>
        </Animated.View>
        <Text style={styles.tagline}>Draw the flow. Light every crystal.</Text>
      </Animated.View>

      <View style={styles.cardsSection}>
        <ModeCard title="Story Mode" subtitle={`Continue · Level ${player.storyProgress}`} icon={<Play size={26} color="#fff" strokeWidth={2.4} />} grad={Gradients.primary} onPress={startStory} />
        <ModeCard title="Daily Challenge" subtitle="A fresh puzzle every day" icon={<Calendar size={26} color="#fff" strokeWidth={2.4} />} grad={Gradients.cyanBlue} onPress={startDaily} />
        <ModeCard title="Endless Mode" subtitle="Procedural puzzles, forever" icon={<InfinityIcon size={26} color="#fff" strokeWidth={2.4} />} grad={Gradients.purpleCyan} onPress={startEndless} />
        <ModeCard title="Leaderboard" subtitle="Weekly tournament" icon={<Trophy size={26} color="#fff" strokeWidth={2.4} />} grad={Gradients.warm} onPress={() => router.push('/(tabs)/leaderboard')} />
        <ModeCard title="Profile" subtitle="Achievements & stats" icon={<User size={26} color="#fff" strokeWidth={2.4} />} grad={Gradients.success} onPress={() => router.push('/(tabs)/profile')} />
        <ModeCard title="Settings" subtitle="Sound, haptics & more" icon={<Settings size={26} color="#fff" strokeWidth={2.4} />} grad={Gradients.primarySoft} onPress={() => router.push('/settings')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        <Pressable onPress={claimDaily} disabled={!canClaim} style={({ pressed }) => [pressed && styles.pressed]}>
          <GlassCard style={[styles.rewardCard, !canClaim && styles.rewardClaimed]} radius={Radius.lg}>
            <View style={styles.rewardRow}>
              <View style={[styles.rewardIcon, { backgroundColor: canClaim ? Colors.warning[500] : Colors.textTertiary }]}>
                <Sparkles size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardTitle}>Daily Login</Text>
                <Text style={styles.rewardSub} numberOfLines={1}>{canClaim ? `Day ${player.loginStreak + 1} · claim ${50 + player.loginStreak * 10} coins` : `Streak ${player.loginStreak} · come back tomorrow`}</Text>
              </View>
              {canClaim && <ChevronRight size={20} color={Colors.textSecondary} />}
            </View>
          </GlassCard>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.statsRow}>
          <StatCard label="Level" value={player.level} />
          <StatCard label="Stars" value={player.stats.totalStars} />
          <StatCard label="Solved" value={player.stats.puzzlesSolved} />
          <StatCard label="Perfect" value={player.stats.perfectSolves} />
        </View>
      </View>
    </ScrollView>
  );
}

function ModeCard({ title, subtitle, icon, grad, onPress }: { title: string; subtitle: string; icon: React.ReactNode; grad: Gradient; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.modeCardWrap, pressed && styles.pressed]}>
      <View style={styles.modeCardInner}>
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modeCard}>
          <View style={styles.modeIcon}>{icon}</View>
          <View style={styles.modeText}>
            <Text style={styles.modeTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.modeSub} numberOfLines={1}>{subtitle}</Text>
          </View>
          <ChevronRight size={22} color="rgba(255,255,255,0.85)" strokeWidth={2.4} />
        </LinearGradient>
      </View>
    </Pressable>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <GlassCard style={styles.statCard} radius={Radius.md}>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { ...Typography.bodySmall, color: Colors.textSecondary, fontFamily: 'Inter-Medium' },
  title: { ...Typography.hero, color: Colors.textPrimary },
  currencyPill: { paddingHorizontal: 14, paddingVertical: 8 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currencyText: { ...Typography.bodySmall, fontFamily: 'Inter-SemiBold', color: Colors.textPrimary },
  diamond: { ...Typography.bodySmall, fontFamily: 'Inter-SemiBold', color: Colors.purple[500] },
  divider: { width: 1, height: 12, backgroundColor: Colors.glassBorder, marginHorizontal: 4 },
  heroWrap: { alignItems: 'center', paddingVertical: Spacing.md },
  heroFloat: { flexDirection: 'row', marginBottom: 16 },
  heroCrystals: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagline: { ...Typography.h3, color: Colors.textSecondary, fontFamily: 'Inter-Medium' },
  cardsSection: { gap: 12 },
  section: { gap: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, paddingHorizontal: 4 },
  modeCardWrap: { width: CARD_W, borderRadius: Radius.lg, overflow: 'hidden', alignSelf: 'center' },
  modeCardInner: { borderRadius: Radius.lg, overflow: 'hidden' },
  modeCard: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16, minHeight: 76 },
  modeIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  modeText: { flex: 1, justifyContent: 'center' },
  modeTitle: { ...Typography.h2, color: '#fff', fontSize: 18 },
  modeSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter-Medium', marginTop: 2 },
  rewardCard: { padding: 16 },
  rewardClaimed: { opacity: 0.7 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rewardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rewardTitle: { ...Typography.h3, color: Colors.textPrimary },
  rewardSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, padding: 14, alignItems: 'center' },
  statValue: { ...Typography.number, color: Colors.blue[500] },
  statLabel: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
});
