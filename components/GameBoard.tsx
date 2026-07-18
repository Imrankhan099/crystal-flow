import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, PanResponder, LayoutChangeEvent, Pressable, Text, Platform, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withRepeat, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Crystal } from './Crystal';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Colors, Radius, Typography, Spacing } from '../lib/theme';
import { cellEq, key, manhattan, solvePath } from '../lib/engine';
import type { Cell, Crystal as CrystalT, Level } from '../lib/types';
import { Undo2, RotateCcw, Lightbulb, Pause } from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  level: Level;
  onComplete: (pathLen: number, stars: number) => void;
  onExit: () => void;
  isTutorial?: boolean;
  tutorialDone?: boolean;
  onTutorialStep?: (step: number) => void;
}

interface Particle { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }
interface Confetti { id: number; x: number; y: number; vx: number; vy: number; rot: number; vrot: number; color: string; }

const TUTORIAL_STEPS = [
  'Drag from one crystal to another.',
  'Connect every crystal.',
  'Lines cannot cross.',
];

export function GameBoard({ level, onComplete, onExit, isTutorial, tutorialDone, onTutorialStep }: Props) {
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [path, setPath] = useState<Cell[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [solved, setSolved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [energyLeft, setEnergyLeft] = useState(level.maxEnergy);
  const [moves, setMoves] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hintPath, setHintPath] = useState<Cell[]>([]);
  const [touchedCell, setTouchedCell] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const particleId = useRef(0);
  const confettiId = useRef(0);

  const cellSize = layout.width ? layout.width / level.cols : 0;
  const boardScale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const slowMo = useSharedValue(1);

  useEffect(() => {
    if (solved) {
      slowMo.value = 0.4;
      boardScale.value = withSequence(withTiming(1.06, { duration: 500 }), withTiming(1, { duration: 600 }));
    }
  }, [solved]);

  const crystalMap = useMemo(() => {
    const m = new Map<string, CrystalT>();
    level.crystals.forEach((c) => m.set(key(c.cell.r, c.cell.c), c));
    return m;
  }, [level]);

  const cellToPx = useCallback((cell: Cell) => ({ x: cell.c * cellSize + cellSize / 2, y: cell.r * cellSize + cellSize / 2 }), [cellSize]);
  const pxToCell = useCallback((px: number, py: number): Cell | null => {
    if (!cellSize) return null;
    const c = Math.floor(px / cellSize);
    const r = Math.floor(py / cellSize);
    if (r < 0 || r >= level.rows || c < 0 || c >= level.cols) return null;
    return { r, c };
  }, [cellSize, level]);

  const triggerHaptic = useCallback((style: 'light' | 'success' | 'error' = 'light') => {
    if (Platform.OS === 'web') return;
    try {
      if (style === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (style === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 8) => {
    const newP: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 0.8 + Math.random() * 2;
      newP.push({ id: particleId.current++, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, size: 4 + Math.random() * 4 });
    }
    setParticles((prev) => [...prev, ...newP]);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) => prev.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.05, life: p.life - 0.035 })).filter((p) => p.life > 0));
    }, 16);
    return () => clearInterval(interval);
  }, [particles.length]);

  const spawnConfetti = useCallback(() => {
    const colors = [Colors.cyan[400], Colors.purple[400], Colors.blue[400], Colors.warning[400], Colors.success[400]];
    const c: Confetti[] = [];
    for (let i = 0; i < 60; i++) {
      c.push({ id: confettiId.current++, x: SCREEN_W / 2 + (Math.random() - 0.5) * 100, y: 200, vx: (Math.random() - 0.5) * 8, vy: -6 - Math.random() * 6, rot: Math.random() * 360, vrot: (Math.random() - 0.5) * 20, color: colors[Math.floor(Math.random() * colors.length)] });
    }
    setConfetti(c);
  }, []);

  useEffect(() => {
    if (confetti.length === 0) return;
    const interval = setInterval(() => {
      setConfetti((prev) => prev.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.35, rot: p.rot + p.vrot })).filter((p) => p.y < 900));
    }, 16);
    return () => clearInterval(interval);
  }, [confetti.length]);

  const doShake = useCallback(() => {
    shakeX.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withTiming(-6, { duration: 50 }), withTiming(0, { duration: 50 }));
    triggerHaptic('error');
  }, [triggerHaptic]);

  const tryAddCell = useCallback((cell: Cell) => {
    setPath((prev) => {
      if (prev.length === 0) {
        const c = crystalMap.get(key(cell.r, cell.c));
        if (!c || c.kind !== 'source') { doShake(); return prev; }
        setTouchedCell(key(cell.r, cell.c));
        triggerHaptic('light');
        return [cell];
      }
      const last = prev[prev.length - 1];
      if (cellEq(last, cell)) return prev;
      if (prev.length >= 2 && cellEq(prev[prev.length - 2], cell)) return prev.slice(0, -1);
      if (manhattan(last, cell) !== 1) return prev;
      if (prev.some((p) => cellEq(p, cell))) { doShake(); return prev; }
      if (prev.length + 1 > level.maxEnergy) { doShake(); return prev; }
      const c = crystalMap.get(key(cell.r, cell.c));
      if (c) {
        const px = cellToPx(cell);
        spawnParticles(px.x, px.y, c.color === 'purple' ? Colors.crystalPurple : c.color === 'blue' ? Colors.crystalBlue : Colors.crystalCyan, 10);
        setTouchedCell(key(cell.r, cell.c));
        triggerHaptic('light');
        if (isTutorial && onTutorialStep) {
          const litCount = prev.filter((p) => crystalMap.has(key(p.r, p.c))).length + 1;
          if (litCount >= 2 && tutorialStep < 1) { setTutorialStep(1); onTutorialStep(1); }
          if (litCount >= 3 && tutorialStep < 2) { setTutorialStep(2); onTutorialStep(2); }
        }
      }
      return [...prev, cell];
    });
  }, [crystalMap, level.maxEnergy, cellToPx, spawnParticles, triggerHaptic, doShake, isTutorial, onTutorialStep, tutorialStep]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      if (solved || paused) return;
      const cell = pxToCell(e.nativeEvent.locationX, e.nativeEvent.locationY);
      if (cell) { setPath([]); setErrorMsg(''); tryAddCell(cell); }
    },
    onPanResponderMove: (e) => {
      if (solved || paused) return;
      const cell = pxToCell(e.nativeEvent.locationX, e.nativeEvent.locationY);
      if (cell) tryAddCell(cell);
    },
    onPanResponderRelease: () => {
      if (solved || paused) return;
      setPath((prev) => {
        if (prev.length === 0) return prev;
        const litSet = new Set(prev.map((c) => key(c.r, c.c)));
        const allLit = level.crystals.every((c) => litSet.has(key(c.cell.r, c.cell.c)));
        const startC = crystalMap.get(key(prev[0].r, prev[0].c));
        const endC = crystalMap.get(key(prev[prev.length - 1].r, prev[prev.length - 1].c));
        setEnergyLeft(level.maxEnergy - prev.length);
        setMoves((m) => m + 1);
        if (allLit && startC && endC && prev.length <= level.maxEnergy) {
          setSolved(true);
          triggerHaptic('success');
          spawnConfetti();
          const stars = prev.length <= level.par ? 3 : prev.length <= Math.ceil(level.par * 1.2) ? 2 : 1;
          prev.forEach((cell) => {
            const c = crystalMap.get(key(cell.r, cell.c));
            if (c) { const px = cellToPx(cell); spawnParticles(px.x, px.y, c.color === 'purple' ? Colors.crystalPurple : c.color === 'blue' ? Colors.crystalBlue : Colors.crystalCyan, 12); }
          });
          setTimeout(() => onComplete(prev.length, stars), 1400);
        } else if (!allLit) { setErrorMsg('Some crystals remain unlit'); }
        else if (prev.length > level.maxEnergy) { setErrorMsg('Out of energy'); }
        return prev;
      });
    },
  }), [pxToCell, tryAddCell, level, crystalMap, cellToPx, spawnParticles, spawnConfetti, triggerHaptic, onComplete, solved, paused]);

  const onLayout = (e: LayoutChangeEvent) => { const { x, y, width, height } = e.nativeEvent.layout; setLayout({ x, y, width, height }); };
  const litSet = useMemo(() => new Set(path.map((c) => key(c.r, c.c))), [path]);
  const pathPoints = path.map((c) => cellToPx(c));
  const hintPoints = hintPath.map((c) => cellToPx(c));

  const undo = () => { setPath((p) => (p.length > 0 ? p.slice(0, -1) : p)); setErrorMsg(''); triggerHaptic('light'); };
  const restart = () => { setPath([]); setErrorMsg(''); setEnergyLeft(level.maxEnergy); setSolved(false); triggerHaptic('light'); };
  const showHint = () => { const sol = solvePath(level); setHintPath(sol); setTimeout(() => setHintPath([]), 2600); triggerHaptic('light'); };

  const boardAnim = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }, { scale: boardScale.value }] }));

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <GlassCard style={styles.topPill} radius={Radius.pill}>
          <View style={styles.pillInner}>
            <View style={[styles.energyDot, { opacity: energyLeft > level.maxEnergy * 0.5 ? 1 : energyLeft > level.maxEnergy * 0.25 ? 0.7 : 0.4 }]} />
            <Text style={styles.pillText}>{Math.max(0, energyLeft)} energy</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.topPill} radius={Radius.pill}>
          <Text style={styles.pillText}>{moves} moves</Text>
        </GlassCard>
        <Pressable onPress={() => setPaused(true)} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <Pause size={18} color={Colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Text style={styles.levelName}>{level.name}</Text>
      {level.mechanic && <Text style={styles.mechanic}>{level.mechanic}</Text>}
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <View style={styles.boardWrap} onLayout={onLayout} {...panResponder.panHandlers}>
        <Animated.View style={[styles.board, { aspectRatio: level.cols / level.rows }, boardAnim]}>
          {cellSize > 0 && Array.from({ length: level.rows }).map((_, r) =>
            Array.from({ length: level.cols }).map((_, c) => (
              <View key={`g-${r}-${c}`} style={[styles.gridCell, { left: c * cellSize, top: r * cellSize, width: cellSize, height: cellSize }]}>
                <View style={styles.gridDot} />
              </View>
            )),
          )}
          {hintPoints.length > 1 && <EnergyTrail points={hintPoints} cellSize={cellSize} color={Colors.purple[300]} dashed />}
          {pathPoints.length > 1 && <EnergyTrail points={pathPoints} cellSize={cellSize} color={Colors.energy} />}
          {cellSize > 0 && level.crystals.map((c) => {
            const px = cellToPx(c.cell);
            const size = cellSize * 0.62;
            return (
              <View key={c.id} style={[styles.crystalWrap, { left: px.x - size / 2, top: px.y - size / 2 }]}>
                <Crystal crystal={c} size={size} lit={litSet.has(key(c.cell.r, c.cell.c)) || solved} isSource={c.kind === 'source'} touched={touchedCell === key(c.cell.r, c.cell.c)} />
              </View>
            );
          })}
          {particles.map((p) => (
            <View key={p.id} style={[styles.particle, { left: p.x - p.size / 2, top: p.y - p.size / 2, width: p.size, height: p.size, borderRadius: p.size / 2, backgroundColor: p.color, opacity: p.life }]} />
          ))}
        </Animated.View>
      </View>

      <View style={styles.bottomBar}>
        <ControlButton icon={<Undo2 size={20} color={Colors.blue[500]} strokeWidth={2.4} />} label="Undo" onPress={undo} />
        <ControlButton icon={<RotateCcw size={20} color={Colors.purple[500]} strokeWidth={2.4} />} label="Restart" onPress={restart} />
        <ControlButton icon={<Lightbulb size={20} color={Colors.warning[500]} strokeWidth={2.4} />} label="Hint" onPress={showHint} />
      </View>

      {isTutorial && !tutorialDone && <TutorialOverlay step={tutorialStep} onAdvance={(s) => { setTutorialStep(s); onTutorialStep?.(s); }} />}

      {paused && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard} radius={Radius.xl}>
            <Text style={styles.modalTitle}>Paused</Text>
            <Button title="Resume" variant="primary" size="lg" onPress={() => setPaused(false)} style={styles.modalBtn} />
            <Button title="Quit" variant="ghost" size="md" onPress={onExit} />
          </GlassCard>
        </View>
      )}

      {solved && <SolvedOverlay level={level} pathLen={path.length} confetti={confetti} />}
    </View>
  );
}

