<div align="center">

# 🔮 Astrovia

### AI-Powered Palm Reading & Vedic Astrology App

**Scan your palm → get an AI-generated reading. Enter your birth details → get a full Vedic Kundli.**
*A full-stack mobile app combining computer vision, vector search, and generative AI — designed, built, and shipped solo.*

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📬 Contact

**Open to full-stack / mobile applications / AI-integration roles — always happy to connect.**

📧 **Email:** shivaawasthi531@gmail.com
🔗 **LinkedIn:** [linkedin.com/in/shiva-awasthi-659681372](https://www.linkedin.com/in/shiva-awasthi-659681372/)

💬 **Have a project in mind, or want to see more of my work?** Reach out on LinkedIn or drop a mail — I'm always up for discussing new opportunities and collaborations.

---

## Highlights

- Designed and shipped a **custom vector-similarity pipeline** (coordinate extraction → embedding → FAISS L2 search → score-conditioned LLM generation) — not just a wrapper around an API call
- Integrated **two separate AI models** (vision + text) via Cloudflare Workers AI for palm-line detection and natural-language interpretation
- Built a **production-style backend**: JWT auth, Alembic migrations, connection pooling for serverless Postgres, Dockerized for Railway deployment
- Cross-platform mobile app in **React Native + Expo** with custom animations (Reanimated, SVG line-draw reveals, parallax UI)
- Integrated a third-party astrology API (Prokerala) for real-time planetary chart data

---

## Features

- 📸 **Palm Scan** — Live camera capture → AI vision model detects palm lines → FAISS matches similar patterns → LLM generates a personalized reading
- 🪐 **Vedic Kundli** — Birth details in, full planetary chart + dasha periods out, rendered as a rotating pseudo-3D wheel
- 🌌 **Cosmic UI** — Parallax starfield, glassmorphism cards, animated SVG reveals
- 🔐 **JWT Auth** — Secure signup/login with on-device session persistence
- 📜 **Reading History** — Every scan saved and browsable

---

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React Native, Expo (SDK 54), Expo Router, TypeScript, Zustand, Reanimated + Gesture Handler, `react-native-svg`, `expo-camera` |
| **Backend** | FastAPI, PostgreSQL + SQLAlchemy, Alembic, JWT (python-jose, passlib) |
| **AI — Vision** | Llama 3.2 11B Vision Instruct (Cloudflare Workers AI) — palm line coordinate detection |
| **AI — Text** | Mistral 7B Instruct (Cloudflare Workers AI) — personalized reading generation |
| **Search** | FAISS (`IndexFlatL2`) — self-hosted vector similarity search |
| **Astrology Data** | Prokerala API (real-time planetary analysis) |
| **Database** | Neon (serverless Postgres) |
| **Deployment** | Railway (backend), EAS Build (Android APK/AAB) |

---

## System Design: Palm Pattern Matching

The FAISS pipeline is the technical core of the app — it's what makes each reading feel personalized instead of generic:

1. **Capture** — Camera takes a JPEG of the palm
2. **Vision detection** — Vision model returns 4 sets of normalized `{x, y}` coordinates (heart / head / life / fate lines)
3. **Embedding** — Each line is resampled to 16 points and flattened into a single **128-dimensional float32 vector** — a fixed-size fingerprint from variable-length line data
4. **Similarity search** — Vector compared against all prior scans using FAISS L2 distance to find the closest match
5. **Score conversion** — Raw distance converted to a 0–1 similarity score, passed as context to the text model
6. **Interpretation** — LLM generates the reading using line shapes + similarity context
7. **Indexing** — New vector persisted to disk, so the index — and match quality — improves with every scan

*Chosen `IndexFlatL2` as a lightweight, self-hosted alternative to a managed vector DB, appropriate at this scale; noted `IndexIVFFlat`/`IndexHNSWFlat` as the upgrade path if usage scales to millions of vectors.*

---

## Architecture

```
astrovia/
├── astrovia-backend/       # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── api/v1/routes/  # auth, palm, kundli, history
│   │   ├── core/           # config, security (JWT)
│   │   ├── services/       # Cloudflare AI, FAISS, Prokerala clients
│   │   │   ├── gemini_vision.py     # (name kept for compat — now calls Llama 3.2 Vision)
│   │   │   ├── gemini_interpret.py  # (name kept for compat — now calls Mistral)
│   │   │   ├── embedding.py         # coordinates → fixed-length vector
│   │   │   ├── vector_db.py         # FAISS index wrapper
│   │   │   └── kundli_api.py        # Prokerala client
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── db/              # session, base
│   │   └── utils/          # image validation/resizing
│   ├── migrations/         # Alembic
│   ├── faiss_store/        # persisted FAISS index + metadata (gitignored)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.json
└── astrovia-app/           # Expo React Native frontend
    ├── app/                # Expo Router screens
    │   ├── (tabs)/          # Home, Kundli, History, Profile
    │   ├── camera/
    │   ├── onboarding/
    │   └── result/[id].tsx
    ├── src/
    │   ├── components/     # camera, palm, kundli, common (Starfield, Card, Button…)
    │   ├── hooks/           # animation + data hooks
    │   ├── services/        # API clients
    │   ├── store/            # Zustand stores
    │   ├── types/
    │   ├── constants/       # colors, motion config, API URL
    │   └── utils/
    ├── app.json
    └── eas.json
```

---

## Setup

### 1. Backend

```powershell
cd astrovia-backend
python -m venv venv
venv\Scripts\Activate.ps1          # Windows PowerShell
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and fill in:
```
DATABASE_URL=<your Neon connection string>
SECRET_KEY=<any long random string>

CLOUDFLARE_ACCOUNT_ID=<your Cloudflare account ID>
CLOUDFLARE_API_TOKEN=<your Workers AI API token>
CLOUDFLARE_VISION_MODEL=@cf/meta/llama-3.2-11b-vision-instruct
CLOUDFLARE_TEXT_MODEL=@cf/mistral/mistral-7b-instruct-v0.2

PROKERALA_CLIENT_ID=<optional, for Kundli>
PROKERALA_CLIENT_SECRET=<optional, for Kundli>
```

Run the server — **bind to `0.0.0.0`** so your phone (on the same Wi-Fi) can reach it:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0
```

Visit `http://127.0.0.1:8000/docs` to confirm it's up (Swagger UI).

### 2. Frontend

```powershell
cd astrovia-app
npm install --legacy-peer-deps
```

Find your machine's LAN IP (needed so your phone can reach the backend):
```powershell
ipconfig
```
Copy the **IPv4 Address** under your Wi-Fi adapter (e.g. `192.168.1.5`).

Edit `src/constants/config.ts`:
```typescript
export const API_BASE_URL = 'http://<YOUR_LAN_IP>:8000/api/v1';
```

Start the app:
```powershell
npx expo start
```

Scan the QR code with **Expo Go** on your phone (phone and PC must be on the same Wi-Fi network).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails with `ERESOLVE` | Add `--legacy-peer-deps` to the command, or create a `.npmrc` with `legacy-peer-deps=true` |
| `Project is incompatible with this version of Expo Go` | Your phone's Expo Go supports an older SDK. Either update Expo Go, or run `npx expo install expo@<matching version> && npx expo install --fix` |
| App shows **Network Error** on signup/login | `API_BASE_URL` is still pointing to `127.0.0.1` — switch it to your LAN IP (see setup above), and make sure the backend was started with `--host 0.0.0.0` |
| Backend crashes with `AttributeError: 'NoneType' object has no attribute 'loader'` on startup | Harmless — leftover broken package metadata on your global Python install. Safe to ignore. |
| `sqlalchemy.exc.OperationalError: server closed the connection unexpectedly` | Neon's free tier suspends idle connections. Add `pool_pre_ping=True` and `pool_recycle=280` to the engine in `app/db/session.py` (already included in this repo) |
| Cloudflare returns a 401/403 | API token doesn't have Workers AI permission, or Account ID is wrong — regenerate the token with the "Workers AI" template |
| `Unsupported image type` when scanning from camera | Camera captures are always JPEG — make sure `palmService.ts` hardcodes `type: 'image/jpeg'` instead of guessing from the file URI, and the backend call passes `mime_type="image/jpeg"` explicitly |
| Vision model returns text instead of clean JSON | Llama/Mistral sometimes wrap JSON in markdown fences or add commentary — the backend's `_extract_json()` helper regex-extracts the `{...}` block before parsing, to handle this |
| `Exception in HostFunction: TurboModule method "installTurboModule"` | Missing Reanimated/Worklets Babel plugin. Ensure `babel.config.js` includes `plugins: ['react-native-worklets/plugin']`, then run `npx expo start --clear` |

---

## Deployment

### Backend → Railway
1. Push `astrovia-backend/` to a GitHub repo
2. Create a new Railway project from that repo (it will auto-detect `Dockerfile`)
3. Add a Postgres plugin (or keep using Neon) and set all `.env` variables in Railway's dashboard
4. Mount a persistent volume at `faiss_store/` so the vector index survives redeploys
5. Update the frontend's `API_BASE_URL` to your Railway URL

### Frontend → EAS Build (Android)
```powershell
npm install -g eas-cli
eas login
eas build --profile preview --platform android   # generates an installable APK
eas build --profile production --platform android # generates an AAB for Play Store
```

---

<div align="center">

### Built with FastAPI + React Native + Cloudflare Workers AI + a lot of `--legacy-peer-deps` ✨

**📩 Interested in this project or want to collaborate on something new? [Let's connect on LinkedIn](https://www.linkedin.com/in/shiva-awasthi-659681372/) or email shivaawasthi531@gmail.com**

</div>
