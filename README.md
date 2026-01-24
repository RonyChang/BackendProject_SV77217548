# Spacegurumis

Backend y frontend de la tienda Spacegurumis. Este README describe el proyecto en general.
El detalle por version esta en `updates.md`.

## Estructura
- `backend/`: API REST (Node.js + Express).
- `frontend/`: UI estatica.

## Requisitos
- Node.js 18+
- npm
- Docker Desktop (para base de datos)

## Instalacion rapida
Backend:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm start
```

Abrir en el navegador:
```
http://localhost:5173
```

## Endpoints principales
Salud:
- `GET /health`

Catalogo (variantes):
- `GET /api/v1/catalog/variants`
- `GET /api/v1/catalog/variants/:sku`

Catalogo (tipos):
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/:slug`

Auth:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

