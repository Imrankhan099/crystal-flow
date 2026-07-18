import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Sparkles, Palette, Droplet, Star, Gift } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { Colors, Radius, Typography, Spacing } from '@/lib/theme';
import { usePlayer } from '@/components/PlayerProvider';

type Tab = 'themes' | 'backgrounds' | 'trails' | 'particles' | 'packs';

const ITEMS: Record<string, { id: string; name: string; cost: number; color: string }[]> = {
  themes: [
    { id: 'aurora', name: 'Aurora', cost: 0, color: Colors.cyan[400] },
    { id: 'ocean', name: 'Ocean', cost: 200, color: Colors.blue[400] },
    { id: 'lavender', name: 'Lavender', cost: 300, color: Colors.purple[400] },
    { id: 'sunset', name: 'Sunset', cost: 400, color: Colors.warning[500] },
    { id: 'mint', name: 'Mint', cost: 350, color: Colors.success[400] },
  ],
  backgrounds: [
    { id: 'mist', name: 'Mist', cost: 0, color: Colors.blue[100] },
    { id: 'dawn', name: 'Dawn', cost: 250, color: Colors.warning[400] },
    { id: 'dusk', name: 'Dusk', cost: 250, color: Colors.purple[300] },
    { id: 'frost', name: 'Frost', cost: 300, color: Colors.cyan[200] },
  ],
  trails: [
    { id: 'cyan', name: 'Cyan', cost: 0, color: Colors.cyan[400] },
    { id: 'blue', name: 'Blue', cost: 150, color: Colors.blue[400] },
    { id: 'purple', name: 'Purple', cost: 150, color: Colors.purple[400] },
    { id: 'gold', name: 'Gold', cost: 250, color: Colors.warning[500] },
  ],
  particles: [
    { id: 'sparkle', name: 'Sparkle', cost: 0, color: Colors.cyan[300] },
    { id: 'bloom', name: 'Bloom', cost: 200, color: Colors.purple[300] },
    { id: 'stardust', name: 'Stardust', cost: 300, color: Colors.warning[400] },
  ],
};

const PACKS = [
  { id: 'starter', name: 'Starter Pack', desc: '500 coins + 5 diamonds', cost: 0, icon: '🎁' },
  { id: 'vault', name: 'Coin Vault', desc: '2000 coins', cost: 50, icon: '💰', currency: 'diamonds' as const },
  { id: 'gem', name: 'Gem Hoard', desc: '50 diamonds', cost: 100, icon: '💎', currency: 'diamonds' as const },
];

