import { useState, useCallback, useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { getTotalGamesPlayed } from '../storage/mmkv';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.franyel_pacheco.paquesufras';
const TRIGGER_GAME_COUNT = 3;

export const useRatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (!hasRated) {
      const total = getTotalGamesPlayed();
      if (total >= TRIGGER_GAME_COUNT) {
        setShowPrompt(true);
      }
    }
  }, [hasRated]);

  const handleRate = useCallback(() => {
    setShowPrompt(false);
    setHasRated(true);
    Linking.openURL(GOOGLE_PLAY_URL).catch(() => {});
  }, []);

  const handleLater = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return { showPrompt, handleRate, handleLater };
};
