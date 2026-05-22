const THEME_LABELS = {
  virtue: 'virtud práctica',
  death: 'memento mori',
  nature: 'vivir de acuerdo con la naturaleza',
  duty: 'deber y servicio',
  mind: 'dominio del juicio',
  time: 'uso del tiempo',
  adversity: 'resistencia ante la adversidad',
  relationships: 'trato con los demás',
  simplicity: 'sencillez',
  wisdom: 'sabiduría aplicada'
};

const EXERCISES = {
  virtue: 'Elige una acción pequeña que harías aunque nadie la viera. Hazla sin anunciarla.',
  death: 'Recuerda durante un minuto que el día no se repite. Decide qué merece realmente tu atención.',
  nature: 'Distingue lo que depende de ti de lo que pertenece al curso natural de las cosas.',
  duty: 'Haz la siguiente tarea necesaria sin negociar con la pereza ni buscar aplauso.',
  mind: 'Antes de reaccionar, nombra tu juicio: “estoy interpretando esto como…”. Luego decide si merece asentimiento.',
  time: 'Quita una distracción concreta de la próxima hora y dedícala a algo que no te avergüence recordar.',
  adversity: 'Convierte una molestia de hoy en entrenamiento: paciencia, precisión o templanza.',
  relationships: 'Trata a alguien difícil como a un familiar racional que todavía no ve bien lo bueno.',
  simplicity: 'Reduce una necesidad artificial hoy: compra, pantalla, explicación o queja.',
  wisdom: 'Resume la idea en una regla de conducta de una sola frase y aplícala antes de dormir.'
};

const QUESTIONS = {
  virtue: '¿Qué virtud concreta me está pidiendo practicar este pasaje?',
  death: 'Si hoy terminara el capítulo, ¿qué reacción mía parecería ridícula o innecesaria?',
  nature: '¿Qué estoy intentando controlar que no me pertenece?',
  duty: '¿Cuál es mi deber sencillo aquí, sin drama ni autoengaño?',
  mind: '¿Qué juicio automático puedo suspender antes de convertirlo en emoción?',
  time: '¿Qué uso de mi tiempo de hoy me acerca a una vida más sobria y entera?',
  adversity: '¿Qué músculo moral entrena esta incomodidad?',
  relationships: '¿Cómo respondería si priorizara carácter sobre orgullo?',
  simplicity: '¿Qué sobra en mi día y me debilita sin que lo note?',
  wisdom: '¿Qué frase de este texto podría llevar conmigo como recordatorio operativo?'
};

const MANTRAS = {
  virtue: 'Sé recto, no espectacular.',
  death: 'Esto también pasa; úsalo bien.',
  nature: 'Acepta el hecho; gobierna la respuesta.',
  duty: 'Haz lo que toca, como toca.',
  mind: 'No eres la impresión: eres quien la examina.',
  time: 'Sólo posees este instante.',
  adversity: 'El obstáculo revela el entrenamiento.',
  relationships: 'Nacimos para colaborar.',
  simplicity: 'Menos ruido, más carácter.',
  wisdom: 'Comprender es practicar.'
};

function cleanKnownOcrArtifacts(text) {
  return String(text || '')
    .replace(/De mimadree l respeto/g, 'De mi madre: el respeto')
    .replace(/unifonnidad/g, 'uniformidad')
    .replace(/páados/g, 'párpados')
    .replace(/en ninClaudio Severo[\s\S]*?A él se alude de nuevo en 1 17 junto con Rústico y Apolonio\. 3 gún caso/g, 'en ningún caso')
    .replace(/\bDe De él también:/g, 'De él también:')
    .replace(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)'(?=[:\s])/g, '$1')
    .replace(/\bcuerpO\b/g, 'cuerpo')
    .replace(/sofistica/g, 'sofística')
    .replace(/\s+\d+\s+(?=misma|virtud|naturaleza|razón|vida|muerte|alma|cuerpo)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanMeditationText(text) {
  return cleanKnownOcrArtifacts(text);
}

function pickPrimaryTheme(meditation) {
  return meditation?.themes?.[0] || 'wisdom';
}

export function buildStoicInsight(meditation) {
  const primary = pickPrimaryTheme(meditation);
  const themeText = THEME_LABELS[primary] || 'práctica estoica';
  const text = cleanMeditationText(meditation?.text || '');
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0]?.replace(/^"|"$/g, '') || text;

  return {
    primaryTheme: primary,
    themeText,
    essence: `Este pasaje apunta a ${themeText}: no busca inspirar un estado de ánimo, sino entrenar una forma de responder.`,
    plainReading: firstSentence.length > 220 ? `${firstSentence.slice(0, 217)}…` : firstSentence,
    exercise: EXERCISES[primary] || EXERCISES.wisdom,
    journalQuestion: QUESTIONS[primary] || QUESTIONS.wisdom,
    mantra: MANTRAS[primary] || MANTRAS.wisdom
  };
}

export function normalizeForSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function matchesMeditation(meditation, query) {
  const q = normalizeForSearch(query).trim();
  if (!q) return true;
  const haystack = normalizeForSearch([
    cleanMeditationText(meditation.text),
    `libro ${meditation.book}`,
    meditation.chapter,
    ...(meditation.themes || [])
  ].join(' '));
  return q.split(/\s+/).every(part => haystack.includes(part));
}
