# ☁️ Cloud Deployment Guide for Kisan AI

## 🚀 **Quick Deploy Options**

### **Option 1: Railway (Recommended - Easiest)**
**Free Tier**: $5 credit monthly, 500 hours runtime

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Deploy**:
   ```bash
   railway init
   railway up
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI="your_mongodb_uri"
   railway variables set OPENAI_API_KEY="your_openai_key"
   railway variables set JWT_SECRET="your_jwt_secret"
   ```

5. **Get Your URL**:
   ```bash
   railway status
   ```

---

### **Option 2: Render (Free Tier Available)**
**Free Tier**: 750 hours monthly, auto-sleep after 15 min

1. **Go to**: [render.com](https://render.com)
2. **Connect GitHub** repository
3. **Create New Web Service**
4. **Configure**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. **Set Environment Variables** in dashboard
6. **Deploy** automatically

---

### **Option 3: Heroku (Paid but Reliable)**
**Free Tier**: Discontinued, starts at $7/month

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   heroku create kisan-ai-app
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set OPENAI_API_KEY="your_openai_key"
   ```

---

## 🔧 **Pre-Deployment Setup**

### **1. Update package.json**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step needed'",
    "postinstall": "echo 'Post-install complete'"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### **2. Create Procfile (for Heroku)**
```
web: npm start
```

### **3. Update server.js for Production**
```javascript
// Add at the top of server.js
const config = require('./production.config');

// Update CORS for production
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests
});
app.use('/api/', limiter);
```

---

## 🌐 **Environment Variables to Set**

### **Required Variables**:
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kisan_ai
OPENAI_API_KEY=sk-your-openai-key-here
JWT_SECRET=your-super-secret-jwt-key
```

### **Optional Variables**:
```bash
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=52428800
LOG_LEVEL=info
```

---

## 📱 **Mobile App Deployment**

### **PWA Features Already Included**:
- ✅ Service Worker
- ✅ Manifest.json
- ✅ Offline capability
- ✅ Mobile-responsive design
- ✅ Touch-friendly interface

### **Install on Mobile**:
1. Open your deployed URL on mobile
2. Tap "Add to Home Screen"
3. App will work like a native app

---

## 🔒 **Security Considerations**

### **Production Security**:
1. **HTTPS Only**: All cloud platforms provide this
2. **Rate Limiting**: Already configured
3. **CORS**: Restrict to your domain
4. **JWT Secrets**: Use strong, unique secrets
5. **API Keys**: Never commit to git

### **Environment Variable Security**:
```bash
# ✅ Good - Set in cloud dashboard
OPENAI_API_KEY=sk-...

# ❌ Bad - Never in code
const apiKey = "sk-...";
```

---

## 📊 **Monitoring & Logs**

### **Health Check Endpoint**:
- **URL**: `/health`
- **Response**: JSON with status, database, version
- **Use**: Monitor app health, uptime

### **Logs**:
- **Railway**: `railway logs`
- **Render**: Dashboard logs tab
- **Heroku**: `heroku logs --tail`

---

## 🚀 **Deployment Commands**

### **Railway Deployment**:
```bash
# Full deployment process
npm install -g @railway/cli
railway login
railway init
railway up

# Set variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="your_uri"
railway variables set OPENAI_API_KEY="your_key"

# Check status
railway status
railway logs
```

### **Render Deployment**:
1. Connect GitHub repo
2. Create Web Service
3. Set environment variables
4. Deploy automatically

### **Heroku Deployment**:
```bash
heroku login
heroku create kisan-ai-app
git push heroku main
heroku config:set NODE_ENV=production
heroku open
```

---

## 🌍 **Custom Domain Setup**

### **Railway**:
1. Go to app settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records

### **Render**:
1. App settings → Custom domains
2. Add domain
3. Update DNS with CNAME

### **Heroku**:
```bash
heroku domains:add yourdomain.com
# Update DNS with CNAME to your-app.herokuapp.com
```

---

## 📈 **Scaling Options**

### **Railway**:
- **Auto-scaling**: Built-in
- **Manual scaling**: Available in dashboard

### **Render**:
- **Free**: 750 hours/month
- **Paid**: $7/month, unlimited

### **Heroku**:
- **Basic**: $7/month
- **Standard**: $25/month
- **Performance**: $250/month

---

## 🔄 **Continuous Deployment**

### **GitHub Actions** (Recommended):
```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🆘 **Troubleshooting**

### **Common Issues**:

1. **Port Binding Error**:
   ```javascript
   // Use environment PORT
   const PORT = process.env.PORT || 3000;
   ```

2. **MongoDB Connection**:
   - Check connection string
   - Verify network access
   - Check credentials

3. **Build Failures**:
   - No build step needed for this app
   - Ensure all dependencies in package.json

4. **Environment Variables**:
   - Set in cloud dashboard
   - Restart app after changes

---

## 🎯 **Recommended Deployment Path**

### **For Beginners**:
1. **Start with Railway** (easiest)
2. **Use free tier** to test
3. **Scale up** as needed

### **For Production**:
1. **Railway** or **Render** for hosting
2. **Custom domain** for branding
3. **Monitoring** and **logs** setup
4. **Backup** and **recovery** plan

---

## 🎉 **Post-Deployment Checklist**

- ✅ App accessible via URL
- ✅ Health check endpoint working
- ✅ MongoDB connected
- ✅ AI chat functional
- ✅ File uploads working
- ✅ Custom datasets accessible
- ✅ Mobile responsive
- ✅ HTTPS enabled
- ✅ Environment variables set
- ✅ Monitoring configured

---

**🚀 Your Kisan AI app is ready for cloud deployment! Choose Railway for the easiest experience or Render for a free tier option.**
