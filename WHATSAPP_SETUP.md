# WhatsApp Integration Setup Guide

## Required Environment Variables

Add these to your `.env` file or Railway environment variables:

```bash
# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_CLIENT_ID=kisan-ai-farmer
WHATSAPP_DATA_PATH=./whatsapp-sessions

# Optional: Custom Puppeteer settings
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Setup Steps

1. **Enable WhatsApp**: Set `WHATSAPP_ENABLED=true`
2. **Deploy the app** - WhatsApp will generate a QR code
3. **Scan QR Code**: Use WhatsApp mobile app to scan the QR code
4. **Authentication**: Complete the authentication process
5. **Start Sending**: Once connected, you can send messages

## Security Notes

- WhatsApp sessions are stored locally in `./whatsapp-sessions`
- Each deployment will require re-authentication
- QR codes are generated only when needed
- Connection status is monitored and logged

## Troubleshooting

- **QR Code not showing**: Check `WHATSAPP_ENABLED=true`
- **Connection failed**: Check browser compatibility
- **Messages not sending**: Verify authentication status

## API Endpoints

- `GET /api/whatsapp/status` - Check connection status
- `GET /api/whatsapp/qr` - Get QR code for authentication
- `POST /api/whatsapp/send-message` - Send a message
