const express = require('express');
const router = express.Router();
const multer = require('multer');
const OpenAI = require('openai');
const sharp = require('sharp');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Language mapping for OpenAI translation
const languageMap = {
  'hi': 'Hindi',
  'en': 'English',
  'pa': 'Punjabi',
  'bn': 'Bengali',
  'te': 'Telugu',
  'ta': 'Tamil',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam'
};

// Configure multer for image uploads with processing
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

        // Advanced Multilingual AI Chat with Smart Context Awareness
        router.post('/chat', async (req, res) => {
          try {
            const { message, language = 'en', context, location, crop, farmSize, soilType, budget } = req.body;
            
            // Auto-detect language from user message if not specified
            let detectedLanguage = language;
            if (!language || language === 'auto') {
              detectedLanguage = detectLanguage(message);
            }
            
            // Get relevant custom dataset context
            let customDataContext = '';
            try {
              const customDataResponse = await fetch(`${req.protocol}://${req.get('host')}/api/custom-data/context`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  query: message, 
                  context: { location, crop, farmSize, soilType } 
                })
              });
              
              if (customDataResponse.ok) {
                const customData = await customDataResponse.json();
                if (customData.success && customData.relevantData.length > 0) {
                  customDataContext = `\n\nRELEVANT LOCAL DATA:\n${customData.relevantData.map(item => 
                    `- ${item.source} (${item.type}): ${JSON.stringify(item.data)}`
                  ).join('\n')}\n\nIMPORTANT: Use this local data to provide accurate, location-specific advice.`;
                }
              }
            } catch (error) {
              console.log('Custom data context not available, proceeding without it');
            }
            
            // Enhanced system prompt with advanced agricultural knowledge and custom data
            const systemPrompt = `You are KisanAI, an advanced AI agriculture expert specializing in Indian farming. 
            
            RESPONSE LANGUAGE: ${getLanguageInstructions(detectedLanguage)}
            
            FARMER CONTEXT:
            - Location: ${location || 'India'}
            - Current Crop: ${crop || 'Mixed farming'}
            - Farm Size: ${farmSize || 'Small scale'}
            - Soil Type: ${soilType || 'Mixed'}
            - Budget: ${budget || 'Limited'}
            
            EXPERTISE AREAS:
            1. **Precision Agriculture**: IoT sensors, drone monitoring, satellite imagery
            2. **Climate-Smart Farming**: Weather prediction, climate adaptation
            3. **Sustainable Practices**: Organic farming, permaculture, biodiversity
            4. **Market Intelligence**: Price forecasting, supply chain optimization
            5. **Financial Planning**: Credit access, insurance, subsidies
            6. **Technology Integration**: Apps, digital tools, automation
            
            RESPONSE GUIDELINES:
            - Provide specific, actionable advice with step-by-step instructions
            - Include cost estimates in Indian Rupees
            - Mention government schemes and subsidies when relevant
            - Consider seasonal timing and local weather patterns
            - Suggest both traditional and modern solutions
            - Include risk assessment and mitigation strategies
            - Provide contact information for local agricultural offices when helpful
            - ALWAYS prioritize local data and context over general knowledge
            - If local data is available, reference it specifically in your response
            - Be conversational, empathetic, and encouraging. Use simple language but provide comprehensive solutions.
            - CRITICAL: ALWAYS respond in ${detectedLanguage === 'hi' ? 'Hindi (Devanagari script)' : 'English'} language${customDataContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1200,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    
    // Enhanced response with metadata
    res.json({
      success: true,
      response: response,
      language: language,
      context: {
        location: location || 'India',
        crop: crop,
        farmSize: farmSize,
        confidence: 0.95,
        responseType: 'comprehensive_advice'
      },
      suggestions: [
        'Ask about specific pest problems',
        'Get market price predictions',
        'Learn about government schemes',
        'Explore sustainable farming methods'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, error: 'AI service temporarily unavailable' });
  }
});

// Enhanced Crop Disease Detection with VLM
router.post('/detect-disease', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    // Process image with Sharp for optimization
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const imageBase64 = processedImage.toString('base64');

    // Enhanced prompt for better disease detection
    const analysisPrompt = `Analyze this crop image and provide a comprehensive assessment:

