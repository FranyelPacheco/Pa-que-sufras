import type { Question } from '../types/game';

export const QUESTIONS: Question[] = [
  // —— Nivel 1: Conociéndonos ——
  {
    id: 'q-l1-01',
    text: '¿Quién del grupo sería capaz de fingir que le encanta un regalo horrible solo para no herir sentimientos?',
    level: 1,
    genderTarget: 'all',
  },
  {
    id: 'q-l1-02',
    text: '¿Cuál fue la peor cita o salida que has tenido y qué hiciste para escapar con dignidad?',
    level: 1,
    genderTarget: 'all',
  },
  {
    id: 'q-l1-03',
    text: '¿Qué canción pondrías como soundtrack de tu peor decisión del último año?',
    level: 1,
    genderTarget: 'all',
  },

  // —— Nivel 2: Juego previo ——
  {
    id: 'q-l2-01',
    text: '¿Qué detalle pequeño de alguien te vuelve loca/o sin que esa persona lo sepa?',
    level: 2,
    genderTarget: 'all',
  },
  {
    id: 'q-l2-02',
    text: '¿Cuál es la mentira más creíble que has dicho en una cita para impresionar?',
    level: 2,
    genderTarget: 'H',
  },
  {
    id: 'q-l2-03',
    text: '¿Qué mensaje de texto has reescrito más veces antes de enviarlo y nunca te atreviste a mandar?',
    level: 2,
    genderTarget: 'M',
  },

  // —— Nivel 3: Se 😈 ——
  {
    id: 'q-l3-01',
    text: '¿Qué cosa harías esta noche si supieras que nadie en esta partida lo contaría jamás?',
    level: 3,
    genderTarget: 'all',
  },
  {
    id: 'q-l3-02',
    text: '¿Con quién del grupo tendrías la conversación más incómoda a las 3 a.m. y qué tema evitarías a toda costa?',
    level: 3,
    genderTarget: 'all',
  },
  {
    id: 'q-l3-03',
    text: '¿Qué verdad sobre ti desearías que alguien de aquí preguntara en voz alta para dejar de cargarla solo?',
    level: 3,
    genderTarget: 'all',
  },
];
