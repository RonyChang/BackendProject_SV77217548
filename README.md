# BackendProject_SV77217548
Spacegurumis
<<<<<<< Updated upstream
=======

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

## Base de datos (v0.1.1)
```bash
# Desde la raiz del repo
docker compose up -d
```

Guia completa: `backend/docs/setup-postgresql.md`

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
>>>>>>> Stashed changes
