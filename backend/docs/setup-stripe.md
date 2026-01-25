# Setup Stripe

## Requisitos
- Cuenta Stripe (modo test para desarrollo).

## Pasos
1. Crear una cuenta en Stripe y acceder al Dashboard.
2. Obtener las llaves de API (Publishable y Secret).
3. Crear un webhook en el Dashboard y copiar el Signing Secret.
4. Copiar las variables al `.env`.

## Variables
```env
STRIPE_SECRET_KEY=sk_test_changeme
STRIPE_PUBLISHABLE_KEY=pk_test_changeme
STRIPE_WEBHOOK_SECRET=whsec_changeme
STRIPE_SUCCESS_URL=https://spacegurumis.lat/
STRIPE_CANCEL_URL=https://spacegurumis.lat/cart
```

## Notas
- Usa llaves `sk_test`/`pk_test` en desarrollo.
- El webhook debe apuntar al endpoint definido por el backend.
- `STRIPE_SUCCESS_URL` y `STRIPE_CANCEL_URL` deben ser URLs del frontend.