function EnergyTrail({ points, cellSize, color, dashed }: { points: { x: number; y: number }[]; cellSize: number; color: string; dashed?: boolean }) {
  const segments = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    segments.push({ x: a.x, y: a.y, len, angle });
  }
  const w = cellSize * 0.22;
  const glowW = cellSize * 0.4;
  return (
    <>
      {!dashed && segments.map((s, i) => (
        <View key={`gl-${i}`} style={{ position: 'absolute', left: s.x, top: s.y - glowW / 2, width: s.len, height: glowW, borderRadius: glowW / 2, backgroundColor: color, opacity: 0.3, transform: [{ rotate: `${s.angle}deg` }], transformOrigin: 'left center' }} />
      ))}
      {segments.map((s, i) => (
        <View key={`co-${i}`} style={{ position: 'absolute', left: s.x, top: s.y - w / 2, width: s.len, height: w, borderRadius: w / 2, backgroundColor: dashed ? 'transparent' : color, borderWidth: dashed ? 2 : 0, borderColor: color, borderStyle: dashed ? 'dashed' : 'solid', shadowColor: color, shadowOpacity: dashed ? 0.4 : 0.85, shadowRadius: dashed ? 6 : 12, shadowOffset: { width: 0, height: 0 }, transform: [{ rotate: `${s.angle}deg` }], transformOrigin: 'left center' }} />
      ))}
    </>
  );
}

function ControlButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}>
      <View style={styles.ctrlIcon}>{icon}</View>
      <Text style={styles.ctrlLabel}>{label}</Text>
    </Pressable>
  );
}

function TutorialOverlay({ step }: { step: number; onAdvance: (s: number) => void }) {
  const fingerX = useSharedValue(0);
  const fingerY = useSharedValue(0);
  useEffect(() => {
    fingerX.value = withRepeat(withSequence(withTiming(120, { duration: 1400, easing: Easing.inOut(Easing.cubic) }), withTiming(0, { duration: 600 })), -1, false);
    fingerY.value = withRepeat(withSequence(withTiming(60, { duration: 1400, easing: Easing.inOut(Easing.cubic) }), withTiming(0, { duration: 600 })), -1, false);
  }, [step]);
  const fingerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: fingerX.value }, { translateY: fingerY.value }] }));
  return (
    <View style={styles.tutorialOverlay} pointerEvents="none">
      <View style={styles.tutorialCardWrap}>
        <GlassCard style={styles.tutorialCard} radius={Radius.lg} glow>
          <Text style={styles.tutorialText}>{TUTORIAL_STEPS[Math.min(step, TUTORIAL_STEPS.length - 1)]}</Text>
        </GlassCard>
      </View>
      <View style={styles.fingerWrap}>
        <Animated.View style={[styles.finger, fingerStyle]}>
          <View style={styles.fingerDot} />
        </Animated.View>
      </View>
    </View>
  );
}

