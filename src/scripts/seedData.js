const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const User = require('../models/User');
require('dotenv').config();

// Sample crop data
const cropsData = [
    {
        name: 'Wheat',
        scientificName: 'Triticum aestivum',
        localNames: {
            hi: 'गेहूं',
            bn: 'গম',
            te: 'గోధుమ',
            mr: 'गहू',
            ta: 'கோதுமை',
            gu: 'ઘઉં',
            kn: 'ಗೋಧಿ',
            ml: 'ഗോതമ്പ്',
            pa: 'ਗੇਹੂੰ',
            or: 'ଗହମ',
            as: 'গম',
            ur: 'گندم',
            ne: 'गहुँ',
            si: 'گندم'
        },
        category: 'cereal',
        family: 'Poaceae',
        origin: 'Southwest Asia',
        season: {
            kharif: false,
            rabi: true,
            zaid: false
        },
        growingPeriod: {
            min: 110,
            max: 130
        },
        climate: {
            temperature: {
                min: 15,
                max: 25
            },
            rainfall: {
                min: 400,
                max: 600
            },
            humidity: {
                min: 50,
                max: 70
            }
        },
        soilType: ['loamy', 'clay loam', 'silt loam'],
        soilPH: {
            min: 6.0,
            max: 7.5
        },
        soilDrainage: 'well_drained',
        waterRequirement: 'medium',
        irrigationFrequency: 'Every 7-10 days',
        averageYield: {
            perAcre: 20,
            perHectare: 50,
            unit: 'quintal'
        },
        marketPrice: {
            current: 2200,
            unit: 'INR per quintal',
            lastUpdated: new Date()
        },
        demand: 'high',
        commonDiseases: [
            {
                name: 'Rust',
                scientificName: 'Puccinia graminis',
                symptoms: ['Reddish-brown pustules on leaves', 'Yellow spots', 'Stunted growth'],
                causes: ['Fungal infection', 'High humidity', 'Poor air circulation'],
                prevention: ['Use resistant varieties', 'Proper spacing', 'Fungicide application'],
                treatment: ['Remove infected parts', 'Apply fungicides', 'Improve ventilation'],
                severity: 'high',
                affectedParts: ['leaves', 'stems'],
                season: ['rabi'],
                imageUrl: 'https://example.com/wheat-rust.jpg'
            },
            {
                name: 'Smut',
                scientificName: 'Ustilago tritici',
                symptoms: ['Black powdery spores', 'Deformed grains', 'Reduced yield'],
                causes: ['Seed-borne infection', 'High temperature', 'High humidity'],
                prevention: ['Use certified seeds', 'Seed treatment', 'Crop rotation'],
                treatment: ['Remove infected plants', 'Apply fungicides', 'Destroy crop residue'],
                severity: 'medium',
                affectedParts: ['grains', 'heads'],
                season: ['rabi'],
                imageUrl: 'https://example.com/wheat-smut.jpg'
            }
        ],
        commonPests: [
            {
                name: 'Aphids',
                scientificName: 'Rhopalosiphum padi',
                description: 'Small sap-sucking insects',
                damage: ['Yellow leaves', 'Stunted growth', 'Honeydew secretion'],
                control: ['Natural predators', 'Insecticidal soap', 'Neem oil'],
                season: ['rabi'],
                imageUrl: 'https://example.com/aphids.jpg'
            }
        ],
        sowingMethod: ['Drill sowing', 'Broadcasting'],
        spacing: {
            rowToRow: '20-25 cm',
            plantToPlant: '5-7 cm'
        },
        fertilizer: {
            npk: '120:60:40 kg/ha',
            organic: ['Farmyard manure', 'Vermicompost'],
            application: 'Split application at sowing and tillering'
        },
        harvestingTime: 'When grains are hard and moisture is 20-25%',
        harvestingMethod: ['Combine harvester', 'Manual harvesting'],
        postHarvest: ['Drying', 'Cleaning', 'Storage in dry place'],
        costOfCultivation: {
            perAcre: 15000,
            perHectare: 37500,
            currency: 'INR'
        },
        profitMargin: {
            min: 20,
            max: 40
        },
        governmentSchemes: [
            {
                name: 'PM-KISAN',
                description: 'Direct income support to farmers',
                eligibility: ['Small and marginal farmers', 'Landholding up to 2 hectares'],
                benefits: ['₹6,000 per year in 3 installments'],
                applicationProcess: 'Apply through Common Service Centers or online portal',
                contactInfo: 'PM-KISAN Helpline: 1800-180-1551'
            }
        ],
        bestPractices: [
            'Use certified seeds',
            'Proper land preparation',
            'Timely sowing',
            'Balanced fertilization',
            'Weed management',
            'Disease and pest control'
        ],
        commonMistakes: [
            'Late sowing',
            'Over-irrigation',
            'Excessive nitrogen',
            'Poor weed control',
            'Ignoring disease symptoms'
        ],
        expertTips: [
            'Sow when soil temperature is 20-25°C',
            'Maintain proper spacing for better yield',
            'Use bio-fertilizers for sustainable farming',
            'Monitor weather forecasts for irrigation',
            'Keep field records for better planning'
        ],
        images: {
            plant: 'https://example.com/wheat-plant.jpg',
            flower: 'https://example.com/wheat-flower.jpg',
            fruit: 'https://example.com/wheat-grain.jpg',
            seed: 'https://example.com/wheat-seed.jpg',
            field: 'https://example.com/wheat-field.jpg'
        },
        source: 'ICAR-Indian Agricultural Research Institute',
        verified: true
    },
    {
        name: 'Rice',
        scientificName: 'Oryza sativa',
        localNames: {
            hi: 'चावल',
            bn: 'চাল',
            te: 'వరి',
            mr: 'तांदूळ',
            ta: 'அரிசி',
            gu: 'ચોખા',
            kn: 'ಅಕ್ಕಿ',
            ml: 'അരി',
            pa: 'ਚਾਵਲ',
            or: 'ଚାଉଳ',
            as: 'চাউল',
            ur: 'چاول',
            ne: 'चामल',
            si: 'چاول'
        },
        category: 'cereal',
        family: 'Poaceae',
        origin: 'Asia',
        season: {
            kharif: true,
            rabi: false,
            zaid: true
        },
        growingPeriod: {
            min: 100,
            max: 150
        },
        climate: {
            temperature: {
                min: 20,
                max: 35
            },
            rainfall: {
                min: 1000,
                max: 2000
            },
            humidity: {
                min: 70,
                max: 90
            }
        },
        soilType: ['clay', 'clay loam', 'silty clay'],
        soilPH: {
            min: 5.5,
            max: 8.5
        },
        soilDrainage: 'poorly_drained',
        waterRequirement: 'high',
        irrigationFrequency: 'Continuous flooding or alternate wetting and drying',
        averageYield: {
            perAcre: 25,
            perHectare: 62,
            unit: 'quintal'
        },
        marketPrice: {
            current: 1800,
            unit: 'INR per quintal',
            lastUpdated: new Date()
        },
        demand: 'very_high',
        commonDiseases: [
            {
                name: 'Bacterial Blight',
                scientificName: 'Xanthomonas oryzae',
                symptoms: ['White to gray lesions on leaves', 'Wilting of seedlings', 'Grain discoloration'],
                causes: ['Bacterial infection', 'High humidity', 'Wound entry'],
                prevention: ['Use resistant varieties', 'Seed treatment', 'Field sanitation'],
                treatment: ['Remove infected plants', 'Apply copper-based bactericides'],
                severity: 'high',
                affectedParts: ['leaves', 'stems', 'grains'],
                season: ['kharif'],
                imageUrl: 'https://example.com/rice-blight.jpg'
            }
        ],
        commonPests: [
            {
                name: 'Stem Borer',
                scientificName: 'Scirpophaga incertulas',
                description: 'Larva bores into stem',
                damage: ['Dead hearts', 'White ears', 'Reduced yield'],
                control: ['Light traps', 'Biological control', 'Insecticides'],
                season: ['kharif'],
                imageUrl: 'https://example.com/stem-borer.jpg'
            }
        ],
        sowingMethod: ['Transplanting', 'Direct seeding', 'SRI method'],
        spacing: {
            rowToRow: '20-25 cm',
            plantToPlant: '15-20 cm'
        },
        fertilizer: {
            npk: '120:60:60 kg/ha',
            organic: ['Green manure', 'Azolla', 'Blue-green algae'],
            application: 'Split application at transplanting, tillering, and panicle initiation'
        },
        harvestingTime: 'When 80% grains are mature',
        harvestingMethod: ['Combine harvester', 'Manual harvesting'],
        postHarvest: ['Threshing', 'Drying', 'Milling'],
        costOfCultivation: {
            perAcre: 20000,
            perHectare: 50000,
            currency: 'INR'
        },
        profitMargin: {
            min: 25,
            max: 45
        },
        governmentSchemes: [
            {
                name: 'PM-KISAN',
                description: 'Direct income support to farmers',
                eligibility: ['Small and marginal farmers', 'Landholding up to 2 hectares'],
                benefits: ['₹6,000 per year in 3 installments'],
                applicationProcess: 'Apply through Common Service Centers or online portal',
                contactInfo: 'PM-KISAN Helpline: 1800-180-1551'
            }
        ],
        bestPractices: [
            'Use certified seeds',
            'Proper land leveling',
            'Timely transplanting',
            'Water management',
            'Integrated pest management',
            'Harvest at right stage'
        ],
        commonMistakes: [
            'Late transplanting',
            'Poor water management',
            'Excessive nitrogen',
            'Ignoring pest symptoms',
            'Harvesting at wrong stage'
        ],
        expertTips: [
            'Maintain 2-3 cm water level',
            'Use SRI method for higher yield',
            'Apply zinc for better grain quality',
            'Monitor pest populations regularly',
            'Use light traps for pest control'
        ],
        images: {
            plant: 'https://example.com/rice-plant.jpg',
            flower: 'https://example.com/rice-flower.jpg',
            fruit: 'https://example.com/rice-grain.jpg',
            seed: 'https://example.com/rice-seed.jpg',
            field: 'https://example.com/rice-field.jpg'
        },
        source: 'ICAR-Indian Agricultural Research Institute',
        verified: true
    }
];

