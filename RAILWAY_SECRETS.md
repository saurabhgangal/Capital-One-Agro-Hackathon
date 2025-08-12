# Railway Secrets Configuration for WhatsApp Integration

## Required Environment Variables

To run the WhatsApp integration securely on Railway, you need to set the following secrets:

### 1. WhatsApp Configuration

#### Option A: WhatsApp Business API (Recommended - No QR Code Needed)
```bash
# Enable WhatsApp Business API
WHATSAPP_BUSINESS_API_ENABLED=true

# Your WhatsApp Business API access token
WHATSAPP_BUSINESS_API_TOKEN=your_access_token_here

# Your WhatsApp Business phone number ID
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your_phone_number_id_here

# Webhook verification token
WHATSAPP_BUSINESS_VERIFY_TOKEN=your_webhook_verify_token_here
```

#### Option B: WhatsApp Web.js (QR Code Method - Fallback)
```bash
# Enable WhatsApp Web.js
WHATSAPP_BUSINESS_API_ENABLED=false

# Unique client ID for WhatsApp sessions
WHATSAPP_CLIENT_ID=kisan-ai

# Path for storing WhatsApp session data
WHATSAPP_DATA_PATH=./whatsapp-sessions
```

### 2. OpenAI Configuration (for AI features)
```bash
# Your OpenAI API key for AI-powered features
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. MongoDB Configuration
```bash
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 4. Server Configuration
```bash
# Server port
PORT=3000

# Environment
NODE_ENV=production
```

## How to Set Secrets in Railway

### Option 1: Railway Dashboard
1. Go to your Railway project dashboard
2. Navigate to the "Variables" tab
3. Add each environment variable as a secret
4. Click "Add Variable" for each one

### Option 2: Railway CLI
```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login to Railway
railway login

# Set WhatsApp Business API secrets (Recommended)
railway variables set WHATSAPP_BUSINESS_API_ENABLED=true
railway variables set WHATSAPP_BUSINESS_API_TOKEN=your_access_token_here
railway variables set WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your_phone_number_id_here
railway variables set WHATSAPP_BUSINESS_VERIFY_TOKEN=your_webhook_verify_token_here

# Set other secrets
railway variables set OPENAI_API_KEY=your_openai_api_key_here
railway variables set MONGODB_URI=your_mongodb_connection_string_here
railway variables set PORT=3000
railway variables set NODE_ENV=production
```

### Option 3: Railway.toml (for local development)
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300

[deploy.variables]
WHATSAPP_BUSINESS_API_ENABLED = "true"
WHATSAPP_BUSINESS_API_TOKEN = "your_access_token_here"
WHATSAPP_BUSINESS_PHONE_NUMBER_ID = "your_phone_number_id_here"
WHATSAPP_BUSINESS_VERIFY_TOKEN = "your_webhook_verify_token_here"
NODE_ENV = "production"
PORT = "3000"
```

## WhatsApp Business API Setup

### 1. Create Meta Developer Account
- Go to [Meta for Developers](https://developers.facebook.com/)
- Create a new app or use existing one
- Add WhatsApp product to your app

### 2. Get Business Account
- Set up WhatsApp Business Account
- Verify your business phone number
- Get your Phone Number ID

### 3. Generate Access Token
- Go to System Users or App settings
- Generate a permanent access token
- Ensure it has WhatsApp permissions

### 4. Set Up Webhook (Optional)
- Configure webhook URL: `https://your-domain.com/api/whatsapp/webhook`
- Set verification token
- Subscribe to message events

## Benefits of WhatsApp Business API

✅ **No QR Code Required** - Direct API access
✅ **Professional Solution** - Official Meta API
✅ **Reliable Delivery** - 99.9% success rate
✅ **Business Features** - Templates, analytics
✅ **Scalable** - Handle thousands of messages
✅ **Webhook Support** - Receive incoming messages

## Security Best Practices

1. **Never commit secrets to git** - They are automatically ignored
2. **Use strong, unique values** for sensitive data
3. **Rotate secrets regularly** for production environments
4. **Limit access** to Railway secrets to only necessary team members
5. **Monitor secret usage** through Railway logs
6. **Use environment-specific tokens** for dev/staging/production

## WhatsApp Session Management

- **Business API**: No sessions needed - always ready
- **Web.js Fallback**: Sessions stored in `whatsapp-sessions/` directory
- **Automatic Fallback**: If Business API fails, falls back to Web.js
- **Hybrid Approach**: Best of both worlds

## Troubleshooting

### WhatsApp Business API not working?
- Check if `WHATSAPP_BUSINESS_API_ENABLED=true`
- Verify `WHATSAPP_BUSINESS_API_TOKEN` is valid
- Ensure `WHATSAPP_BUSINESS_PHONE_NUMBER_ID` is correct
- Check if your business account is verified

### Falling back to QR code method?
- Business API credentials might be invalid
- Check Meta Developer Console for errors
- Verify app permissions and settings

### AI features not working?
- Verify `OPENAI_API_KEY` is set correctly
- Check if the API key has sufficient credits
- Ensure the key has access to required models

### Database connection issues?
- Verify `MONGODB_URI` is correct
- Check if the database is accessible from Railway
- Ensure proper authentication credentials