function SolvedOverlay({ level, pathLen, confetti }: { level: Level; pathLen: number; confetti: Confetti[] }) {
  const scale = useSharedValue(0);
  const stars = pathLen <= level.par ? 3 : pathLen <= Math.ceil(level.par * 1.2) ? 2 : 1;
  useEffect(() => { scale.value = withSequence(withTiming(1.15, { duration: 350, easing: Easing.out(Easing.back(2)) }), withTiming(1, { duration: 250 })); }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: scale.value }));
  return (
    <View style={styles.solvedOverlay} pointerEvents="none">
      {confetti.map((c) => (
        <View key={c.id} style={{ position: 'absolute', left: c.x, top: c.y, width: 8, height: 12, backgroundColor: c.color, transform: [{ rotate: `${c.rot}deg` }] }} />
      ))}
      <Animated.View style={style}>
        <GlassCard style={styles.solvedCard} radius={Radius.xl} glow>
          <Text style={styles.solvedTitle}>Crystal Flow!</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Text key={i} style={[styles.star, { opacity: i < stars ? 1 : 0.25 }]}>★</Text>
            ))}
          </View>
          <View style={styles.rewardsRow}>
            <Text style={styles.reward}>+{20 + stars * 15} 🪙</Text>
            <Text style={styles.reward}>+{30 + stars * 20} XP</Text>
            <Text style={styles.reward}>+{stars} ★</Text>
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', maxWidth: 460, justifyContent: 'center' },
  topPill: { paddingHorizontal: 14, paddingVertical: 8 },
  pillInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillText: { ...Typography.bodySmall, fontFamily: 'Inter-SemiBold', color: Colors.textPrimary },
  energyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.cyan[400] },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
  levelName: { ...Typography.h2, color: Colors.textPrimary, marginTop: 8 },
  mechanic: { ...Typography.caption, color: Colors.purple[500], fontFamily: 'Inter-SemiBold', marginTop: 2 },
  error: { ...Typography.bodySmall, color: Colors.error[500], fontFamily: 'Inter-SemiBold', marginTop: 4 },
  boardWrap: { width: '100%', maxWidth: 460, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  board: { width: '100%', height: '100%', borderRadius: Radius.xl, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'visible' },
  gridCell: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  gridDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(120,140,190,0.18)' },
  crystalWrap: { position: 'absolute' },
  particle: { position: 'absolute' },
  bottomBar: { flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'center' },
  ctrlBtn: { alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: Colors.glassBorder, minWidth: 84 },
  ctrlIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  ctrlLabel: { ...Typography.caption, color: Colors.textSecondary, fontFamily: 'Inter-SemiBold' },
  pressed: { transform: [{ scale: 0.95 }], opacity: 0.9 },
  tutorialOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 120 },
  tutorialCardWrap: { paddingHorizontal: 20, width: '100%' },
  tutorialCard: { padding: 18, alignItems: 'center' },
  tutorialText: { ...Typography.h3, color: Colors.textPrimary, textAlign: 'center' },
  fingerWrap: { position: 'absolute', top: 260, left: 120 },
  finger: { position: 'absolute' },
  fingerDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(91,220,255,0.4)', borderWidth: 2, borderColor: Colors.cyan[400], shadowColor: Colors.cyan[400], shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,30,60,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { padding: 28, alignItems: 'center', gap: 14, minWidth: 240 },
  modalTitle: { ...Typography.h1, color: Colors.textPrimary },
  modalBtn: { width: 200 },
  solvedOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,30,60,0.3)', overflow: 'hidden' },
  solvedCard: { padding: 32, alignItems: 'center' },
  solvedTitle: { ...Typography.h1, color: Colors.textPrimary },
  starsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  star: { fontSize: 40, color: Colors.warning[500] },
  rewardsRow: { flexDirection: 'row', gap: 14, marginTop: 14 },
  reward: { ...Typography.bodySmall, fontFamily: 'Inter-SemiBold', color: Colors.textSecondary },
});
