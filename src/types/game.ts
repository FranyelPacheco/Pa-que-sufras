// Un "type" o "interface" es como un molde de galletas. Define la forma exacta de los datos.

export interface Player {
  id: string;
  name: string;
  gender: 'H' | 'M';
  avatarColor: string;
  avatarIndex: number;
}

export type GameLevel = 1 | 2 | 3 | 4;

export interface Question {
  id: string;       // Identificador único de la pregunta
  text: string;     // El texto de la pregunta (ej: "¿Cuál es tu mayor secreto?")
  level: GameLevel; // 1 (Conociéndonos), 2 (Juego previo), 3 (Se 😈), 4 (Modo Personalizado)
  
  // 'genderTarget' define a quién va dirigida. 
  // 'all' = para cualquiera, 'H' = solo se le pregunta a hombres, 'M' = solo a mujeres.
  genderTarget: 'all' | 'H' | 'M'; 
}