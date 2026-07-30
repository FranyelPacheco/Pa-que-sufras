# PA' QUE SUFRAS - BITÁCORA DE PROGRESO

## 1. Estado Actual del MVP
- **Nombre:** Pa' que sufras
- **Stack:** React Native (Expo SDK 56) + TypeScript + React 19
- **Estado:** MVP completo + UI refinada (WelcomeScreen con logo + personajes animados, DynamicBackground con gradientes/iconos flotantes, BannerAd oculto en nivel 3, MAX_PLAYERS=20). Listo para build nativa EAS.

## 2. Stack Tecnológico Completo

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | React Native | 0.85.3 |
| Platform toolkit | Expo SDK | ~56.0.5 |
| Lenguaje | TypeScript | ~6.0.3 |
| React | React | 19.2.3 |
| Navegación | Control manual por estados (App.tsx) | -- |
| Estado global | React Context API | -- |
| Almacenamiento rápido | react-native-mmkv | ^4.3.2 |
| Animaciones | react-native-reanimated | 4.3.1 |
| Gestos | react-native-gesture-handler | ~2.31.1 |
| Hápticos | expo-haptics | ~56.0.3 |
| IDs únicos | expo-crypto | ~56.0.4 |
| Fuentes | @expo-google-fonts/playfair-display | latest |
| Iconos | @expo/vector-icons | latest |
| Audio | expo-audio | latest |
| Gradientes | expo-linear-gradient | ~56.0.4 |
| Safe area | react-native-safe-area-context | ~5.7.0 |
| Status bar | expo-status-bar | ~56.0.4 |
| Testing | jest | ~29.7.0 |
| Monetización | react-native-google-mobile-ads | 15.8.3 |

## 3. Estructura del Proyecto
```
App.tsx                          ← Navegación + rate prompt + música por nivel
index.ts                         ← Entry point Expo
babel.config.js                  ← Config Babel (reanimated plugin)
assets/
  music/
    level1.wav                   ← Música nivel 1 (placeholder silencioso)
    level2.wav                   ← Música nivel 2 (placeholder silencioso)
    level3.wav                   ← Música nivel 3 (placeholder silencioso)
__tests__/
  game-logic.test.ts             ← 13 tests
src/
  types/game.ts                  ← Player (con avatarColor), Question
  constants/questions.ts         ← 300 preguntas (100 por nivel)
  constants/music.ts             ← Config de pistas musicales por nivel
  context/GameContext.tsx         ← Estado global + puntuación + avatares coloreados
  storage/mmkv.ts                ← Persistencia MMKV
  theme/
    colors.ts                    ← + avatarColors, error
    typography.ts
    spacing.ts
    index.ts
  i18n/
    es.ts, en.ts, types.ts, index.ts
  hooks/
    useRatePrompt.ts             ← Prompt de valoración en Google Play
    useMusic.ts                  ← Hook de música ambiental (expo-audio)
  ads/
    adUnits.ts                   ← IDs de AdMob
  components/
    SplashScreen.tsx
    DynamicBackground.tsx
    ui/
      Button.tsx                 ← 3 variantes
      Card.tsx                   ← Variante glass
      Avatar.tsx                 ← 🐕/🦊 con fondos de colores
      Input.tsx
      Header.tsx
      Icon.tsx
      GenderSelector.tsx
      QuestionTimer.tsx          ← 60s, solo visual, sin auto-avance
  screens/
    WelcomeScreen.tsx
    PlayerSetupScreen.tsx        ← ✕ rojo dedicado por jugador
    LevelSelectionScreen.tsx
    GameScreen.tsx               ← Timer 60s + Respondió bien/mal + avance manual
```

## 4. Mapa de Ruta & Estado
- [x] Fase 0: Inicialización del entorno Expo y TypeScript.
- [x] Fase 1: Diseño del sistema de temas.
- [x] Fase 2: Componentes reutilizables.
- [x] Fase 3: Pantallas con animaciones.
- [x] Fase 4: Sistema de puntuación + timer 60s + bien/mal.
- [x] Fase 4.1: i18n (español/inglés).
- [x] Fase 4.2: Rate prompt después de 3 partidas.
- [x] Fase 4.3: Avatares con emojis 🐕/🦊 y colores por jugador.
- [x] Fase 4.4: Música ambiental por nivel (expo-audio).
- [x] Fase 5: Testing y corrección de bugs.
- [x] Fase 5.1: UI/UX improvements — WelcomeScreen con logo + personajes, BannerAd condicional, MAX_PLAYERS=20, DynamicBackground rediseñado.
- [ ] Fase 6: Build de producción con EAS (Android APK).
- [ ] Fase 6.1: Publicación en Google Play Store.

