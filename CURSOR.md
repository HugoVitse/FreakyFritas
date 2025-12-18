# Notes projet scanner étiquettes

## Arborescence utile
- `etiquettes-scanner/` : app mobile Expo/React Native.
  - `App.tsx` : écran caméra, capture photo, envoi API, historique scrollable, modes BL/étiquettes.
  - `.env` (optionnel) : `EXPO_PUBLIC_API_URL` vers le backend.
- `ocr-backend/` : API FastAPI + OCR.
  - `main.py` : endpoints `/health`, `/scan` (étiquette), `/scan-bl` (bon de livraison), logs, sauvegarde des captures dans `captures/`.
  - `ocr.py` + `parser.py` + `llm_parser.py` : pipeline OCR pour étiquettes (Tesseract par défaut, LLM OpenAI en option).
  - `bl_parser.py` : parsing LLM spécifique pour les bons de livraison (produits + quantités + expéditeur/destinataire).
  - `requirements.txt` : dépendances (incl. python-dotenv, fastapi, uvicorn).
  - `.env` (copier `env.example`) : `OPENAI_API_KEY`, `OPENAI_MODEL`, `USE_LLM`, `USE_OLLAMA`.

## Lancement backend
```bash
cd ocr-backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp env.example .env  # puis renseigner OPENAI_API_KEY si LLM
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- Captures sauvegardées dans `ocr-backend/captures/`.
- Réponse `/scan` contient `parsed`, `raw`, `image`, `saved_path`.

## Lancement front
```bash
cd etiquettes-scanner
npm install
EXPO_PUBLIC_API_URL=http://<ip_pc>:8000 npx expo start
```
- Bouton capture non bloquant : on peut enchaîner les photos, les uploads se font en fond, historique garde les derniers (max ~20).
- Safe area via `react-native-safe-area-context`.
- Capture qualité élevée : `takePictureAsync` avec `quality: 1` et `skipProcessing: false` pour des images plus nettes.
- Cadre de visée + rognage : un guide rectangle centré est affiché; la photo est croppée autour de ce cadre (80% largeur, 50% hauteur) avant envoi via `expo-image-manipulator`.
- Conformité affichée : chaque scan reçoit un statut (vert/rouge) basé sur la présence des champs clés (Produit, Origine, Catégorie, Calibre, Lot). Badge visible sur le dernier résultat et dans l’historique.
- Historique cliquable : chaque entrée est extensible pour afficher tous les champs, y compris ceux manquants.
- Mode BL / Étiquettes : un switch permet de choisir entre la capture d’un bon de livraison (`/scan-bl`) et la capture d’étiquettes (`/scan`).
- Bon de livraison : le backend renvoie `parsed` avec `shipper_*`, `recipient_*` et `items[]` ({product_name, variety, quantity, unit, lot, origin}); le front affiche un résumé du BL courant.
- Comptage/Comparaison : pour chaque étiquette scannée, le front incrémente un compteur par `product_name` et affiche dans l’historique `Étiquettes scannées: N / quantité attendue` si le BL courant contient cette ligne produit.

## Points à savoir
- OCR : Tesseract requis sur la machine (Arch : `sudo pacman -S tesseract tesseract-data-fra`).
- OCR amélioré : Tesseract tuné (`lang=fra`, `--psm 6`, upscale x2) et possibilité d'utiliser PaddleOCR (lang=fr) via le backend pour de meilleurs résultats sur BL/étiquettes difficiles.
- Mode LLM : nécessite `OPENAI_API_KEY` chargé dans l’environnement du backend.
- Historique et dernier résultat gérés côté front seulement (pas de persistance locale).
- API tolère aussi les flags `use_llm`, `use_ollama`, `use_doctr`, `use_paddle` dans la requête.

