#!/usr/bin/env python3
"""
Script para extraer las meditaciones del PDF de Marco Aurelio.
Versión mejorada con parsing por páginas específicas de cada libro.
"""
import fitz  # PyMuPDF
import re
import json
from pathlib import Path


# Mapeo de libros a páginas (índice de fitz, 0-based)
# Cada libro empieza en start_page y termina antes de end_page
BOOK_PAGES = {
    1: (44, 56),    # Libro I
    2: (56, 65),    # Libro II
    3: (65, 76),    # Libro III
    4: (76, 92),    # Libro IV
    5: (92, 107),   # Libro V
    6: (107, 123),  # Libro VI
    7: (123, 139),  # Libro VII
    8: (139, 155),  # Libro VIII
    9: (155, 170),  # Libro IX
    10: (170, 185), # Libro X
    11: (185, 198), # Libro XI
    12: (198, 210), # Libro XII (hasta antes del índice)
}


def extract_book_text(pdf, start_page: int, end_page: int) -> str:
    """Extrae el texto de un rango de páginas."""
    text = ""
    for i in range(start_page, end_page):
        if i < len(pdf):
            page = pdf[i]
            text += page.get_text() + "\n"
    return text


def clean_text(text: str) -> str:
    """Limpia el texto de notas al pie, headers y otros artefactos."""
    lines = text.split('\n')
    clean_lines = []
    skip_until_chapter = False

    for line in lines:
        stripped = line.strip()

        # Saltar líneas vacías
        if not stripped:
            continue

        # Saltar números de página solos
        if re.match(r'^\d+\s*$', stripped):
            continue

        # Saltar headers como "MliDITACIONES", "MEDITACIONES"
        if re.match(r'^M[LlIiEe]?[DdIi]?[IiEe]?T[Aa][Cc][Ii][OoÓó][Nn][EeLlIi][IiLlEeSs]?S?\s*$', stripped, re.IGNORECASE):
            continue

        # Saltar headers de libro como "LIBRO X" o "L I B R O X"
        if re.match(r'^L\s*I?\s*B?\s*R?\s*O?\s+[IVX]+\s*$', stripped):
            continue
        if re.match(r'^LIBRO\s+[IVX]+\s*$', stripped):
            continue

        # Detectar inicio de notas al pie (generalmente referencias como ^1, ^2 o nombres propios con explicaciones)
        # Las notas suelen comenzar con referencias bibliográficas
        footnote_patterns = [
            r'^\s*[\^¹²³⁴⁵⁶⁷⁸⁹]\s*[A-Z]',  # ^1 Nombre...
            r'^Cf\.',
            r'^Según\s+[A-Z]',
            r'^Texto\s+(?:difícil|corrupto|con\s+lagunas)',
            r'^Existe\s+en\s+el\s+texto',
            r'^La\s+traducción',
            r'^Seguimos\s+a',
            r'^Aceptamos',
            r'^FARQUHARSON',
            r'^TRANNOY',
            r'^A\.\s*I\.\s*TRANNOY',
            r'^En\s+la\s+edición',
            r'^Sobre\s+la\s+respuesta',
            r'^\([^)]*conjetura[^)]*\)',
            r'^Esta\s+línea\s+se\s+refiere',
            r'^Los\s+cuados',
            r'^El\s+río\s+Gran',
        ]

        is_footnote = False
        for pattern in footnote_patterns:
            if re.match(pattern, stripped, re.IGNORECASE):
                is_footnote = True
                skip_until_chapter = True
                break

        if is_footnote:
            continue

        # Si estamos saltando, verificar si encontramos un nuevo capítulo
        if skip_until_chapter:
            if re.match(r'^\d+\.\s+[A-Z¿¡«]', stripped):
                skip_until_chapter = False
            else:
                continue

        # Detectar líneas que parecen continuación de notas
        # (nombres propios seguidos de explicaciones típicas de notas)
        if re.match(r'^[A-Z][a-záéíóú]+(?:io|o|a|as|os|e|es)?,?\s+(?:fue|era|es|son)\s+(?:un|una|el|la|uno)', stripped):
            if not re.match(r'^\d+\.', stripped):  # Si no empieza con número de capítulo
                skip_until_chapter = True
                continue

        clean_lines.append(stripped)

    return '\n'.join(clean_lines)


