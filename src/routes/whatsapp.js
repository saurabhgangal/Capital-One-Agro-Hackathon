const express = require('express');
const router = express.Router();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cron = require('node-cron');
const OpenAI = require('openai');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Initialize WhatsApp client
let whatsappClient = null;
let qrCode = null;
let isInitializing = false;
let isConnected = false;

// Initialize WhatsApp
const initializeWhatsApp = async () => {
  // Check if already initializing or connected
  if (isInitializing || isConnected) {
    console.log('📱 WhatsApp already initializing or connected');
    return;
  }

  console.log('📱 Starting WhatsApp initialization...');

  try {
    isInitializing = true;
    console.log('📱 Initializing WhatsApp client...');
    
    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        clientId: process.env.WHATSAPP_CLIENT_ID || 'kisan-ai',
        dataPath: process.env.WHATSAPP_DATA_PATH || './whatsapp-sessions'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    whatsappClient.on('qr', async (qr) => {
      if (!isConnected) {
        qrCode = await qrcode.toDataURL(qr);
        console.log('📱 WhatsApp QR Code generated - Scan to connect');
      }
    });

    whatsappClient.on('ready', () => {
      console.log('✅ WhatsApp client is ready!');
      isConnected = true;
      isInitializing = false;
      qrCode = null;
    });

    whatsappClient.on('authenticated', () => {
      console.log('🔐 WhatsApp client authenticated');
    });

    whatsappClient.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp authentication failed:', msg);
      isConnected = false;
      isInitializing = false;
    });

    whatsappClient.on('disconnected', (reason) => {
      console.log('📱 WhatsApp client disconnected:', reason);
      isConnected = false;
      isInitializing = false;
    });

    await whatsappClient.initialize();
  } catch (error) {
    console.error('WhatsApp initialization error:', error);
    isInitializing = false;
  }
};

// Always initialize WhatsApp on startup for simplicity
console.log('🔄 Starting WhatsApp initialization...');
initializeWhatsApp();

