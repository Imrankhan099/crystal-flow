import type { Cell, Crystal, Level } from './types';

export const key = (r: number, c: number) => `${r},${c}`;
export const parseKey = (k: string): Cell => { const [r, c] = k.split(',').map(Number); return { r, c }; };
export const cellEq = (a: Cell, b: Cell) => a.r === b.r && a.c === b.c;
export const neighbors = (cell: Cell): Cell[] => [
  { r: cell.r - 1, c: cell.c }, { r: cell.r + 1, c: cell.c },
  { r: cell.r, c: cell.c - 1 }, { r: cell.r, c: cell.c + 1 },
];
export const manhattan = (a: Cell, b: Cell) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
export const inBounds = (cell: Cell, rows: number, cols: number) =>
  cell.r >= 0 && cell.r < rows && cell.c >= 0 && cell.c < cols;
export const crystalAt = (crystals: Crystal[], cell: Cell) =>
  crystals.find((x) => cellEq(x.cell, cell));

export interface PathValidation { ok: boolean; reason?: string; litCrystals: Crystal[]; length: number; }

export function validatePath(path: Cell[], crystals: Crystal[]): PathValidation {
  if (path.length === 0) return { ok: false, reason: 'Draw a path', litCrystals: [], length: 0 };
  const seen = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    const k = key(path[i].r, path[i].c);
    if (seen.has(k)) return { ok: false, reason: 'Path overlaps itself', litCrystals: [], length: path.length };
    seen.add(k);
    if (i > 0 && manhattan(path[i - 1], path[i]) !== 1) return { ok: false, reason: 'Path must be continuous', litCrystals: [], length: path.length };
  }
  const lit = crystals.filter((x) => seen.has(key(x.cell.r, x.cell.c)));
  const allLit = lit.length === crystals.length;
  const startC = crystalAt(crystals, path[0]);
  const endC = crystalAt(crystals, path[path.length - 1]);
  if (!startC || !endC) return { ok: false, reason: 'Start and end on crystals', litCrystals: lit, length: path.length };
  if (!allLit) {
    const missing = crystals.length - lit.length;
    return { ok: false, reason: `${missing} crystal${missing > 1 ? 's' : ''} unlit`, litCrystals: lit, length: path.length };
  }
  return { ok: true, litCrystals: lit, length: path.length };
}

