# Setup WhatsApp

## Variables
```env
WHATSAPP_NUMBER=51999999999
WHATSAPP_MESSAGE_TEMPLATE="Hola, soy {firstName} {lastName} (email: {email}). Mi pedido #{orderCode} incluye: {itemsSummary}. Total pagado: S/ {total}. Quiero coordinar la entrega por este chat."
```

## Notas
- El numero debe ser solo digitos, sin + ni espacios.
- El template puede usar placeholders como `{firstName}`, `{orderCode}` y `{total}`.
- El enlace final se arma con `https://wa.me/<numero>?text=<mensaje>`.
