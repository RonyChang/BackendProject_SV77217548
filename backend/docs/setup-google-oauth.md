# Setup Google OAuth

## Requisitos
- Cuenta en Google Cloud.
- Pantalla de consentimiento configurada.
- Credenciales OAuth 2.0 (tipo Web).

## Pasos
1. Crear un proyecto en Google Cloud.
2. Configurar la pantalla de consentimiento.
3. Crear credenciales OAuth 2.0 para aplicacion web.
4. Agregar la URI de redireccion autorizada.
5. Copiar Client ID y Client Secret al `.env`.

## Variables
```env
GOOGLE_CLIENT_ID=changeme
GOOGLE_CLIENT_SECRET=changeme
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

## Notas
- La URL de callback debe coincidir con la ruta real del backend.
