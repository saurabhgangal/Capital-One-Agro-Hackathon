# 🚜 Kisan AI - Smart Farming Assistant

> **AI-powered agriculture assistant for Indian farmers with multilingual support, crop disease detection, and market insights**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

## 🌾 Overview

Kisan AI is a comprehensive AI-powered web application designed specifically for Indian farmers. It provides intelligent assistance for various farming activities including crop management, disease detection, market analysis, irrigation scheduling, and government scheme recommendations.

## ✨ Features

### 🤖 AI-Powered Assistance
- **Multilingual Chat Support** - Hindi, English, and other Indian languages
- **Voice-to-Text** - Speak in your preferred language
- **Intelligent Farming Advice** - Context-aware recommendations
- **Real-time Responses** - Instant AI-powered solutions

### 🔍 Crop Disease Detection
- **Image Analysis** - Upload crop photos for disease identification
- **VLM Integration** - Advanced computer vision for accurate detection
- **Treatment Recommendations** - Organic and chemical solutions
- **Prevention Strategies** - Proactive disease management

### 📊 Market Intelligence
- **Price Forecasting** - Predict optimal selling times
- **Market Analysis** - Location-specific insights
- **Trend Analysis** - Historical price patterns
- **Market Recommendations** - Best selling locations

### 💧 Irrigation Management
- **Smart Scheduling** - Weather-based irrigation plans
- **Water Conservation** - Efficient water usage strategies
- **System Recommendations** - Optimal irrigation setup
- **IoT Integration** - Smart farming capabilities

### 🏛️ Government Schemes & Credit
- **Scheme Recommendations** - Personalized eligibility
- **Credit Evaluation** - Loan assessment tools
- **Application Guidance** - Step-by-step processes
- **Financial Planning** - Budget optimization

### 📱 WhatsApp Integration
- **Automated Reminders** - Crop care notifications
- **Weather Alerts** - Real-time weather updates
- **Market Updates** - Price change notifications
- **Crop Monitoring** - Growth stage reminders

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Redis 7.0+ (optional)
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/kisan-ai.git
cd kisan-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Start the application**
```bash
# Development
npm run dev

# Production
npm run build:client
npm start
```

### Docker Deployment

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

2. **Access the application**
- Web App: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379

## 🏗️ Architecture

### Backend Structure
```
src/
├── routes/           # API endpoints
│   ├── ai.js        # AI chat and analysis
│   ├── crop.js      # Crop management
│   ├── market.js    # Market analysis
│   ├── credit.js    # Credit and schemes
│   ├── irrigation.js # Irrigation management
│   ├── whatsapp.js  # WhatsApp integration
│   └── user.js      # User management
├── models/           # Database models
├── middleware/       # Custom middleware
└── utils/           # Utility functions
```

### Frontend Structure
```
src/client/
├── index.html       # Main HTML template
├── styles.css       # Comprehensive styling
├── app.js          # Main application logic
└── components/     # Reusable components
```

### Key Technologies
- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **AI**: OpenAI GPT-4, Vision, Whisper
- **Database**: MongoDB with Mongoose
- **Cache**: Redis (optional)
- **Real-time**: Socket.IO
- **WhatsApp**: whatsapp-web.js
- **Deployment**: Docker, Docker Compose

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/kisan-ai

# Optional
REDIS_URL=redis://localhost:6379
WEATHER_API_KEY=your_weather_api_key
MARKET_API_KEY=your_market_api_key
```

### API Endpoints

#### AI Services
- `POST /api/ai/chat` - Multilingual AI chat
- `POST /api/ai/detect-disease` - Crop disease detection
- `POST /api/ai/voice-to-text` - Voice transcription
- `POST /api/ai/farming-advice` - Farming recommendations

#### Crop Management
- `POST /api/crop/recommend-crop` - Crop recommendations
- `POST /api/crop/soil-analysis` - Soil health analysis
- `POST /api/crop/disease-prevention` - Disease prevention
- `POST /api/crop/planting-calendar` - Planting schedule

#### Market Analysis
- `POST /api/market/price-analysis` - Price analysis
- `POST /api/market/optimal-selling-time` - Selling strategy
- `POST /api/market/market-recommendations` - Market recommendations
- `POST /api/market/price-trends` - Price trends

#### Credit & Schemes
- `POST /api/credit/government-schemes` - Scheme recommendations
- `POST /api/credit/credit-evaluation` - Credit assessment
- `POST /api/credit/loan-recommendations` - Loan products
- `POST /api/credit/financial-planning` - Financial planning

#### Irrigation
- `POST /api/irrigation/irrigation-schedule` - Irrigation schedule
- `POST /api/irrigation/weather-irrigation` - Weather-based irrigation
- `POST /api/irrigation/water-conservation` - Water conservation
- `POST /api/irrigation/system-selection` - System selection

#### WhatsApp Integration
- `GET /api/whatsapp/qr` - WhatsApp QR code
- `POST /api/whatsapp/send-message` - Send message
- `POST /api/whatsapp/schedule-reminder` - Schedule reminders
- `POST /api/whatsapp/crop-reminders` - Crop care reminders

## 📱 Mobile-First Design

The application is built with a mobile-first approach, ensuring optimal experience on:
- Smartphones (Android/iOS)
- Tablets
- Desktop computers
- Low-bandwidth connections

### Responsive Features
- Touch-friendly interface
- Optimized for small screens
- Fast loading times
- Offline capabilities (PWA)

## 🌍 Multilingual Support

### Supported Languages
- **Hindi** (हिंदी) - Primary language
- **English** - Secondary language
- **Regional Languages** - Extensible framework

### Language Features
- Dynamic language switching
- Culturally appropriate responses
- Local farming terminology
- Regional crop knowledge

## 🔒 Security Features

- JWT authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- File upload restrictions

## 📊 Performance Optimization

- Image compression
- Lazy loading
- Caching strategies
- CDN ready
- Gzip compression
- Optimized bundles

## 🚀 Deployment Options

### 1. Local Development
```bash
npm run dev
```

### 2. Docker Deployment
```bash
docker-compose up -d
```

### 3. Cloud Deployment
- **AWS**: EC2 + RDS + ElastiCache
- **Google Cloud**: Compute Engine + Cloud SQL
- **Azure**: App Service + Cosmos DB
- **Heroku**: Container deployment

### 4. Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups enabled
- [ ] Monitoring setup
- [ ] Log aggregation
- [ ] Error tracking
- [ ] Performance monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone
git clone https://github.com/your-username/kisan-ai.git

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Capital One Hackathon Team** - Project inspiration
- **OpenAI** - AI capabilities
- **Indian Farmers** - Real-world use cases
- **Open Source Community** - Libraries and tools

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/kisan-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/kisan-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/kisan-ai/discussions)
- **Email**: support@kisan-ai.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/kisan-ai&type=Date)](https://star-history.com/#your-username/kisan-ai&Date)

---

**Made with ❤️ for Indian Farmers**

*Empowering agriculture through AI technology*
