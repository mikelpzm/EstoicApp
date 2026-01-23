const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

/**
 * Genera una imagen basada en una cita de Marco Aurelio
 * @param {string} apiKey - API key de Gemini
 * @param {object} meditation - Objeto con la meditación
 * @returns {Promise<string>} - URL de la imagen en base64
 */
export async function generateQuoteImage(apiKey, meditation) {
  const prompt = buildImagePrompt(meditation);

  const response = await fetch(
    `${GEMINI_API_URL}/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `Error ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Buscar la imagen en la respuesta
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error('No se pudo generar la imagen. Intenta de nuevo.');
}

/**
 * Construye el prompt para generar la imagen
 */
function buildImagePrompt(meditation) {
  // Elementos visuales concretos y escenas específicas por tema
  const themeVisuals = {
    virtue: {
      scenes: ['a lone figure standing firm against wind on a cliff edge', 'hands forging a sword in firelight', 'a Roman soldier at dawn before battle', 'an oak tree with deep roots in rocky soil'],
      elements: ['bronze armor reflecting light', 'a straight path through wilderness', 'steady hands holding a torch'],
      style: 'heroic realism with warm bronze and amber tones'
    },
    death: {
      scenes: ['autumn leaves falling into still water', 'a candle burning low in a dark room', 'an ancient skull resting on open books', 'footprints disappearing in sand at sunset'],
      elements: ['hourglass with last grains falling', 'wilting flowers in beautiful decay', 'a sundial casting long shadows'],
      style: 'vanitas painting style with rich chiaroscuro'
    },
    nature: {
      scenes: ['a single tree on a vast plain under starry sky', 'river flowing around immovable stones', 'roots of a great tree intertwined underground', 'the moment a wave breaks on ancient rocks'],
      elements: ['cosmic nebulae reflected in water', 'interconnected mycelium networks glowing', 'seasons changing in a single frame'],
      style: 'romantic naturalism with cosmic scale'
    },
    duty: {
      scenes: ['a watchman at his post at night', 'hands working at a craftsman bench', 'a bridge being built stone by stone', 'footsteps on a well-worn path at first light'],
      elements: ['Roman eagles and standards', 'architectural blueprints', 'tools laid out with purpose'],
      style: 'classical Roman aesthetic with strong verticals and dignified composition'
    },
    mind: {
      scenes: ['a still lake reflecting mountains perfectly', 'a figure meditating in an empty marble hall', 'storm clouds parting to reveal stars', 'a lighthouse beam cutting through fog'],
      elements: ['a perfectly balanced scale', 'clear water in an ancient vessel', 'a single flame undisturbed by wind'],
      style: 'serene minimalism with deep contrast and meditative space'
    },
    time: {
      scenes: ['ancient ruins being reclaimed by nature', 'a river carving through canyon over millennia', 'stars wheeling in long exposure above mountains', 'layers of sediment in cliff face'],
      elements: ['sundials and astronomical instruments', 'rings in an ancient tree trunk', 'sand dunes reshaping'],
      style: 'epic temporal scale with layers of time visible'
    },
    adversity: {
      scenes: ['a ship navigating through storm with steady helm', 'a tree bent but unbroken by wind', 'fire being forged into steel', 'a mountain climber on a difficult ascent'],
      elements: ['crashing waves against lighthouse', 'phoenix imagery', 'diamond forming under pressure'],
      style: 'dramatic baroque with dynamic tension and powerful lighting'
    },
    relationships: {
      scenes: ['two philosophers in conversation in a garden', 'a mentor teaching by firelight', 'hands reaching across a table', 'a community building together'],
      elements: ['intertwined branches from different trees', 'shared bread and wine', 'footpaths converging'],
      style: 'warm humanist painting with intimate lighting'
    },
    simplicity: {
      scenes: ['a single perfect stone in a zen garden', 'an empty room with one window and light', 'a bowl of water on a wooden table', 'morning mist over an empty field'],
      elements: ['geometric purity', 'negative space as subject', 'single objects casting long shadows'],
      style: 'Japanese wabi-sabi meets Greek geometric purity'
    },
    wisdom: {
      scenes: ['an owl perched on ancient texts at midnight', 'light breaking through clouds onto a library', 'an elder gaze looking at horizon', 'a labyrinth viewed from above showing the path'],
      elements: ['ancient scrolls and manuscripts', 'astronomical models', 'maps of unknown territories'],
      style: 'renaissance scholarly atmosphere with warm candlelight'
    }
  };

  // Extraer conceptos visuales concretos del texto de la meditación
  const visualConcepts = extractVisualConcepts(meditation.text);

  // Seleccionar escena y elementos basados en los temas
  const primaryTheme = meditation.themes[0] || 'wisdom';
  const themeData = themeVisuals[primaryTheme] || themeVisuals.wisdom;

  // Seleccionar escena aleatoria basada en el ID para consistencia
  const sceneIndex = meditation.id % themeData.scenes.length;
  const selectedScene = themeData.scenes[sceneIndex];

  // Combinar elementos de múltiples temas si hay más de uno
  const additionalElements = meditation.themes.slice(1)
    .map(t => themeVisuals[t]?.elements[meditation.id % 3])
    .filter(Boolean)
    .join(', ');

  return `Create a cinematic, visually striking image inspired by this meditation from Marcus Aurelius.

PRIMARY SCENE: ${selectedScene}

SPECIFIC VISUAL ELEMENTS FROM THE TEXT: ${visualConcepts || 'contemplative solitude, ancient wisdom'}
${additionalElements ? `SECONDARY ELEMENTS: ${additionalElements}` : ''}

ARTISTIC STYLE: ${themeData.style}

TECHNICAL REQUIREMENTS:
- Square format (1:1 aspect ratio)
- Rich, moody lighting with strong focal point
- Cinematic depth of field
- Color palette: deep shadows with selective warm highlights (amber, gold, bronze)
- NO TEXT, NO WORDS, NO LETTERS anywhere in the image
- Photorealistic or oil painting quality

MOOD TO CAPTURE from this quote:
"${meditation.text.substring(0, 300)}${meditation.text.length > 300 ? '...' : ''}"

Create an image that someone would want to contemplate, not just scroll past. Make it specific and evocative, not generic.`;
}

/**
 * Extrae conceptos visuales concretos del texto de la meditación
 */
function extractVisualConcepts(text) {
  const visualPatterns = {
    // Naturaleza y cosmos
    'sol|amanecer|aurora': 'golden sunrise breaking over horizon',
    'mar|océano|olas': 'vast ocean with powerful waves',
    'río|corriente|fluir': 'river flowing with purpose',
    'montaña|cumbre|cima': 'majestic mountain peak',
    'árbol|raíces|ramas': 'ancient tree with deep roots',
    'fuego|llama|arder': 'flames dancing with intensity',
    'piedra|roca|mármol': 'weathered stone enduring time',
    'estrella|cielo|cosmos': 'starfield in infinite darkness',
    'tierra|polvo|ceniza': 'earth returning to earth',
    'agua|gota|lluvia': 'water in its eternal cycle',

    // Cuerpo y acción
    'mano|manos': 'weathered hands with purpose',
    'ojo|mirada|ver': 'penetrating gaze seeking truth',
    'camino|sendero|paso': 'path through challenging terrain',
    'lucha|batalla|guerra': 'warrior spirit in conflict',
    'descanso|paz|calma': 'profound stillness and peace',

    // Tiempo y muerte
    'muerte|morir|mortal': 'memento mori symbolism',
    'tiempo|momento|instante': 'time made visible',
    'eterno|eternidad|siempre': 'infinity visualized',
    'pasado|futuro|presente': 'temporal layers',

    // Mente y virtud
    'alma|espíritu|interior': 'inner light radiating outward',
    'razón|mente|pensar': 'crystalline clarity of thought',
    'virtud|bien|bondad': 'nobility made visible',
    'deber|obligación': 'weight of responsibility'
  };

  const concepts = [];
  const lowerText = text.toLowerCase();

  for (const [pattern, visual] of Object.entries(visualPatterns)) {
    if (new RegExp(pattern, 'i').test(lowerText)) {
      concepts.push(visual);
    }
  }

  // Limitar a los 3 conceptos más relevantes
  return concepts.slice(0, 3).join(', ');
}

/**
 * Valida si una API key tiene el formato correcto
 */
export function validateApiKey(apiKey) {
  // Las API keys de Google generalmente empiezan con "AIza" y tienen ~39 caracteres
  return apiKey && apiKey.length >= 30 && apiKey.startsWith('AIza');
}

/**
 * Prueba la conexión con la API de Gemini
 */
export async function testApiConnection(apiKey) {
  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${apiKey}`,
      { method: 'GET' }
    );
    return response.ok;
  } catch {
    return false;
  }
}
