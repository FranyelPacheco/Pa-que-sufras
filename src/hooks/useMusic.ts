import { useEffect, useRef, useCallback } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { LEVEL_MUSIC } from '../constants/music';

export const useMusic = () => {
  const player1 = useAudioPlayer(LEVEL_MUSIC[1]);
  const player2 = useAudioPlayer(LEVEL_MUSIC[2]);
  const player3 = useAudioPlayer(LEVEL_MUSIC[3]);
  const allPlayers = [player1, player2, player3];
  const currentLevelRef = useRef<number>(1);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  }, []);

  useEffect(() => {
    allPlayers.forEach((p) => {
      p.loop = true;
    });
  }, []);

  const playLevel = useCallback((level: 1 | 2 | 3 | 4) => {
    const prev = currentLevelRef.current;
    currentLevelRef.current = level;

    const prevIndex = prev === 4 ? 1 : prev - 1;
    const prevPlayer = allPlayers[prevIndex];
    if (prevPlayer) {
      prevPlayer.pause();
    }

    const nextIndex = level === 4 ? 1 : level - 1;
    const player = allPlayers[nextIndex];
    if (player) {
      player.play();
    }
  }, []);

  const stopAll = useCallback(() => {
    allPlayers.forEach((p) => {
      p.pause();
    });
  }, []);

  return { playLevel, stopAll };
};
