const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    scientificName: String,
    symptoms: [String],
    causes: [String],
    prevention: [String],
    treatment: [String],
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    affectedParts: [String],
    season: [String],
    imageUrl: String
});

const pestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    scientificName: String,
    description: String,
    damage: [String],
    control: [String],
    season: [String],
    imageUrl: String
});

const cropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    scientificName: String,
    localNames: {
        hi: String, // Hindi
        bn: String, // Bengali
        te: String, // Telugu
        mr: String, // Marathi
        ta: String, // Tamil
        gu: String, // Gujarati
        kn: String, // Kannada
        ml: String, // Malayalam
        pa: String, // Punjabi
        or: String, // Odia
        as: String, // Assamese
        ur: String, // Urdu
        ne: String, // Nepali
        si: String  // Sindhi
    },
    
    // Basic Information
    category: {
        type: String,
        enum: ['cereal', 'pulse', 'oilseed', 'vegetable', 'fruit', 'spice', 'fiber', 'sugarcane', 'other'],
        required: true
    },
    family: String,
    origin: String,
    
    // Growing Information
    season: {
        kharif: Boolean,
        rabi: Boolean,
        zaid: Boolean
    },
    growingPeriod: {
        min: Number, // in days
        max: Number  // in days
    },
    climate: {
        temperature: {
            min: Number,
            max: Number
        },
        rainfall: {
            min: Number,
            max: Number
        },
        humidity: {
            min: Number,
            max: Number
        }
    },
    
    // Soil Requirements
    soilType: [String],
    soilPH: {
        min: Number,
        max: Number
    },
    soilDrainage: {
        type: String,
        enum: ['well_drained', 'moderately_drained', 'poorly_drained']
    },
    
    // Water Requirements
    waterRequirement: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    irrigationFrequency: String,
    
    // Yield Information
    averageYield: {
        perAcre: Number,
        perHectare: Number,
        unit: {
            type: String,
            enum: ['quintal', 'ton', 'kg', 'pieces'],
            default: 'quintal'
        }
    },
    
    // Market Information
    marketPrice: {
        current: Number,
        unit: String,
        lastUpdated: Date
    },
    demand: {
        type: String,
        enum: ['low', 'medium', 'high', 'very_high'],
        default: 'medium'
    },
    
    // Diseases and Pests
    commonDiseases: [diseaseSchema],
    commonPests: [pestSchema],
    
    // Farming Practices
    sowingMethod: [String],
    spacing: {
        rowToRow: String,
        plantToPlant: String
    },
    fertilizer: {
        npk: String,
        organic: [String],
        application: String
    },
    
    // Harvesting
    harvestingTime: String,
    harvestingMethod: [String],
    postHarvest: [String],
    
    // Economic Information
    costOfCultivation: {
        perAcre: Number,
        perHectare: Number,
        currency: {
            type: String,
            default: 'INR'
        }
    },
    profitMargin: {
        min: Number,
        max: Number
    },
    
    // Government Schemes
    governmentSchemes: [{
        name: String,
        description: String,
        eligibility: [String],
        benefits: [String],
        applicationProcess: String,
        contactInfo: String
    }],
    
    // Tips and Best Practices
    bestPractices: [String],
    commonMistakes: [String],
    expertTips: [String],
    
    // Images
    images: {
        plant: String,
        flower: String,
        fruit: String,
        seed: String,
        field: String
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Metadata
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    source: String,
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better performance
cropSchema.index({ name: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ 'season.kharif': 1 });
cropSchema.index({ 'season.rabi': 1 });
cropSchema.index({ state: 1 });
cropSchema.index({ waterRequirement: 1 });
cropSchema.index({ demand: 1 });

// Virtual for full local name
cropSchema.virtual('localName').get(function() {
    return this.localNames.hi || this.name; // Default to Hindi or English name
});

// Virtual for growing season text
cropSchema.virtual('seasonText').get(function() {
    const seasons = [];
    if (this.season.kharif) seasons.push('Kharif');
    if (this.season.rabi) seasons.push('Rabi');
    if (this.season.zaid) seasons.push('Zaid');
    return seasons.join(', ') || 'Year-round';
});

// Method to get crop summary
cropSchema.methods.getSummary = function() {
    return {
        id: this._id,
        name: this.name,
        localName: this.localName,
        category: this.category,
        season: this.seasonText,
        growingPeriod: `${this.growingPeriod.min}-${this.growingPeriod.max} days`,
        waterRequirement: this.waterRequirement,
        averageYield: `${this.averageYield.perAcre} ${this.averageYield.unit}/acre`,
        marketPrice: `${this.marketPrice.current} ${this.marketPrice.unit}`,
        demand: this.demand
    };
};

// Static method to find crops by season
cropSchema.statics.findBySeason = function(season) {
    return this.find({ [`season.${season}`]: true });
};

// Static method to find crops by category
cropSchema.statics.findByCategory = function(category) {
    return this.find({ category: category });
};

// Static method to find crops by water requirement
cropSchema.statics.findByWaterRequirement = function(requirement) {
    return this.find({ waterRequirement: requirement });
};

// Static method to search crops
cropSchema.statics.search = function(query) {
    return this.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { scientificName: { $regex: query, $options: 'i' } },
            { 'localNames.hi': { $regex: query, $options: 'i' } },
            { 'localNames.bn': { $regex: query, $options: 'i' } },
            { 'localNames.te': { $regex: query, $options: 'i' } },
            { 'localNames.mr': { $regex: query, $options: 'i' } },
            { 'localNames.ta': { $regex: query, $options: 'i' } },
            { 'localNames.gu': { $regex: query, $options: 'i' } },
            { 'localNames.kn': { $regex: query, $options: 'i' } },
            { 'localNames.ml': { $regex: query, $options: 'i' } },
            { 'localNames.pa': { $regex: query, $options: 'i' } },
            { 'localNames.or': { $regex: query, $options: 'i' } },
            { 'localNames.as': { $regex: query, $options: 'i' } },
            { 'localNames.ur': { $regex: query, $options: 'i' } },
            { 'localNames.ne': { $regex: query, $options: 'i' } },
            { 'localNames.si': { $regex: query, $options: 'i' } }
        ]
    });
};

module.exports = mongoose.model('Crop', cropSchema);
