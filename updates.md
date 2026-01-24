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

## Version: v0.1.2

### Cambios
- `.env.example` completado con variables base del proyecto.
- Nuevas guias: Google OAuth, SMTP, WhatsApp y Stripe en `backend/docs/`.
- README actualizado con enlaces a guias de configuracion.

## Version: v0.2.0

### Cambios
- Esquema SQL base del catalogo en `backend/db/schema.sql`.
- Documentacion del esquema en `backend/docs/schema.md`.
- Endpoints read-only de catalogo para categorias y productos.
- Detalle de producto con variantes e inventario disponible.
- Conexion a Postgres via `pg` y pool centralizado en config.

## Version: v0.2.1

### Cambios
- Filtros por categoria, texto y precio en listado de productos.
- Paginacion con `page` y `pageSize`, y metadata en la respuesta.

## Version: v0.2.2

### Cambios
- Precios almacenados en centimos en `product_variants.price_cents`.
- La API convierte y responde precios en soles.

## Version: v0.2.3

### Cambios
- Nuevo listado y detalle por variante en `/api/v1/catalog/variants` y `/api/v1/catalog/variants/:sku`.
- Filtros y paginacion aplican al listado de variantes.
- Listado de tipos en `/api/v1/catalog/products` ahora incluye `variantsCount`.