export function computeStars(pathLen: number, par: number, maxEnergy: number): 0 | 1 | 2 | 3 {
  if (pathLen > maxEnergy) return 0;
  if (pathLen <= par) return 3;
  if (pathLen <= Math.ceil(par * 1.2)) return 2;
  if (pathLen <= maxEnergy) return 1;
  return 0;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function randomWalk(start: Cell, rows: number, cols: number, target: number, rand: () => number): Cell[] | null {
  const path: Cell[] = [start];
  const visited = new Set<string>([key(start.r, start.c)]);
  let guard = 0;
  while (path.length < target && guard < target * 40) {
    guard++;
    const cur = path[path.length - 1];
    const opts = shuffle(neighbors(cur).filter((n) => inBounds(n, rows, cols) && !visited.has(key(n.r, n.c))), rand);
    if (opts.length === 0) { path.pop(); if (path.length === 0) return null; continue; }
    const next = opts[0];
    visited.add(key(next.r, next.c));
    path.push(next);
  }
  return path.length === target ? path : null;
}

const COLORS: Crystal['color'][] = ['blue', 'cyan', 'purple'];

export function generateLevel(levelId: number): Level {
  const rand = rng(levelId * 2654435761);
  const tier = Math.min(5, Math.floor((levelId - 1) / 20) + 1);
  const rows = Math.min(7, 4 + Math.floor((levelId - 1) / 12));
  const cols = Math.min(7, 4 + Math.floor((levelId - 1) / 12));
  const crystalCount = Math.min(rows * cols - 2, 4 + Math.floor(levelId / 3));
  let path: Cell[] | null = null;
  for (let attempt = 0; attempt < 40 && !path; attempt++) {
    const start = { r: Math.floor(rand() * rows), c: Math.floor(rand() * cols) };
    path = randomWalk(start, rows, cols, crystalCount, rand);
  }
  if (!path) { path = []; for (let i = 0; i < crystalCount; i++) path.push({ r: 0, c: i }); }
  const crystals: Crystal[] = path.map((cell, i) => ({
    id: `c${i}`, cell, kind: i === 0 ? 'source' : 'node',
    color: COLORS[Math.floor(rand() * COLORS.length)], lit: false,
  }));
  let mechanic: string | undefined;
  if (levelId >= 10 && levelId % 10 === 0) { mechanic = milestoneMechanic(levelId); applyMilestone(crystals, levelId, rand); }
  const par = path.length;
  const maxEnergy = Math.ceil(par * 1.6) + 2;
  return { id: levelId, name: levelId <= 100 ? `Level ${levelId}` : `Endless ${levelId}`, rows, cols, crystals, maxEnergy, par, difficulty: tier as Level['difficulty'], mechanic, procedural: levelId > 100 };
}

function milestoneMechanic(id: number): string {
  const map: Record<number, string> = { 10: 'Split Crystals', 20: 'Rotating Mirrors', 30: 'Teleport Portals', 40: 'Locked Crystals', 50: 'Color Filters', 60: 'Energy Amplifiers', 70: 'Moving Blockers', 80: 'Time Challenge', 90: 'Switch Gates', 100: 'Master Trial' };
  return map[id] ?? 'New Mechanic';
}

function applyMilestone(crystals: Crystal[], levelId: number, rand: () => number) {
  if (levelId === 10) { const mid = crystals[Math.floor(crystals.length / 2)]; if (mid) mid.kind = 'split'; }
  else if (levelId === 20) { crystals.forEach((c) => { if (c.kind !== 'source' && rand() > 0.6) c.rotatable = true; }); }
  else if (levelId === 30) { if (crystals.length >= 4) { crystals[1].portalPair = 'p1'; crystals[crystals.length - 2].portalPair = 'p1'; } }
  else if (levelId === 40) { const mid = crystals[Math.floor(crystals.length / 2)]; if (mid) { mid.kind = 'locked'; mid.keyId = 'k1'; } crystals[1].hasKey = true; }
  else if (levelId === 60) { const mid = crystals[Math.floor(crystals.length / 2)]; if (mid) mid.kind = 'amplifier'; }
}

export const HANDCRAFTED: Level[] = [
  { id: 1, name: 'First Light', rows: 4, cols: 4, difficulty: 1, par: 3, maxEnergy: 6, crystals: [
    { id: 'c0', cell: { r: 1, c: 1 }, kind: 'source', color: 'cyan', lit: false },
    { id: 'c1', cell: { r: 1, c: 2 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c2', cell: { r: 2, c: 2 }, kind: 'node', color: 'cyan', lit: false },
  ]},
  { id: 2, name: 'Soft Curve', rows: 4, cols: 4, difficulty: 1, par: 4, maxEnergy: 8, crystals: [
    { id: 'c0', cell: { r: 0, c: 0 }, kind: 'source', color: 'blue', lit: false },
    { id: 'c1', cell: { r: 0, c: 1 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c2', cell: { r: 1, c: 1 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c3', cell: { r: 2, c: 1 }, kind: 'node', color: 'purple', lit: false },
  ]},
  { id: 3, name: 'Three Turns', rows: 4, cols: 5, difficulty: 1, par: 5, maxEnergy: 9, crystals: [
    { id: 'c0', cell: { r: 0, c: 0 }, kind: 'source', color: 'cyan', lit: false },
    { id: 'c1', cell: { r: 0, c: 1 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c2', cell: { r: 0, c: 2 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c3', cell: { r: 1, c: 2 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c4', cell: { r: 2, c: 2 }, kind: 'node', color: 'purple', lit: false },
  ]},
  { id: 4, name: 'Diamond', rows: 5, cols: 5, difficulty: 2, par: 6, maxEnergy: 11, crystals: [
    { id: 'c0', cell: { r: 2, c: 1 }, kind: 'source', color: 'purple', lit: false },
    { id: 'c1', cell: { r: 1, c: 1 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c2', cell: { r: 1, c: 2 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c3', cell: { r: 2, c: 2 }, kind: 'node', color: 'purple', lit: false },
    { id: 'c4', cell: { r: 2, c: 3 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c5', cell: { r: 3, c: 3 }, kind: 'node', color: 'cyan', lit: false },
  ]},
  { id: 5, name: 'Spiral', rows: 5, cols: 5, difficulty: 2, par: 8, maxEnergy: 13, crystals: [
    { id: 'c0', cell: { r: 0, c: 0 }, kind: 'source', color: 'cyan', lit: false },
    { id: 'c1', cell: { r: 0, c: 1 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c2', cell: { r: 0, c: 2 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c3', cell: { r: 1, c: 2 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c4', cell: { r: 2, c: 2 }, kind: 'node', color: 'purple', lit: false },
    { id: 'c5', cell: { r: 2, c: 1 }, kind: 'node', color: 'purple', lit: false },
    { id: 'c6', cell: { r: 3, c: 1 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c7', cell: { r: 3, c: 0 }, kind: 'node', color: 'blue', lit: false },
  ]},
  { id: 6, name: 'Constellation', rows: 5, cols: 6, difficulty: 2, par: 9, maxEnergy: 15, crystals: [
    { id: 'c0', cell: { r: 0, c: 0 }, kind: 'source', color: 'blue', lit: false },
    { id: 'c1', cell: { r: 0, c: 2 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c2', cell: { r: 1, c: 3 }, kind: 'node', color: 'purple', lit: false },
    { id: 'c3', cell: { r: 2, c: 3 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c4', cell: { r: 3, c: 2 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c5', cell: { r: 3, c: 0 }, kind: 'node', color: 'purple', lit: false },
    { id: 'c6', cell: { r: 4, c: 1 }, kind: 'node', color: 'blue', lit: false },
    { id: 'c7', cell: { r: 4, c: 3 }, kind: 'node', color: 'cyan', lit: false },
    { id: 'c8', cell: { r: 4, c: 5 }, kind: 'node', color: 'purple', lit: false },
  ]},
];

export function getLevel(id: number): Level {
  if (id >= 1 && id <= HANDCRAFTED.length) return HANDCRAFTED[id - 1];
  return generateLevel(id);
}

export function dailySeed(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function getDailyLevel(): Level {
  const lvl = generateLevel(dailySeed() % 1000 + 7);
  return { ...lvl, id: dailySeed(), name: 'Daily Puzzle', mechanic: 'Daily' };
}

export function solvePath(level: Level): Cell[] {
  const crystals = level.crystals;
  if (crystals.length === 0) return [];
  const path: Cell[] = [{ ...crystals[0].cell }];
  const occupied = new Set<string>([key(crystals[0].cell.r, crystals[0].cell.c)]);
  for (let i = 1; i < crystals.length; i++) {
    const from = crystals[i - 1].cell;
    const to = crystals[i].cell;
    let r = from.r, c = from.c;
    const dr = to.r > from.r ? 1 : -1;
    const dc = to.c > from.c ? 1 : -1;
    while (r !== to.r) { r += dr; const k = key(r, c); if (!occupied.has(k)) { occupied.add(k); path.push({ r, c }); } }
    while (c !== to.c) { c += dc; const k = key(r, c); if (!occupied.has(k)) { occupied.add(k); path.push({ r, c }); } }
  }
  return path;
}
