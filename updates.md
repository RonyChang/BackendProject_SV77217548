# Updates

## Versión: v0.1.0

### Cambios
- Estructura base de repo con carpetas `backend/` y `frontend/`.
- Backend Express con endpoint `GET /health` y middlewares base.
- Config básica y `.env.example` para variables locales.
- Frontend estático con React vía CDN y layout mínimo.
- Dockerfile y `.dockerignore` para backend y frontend.
- README con instrucciones de ejecución local.

### Notas
- Esta versión valida el arranque del proyecto y el health check.

## Versión: v0.1.1

### Cambios
- Agregado `docker-compose.yml` para Postgres con volumen persistente.
- Nueva guía `backend/docs/setup-postgresql.md`.
- Variables de entorno PG* en `.env.example`.
- README actualizado con pasos básicos de DB.
- Puerto host de Postgres configurado en 5433.

## Versión: v0.1.2

### Cambios
- `.env.example` completado con variables base del proyecto.
- Nuevas guías: Google OAuth, SMTP, WhatsApp y Stripe en `backend/docs/`.
- README actualizado con enlaces a guías de configuración.

## Versión: v0.2.0

### Cambios
- Esquema SQL base del catálogo en `backend/db/schema.sql`.
- Documentación del esquema en `backend/docs/schema.md`.
- Endpoints read-only de catálogo para categorías y productos.
- Detalle de producto con variantes e inventario disponible.
- Conexión a Postgres vía `pg` y pool centralizado en config.

## Versión: v0.2.1

### Cambios
- Filtros por categoría, texto y precio en listado de productos.
- Paginación con `page` y `pageSize`, y metadata en la respuesta.

## Versión: v0.2.2

### Cambios
- Precios almacenados en centimos en `product_variants.price_cents`.
- La API convierte y responde precios en soles.

## Versión: v0.2.3

### Cambios
- Nuevo listado y detalle por variante en `/api/v1/catalog/variants` y `/api/v1/catalog/variants/:sku`.
- Filtros y paginación aplican al listado de variantes.
- Listado de tipos en `/api/v1/catalog/products` ahora incluye `variantsCount`.
- CORS restringido a dominios HTTPS y entornos locales.

## Versión: v0.3.0

### Cambios
- Registro y login con JWT en `/api/v1/auth/register` y `/api/v1/auth/login`.
- Nueva tabla `users` con password hasheada y rol por defecto `customer`.
- Validaciones mínimas para email y contraseña.

## Versión: v0.3.1

### Cambios
- Perfil autenticado en `/api/v1/profile` (GET y PUT).
- Nueva tabla `user_addresses` con dirección 1:1 por usuario.
- Validaciones mínimas para teléfono y campos de dirección.

## Versión: v0.3.2

### Cambios
- Login con Google OAuth en `/api/v1/auth/google` y callback `/api/v1/auth/google/callback`.
- Vinculación de cuentas por email existente.
- `users` ahora guarda `google_id` y `avatar_url` y permite `password_hash` NULL.
- Frontend con navegación (login/registro/perfil), cierre de sesión y formulario de perfil.
- Botón de acceso Google en el frontend (redirige al login con token).
- Registro ahora permite solo email y contraseña; el nombre se completa en el perfil.
- Callback de Google redirige al frontend cuando `FRONTEND_BASE_URL` está configurado.

## Version: v0.4.0

### Cambios
- Carrito persistente en BD con tablas `carts` y `cart_items`.
- Endpoints CRUD de carrito en `/api/v1/cart` y `/api/v1/cart/items`.
- Frontend agrega pagina `/cart` y boton de carrito en el header.
- Acciones basicas: agregar, actualizar cantidad, eliminar y vaciar carrito.

## Version: v0.4.1

### Cambios
- Carrito ahora devuelve `summary` con subtotal y total de items.
- Validacion de stock al agregar o actualizar cantidades (409 si supera stock).

## Version: v0.4.2

### Cambios
- Carrito local para invitados usando `localStorage`.
- `/cart` muestra el carrito local si no hay sesion.
- Sincronizacion del carrito local al iniciar sesion o registrarse.
- Si falla la sincronizacion, se conservan items locales y se muestra el error.

## Version: v0.5.0

### Cambios
- Orden `pendingPayment` creada desde el carrito en `POST /api/v1/orders`.
- Nuevas tablas `orders` y `order_items` con snapshot del carrito.
- El carrito se limpia al crear la orden.

## Version: v0.5.1

### Cambios
- Calculo de envio segun distrito del perfil.
- `orders` ahora guarda `shipping_cost_cents`.
- Total de orden incluye subtotal + envio.
- Se requiere direccion completa para crear la orden.
