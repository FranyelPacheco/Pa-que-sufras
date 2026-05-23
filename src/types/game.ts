// Un "type" o "interface" es como un molde de galletas. Define la forma exacta de los datos.

export interface Player {
  id: string;       // Un identificador único para que la IA no confunda a dos jugadores con el mismo nombre
  name: string;     // El nombre del jugador
  gender: 'H' | 'M'; // Restringimos el género: o es 'H' (Hombre) o es 'M' (Mujer). No permite otra cosa.
}

export interface Question {
  id: string;       // Identificador único de la pregunta
  text: string;     // El texto de la pregunta (ej: "¿Cuál es tu mayor secreto?")
  level: 1 | 2 | 3;  // Restringimos los niveles: 1 (Conociéndonos), 2 (Juego previo), 3 (Se 😈)
  
  // 'genderTarget' define a quién va dirigida. 
  // 'all' = para cualquiera, 'H' = solo se le pregunta a hombres, 'M' = solo a mujeres.
  genderTarget: 'all' | 'H' | 'M'; 
}