import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';
import Button from './ui/Button';
import { useGame } from '../context/GameContext';
import type { CustomQuestionEntry } from '../storage/mmkv';

type CustomQuestionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onStartCustomGame?: () => void;
};

const CustomQuestionsModal = ({
  visible,
  onClose,
  onStartCustomGame,
}: CustomQuestionsModalProps) => {
  const {
    customQuestions,
    addCustomQuestion,
    removeCustomQuestion,
    isMixEnabled,
    toggleMixCustomQuestions,
  } = useGame();

  const [questionText, setQuestionText] = useState('');
  const [genderTarget, setGenderTarget] = useState<'all' | 'H' | 'M'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddQuestion = () => {
    const trimmed = questionText.trim();
    if (!trimmed) {
      setErrorMsg('Escribe una pregunta para agregar');
      return;
    }
    if (trimmed.length < 5) {
      setErrorMsg('La pregunta es demasiado corta');
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCustomQuestion(trimmed, genderTarget);
    setQuestionText('');
    setErrorMsg(null);
  };

  const handleDelete = (id: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeCustomQuestion(id);
  };

  const renderItem = ({ item }: { item: CustomQuestionEntry }) => {
    const genderIcon =
      item.genderTarget === 'H'
        ? 'gender-male'
        : item.genderTarget === 'M'
          ? 'gender-female'
          : 'account-multiple-outline';

    const genderColor =
      item.genderTarget === 'H'
        ? '#60A5FA'
        : item.genderTarget === 'M'
          ? '#F472B6'
          : colors.textDim;

    return (
      <View style={styles.questionItem}>
        <View style={styles.questionLeft}>
          <MaterialCommunityIcons name={genderIcon} size={18} color={genderColor} style={styles.itemIcon} />
          <Text style={styles.questionItemText}>{item.text}</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => handleDelete(item.id)}
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="pencil-box-multiple" size={24} color={colors.level4.accent} />
              <Text style={styles.title}>Preguntas del Grupo</Text>
            </View>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textDim} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Crea tus propias preguntas personalizadas. Se guardan permanentemente en tu teléfono.
          </Text>

          {/* Formulario de nueva pregunta */}
          <View style={styles.formCard}>
            <TextInput
              value={questionText}
              onChangeText={(text) => {
                setQuestionText(text);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Ej: ¿A quién de aquí le pedirías un favor a las 3 AM?"
              placeholderTextColor={colors.textDark}
              style={styles.input}
              multiline
              maxLength={200}
            />

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Selector de género */}
            <View style={styles.genderRow}>
              <Text style={styles.genderLabel}>Aplica a:</Text>
              <View style={styles.genderOptions}>
                <Pressable
                  onPress={() => setGenderTarget('all')}
                  style={[
                    styles.genderChip,
                    genderTarget === 'all' && styles.genderChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.genderChipText,
                      genderTarget === 'all' && styles.genderChipTextActive,
                    ]}
                  >
                    Todos
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setGenderTarget('H')}
                  style={[
                    styles.genderChip,
                    genderTarget === 'H' && styles.genderChipActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="gender-male"
                    size={14}
                    color={genderTarget === 'H' ? colors.text : '#60A5FA'}
                  />
                  <Text
                    style={[
                      styles.genderChipText,
                      genderTarget === 'H' && styles.genderChipTextActive,
                    ]}
                  >
                    Hombres
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setGenderTarget('M')}
                  style={[
                    styles.genderChip,
                    genderTarget === 'M' && styles.genderChipActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="gender-female"
                    size={14}
                    color={genderTarget === 'M' ? colors.text : '#F472B6'}
                  />
                  <Text
                    style={[
                      styles.genderChipText,
                      genderTarget === 'M' && styles.genderChipTextActive,
                    ]}
                  >
                    Mujeres
                  </Text>
                </Pressable>
              </View>
            </View>

            <Button
              label="Agregar Pregunta"
              onPress={handleAddQuestion}
              style={styles.addBtn}
            />
          </View>

          {/* Toggle de mezclar en todos los niveles */}
          <View style={styles.mixToggleCard}>
            <View style={styles.mixToggleTextWrap}>
              <Text style={styles.mixToggleTitle}>Mezclar en los Niveles 1, 2 y 3</Text>
              <Text style={styles.mixToggleDesc}>
                Tus preguntas personalizadas también aparecerán al azar en los otros niveles.
              </Text>
            </View>
            <Switch
              value={isMixEnabled}
              onValueChange={toggleMixCustomQuestions}
              trackColor={{ false: colors.border, true: colors.level4.accent }}
              thumbColor={isMixEnabled ? '#FFFFFF' : colors.textDim}
            />
          </View>

          {/* Lista de preguntas */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              Tus Preguntas ({customQuestions.length})
            </Text>
          </View>

          {customQuestions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="comment-text-outline" size={36} color={colors.textDark} />
              <Text style={styles.emptyText}>
                No has agregado preguntas personalizadas aún. Escribe una arriba para empezar.
              </Text>
            </View>
          ) : (
            <FlatList
              data={customQuestions}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Footer actions */}
          {onStartCustomGame && (
            <View style={styles.footer}>
              <Button
                label={
                  customQuestions.length === 0
                    ? 'Agrega preguntas para jugar'
                    : `Iniciar Modo Personalizado (${customQuestions.length})`
                }
                disabled={customQuestions.length === 0}
                onPress={onStartCustomGame}
                style={styles.startBtn}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomQuestionsModal;

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '92%',
    padding: spacing['3xl'],
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: fontSizes.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  genderLabel: {
    color: colors.textDim,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  genderChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  genderChipActive: {
    backgroundColor: colors.level4.accent,
    borderColor: colors.level4.accent,
  },
  genderChipText: {
    color: colors.textDim,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  genderChipTextActive: {
    color: '#000000',
    fontWeight: fontWeights.bold,
  },
  addBtn: {
    paddingVertical: spacing.sm,
  },
  mixToggleCard: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mixToggleTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  mixToggleTitle: {
    color: colors.text,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  mixToggleDesc: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  listHeader: {
    marginBottom: spacing.xs,
  },
  listTitle: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase',
  },
  listContent: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  questionItem: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  questionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  itemIcon: {
    marginTop: 1,
  },
  questionItemText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    flex: 1,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  deleteBtnPressed: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textDark,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 260,
  },
  footer: {
    marginTop: spacing.md,
  },
  startBtn: {
    paddingVertical: spacing.md,
  },
});
