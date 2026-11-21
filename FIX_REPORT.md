# NutriCrop Fix Report

## Crop Doctor follow-up — 2026-11-19

### Reproduced issue and cause

The local expert adapter has no general image classifier. A custom image was returned as a generic inconclusive result, which looked like a successful analysis; live Gemini was implemented but required a server-side `VISION_MODEL_API_KEY`. The browser sent the file as multipart field `file`, making integrations that expect the conventional `image` field incompatible.

### Fixes

- Local custom-photo requests without a configured classifier now return HTTP 503 with setup instructions instead of a misleading diagnosis.
- The endpoint accepts both multipart `image` and legacy `file`; the frontend now sends `image`.
- Added explicit `CROP_DOCTOR_MOCK` mode. It recognizes only the SHA-256 hashes of three bundled, CC BY 4.0 dataset fixtures (healthy onion, tomato leaf curl, rice blast). All other images are rejected in mock mode. Mock responses are marked as demo data and cannot be mistaken for live analysis.
- Existing live Gemini requests remain backend-only, send the actual image bytes, request the selected language, use a 30-second timeout, and keep generated chemical advice out of the government-verified treatment list. The model ID is configurable and defaults to `gemini-3.8-flash`.
- The upload error stays visible and offers a retry for selected photos. Result rendering tolerates missing optional treatment arrays, and a demo badge is only shown for demo results.
- Added multipart endpoint and service tests, and recorded dataset attribution in `backend/tests/crop-doctor/ATTRIBUTION.md`.

### Verification and outstanding work

- `cd backend && venv/bin/python -m pytest tests/ -q` — **44 passed** (including multipart endpoint and low-confidence safety coverage).
- `cd frontend && npx tsc --noEmit` — passed.
- `cd frontend && npm run build` — passed. Google Fonts could not be downloaded in this restricted environment, so the configured font fallbacks were used.
- `npm run check:i18n` still fails: there are zero missing keys, but 75 unchanged English strings in Hindi and Telugu, 187 each in Marathi/Punjabi/Tamil/Kannada/Malayalam/Bengali, and 326 each in Gujarati/Odia. Whole-site translations and a full browser-based mobile/desktop control audit remain incomplete.
- The development servers were present, but sandboxed `curl` could not connect to localhost; browser automation is unavailable in this chat. The multipart flow was instead exercised using FastAPI's in-process ASGI test client.
- The backend tests emit no project warning after replacing deprecated `utcnow`; a previous Starlette/httpx test-client deprecation was avoided by using `httpx.AsyncClient` directly.

### Run steps for Crop Doctor

Copy `backend/.env.example` to `backend/.env`. For the bounded demo, set `CROP_DOCTOR_MOCK=true`; for live photo analysis, set `VISION_MODEL_MODE=gemini` and `VISION_MODEL_API_KEY` to a private key. `VISION_MODEL_NAME` defaults to `gemini-3.8-flash` and can be changed to another model enabled for the account. Restart the backend after changing the environment. Mock mode only accepts the exact fixture files under `backend/tests/crop-doctor/images/`.

## Summary

This pass fixes the reported Organic Carbon range/decimal handling, makes soil calculation failures visible instead of returning fixed offline recommendations, makes submitted OC affect the calculated rating and organic amendment recommendation, and connects custom crop photos to an optional backend-only Gemini vision integration. The frontend type-checks and the backend test suite passes.

This report is explicit about remaining work: the requested full-site translation and exhaustive cross-device QA are not complete. `npm run check:i18n` currently fails because many translated catalogs still contain English strings. `npm run lint` opens Next's interactive ESLint setup because ESLint is not installed/configured in this repository.

## Soil Health

### Root causes

- The Organic Carbon field was `type="number"`, constrained to 0.1–2.5, with 0.05 steps. That excluded values the feature is meant to accept and did not support decimal commas.
- The form had no explicit submit validation for OC or other numeric values.
- The offline catch path displayed hardcoded fertilizer quantities and always described OC as Medium, even when the submitted value was Low or High.
- The API accepted OC=0 and the calculator did not reject non-finite values or invalid units.

### Fixes

- OC is now a decimal-text field with a numeric mobile keypad; comma decimals normalize to dots. Bounds are centralized as `OC_MIN_PERCENT` and `OC_MAX_PERCENT` (0.01 and 5.0). The Low/Medium/High thresholds are below 0.50%, 0.50–0.75%, and above 0.75%.
- Form and API validation reject invalid OC, farm size, numeric values, and units with a visible message.
- The soil result includes a labeled estimated indicator (N/P/K/OC/pH class based), displays the submitted OC class, and increases the FYM recommendation for Low OC. It is explicitly labeled an estimate, not an official Soil Health Card score.
- Removed the fake fixed offline calculation. An API failure now leaves the form available and shows a retryable error instead of presenting invented results.
- Added boundary/class tests for OC and tests for the score and FYM behavior.

