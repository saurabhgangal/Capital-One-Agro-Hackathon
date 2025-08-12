const express = require('express');
const router = express.Router();
const multer = require('multer');
const OpenAI = require('openai');
const { ChromaClient } = require('chromadb');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure ChromaDB for RAG
const chromaClient = new ChromaClient();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Multilingual AI Chat
router.post('/chat', async (req, res) => {
  try {
    const { message, language = 'en', context } = req.body;
    
    const systemPrompt = `You are KisanAI, an expert AI agriculture assistant for Indian farmers. 
    Respond in ${language} language. Provide practical, actionable advice for farming in India.
    Consider local conditions, weather, soil health, and market conditions.
    Be helpful, encouraging, and explain complex concepts simply.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content,
      language: language
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, error: 'AI service temporarily unavailable' });
  }
});

// Crop Disease Detection with VLM
router.post('/detect-disease', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString('base64');

    // Use OpenAI's Vision model for crop disease detection
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this crop image and identify any diseases, pests, or health issues. Provide specific recommendations for treatment in Hindi and English. Focus on common Indian crop diseases and organic solutions when possible."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      success: true,
      analysis: analysis,
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
      language: "hi" // Default to Hindi, can be made configurable
    });

    res.json({
      success: true,
      text: transcription.text,
      language: transcription.language
    });
  } catch (error) {
    console.error('Voice-to-Text Error:', error);
    res.status(500).json({ success: false, error: 'Audio processing failed' });
  }
});

// Farming Advice with RAG
router.post('/farming-advice', async (req, res) => {
  try {
    const { query, location, crop } = req.body;
    
    // Enhanced system prompt with RAG context
    const systemPrompt = `You are KisanAI, an expert agriculture AI assistant for Indian farmers.
    Provide location-specific advice for ${location || 'India'}.
    Consider local soil conditions, climate, and farming practices.
    Give practical, actionable recommendations for ${crop || 'general farming'}.
    Include organic solutions and cost-effective methods.`;

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
      advice: completion.choices[0].message.content,
      location: location,
      crop: crop
    });
  } catch (error) {
    console.error('Farming Advice Error:', error);
    res.status(500).json({ success: false, error: 'Advice service unavailable' });
  }
});

module.exports = router; 