def parse_chapters(text: str, book_num: int) -> list:
    """Parsea el texto y extrae los capítulos."""
    chapters = []

    # Primero limpiamos el texto
    text = clean_text(text)

    # Unir líneas partidas por guiones
    text = re.sub(r'-\n', '', text)

    # Unir líneas que continúan una oración
    text = re.sub(r'(?<=[a-záéíóú,;])\n(?=[a-záéíóú])', ' ', text)

    # Normalizar saltos de línea múltiples
    text = re.sub(r'\n+', '\n', text)

    # Patrón para capítulos: número seguido de punto y espacio
    pattern = r'(?:^|\n)(\d+)\.\s+'

    parts = re.split(pattern, text)

    i = 1
    while i < len(parts) - 1:
        try:
            chapter_num = int(parts[i])
            content = parts[i + 1].strip()

            # Limpiar el contenido
            content = re.sub(r'\s+', ' ', content)

            # Eliminar cualquier referencia de nota que quede
            content = re.sub(r'[\^¹²³⁴⁵⁶⁷⁸⁹]+\d*', '', content)

            # Limpiar caracteres especiales del OCR
            content = content.replace('cueφo', 'cuerpo')
            content = content.replace('soφrendido', 'sorprendido')
            content = content.replace('soφrender', 'sorprender')
            content = content.replace('soφresa', 'sorpresa')
            content = content.replace('Esteφanía', 'Estefanía')
            content = content.replace('ténnino', 'término')
            content = content.replace('pennanezca', 'permanezca')

            # Eliminar headers de página que puedan haber quedado (varios formatos de OCR)
            content = re.sub(r'\d+\s*M[LlIiEe:\)\(]+[IiDd]*TAC[Ii][\(\)OoÓó]+N[EeLlIi:\)\(]+S?\s*', '', content)
            content = re.sub(r'M[LlIiEe:\)\(]+[IiDd]*TAC[Ii][\(\)OoÓó]+N[EeLlIi:\)\(]+S?\s*', '', content, flags=re.IGNORECASE)

            # Eliminar números de página con espacios (como "1 1 4" o "1 1")
            content = re.sub(r'\s+\d\s+\d\s*\d?\s*$', '', content)
            content = re.sub(r'\s+\d\s+\d\s+\d\s+', ' ', content)

            # Eliminar referencias como "Referencia a Epicuro"
            content = re.sub(r'\s*Referencia a [A-Z][a-záéíóú]+\.?\s*$', '', content)

            # Eliminar texto fragmentado al final (como "elestrat egoquecontrató a")
            content = re.sub(r'\s+[a-z]+\s*$', '', content)  # Eliminar palabra suelta al final
            content = re.sub(r'\s+Es algo así como si el\s*e\s*s\s*t\s*r\s*a\s*t\s*e\s*g\s*o.*$', '', content)
            content = re.sub(r'\s+Es algo así como si.*$', '', content)

            # Eliminar espacios extraños en medio de palabras (OCR errors)
            content = re.sub(r'(\w)\s+(\w)\s+(\w)\s+(\w)\s+(\w)\s+(\w)\s+(\w)',
                           lambda m: ''.join(m.groups()) if len(''.join(m.groups())) < 15 else m.group(0),
                           content)

            # Eliminar residuos de notas al final
            # Cortar si encontramos patrones típicos de inicio de nota
            cut_patterns = [
                r'\s+[A-Z][a-záéíóú]+,?\s+(?:fue|era)\s+(?:un|una|el|la)',
                r'\s+Cf\.\s+',
                r'\s+Según\s+[A-Z]',
                r'\s+Texto\s+(?:difícil|corrupto)',
                r'\s+FARQUHARSON',
                r'\s+TRANNOY',
            ]

            for cut_pattern in cut_patterns:
                match = re.search(cut_pattern, content)
                if match and match.start() > 50:  # Solo si hay contenido significativo antes
                    content = content[:match.start()].strip()

            # Limpiar espacios múltiples
            content = re.sub(r'\s+', ' ', content).strip()

            if len(content) > 10:
                chapters.append({
                    'chapter': chapter_num,
                    'text': content
                })

        except (ValueError, IndexError):
            pass

        i += 2

    return chapters


