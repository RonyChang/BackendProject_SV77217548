# Postman - Pruebas API (v0.8.0)

## Base URL
- Local: `http://localhost:3000`
- Produccion: `https://api.spacegurumis.lat`
- Frontend: `https://spacegurumis.lat`

## Endpoints disponibles

### Health
- `GET {{baseUrl}}/health`
  - Esperado: `200` con `{ "status": "ok" }`.

### Catalogo - Categorias
- `GET {{baseUrl}}/api/v1/catalog/categories`
  - Lista categorias activas.
  - Esperado: `200` con `data[]` y `meta.total`.

### Catalogo - Tipos (productos base)
- `GET {{baseUrl}}/api/v1/catalog/products`
  - Lista tipos activos con `variantsCount`.
  - Filtros soportados:
    - `category` (slug de categoria)
    - `q` (busqueda por nombre de producto)
    - `page`, `pageSize`

Ejemplos:
- `GET {{baseUrl}}/api/v1/catalog/products?page=1&pageSize=12`
- `GET {{baseUrl}}/api/v1/catalog/products?category=amigurumis`
- `GET {{baseUrl}}/api/v1/catalog/products?q=alien`

Detalle de tipo:
- `GET {{baseUrl}}/api/v1/catalog/products/:slug`
  - Esperado: `200` con `data` y `variants[]`.
  - Si no existe: `404`.

Ejemplo:
- `GET {{baseUrl}}/api/v1/catalog/products/alien-tejido`

### Catalogo - Variantes (productos comprables)
- `GET {{baseUrl}}/api/v1/catalog/variants`
  - Lista variantes activas con producto y categoria.
  - Filtros soportados:
    - `category` (slug de categoria)
    - `q` (busqueda por nombre de producto o variante)
    - `minPrice`, `maxPrice` (en soles)
    - `page`, `pageSize`

Ejemplos:
- `GET {{baseUrl}}/api/v1/catalog/variants?page=1&pageSize=12`
- `GET {{baseUrl}}/api/v1/catalog/variants?category=amigurumis`
- `GET {{baseUrl}}/api/v1/catalog/variants?q=alien`
- `GET {{baseUrl}}/api/v1/catalog/variants?minPrice=32&maxPrice=45`

Detalle de variante:
- `GET {{baseUrl}}/api/v1/catalog/variants/:sku`
  - Esperado: `200` con `data` y `stockAvailable`.
  - Si no existe: `404`.

Ejemplo:
- `GET {{baseUrl}}/api/v1/catalog/variants/ALI-ESP-001`

### Auth
- `POST {{baseUrl}}/api/v1/auth/register`
  - Body (JSON):
    - `email`, `password` (opcional: `firstName`, `lastName`)
  - Esperado: `201` con `data.verificationRequired=true`.
  - Si el email ya existe y esta verificado: `409`.
  - Si el email existe pero no esta verificado: `200` y reenvia codigo.

Ejemplo:
```json
{
  "email": "demo@spacegurumis.lat",
  "password": "Demo1234"
}
```

- `POST {{baseUrl}}/api/v1/auth/verify-email`
  - Body (JSON):
    - `email`, `code` (6 digitos)
  - Esperado: `200` con `data.user` y `data.token`.
  - Si el codigo es invalido o expiro: `400`.

Ejemplo:
```json
{
  "email": "demo@spacegurumis.lat",
  "code": "123456"
}
```

- `POST {{baseUrl}}/api/v1/auth/login`
  - Body (JSON):
    - `email`, `password`
  - Esperado: `200` con `data.user` y `data.token`.
  - Credenciales invalidas: `401`.
  - Email no verificado: `403`.
  - Admin: responde `data.twoFactorRequired=true` y envia codigo por email.

- `POST {{baseUrl}}/api/v1/auth/resend-verification`
  - Body (JSON):
    - `email`
  - Esperado: `200` con `data.sent=true`.
  - Email verificado: `409`.
  - Email inexistente: `404`.
  - Cooldown activo: `429`.

- `POST {{baseUrl}}/api/v1/auth/admin/verify-2fa`
  - Body (JSON):
    - `email`, `code` (6 digitos)
  - Esperado: `200` con `data.user` y `data.token`.
  - Codigo invalido/expirado: `400`.
  - Bloqueo por intentos: `423`.

Ejemplo:
```json
{
  "email": "demo@spacegurumis.lat",
  "password": "Demo1234"
}
```

### Google OAuth
- `GET {{baseUrl}}/api/v1/auth/google`
  - Abre el navegador y sigue el flujo de Google.
  - Redirige a Google con la pantalla de consentimiento.

- `GET {{baseUrl}}/api/v1/auth/google/callback?code=...`
  - Si `FRONTEND_BASE_URL` está configurado, redirige a `{{frontendUrl}}/login#token=...`.
  - Si no hay `FRONTEND_BASE_URL`, responde `200` con `data.user` y `data.token`.
  - Si falta el `code`: `400` o redirección con error.

### Perfil
- `GET {{baseUrl}}/api/v1/profile`
  - Requiere `Authorization: Bearer {{token}}`.
  - Esperado: `200` con `data.user` y `data.address` (o `null`).
  - Sin token: `401`.

