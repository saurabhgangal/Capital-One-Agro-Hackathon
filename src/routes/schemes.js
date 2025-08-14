const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Government Schemes Database (based on myscheme.gov.in)
const governmentSchemes = [
  {
    id: 1,
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "Direct income support of ₹6,000 per year to eligible farmer families",
    eligibility: "Small and marginal farmers, age 18+",
    benefits: "₹6,000 annually in 3 installments",
    category: "Income Support",
    state: "All India",
    ageGroup: "18+",
    landHolding: "Up to 2 hectares",
    applicationProcess: "Online through PM-KISAN portal",
    documents: "Aadhaar, land records, bank account",
    contact: "PM-KISAN Helpline: 155261",
    website: "https://pmkisan.gov.in"
  },
  {
    id: 2,
    name: "PM Fasal Bima Yojana (PMFBY)",
    description: "Comprehensive crop insurance scheme for farmers",
    eligibility: "All farmers growing notified crops",
    benefits: "Crop loss compensation, premium subsidy",
    category: "Crop Insurance",
    state: "All India",
    ageGroup: "All ages",
    landHolding: "Any size",
    applicationProcess: "Through banks, insurance companies",
    documents: "Land records, crop details, bank account",
    contact: "PMFBY Helpline: 1800-180-1551",
    website: "https://pmfby.gov.in"
  },
  {
    id: 3,
    name: "Kisan Credit Card (KCC)",
    description: "Credit facility for farmers to meet agricultural needs",
    eligibility: "Individual farmers, joint borrowers",
    benefits: "Credit limit up to ₹3 lakh, low interest rates",
    category: "Credit & Finance",
    state: "All India",
    ageGroup: "18-75",
    landHolding: "Any size",
    applicationProcess: "Through banks and cooperative societies",
    documents: "Aadhaar, land records, income certificate",
    contact: "Local bank branches",
    website: "https://www.nabard.org"
  },
  {
    id: 4,
    name: "Soil Health Card Scheme",
    description: "Free soil testing and recommendations for farmers",
    eligibility: "All farmers",
    benefits: "Free soil testing, nutrient recommendations",
    category: "Soil Health",
    state: "All India",
    ageGroup: "All ages",
    landHolding: "Any size",
    applicationProcess: "Through agriculture department",
    documents: "Aadhaar, land records",
    contact: "Local agriculture office",
    website: "https://soilhealth.dac.gov.in"
  },
  {
    id: 5,
    name: "PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)",
    description: "Water conservation and irrigation development",
    eligibility: "Farmers with irrigation facilities",
    benefits: "Subsidy for irrigation equipment, water conservation",
    category: "Irrigation",
    state: "All India",
    ageGroup: "All ages",
    landHolding: "Any size",
    applicationProcess: "Through agriculture department",
    documents: "Land records, irrigation details",
    contact: "Local agriculture office",
    website: "https://pmksy.gov.in"
  },
  {
    id: 6,
    name: "National Mission for Sustainable Agriculture (NMSA)",
    description: "Promotes sustainable farming practices",
    eligibility: "Farmers practicing organic/sustainable farming",
    benefits: "Subsidy for organic inputs, training",
    category: "Sustainable Farming",
    state: "All India",
    ageGroup: "All ages",
    landHolding: "Any size",
    applicationProcess: "Through agriculture department",
    documents: "Land records, farming details",
    contact: "Local agriculture office",
    website: "https://nmsa.dac.gov.in"
  },
  {
    id: 7,
    name: "PM-AASHA (Price Support Scheme)",
    description: "Price support for pulses and oilseeds",
    eligibility: "Farmers growing pulses and oilseeds",
    benefits: "Minimum support price, procurement support",
    category: "Price Support",
    state: "All India",
    ageGroup: "All ages",
    landHolding: "Any size",
    applicationProcess: "Through procurement agencies",
    documents: "Land records, crop details",
    contact: "Local procurement office",
    website: "https://farmer.gov.in"
  },
  {
    id: 8,
    name: "National Agriculture Market (eNAM)",
    description: "Online trading platform for agricultural commodities",
    eligibility: "All farmers",
    benefits: "Better prices, transparent trading",
    category: "Market Access",
    state: "All India",
    ageGroup: "All ages",
    landHolding: "Any size",
    applicationProcess: "Online registration",
    documents: "Aadhaar, bank account",
    contact: "eNAM Helpline: 1800-270-5533",
    website: "https://enam.gov.in"
  },
  {
    id: 9,
    name: "PM-FME (Food Processing)",
    description: "Support for food processing units",
    eligibility: "Farmers, FPOs, entrepreneurs",
    benefits: "Capital subsidy, training, marketing support",
    category: "Food Processing",
    state: "All India",
    ageGroup: "18+",
    landHolding: "Not applicable",
    applicationProcess: "Online through PM-FME portal",
    documents: "Aadhaar, business plan, land documents",
    contact: "PM-FME Helpline: 1800-111-555",
    website: "https://pmfme.mofpi.gov.in"
  },
  {
    id: 10,
    name: "National Livestock Mission",
    description: "Support for livestock development",
    eligibility: "Livestock farmers, dairy farmers",
    benefits: "Subsidy for livestock, training, insurance",
    category: "Livestock",
    state: "All India",
    ageGroup: "All ages",
    landHolding: "Not applicable",
    applicationProcess: "Through animal husbandry department",
    documents: "Aadhaar, livestock details",
    contact: "Local animal husbandry office",
    website: "https://dahd.nic.in"
  }
];