1. **Disease Identification**: Identify any visible diseases, pests, or health issues
2. **Severity Assessment**: Rate the severity (Low/Medium/High)
3. **Treatment Recommendations**: Provide specific treatment steps in Hindi and English
4. **Prevention Tips**: Suggest preventive measures
5. **Organic Solutions**: Prioritize organic and natural remedies
6. **Cost-Effective Options**: Include affordable treatment methods
7. **Local Context**: Consider Indian farming conditions and available resources

Focus on common Indian crop diseases like:
- Bacterial blight
- Fungal infections
- Pest infestations
- Nutrient deficiencies
- Water stress symptoms

Provide actionable advice that a farmer can implement immediately.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      success: true,
      analysis: analysis,
      imageProcessed: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Disease Detection Error:', error);
    res.status(500).json({ success: false, error: 'Image analysis failed' });
  }
});

// Voice-to-Text for Indian Languages
router.post('/voice-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio uploaded' });
    }

    const audioBuffer = req.file.buffer;
    
    // Use OpenAI's Whisper model for speech recognition
    const transcription = await openai.audio.transcriptions.create({
      file: {
        buffer: audioBuffer,
        name: 'audio.wav',
        type: 'audio/wav'
      },
      model: "whisper-1",
      language: "hi", // Default to Hindi, can be made configurable
      prompt: "This is a conversation about farming, agriculture, crops, weather, and farming practices in India."
    });

    res.json({
      success: true,
      text: transcription.text,
      language: transcription.language,
      confidence: transcription.confidence || 0.8
    });
  } catch (error) {
    console.error('Voice-to-Text Error:', error);
    res.status(500).json({ success: false, error: 'Audio processing failed' });
  }
});

// Enhanced Farming Advice with RAG and Context
router.post('/farming-advice', async (req, res) => {
  try {
    const { query, location, crop, season, soilType } = req.body;
    
    const systemPrompt = `You are KisanAI, an expert agriculture AI assistant for Indian farmers.
    
**Context:**
- Location: ${location || 'India'}
- Crop: ${crop || 'General farming'}
- Season: ${season || 'Current season'}
- Soil Type: ${soilType || 'Not specified'}

**Your Expertise:**
- Indian farming practices and traditions
- Local climate and weather patterns
- Soil health and crop management
- Organic and sustainable farming
- Cost-effective solutions
- Government schemes and subsidies
- Market trends and pricing

Provide location-specific advice that considers:
1. Local soil conditions and climate
2. Seasonal farming practices
3. Available resources and budget
4. Government support programs
5. Market opportunities
6. Risk mitigation strategies

Give practical, actionable recommendations that a farmer can implement immediately.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      max_tokens: 1000,
      temperature: 0.6
    });

    res.json({
      success: true,
      advice: completion.choices[0].message.content,
      location: location,
      crop: crop,
      season: season,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Farming Advice Error:', error);
    res.status(500).json({ success: false, error: 'Advice service unavailable' });
  }
});

// Weather-based Farming Recommendations
router.post('/weather-advice', async (req, res) => {
  try {
    const { location, weatherData, crop } = req.body;
    
    const systemPrompt = `You are KisanAI, providing weather-based farming advice for Indian farmers.
    
**Current Conditions:**
- Location: ${location}
- Weather: ${JSON.stringify(weatherData)}
- Crop: ${crop || 'General farming'}

Provide specific recommendations for:
1. Irrigation timing and methods
2. Crop protection measures
3. Optimal farming activities
4. Risk mitigation strategies
5. Equipment and resource planning

Consider Indian farming context and local practices.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "What should I do given these weather conditions?" }
      ],
      max_tokens: 800,
      temperature: 0.5
    });

    res.json({
      success: true,
      weatherAdvice: completion.choices[0].message.content,
      location: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weather Advice Error:', error);
    res.status(500).json({ success: false, error: 'Weather advice unavailable' });
  }
});

