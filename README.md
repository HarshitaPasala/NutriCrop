# NutriCrop 🌱
> **Grow healthy. Harvest better.**  
> *Soil Health First – Smart Farming Platform*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-27%2F27%20Passed-brightgreen.svg)](https://pytest.org)
[![WCAG AA](https://img.shields.io/badge/WCAG_AA-Compliant-success.svg)](https://www.w3.org/WAI/WCAG2AA-Conformance)
[![Languages](https://img.shields.io/badge/Languages-9%20Indian%20Languages-orange.svg)](#regional-languages-and-accessibility)

---

## 🌾 Overview

**NutriCrop** is a production-quality, mobile-first Progressive Web Application (PWA) engineered specifically for small and marginal farmers across India. Positioning **Soil Health First**, NutriCrop integrates agronomic soil diagnostics, AI computer-vision crop pathology, satellite-based vegetation monitoring (Copernicus Sentinel-2 NDVI), hyper-local agro-meteorological advisories, real-time APMC mandi market intelligence, and long-term multi-plot farm financial accounting.

The platform is built with an uncompromising focus on accessibility:
- **WCAG AA high-contrast design** with minimum 48px touch targets and icon + text on all actions.
- **Multilingual localization across 9 regional Indian languages** with native script typography.
- **Bilingual voice assistant** powered by the Web Speech API (STT & TTS) for low-literacy farmers.
- **Offline PWA support** with Service Worker runtime caching and downloadable ICAR crop practice handbooks.

---

## 🎯 Top 3 Core Features

1. **🧪 Soil Health Engine**: Input ICAR/Soil Health Card N-P-K and Organic Carbon parameters to generate balanced fertilizer schedules. Compares standard chemical fertilizer vs. Integrated Nutrient Management (INM: 75% chemical + 10T FYM + Biofertilizers) demonstrating **₹1,650/acre input cost savings** while regenerating soil biology. Includes problem soil reclamation protocols (Saline, Alkaline, Acidic).
2. **🩺 AI Crop Doctor**: Visual plant pathology diagnosis calibrated against a curated dataset of 1,026 field annotations across Indian crops (Chilli, Rice, Wheat, Cotton). Detects disease severity, affected area %, and provides CIBRC-approved organic biopesticides and chemical spray dosages with mandatory waiting periods (PHI).
3. **🛰️ Field Monitor (Sentinel-2 NDVI)**: Satellite vegetation index monitoring using Copernicus Sentinel-2 multi-spectral imagery. Tracks mean NDVI, vigorous vs. stressed canopy breakdown, date-over-date health deltas, and flagged anomalous stress zones.

---

## 🔌 Integrations: Status & Live Go-Live Guide

NutriCrop adopts clean abstract interface classes and mock adapters for all external third-party services. To guarantee complete transparency for farmers and extension workers, **every mock screen visibly displays a "Demo data" badge**.

| Integration | Status (Mock / Live) | What is Needed to Go Live |
| :--- | :--- | :--- |
| **Weather API** | **Mock (Demo data)** | Set `WEATHER_API_PROVIDER=openweathermap` (or `imd`) and configure `WEATHER_API_KEY` in `backend/.env`. |
| **Copernicus Sentinel-2 (NDVI)** | **Mock (Demo data)** | Set `COPERNICUS_API_PROVIDER=copernicus` and provide Copernicus Open Access Hub or Sentinel Hub OAuth credentials (`SENTINEL_CLIENT_ID`, `SENTINEL_CLIENT_SECRET`). |
| **AGMARKNET Mandi Rates** | **Mock (Demo data)** | Set `AGMARKNET_API_PROVIDER=data.gov.in` and configure official API key from National Government Data Portal (`DATA_GOV_IN_API_KEY`). |
| **Firebase Phone OTP Auth** | **Mock (Demo data)**<br>`Demo phone: 9876543210`<br>`Demo OTP: 123456` | Configure Firebase project credentials in `frontend/.env.local` (`NEXT_PUBLIC_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`) and enable Phone Authentication. |
| **WhatsApp Business API & SMS** | **Mock (Demo data)** | Set WhatsApp Cloud API token (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`) and SMS gateway credentials (Twilio or Fast2SMS API key). |
| **AI Plant Pathology Vision** | **Mock (1,026 Annotations)** | Connect fine-tuned PyTorch / TensorFlow Lite model endpoint or set `GEMINI_API_KEY` for Google Gemini 1.5 Flash Vision API. |
| **Voice Assistant (STT & TTS)** | **Live (Web Speech API)** | **Live directly in supported browsers** (Chrome, Edge, Safari, Android WebView) using browser-native SpeechRecognition and SpeechSynthesis engines. |

---

## 📱 Architecture & Tech Stack

```
SmartCrop/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Modular REST endpoints (soil, pathology, weather, mandi, schemes, farm)
│   │   ├── core/            # Config, security, database session setup
│   │   ├── models/          # Pydantic v2 schemas & SQLAlchemy ORM models
│   │   ├── services/        # Agronomic algorithms, INM savings calculators, mock adapters
│   │   └── main.py          # FastAPI application factory & CORS configuration
│   ├── tests/               # 27 comprehensive pytest test suites (100% pass)
│   └── requirements.txt
├── frontend/
│   ├── public/              # PWA manifest.json, sw.js (service worker), app icons
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router entrypoints & layouts
│   │   ├── components/      # Accessible UI components organized by farming domain
│   │   │   ├── soil/        # Soil calculator, INM comparison, problem soil library
│   │   │   ├── crop-doctor/ # Visual pathology scanner, severity meter, spray guides
│   │   │   ├── field-monitor/# Leaflet satellite NDVI overlay, date comparison
│   │   │   ├── crop-calendar/# 150-day phenological stage tracker & spray alerts
│   │   │   ├── weather/     # Hyper-local rain forecast & agro-advisories
│   │   │   ├── mandi/       # APMC mandi price comparison & 30-day trends
│   │   │   ├── expert-help/ # KVK directory & toll-free Kisan Call Center dialer
│   │   │   ├── schemes/     # PM-KISAN, PMFBY, Soil Card subsidy catalog
│   │   │   ├── community/   # Peer farmer Q&A forum with upvoting
│   │   │   ├── my-farm/     # Multi-plot land registry, expense ledger, soil trends
│   │   │   └── layout/      # Accessible header, sidebar, mobile navigation, drawer
│   │   ├── context/         # Regional language (i18n) & farmer profile state
│   │   ├── i18n/            # English plus 10 Indian language JSON dictionaries
│   │   └── types/           # Strict TypeScript interfaces
│   ├── tailwind.config.ts   # Design tokens (Forest Green #174C32, Natural Green #37804D)
│   └── package.json
└── README.md
```

---

## 🎨 Design System & Accessibility

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary** | `#174C32` | Forest green header, primary buttons, high-contrast branding |
| **Secondary** | `#37804D` | Natural leaf green accents, success states, healthy NDVI |
| **Background**| `#F5F8F1` | Soft cream-green background reducing glare in outdoor sunlight |
| **Surface**   | `#FFFFFF` | Elevated cards with subtle border strokes (`border-gray-100`) |
| **Warning**   | `#D97706` | Soft amber alert for moderate soil deficiency & insect pest alerts |
| **Danger**    | `#DC2626` | High pathogen severity alerts & critical moisture stress warnings |
| **Info**      | `#0284C7` | Satellite radar indicators, ICAR reference recommendations |

- **Touch Target Standard**: Minimum **48px × 48px** touch target size across all mobile tap targets.
- **Clarity Rule**: Icon + textual label present on every interactive button and tab.
- **Contrast**: WCAG 2.1 Level AA compliant contrast ratios (minimum 4.5:1 for body text, 7:1 for headers).

---

## 🗣️ Regional Languages and Accessibility

NutriCrop provides a language selector for English and **10 Indian languages**. Translation coverage is still in progress; run `cd frontend && npm run check:i18n` to see untranslated catalog strings:

1. **English (`en`)** - Default
2. **Telugu (`te`)** - తెలుగు
3. **Hindi (`hi`)** - हिन्दी
4. **Tamil (`ta`)** - தமிழ்
5. **Marathi (`mr`)** - मराठी
6. **Punjabi (`pa`)** - ਪੰਜਾਬੀ
7. **Bengali (`bn`)** - বাংলা
8. **Kannada (`kn`)** - ಕನ್ನಡ
9. **Malayalam (`ml`)** - മലയാളം
10. **Gujarati (`gu`)** - ગુજરાતી
11. **Odia (`or`)** - ଓଡ଼ିଆ

Fonts are served via Google Noto Sans regional font families for optimal rendering of complex Indic ligatures.

---

## 🚀 Setup & Local Execution

### Prerequisites
- Python 3.10+ (tested on Python 3.11 & 3.15)
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run backend tests
PYTHONPATH=. pytest tests/

# Start FastAPI ASGI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API interactive documentation available at: `http://127.0.0.1:8000/docs`

#### Crop Doctor image analysis

Custom-photo diagnosis needs a Gemini API key. Copy `backend/.env.example` to `backend/.env`, then set `VISION_MODEL_MODE=gemini` and `VISION_MODEL_API_KEY=<your key>`. The default model is `gemini-3.8-flash`; set `VISION_MODEL_NAME` if your account uses another supported model. The key stays on the backend.

Without a key, curated sample diagnoses continue to work. For a deterministic upload demo, set `CROP_DOCTOR_MOCK=true` in `backend/.env`; this recognizes only the three exact photos under `backend/tests/crop-doctor/images/` and returns clearly marked demo results. Other uploaded photos show a setup message. Restart the backend after changing `.env`.

### 2. Frontend Setup
```bash
cd frontend
npm install

# Run development server
npm run dev

# Or build and launch production PWA
npm run build
npm run start -- -p 3000
```
Open your browser at `http://localhost:3000` (or `http://localhost:3000/?lang=te` for Telugu).

The frontend proxies `/api/*` requests to FastAPI through the server-side `BACKEND_URL` setting. For local development on one machine, the default `http://127.0.0.1:8000` works without configuration. If Next.js and FastAPI run in separate containers or hosts, set `BACKEND_URL` in the Next.js server environment to the backend address reachable from that server (for example, `http://backend:8000`). Do not use a browser-only `NEXT_PUBLIC_` variable for this setting.

---

## 🧪 Automated Test Suite

NutriCrop includes a 100% automated pytest test suite verifying every domain engine:

```bash
PYTHONPATH=backend pytest backend/tests/
```
```
backend/tests/test_fertilizer_calculator.py .....      [ 18%]
backend/tests/test_crop_doctor.py .....                [ 37%]
backend/tests/test_agricultural_intelligence.py .....  [ 55%]
backend/tests/test_support_ecosystem.py ......         [ 77%]
backend/tests/test_my_farm.py ......                   [100%]

======================== 27 passed in 0.11s ========================
```

---

## 📋 Complete Phase Breakdown

- **Phase 1: Foundation & Design System**
  - Next.js 14 + Tailwind design tokens, 9-language i18n system with zero hardcoded strings.
  - Farmer greeting, live weather preview, voice assistant modal, OTP login simulator.
- **Phase 2: Soil Health Engine**
  - Quantitative N-P-K fertilizer calculator comparing chemical vs. INM savings (₹1,650/acre).
  - Problem soil reclamation protocols (Gypsum for alkaline, Lime for acidic, leaching for saline).
  - One-click PDF download & WhatsApp agronomic advisory sharing.
- **Phase 3: AI Crop Doctor**
  - Visual pathology scanner trained on 1,026 field annotations across Indian crops.
  - Severity assessment meter, organic remedies (Neem oil, Trichoderma), and CIBRC chemical dosages.
- **Phase 4: Agricultural Intelligence**
  - Dynamic 150-day Crop Calendar with stage-by-stage agronomic and spray alerts.
  - 7-day hyper-local weather forecast with IMD-aligned farming advisories.
  - Copernicus Sentinel-2 satellite NDVI vegetation health monitoring.
- **Phase 5: Support Ecosystem**
  - Real-time APMC Mandi rates with modal 30-day price trends and distance calculations.
  - Kisan Call Center 1800-180-1551 toll-free dialer & district KVK directory.
  - Central & State agricultural subsidy catalog (PM-KISAN, PMFBY, Soil Card).
  - Community peer farmer Q&A forum with upvoting and voice question input.
- **Phase 6: My Farm, Polish & PWA Offline**
  - Multi-plot land parcel registry with standing crop tracking.
  - Multi-season soil organic carbon trajectory tracking biological regeneration (0.42% -> 0.62%).
  - Farm input investment & harvest revenue ledger calculating net profit per acre.
  - Offline ICAR Package of Practices handbook and Service Worker offline caching.

---

## 📄 License & Compliance

Developed strictly aligned with ICAR (Indian Council of Agricultural Research) and KVK (Krishi Vigyan Kendra) package of practices. All chemical pesticide recommendations comply with CIBRC (Central Insecticides Board & Registration Committee) approved labels.

### Optional Crop Doctor vision service

Custom photo diagnosis uses a backend-only Gemini integration when configured. Copy `backend/.env.example` to `backend/.env`, set `VISION_MODEL_MODE=gemini`, and add `VISION_MODEL_API_KEY`. Keep the key out of frontend environment files. Without a key, curated examples remain available and uploaded custom photos are explicitly marked inconclusive; the app does not present them as confirmed diagnoses.
