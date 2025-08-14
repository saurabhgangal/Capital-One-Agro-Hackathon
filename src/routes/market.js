const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Market Price Analysis and Forecasting
router.post('/price-analysis', async (req, res) => {
  try {
    const { crop, location, season, quantity, quality, marketType } = req.body;
    
    const systemPrompt = `You are a market analyst specializing in Indian agricultural markets.
    
**Market Analysis Request:**
- Crop: ${crop}
- Location: ${location}
- Season: ${season}
- Quantity: ${quantity}
- Quality: ${quality}
- Market Type: ${marketType}

Provide comprehensive market analysis including:

1. **Current Market Prices** and trends
2. **Price Forecasting** for next 3-6 months
3. **Optimal Selling Time** based on seasonal patterns
4. **Market Demand Analysis** and factors
5. **Price Variation Factors** (weather, supply, demand)
6. **Alternative Markets** for better prices
7. **Storage Recommendations** if waiting for better prices
8. **Government Support** and MSP information
9. **Export Opportunities** if applicable
10. **Risk Assessment** and mitigation strategies

Consider:
- Historical price patterns
- Seasonal demand fluctuations
- Weather impact on supply
- Government policies and MSP
- International market trends
- Local market dynamics
- Transportation and logistics costs

Provide actionable insights for Indian farmers.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze market conditions and provide price forecasting for my crop" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      marketAnalysis: completion.choices[0].message.content,
      crop: crop,
      location: location,
      season: season,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market Analysis Error:', error);
    res.status(500).json({ success: false, error: 'Market analysis unavailable' });
  }
});

// Optimal Selling Time Recommendation
router.post('/optimal-selling-time', async (req, res) => {
  try {
    const { crop, location, harvestDate, storageCapacity, financialNeeds, marketTrends } = req.body;
    
    const systemPrompt = `You are an agricultural marketing expert helping Indian farmers optimize their selling strategy.
    
**Selling Strategy Request:**
- Crop: ${crop}
- Location: ${location}
- Harvest Date: ${harvestDate}
- Storage Capacity: ${storageCapacity}
- Financial Needs: ${financialNeeds}
- Market Trends: ${marketTrends}

Provide optimal selling time recommendations:

1. **Immediate Selling** (if urgent financial needs)
2. **Short-term Storage** (1-2 months) analysis
3. **Medium-term Storage** (3-6 months) analysis
4. **Long-term Storage** (6+ months) analysis
5. **Storage Cost-Benefit Analysis**
6. **Market Timing Strategy** for maximum profit
7. **Risk Assessment** of holding vs. selling
8. **Alternative Income Sources** while waiting
9. **Government Support** for storage
10. **Market Diversification** opportunities

Include:
- Storage facility recommendations
- Cost calculations
- Quality maintenance strategies
- Market monitoring tips
- Emergency selling options
- Local market opportunities`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend the optimal time to sell my crop for maximum profit" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      sellingStrategy: completion.choices[0].message.content,
      crop: crop,
      location: location,
      harvestDate: harvestDate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Selling Time Error:', error);
    res.status(500).json({ success: false, error: 'Selling strategy unavailable' });
  }
});

// Market Place Recommendations
router.post('/market-recommendations', async (req, res) => {
  try {
    const { crop, location, quantity, quality, transportOptions, budget } = req.body;
    
    const systemPrompt = `You are a market research expert specializing in Indian agricultural markets.
    
**Market Research Request:**
- Crop: ${crop}
- Location: ${location}
- Quantity: ${quantity}
- Quality: ${quality}
- Transport Options: ${transportOptions}
- Budget: ${budget}

Provide comprehensive market recommendations:

1. **Local Markets** (within 50km) with price analysis
2. **Regional Markets** (50-200km) with transport costs
3. **Major Markets** (200km+) with bulk opportunities
4. **Direct Buyer Options** (processors, exporters)
5. **Online Market Platforms** and their benefits
6. **Government Mandis** and MSP benefits
7. **Cooperative Societies** and collective selling
8. **Transportation Costs** and logistics
9. **Market Entry Requirements** and documentation
10. **Risk Assessment** of different markets

Consider:
- Distance and transportation costs
- Market reputation and reliability
- Payment terms and security
- Quality standards and grading
- Market infrastructure
- Government support programs
- Local market dynamics
- Seasonal market variations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend the best markets for selling my crop" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      marketRecommendations: completion.choices[0].message.content,
      crop: crop,
      location: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market Recommendations Error:', error);
    res.status(500).json({ success: false, error: 'Market recommendations unavailable' });
  }
});