- `PUT {{baseUrl}}/api/v1/profile`
  - Requiere `Authorization: Bearer {{token}}`.
  - Actualiza nombre y direccion (upsert).
  - Esperado: `200` con `data.user` y `data.address`.

Ejemplo:
```json
{
  "firstName": "Rony",
  "lastName": "Chang",
  "address": {
    "receiverName": "Rony Chang",
    "phone": "987654321",
    "addressLine1": "Av. Principal 123",
    "addressLine2": "Depto 4B",
    "country": "PE",
    "city": "Lima",
    "district": "Miraflores",
    "postalCode": "15074",
    "reference": "Edificio azul"
  }
}
```

### Carrito
- `GET {{baseUrl}}/api/v1/cart`
  - Requiere `Authorization: Bearer {{token}}`.
  - Esperado: `200` con `data.items` y `data.summary`.
  - `summary` incluye `subtotal` (soles) y `totalItems`.

- `POST {{baseUrl}}/api/v1/cart/items`
  - Requiere `Authorization: Bearer {{token}}`.
  - Body (JSON): `sku`, `quantity`.
  - Esperado: `200` con `data.items` actualizado.
  - Si el SKU no existe: `404`.
  - Si no hay stock suficiente: `409`.

Ejemplo:
```json
{
  "sku": "ALI-ESP-001",
  "quantity": 2
}
```

- `PATCH {{baseUrl}}/api/v1/cart/items/:sku`
  - Requiere `Authorization: Bearer {{token}}`.
  - Body (JSON): `quantity`.
  - Esperado: `200` con `data.items` actualizado.
  - Si no hay stock suficiente: `409`.

- `DELETE {{baseUrl}}/api/v1/cart/items/:sku`
  - Requiere `Authorization: Bearer {{token}}`.
  - Esperado: `200` con `data.items` actualizado.

- `DELETE {{baseUrl}}/api/v1/cart`
  - Requiere `Authorization: Bearer {{token}}`.
  - Vacia el carrito del usuario.

### Ordenes
- `POST {{baseUrl}}/api/v1/orders`
  - Requiere `Authorization: Bearer {{token}}`.
  - Crea una orden `pendingPayment` desde el carrito.
  - Requiere direccion completa en el perfil.
  - Opcional: `discountCode`.
  - Esperado: `201` con `data`, `items`, `shippingCost`, `discountAmount` y `total`.
  - Si el carrito esta vacio: `400`.
  - Si falta direccion: `400`.
  - Si no hay stock: `409`.

Ejemplo:
```json
{
  "discountCode": "ESPACIO10"
}
```

- `POST {{baseUrl}}/api/v1/orders/:id/cancel`
  - Requiere `Authorization: Bearer {{token}}`.
  - Cancela una orden `pendingPayment` y libera stock reservado.
  - Esperado: `200` con `data`.
  - Si no existe: `404`.
  - Si no es cancelable: `409`.

### Admin
- `GET {{baseUrl}}/api/v1/admin/orders`
  - Requiere `Authorization: Bearer {{tokenAdmin}}`.
  - Solo admin, si no: `403`.
  - Filtros opcionales:
    - `orderStatus`, `paymentStatus`, `email`
    - `page`, `pageSize`
  - Esperado: `200` con `data.items` y `meta.total`.

- `PATCH {{baseUrl}}/api/v1/admin/orders/:id/status`
  - Requiere `Authorization: Bearer {{tokenAdmin}}`.
  - Body (JSON): `orderStatus`.
  - Esperado: `200` con `data`.
  - Si no existe: `404`.

Ejemplo:
```json
{
  "orderStatus": "shipped"
}
```

- `PATCH {{baseUrl}}/api/v1/admin/variants/:sku/stock`
  - Requiere `Authorization: Bearer {{tokenAdmin}}`.
  - Body (JSON): `stock` (entero >= 0).
  - Esperado: `200` con `data`.
  - Si el SKU no existe: `404`.
  - Si `stock < reserved`: `409`.

Ejemplo:
```json
{
  "stock": 12
}
```

### Pagos (Stripe)
- `POST {{baseUrl}}/api/v1/payments/stripe/session`
  - Requiere `Authorization: Bearer {{token}}`.
  - Body (JSON): `orderId`.
  - Esperado: `200` con `sessionId` y `checkoutUrl`.
  - Si la orden no existe: `404`.
  - Si la orden no esta `pendingPayment`: `400`.

Ejemplo:
```json
{
  "orderId": 123
}
```

### Webhook Stripe
- `POST {{baseUrl}}/api/v1/webhooks/stripe`
  - Requiere header `stripe-signature` y cuerpo RAW.
  - Eventos soportados: `checkout.session.completed`, `checkout.session.expired`.
  - Firma invalida: `400`.

### Descuentos
- `POST {{baseUrl}}/api/v1/discounts/validate`
  - Body (JSON): `code`, `subtotal` (en soles).
  - Esperado: `200` con `discountAmount` y `finalSubtotal`.
  - Si el código es inválido: `400`.

Ejemplo:
```json
{
  "code": "ESPACIO10",
  "subtotal": 120
}
```
