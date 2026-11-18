# English Master Couch · Language Trainer

Entrenador de idiomas tipo Duolingo, hiperpersonalizado, que funciona **dentro de Claude (claude.ai)**: voz (TTS + micrófono), 16 tipos de ejercicio, coach con IA, racha, niveles y jefes semanales. Cada día Claude genera la lección nueva a partir del avance real de la persona.

## Archivo principal

`language-trainer-plantilla.html` — la plantilla. Es una sola página con tres bloques importantes:

| Bloque | Qué contiene |
|---|---|
| `agent-instructions` | Instrucciones completas para Claude: entrevista por voz, creación de la app, bucle diario |
| `exercise-catalog` | Formato exacto de cada tipo de ejercicio y escalera de etapas (1–5) |
| `lesson-data` | Lección de ejemplo con todos los tipos |

## Cómo usarla (solo claude.ai en la web)

1. Descarga `language-trainer-plantilla.html` de este repositorio. Tienes dos formas:
   - **Code → Download ZIP** (botón verde en la página principal). Descomprime y usa el archivo `language-trainer-plantilla.html`.
   - O abre el archivo y pulsa el **icono de flecha hacia abajo** (descargar) de la barra superior del archivo.
2. Abre un chat nuevo en claude.ai y **adjunta el archivo**.
3. Escribe: `Sigue las instrucciones del bloque agent-instructions de este archivo y empecemos.`
4. Claude te deja la guía de la entrevista en el chat. Activa el **modo voz en ese mismo chat** y di `empecemos la entrevista` (el modo voz ya lee toda la conversación, no hay que copiar nada). Al terminar, vuelve al texto y escribe `terminé la entrevista`.
5. Claude crea tu app personalizada. Cada día, en un chat nuevo, pega la frase que te dé al final.

Requisitos: artefactos activados en claude.ai. El micrófono (dictado) funciona en navegadores Chromium de escritorio.

## Mi camino

Al terminar una lección (o desde ☰) la app muestra **Mi camino**: tu recorrido real con lecciones (⭐ según tu resultado a la primera) y conversaciones por voz (✨), y siluetas bloqueadas de lo que viene, que se arma contigo. Al tocar una lección ves qué habilidades practicaste y cómo te fue. Las habilidades se miden con los ejercicios; lo que sale de la entrevista o de una conversación por voz es una **estimación** y se marca como tal.

- La **conversación por voz** nunca está bloqueada: se sugiere después de cada lección, y una conversación incompleta no cuenta.
- La app puede **crear tu próxima lección** sola con `sample`; si no puede, te dice qué pedirle a Claude.
- Los datos (lecciones, sesiones, conversaciones, mapa de habilidades) se guardan en la base de datos del propio artefacto, no en la memoria de Claude.

## Tipos de ejercicio

choice · minimal_pair · listen_multi · true_false · fill_blank · word_order · find_error · match · dictation · chunks · shadow · speak · roleplay · scene · task · cards

Para ideas nuevas se usa el tipo genérico `task` (Claude evalúa la respuesta); detalles en el bloque `exercise-catalog`.

## Versiones

- **v3.2** — corrige un texto «null» que aparecía en la pantalla de inicio.
- **v3** — instrucciones de Claude incluidas en el archivo.
- **v2** — 16 tipos de ejercicio, racha/XP/jefe, catálogo y escalera de progresión.
- **v1** — 9 tipos, voz, segunda oportunidad, repaso, guardado automático de reportes.