// Price Trend Analysis
router.post('/price-trends', async (req, res) => {
  try {
    const { crop, location, timeRange, marketType } = req.body;
    
    const systemPrompt = `You are a price trend analyst for Indian agricultural commodities.
    
**Price Trend Analysis Request:**
- Crop: ${crop}
- Location: ${location}
- Time Range: ${timeRange}
- Market Type: ${marketType}

Analyze price trends and provide insights:

1. **Historical Price Patterns** over ${timeRange}
2. **Seasonal Variations** and their causes
3. **Price Cycles** and recurring patterns
4. **Market Influencing Factors** (weather, policy, demand)
5. **Future Price Predictions** based on trends
6. **Risk Factors** affecting prices
7. **Opportunity Windows** for better prices
8. **Market Volatility** assessment
9. **Government Policy Impact** on prices
10. **International Market Influence**

Include:
- Price charts and patterns
- Statistical analysis
- Market psychology factors
- Supply-demand dynamics
- Weather correlation
- Policy changes impact
- Global market trends`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze price trends for my crop and provide future predictions" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      priceTrends: completion.choices[0].message.content,
      crop: crop,
      location: location,
      timeRange: timeRange,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Price Trends Error:', error);
    res.status(500).json({ success: false, error: 'Price trend analysis unavailable' });
  }
});

// Market Intelligence Dashboard
router.post('/market-intelligence', async (req, res) => {
  try {
    const { crops, location, marketType } = req.body;
    
    const systemPrompt = `You are a market intelligence expert providing comprehensive insights for Indian farmers.
    
**Market Intelligence Request:**
- Crops: ${crops}
- Location: ${location}
- Market Type: ${marketType}

Provide comprehensive market intelligence:

1. **Market Overview** for all crops
2. **Price Performance** comparison
3. **Demand Trends** and market sentiment
4. **Supply Analysis** and availability
5. **Competitive Landscape** and market share
6. **Export Opportunities** and international demand
7. **Government Policies** and their impact
8. **Weather Impact** on market dynamics
9. **Technology Trends** in agriculture
10. **Investment Opportunities** in farming

Include:
- Market size and growth potential
- Key market players and stakeholders
- Regulatory environment
- Infrastructure development
- Innovation opportunities
- Risk factors and mitigation
- Success stories and case studies
- Future market outlook`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide comprehensive market intelligence for my farming business" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      marketIntelligence: completion.choices[0].message.content,
      crops: crops,
      location: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market Intelligence Error:', error);
    res.status(500).json({ success: false, error: 'Market intelligence unavailable' });
  }
});

// Real-time Satellite & Weather Integration
router.post('/satellite-analysis', async (req, res) => {
  try {
    const { latitude, longitude, crop, analysisType } = req.body;
    
    // Simulate satellite data analysis (in production, integrate with NASA/ESA APIs)
    const satellitePrompt = `You are a remote sensing expert analyzing satellite data for precision agriculture.

ANALYSIS REQUEST:
- Location: ${latitude}, ${longitude}
- Crop: ${crop}
- Analysis Type: ${analysisType}

Based on satellite imagery and remote sensing data, provide:

1. **VEGETATION HEALTH INDEX** (NDVI analysis)
2. **SOIL MOISTURE LEVELS** across the field
3. **STRESS AREAS** identification and causes
4. **YIELD PREDICTIONS** based on current growth
5. **IRRIGATION RECOMMENDATIONS** for different zones
6. **PEST/DISEASE HOTSPOTS** early detection
7. **HARVEST TIMING** optimization
8. **FIELD VARIABILITY MAP** for precision application

Include specific coordinates for problem areas and recommended actions for each zone.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: satellitePrompt }],
      max_tokens: 1500,
      temperature: 0.2
    });

    res.json({
      success: true,
      satelliteAnalysis: completion.choices[0].message.content,
      imageDate: new Date().toISOString(),
      resolution: '10m per pixel',
      confidence: 0.88,
      nextUpdate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      alerts: [
        'Water stress detected in northeast corner',
        'Optimal harvest window: 7-10 days'
      ]
    });
    
  } catch (error) {
    console.error('Satellite Analysis Error:', error);
    res.status(500).json({ success: false, error: 'Satellite analysis unavailable' });
  }
});

// Advanced Weather Intelligence
router.post('/weather-intelligence', async (req, res) => {
  try {
    const { location, crop, operationType } = req.body;
    
    const weatherPrompt = `You are a meteorological expert specializing in agricultural weather analysis.

WEATHER ANALYSIS FOR:
- Location: ${location}
- Crop: ${crop}
- Operation: ${operationType}

Provide comprehensive weather intelligence:

1. **7-DAY DETAILED FORECAST** with farming implications
2. **CRITICAL WEATHER ALERTS** (frost, hail, extreme heat)
3. **OPTIMAL OPERATION WINDOWS** for farming activities
4. **MICROCLIMATE ANALYSIS** for field variations
5. **EVAPOTRANSPIRATION RATES** for irrigation planning
6. **DISEASE PRESSURE FORECAST** based on humidity/temperature
7. **HARVEST WEATHER WINDOW** with quality implications
8. **LONG-TERM SEASONAL OUTLOOK** (30-90 days)

Include specific timing recommendations and risk mitigation strategies.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: weatherPrompt }],
      max_tokens: 1200,
      temperature: 0.3
    });

    res.json({
      success: true,
      weatherIntelligence: completion.choices[0].message.content,
      alertLevel: 'moderate',
      operationRecommendation: 'proceed_with_caution',
      updateFrequency: 'every_6_hours',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Weather Intelligence Error:', error);
    res.status(500).json({ success: false, error: 'Weather intelligence unavailable' });
  }
});