// Get WhatsApp QR Code - SUPER SIMPLE
router.get('/qr', async (req, res) => {
  console.log('📱 QR code requested. Status:', { isConnected, isInitializing, hasQR: !!qrCode });
  
  if (isConnected) {
    res.json({ success: true, message: 'WhatsApp is already connected' });
  } else if (qrCode) {
    console.log('📱 Returning existing QR code');
    res.json({ success: true, qrCode: qrCode, status: 'waiting_for_scan' });
  } else if (isInitializing) {
    res.json({ success: false, message: 'WhatsApp is initializing, please wait...' });
  } else {
    // Force immediate initialization
    console.log('📱 Force initializing WhatsApp...');
    try {
      await initializeWhatsApp();
      
      // Wait for QR code with timeout
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!qrCode && attempts < maxAttempts) {
        console.log(`📱 Waiting for QR code... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      if (qrCode) {
        console.log('📱 QR code generated successfully, returning to user');
        res.json({ success: true, qrCode: qrCode, status: 'waiting_for_scan' });
      } else {
        console.log('📱 QR code not generated after waiting');
        res.json({ success: false, message: 'QR code not generated. Try again.' });
      }
    } catch (error) {
      console.error('Force initialization error:', error);
      res.json({ success: false, message: 'Failed to initialize WhatsApp' });
    }
  }
});

// Get WhatsApp Status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: {
      isConnected: isConnected,
      isInitializing: isInitializing,
      hasQRCode: !!qrCode,
      clientExists: !!whatsappClient,
      whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
      environment: process.env.NODE_ENV || 'production'
    }
  });
});

// Test WhatsApp connection
router.get('/test', async (req, res) => {
  try {
    if (!whatsappClient) {
      return res.json({ 
        success: false, 
        message: 'WhatsApp client not initialized',
        suggestion: 'Try /initialize endpoint first'
      });
    }
    
    if (!isConnected) {
      return res.json({ 
        success: false, 
        message: 'WhatsApp not connected',
        suggestion: 'Scan QR code to connect'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'WhatsApp is ready and connected!',
      status: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Force QR code generation for testing
router.get('/force-qr', async (req, res) => {
  try {
    console.log('📱 Force QR code generation requested');
    
    if (isConnected) {
      return res.json({ success: false, message: 'WhatsApp already connected' });
    }
    
    // Reset and reinitialize
    if (whatsappClient) {
      try {
        await whatsappClient.destroy();
      } catch (e) {
        console.log('Destroyed existing client');
      }
      whatsappClient = null;
    }
    
    isConnected = false;
    isInitializing = false;
    qrCode = null;
    
    // Start fresh initialization
    await initializeWhatsApp();
    
    // Wait for QR code
    let attempts = 0;
    const maxAttempts = 15;
    
    while (!qrCode && attempts < maxAttempts) {
      console.log(`📱 Waiting for QR code... attempt ${attempts + 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    if (qrCode) {
      console.log('📱 Force QR code generated successfully');
      res.json({ success: true, qrCode: qrCode, status: 'waiting_for_scan' });
    } else {
      console.log('📱 Force QR code failed');
      res.json({ success: false, message: 'Failed to generate QR code' });
    }
  } catch (error) {
    console.error('Force QR code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual WhatsApp initialization
router.post('/initialize', async (req, res) => {
  try {
    if (isInitializing || isConnected) {
      return res.json({ 
        success: false, 
        message: 'WhatsApp is already initializing or connected' 
      });
    }
    
    console.log('📱 Manual WhatsApp initialization requested...');
    
    // Reset any existing client
    if (whatsappClient) {
      try {
        await whatsappClient.destroy();
      } catch (e) {
        console.log('Destroyed existing client');
      }
      whatsappClient = null;
    }
    
    // Reset states
    isConnected = false;
    isInitializing = false;
    qrCode = null;
    
    // Start initialization
    await initializeWhatsApp();
    
    res.json({ 
      success: true, 
      message: 'WhatsApp initialization started. Check /qr endpoint for QR code.' 
    });
  } catch (error) {
    console.error('Manual initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize WhatsApp' 
    });
  }
});

// Helper function to send WhatsApp message (used by other routes)
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    if (!isConnected) {
      throw new Error('WhatsApp not connected. Please scan QR code first.');
    }

    if (!whatsappClient) {
      throw new Error('WhatsApp client not initialized');
    }

    // Format phone number for WhatsApp
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const chatId = `${formattedNumber}@c.us`;

    // Send message
    await whatsappClient.sendMessage(chatId, message);
    
    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    throw error;
  }
};

// Send WhatsApp Message
router.post('/send-message', async (req, res) => {
  try {
    const { phoneNumber, message, language = 'en' } = req.body;
    
    if (!whatsappClient || !whatsappClient.isConnected) {
      return res.status(400).json({ success: false, error: 'WhatsApp not connected' });
    }

    // Format phone number for WhatsApp
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const chatId = `${formattedNumber}@c.us`;

    // Send message
    await whatsappClient.sendMessage(chatId, message);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Schedule WhatsApp Reminders
router.post('/schedule-reminder', async (req, res) => {
  try {
    const { phoneNumber, message, scheduleTime, frequency, crop, task } = req.body;
    
    // Validate schedule time
    const scheduleDate = new Date(scheduleTime);
    if (isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid schedule time' });
    }

    // Create reminder task
    const reminderTask = cron.schedule(scheduleTime, async () => {
      try {
        if (whatsappClient && whatsappClient.isConnected) {
          const formattedNumber = phoneNumber.replace(/\D/g, '');
          const chatId = `${formattedNumber}@c.us`;
          
          // Send reminder message
          await whatsappClient.sendMessage(chatId, message);
          console.log(`📅 Reminder sent to ${phoneNumber}: ${task}`);
        }
      } catch (error) {
        console.error('Reminder sending error:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    res.json({
      success: true,
      message: 'Reminder scheduled successfully',
      phoneNumber: phoneNumber,
      scheduleTime: scheduleTime,
      task: task,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Schedule reminder error:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule reminder' });
  }
});

// Automated Crop Care Reminders
router.post('/crop-reminders', async (req, res) => {
  try {
    const { phoneNumber, crop, plantingDate, region, language = 'hi' } = req.body;
    
    // Calculate crop care schedule based on planting date
    const planting = new Date(plantingDate);
    const today = new Date();
    const daysSincePlanting = Math.floor((today - planting) / (1000 * 60 * 60 * 24));
    
    // Generate crop-specific reminders
    const reminders = generateCropReminders(crop, daysSincePlanting, region, language);
    
    // Schedule reminders
    reminders.forEach((reminder, index) => {
      const scheduleTime = new Date(planting.getTime() + (reminder.days * 24 * 60 * 60 * 1000));
      
      cron.schedule(scheduleTime, async () => {
        try {
          if (whatsappClient && whatsappClient.isConnected) {
            const formattedNumber = phoneNumber.replace(/\D/g, '');
            const chatId = `${formattedNumber}@c.us`;
            
            await whatsappClient.sendMessage(chatId, reminder.message);
            console.log(`🌱 Crop reminder sent: ${reminder.task}`);
          }
        } catch (error) {
          console.error('Crop reminder error:', error);
        }
      }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
      });
    });

    res.json({
      success: true,
      message: 'Crop reminders scheduled successfully',
      crop: crop,
      reminders: reminders.length,
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Crop reminders error:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule crop reminders' });
  }
});

// Generate crop-specific reminders
function generateCropReminders(crop, daysSincePlanting, region, language) {
  const reminders = [];
  
  // Common crop care schedule
  const careSchedule = {
    'rice': [
      { days: 7, task: 'seedling_care', message: `🌾 ${crop} के पौधों की देखभाल करें। पानी का स्तर बनाए रखें।` },
      { days: 15, task: 'fertilizer', message: `🌱 ${crop} में खाद डालने का समय आ गया है।` },
      { days: 30, task: 'pest_check', message: `🐛 ${crop} में कीटों की जांच करें।` },
      { days: 60, task: 'harvest_prep', message: `📅 ${crop} की कटाई की तैयारी शुरू करें।` }
    ],
    'wheat': [
      { days: 10, task: 'irrigation', message: `💧 ${crop} में सिंचाई करें।` },
      { days: 25, task: 'weed_control', message: `🌿 ${crop} में खरपतवार नियंत्रण करें।` },
      { days: 45, task: 'disease_check', message: `🔍 ${crop} में रोगों की जांच करें।` },
      { days: 90, task: 'harvest', message: `🌾 ${crop} की कटाई का समय आ गया है।` }
    ],
    'cotton': [
      { days: 5, task: 'thinning', message: `🌱 ${crop} में पतले पौधे हटाएं।` },
      { days: 20, task: 'pest_control', message: `🐛 ${crop} में कीट नियंत्रण करें।` },
      { days: 40, task: 'irrigation', message: `💧 ${crop} में सिंचाई करें।` },
      { days: 120, task: 'harvest', message: `🌿 ${crop} की कटाई शुरू करें।` }
    ]
  };

  const schedule = careSchedule[crop.toLowerCase()] || careSchedule['rice'];
  
  schedule.forEach(item => {
    if (item.days > daysSincePlanting) {
      reminders.push({
        days: item.days,
        task: item.task,
        message: item.message
      });
    }
  });

  return reminders;
}

// Weather Alerts via WhatsApp
router.post('/weather-alerts', async (req, res) => {
  try {
    const { phoneNumber, location, weatherData, crop } = req.body;
    
    // Generate weather-based farming advice
    const weatherAdvice = await generateWeatherAdvice(location, weatherData, crop);
    
    // Send weather alert
    if (whatsappClient && whatsappClient.isConnected) {
      const formattedNumber = phoneNumber.replace(/\D/g, '');
      const chatId = `${formattedNumber}@c.us`;
      
      const alertMessage = `🌤️ मौसम अलर्ट - ${location}\n\n${weatherAdvice}\n\nकृपया अपनी फसल की सुरक्षा करें।`;
      
      await whatsappClient.sendMessage(chatId, alertMessage);
    }

    res.json({
      success: true,
      message: 'Weather alert sent successfully',
      phoneNumber: phoneNumber,
      location: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weather alert error:', error);
    res.status(500).json({ success: false, error: 'Failed to send weather alert' });
  }
});

// Generate weather advice using AI
async function generateWeatherAdvice(location, weatherData, crop) {
  try {
    if (!openai) {
      return 'मौसम के अनुसार अपनी फसल की देखभाल करें।';
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a weather-based farming advisor for Indian farmers. Provide brief, actionable advice in Hindi based on weather conditions.`
        },
        {
          role: "user",
          content: `Location: ${location}, Weather: ${JSON.stringify(weatherData)}, Crop: ${crop}. Provide farming advice in Hindi.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Weather advice generation error:', error);
    return 'मौसम के अनुसार अपनी फसल की देखभाल करें।';
  }
}

// Market Price Updates
router.post('/market-updates', async (req, res) => {
  try {
    const { phoneNumber, crop, location, priceData } = req.body;
    
    const updateMessage = `📊 बाजार अपडेट - ${crop}\n\nस्थान: ${location}\nवर्तमान मूल्य: ₹${priceData.currentPrice}/quintal\n\n${priceData.trend === 'up' ? '📈' : '📉'} ${priceData.trend === 'up' ? 'मूल्य बढ़ रहा है' : 'मूल्य गिर रहा है'}`;
    
    if (whatsappClient && whatsappClient.isConnected) {
      const formattedNumber = phoneNumber.replace(/\D/g, '');
      const chatId = `${formattedNumber}@c.us`;
      
      await whatsappClient.sendMessage(chatId, updateMessage);
    }

    res.json({
      success: true,
      message: 'Market update sent successfully',
      phoneNumber: phoneNumber,
      crop: crop,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market update error:', error);
    res.status(500).json({ success: false, error: 'Failed to send market update' });
  }
});

// WhatsApp Status
router.get('/status', (req, res) => {
  const status = {
    connected: whatsappClient ? whatsappClient.isConnected : false,
    authenticated: whatsappClient ? whatsappClient.isAuthenticated : false,
    qrCode: qrCode ? true : false,
    timestamp: new Date().toISOString()
  };
  
  res.json({ success: true, status: status });
});

// Export both router and helper function
module.exports = { router, sendWhatsAppMessage };
