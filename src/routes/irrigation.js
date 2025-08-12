const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { sendWhatsAppMessage } = require('./whatsapp');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI-Powered 7-Day Irrigation Plan with WhatsApp Integration
router.post('/ai-irrigation-plan', async (req, res) => {
  try {
    const { soilType, crop, location, phoneNumber } = req.body;
    
    if (!soilType || !crop || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: soilType, crop, location' 
      });
    }

    const systemPrompt = `You are an expert irrigation specialist for Indian agriculture. Create a detailed 7-day irrigation plan.

**Farm Details:**
- Soil Type: ${soilType}
- Crop: ${crop}
- Location: ${location}

**Create a comprehensive 7-day irrigation plan including:**

**DAY 1-7 DETAILED PLAN:**
- Daily irrigation timing (morning/evening)
- Water amount needed (liters/hectare)
- Duration of irrigation
- Specific irrigation method (drip/sprinkler/flood)
- Soil moisture monitoring tips

**ADDITIONAL RECOMMENDATIONS:**
- Weather considerations for each day
- Crop growth stage specific needs
- Water conservation tips
- Cost optimization strategies
- Emergency irrigation backup plans

**FORMAT:**
- Use clear, simple language for farmers
- Include specific measurements and timings
- Add local farming wisdom and tips
- Provide actionable steps for each day

Make this plan practical, location-specific, and easy to follow for Indian farmers.`;

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
        const message = `🌾 *KISAN AI - 7-Day Irrigation Plan*

*Crop:* ${crop}
*Location:* ${location}
*Soil Type:* ${soilType}

${irrigationPlan}

*Generated on:* ${new Date().toLocaleDateString('en-IN')}
*Powered by:* Kisan AI Assistant`;

        whatsappStatus = await sendWhatsAppMessage(phoneNumber, message);
      } catch (whatsappError) {
        console.error('WhatsApp Error:', whatsappError);
        whatsappStatus = { success: false, error: whatsappError.message };
      }
    }

    res.json({
      success: true,
      irrigationPlan: irrigationPlan,
      farmDetails: {
        soilType,
        crop,
        location,
        phoneNumber: phoneNumber || 'Not provided'
      },
      whatsappStatus,
      timestamp: new Date().toISOString(),
      message: '7-day irrigation plan generated successfully!'
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

// Irrigation Schedule Optimization
router.post('/irrigation-schedule', async (req, res) => {
  try {
    const { crop, soilType, weatherData, waterAvailability, irrigationMethod, growthStage } = req.body;
    
    const systemPrompt = `You are an irrigation expert specializing in Indian agricultural conditions.
    
**Irrigation Schedule Request:**
- Crop: ${crop}
- Soil Type: ${soilType}
- Weather Data: ${JSON.stringify(weatherData)}
- Water Availability: ${waterAvailability}
- Irrigation Method: ${irrigationMethod}
- Growth Stage: ${growthStage}

Provide comprehensive irrigation schedule:

1. **Optimal Irrigation Timing** based on weather
2. **Water Requirements** for different growth stages
3. **Irrigation Frequency** recommendations
4. **Water Application Rate** and duration
5. **Soil Moisture Monitoring** techniques
6. **Weather-Based Adjustments** strategy
7. **Water Conservation** methods
8. **Irrigation Efficiency** improvements
9. **Cost Optimization** strategies
10. **Technology Integration** recommendations

Consider:
- Local climate patterns
- Soil water holding capacity
- Crop water sensitivity
- Evapotranspiration rates
- Rainfall integration
- Water quality factors
- Energy costs
- Labor requirements
- Government water policies
- Sustainable practices

Provide actionable irrigation plan for Indian farmers.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Create an optimal irrigation schedule for my crop" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      irrigationSchedule: completion.choices[0].message.content,
      crop: crop,
      soilType: soilType,
      weatherData: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Irrigation Schedule Error:', error);
    res.status(500).json({ success: false, error: 'Irrigation schedule unavailable' });
  }
});

// Weather-Based Irrigation Recommendations
router.post('/weather-irrigation', async (req, res) => {
  try {
    const { location, weatherForecast, crop, soilMoisture, irrigationSystem } = req.body;
    
    const systemPrompt = `You are a weather-based irrigation specialist for Indian agriculture.
    
**Weather Irrigation Request:**
- Location: ${location}
- Weather Forecast: ${JSON.stringify(weatherForecast)}
- Crop: ${crop}
- Current Soil Moisture: ${soilMoisture}
- Irrigation System: ${irrigationSystem}

Provide weather-responsive irrigation recommendations:

1. **Immediate Actions** based on current weather
2. **Short-term Adjustments** (next 3-7 days)
3. **Medium-term Planning** (next 2-4 weeks)
4. **Weather Risk Mitigation** strategies
5. **Water Conservation** during favorable weather
6. **Emergency Irrigation** during extreme conditions
7. **System Optimization** for weather efficiency
8. **Cost Management** during weather variations
9. **Crop Protection** through irrigation
10. **Technology Integration** for weather monitoring

Include:
- Rainfall integration strategies
- Drought response measures
- Flood protection methods
- Temperature-based adjustments
- Humidity considerations
- Wind impact on irrigation
- Seasonal weather patterns
- Climate change adaptation
- Local weather resources
- Government weather support`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide weather-based irrigation recommendations" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      weatherIrrigation: completion.choices[0].message.content,
      location: location,
      crop: crop,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weather Irrigation Error:', error);
    res.status(500).json({ success: false, error: 'Weather irrigation unavailable' });
  }
});

// Water Conservation Strategies
router.post('/water-conservation', async (req, res) => {
  try {
    const { region, waterSource, crop, budget, technology } = req.body;
    
    const systemPrompt = `You are a water conservation expert for Indian agriculture.
    
**Water Conservation Request:**
- Region: ${region}
- Water Source: ${waterSource}
- Crop: ${crop}
- Budget: ${budget}
- Technology Level: ${technology}

Provide comprehensive water conservation strategies:

1. **Drip Irrigation** implementation and benefits
2. **Sprinkler Systems** for water efficiency
3. **Mulching Techniques** for moisture retention
4. **Soil Management** for water holding
5. **Crop Selection** for water efficiency
6. **Rainwater Harvesting** methods
7. **Water Recycling** and reuse strategies
8. **Technology Integration** for monitoring
9. **Government Support** for water conservation
10. **Cost-Benefit Analysis** of conservation methods

Include:
- Traditional water wisdom
- Modern conservation techniques
- Local resource utilization
- Community water management
- Policy compliance requirements
- Success stories and case studies
- Training and capacity building
- Maintenance and operation
- Performance monitoring
- Long-term sustainability`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend water conservation strategies for my farm" }
      ],
      max_tokens: 1000,
      temperature: 0.6
    });

    res.json({
      success: true,
      conservationStrategies: completion.choices[0].message.content,
      region: region,
      waterSource: waterSource,
      crop: crop,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Water Conservation Error:', error);
    res.status(500).json({ success: false, error: 'Water conservation unavailable' });
  }
});

// Irrigation System Selection and Design
router.post('/system-selection', async (req, res) => {
  try {
    const { landSize, crop, topography, waterSource, budget, labor } = req.body;
    
    const systemPrompt = `You are an irrigation system design expert for Indian farms.
    
**System Selection Request:**
- Land Size: ${landSize}
- Crop: ${crop}
- Topography: ${topography}
- Water Source: ${waterSource}
- Budget: ${budget}
- Labor Availability: ${labor}

Provide irrigation system recommendations:

1. **System Type Selection** (drip, sprinkler, flood, etc.)
2. **Design Specifications** and layout
3. **Component Selection** and quality
4. **Installation Requirements** and timeline
5. **Operation and Maintenance** procedures
6. **Cost Breakdown** and financing options
7. **Labor Requirements** and training
8. **Energy Efficiency** considerations
9. **Government Subsidies** and support
10. **Technology Integration** opportunities

Include:
- System comparison analysis
- Local supplier recommendations
- Installation contractor guidance
- Quality assurance measures
- Performance expectations
- Troubleshooting guides
- Upgrade pathways
- ROI calculations
- Environmental impact
- Regulatory compliance`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend the best irrigation system for my farm" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      systemRecommendation: completion.choices[0].message.content,
      landSize: landSize,
      crop: crop,
      budget: budget,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System Selection Error:', error);
    res.status(500).json({ success: false, error: 'System selection unavailable' });
  }
});

// Smart Irrigation with IoT Integration
router.post('/smart-irrigation', async (req, res) => {
  try {
    const { currentSystem, technologyBudget, internetAvailability, cropComplexity } = req.body;
    
    const systemPrompt = `You are a smart agriculture expert specializing in IoT irrigation for Indian farms.
    
**Smart Irrigation Request:**
- Current System: ${currentSystem}
- Technology Budget: ${technologyBudget}
- Internet Availability: ${internetAvailability}
- Crop Complexity: ${cropComplexity}

Provide smart irrigation upgrade recommendations:

1. **Sensor Integration** (soil moisture, weather, crop)
2. **Automation Systems** and controllers
3. **Mobile App Integration** for monitoring
4. **Data Analytics** and insights
5. **Weather Integration** and forecasting
6. **Energy Management** and optimization
7. **Remote Monitoring** capabilities
8. **Alert Systems** and notifications
9. **Data Security** and privacy
10. **Training and Support** requirements

Include:
- Technology cost analysis
- Implementation timeline
- Training requirements
- Maintenance procedures
- Data management strategies
- Integration with existing systems
- Scalability considerations
- Vendor recommendations
- Government support programs
- Success metrics and KPIs`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend smart irrigation upgrades for my farm" }
      ],
      max_tokens: 1000,
      temperature: 0.6
    });

    res.json({
      success: true,
      smartIrrigation: completion.choices[0].message.content,
      currentSystem: currentSystem,
      technologyBudget: technologyBudget,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Smart Irrigation Error:', error);
    res.status(500).json({ success: false, error: 'Smart irrigation unavailable' });
  }
});

module.exports = router;
