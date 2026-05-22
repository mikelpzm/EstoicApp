#!/usr/bin/env python3
"""Audit the Meditations corpus for likely OCR/note artifacts.

This is intentionally conservative: it does not rewrite the corpus. It prints
candidate rows so manual cleanup can focus on the worst reading problems first.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src" / "data" / "meditations.json"

CHECKS = {
    "long_passage": lambda text: len(text) > 1200,
    "ocr_glued_case": lambda text: bool(re.search(r"[a-záéíóúñ][A-ZÁÉÍÓÚÑ]", text)),
    "orphan_footnote_mark": lambda text: bool(re.search(r"\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+'(?=[:\s])|\s'\s", text)),
    "known_ocr_tokens": lambda text: bool(re.search(r"mimadree|unifonnidad|páados|cuerpO|deLinRo|espíritufamili", text, re.I)),
    "page_digit_artifact": lambda text: bool(re.search(r"\s\d+\s+(?=misma|virtud|naturaleza|razón|vida|muerte|alma|cuerpo)", text, re.I)),
}


def load_rows() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as fh:
        return json.load(fh)["meditations"]


def main() -> int:
    rows = load_rows()
    total_hits = 0
    print(f"Corpus: {len(rows)} meditations")
    for name, check in CHECKS.items():
        hits = [row for row in rows if check(row.get("text", ""))]
        total_hits += len(hits)
        print(f"\n{name}: {len(hits)} candidates")
        for row in hits[:12]:
            text = " ".join(row["text"].split())
            print(f"- id={row['id']} book={row['book']} chapter={row['chapter']} len={len(row['text'])}: {text[:180]}")
    print(f"\nTotal check hits: {total_hits}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
