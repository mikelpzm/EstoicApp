#!/usr/bin/env python3
"""
Script para asignar temas a las meditaciones basándose en palabras clave.
"""
import json
import re
from pathlib import Path
from collections import Counter

# Definición de temas con sus palabras clave asociadas
THEME_KEYWORDS = {
    "virtue": [
        "virtud", "virtuoso", "virtuosa", "bueno", "buena", "bondad", "honesto",
        "justo", "justicia", "recto", "rectitud", "moral", "noble", "nobleza",
        "íntegro", "integridad", "honrar", "honor", "digno", "dignidad",
        "excelencia", "perfección", "carácter", "modestia", "moderación",
        "templanza", "prudencia", "prudente", "sabiduría", "sabio",
        "benevolencia", "benévolo", "generosidad", "generoso", "piedad",
        "piadoso", "sincero", "sinceridad", "veraz", "verdad"
    ],
    "death": [
        "muerte", "morir", "mortal", "mortalidad", "cadáver", "muerto",
        "perecer", "perecedero", "extinción", "extinguir", "fin", "final",
        "acabar", "terminar", "cesar", "desaparecer", "desvanece",
        "sepultura", "tumba", "ceniza", "polvo", "últimos días",
        "último día", "moribundo", "agonía", "vida breve"
    ],
    "nature": [
        "naturaleza", "natural", "universo", "universal", "cosmos", "cósmico",
        "conjunto", "todo", "totalidad", "providencia", "destino", "logos",
        "razón universal", "orden", "armonía", "dioses", "dios", "divino",
        "divinidad", "creación", "elementos", "materia", "sustancia",
        "transformación", "cambio", "flujo", "eterno", "eternidad",
        "ley natural", "conforme a la naturaleza"
    ],
    "duty": [
        "deber", "deberes", "obligación", "tarea", "trabajo", "labor",
        "función", "servicio", "comunidad", "social", "sociedad", "ciudadano",
        "ciudad", "bien común", "público", "responsabilidad", "cargo",
        "misión", "cumplir", "cumplimiento", "actuar", "acción", "obrar",
        "hacer", "ejecutar", "desempeñar", "romano", "hombre"
    ],
    "mind": [
        "mente", "mental", "pensamiento", "pensar", "razón", "racional",
        "inteligencia", "inteligente", "juicio", "opinión", "opiniones",
        "percepción", "imaginación", "representación", "alma", "espíritu",
        "interior", "guía interior", "principio rector", "dueño interior",
        "atención", "concentración", "reflexión", "meditar", "contemplar",
        "dominio", "control", "autocontrol", "serenidad", "calma",
        "tranquilidad", "imperturbable", "ecuanimidad"
    ],
    "time": [
        "tiempo", "temporal", "momento", "instante", "presente", "ahora",
        "pasado", "futuro", "efímero", "fugaz", "breve", "brevedad",
        "transitorio", "pasajero", "duración", "eternidad", "eterno",
        "siglos", "años", "días", "horas", "rápido", "veloz", "pronto",
        "demora", "aplazar", "diferir", "postergar", "olvido", "olvidar",
        "memoria", "recuerdo", "historia", "generaciones", "antiguo"
    ],
    "adversity": [
        "adversidad", "dificultad", "obstáculo", "impedimento", "problema",
        "dolor", "doloroso", "sufrimiento", "sufrir", "pena", "aflicción",
        "desgracia", "infortunio", "mal", "males", "daño", "perjuicio",
        "injuria", "ofensa", "agravio", "insulto", "enojo", "ira", "cólera",
        "irritación", "molestia", "perturbación", "turbación", "agitación",
        "prueba", "resistir", "soportar", "aguantar", "tolerar", "firme",
        "firmeza", "fortaleza", "resiliente"
    ],
    "relationships": [
        "hombre", "hombres", "humano", "humanos", "prójimo", "otro", "otros",
        "semejante", "semejantes", "hermano", "hermanos", "amigo", "amigos",
        "amistad", "familia", "pariente", "parientes", "padre", "madre",
        "hijo", "hijos", "esposa", "comunidad", "sociedad", "social",
        "convivencia", "trato", "relación", "compañero", "colaborar",
        "cooperar", "ayudar", "beneficio", "servir", "perdonar", "perdón",
        "amor", "amar", "querer", "afecto", "benevolencia"
    ],
    "simplicity": [
        "simple", "sencillo", "sencillez", "simplicidad", "sobrio", "sobriedad",
        "modesto", "modestia", "humilde", "humildad", "poco", "pocos",
        "necesario", "esencial", "básico", "fundamental", "despojo",
        "despojar", "renunciar", "renuncia", "abandonar", "dejar",
        "prescindir", "evitar", "abstener", "contento", "satisfecho",
        "suficiente", "bastante", "frugal", "austero", "austeridad"
    ],
    "wisdom": [
        "sabio", "sabiduría", "conocimiento", "conocer", "saber", "entender",
        "comprensión", "entendimiento", "aprender", "enseñar", "enseñanza",
        "filosofía", "filósofo", "filosofar", "reflexión", "reflexionar",
        "meditar", "meditación", "contemplar", "observar", "examinar",
        "análisis", "analizar", "discernir", "discernimiento", "verdad",
        "verdadero", "certeza", "cierto", "principio", "principios",
        "doctrina", "precepto", "máxima", "sentencia"
    ]
}

