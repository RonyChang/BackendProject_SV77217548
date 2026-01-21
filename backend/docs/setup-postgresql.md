# Setup PostgreSQL (Docker)

## Requisitos
- Docker Desktop instalado
- Docker Compose habilitado

## Levantar Postgres
Desde la raiz del repo:

```bash
docker compose up -d
```

## Verificar estado
```bash
docker ps
```

Probar conexion con psql dentro del contenedor:
```bash
docker exec -it spacegurumis-postgres psql -U postgres -d spacegurumis -c "SELECT 1;"
```

## Detener
```bash
docker compose down
```

## Variables de entorno
En `backend/.env`, puedes usar:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/spacegurumis
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=spacegurumis
PGPORT=5433
```

## Notas
- Las credenciales por defecto son solo para desarrollo.
- El volumen `pgdata` mantiene los datos entre reinicios.