export default function ShopScreen() {
  const { player, update } = usePlayer();
  const [tab, setTab] = useState<Tab>('themes');

  const isUnlocked = (category: string, id: string) => {
    const list = category === 'themes' ? player.unlockedThemes : category === 'backgrounds' ? player.unlockedBackgrounds : category === 'trails' ? player.unlockedTrails : player.unlockedParticles;
    return list.includes(id);
  };
  const isSelected = (category: string, id: string) =>
    (category === 'themes' && player.selectedTheme === id) || (category === 'backgrounds' && player.selectedBackground === id) || (category === 'trails' && player.selectedTrail === id) || (category === 'particles' && player.selectedParticle === id);

  const buy = (category: string, item: { id: string; cost: number }) => {
    if (player.coins < item.cost) return;
    update((p) => {
      const list = category === 'themes' ? p.unlockedThemes : category === 'backgrounds' ? p.unlockedBackgrounds : category === 'trails' ? p.unlockedTrails : p.unlockedParticles;
      if (list.includes(item.id)) return p;
      return { ...p, coins: p.coins - item.cost, [category === 'themes' ? 'unlockedThemes' : category === 'backgrounds' ? 'unlockedBackgrounds' : category === 'trails' ? 'unlockedTrails' : 'unlockedParticles']: [...list, item.id] } as typeof p;
    });
  };

  const select = (category: string, id: string) => {
    update((p) => ({ ...p, selectedTheme: category === 'themes' ? id : p.selectedTheme, selectedBackground: category === 'backgrounds' ? id : p.selectedBackground, selectedTrail: category === 'trails' ? id : p.selectedTrail, selectedParticle: category === 'particles' ? id : p.selectedParticle }));
  };

  const buyPack = (pack: typeof PACKS[number]) => {
    if (pack.cost === 0) update((p) => ({ ...p, coins: p.coins + 500, diamonds: p.diamonds + 5 }));
    else if (pack.currency === 'diamonds' && player.diamonds >= pack.cost) update((p) => pack.id === 'vault' ? { ...p, diamonds: p.diamonds - pack.cost, coins: p.coins + 2000 } : { ...p, diamonds: p.diamonds + 50 });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.wallet}>
          <Text style={styles.walletText}>{player.coins} 🪙</Text>
          <Text style={styles.walletText}>{player.diamonds} 💎</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {([['themes', 'Themes', Palette], ['backgrounds', 'Scenes', Droplet], ['trails', 'Trails', Sparkles], ['particles', 'FX', Star], ['packs', 'Packs', Gift]] as const).map(([t, label, Icon]) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Icon size={16} color={tab === t ? '#fff' : Colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {tab !== 'packs' ? (
        <View style={styles.grid}>
          {ITEMS[tab].map((item) => {
            const unlocked = isUnlocked(tab, item.id);
            const selected = isSelected(tab, item.id);
            return (
              <GlassCard key={item.id} style={[styles.itemCard, selected && styles.itemSelected]} radius={Radius.md}>
                <View style={[styles.itemSwatch, { backgroundColor: item.color }]} />
                <Text style={styles.itemName}>{item.name}</Text>
                {selected ? <Text style={styles.selectedBadge}>Selected</Text> :
                  unlocked ? <Button title="Use" variant="ghost" size="sm" onPress={() => select(tab, item.id)} /> :
                  <Button title={`${item.cost} 🪙`} variant="primary" size="sm" disabled={player.coins < item.cost} onPress={() => buy(tab, item)} />}
              </GlassCard>
            );
          })}
        </View>
      ) : (
        <View style={styles.packs}>
          {PACKS.map((pack) => (
            <GlassCard key={pack.id} style={styles.packCard} radius={Radius.lg}>
              <Text style={styles.packIcon}>{pack.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.packDesc}>{pack.desc}</Text>
              </View>
              <Button title={pack.cost === 0 ? 'Free' : `${pack.cost} 💎`} variant={pack.cost === 0 ? 'success' : 'primary'} size="sm" onPress={() => buyPack(pack)} disabled={pack.cost !== 0 && player.diamonds < pack.cost} />
            </GlassCard>
          ))}
        </View>
      )}

      <GlassCard style={styles.adCard} radius={Radius.lg}>
        <Text style={styles.adTitle}>Watch & Earn</Text>
        <Text style={styles.adSub}>Watch a short ad for 50 free coins</Text>
        <Button title="Rewarded Ad" variant="cyan" size="md" onPress={() => update((p) => ({ ...p, coins: p.coins + 50 }))} />
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.hero, color: Colors.textPrimary },
  wallet: { flexDirection: 'row', gap: 12 },
  walletText: { ...Typography.bodySmall, fontFamily: 'Inter-SemiBold', color: Colors.textPrimary },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: Colors.glassBorder },
  tabActive: { backgroundColor: Colors.purple[400], borderColor: Colors.purple[400] },
  tabText: { ...Typography.bodySmall, fontFamily: 'Inter-SemiBold', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard: { width: '48%', flexGrow: 1, padding: 14, gap: 8, alignItems: 'center' },
  itemSelected: { borderWidth: 1.5, borderColor: Colors.purple[400] },
  itemSwatch: { width: 56, height: 56, borderRadius: 28, marginBottom: 4 },
  itemName: { ...Typography.h3, color: Colors.textPrimary, fontSize: 15 },
  selectedBadge: { ...Typography.caption, color: Colors.purple[500], fontFamily: 'Inter-SemiBold' },
  packs: { gap: 10 },
  packCard: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  packIcon: { fontSize: 32 },
  packName: { ...Typography.h3, color: Colors.textPrimary },
  packDesc: { ...Typography.bodySmall, color: Colors.textSecondary },
  adCard: { padding: 20, alignItems: 'center', gap: 10 },
  adTitle: { ...Typography.h2, color: Colors.textPrimary },
  adSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 6 },
});