# Compilar patrones regex para cada tema (más eficiente)
THEME_PATTERNS = {}
for theme, keywords in THEME_KEYWORDS.items():
    # Crear patrón que busque palabras completas
    pattern = r'\b(' + '|'.join(re.escape(kw) for kw in keywords) + r')\b'
    THEME_PATTERNS[theme] = re.compile(pattern, re.IGNORECASE)


def assign_themes(text: str, max_themes: int = 3) -> list:
    """
    Asigna temas a una meditación basándose en las palabras clave encontradas.
    Retorna hasta max_themes temas ordenados por relevancia.
    """
    text_lower = text.lower()
    theme_scores = {}

    for theme, pattern in THEME_PATTERNS.items():
        matches = pattern.findall(text_lower)
        if matches:
            # Puntuación basada en número de coincidencias únicas y totales
            unique_matches = len(set(matches))
            total_matches = len(matches)
            # Dar más peso a palabras únicas que a repeticiones
            theme_scores[theme] = unique_matches * 2 + total_matches

    # Ordenar por puntuación y tomar los mejores
    sorted_themes = sorted(theme_scores.items(), key=lambda x: x[1], reverse=True)

    # Filtrar temas con puntuación mínima y limitar cantidad
    result = []
    for theme, score in sorted_themes:
        if score >= 2 and len(result) < max_themes:
            result.append(theme)

    # Si no hay temas con suficiente puntuación, asignar al menos uno si hay alguna coincidencia
    if not result and sorted_themes:
        result = [sorted_themes[0][0]]

    # Si aún no hay temas, asignar "wisdom" como default (reflexiones filosóficas)
    if not result:
        result = ["wisdom"]

    return result


def main():
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    input_path = project_dir / "src" / "data" / "meditations.json"
    output_path = input_path  # Sobrescribir el mismo archivo

    print(f"Cargando meditaciones desde: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    meditations = data['meditations']
    print(f"Total de meditaciones: {len(meditations)}")

    # Asignar temas a cada meditación
    theme_counts = Counter()
    meditations_without_themes = 0

    for meditation in meditations:
        themes = assign_themes(meditation['text'])
        meditation['themes'] = themes

        for theme in themes:
            theme_counts[theme] += 1

        if not themes:
            meditations_without_themes += 1

    # Estadísticas
    print(f"\n{'='*60}")
    print("Estadísticas de asignación de temas:")
    print(f"{'='*60}")

    for theme, count in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True):
        # Buscar el nombre del tema
        theme_info = next((t for t in data['themes'] if t['id'] == theme), None)
        theme_name = theme_info['name'] if theme_info else theme
        percentage = (count / len(meditations)) * 100
        print(f"  {theme_name:25s}: {count:4d} meditaciones ({percentage:5.1f}%)")

    print(f"\nMeditaciones sin temas asignados: {meditations_without_themes}")

    # Distribución de cantidad de temas por meditación
    themes_per_meditation = Counter(len(m['themes']) for m in meditations)
    print(f"\nDistribución de temas por meditación:")
    for num_themes, count in sorted(themes_per_meditation.items()):
        print(f"  {num_themes} tema(s): {count} meditaciones")

    # Guardar resultado
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nJSON actualizado guardado en: {output_path}")

    # Mostrar ejemplos
    print(f"\n{'='*60}")
    print("Ejemplos de asignación:")
    print(f"{'='*60}")

    examples = [
        (2, 1),   # II.1 - Al despuntar la aurora
        (4, 3),   # IV.3 - Retiros
        (4, 49),  # IV.49 - Promontorio
        (6, 6),   # VI.6 - Mejor venganza
        (7, 59),  # VII.59 - Interior fuente del bien
        (12, 36), # XII.36 - Último
    ]

    for book, chapter in examples:
        for m in meditations:
            if m['book'] == book and m['chapter'] == chapter:
                themes_str = ", ".join(m['themes'])
                print(f"\n{book}.{chapter} -> [{themes_str}]")
                print(f"  \"{m['text'][:100]}...\"")
                break


if __name__ == "__main__":
    main()
