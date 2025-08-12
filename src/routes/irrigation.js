const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { sendWhatsAppMessage } = require('./whatsapp');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Weather forecast functions
async function getWeatherForecast(location) {
  try {
    // In production, integrate with real weather APIs:
    // - OpenWeatherMap API
    // - AccuWeather API  
    // - Indian Meteorological Department (IMD) API
    // - Weather.com API
    
    // For now, simulate weather data based on location
    const weatherData = generateSimulatedWeather(location);
    return weatherData;
  } catch (error) {
    console.error('Weather forecast error:', error);
    throw error;
  }
}

function generateSimulatedWeather(location) {
  // Generate realistic weather patterns for Indian locations
  const baseTemp = 25; // Base temperature in Celsius
  const baseHumidity = 65; // Base humidity percentage
  
  const weatherForecast = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Simulate weather variations
    const tempVariation = (Math.random() - 0.5) * 10; // ±5°C variation
    const humidityVariation = (Math.random() - 0.5) * 20; // ±10% variation
    
    // Simulate rainfall patterns
    let rainfall = 0;
    let rainProbability = Math.random();
    
    if (rainProbability > 0.7) {
      // 30% chance of rain
      if (rainProbability > 0.9) {
        rainfall = 15 + Math.random() * 25; // Heavy rain: 15-40mm
      } else {
        rainfall = 2 + Math.random() * 13; // Light rain: 2-15mm
      }
    }
    
    // Adjust for monsoon season (June-September)
    const month = date.getMonth() + 1;
    if (month >= 6 && month <= 9) {
      rainProbability += 0.3; // Higher chance of rain in monsoon
      if (rainProbability > 0.8) {
        rainfall = 10 + Math.random() * 30; // Monsoon rain: 10-40mm
      }
    }
    
    // Adjust for summer (March-May)
    if (month >= 3 && month <= 5) {
      tempVariation += 5; // Higher temperatures in summer
      humidityVariation -= 10; // Lower humidity in summer
    }
    
    const weather = {
      date: date.toISOString().split('T')[0],
      temperature: Math.round(baseTemp + tempVariation),
      humidity: Math.round(baseHumidity + humidityVariation),
      rainfall: Math.round(rainfall * 10) / 10, // Round to 1 decimal
      windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
      description: getWeatherDescription(rainfall, baseTemp + tempVariation),
      irrigationRecommendation: getIrrigationRecommendation(rainfall, baseTemp + tempVariation, baseHumidity + humidityVariation)
    };
    
    weatherForecast.push(weather);
  }
  
  return {
    location: location,
    forecast: weatherForecast,
    generatedAt: new Date().toISOString()
  };
}

function getWeatherDescription(rainfall, temperature) {
  if (rainfall > 20) return 'Heavy Rain';
  if (rainfall > 10) return 'Moderate Rain';
  if (rainfall > 2) return 'Light Rain';
  if (temperature > 35) return 'Very Hot';
  if (temperature > 30) return 'Hot';
  if (temperature > 25) return 'Warm';
  if (temperature > 20) return 'Mild';
  if (temperature > 15) return 'Cool';
  return 'Cold';
}

function getIrrigationRecommendation(rainfall, temperature, humidity) {
  if (rainfall > 20) return 'SKIP IRRIGATION - Heavy rain expected';
  if (rainfall > 10) return 'REDUCE IRRIGATION - Moderate rain expected';
  if (rainfall > 2) return 'MINIMAL IRRIGATION - Light rain expected';
  if (temperature > 35 && humidity < 50) return 'INCREASE IRRIGATION - Hot and dry conditions';
  if (temperature > 30 && humidity < 60) return 'NORMAL IRRIGATION - Warm conditions';
  if (humidity > 80) return 'REDUCE IRRIGATION - High humidity';
  return 'NORMAL IRRIGATION - Standard conditions';
}

function generateDefaultWeatherForecast() {
  return {
    location: 'Unknown',
    forecast: Array(7).fill(null).map((_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: 25,
      humidity: 65,
      rainfall: 0,
      windSpeed: 10,
      description: 'Unknown',
      irrigationRecommendation: 'NORMAL IRRIGATION - Weather data unavailable'
    })),
    generatedAt: new Date().toISOString()
  };
}

