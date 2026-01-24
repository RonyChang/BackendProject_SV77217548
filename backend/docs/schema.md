# Esquema de Base de Datos

## Catalogo

### users
- `id` (PK)
- `email` (unique)
- `first_name`
- `last_name`
- `password_hash`
- `role`
- `is_active`
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
