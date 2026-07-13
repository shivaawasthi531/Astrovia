# 🔮 Astrovia

**AI-powered palm reading + Vedic Kundli mobile app.** Scan your palm, get an AI-generated reading of your heart, head, life, and fate lines — then explore your Vedic birth chart, all wrapped in a premium cosmic UI.
### contact me on linkedin for further projects https://www.linkedin.com/in/shiva-awasthi-659681372/
---

## ✨ Features

- 📸 **Palm Scan** — Live camera capture → Llama 3.2 Vision detects palm lines → FAISS matches similar patterns → Mistral generates a personalized reading
- 🪐 **Vedic Kundli** — Enter your birth details, get a full planetary chart + dasha periods, rendered as a rotating pseudo-3D wheel
- 🌌 **Cosmic UI** — Parallax starfield, shooting stars, glassmorphism cards, animated SVG line-drawing reveals
- 🔐 **JWT Auth** — Secure signup/login, session persisted on-device
- 📜 **Reading History** — Every past scan saved and browsable

---

## 🛠 Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React Native + Expo (SDK 54) + Expo Router, TypeScript, Zustand, Reanimated + Gesture Handler, `react-native-svg`, `expo-camera` |
| **Backend** | FastAPI, PostgreSQL + SQLAlchemy, Alembic, JWT (python-jose + passlib) |
| **AI — Vision** | **Llama 3.2 11B Vision Instruct** via Cloudflare Workers AI — detects palm line coordinates from the photo |
| **AI — Text** | **Mistral 7B Instruct** via Cloudflare Workers AI — turns detected lines into a warm, personalized reading |
| **Astrology Data** | Prokerala API (REAL TIME PLANET ANALYSIS) |
| **Database** | Neon (serverless Postgres) |
| **Deployment** | Backend → Railway · Frontend → EAS Build (Android APK/AAB) |

---

## 🧬 How Palm Pattern Matching Works

The FAISS step is what makes each reading feel personalized rather than generic — here's the pipeline, end to end:

1. **Capture** — Camera takes a JPEG of the palm.
2. **Vision detection** — Llama 3.2 Vision returns 4 sets of `{x, y}` coordinates (heart / head / life / fate lines), normalized 0–1 so they work at any screen size.
3. **Embedding** — `app/services/embedding.py` resamples each line to a fixed 16 points and flattens all 4 lines into a single **128-dimensional float32 vector**. This turns a variable-length, messy line shape into a fixed-size numeric fingerprint that can be compared mathematically.
4. **Similarity search** — `app/services/vector_db.py` wraps a FAISS `IndexFlatL2` index. The new vector is compared against every previously scanned palm's vector using L2 (Euclidean) distance — the closest match tells us "this palm's line shape is most similar to reading #X."
5. **Score conversion** — Raw L2 distance is converted to a friendlier 0–1 similarity score (`1 / (1 + distance)`), which gets passed to the text model as context (e.g. *"85% similar to a known pattern"*).
6. **Interpretation** — Mistral uses the line shapes *and* that similarity context to write the final reading.
7. **Indexing** — The new vector is added to the FAISS index and persisted to disk (`faiss_store/`), so it improves future matches too — the index grows with every scan.

This is a lightweight, self-hosted alternative to a managed vector DB (Pinecone, Weaviate, etc.) — appropriate for a single-service app with a modest number of readings. If usage scales into the millions of vectors, swapping `IndexFlatL2` for an approximate index like `IndexIVFFlat` or `IndexHNSWFlat` would keep search fast.

---

## 📁 Project Structure

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

## 🚀 Setup


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

## 🐛 Troubleshooting

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

## 📦 Deployment

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


---

Built with FastAPI + React Native + Cloudflare Workers AI + a lot of `--legacy-peer-deps`. ✨
