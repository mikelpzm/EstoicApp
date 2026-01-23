const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const IMAGE_MODEL = 'gemini-2.0-flash-exp';

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
  // Extraer palabras clave del texto para enriquecer el prompt
  const themeKeywords = {
    virtue: 'virtue, moral strength, golden light',
    death: 'memento mori, hourglass, ethereal mist',
    nature: 'natural elements, cosmos, organic forms',
    duty: 'Roman architecture, columns, dignity',
    mind: 'meditation, clarity, inner light',
    time: 'flowing time, sand, eternal movement',
    adversity: 'storm, strength, resilience',
    relationships: 'human connection, community, warmth',
    simplicity: 'minimalism, purity, clean forms',
    wisdom: 'ancient scrolls, knowledge, enlightenment'
  };

  const themeElements = meditation.themes
    .map(t => themeKeywords[t] || '')
    .filter(Boolean)
    .join(', ');

  return `Create an artistic, aesthetic image suitable for sharing a Stoic philosophy quote on Instagram.

Style requirements:
- Dark, elegant background (deep blacks, dark grays, or deep navy)
- Subtle golden accents and highlights
- Classical Roman/Greek aesthetic elements
- Minimalist and sophisticated composition
- Atmospheric and contemplative mood
- NO TEXT in the image - only visual elements
- Aspect ratio: square (1:1)

Visual elements to include: ${themeElements || 'classical philosophy, wisdom, contemplation'}

The image should evoke the feeling of this Marcus Aurelius quote:
"${meditation.text.substring(0, 200)}${meditation.text.length > 200 ? '...' : ''}"

Create a beautiful, shareable image that captures the essence of Stoic philosophy without any text overlay.`;
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
