import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadPlayer, savePlayer, applyXp, DEFAULT_PLAYER } from '../lib/storage';
import type { PlayerState } from '../lib/types';

interface Ctx {
  player: PlayerState;
  ready: boolean;
  update: (fn: (p: PlayerState) => PlayerState) => void;
  reset: () => void;
}

const PlayerContext = createContext<Ctx>({ player: DEFAULT_PLAYER, ready: false, update: () => {}, reset: () => {} });

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(DEFAULT_PLAYER);
  const [ready, setReady] = useState(false);

  useEffect(() => { loadPlayer().then((p) => { setPlayer(p); setReady(true); }); }, []);

  const update = useCallback((fn: (p: PlayerState) => PlayerState) => {
    setPlayer((prev) => { const next = fn(prev); savePlayer(next); return next; });
  }, []);

  const reset = useCallback(() => { setPlayer({ ...DEFAULT_PLAYER }); savePlayer({ ...DEFAULT_PLAYER }); }, []);

  return <PlayerContext.Provider value={{ player, ready, update, reset }}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => useContext(PlayerContext);
export { applyXp };
