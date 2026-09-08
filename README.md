# Career Coach AI

A small career coaching app powered by FastAPI and Google Gemini, with a React/Vite chat interface.

## Project structure

- `main.py` - FastAPI backend and Gemini chat endpoints
- `requirements.txt` - Python dependencies
- `frontend/` - React client

## Connect and run locally

### 1. Start the API

Create a `.env` file in the project root and add your Gemini key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Then run the backend from the project root:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs are at `http://localhost:8000/docs`.

### 2. Start the React UI

In a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend reads `VITE_API_URL` from `frontend/.env`. Change it when the API is deployed somewhere else:

```env
VITE_API_URL=https://your-api.example.com
```

## Current API contract

- `GET /health` checks whether the API is reachable.
- `POST /chat` accepts `{ "message": "..." }` and returns an AI response.
- `POST /chat/reset` clears the current conversation.

## Adding features later

Keep API calls in the React app grouped near the top of `frontend/src/App.jsx`, or extract them into `frontend/src/api.js` as the app grows. Add new backend request and response models in `main.py`, then add a focused UI component for each new workflow. Keep the API URL in an environment variable so development and production can use different backends.

Before deploying, replace the development-wide CORS setting in `main.py` with the exact frontend origin and use a production ASGI process.
