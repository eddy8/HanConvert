#!/usr/bin/env python3
"""Build the browser index used by the Japanese Kanji tools."""

from __future__ import annotations

import argparse
import gzip
import json
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path


KANJIDIC_URL = "https://www.edrdg.org/kanjidic/kanjidic2.xml.gz"
KRADFILE_URL = "https://www.edrdg.org/uploads/kradfile.gz"
LICENCE_URL = "https://www.edrdg.org/edrdg/licence.html"


def child_text(element: ET.Element, path: str) -> str:
    child = element.find(path)
    return (child.text or "").strip() if child is not None else ""


def parse_int(value: str) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(value for value in values if value))


def parse_components(path: Path) -> dict[str, list[str]]:
    components: dict[str, list[str]] = {}
    with gzip.open(path, "rt", encoding="euc_jp") as source:
        for raw_line in source:
            line = raw_line.strip()
            if not line or line.startswith("#") or " : " not in line:
                continue
            character, raw_components = line.split(" : ", 1)
            components[character] = unique(raw_components.split())
    return components


def radical_character(number: int | None) -> str:
    if not number or number < 1 or number > 214:
        return ""
    return unicodedata.normalize("NFKC", chr(0x2F00 + number - 1))


def parse_kanjidic(path: Path, components: dict[str, list[str]]) -> tuple[dict[str, str], list[dict]]:
    header: dict[str, str] = {}
    records: list[dict] = []
    with gzip.open(path, "rb") as source:
        for event, element in ET.iterparse(source, events=("end",)):
            if element.tag == "header":
                header = {
                    "fileVersion": child_text(element, "file_version"),
                    "databaseVersion": child_text(element, "database_version"),
                    "dateOfCreation": child_text(element, "date_of_creation"),
                }
                element.clear()
                continue
            if element.tag != "character":
                continue

            character = child_text(element, "literal")
            radical = parse_int(next((node.text or "" for node in element.findall("./radical/rad_value") if node.get("rad_type") == "classical"), ""))
            stroke_counts = unique([(node.text or "").strip() for node in element.findall("./misc/stroke_count")])
            readings_on: list[str] = []
            readings_kun: list[str] = []
            meanings: list[str] = []
            for group in element.findall("./reading_meaning/rmgroup"):
                for reading in group.findall("reading"):
                    value = (reading.text or "").strip()
                    if reading.get("r_type") == "ja_on":
                        readings_on.append(value)
                    elif reading.get("r_type") == "ja_kun":
                        readings_kun.append(value)
                for meaning in group.findall("meaning"):
                    if meaning.get("m_lang") in (None, "en"):
                        meanings.append((meaning.text or "").strip())

            record = {
                "character": character,
                "radical": radical,
                "radicalCharacter": radical_character(radical),
                "radicalNames": unique([(node.text or "").strip() for node in element.findall("./misc/rad_name")]),
                "strokeCounts": [number for value in stroke_counts if (number := parse_int(value)) is not None],
                "grade": parse_int(child_text(element, "./misc/grade")),
                "frequency": parse_int(child_text(element, "./misc/freq")),
                "jlptLegacy": parse_int(child_text(element, "./misc/jlpt")),
                "onReadings": unique(readings_on),
                "kunReadings": unique(readings_kun),
                "nanori": unique([(node.text or "").strip() for node in element.findall("./reading_meaning/nanori")]),
                "meanings": unique(meanings),
                "components": components.get(character, []),
            }
            records.append({key: value for key, value in record.items() if value not in (None, [], "")})
            element.clear()

    records.sort(key=lambda record: ord(record["character"]))
    return header, records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("kanjidic", type=Path)
    parser.add_argument("kradfile", type=Path)
    parser.add_argument("--output", type=Path, default=Path("data/japanese-kanji/index.json"))
    args = parser.parse_args()

    components = parse_components(args.kradfile)
    header, records = parse_kanjidic(args.kanjidic, components)
    radical_counts = Counter(record.get("radical") for record in records if record.get("radical"))
    radicals = [
        {"number": number, "character": radical_character(number), "count": radical_counts[number]}
        for number in sorted(radical_counts)
    ]
    payload = {
        "meta": {
            **header,
            "recordCount": len(records),
            "kanjidicSource": KANJIDIC_URL,
            "kradfileSource": KRADFILE_URL,
            "licence": "CC BY-SA 4.0",
            "licenceUrl": LICENCE_URL,
            "copyright": "Electronic Dictionary Research and Development Group",
        },
        "radicals": radicals,
        "records": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {len(records):,} Japanese Kanji records at {args.output}")


if __name__ == "__main__":
    main()
