import re
from typing import Dict, Optional


def normalize_spaces(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def extract_field(patterns, text: str) -> Optional[str]:
    for pat in patterns:
        m = re.search(pat, text, flags=re.IGNORECASE)
        if m:
            # return first non-empty group or whole match
            groups = [g for g in m.groups() if g]
            if groups:
                val = normalize_spaces(groups[0])
            else:
                val = normalize_spaces(m.group(0))
            # Nettoyage : retire unités, parenthèses, points, etc (NE PAS enlever les pays)
            val = re.sub(r"[\(\)\[\]{}\"'`´]", '', val)
            # enlever uniquement unités/mots techniques, laisser les noms de pays
            val = re.sub(r"\b(mm|g|kg|pcs?|cat(egorie)?|cal(ibre)?|lot|emb|bio|net|poids|date|code|barcode|ean)\b", '', val, flags=re.IGNORECASE)
            val = re.sub(r"\s+", ' ', val).strip(' ,:-')
            return val if val else None
    return None


def parse_ocr_text(text: str) -> Dict[str, Optional[str]]:
    """Parse OCR output from fruit/veg label and return a structured dict.

    Fields extracted:
      - product: product name / brand
      - variety: variety / varieté
      - calibre: calibre or size
      - category: CAT or category
      - count: number or 'Nombre'
      - origin: origine
      - lot: lot number
      - emb: EMB code
      - ean: barcode / EAN if present

    The function uses regexes tolerant to common OCR noise (punctuation, spaces).
    """
    if not text:
        return {}

    # collapse weird characters and normalize
    txt = text.replace('\u2014', '-')
    txt = txt.replace('\n', ' ')
    txt = re.sub(r"[|\\/]+", ' ', txt)
    txt = re.sub(r"\s+", ' ', txt)

    # patterns (ordered) - each is a list of regexes to try
    patterns = {
        'product': [
            r"Produit\s*[:\-]?\s*([A-Za-z0-9\- ]{3,})",
            r"([A-Z][A-Z0-9\- ]{3,})\s+\(?\bwww\b",
            r"([A-Z][A-Z0-9\- ]{3,})",
            r"([A-Z][a-zéèêàâîôûç\- ]{3,})"
        ],
        'variety': [
            r"Vari[eé]t[eé]?\s*[:\-]?\s*([A-Za-z0-9\-()' ]+)",
            r"Var\.?\s*[:\-]?\s*([A-Za-z0-9\-()' ]+)",
            r"YARIETE\s*[:\-]?\s*([A-Za-z0-9\-()' ]+)"
        ],
        'calibre': [
            r"Cal(?:ibre|\.)?\s*[:\-]?\s*([0-9]{1,3}(?:/[0-9]{1,3})?)",
            r"Cal(?:ibre|\.)?\s*[:\-]?\s*([0-9]{1,3})",
            r"([0-9]{1,3}/[0-9]{1,3})\s*mm",
            r"([0-9]{1,3})\s*mm"
        ],
        'category': [
            r"Cat(?:égorie|egorie|\.|:)?\s*[:\-]?\s*([A-Za-z0-9]+)",
            r"CAT\s*[:\-]?\s*([A-Za-z0-9]+)"
        ],
        'count': [
            r"Nombre\s*[:\-]?\s*([0-9]+)\s*Pcs?",
            r"Nombre\s*[:\-]?\s*([0-9]+)",
            r"([0-9]+)\s*Pcs"
        ],
        'origin': [
            r"ORIGINE\s*[:\-]?\s*([A-ZÉÈA-ZéèçÉÈÇ ]+)",
            r"Origine\s*[:\-]?\s*([A-Za-z\-éèçÉÈÇ ]+)",
            r"Origine\s*([A-Za-z\-éèçÉÈÇ ]+)",  # sans deux-points ni tiret
            r"Origin[eé]?\s*[:\-]?\s*([A-Za-z\- ]+)",
            r"Agriculture\s*[:\-]?\s*([A-Za-z\- ]+)"
        ],
        'lot': [
            r"Lot\s*[:\-]?\s*([A-Za-z0-9\-]+)",
            r"N[°ºo]?\s*Lot\.?\s*[:\-]?\s*([A-Za-z0-9\-]+)",
            r"Code Lot\s*[:\-]?\s*([A-Za-z0-9\-]+)",
            r"Lot\.?\s*([0-9]{4,})"
        ],
        'emb': [
            r"EMB\s*[:\-]?\s*([A-Za-z0-9\-]+)",
            r"Emballe\s*[:\-]?\s*([A-Za-z0-9\-]+)",
            r"Emb\.?\s*([A-Za-z0-9\-]+)"
        ],
        'ean': [
            r"(\b\d{12,13}\b)",
            r"EAN\s*[:\-]?\s*(\d{8,13})",
            r"Code\s*[:\-]?\s*(\d{8,13})",
            r"GGN\s*[:\-]?\s*(\d{8,13})"
        ]
    }


    result = {}
    for key, pats in patterns.items():
        val = extract_field(pats, txt)
        if val:
            result[key] = val
        else:
            result[key] = None

    # Nettoyage du champ origin pour éviter de capturer 'Ne', 'LOT', etc.
    if result.get('origin'):
        val = result['origin']
        # supprime les mots parasites (sauf pays)
        val = re.sub(r"\b(Ne|LOT|LE|LA|DR|EMBALLE|EMBALLÉ|POUR|TRAITE|AVEC|ET|CIRE|E|NET|POIDS|TRAITEMENTS|POST|RÉCOLTE|RECOLTE|PAR|CONDITIONNÉ|CONDITIONNE|POUR|ST|CHARLES|INTERNATIONAL|BP|PERPIGNAN|IMAZALIL|CIRE|CIRE E|CIRE E-903|TRAITE AVEC|TRAITE AVEC IMAZALIL|TRAITE AVEC IMAZALIL ET CIRE E-903)\b", '', val, flags=re.IGNORECASE)
        val = val.strip(' ,:-')
        # Si vide, on laisse None
        result['origin'] = val if val else None

    # Fallback : si pas d'origine, cherche un pays connu seul dans le texte
    if not result.get('origin') or not result['origin']:
        countries = [
            'FRANCE', 'ESPAGNE', 'ITALIE', 'MAROC', 'TUNISIE', 'ALLEMAGNE', 'BELGIQUE',
            'PAYS-BAS', 'PORTUGAL', 'GRECE', 'TURQUIE', 'ISRAEL', 'PÉROU', 'PEROU', 'CHILI', 'AFRIQUE DU SUD'
        ]
        for c in countries:
            # cherche le pays seul ou précédé de 'Origine' sans deux-points
            if re.search(rf"(?:Origine\s+)?\b{c}\b", txt, flags=re.IGNORECASE):
                result['origin'] = c.capitalize()
                break

    # Fallback pour l'origine : détecte pays connus même sans label
    if not result.get('origin') or not result['origin']:
        countries = [
            'FRANCE', 'ESPAGNE', 'ITALIE', 'MAROC', 'TUNISIE', 'ALLEMAGNE', 'BELGIQUE',
            'PAYS-BAS', 'PORTUGAL', 'GRECE', 'TURQUIE', 'ISRAEL', 'PÉROU', 'PEROU', 'CHILI', 'AFRIQUE DU SUD'
        ]
        for c in countries:
            if re.search(rf"\b{c}\b", txt, flags=re.IGNORECASE):
                result['origin'] = c.capitalize()
                break

    # product: try to capture a leading uppercase phrase if not found
    if not result.get('product'):
        m = re.search(r"([A-Z][A-Z0-9 \-]{3,40})", text)
        if m:
            result['product'] = normalize_spaces(m.group(1))

    # lightweight normalization
    if result.get('variety'):
        # remove surrounding parentheses and stray commas
        result['variety'] = re.sub(r"^[\(\s]+|[\)\s]+$", '', result['variety']).strip(', ')

    if result.get('calibre'):
        # keep only numeric part or fraction
        m = re.search(r"(\d{1,3}(?:/\d{1,3})?)", result['calibre'])
        if m:
            result['calibre'] = m.group(1)

    # final cleanup: strip all strings
    for k, v in list(result.items()):
        if isinstance(v, str):
            result[k] = v.strip()

    # remove trailing joined field names (common when OCR misses line breaks)
    stopwords = r"\b(?:Calibre|CAT|Catégorie|Nombre|Lot|EMB|COC|Origin|Origine|EAN|Poids|Net|Date|Code)\b"
    for key in ('variety', 'origin', 'product'):
        val = result.get(key)
        if val:
            m = re.search(stopwords, val, flags=re.IGNORECASE)
            if m:
                # cut everything from the stopword onwards
                result[key] = val[:m.start()].strip(' ,:-')

    return result


if __name__ == '__main__':
    sample = """
3l gg KIWIFRUIT SUNGOLD (UL WWW.ZESPRICOM,jhe AZ FRANCE 84300 CAVAILLON EMB:84035) COC 3605260000004 Variété: Zesy002 (Jaune) Calibre: 30 114/124¢g CAT 1 Nombre: 4 Pcs Origine: Nouvelle-zélande Lot:265475
"""
    print(parse_ocr_text(sample))
