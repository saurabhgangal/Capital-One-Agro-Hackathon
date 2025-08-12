const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Government Scheme Recommendations with RAG
router.post('/government-schemes', async (req, res) => {
  try {
    const { income, landSize, crop, region, category, purpose } = req.body;
    
    const systemPrompt = `You are a government scheme expert specializing in Indian agricultural support programs.
    
**Scheme Analysis Request:**
- Income Level: ${income}
- Land Size: ${landSize}
- Crop: ${crop}
- Region: ${region}
- Category: ${category} (SC/ST/OBC/General)
- Purpose: ${purpose}

Provide comprehensive government scheme recommendations:

1. **PM-KISAN** eligibility and benefits
2. **PM-FASAL BIMA YOJANA** crop insurance details
3. **KISAN CREDIT CARD** (KCC) information
4. **PM-KISAN SAMMAN NIDHI** direct benefit transfer
5. **Soil Health Card Scheme** benefits
6. **PM-KISAN MAAN DHAN YOJANA** pension scheme
7. **National Agriculture Market (eNAM)** support
8. **PM-KISAN URJA SURAKSHA** solar pump scheme
9. **State-specific schemes** for ${region}
10. **Special category benefits** for ${category}

Include:
- Eligibility criteria
- Application process
- Required documents
- Benefit amounts
- Application deadlines
- Contact information
- Success stories
- Application tips

Provide actionable information for Indian farmers.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend government schemes I'm eligible for" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      schemes: completion.choices[0].message.content,
      income: income,
      region: region,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Government Schemes Error:', error);
    res.status(500).json({ success: false, error: 'Scheme recommendations unavailable' });
  }
});

// Credit Evaluation and Loan Assessment
router.post('/credit-evaluation', async (req, res) => {
  try {
    const { income, landSize, crop, creditHistory, existingLoans, purpose, amount } = req.body;
    
    const systemPrompt = `You are a credit evaluation expert for agricultural loans in India.
    
**Credit Evaluation Request:**
- Annual Income: ${income}
- Land Size: ${landSize}
- Primary Crop: ${crop}
- Credit History: ${creditHistory}
- Existing Loans: ${existingLoans}
- Loan Purpose: ${purpose}
- Required Amount: ${amount}

Provide comprehensive credit evaluation:

1. **Credit Score Assessment** and factors
2. **Loan Eligibility** analysis
3. **Maximum Loan Amount** recommendation
4. **Interest Rate** expectations
5. **Repayment Capacity** analysis
6. **Risk Assessment** and mitigation
7. **Required Documents** and collateral
8. **Alternative Financing** options
9. **Government Loan Schemes** eligibility
10. **Credit Improvement** strategies

Include:
- Income verification requirements
- Land documentation needs
- Crop insurance requirements
- Repayment schedule options
- Prepayment benefits
- Default consequences
- Success probability
- Application timeline`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Evaluate my creditworthiness for agricultural loans" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      creditEvaluation: completion.choices[0].message.content,
      income: income,
      landSize: landSize,
      purpose: purpose,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Credit Evaluation Error:', error);
    res.status(500).json({ success: false, error: 'Credit evaluation unavailable' });
  }
});

// Loan Product Recommendations
router.post('/loan-recommendations', async (req, res) => {
  try {
    const { purpose, amount, tenure, crop, region, bankPreference } = req.body;
    
    const systemPrompt = `You are a loan product specialist for Indian agricultural financing.
    
**Loan Recommendation Request:**
- Purpose: ${purpose}
- Amount: ${amount}
- Tenure: ${tenure}
- Crop: ${crop}
- Region: ${region}
- Bank Preference: ${bankPreference}

Provide comprehensive loan product recommendations:

1. **Kisan Credit Card (KCC)** details and benefits
2. **Term Loans** for equipment and infrastructure
3. **Crop Loans** for seasonal requirements
4. **Gold Loans** for emergency funding
5. **Microfinance** options for small amounts
6. **Cooperative Bank** loan programs
7. **Regional Rural Bank** offerings
8. **Government Bank** agricultural schemes
9. **Private Bank** agricultural products
10. **Digital Lending** platforms

Include:
- Interest rates and charges
- Processing fees
- Documentation requirements
- Disbursement timeline
- Repayment flexibility
- Prepayment options
- Customer service quality
- Digital banking features
- Branch network coverage
- Special farmer benefits`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Recommend the best loan products for my farming needs" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      loanRecommendations: completion.choices[0].message.content,
      purpose: purpose,
      amount: amount,
      region: region,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Loan Recommendations Error:', error);
    res.status(500).json({ success: false, error: 'Loan recommendations unavailable' });
  }
});

// Financial Planning and Budgeting
router.post('/financial-planning', async (req, res) => {
  try {
    const { income, expenses, goals, timeline, riskTolerance } = req.body;
    
    const systemPrompt = `You are a financial planner specializing in Indian agricultural finance.
    
**Financial Planning Request:**
- Annual Income: ${income}
- Monthly Expenses: ${expenses}
- Financial Goals: ${goals}
- Timeline: ${timeline}
- Risk Tolerance: ${riskTolerance}

Provide comprehensive financial planning:

1. **Income Analysis** and optimization strategies
2. **Expense Management** and reduction tips
3. **Savings Strategy** for different goals
4. **Investment Recommendations** for farmers
5. **Insurance Planning** (crop, life, health)
6. **Emergency Fund** requirements
7. **Debt Management** strategies
8. **Tax Planning** for agricultural income
9. **Retirement Planning** considerations
10. **Succession Planning** for family farming

Include:
- Monthly budget templates
- Seasonal income planning
- Crop diversification benefits
- Government scheme integration
- Risk mitigation strategies
- Technology investment ROI
- Market opportunity analysis
- Sustainable farming economics`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Create a comprehensive financial plan for my farming business" }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      financialPlan: completion.choices[0].message.content,
      income: income,
      goals: goals,
      timeline: timeline,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Financial Planning Error:', error);
    res.status(500).json({ success: false, error: 'Financial planning unavailable' });
  }
});

// Application Process Guidance
router.post('/application-guidance', async (req, res) => {
  try {
    const { scheme, loanType, bank, documents, timeline } = req.body;
    
    const systemPrompt = `You are an application process expert for Indian agricultural schemes and loans.
    
**Application Guidance Request:**
- Scheme/Loan: ${scheme}
- Type: ${loanType}
- Bank/Institution: ${bank}
- Available Documents: ${documents}
- Timeline: ${timeline}

Provide step-by-step application guidance:

1. **Pre-Application Checklist** and preparation
2. **Document Collection** requirements
3. **Application Form** filling guidance
4. **Submission Process** and channels
5. **Follow-up Procedures** and tracking
6. **Common Mistakes** to avoid
7. **Processing Timeline** expectations
8. **Approval Criteria** and factors
9. **Rejection Reasons** and solutions
10. **Success Tips** and best practices

Include:
- Document verification process
- Application fee details
- Interview preparation tips
- Reference requirements
- Guarantor information
- Collateral valuation
- Insurance requirements
- Repayment planning
- Post-approval steps
- Customer support contacts`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Guide me through the application process" }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      applicationGuidance: completion.choices[0].message.content,
      scheme: scheme,
      bank: bank,
      timeline: timeline,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Application Guidance Error:', error);
    res.status(500).json({ success: false, error: 'Application guidance unavailable' });
  }
});

module.exports = router;
