import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fontSizes, fontWeights } from '../theme/typography';
import DynamicBackground from '../components/DynamicBackground';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import GenderSelector from '../components/ui/GenderSelector';
import Header from '../components/ui/Header';
import Input from '../components/ui/Input';
import { useGame } from '../context/GameContext';
import type { Player } from '../types/game';

type PlayerSetupScreenProps = {
  onContinue: () => void;
  onBack: () => void;
};

const MAX_PLAYERS = 20;

const PlayerSetupScreen = ({ onContinue, onBack }: PlayerSetupScreenProps) => {
  const { players, addPlayer, removePlayer } = useGame();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'H' | 'M'>('H');
  const [error, setError] = useState<string | null>(null);
  const [showBackModal, setShowBackModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const canStartGame = players.length >= 2;
  const isAtLimit = players.length >= MAX_PLAYERS;

  useEffect(() => {
    if (players.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [players.length]);

  const handleAddPlayer = () => {
    const errorMsg = addPlayer(name, gender);
    if (errorMsg) {
      setError(errorMsg);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError(null);
    setName('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemovePlayer = (id: string) => {
    removePlayer(id);
    setError(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartGame = () => {
    if (!canStartGame) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onContinue();
  };

  const renderPlayer = useCallback(
    ({ item }: { item: Player }) => (
      <Animated.View
        entering={FadeInRight.duration(300).springify()}
        exiting={FadeOutLeft.duration(200)}
        layout={Layout.springify()}
      >
        <View style={styles.playerCard}>
          <View style={styles.playerInfo}>
            <Avatar name={item.name} gender={item.gender} color={item.avatarColor} imageIndex={item.avatarIndex} size="md" />
            <View>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.playerGender}>
                {item.gender === 'H' ? 'Hombre' : 'Mujer'}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel={`Eliminar a ${item.name}`}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => handleRemovePlayer(item.id)}
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.removeButtonPressed,
            ]}
          >
            <Text style={styles.removeIcon}>✕</Text>
          </Pressable>
        </View>
      </Animated.View>
    ),
    [],
  );

  return (
    <DynamicBackground currentLevel={1}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <View style={styles.content}>
          <Pressable
            onPress={players.length > 0 ? () => setShowBackModal(true) : onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textDim} />
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>

          <Header
            title="Jugadores"
            subtitle="Registra al menos 2 participantes para comenzar"
          />

          <View style={styles.section}>
            <Text style={styles.label}>Nombre</Text>
            <Input
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isAtLimit}
              isDisabled={isAtLimit}
              placeholder={isAtLimit ? 'Límite alcanzado' : 'Escribe un nombre'}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError(null);
              }}
              onSubmitEditing={handleAddPlayer}
              returnKeyType="done"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Género</Text>
            <GenderSelector
              value={gender}
              onChange={setGender}
              disabled={isAtLimit}
            />
          </View>

          <Button
            label={isAtLimit ? `Máximo ${MAX_PLAYERS} jugadores` : 'Añadir Jugador'}
            variant="outline"
            disabled={isAtLimit || !name.trim()}
            onPress={handleAddPlayer}
          />

          <Text style={styles.listTitle}>
            En la partida ({players.length}/{MAX_PLAYERS})
          </Text>

          <FlatList
            ref={flatListRef}
            data={players}
            keyExtractor={(item) => item.id}
            renderItem={renderPlayer}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aún no hay jugadores</Text>
            }
            style={styles.list}
          />

          <Button
            label={
              canStartGame
                ? 'Comenzar Juego'
                : `Faltan ${2 - players.length} jugador(es)`
            }
            disabled={!canStartGame}
            onPress={handleStartGame}
          />
        </View>

        <Modal
          visible={showBackModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBackModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialCommunityIcons
                name="account-remove"
                size={40}
                color={colors.accent}
              />
              <Text style={styles.modalTitle}>¿Salir sin empezar?</Text>
              <Text style={styles.modalSubtitle}>
                {players.length > 0
                  ? `Perderás ${players.length} jugador(es) registrado(s)`
                  : 'Volverás a la pantalla de inicio'}
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  label="Cancelar"
                  variant="ghost"
                  onPress={() => setShowBackModal(false)}
                  style={styles.modalButton}
                />
                <Button
                  label="Salir"
                  onPress={onBack}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </DynamicBackground>
  );
};

export default PlayerSetupScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['4xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing['3xl'],
    paddingVertical: spacing.xs,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: colors.textDim,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  section: {
    marginBottom: spacing['3xl'],
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.accent,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.xs,
  },
  listTitle: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.md,
    marginTop: spacing['4xl'],
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  emptyText: {
    color: colors.textDark,
    fontSize: fontSizes.md,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  playerCardPressed: {
    borderColor: colors.accent,
    opacity: 0.7,
  },
  playerInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  playerName: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    marginBottom: 2,
  },
  playerGender: {
    color: colors.textDim,
    fontSize: fontSizes.xs,
  },
  removeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  removeButtonPressed: {
    opacity: 0.5,
  },
  removeIcon: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: fontWeights.bold,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing['5xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    gap: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
});
