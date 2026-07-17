 NOTA DE INSTRUCCIÓN:
Este documento contiene el texto exacto en formato Markdown para tu archivo
README.md . Puedes copiar el contenido completo desde este PDF y pegarlo
directamente en tu editor de código.
# Pa' que sufras - Party Game Mobile
Pa' que sufras es una aplicación móvil multijugador local (offline) diseñada para
romper el hielo en reuniones y fiestas. El juego selecciona jugadores de forma
aleatoria y los desafía con preguntas incómodas y divertidas, adaptadas según el
género de los participantes y el nivel de intensidad elegido.
Desarrollada con un enfoque mobile-first, la app ofrece una experiencia dinámica,
fluida y optimizada para jugarse desde un único dispositivo móvil.
## Características Principales
 Jugabilidad Local (Offline): Diseñada exclusivamente para disfrutarse en grupo
compartiendo un solo dispositivo, eliminando la necesidad de conexión a internet
durante la partida.
 Filtros Dinámicos por Género:** Lógica avanzada de filtrado de preguntas
(Masculino, Femenino o Neutral) que se adapta en tiempo real según el jugador
seleccionado.
 Niveles de Intensidad: Diferentes modos de juego que regulan la audacia de las
preguntas según el tipo de reunión.
 Selección Aleatoria Basada en Estado: Algoritmo que gestiona los turnos y la
selección de usuarios de forma equitativa evitando la repetición inmediata.
## Tecnologías y Herramientas Utilizadas
Este proyecto fue desarrollado aplicando buenas prácticas en el ecosistema de
JavaScript/TypeScript para móviles:
React Native: Framework principal para el renderizado de componentes nativos en
iOS y Android de forma eficiente.
Expo (Managed Workflow): Utilizado para agilizar el ciclo de desarrollo, la
configuración del entorno y la compilación de la app.
TypeScript: Implementado para garantizar un tipado fuerte, reducir errores en
tiempo de ejecución y acotar la estructura de los datos del juego (usuarios,
preguntas, géneros).
•
•
•
•
•
•
•
1
React Hooks ( useState , useEffect ): Gestión eficiente del estado global de la
partida (lista de jugadores activos, turnos, preguntas consumidas).
Manejo de Arreglos y Algoritmos: Implementación de lógica personalizada para
desordenar y filtrar grandes volúmenes de datos JSON de manera óptima en memoria.
## Instalación y Configuración Local
Para ejecutar este proyecto en tu entorno local y probarlo en un emulador o
dispositivo real con Expo Go, sigue estos pasos:
1. Clona el repositorio:
git clone https://github.com/FranyelPacheco/Pa-que-sufras.git
cd Pa-que-sufras
2. Instala las dependencias:
npm install
# o si usas yarn
yarn install
3. Inicia el servidor de desarrollo de Expo:
npx expo start
4. Ejecuta la aplicación:
Escanea el código QR desde la app Expo Go en tu dispositivo físico (iOS/Android).
Presiona a en la terminal para abrirlo en el emulador de Android.
Presiona i en la terminal para abrirlo en el simulador de iOS.
## Desafíos Técnicos Resueltos
Optimización de Filtros en Tiempo Real: Creación de funciones puras en JavaScript
para realizar el filtrado de preguntas cruzando variables de intensidad y género
simultáneamente sin ralentizar la transición entre pantallas.
•
•
•
•
•
•
2
Gestión de Estado Limpia: Evitar efectos colaterales (side effects) inesperados al
cambiar drásticamente el flujo de pantallas del juego mediante un control estricto
de los ciclos de vida de los componentes.
•
3