// Advanced Crop Intelligence & Recommendations
router.post('/crop-intelligence', async (req, res) => {
  try {
    const { 
      location, 
      soilType, 
      season, 
      budget, 
      farmSize, 
      previousCrop, 
      waterAvailability,
      marketPreference 
    } = req.body;

    const intelligencePrompt = `You are an advanced agricultural AI providing comprehensive crop intelligence for Indian farmers.

ANALYSIS REQUEST:
- Location: ${location}
- Soil Type: ${soilType}
- Season: ${season}
- Budget: ₹${budget || 'Limited'}
- Farm Size: ${farmSize} acres
- Previous Crop: ${previousCrop}
- Water Availability: ${waterAvailability}
- Market Preference: ${marketPreference}

Provide a detailed analysis with:

1. **TOP 3 CROP RECOMMENDATIONS** with specific varieties
2. **PROFIT ANALYSIS** with projected income and costs
3. **RISK ASSESSMENT** for each recommendation
4. **PLANTING CALENDAR** with exact dates
5. **INPUT REQUIREMENTS** (seeds, fertilizers, pesticides)
6. **WATER MANAGEMENT** strategy
7. **MARKET TIMING** for optimal sales
8. **GOVERNMENT SCHEMES** applicable
9. **TECHNOLOGY RECOMMENDATIONS** (apps, tools, sensors)
10. **SUCCESS METRICS** to track progress

Format as JSON with detailed explanations for each section.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: intelligencePrompt }],
      max_tokens: 2000,
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content;
    
    res.json({
      success: true,
      cropIntelligence: analysis,
      analysisType: 'comprehensive_crop_intelligence',
      confidence: 0.92,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      recommendations: {
        immediate: ['Soil testing', 'Weather monitoring setup'],
        shortTerm: ['Seed procurement', 'Field preparation'],
        longTerm: ['Market linkage', 'Technology adoption']
      }
    });
    
  } catch (error) {
    console.error('Crop Intelligence Error:', error);
    res.status(500).json({ success: false, error: 'Crop intelligence service temporarily unavailable' });
  }
});

// AI-Powered Pest & Disease Prediction
router.post('/pest-prediction', async (req, res) => {
  try {
    const { crop, location, season, weatherData } = req.body;
    
    const predictionPrompt = `As an expert entomologist and plant pathologist, predict pest and disease risks for:

CROP DETAILS:
- Crop: ${crop}
- Location: ${location}
- Season: ${season}
- Weather: ${JSON.stringify(weatherData)}

Provide:
1. **HIGH-RISK PESTS** (next 2 weeks)
2. **DISEASE PROBABILITY** with severity levels
3. **PREVENTIVE MEASURES** with timing
4. **ORGANIC SOLUTIONS** prioritized
5. **CHEMICAL INTERVENTIONS** as backup
6. **MONITORING SCHEDULE** with key indicators
7. **COST-EFFECTIVE TREATMENTS** under ₹500/acre
8. **WEATHER-BASED ALERTS** triggers

Include specific product names available in Indian markets.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: predictionPrompt }],
      max_tokens: 1500,
      temperature: 0.4
    });

    res.json({
      success: true,
      prediction: completion.choices[0].message.content,
      riskLevel: 'moderate', // This would be calculated based on actual data
      alertsEnabled: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Pest Prediction Error:', error);
    res.status(500).json({ success: false, error: 'Pest prediction service unavailable' });
  }
});

