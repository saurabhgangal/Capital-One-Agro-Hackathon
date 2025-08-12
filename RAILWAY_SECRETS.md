# Railway Secrets Configuration for WhatsApp Integration

## Required Environment Variables

To run the WhatsApp integration securely on Railway, you need to set the following secrets:

### 1. WhatsApp Configuration
```bash
# Enable WhatsApp functionality
WHATSAPP_ENABLED=true

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

# Set secrets
railway variables set WHATSAPP_ENABLED=true
railway variables set WHATSAPP_CLIENT_ID=kisan-ai
railway variables set WHATSAPP_DATA_PATH=./whatsapp-sessions
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
WHATSAPP_ENABLED = "true"
WHATSAPP_CLIENT_ID = "kisan-ai"
WHATSAPP_DATA_PATH = "./whatsapp-sessions"
NODE_ENV = "production"
PORT = "3000"
```

## Security Best Practices

1. **Never commit secrets to git** - They are automatically ignored
2. **Use strong, unique values** for sensitive data
3. **Rotate secrets regularly** for production environments
4. **Limit access** to Railway secrets to only necessary team members
5. **Monitor secret usage** through Railway logs

## WhatsApp Session Management

- WhatsApp sessions are stored in the `whatsapp-sessions/` directory
- This directory is automatically ignored by git
- Sessions persist between deployments
- Users only need to scan QR code once per device

## Troubleshooting

### WhatsApp not connecting?
- Check if `WHATSAPP_ENABLED=true`
- Verify `WHATSAPP_CLIENT_ID` is unique
- Ensure `WHATSAPP_DATA_PATH` is writable

### AI features not working?
- Verify `OPENAI_API_KEY` is set correctly
- Check if the API key has sufficient credits
- Ensure the key has access to required models

### Database connection issues?
- Verify `MONGODB_URI` is correct
- Check if the database is accessible from Railway
- Ensure proper authentication credentials
