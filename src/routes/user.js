const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory user storage (replace with database in production)
let users = [];

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, phone, region, language, landSize, crops, experience } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(user => user.phone === phone);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      region,
      language: language || 'hi',
      landSize,
      crops: crops || [],
      experience,
      createdAt: new Date().toISOString(),
      preferences: {
        notifications: true,
        language: language || 'hi',
        region: region
      }
    };
    
    users.push(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, phone: newUser.phone },
      process.env.JWT_SECRET || 'kisan-ai-secret',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        region: newUser.region,
        language: newUser.language
      },
      token
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Find user
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET || 'kisan-ai-secret',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        region: user.region,
        language: user.language
      },
      token
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        region: user.region,
        language: user.language,
        landSize: user.landSize,
        crops: user.crops,
        experience: user.experience,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, region, language, landSize, crops, experience, preferences } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      region: region || users[userIndex].region,
      language: language || users[userIndex].language,
      landSize: landSize || users[userIndex].landSize,
      crops: crops || users[userIndex].crops,
      experience: experience || users[userIndex].experience,
      preferences: { ...users[userIndex].preferences, ...preferences }
    };
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[userIndex]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Get Personalized Recommendations
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const { category, query } = req.body;
    
    const systemPrompt = `You are KisanAI, providing personalized farming recommendations for Indian farmers.
    
**Farmer Profile:**
- Name: ${user.name}
- Region: ${user.region}
- Land Size: ${user.landSize}
- Crops: ${user.crops.join(', ')}
- Experience: ${user.experience} years
- Language: ${user.language}

**Request Category:** ${category}
**Specific Query:** ${query}

Provide personalized recommendations considering:
1. Local conditions in ${user.region}
2. Farmer's experience level (${user.experience} years)
3. Current crops (${user.crops.join(', ')})
4. Land size constraints (${user.landSize})
5. Regional best practices
6. Government schemes for ${user.region}
7. Market opportunities in the area
8. Technology adoption level
9. Budget considerations
10. Risk tolerance based on experience

Respond in ${user.language} language with practical, actionable advice.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      max_tokens: 800,
      temperature: 0.6
    });

    res.json({
      success: true,
      recommendations: completion.choices[0].message.content,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
});

// Get User Dashboard Data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Generate personalized dashboard data
    const dashboardData = await generateDashboardData(user);
    
    res.json({
      success: true,
      dashboard: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate dashboard' });
  }
});

// Generate personalized dashboard data
async function generateDashboardData(user) {
  try {
    const systemPrompt = `You are KisanAI, creating a personalized farming dashboard for an Indian farmer.
    
**Farmer Profile:**
- Name: ${user.name}
- Region: ${user.region}
- Land Size: ${user.landSize}
- Crops: ${user.crops.join(', ')}
- Experience: ${user.experience} years

Create a comprehensive dashboard with:

1. **Today's Tasks** (based on crops and season)
2. **Weather Alerts** (for ${user.region})
3. **Market Updates** (for ${user.crops.join(', ')})
4. **Crop Health Status** (general recommendations)
5. **Financial Summary** (income opportunities)
6. **Government Schemes** (available for ${user.region})
7. **Learning Resources** (based on experience level)
8. **Community Updates** (local farming news)

Provide actionable insights in ${user.language} language.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate my personalized farming dashboard" }
      ],
      max_tokens: 1000,
      temperature: 0.6
    });

    return {
      summary: completion.choices[0].message.content,
      quickActions: [
        { title: 'Crop Disease Check', action: 'disease-detection', icon: '🔍' },
        { title: 'Market Prices', action: 'market-prices', icon: '📊' },
        { title: 'Weather Update', action: 'weather', icon: '🌤️' },
        { title: 'Government Schemes', action: 'schemes', icon: '🏛️' }
      ],
      notifications: [
        { type: 'info', message: 'आज आपकी फसल में खाद डालने का समय है', time: '2 hours ago' },
        { type: 'warning', message: 'कल बारिश की संभावना है, सिंचाई की योजना बनाएं', time: '1 day ago' },
        { type: 'success', message: 'बाजार में गेहूं के दाम बढ़ रहे हैं', time: '3 days ago' }
      ]
    };
  } catch (error) {
    console.error('Dashboard generation error:', error);
    return {
      summary: 'आपका डैशबोर्ड तैयार हो रहा है...',
      quickActions: [],
      notifications: []
    };
  }
}

// Update User Preferences
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const { notifications, language, region, cropAlerts, marketUpdates, weatherAlerts } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    users[userIndex].preferences = {
      ...users[userIndex].preferences,
      notifications: notifications !== undefined ? notifications : users[userIndex].preferences.notifications,
      language: language || users[userIndex].preferences.language,
      region: region || users[userIndex].preferences.region,
      cropAlerts: cropAlerts !== undefined ? cropAlerts : users[userIndex].preferences.cropAlerts,
      marketUpdates: marketUpdates !== undefined ? marketUpdates : users[userIndex].preferences.marketUpdates,
      weatherAlerts: weatherAlerts !== undefined ? weatherAlerts : users[userIndex].preferences.weatherAlerts
    };
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: users[userIndex].preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'kisan-ai-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