// Financial Options Database
const financialOptions = [
  {
    id: 1,
    name: "Kisan Credit Card (KCC)",
    type: "Credit Facility",
    amount: "Up to ₹3 lakh",
    interest: "7% (with interest subvention)",
    tenure: "Flexible repayment",
    collateral: "Minimal",
    eligibility: "All farmers",
    features: ["Low interest rates", "Flexible repayment", "Crop insurance coverage"]
  },
  {
    id: 2,
    name: "PM-KISAN",
    type: "Direct Income Support",
    amount: "₹6,000 annually",
    interest: "No interest (direct transfer)",
    tenure: "Annual",
    collateral: "None",
    eligibility: "Small and marginal farmers",
    features: ["Direct bank transfer", "No repayment required", "Regular installments"]
  },
  {
    id: 3,
    name: "Agricultural Term Loans",
    type: "Term Loan",
    amount: "₹10 lakh - ₹1 crore",
    interest: "8.5% - 12%",
    tenure: "3-7 years",
    collateral: "Land/machinery",
    eligibility: "Farmers with land",
    features: ["Long-term financing", "Equipment purchase", "Infrastructure development"]
  },
  {
    id: 4,
    name: "Microfinance for Farmers",
    type: "Micro Credit",
    amount: "₹10,000 - ₹50,000",
    interest: "12% - 18%",
    tenure: "6-24 months",
    collateral: "Group guarantee",
    eligibility: "Small farmers, women farmers",
    features: ["Quick disbursal", "Group lending", "Minimal documentation"]
  },
  {
    id: 5,
    name: "Cooperative Credit",
    type: "Cooperative Loan",
    amount: "₹1 lakh - ₹5 lakh",
    interest: "6% - 9%",
    tenure: "1-3 years",
    collateral: "Cooperative membership",
    eligibility: "Cooperative members",
    features: ["Low interest rates", "Community support", "Flexible terms"]
  }
];

    // AI Chat for Scheme Discovery
    router.post('/chat', async (req, res) => {
      try {
        const { message, language = 'en', conversationHistory = [] } = req.body;
        
        // Auto-detect language from user message if not specified
        let detectedLanguage = language;
        if (!language || language === 'auto') {
          detectedLanguage = detectLanguage(message);
        }
        
        // Extract farmer information from conversation
        const farmerInfo = extractFarmerInfo(conversationHistory);
        
        // Generate AI response with scheme recommendations
        const systemPrompt = `You are a government scheme expert for Indian farmers. Help farmers discover relevant schemes based on their profile.

**Farmer Information Available:**
${JSON.stringify(farmerInfo, null, 2)}

**Available Schemes:**
${governmentSchemes.map(scheme => 
  `- ${scheme.name}: ${scheme.description} (Eligibility: ${scheme.eligibility})`
).join('\n')}

**Available Financial Options:**
${financialOptions.map(option => 
  `- ${option.name}: ${option.type} up to ${option.amount} at ${option.interest} interest`
).join('\n')}

**Response Guidelines:**
- Ask relevant questions to understand farmer's needs
- Suggest specific schemes based on eligibility
- Include financial options when relevant
- Provide clear application steps
- Use simple, encouraging language
- Be specific about benefits and requirements
- Always mention contact information and websites
- CRITICAL: ALWAYS respond in ${detectedLanguage === 'hi' ? 'Hindi (Devanagari script)' : 'English'} language

**Language:** ${getLanguageInstructions(detectedLanguage)}

**Current Message:** ${message}

**Conversation History:** ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Provide a helpful, informative response that guides the farmer to the right schemes.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    
    // Find relevant schemes based on farmer info
    const relevantSchemes = findRelevantSchemes(farmerInfo);
    const relevantFinancialOptions = findRelevantFinancialOptions(farmerInfo);

    res.json({
      success: true,
      response: response,
      language: language,
      relevantSchemes: relevantSchemes,
      relevantFinancialOptions: relevantFinancialOptions,
      farmerInfo: farmerInfo,
      suggestions: [
        'Ask about your age and location',
        'Tell us about your land holding',
        'What crops do you grow?',
        'Are you interested in credit options?',
        'Do you need irrigation support?'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schemes Chat Error:', error);
    res.status(500).json({ success: false, error: 'AI service temporarily unavailable' });
  }
});

// MyScheme API Integration
router.post('/myscheme', async (req, res) => {
    try {
        const { query, userProfile, apiType } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }
        
        console.log(`🏛️ MyScheme API request for: ${query}`);
        
        // TODO: Replace with actual MyScheme API integration
        // You'll need to get API key from: https://directory.apisetu.gov.in/api-collection/myscheme
        
        // Generate realistic mock scheme data based on query
        const mockSchemeData = generateMockSchemeData(query, userProfile);
        
        console.log('✅ Mock MyScheme data generated');
        
        res.json({
            success: true,
            schemeData: mockSchemeData,
            source: 'MyScheme API (Mock)',
            query: query,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('MyScheme API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch MyScheme data',
            details: error.message
        });
    }
});

// Generate mock scheme data based on query
function generateMockSchemeData(query, userProfile) {
    const queryLower = query.toLowerCase();
    
    // Define scheme categories
    const schemeCategories = {
        'loan': ['Kisan Credit Card', 'PM Fasal Bima Yojana', 'Agricultural Infrastructure Fund'],
        'subsidy': ['PM Kisan Samman Nidhi', 'Soil Health Card', 'PMKSY'],
        'insurance': ['PM Fasal Bima Yojana', 'Livestock Insurance', 'Weather-based Crop Insurance'],
        'irrigation': ['PMKSY', 'Har Khet Ko Pani', 'Per Drop More Crop'],
        'technology': ['PM Kisan', 'Kisan Suvidha App', 'eNAM Platform'],
        'education': ['Kisan Call Centers', 'Farmer Training Programs', 'Agricultural Universities']
    };
    
    // Determine category from query
    let category = 'loan'; // default
    for (const [key, schemes] of Object.entries(schemeCategories)) {
        if (queryLower.includes(key)) {
            category = key;
            break;
        }
    }
    
    // Generate relevant schemes
    const relevantSchemes = schemeCategories[category] || schemeCategories['loan'];
    const selectedSchemes = relevantSchemes.slice(0, 2); // Get 2 most relevant
    
    const schemes = selectedSchemes.map(schemeName => ({
        name: schemeName,
        description: `Government scheme for ${category} support`,
        eligibility: 'All farmers registered with government',
        benefits: 'Financial assistance and support services',
        applicationProcess: 'Apply through nearest government office or online portal',
        contact: 'Contact local agriculture department',
        website: 'https://www.myscheme.gov.in'
    }));
    
    // Generate financial options
    const financialOptions = [
        {
            name: 'Kisan Credit Card',
            type: 'Credit Facility',
            amount: '₹50,000 - ₹5,00,000',
            interestRate: '7% per annum',
            features: 'Easy credit access, flexible repayment, low interest',
            contact: 'Contact nearest bank branch'
        },
        {
            name: 'PM Fasal Bima Yojana',
            type: 'Crop Insurance',
            amount: 'Premium: ₹1 - ₹2 per hectare',
            interestRate: 'N/A',
            features: 'Comprehensive crop insurance, government support',
            contact: 'Contact insurance companies or banks'
        }
    ];
    
    return {
        schemes: schemes,
        financialOptions: financialOptions,
        category: category,
        totalSchemes: schemes.length,
        totalFinancialOptions: financialOptions.length
    };
}

// Get all available schemes
router.get('/all-schemes', async (req, res) => {
  try {
    res.json({
      success: true,
      schemes: governmentSchemes,
      financialOptions: financialOptions,
      totalSchemes: governmentSchemes.length,
      totalFinancialOptions: financialOptions.length
    });
  } catch (error) {
    console.error('Get Schemes Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schemes' });
  }
});

// Get schemes by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const filteredSchemes = governmentSchemes.filter(scheme => 
      scheme.category.toLowerCase().includes(category.toLowerCase())
    );
    
    res.json({
      success: true,
      category: category,
      schemes: filteredSchemes,
      count: filteredSchemes.length
    });
  } catch (error) {
    console.error('Category Filter Error:', error);
    res.status(500).json({ success: false, error: 'Failed to filter schemes' });
  }
});

// Helper function to extract farmer information from conversation
function extractFarmerInfo(conversationHistory) {
  const info = {
    age: null,
    state: null,
    location: null,
    landHolding: null,
    crops: [],
    income: null,
    needs: []
  };

  // Simple extraction logic - in production, use more sophisticated NLP
  conversationHistory.forEach(msg => {
    const content = msg.content.toLowerCase();
    
    // Extract age
    const ageMatch = content.match(/(\d+)\s*(?:years?\s*old|age|saal|umar)/i);
    if (ageMatch) info.age = parseInt(ageMatch[1]);
    
    // Extract state/location
    const stateMatch = content.match(/(?:from|in|at)\s+([a-zA-Z\s]+)(?:state|province|city|village)/i);
    if (stateMatch) info.location = stateMatch[1].trim();
    
    // Extract land holding
    const landMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:hectares?|acres?|bigha|katha)/i);
    if (landMatch) info.landHolding = landMatch[1];
    
    // Extract crops
    const cropKeywords = ['wheat', 'rice', 'cotton', 'sugarcane', 'pulses', 'vegetables', 'fruits'];
    cropKeywords.forEach(crop => {
      if (content.includes(crop)) info.crops.push(crop);
    });
  });

  return info;
}

// Helper function to find relevant schemes
function findRelevantSchemes(farmerInfo) {
  return governmentSchemes.filter(scheme => {
    // Age-based filtering
    if (farmerInfo.age && scheme.ageGroup) {
      if (scheme.ageGroup === '18+' && farmerInfo.age < 18) return false;
      if (scheme.ageGroup === 'All ages') return true;
    }
    
    // Land holding filtering
    if (farmerInfo.landHolding && scheme.landHolding) {
      if (scheme.landHolding === 'Up to 2 hectares') {
        const land = parseFloat(farmerInfo.landHolding);
        if (land > 2) return false;
      }
    }
    
    return true;
  }).slice(0, 5); // Return top 5 relevant schemes
}

// Helper function to find relevant financial options
function findRelevantFinancialOptions(farmerInfo) {
  return financialOptions.filter(option => {
    // Age-based filtering
    if (farmerInfo.age && option.eligibility) {
      if (option.eligibility === 'All farmers') return true;
      if (option.eligibility.includes('18+') && farmerInfo.age < 18) return false;
    }
    
    return true;
  }).slice(0, 3); // Return top 3 relevant options
}

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

module.exports = router;
