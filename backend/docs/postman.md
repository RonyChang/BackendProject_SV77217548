# Postman - Pruebas API (v0.3.1)

## Base URL
- Local: `http://localhost:3000`
- Produccion: `https://api.spacegurumis.lat`

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
    - `email`, `firstName`, `lastName`, `password`
  - Esperado: `201` con `data.user` y `data.token`.
  - Si el email ya existe: `409`.

Ejemplo:
```json
{
  "email": "demo@spacegurumis.lat",
  "firstName": "Demo",
  "lastName": "User",
  "password": "Demo1234"
}
```

- `POST {{baseUrl}}/api/v1/auth/login`
  - Body (JSON):
    - `email`, `password`
  - Esperado: `200` con `data.user` y `data.token`.
  - Credenciales invalidas: `401`.

Ejemplo:
```json
{
  "email": "demo@spacegurumis.lat",
  "password": "Demo1234"
}
```

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
