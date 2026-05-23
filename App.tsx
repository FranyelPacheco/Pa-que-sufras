import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { GameProvider, useGame } from './src/context/GameContext';
import GameScreen from './src/screens/GameScreen';
import LevelSelectionScreen from './src/screens/LevelSelectionScreen';
import PlayerSetupScreen from './src/screens/PlayerSetupScreen';

type AppScreen = 'setup' | 'levels';

const AppContent = () => {
  const { isPlaying } = useGame();
  const [screen, setScreen] = useState<AppScreen>('setup');

  if (isPlaying) {
    return (
      <View style={styles.container}>
        <GameScreen onQuit={() => setScreen('levels')} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {screen === 'setup' ? (
        <PlayerSetupScreen onContinue={() => setScreen('levels')} />
      ) : (
        <LevelSelectionScreen onBack={() => setScreen('setup')} />
      )}
      <StatusBar style="light" />
    </View>
  );
};

const App = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});
