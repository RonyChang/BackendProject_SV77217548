# Updates

## Version: v0.1.0

### Cambios
- Estructura base de repo con carpetas `backend/` y `frontend/`.
- Backend Express con endpoint `GET /health` y middlewares base.
- Config basica y `.env.example` para variables locales.
- Frontend estatico con React via CDN y layout minimo.
- Dockerfile y `.dockerignore` para backend y frontend.
- README con instrucciones de ejecucion local.

### Notas
- Esta version valida el arranque del proyecto y el health check.

## Version: v0.1.1

### Cambios
- Agregado `docker-compose.yml` para Postgres con volumen persistente.
- Nueva guia `backend/docs/setup-postgresql.md`.
- Variables de entorno PG* en `.env.example`.
- README actualizado con pasos basicos de DB.
- Puerto host de Postgres configurado en 5433.
