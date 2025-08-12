# 🗄️ MongoDB Integration Guide for Kisan AI

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (free tier available)
- npm or yarn package manager

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install mongoose bcryptjs jsonwebtoken dotenv
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kisan_ai?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. MongoDB Atlas Setup

#### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

#### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS, Google Cloud, or Azure)
4. Choose region closest to your users
5. Click "Create"

#### Step 3: Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password
5. Select "Read and write to any database"
6. Click "Add User"

#### Step 4: Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `kisan_ai`

### 4. Database Models

The app includes three main models:

#### User Model (`src/models/User.js`)
- **Authentication**: Username, email, phone, password
- **Personal Info**: Name, date of birth, gender
- **Location**: State, district, village, pincode
- **Farming**: Farm size, crops, experience, irrigation
- **Financial**: Annual income, bank details
- **Preferences**: Language, notifications

#### Chat Model (`src/models/Chat.js`)
- **Conversation History**: User messages and AI responses
- **Context**: Crop info, location, weather
- **Metadata**: Language, category, response time
- **Multilingual Support**: 15+ Indian languages

#### Crop Model (`src/models/Crop.js`)
- **Crop Information**: Name, scientific name, local names
- **Growing Details**: Season, climate, soil requirements
- **Diseases & Pests**: Symptoms, prevention, treatment
- **Market Data**: Prices, demand, government schemes

### 5. Authentication System

#### JWT Token Structure
```json
{
  "userId": "user_id_here",
  "iat": 1234567890,
  "exp": 1234567890
}
```

#### Protected Routes
- `/api/user/profile` - Get user profile
- `/api/user/profile` - Update profile
- `/api/user/change-password` - Change password
- `/api/user/account` - Delete account

#### Public Routes
- `/api/user/register` - User registration
- `/api/user/login` - User login
- `/api/user/forgot-password` - Password reset
- `/api/user/reset-password` - Reset password

### 6. API Endpoints

#### User Management
```bash
# Registration
POST /api/user/register
{
  "username": "farmer123",
  "email": "farmer@example.com",
  "password": "securepassword",
  "phone": "9876543210",
  "firstName": "Ram",
  "lastName": "Singh",
  "state": "Punjab",
  "district": "Amritsar",
  "village": "Golden Village",
  "pincode": "143001",
  "farmSize": 5,
  "primaryCrop": "Wheat"
}

# Login
POST /api/user/login
{
  "identifier": "farmer@example.com",
  "password": "securepassword"
}

# Get Profile
GET /api/user/profile
Authorization: Bearer <jwt_token>

# Update Profile
PUT /api/user/profile
Authorization: Bearer <jwt_token>
{
  "farmSize": 7,
  "primaryCrop": "Rice"
}
```

#### Chat Management
```bash
# Start Chat Session
POST /api/ai/chat
Authorization: Bearer <jwt_token>
{
  "message": "मेरी गेहूं की फसल में क्या समस्या है?",
  "language": "hi",
  "context": {
    "crop": "Wheat",
    "farmSize": 5,
    "state": "Punjab"
  }
}
```

### 7. Database Indexes

#### Performance Optimizations
```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ state: 1, district: 1 });
userSchema.index({ primaryCrop: 1 });

// Chat indexes
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });
chatSchema.index({ 'metadata.category': 1 });

// Crop indexes
cropSchema.index({ name: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ 'season.kharif': 1 });
```

### 8. Security Features

#### Password Security
- **Hashing**: bcryptjs with salt rounds 12
- **Validation**: Minimum 6 characters
- **Reset**: Secure token-based password reset

#### JWT Security
- **Secret**: Environment variable-based secret
- **Expiration**: Configurable token expiration
- **Validation**: Token verification middleware

#### Data Validation
- **Input Sanitization**: Trim, lowercase, regex validation
- **Type Checking**: Mongoose schema validation
- **Access Control**: Role-based authentication

### 9. Error Handling

#### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": "Additional error information"
}
```

#### Common Error Codes
- `TOKEN_MISSING` - No JWT token provided
- `INVALID_TOKEN` - Invalid JWT token
- `TOKEN_EXPIRED` - JWT token expired
- `USER_NOT_FOUND` - User not found
- `ACCOUNT_DEACTIVATED` - User account deactivated

### 10. Testing the Setup

#### 1. Start the Server
```bash
npm start
```

#### 2. Check MongoDB Connection
Look for these messages in console:
```
✅ MongoDB connected successfully
🗄️ Database: MongoDB Atlas
📊 Models: User, Chat, Crop
```

#### 3. Test User Registration
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testfarmer",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210",
    "firstName": "Test",
    "lastName": "Farmer",
    "state": "Maharashtra",
    "district": "Mumbai",
    "village": "Test Village",
    "pincode": "400001",
    "farmSize": 3,
    "primaryCrop": "Rice"
  }'
```

#### 4. Test User Login
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

### 11. Production Considerations

#### Environment Variables
- Use strong, unique JWT secrets
- Enable MongoDB Atlas IP whitelist
- Use environment-specific configurations

#### Security
- Enable HTTPS in production
- Implement rate limiting
- Add request validation
- Enable CORS restrictions

#### Monitoring
- Set up MongoDB Atlas alerts
- Monitor database performance
- Log authentication attempts
- Track API usage

### 12. Troubleshooting

#### Common Issues

**1. MongoDB Connection Failed**
```
❌ MongoDB connection failed: connection timed out
```
**Solution**: Check network access, connection string, credentials

**2. JWT Token Invalid**
```
❌ Invalid token. User not found.
```
**Solution**: Verify JWT_SECRET, check token expiration

**3. User Registration Failed**
```
❌ User already exists with this email, phone, or username
```
**Solution**: Use unique email, phone, and username

**4. Password Validation Error**
```
❌ Password must be at least 6 characters long
```
**Solution**: Ensure password meets minimum requirements

### 13. Next Steps

After MongoDB integration:

1. **Add Data Seeding**: Populate crops, diseases, and government schemes
2. **Implement Caching**: Add Redis for performance optimization
3. **Add Analytics**: Track user behavior and app usage
4. **Enable Notifications**: SMS, email, and push notifications
5. **Add Admin Panel**: Manage users, content, and analytics

## 🎯 Benefits of MongoDB Integration

- **Scalability**: Handle thousands of farmers
- **Data Persistence**: Store chat history and user preferences
- **Real-time Updates**: Live data synchronization
- **Multilingual Support**: Store content in multiple languages
- **Analytics**: Track farming patterns and app usage
- **Security**: Secure user authentication and data access

## 📞 Support

For MongoDB integration issues:
1. Check MongoDB Atlas status
2. Verify connection string format
3. Ensure network access is configured
4. Check environment variables
5. Review server logs for detailed errors

---

**Happy Farming with Kisan AI! 🚜🌾**
