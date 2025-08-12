const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get Best Crop Recommendations for Region
router.post('/recommend-crop', async (req, res) => {
  try {
    const { region, soilType, season, waterAvailability, budget, marketDemand } = req.body;
    
    const systemPrompt = `You are an expert agricultural scientist specializing in Indian farming conditions.
    
**Analysis Request:**
- Region: ${region}
- Soil Type: ${soilType}
- Season: ${season}
- Water Availability: ${waterAvailability}
- Budget: ${budget}
- Market Demand: ${marketDemand}

Provide comprehensive crop recommendations including:

1. **Top 3 Crop Options** with detailed reasoning
2. **Expected Yield** and profitability analysis
3. **Resource Requirements** (water, fertilizer, labor)
4. **Risk Factors** and mitigation strategies
5. **Market Timing** for optimal selling
6. **Government Support** available for these crops
7. **Organic Alternatives** if applicable

Consider:
- Local climate and weather patterns
- Soil health and fertility
- Water conservation methods
- Cost-benefit analysis
- Market price trends
- Seasonal advantages

Provide practical, actionable advice for Indian farmers.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend the best crops for my farming conditions" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      recommendations: completion.choices[0].message.content,
      region: region,
      season: season,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Crop Recommendation Error:', error);
    res.status(500).json({ success: false, error: 'Recommendation service unavailable' });
  }
});

// Soil Health Analysis and Recommendations
router.post('/soil-analysis', async (req, res) => {
  try {
    const { soilType, phLevel, organicMatter, nutrients, region, currentCrop } = req.body;
    
    const systemPrompt = `You are a soil scientist expert in Indian agricultural soils.
    
**Soil Analysis Data:**
- Soil Type: ${soilType}
- pH Level: ${phLevel}
- Organic Matter: ${organicMatter}
- Nutrients: ${JSON.stringify(nutrients)}
- Region: ${region}
- Current Crop: ${currentCrop}

Provide comprehensive soil health analysis including:

1. **Soil Health Assessment** (Excellent/Good/Fair/Poor)
2. **Nutrient Deficiencies** and excesses
3. **pH Optimization** recommendations
4. **Organic Matter Improvement** strategies
5. **Crop-Specific Recommendations** for ${currentCrop}
6. **Sustainable Practices** for long-term soil health
7. **Cost-Effective Solutions** for Indian farmers
8. **Government Schemes** for soil improvement

Include:
- Natural and organic amendments
- Crop rotation strategies
- Water management techniques
- Local resource utilization
- Budget-friendly solutions`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze my soil health and provide improvement recommendations" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      soilAnalysis: completion.choices[0].message.content,
      soilType: soilType,
      region: region,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Soil Analysis Error:', error);
    res.status(500).json({ success: false, error: 'Soil analysis unavailable' });
  }
});

// Crop Disease Prevention and Management
router.post('/disease-prevention', async (req, res) => {
  try {
    const { crop, region, season, previousIssues, organicPreference } = req.body;
    
    const systemPrompt = `You are a plant pathologist specializing in Indian crop diseases.
    
**Crop Protection Request:**
- Crop: ${crop}
- Region: ${region}
- Season: ${season}
- Previous Issues: ${previousIssues}
- Organic Preference: ${organicPreference}

Provide comprehensive disease prevention and management plan:

1. **Common Diseases** for ${crop} in ${region}
2. **Prevention Strategies** (cultural, biological, chemical)
3. **Early Detection Methods** and symptoms
4. **Treatment Options** (prioritize organic if ${organicPreference})
5. **Seasonal Protection** measures
6. **Integrated Pest Management** (IPM) approach
7. **Cost-Effective Solutions** for Indian farmers
8. **Government Support** for crop protection

Include:
- Natural pest repellents
- Companion planting strategies
- Crop rotation benefits
- Weather-based protection
- Local resource utilization
- Budget-friendly solutions`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide disease prevention and management strategies for my crop" }
      ],
      max_tokens: 1000,
      temperature: 0.6
    });

    res.json({
      success: true,
      preventionPlan: completion.choices[0].message.content,
      crop: crop,
      region: region,
      season: season,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Disease Prevention Error:', error);
    res.status(500).json({ success: false, error: 'Prevention service unavailable' });
  }
});

// Optimal Planting Calendar
router.post('/planting-calendar', async (req, res) => {
  try {
    const { crop, region, soilType, waterAvailability, marketTiming } = req.body;
    
    const systemPrompt = `You are an agricultural expert providing planting calendar recommendations for Indian farmers.
    
**Planting Calendar Request:**
- Crop: ${crop}
- Region: ${region}
- Soil Type: ${soilType}
- Water Availability: ${waterAvailability}
- Market Timing: ${marketTiming}

Provide detailed planting calendar including:

1. **Optimal Planting Window** with specific dates
2. **Pre-Planting Preparations** (soil, seeds, equipment)
3. **Planting Techniques** for ${crop}
4. **Post-Planting Care** schedule
5. **Irrigation Schedule** based on ${waterAvailability}
6. **Fertilization Timeline** and methods
7. **Harvest Timing** for optimal market prices
8. **Risk Mitigation** for weather uncertainties

Consider:
- Local weather patterns
- Soil preparation requirements
- Seed germination needs
- Water conservation methods
- Market price trends
- Seasonal advantages
- Government support programs`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Create a planting calendar for my crop" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      plantingCalendar: completion.choices[0].message.content,
      crop: crop,
      region: region,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Planting Calendar Error:', error);
    res.status(500).json({ success: false, error: 'Calendar service unavailable' });
  }
});

// Crop Yield Optimization
router.post('/yield-optimization', async (req, res) => {
  try {
    const { crop, region, currentYield, targetYield, resources, budget } = req.body;
    
    const systemPrompt = `You are an agricultural productivity expert helping Indian farmers optimize crop yields.
    
**Yield Optimization Request:**
- Crop: ${crop}
- Region: ${region}
- Current Yield: ${currentYield}
- Target Yield: ${targetYield}
- Available Resources: ${resources}
- Budget: ${budget}

Provide comprehensive yield optimization strategies:

1. **Current Yield Analysis** and limiting factors
2. **Optimization Techniques** for ${crop}
3. **Resource Management** improvements
4. **Technology Integration** recommendations
5. **Best Practices** for ${region}
6. **Cost-Benefit Analysis** of improvements
7. **Government Schemes** for productivity enhancement
8. **Sustainable Practices** for long-term success

Include:
- Precision farming techniques
- Modern irrigation methods
- Soil health improvements
- Crop nutrition optimization
- Pest management strategies
- Weather-based adjustments
- Local success stories`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Help me optimize my crop yield" }
      ],
      max_tokens: 1000,
      temperature: 0.6
    });

    res.json({
      success: true,
      optimizationPlan: completion.choices[0].message.content,
      crop: crop,
      region: region,
      currentYield: currentYield,
      targetYield: targetYield,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Yield Optimization Error:', error);
    res.status(500).json({ success: false, error: 'Optimization service unavailable' });
  }
});

module.exports = router;
