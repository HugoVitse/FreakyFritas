import json
import os
from typing import Dict, Any

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None


def parse_delivery_note_with_llm(text: str, model: str | None = None) -> Dict[str, Any]:
    """
    Parse un bon de livraison (BL) à partir du texte OCR.

    Retourne un dict avec :
      - shipper_name_address
      - shipper_siret
      - delivery_note_number
      - delivery_date
      - recipient_name_address
      - recipient_siret
      - items: liste d’objets { product_name, variety, quantity, unit, lot, origin }
    """
    if not OPENAI_AVAILABLE:
        raise RuntimeError("openai package not installed; install with `pip install openai`")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set in environment")

    model = model or os.getenv("OPENAI_MODEL", "gpt-4o")

    prompt_text = f"""
Vous êtes un expert en logistique et en réglementation fruits et légumes.
À partir du texte OCR d'un bon de livraison (BL), extrayez les informations suivantes
et retournez UNIQUEMENT un JSON valide (aucune explication) :

Champs racine :
- shipper_name_address : nom et adresse de l'expéditeur (ou fournisseur)
- shipper_siret : SIRET/SIREN de l'expéditeur s'il est présent
- delivery_note_number : numéro du bon de livraison / référence
- delivery_date : date de livraison au format ISO si possible (YYYY-MM-DD) ou texte brut
- recipient_name_address : nom et adresse du destinataire (le magasin/le client)
- recipient_siret : SIRET/SIREN du destinataire s'il est présent
- items : liste de lignes produits

Chaque élément de items doit avoir :
- product_name : nom du produit (ex: TOMATE, KIWI, POMME)
- variety : variété ou type si présent
- quantity : quantité attendue (nombre). Si '3 colis de 10', déduire 3 ou 30 selon ce qui est le plus logique et le préciser dans la structure.
- unit : uniquement des colis (trouver le nombre de colis par produits sur le BL)
- lot : numéro de lot s'il est visible sur le BL
- origin : pays d'origine si indiqué sur le BL ou déductible sans trop extrapoler

Règles :
- Corrigez les fautes classiques d'OCR (espaces, ponctuation, majuscules).
- Si un champ est introuvable, mettez-le à null.
- S'il y a plusieurs lignes produits, remplissez correctement items[*].
- Si le texte OCR est vide, retournez un JSON avec tous les champs racine à null et items: [].

Texte OCR du BL :
\"\"\"{text}\"\"\"

JSON :
"""

    messages = [
        {
            "role": "user",
            "content": [{"type": "text", "text": prompt_text}],
        }
    ]

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.0,
            max_tokens=800,
        )
        content = response.choices[0].message.content or ""
    except Exception as e:
        raise RuntimeError(f"LLM call failed: {e}")

    # Parsing JSON
    try:
        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1])
        parsed = json.loads(content)
    except Exception:
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1:
            try:
                parsed = json.loads(content[start : end + 1])
            except Exception as e:
                raise RuntimeError(f"LLM returned invalid JSON: {e}\n{content}")
        else:
            raise RuntimeError(f"LLM did not return JSON:\n{content}")

    # Normalisation minimale
    if "items" not in parsed or not isinstance(parsed["items"], list):
        parsed["items"] = []

    # S'assurer que chaque item a les clés attendues
    norm_items = []
    for it in parsed["items"]:
        if not isinstance(it, dict):
            continue
        norm_items.append(
            {
                "product_name": it.get("product_name"),
                "variety": it.get("variety"),
                "quantity": it.get("quantity"),
                "unit": it.get("unit"),
                "lot": it.get("lot"),
                "origin": it.get("origin"),
            }
        )
    parsed["items"] = norm_items

    for key in [
        "shipper_name_address",
        "shipper_siret",
        "delivery_note_number",
        "delivery_date",
        "recipient_name_address",
        "recipient_siret",
    ]:
        parsed.setdefault(key, None)

    return parsed