## Crop Doctor

### Root causes

- The existing local service had curated sample data but no custom-image classifier; for uploaded images it intentionally returned “no disease could be confirmed.”
- The configured cloud service was a `NotImplementedError` stub.
- Upload validation omitted HEIC, and large images were sent without client-side resizing.
- The result UI had no save-to-farm action and displayed generated advice under a “CIBRC Verified” heading.

### Fixes

- Added an optional Gemini `generateContent` call from the FastAPI backend. It sends the image bytes and selected language, requests structured JSON, validates required fields, bounds confidence, and normalizes the response to the existing UI contract. API keys stay on the backend.
- If no model is configured, custom uploads remain explicitly inconclusive; the system does not claim the image is healthy or diagnosed. External API/configuration failures return clear service errors.
- JPG, PNG, WebP, and HEIC/HEIF are accepted by the input. Images are resized to at most 1280 px and compressed to JPEG when the browser can decode them. Unsupported HEIC decoders receive a conversion-to-JPG message.
- Results can be saved on the device and appear in My Farm. Generated chemical suggestions are not presented as CIBRC-verified; chemical use is deferred to approved product labels and local KVK/agriculture officer review.

### Setup

Copy `backend/.env.example` to `backend/.env`, set `VISION_MODEL_MODE=gemini`, and supply `VISION_MODEL_API_KEY` to enable custom-photo AI analysis. Without it, curated benchmark examples work, but uploaded photos are inconclusive.

## Translation

- Added Gujarati and Odia language choices, catalog files, script font classes, and Google font families. Existing Hindi, Telugu, Marathi, Punjabi, Tamil, Kannada, Bengali, and Malayalam choices remain.
- Added translated OC and core upload/save labels for Hindi and Telugu; other catalogs received matching keys with English fallbacks.
- Added a development warning when a lookup is missing from the selected language and an `npm run check:i18n` completeness script.
- The checker reports **zero missing catalog keys** across the language files, but fails on untranslated text. Current result: Hindi and Telugu each have 75 English-identical strings; Marathi, Punjabi, Tamil, Kannada, Malayalam, and Bengali each have 187; Gujarati and Odia each have 326. These counts include shared technical labels as well as untranslated UI. Full farmer-friendly translation of all pages and dynamic agronomic advice remains unfinished; the checker is intentionally failing until this work is completed and reviewed.

## Other QA findings

- `npm run lint` cannot run non-interactively because ESLint and `eslint-config-next` are not installed and Next.js prompts to initialize them. No ESLint config was created in this pass.
- The optimized Next.js build and `npx tsc --noEmit` both passed after the final UI changes. Google Fonts download warning noted below.
- The build warns that Google Fonts could not be downloaded in this restricted environment; system/script fallbacks are configured. Clearing the generated `.next` cache fixed webpack cache-corruption warnings caused by overlapping build/dev runs. The Node dev process also emitted Next's transitive `util._extend` deprecation warning.
- The full requested mobile/desktop audit of every page, control, request, and console was not completed in this pass. Browser automation inventory reported local browser access unavailable in this chat, so only HTTP smoke checks (frontend and Crop Doctor samples returned 200) were possible.

## Files changed

- Soil: `frontend/src/components/soil/SoilCardForm.tsx`, `SoilHealthContainer.tsx`, `FertilizerResultsView.tsx`; `backend/app/api/v1/soil.py`; `backend/app/services/fertilizer_calculator.py`; `backend/tests/test_fertilizer_calculator.py`.
- Crop Doctor and My Farm: `frontend/src/components/crop-doctor/CropDoctorContainer.tsx`, `PhotoUploadZone.tsx`, `DiagnosisResultView.tsx`, `frontend/src/components/my-farm/MyFarmContainer.tsx`; `backend/app/api/v1/crop_doctor.py`; `backend/app/services/adapters/vision_service.py`; `backend/app/core/config.py`.
- Translation and setup: all JSON files under `frontend/src/i18n/`, `frontend/src/context/LanguageContext.tsx`, `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`, `frontend/scripts/check-i18n.mjs`, `frontend/package.json`, `.env.example`, `backend/.env.example`, `README.md`.

## Verification and local run steps

- Backend: `cd backend && venv/bin/python -m pytest tests/ -q` — **44 passed**.
- Frontend type check: `cd frontend && npx tsc --noEmit` — passed.
- Frontend build: `cd frontend && npm run build` — passed; Google Fonts download warning noted above.
- Translation check: `cd frontend && npm run check:i18n` — **fails** on English-identical values as intended; see counts above.
- Lint: `cd frontend && npm run lint` — currently prompts for ESLint setup and does not complete.
- Run locally: start the backend with `cd backend && venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`; start the frontend in another terminal with `cd frontend && npm run dev`; open `http://localhost:3000`.