// ENAM Market API Integration
router.post('/enam', async (req, res) => {
    try {
        const { crop, location, apiType } = req.body;
        
        if (!crop || !location) {
            return res.status(400).json({
                success: false,
                error: 'Crop and location are required'
            });
        }
        
        console.log(`📊 ENAM Market API request for: ${crop} in ${location}`);
        
        // TODO: Replace with actual ENAM AGRICOOP API integration
        // You'll need to get API key from: https://directory.apisetu.gov.in/api-collection/agricoop
        
        // Generate realistic mock market data
        const basePrices = {
            'wheat': { min: 1800, max: 2200, volatility: 0.15 },
            'rice': { min: 1600, max: 1900, volatility: 0.12 },
            'cotton': { min: 5500, max: 6500, volatility: 0.20 },
            'sugarcane': { min: 3000, max: 3500, volatility: 0.10 },
            'maize': { min: 1400, max: 1700, volatility: 0.18 },
            'pulses': { min: 2000, max: 2500, volatility: 0.16 }
        };
        
        const cropData = basePrices[crop.toLowerCase()] || basePrices['wheat'];
        const currentPrice = Math.round(cropData.min + Math.random() * (cropData.max - cropData.min));
        const previousPrice = Math.round(currentPrice * (0.9 + Math.random() * 0.2)); // ±10% variation
        const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
        
        const mockMarketData = {
            currentPrice: currentPrice,
            previousPrice: previousPrice,
            trend: priceChange > 0 ? 'up' : 'down',
            trendPercentage: Math.abs(Math.round(priceChange * 10) / 10),
            supplyStatus: ['Low Supply', 'Moderate Supply', 'High Supply'][Math.floor(Math.random() * 3)],
            mandiName: `${location.charAt(0).toUpperCase() + location.slice(1)} Mandi`,
            qualityGrade: ['A Grade', 'B Grade', 'C Grade'][Math.floor(Math.random() * 3)],
            arrivalQuantity: Math.round(100 + Math.random() * 900), // 100-1000 qtl
            lastUpdated: new Date().toISOString()
        };
        
        console.log('✅ Mock ENAM market data generated');
        
        res.json({
            success: true,
            marketData: mockMarketData,
            source: 'ENAM AGRICOOP API (Mock)',
            crop: crop,
            location: location,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('ENAM Market API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ENAM market data',
            details: error.message
        });
    }
});

// Get market data by crop and location
router.get('/:crop/:location', async (req, res) => {
    try {
        const { crop, location } = req.params;
        
        console.log(`📊 Market data request for: ${crop} in ${location}`);
        
        // TODO: Implement actual ENAM API call here
        // const enamResponse = await fetch(`https://api.enam.gov.in/market/${crop}/${location}`, {
        //     headers: { 'Authorization': `Bearer ${process.env.ENAM_API_KEY}` }
        // });
        
        res.json({
            success: true,
            message: `Market data for ${crop} in ${location} (ENAM integration pending)`,
            crop: crop,
            location: location
        });
        
    } catch (error) {
        console.error('Market API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market data'
        });
    }
});

// Get all market data
router.get('/', async (req, res) => {
    try {
        console.log('📊 All market data request');
        
        // TODO: Implement actual ENAM API call for all markets
        // const enamResponse = await fetch('https://api.enam.gov.in/markets', {
        //     headers: { 'Authorization': `Bearer ${process.env.ENAM_API_KEY}` }
        // });
        
        res.json({
            success: true,
            message: 'All market data (ENAM integration pending)',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Market API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market data'
        });
    }
});

module.exports = router;