## 5. Bugs Corregidos
1. **Crash `NoClassDefFoundError: LazyKType`** — Causado por `expo-av`. Reemplazado por `expo-audio`.
2. **`expo-navigation-bar` plugin** — Eliminado de app.json.
3. **Kotlin 2.3.0 override** — Eliminado. v15.8.3 de ads.
4. **`StyleSheet.absoluteFillObject`** — Reemplazado por `StyleSheet.absoluteFill`.
5. **Typos en `questions.ts`** — 3 corregidos.
6. **Level 1→2 error** — Pregunta `q-l2-24` corregida.
7. **Auto-avance del timer** — Eliminado. Ahora avance manual con bien/mal.
8. **Timer width type** — Usa `scaleX`.

## 6. Cambios Recientes
### Avatares 🐕/🦊
- `Player` ahora incluye `avatarColor`
- Hombres → 🐕, Mujeres → 🦊
- 10 colores distintos asignados round-robin
- Fondo del avatar con el color del jugador (10% opacidad)

### ✕ Rojo en PlayerSetupScreen
- Botón independiente del área de información
- Color `accent` (rojo), más grande (20px)
- Solo el ✕ elimina, la tarjeta no

### Timer 60s + Respondió bien/mal
- Timer subió de 15s → 60s
- **Sin auto-avance** — el timer es solo visual
- Al expirar muestra ⏰
- Botones: ✅ Respondió bien (da +1 punto) / ❌ No respondió
- Feedback visual con iconos y colores

### Música ambiental
- `expo-audio` instalado (reemplaza a expo-av)
- 3 pistas (una por nivel) con placeholders silenciosos
- Se activa al entrar al juego, cambia según nivel
- Se detiene al salir

### WelcomeScreen rediseñado 🎨
- Logo `assets/logo.png` en la parte superior
- Personajes animados (perro/zorra) usando `assets/bodies/*_cuerpo_completo2.png`
- Animación de flotación suave con `Easing.inOut(Easing.sin)`
- Taglines rotativos cada 5s
- Orbes de ambiente con colores de nivel 1
- Entradas escalonadas con `FadeInDown`/`FadeInUp`

### DynamicBackground rediseñado 🌈
- Gradientes por nivel:
  - L1: `#1A1A2E → #0A0A0A`, acento `#8B5CF6` (púrpura)
  - L2: `#1A0A2E → #0A0A0A`, acento `#FF2E63` (rojo)
  - L3: `#2E0A0A → #0A0A0A`, acento `#4ADE80` (verde)
- Iconos flotantes temáticos por nivel (MaterialCommunityIcons)
- Orbe ambiental animado con el color acento del nivel

### BannerAd condicional
- Oculto en nivel 3 (`currentLevel !== 3`)

### MAX_PLAYERS = 20
- Aumentado de 10 a 20 en `GameContext.tsx` y `PlayerSetupScreen.tsx`

## 7. Pendiente / Futuro
- [ ] Build de producción con EAS (Android APK)
- [ ] Publicación en Google Play Store
- [ ] Reemplazar placeholders de música con pistas reales (Pixabay, Freesound)
- [ ] Más preguntas (meta: 150+ por nivel)

## 8. Música — Dónde conseguir pistas libres
Las pistas actuales en `assets/music/` son silencio. Para activar la música:
1. Descargar MP3/WAV libres de derechos en:
   - https://pixabay.com/music/ (sin atribución)
   - https://freesound.org/ (buscar CC0)
2. Renombrar a `level1.wav`, `level2.wav`, `level3.wav`
3. Reemplazar los archivos en `assets/music/`

Sugerencias de estilo:
- Nivel 1 (Conociéndonos): Chill, acústico, relajado
- Nivel 2 (Juego previo): Smooth, misterioso, jazz
- Nivel 3 (Se 😈): Electrónico, intenso, provocativo

## 9. Ads — IDs de AdMob
| Tipo | ID |
|---|---|
| App ID | `ca-app-pub-2173298418951684~4528601629` |
| Banner Ad Unit | `ca-app-pub-2173298418951684/1902438280` |
| Rewarded Interstitial Ad Unit | `ca-app-pub-2173298418951684/5870291819` |
