# Esquema de Base de Datos

## Catalogo

### users
- `id` (PK)
- `email` (unique)
- `first_name`
- `last_name`
- `password_hash`
- `google_id`
- `avatar_url`
- `role`
- `is_active`
- `created_at`, `updated_at`

### user_addresses
- `id` (PK)
- `user_id` (unique, FK -> users.id)
- `receiver_name`
- `phone`
- `address_line1`
- `address_line2`
- `country`
- `city`
- `district`
- `postal_code`
- `reference`
- `created_at`, `updated_at`

### carts
- `id` (PK)
- `user_id` (unique, FK -> users.id)
- `created_at`, `updated_at`

### cart_items
- `id` (PK)
- `cart_id` (FK -> carts.id)
- `product_variant_id` (FK -> product_variants.id)
- `quantity`
- `created_at`, `updated_at`

### orders
- `id` (PK)
- `user_id` (FK -> users.id)
- `order_status`
- `payment_status`
- `subtotal_cents`
- `total_cents`
- `created_at`, `updated_at`

### order_items
- `id` (PK)
- `order_id` (FK -> orders.id)
- `product_variant_id` (FK -> product_variants.id)
- `sku`
- `product_name`
- `variant_name`
- `price_cents`
- `quantity`
- `created_at`, `updated_at`

### categories
- `id` (PK)
- `name`
- `slug` (unique)
- `description`
- `is_active`
- `created_at`, `updated_at`

### products
- `id` (PK)
- `category_id` (FK -> categories.id)
- `name`
- `slug` (unique)
- `description`
- `is_active`
- `created_at`, `updated_at`

### product_variants
- `id` (PK)
- `product_id` (FK -> products.id)
- `sku` (unique)
- `variant_name`
- `price_cents`
- `weight_grams`
- `size_label`
- `created_at`, `updated_at`

### inventory
- `id` (PK)
- `product_variant_id` (FK -> product_variants.id)
- `stock`
- `reserved`
- `updated_at`

## Notas
- Los precios se guardan en centimos.
- Ejemplo: `price_cents=4500` representa S/ 45.00.
- `password_hash` puede ser NULL si la cuenta es solo Google.
- `google_id` es unico y puede ser NULL si la cuenta es por email.
- `avatar_url` es opcional y viene de Google si esta disponible.