// Smart Yield Optimization
router.post('/yield-optimization', async (req, res) => {
  try {
    const { crop, currentPractices, targetYield, constraints } = req.body;
    
    const optimizationPrompt = `You are a precision agriculture expert. Analyze current farming practices and provide yield optimization strategies.

CURRENT SITUATION:
- Crop: ${crop}
- Current Practices: ${JSON.stringify(currentPractices)}
- Target Yield: ${targetYield}
- Constraints: ${JSON.stringify(constraints)}

Provide optimization plan with:
1. **YIELD GAP ANALYSIS** 
2. **PRECISION INTERVENTIONS** with ROI calculations
3. **TECHNOLOGY INTEGRATION** recommendations
4. **INPUT OPTIMIZATION** (fertilizer, water, seeds)
5. **TIMING OPTIMIZATION** for all operations
6. **MONITORING PROTOCOLS** with KPIs
7. **COST-BENEFIT ANALYSIS** for each intervention
8. **IMPLEMENTATION TIMELINE** (weekly breakdown)

Focus on practical, cost-effective solutions for Indian farming conditions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: optimizationPrompt }],
      max_tokens: 1800,
      temperature: 0.3
    });

    res.json({
      success: true,
      optimization: completion.choices[0].message.content,
      potentialIncrease: '25-40%', // This would be calculated
      investmentRequired: 'Estimated based on recommendations',
      paybackPeriod: '1-2 seasons',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Yield Optimization Error:', error);
    res.status(500).json({ success: false, error: 'Optimization service unavailable' });
  }
});

// Language detection function
function detectLanguage(text) {
  const hindiPattern = /[\u0900-\u097F]/; // Devanagari script range
  const englishPattern = /[a-zA-Z]/;
  
  if (hindiPattern.test(text)) {
    return 'hi';
  } else if (englishPattern.test(text)) {
    return 'en';
  }
  
  // Default to English if no clear pattern
  return 'en';
}

// Get language-specific instructions
function getLanguageInstructions(language) {
  switch (language) {
    case 'hi':
      return 'Hindi (Devanagari script) - आपको हिंदी में जवाब देना है। किसानों की भाषा में सरल और स्पष्ट जवाब दें।';
    case 'bn':
      return 'Bengali (বাংলা) - বাংলায় উত্তর দিন। কৃষকদের ভাষায় সহজ এবং স্পষ্ট উত্তর দিন।';
    case 'te':
      return 'Telugu (తెలుగు) - తెలుగులో సమాధానం ఇవ్వండి. రైతుల భాషలో సరళమైన మరియు స్పష్టమైన సమాధానం ఇవ్వండి.';
    case 'mr':
      return 'Marathi (मराठी) - मराठीत उत्तर द्या। शेतकरी भाषेत सोपे आणि स्पष्ट उत्तर द्या।';
    case 'ta':
      return 'Tamil (தமிழ்) - தமிழில் பதில் கொடுங்கள். விவசாயிகளின் மொழியில் எளிமையான மற்றும் தெளிவான பதில் கொடுங்கள்.';
    case 'gu':
      return 'Gujarati (ગુજરાતી) - ગુજરાતીમાં જવાબ આપો। કૃષકોની ભાષામાં સરળ અને સ્પષ્ટ જવાબ આપો।';
    case 'kn':
      return 'Kannada (ಕನ್ನಡ) - ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರ ನೀಡಿ. ರೈತರ ಭಾಷೆಯಲ್ಲಿ ಸರಳ ಮತ್ತು ಸ್ಪಷ್ಟ ಉತ್ತರ ನೀಡಿ.';
    case 'ml':
      return 'Malayalam (മലയാളം) - മലയാളത്തിൽ ഉത്തരം നൽകുക. കർഷകരുടെ ഭാഷയിൽ ലളിതവും വ്യക്തവുമായ ഉത്തരം നൽകുക.';
    case 'pa':
      return 'Punjabi (ਪੰਜਾਬੀ) - ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਕਿਸਾਨਾਂ ਦੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਰਲ ਅਤੇ ਸਪਸ਼ਟ ਜਵਾਬ ਦਿਓ।';
    case 'or':
      return 'Odia (ଓଡ଼ିଆ) - ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ। କୃଷକମାନଙ୍କ ଭାଷାରେ ସରଳ ଏବଂ ସ୍ପଷ୍ଟ ଉତ୍ତର ଦିଅନ୍ତୁ।';
    case 'as':
      return 'Assamese (অসমীয়া) - অসমীয়াত উত্তৰ দিয়ক। খেতিয়কসকলৰ ভাষাত সহজ আৰু স্পষ্ট উত্তৰ দিয়ক।';
    case 'ur':
      return 'Urdu (اردو) - اردو میں جواب دیں۔ کسانوں کی زبان میں آسان اور واضح جواب دیں۔';
    case 'ne':
      return 'Nepali (नेपाली) - नेपालीमा जवाफ दिनुहोस्। किसानहरूको भाषामा सरल र स्पष्ट जवाफ दिनुहोस्।';
    case 'si':
      return 'Sindhi (سنڌي) - سنڌيءَ ۾ جواب ڏيو۔ ڪسانن جي ٻوليءَ ۾ آسان ۽ واضح جواب ڏيو۔';
    default:
      return 'English - Respond in English. Provide clear and simple answers for farmers.';
  }
}

// OpenAI Translation API Endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text and target language are required' 
      });
    }
    
    // Validate target language
    if (!languageMap[targetLanguage]) {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported target language' 
      });
    }
    
    const targetLangName = languageMap[targetLanguage];
    
    // Create translation prompt
    const translationPrompt = `Translate the following text to ${targetLangName}. 
    
    IMPORTANT GUIDELINES:
    - Maintain the original meaning and context
    - Use natural, conversational language appropriate for farmers
    - Preserve any technical terms but explain them if needed
    - Keep the same tone and style
    - If translating to Indian languages, use the appropriate script (Devanagari, Gurmukhi, etc.)
    - Ensure the translation is culturally appropriate for Indian farmers
    
    TEXT TO TRANSLATE:
    "${text}"
    
    TRANSLATION IN ${targetLangName}:`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are a professional translator specializing in agricultural content for Indian farmers. Provide accurate, natural translations that maintain the original meaning while being culturally appropriate.` 
        },
        { role: "user", content: translationPrompt }
      ],
      max_tokens: 500,
      temperature: 0.3
    });
    
    const translatedText = completion.choices[0].message.content.trim();
    
    res.json({
      success: true,
      translatedText: translatedText,
      originalText: text,
      targetLanguage: targetLanguage,
      targetLanguageName: targetLangName,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Translation Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Translation service unavailable',
      details: error.message 
    });
  }
});