// Sample user data
const usersData = [
    {
        username: 'demo_farmer',
        email: 'demo@kisanai.com',
        password: 'demo123',
        phone: '9876543210',
        firstName: 'Demo',
        lastName: 'Farmer',
        state: 'Punjab',
        district: 'Amritsar',
        village: 'Demo Village',
        pincode: '143001',
        farmSize: 5,
        farmSizeUnit: 'acres',
        primaryCrop: 'Wheat',
        secondaryCrops: ['Rice', 'Maize'],
        farmingExperience: 10,
        irrigationType: 'irrigated',
        annualIncome: 300000,
        preferredLanguage: 'hi',
        notificationPreferences: {
            sms: true,
            email: true,
            whatsapp: true,
            push: true
        }
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan_ai');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Crop.deleteMany({});
        await User.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Seed crops
        const crops = await Crop.insertMany(cropsData);
        console.log(`🌾 Seeded ${crops.length} crops`);

        // Seed users
        const users = await User.insertMany(usersData);
        console.log(`👨‍🌾 Seeded ${users.length} users`);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Sample Data:');
        console.log(`- Crops: ${crops.map(c => c.name).join(', ')}`);
        console.log(`- Users: ${users.map(u => u.username).join(', ')}`);
        
        console.log('\n🔗 Test the API:');
        console.log('1. Register: POST /api/user/register');
        console.log('2. Login: POST /api/user/login');
        console.log('3. Get crops: GET /api/crop/list');
        console.log('4. Chat: POST /api/ai/chat');

    } catch (error) {
        console.error('❌ Database seeding failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run seeder if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
