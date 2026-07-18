import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GameBoard } from '@/components/GameBoard';
import { getLevel, getDailyLevel } from '@/lib/engine';
import { usePlayer, applyXp } from '@/components/PlayerProvider';
import type { Level } from '@/lib/types';

export default function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { player, update } = usePlayer();

  const levelId = parseInt(String(id), 10);
  const isDaily = levelId === getDailyLevel().id;
  const level: Level = isDaily ? getDailyLevel() : getLevel(levelId);
  const isTutorial = levelId === 1 && !player.tutorialDone;

  const handleComplete = useCallback((pathLen: number, stars: number) => {
    update((p) => {
      const coins = 20 + stars * 15;
      const xp = 30 + stars * 20;
      const newProgress = levelId >= p.storyProgress ? levelId + 1 : p.storyProgress;
      const today = new Date().toISOString().slice(0, 10);
      return applyXp({
        ...p,
        coins: p.coins + coins,
        stars: p.stars + stars,
        xp: p.xp + xp,
        storyProgress: Math.max(p.storyProgress, newProgress),
        tutorialDone: levelId === 1 ? true : p.tutorialDone,
        lastDailyDate: isDaily ? today : p.lastDailyDate,
        stats: { ...p.stats, puzzlesSolved: p.stats.puzzlesSolved + 1, perfectSolves: p.stats.perfectSolves + (stars === 3 ? 1 : 0), totalStars: p.stats.totalStars + stars },
      }, xp);
    });
    setTimeout(() => router.back(), 1500);
  }, [levelId, isDaily, update, router]);

  return (
    <View style={styles.container}>
      <GameBoard level={level} onComplete={handleComplete} onExit={() => router.back()} isTutorial={isTutorial} tutorialDone={player.tutorialDone} onTutorialStep={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