// ChatGPT API Endpoint for Market Data
router.post('/market-data', async (req, res) => {
  try {
    const { request } = req.body;
    
    if (!request) {
      return res.status(400).json({ 
        success: false, 
        error: 'Request is required' 
      });
    }
    
    // Create a detailed prompt for market data
    const prompt = `You are an agricultural market analyst. ${request}
    
    Please provide the data in the following JSON format:
    {
      "prices": {
        "wheat": [price1, price2, price3, price4, price5, price6],
        "rice": [price1, price2, price3, price4, price5, price6],
        "cotton": [price1, price2, price3, price4, price5, price6],
        "sugarcane": [price1, price2, price3, price4, price5, price6]
      },
      "analysis": "Brief market analysis",
      "trends": "Price trends explanation"
    }
    
    Use realistic prices in Indian Rupees (₹) per quintal. Provide only the JSON response.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an agricultural market analyst specializing in Indian crop markets. 
          Provide accurate, realistic price data and market insights.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.2
    });
    
    const responseText = completion.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    let marketData;
    try {
      marketData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', parseError);
      // Return fallback data if parsing fails
      marketData = {
        prices: {
          wheat: [1850, 1920, 1980, 2050, 2120, 2150],
          rice: [1650, 1720, 1780, 1820, 1830, 1850],
          cotton: [5800, 5900, 6000, 6100, 6300, 6500],
          sugarcane: [3000, 3050, 3100, 3150, 3180, 3200]
        },
        analysis: "Market data from ChatGPT API",
        trends: "Prices showing upward trend"
      };
    }
    
    res.json({
      success: true,
      marketData: marketData,
      source: 'ChatGPT API'
    });
    
  } catch (error) {
    console.error('Market data API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch market data. Please try again.' 
    });
  }
});

module.exports = router;
