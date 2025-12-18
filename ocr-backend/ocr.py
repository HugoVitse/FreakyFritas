from PIL import Image
from PIL import Image
import PIL
import pytesseract
import cv2
import json
from parser import parse_ocr_text
from typing import Optional
import argparse
import os
try:
    from llm_parser import parse_with_llm
except Exception:
    parse_with_llm = None

try:
    from ollama_parser import parse_with_ollama
except Exception:
    parse_with_ollama = None

try:
    from doctr_ocr import doctr_ocr, doctr_ocr_with_preprocessing
except Exception:
    doctr_ocr = None
    doctr_ocr_with_preprocessing = None

try:
    from paddleocr import PaddleOCR
    PADDLE_AVAILABLE = True
    _paddle_ocr_client = None
except Exception:
    PaddleOCR = None
    PADDLE_AVAILABLE = False
    _paddle_ocr_client = None


# main function   
def ocr_main(img):
    """Run Tesseract OCR with tuned config for French labels."""
    config = "--oem 3 --psm 6"
    return pytesseract.image_to_string(img, lang="fra", config=config)


def get_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def remove_noise(image):
    return cv2.medianBlur(image, 3)


def thresholding(image):
    return cv2.threshold(image, 100, 230, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]


def process_single_image(img_path: str, use_ollama: bool = False, use_llm: bool = False, use_doctr: bool = False, use_paddle: bool = False):
    """Process a single image: OCR + parsing.

    Args:
        img_path: path to the image file
        use_ollama: use Ollama local LLM for parsing
        use_llm: use OpenAI LLM for parsing
        use_doctr: use docTR OCR instead of Tesseract
        use_paddle: use PaddleOCR instead of Tesseract
    """
    # OCR Method selection
    if use_doctr and doctr_ocr is not None:
        # Use docTR OCR with preprocessing
        print(f"\n{'='*70}")
        print(f"Image: {os.path.basename(img_path)}")
        print(f"OCR Engine: docTR")
        print(f"{'='*70}")
        txt = doctr_ocr_with_preprocessing(img_path)
    elif use_paddle and PADDLE_AVAILABLE:
        # Use PaddleOCR
        print(f"\n{'='*70}")
        print(f"Image: {os.path.basename(img_path)}")
        print(f"OCR Engine: PaddleOCR")
        print(f"{'='*70}")
        global _paddle_ocr_client
        if _paddle_ocr_client is None:
            # lang='fr' is preferable for French labels; fallback to default if not available
            try:
                _paddle_ocr_client = PaddleOCR(use_angle_cls=True, lang='fr')
            except Exception:
                _paddle_ocr_client = PaddleOCR(use_angle_cls=True)
        # PaddleOCR expects a path or ndarray
        try:
            # Newer PaddleOCR uses `predict` (ocr is deprecated). Call predict first.
            try:
                result = _paddle_ocr_client.predict(img_path)
            except TypeError:
                # Older versions may still support ocr(); try that as fallback
                result = _paddle_ocr_client.ocr(img_path)

            # result can be nested lists like [[(box), (text, confidence)], ...]
            # or other similar structures depending on version. Extract any string texts.
            lines = []

            def _collect_texts(obj):
                if obj is None:
                    return
                if isinstance(obj, str):
                    lines.append(obj)
                elif isinstance(obj, (list, tuple)):
                    for item in obj:
                        _collect_texts(item)
                elif isinstance(obj, dict):
                    for v in obj.values():
                        _collect_texts(v)

            _collect_texts(result)
            # remove duplicates and empty strings while preserving order
            seen = set()
            clean = []
            for l in lines:
                s = l.strip()
                if not s:
                    continue
                if s in seen:
                    continue
                seen.add(s)
                clean.append(s)

            txt = '\n'.join(clean)
        except Exception as e:
            raise RuntimeError(f'PaddleOCR failed: {e}')
    else:
        # Use Tesseract OCR with preprocessing
        img = cv2.imread(img_path)
        if img is None:
            raise FileNotFoundError(f"Image not found: {img_path}")

        # Preprocessing
        img = get_grayscale(img)
        # upscale to help OCR on small text
        img = cv2.resize(img, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        img = thresholding(img)
        img = remove_noise(img)

        # OCR
        print(f"\n{'='*70}")
        print(f"Image: {os.path.basename(img_path)}")
        print(f"OCR Engine: Tesseract")
        print(f"{'='*70}")
        txt = ocr_main(img)
    
    print("OCR Text:")
    print(txt)
    print(f"{'='*70}\n")
    
    # Parse with selected method
    parsed = None
    
    # Priority: Ollama > OpenAI > regex
    if use_ollama and parse_with_ollama is not None:
        try:
            parsed = parse_with_ollama(txt)
            print(f'✓ Parsed with Ollama')
        except Exception as e:
            print(f'Ollama parse failed: {e} — trying other parsers')
    
    if parsed is None and use_llm and parse_with_llm is not None:
        try:
            parsed = parse_with_llm(txt)
            print(f'✓ Parsed with OpenAI')
        except Exception as e:
            print(f'OpenAI parse failed: {e} — falling back to regex parser')
    
    if parsed is None:
        parsed = parse_ocr_text(txt)
        print(f'✓ Parsed with regex rules')
    
    # Display results
    print("\nParsed fields:")
    print(json.dumps(parsed, ensure_ascii=False, indent=2))
    
    found = sum(1 for v in parsed.values() if v is not None)
    print(f"\n📊 Fields found: {found}/9")
    
    return {
        'image': os.path.basename(img_path),
        'raw': txt,
        'parsed': parsed
    }


if __name__ == '__main__':
    parser_arg = argparse.ArgumentParser(description='OCR + parsing for label images')
    parser_arg.add_argument('--llm', action='store_true', help='Use OpenAI LLM parsing (requires OPENAI_API_KEY and credits)')
    parser_arg.add_argument('--ollama', action='store_true', help='Use Ollama local LLM parsing (free, requires ollama installed)')
    parser_arg.add_argument('--doctr', action='store_true', help='Use docTR OCR engine instead of Tesseract')
    parser_arg.add_argument('--paddle', action='store_true', help='Use PaddleOCR instead of Tesseract')
    parser_arg.add_argument('--image', type=str, default='image_flou.png', help='Path to image file to process')
    parser_arg.add_argument('--all', action='store_true', help='Process all images in images, images_client and images_V2 folders')
    args = parser_arg.parse_args()

    use_llm_env = os.getenv('USE_LLM', '0') in ('1', 'true', 'True')
    use_ollama_env = os.getenv('USE_OLLAMA', '0') in ('1', 'true', 'True')
    
    use_llm = args.llm or use_llm_env
    use_ollama = args.ollama or use_ollama_env
    use_doctr = args.doctr
    use_paddle = args.paddle
    
    # Priority: --ollama > --llm > regex
    if use_ollama and use_llm:
        print("Warning: Both --ollama and --llm specified. Using Ollama (free).")
        use_llm = False

    def collect_image_files(dirs):
        exts = ('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif', '.webp')
        files = []
        base = os.path.dirname(__file__)
        for d in dirs:
            dpath = d if os.path.isabs(d) else os.path.join(base, d)
            if not os.path.isdir(dpath):
                continue
            for entry in sorted(os.listdir(dpath)):
                if entry.lower().endswith(exts):
                    files.append(os.path.join(dpath, entry))
        return files

    results = []
    try:
        if args.all:
            folders = ['images', 'images_client', 'images_V2']
            img_files = collect_image_files(folders)
        else:
            img_path = args.image
            if not os.path.isabs(img_path):
                img_path = os.path.join(os.path.dirname(__file__), img_path)
            # if a directory is passed, collect images in it
            if os.path.isdir(img_path):
                img_files = collect_image_files([img_path])
            else:
                img_files = [img_path]

        if not img_files:
            raise FileNotFoundError('No images found to process')

        for p in img_files:
            try:
                res = process_single_image(p, use_ollama=use_ollama, use_llm=use_llm, use_doctr=use_doctr, use_paddle=use_paddle)
                results.append(res)
            except Exception as e:
                print(f"Error processing {p}: {e}")

        out_path = os.path.join(os.path.dirname(__file__), 'results_bulk.json')
        with open(out_path, 'w', encoding='utf8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"\n✅ Bulk results saved to {out_path} ({len(results)} images processed)")

    except Exception as e:
        print(f"❌ Error: {e}")