// AI-Powered 7-Day Irrigation Plan with Weather Integration and WhatsApp
router.post('/ai-irrigation-plan', async (req, res) => {
  try {
    const { soilType, crop, location, phoneNumber } = req.body;
    
    if (!soilType || !crop || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: soilType, crop, location' 
      });
    }

    // First, get weather forecast for the location
    let weatherData = null;
    try {
      // Simulate weather API call (in production, integrate with OpenWeatherMap, AccuWeather, or Indian Meteorological Department)
      weatherData = await getWeatherForecast(location);
    } catch (weatherError) {
      console.log('Weather forecast not available, proceeding with general plan');
      weatherData = generateDefaultWeatherForecast();
    }

    const systemPrompt = `You are an expert irrigation specialist for Indian agriculture. Create a SMART 7-day irrigation plan that adapts to weather conditions.

**Farm Details:**
- Soil Type: ${soilType}
- Crop: ${crop}
- Location: ${location}

**WEATHER FORECAST (Next 7 Days):**
${weatherData ? JSON.stringify(weatherData, null, 2) : 'Weather data not available'}

**SMART IRRIGATION RULES:**
1. **NO IRRIGATION** if heavy rainfall (>20mm) is forecasted
2. **REDUCE IRRIGATION** if light rain (5-20mm) is expected
3. **NORMAL IRRIGATION** if no rain and moderate temperature
4. **INCREASE IRRIGATION** if high temperature (>35°C) and no rain
5. **ADJUST TIMING** based on humidity and wind conditions

**Create a comprehensive 7-day irrigation plan including:**

**DAY 1-7 DETAILED PLAN:**
- Weather forecast for each day
- Smart irrigation decision (irrigate/skip/reduce)
- Daily irrigation timing (morning/evening)
- Water amount needed (liters/hectare) - ADJUSTED for weather
- Duration of irrigation
- Specific irrigation method (drip/sprinkler/flood)
- Soil moisture monitoring tips

**WEATHER-BASED ADJUSTMENTS:**
- Rain days: Skip irrigation or minimal water
- Hot days: Increase irrigation frequency
- Humid days: Reduce water amount
- Windy days: Avoid sprinkler irrigation

**ADDITIONAL RECOMMENDATIONS:**
- Weather contingency plans
- Crop growth stage specific needs
- Water conservation tips
- Cost optimization strategies
- Emergency irrigation backup plans

**FORMAT:**
- Use clear, simple language for farmers
- Include specific measurements and timings
- Add local farming wisdom and tips
- Provide actionable steps for each day
- Highlight weather-based decisions clearly

Make this plan practical, location-specific, weather-smart, and easy to follow for Indian farmers.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a 7-day irrigation plan for ${crop} in ${location} with ${soilType} soil` }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const irrigationPlan = completion.choices[0].message.content;

    // If phone number provided, send WhatsApp message
    let whatsappStatus = null;
    if (phoneNumber) {
      try {
        // Check if WhatsApp function is available
        if (typeof sendWhatsAppMessage !== 'function') {
          throw new Error('WhatsApp service not available');
        }

        const message = `🌾 *KISAN AI - 7-Day Smart Irrigation Plan*

*Crop:* ${crop}
*Location:* ${location}
*Soil Type:* ${soilType}

${weatherData ? `*Weather Summary:* ${weatherData.forecast.filter(day => day.rainfall > 0).length} rainy days in next 7 days` : ''}

${irrigationPlan}

*Generated on:* ${new Date().toLocaleDateString('en-IN')}
*Powered by:* Kisan AI Assistant with Weather Integration`;

        whatsappStatus = await sendWhatsAppMessage(phoneNumber, message);
      } catch (whatsappError) {
        console.error('WhatsApp Error:', whatsappError);
        whatsappStatus = { success: false, error: whatsappError.message };
      }
    }

    res.json({
      success: true,
      irrigationPlan: irrigationPlan,
      weatherData: weatherData,
      farmDetails: {
        soilType,
        crop,
        location,
        phoneNumber: phoneNumber || 'Not provided'
      },
      whatsappStatus,
      timestamp: new Date().toISOString(),
      message: '7-day smart irrigation plan generated successfully with weather integration!'
    });

  } catch (error) {
    console.error('AI Irrigation Plan Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI irrigation plan generation failed',
      details: error.message 
    });
  }
});

module.exports = router;