def main():
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    pdf_path = project_dir / "Marco Aurelio-Meditaciones.pdf"
    output_path = project_dir / "src" / "data" / "meditations_extracted.json"

    print(f"Abriendo PDF: {pdf_path}")
    pdf = fitz.open(str(pdf_path))

    all_meditations = []
    meditation_id = 1

    for book_num in range(1, 13):
        start_page, end_page = BOOK_PAGES[book_num]
        print(f"\nProcesando Libro {book_num} (páginas {start_page+1}-{end_page})...")

        book_text = extract_book_text(pdf, start_page, end_page)
        chapters = parse_chapters(book_text, book_num)

        print(f"  Encontrados {len(chapters)} capítulos")

        # Verificar que los capítulos están en orden correcto
        if chapters:
            chapter_nums = [ch['chapter'] for ch in chapters]
            print(f"  Capítulos: {chapter_nums[0]} - {chapter_nums[-1]}")

        for ch in chapters:
            all_meditations.append({
                'id': meditation_id,
                'book': book_num,
                'chapter': ch['chapter'],
                'text': ch['text'],
                'themes': []
            })
            meditation_id += 1

    pdf.close()

    print(f"\n{'='*60}")
    print(f"Total de meditaciones extraídas: {len(all_meditations)}")

    # Estadísticas por libro
    print("\nMeditaciones por libro:")
    for book in range(1, 13):
        count = len([m for m in all_meditations if m['book'] == book])
        print(f"  Libro {book:2d}: {count:3d} meditaciones")

    # Crear estructura JSON final
    output_data = {
        "author": "Marco Aurelio",
        "title": "Meditaciones",
        "description": "Reflexiones del emperador filósofo romano Marco Aurelio (121-180 d.C.)",
        "themes": [
            {"id": "virtue", "name": "Virtud", "icon": "⚖️"},
            {"id": "death", "name": "Muerte y Mortalidad", "icon": "💀"},
            {"id": "nature", "name": "Naturaleza", "icon": "🌿"},
            {"id": "duty", "name": "Deber y Responsabilidad", "icon": "🏛️"},
            {"id": "mind", "name": "Control Mental", "icon": "🧠"},
            {"id": "time", "name": "Tiempo y Transitoriedad", "icon": "⏳"},
            {"id": "adversity", "name": "Adversidad", "icon": "🔥"},
            {"id": "relationships", "name": "Relaciones Humanas", "icon": "🤝"},
            {"id": "simplicity", "name": "Simplicidad", "icon": "🪨"},
            {"id": "wisdom", "name": "Sabiduría", "icon": "📜"}
        ],
        "meditations": all_meditations
    }

    # Guardar JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\nJSON guardado en: {output_path}")

    # Mostrar muestras
    print("\n--- Muestra de primera meditación de cada libro ---")
    for book in range(1, 13):
        book_meds = [m for m in all_meditations if m['book'] == book]
        if book_meds:
            m = book_meds[0]
            print(f"\nLibro {book}, Cap. {m['chapter']}:")
            text_preview = m['text'][:120] + "..." if len(m['text']) > 120 else m['text']
            print(f"  {text_preview}")


if __name__ == "__main__":
    main()
