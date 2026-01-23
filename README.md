# BackendProject_SV77217548
Spacegurumis

## Estructura
- `backend/`: API REST (Node.js + Express).
- `frontend/`: UI estatica.

## Requisitos
- Node.js 18+
- npm
- Docker Desktop (para base de datos)

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

## Esquema (v0.2.0)
Archivo SQL: `backend/db/schema.sql`  
Documento: `backend/docs/schema.md`

## Catalogo (v0.2.3)
Listado y detalle por variantes:
```
GET /api/v1/catalog/variants
GET /api/v1/catalog/variants/:sku
```

Listado de tipos (producto base):
```
GET /api/v1/catalog/products
GET /api/v1/catalog/products/:slug
```

Filtros soportados en listados: `category`, `q`, `minPrice`, `maxPrice`, `page`, `pageSize`.

## Configuracion externa (v0.1.2)
- `backend/docs/setup-google-oauth.md`
- `backend/docs/setup-smtp-email.md`
- `backend/docs/setup-whatsapp.md`
- `backend/docs/setup-stripe.md`

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

Si el backend no corre en el mismo origen, define `window.API_BASE_URL` en `frontend/index.html`.
