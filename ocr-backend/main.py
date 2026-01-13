import base64
import logging
import os
import tempfile
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ocr import process_single_image
from bl_parser import parse_delivery_note_with_llm


load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("ocr-backend")


class ScanRequest(BaseModel):
    image_base64: str
    filename: Optional[str] = None
    use_llm: bool = False
    use_ollama: bool = False
    use_doctr: bool = False
    use_mistral : bool = False
    use_paddle: bool = False


app = FastAPI(title="Fruit & Veg Label OCR API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/scan")
def scan_label(req: ScanRequest):
    """
    Reçoit une image encodée en base64, lance l'OCR + parsing, et renvoie les champs extraits.
    """
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 manquant")

    try:
        img_bytes = base64.b64decode(req.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="image_base64 invalide")

    suffix = os.path.splitext(req.filename or "capture.jpg")[1] or ".jpg"
    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    saved_path = None
    try:
        tmp_file.write(img_bytes)
        tmp_file.flush()
        tmp_file.close()

        # Sauvegarde locale de la capture (dossier captures/)
        captures_dir = os.path.join(os.path.dirname(__file__), "captures")
        os.makedirs(captures_dir, exist_ok=True)
        saved_path = os.path.join(
            captures_dir,
            os.path.basename(req.filename or f"capture_{os.path.basename(tmp_file.name)}"),
        )
        try:
            with open(saved_path, "wb") as f:
                f.write(img_bytes)
            logger.info("Capture sauvegardée: %s", saved_path)
        except Exception as e:
            logger.warning("Impossible de sauvegarder la capture: %s", e)

        logger.info(
            "Reçu image pour OCR: file=%s bytes=%s use_llm=%s use_ollama=%s use_doctr=%s use_paddle=%s",
            req.filename or tmp_file.name,
            len(img_bytes),
            req.use_llm,
            req.use_ollama,
            req.use_doctr,
            req.use_paddle,
            req.use_mistral
        )

        result = process_single_image(
            tmp_file.name,
            use_mistral=req.use_mistral,
            use_ollama=req.use_ollama,
            use_llm=req.use_llm,
            use_doctr=req.use_doctr,
            use_paddle=req.use_paddle,
        )
        logger.info(
            "OCR terminé: image=%s fields_found=%s",
            result.get("image"),
            result,
            sum(1 for v in result.get("parsed", {}).values() if v),
        )
        return {"success": True, "saved_path": saved_path, **result}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Erreur OCR/parsing")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.remove(tmp_file.name)
        except OSError:
            pass


@app.post("/scan-bl")
def scan_delivery_note(req: ScanRequest):
    """
    OCR + parsing LLM spécifique pour les bons de livraison.
    Retourne les infos expéditeur/destinataire + la liste des lignes produits.
    """
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 manquant")

    try:
        img_bytes = base64.b64decode(req.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="image_base64 invalide")

    suffix = os.path.splitext(req.filename or "bl.jpg")[1] or ".jpg"
    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    saved_path = None
    try:
        tmp_file.write(img_bytes)
        tmp_file.flush()
        tmp_file.close()

        # Sauvegarde locale de la capture (dossier captures/)
        captures_dir = os.path.join(os.path.dirname(__file__), "captures")
        os.makedirs(captures_dir, exist_ok=True)
        saved_path = os.path.join(
            captures_dir,
            os.path.basename(req.filename or f"bl_{os.path.basename(tmp_file.name)}"),
        )
        try:
            with open(saved_path, "wb") as f:
                f.write(img_bytes)
            logger.info("BL sauvegardé: %s", saved_path)
        except Exception as e:
            logger.warning("Impossible de sauvegarder le BL: %s", e)

        logger.info("Reçu BL pour OCR: file=%s bytes=%s", req.filename or tmp_file.name, len(img_bytes))

        # On réutilise le pipeline OCR pour obtenir le texte brut, sans parsing étiquette
        # Par défaut, utilise PaddleOCR pour les BL (meilleure reconnaissance)
        result = process_single_image(
            tmp_file.name,
            use_ollama=False,
            use_llm=False,
            use_doctr=req.use_doctr,
            use_paddle=req.use_paddle or True,  # Force Paddle pour BL par défaut
        )
        raw_text = result.get("raw", "")
        try:
            parsed_bl = parse_delivery_note_with_llm(raw_text)
            logger.info("BL parsé avec LLM, items=%s", len(parsed_bl.get("items", [])))
        except Exception as e:
            logger.exception("Erreur LLM BL")
            raise HTTPException(status_code=500, detail=str(e))

        return {
            "success": True,
            "saved_path": saved_path,
            "raw": raw_text,
            "parsed": parsed_bl,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Erreur OCR/parsing BL")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.remove(tmp_file.name)
        except OSError:
            pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)

