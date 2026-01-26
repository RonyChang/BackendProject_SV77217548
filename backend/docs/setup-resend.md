# Configuracion de Resend

Resend se usa para enviar correos de verificacion, 2FA admin, confirmacion de pago y estados de envio.

## Pasos
1. Crea una cuenta en Resend.
2. Verifica tu dominio (ej. `spacegurumis.lat`).
3. Genera una API key.

## Variables en .env
```bash
RESEND_API_KEY=re_xxx
RESEND_FROM="Spacegurumis <no-reply@spacegurumis.lat>"
```

## Notas
- Verificacion de email y 2FA admin usan Resend.
- El correo de pago se envia cuando `paymentStatus` pasa a `approved`.
- Los correos de estado se envian al pasar a `shipped` o `delivered`.
- Si Resend falla, el webhook sigue respondiendo OK y el error se registra en logs.
