# BackendProject_SV77217548
Spacegurumis

## Estructura
- `backend/`: API REST (Node.js + Express).
- `frontend/`: UI estatica.

## Requisitos
- Node.js 18+
- npm

## Backend (v0.1.0)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Endpoint health:
```bash
GET http://localhost:3000/health
# Response: { "status": "ok" }
```

## Frontend (v0.1.0)
```bash
cd frontend
npm install
npm start
```

Abrir en el navegador:
```
http://localhost:5173
```
