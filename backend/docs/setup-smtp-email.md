# Setup SMTP Email

## Requisitos
- Cuenta SMTP (Gmail, SendGrid, Mailgun, etc.).
- Tambien se puede usar tu correo directamente con una clave a aplicacion.

## Variables
```env
EMAIL_PROVIDER=smtp
EMAIL_FROM="Spacegurumis <no-reply@spacegurumis.com>"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=changeme
SMTP_PASS=changeme
```

## Notas
- El puerto 587 suele usarse con TLS.
- El puerto 465 suele usarse con SSL.
- Si usas Gmail, crea una contrasena de aplicacion.
