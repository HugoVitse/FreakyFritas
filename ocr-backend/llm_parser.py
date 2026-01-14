import os
import json
from typing import Dict, Optional

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None


def parse_with_llm(text: str, model: str = None) -> Dict[str, Optional[str]]:
    """Send OCR text to an LLM to extract structured label fields.

    Requires OPENAI_API_KEY in environment and the `openai` package (v1.0+).
    If not available, raises RuntimeError.

    Returns a dict with keys: product, variety, calibre, category, count, origin, lot, emb, ean
    """
    if not OPENAI_AVAILABLE:
        raise RuntimeError('openai package not installed; install with `pip install openai`')

    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise RuntimeError('OPENAI_API_KEY not set in environment')

    model = model or os.getenv('OPENAI_MODEL', 'gpt-4o')
    # Construct a clear, concise French prompt and format it for the newer OpenAI client
    prompt_text = (
        "Vous êtes un expert en étiquetage pour fruits et légumes. "
        "À partir du texte OCR fourni, extrayez et normalisez les champs réglementaires demandés ci-dessous. "
        "Corrigez les erreurs d'OCR (espaces, ponctuation, caractères confondus). "
        " Déduire la valeur la plus probable si c'est pas trop extrapolé "
        "Si le text OCR est vide, retournez un objet JSON avec les champs obligatoires et les valeurs None. "
        "Retournez UNIQUEMENT un objet JSON valide (aucune explication). "
        "Utilisez des noms de champs en anglais en minuscules (snake_case) et mettez None si absent. "
        "Champs à trouver (mettre None si non trouvé) (snake_case) :\n"
        "- packer_name_address : identité de l'emballeur/expéditeur — nom et adresse complète (rue, ville, pays)\n"
        "- packed_for_packer_code : code de l'emballeur lié à la mention 'Emballé pour' parfois sur la meme ligne que des abréviations comme 'Exp' pour expéditeur ou 'Emb' pour emballeur. Il peut parfois être en fin de ligne tandis que le descriptif peut être en début de ligne (avec un grand espace entre les deux)\n"
        "- packer_iso_code : code d'identification officiel (Soit une suite de 2 lettre ou 3 lettre uniquement quand ce n'est pas suivi de chiffres. Attention à ne pas confondre avec le code emballeur, tu ne peux pas récupérer les mêmes informations, si tu ne trouves rien, ne met rien)\n"
        "- packed_for_name_address : mention 'Emballé pour' — nom et adresse du vendeur\n"
        "- variety : variété ou type commerciale, si elle n'est pas présente mettre le nom du produit.\n"
        "- origin : pays d'origine (obligatoire, le traduire en français)\n"
        "- product_name : nom du produit (espèce, obligatoire si non visible, ne pas hésiter à déduire si tu connais déjà la variété par exemple)\n"
        "- category : catégorie commerciale (2 types de valeurs possible : soit 'EXTRA' soit un chiffre (le convertir toujours en chiffre ROMAIN))\n"
        "- post_product_treatement : traitement post production (traitement chimique appliqué sur les fruits).\n"
        "- bio : préciser vrai ou faux selon si le produit est bio ou non\n"
        "- calibre : calibre\n"
        "- piece_count : nombre de pièces\n"
        "- net_weight : poids net\n"
        "- prepacked : préciser vrai si la mention de préemballage existe sinon mettre faux\n"
        "- traceability_note : mention libre de traçabilité\n"
        "- traceability_code : code de traçabilité explicite (ex: 'Traçabilité : 1234')\n"
        "- additionals_informations : mentions complémentaires concernant le produit\n"
        "- lots : numéro(s) de lot\n"
        "- intended_use : mention spéciale ('destiné à la transformation' ou 'au don')\n"
        "- datage_code : code spéciale composé d'une lettre pour  le mois (A= janvier, B = février etc) et d'un nombre pour le jour du mois (K21 = 21 novembre)\n"
        "Vous pouvez également extraire si présents : logistic_platform, store_identifier, delivery_date, internal_product_code, product_label, production_method, packaging, packaging_weight, pcb, pcb_unit.\n"
        "Texte OCR:\n" + text + "\n\nJSON:"
    )

    # New OpenAI client expects message content as a list of dicts like {"type":"text","text": "..."}
    prompt = [{"type": "text", "text": prompt_text}]

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=512,
        )
        content = response.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f'LLM call failed: {e}')

    # try to parse JSON from response
    try:
        content = content.strip()
        print(content)
        # remove markdown code fences if present
        if content.startswith('```'):
            lines = content.split('\n')
            # remove first line (```json or ```) and last line (```)
            content = '\n'.join(lines[1:-1])
        parsed = json.loads(content)
    except Exception:
        # try to extract JSON from text
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1:
            try:
                parsed = json.loads(content[start:end+1])
            except Exception as e:
                raise RuntimeError(f'LLM returned invalid JSON: {e}\n{content}')
        else:
            raise RuntimeError(f'LLM did not return JSON:\n{content}')

    # ensure all keys from the prompt exist (return null if absent)
    keys = [
        # Fields exactly matching the prompt (primary)
        'packer_name_address',
        'packer_iso_code',
        'packed_for_name_address',
        'packed_for_packer_code',
        'origin',
        'product_name',
        'variety',
        'category',
        'calibre',
        'piece_count',
        'datage_code',
        'post_product_treatement',
        'bio',
        'additionals_informations',
        'net_weight',
        'prepacked',
        'traceability_note',
        'traceability_code',
        'lots',
        'intended_use'
    ]
    out = {k: parsed.get(k) for k in keys}
    return out


if __name__ == '__main__':
    import sys
    sample = ' '.join(sys.argv[1:]) or 'Origine France\nCalibre: 20'
    try:
        result = parse_with_llm(sample)
        print('LLM parse result:')
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f'LLM parse error: {e}')
