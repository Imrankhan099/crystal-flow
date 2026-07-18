import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlayerState } from './types';

const KEY = 'crystalflow_player_v1';

export const DEFAULT_PLAYER: PlayerState = {
  coins: 100,
  diamonds: 5,
  stars: 0,
  xp: 0,
  level: 1,
  storyProgress: 1,
  unlockedThemes: ['aurora'],
  unlockedBackgrounds: ['mist'],
  unlockedTrails: ['cyan'],
  unlockedParticles: ['sparkle'],
  selectedTheme: 'aurora',
  selectedBackground: 'mist',
  selectedTrail: 'cyan',
  selectedParticle: 'sparkle',
  lastLogin: '',
  loginStreak: 0,
  lastDailyDate: '',
  lastSpinDate: '',
  achievements: [],
  tutorialDone: false,
  soundEnabled: true,
  hapticsEnabled: true,
  stats: { puzzlesSolved: 0, perfectSolves: 0, totalStars: 0, timePlayed: 0 },
};

export async function loadPlayer(): Promise<PlayerState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PLAYER };
    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    return { ...DEFAULT_PLAYER, ...parsed, stats: { ...DEFAULT_PLAYER.stats, ...parsed.stats } };
  } catch {
    return { ...DEFAULT_PLAYER };
  }
}

export async function savePlayer(state: PlayerState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

export function applyXp(state: PlayerState, gained: number): PlayerState {
  let xp = state.xp + gained;
  let level = state.level;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
  }
  return { ...state, xp, level };
}
