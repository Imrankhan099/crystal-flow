export type Cell = { r: number; c: number };

export type CrystalKind = 'source' | 'node' | 'split' | 'locked' | 'amplifier';
export type CrystalColor = 'blue' | 'cyan' | 'purple';

export interface Crystal {
  id: string;
  cell: Cell;
  kind: CrystalKind;
  color: CrystalColor;
  lit: boolean;
  rotatable?: boolean;
  rotation?: 0 | 90 | 180 | 270;
  portalPair?: string;
  keyId?: string;
  hasKey?: boolean;
}

export interface Level {
  id: number;
  name: string;
  rows: number;
  cols: number;
  crystals: Crystal[];
  maxEnergy: number;
  par: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  mechanic?: string;
  procedural?: boolean;
}

export type GameMode = 'story' | 'daily' | 'endless' | 'zen';

export interface PlayerState {
  coins: number;
  diamonds: number;
  stars: number;
  xp: number;
  level: number;
  storyProgress: number;
  unlockedThemes: string[];
  unlockedBackgrounds: string[];
  unlockedTrails: string[];
  unlockedParticles: string[];
  selectedTheme: string;
  selectedBackground: string;
  selectedTrail: string;
  selectedParticle: string;
  lastLogin: string;
  loginStreak: number;
  lastDailyDate: string;
  lastSpinDate: string;
  achievements: string[];
  tutorialDone?: boolean;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  stats: { puzzlesSolved: number; perfectSolves: number; totalStars: number; timePlayed: number };
}
