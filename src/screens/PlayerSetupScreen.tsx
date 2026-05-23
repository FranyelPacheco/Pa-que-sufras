import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useGame } from '../context/GameContext';
import type { Player } from '../types/game';

type PlayerSetupScreenProps = {
  onContinue: () => void;
};

const PlayerSetupScreen = ({ onContinue }: PlayerSetupScreenProps) => {
  const { players, addPlayer, removePlayer } = useGame();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'H' | 'M'>('H');

  const canStartGame = players.length >= 2;

  const handleAddPlayer = () => {
    addPlayer(name, gender);
    setName('');
  };

  const handleStartGame = () => {
    if (!canStartGame) {
      return;
    }
    onContinue();
  };

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerGender}>
          {item.gender === 'H' ? 'Hombre' : 'Mujer'}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={`Eliminar a ${item.name}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => removePlayer(item.id)}
        style={({ pressed }) => [
          styles.removeButton,
          pressed && styles.removeButtonPressed,
        ]}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <View style={styles.content}>
        <Text style={styles.heading}>Jugadores</Text>
        <Text style={styles.subheading}>
          Registra al menos 2 participantes para comenzar
        </Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="Escribe un nombre"
          placeholderTextColor="#666666"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Género</Text>
        <View style={styles.genderRow}>
          <Pressable
            onPress={() => setGender('H')}
            style={[
              styles.genderButton,
              styles.genderButtonLeft,
              gender === 'H' && styles.genderButtonActive,
            ]}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === 'H' && styles.genderButtonTextActive,
              ]}
            >
              Hombre
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setGender('M')}
            style={[
              styles.genderButton,
              styles.genderButtonRight,
              gender === 'M' && styles.genderButtonActive,
            ]}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === 'M' && styles.genderButtonTextActive,
              ]}
            >
              Mujer
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleAddPlayer}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Text style={styles.addButtonText}>Añadir Jugador</Text>
        </Pressable>

        <Text style={styles.listTitle}>
          En la partida ({players.length})
        </Text>

        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aún no hay jugadores</Text>
          }
          style={styles.list}
        />

        <Pressable
          disabled={!canStartGame}
          onPress={handleStartGame}
          style={({ pressed }) => [
            styles.startButton,
            !canStartGame && styles.startButtonDisabled,
            pressed && canStartGame && styles.startButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.startButtonText,
              !canStartGame && styles.startButtonTextDisabled,
            ]}
          >
            Comenzar Juego
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PlayerSetupScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 28,
  },
  label: {
    color: '#E0E0E0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#141414',
    borderColor: '#2A2A2A',
    borderRadius: 10,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  genderButton: {
    alignItems: 'center',
    backgroundColor: '#141414',
    borderColor: '#2A2A2A',
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  genderButtonLeft: {
    borderBottomLeftRadius: 10,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
  },
  genderButtonRight: {
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  genderButtonActive: {
    backgroundColor: '#1A0A10',
    borderColor: '#FF2E63',
  },
  genderButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#FF2E63',
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: '#FF2E63',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 24,
    paddingVertical: 12,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: '#FF2E63',
    fontSize: 15,
    fontWeight: '700',
  },
  listTitle: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderColor: '#2A2A2A',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  playerInfo: {
    flex: 1,
    paddingRight: 12,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  playerGender: {
    color: '#888888',
    fontSize: 12,
  },
  removeButton: {
    alignItems: 'center',
    borderColor: '#333333',
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  removeButtonPressed: {
    borderColor: '#FF2E63',
  },
  removeButtonText: {
    color: '#FF2E63',
    fontSize: 14,
    fontWeight: '700',
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: '#FF2E63',
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 16,
  },
  startButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  startButtonPressed: {
    opacity: 0.9,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  startButtonTextDisabled: {
    color: '#666666',
  },
});
