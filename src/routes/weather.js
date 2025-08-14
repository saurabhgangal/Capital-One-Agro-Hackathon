const express = require('express');
const router = express.Router();

// IMD Weather API Integration
router.post('/imd', async (req, res) => {
    try {
        const { location, apiType } = req.body;
        
        if (!location) {
            return res.status(400).json({
                success: false,
                error: 'Location is required'
            });
        }
        
        console.log(`🌤️ IMD Weather API request for: ${location}`);
        
        // TODO: Replace with actual IMD MAUSAM API integration
        // You'll need to get API key from: https://directory.apisetu.gov.in/api-collection/mausam
        
        // For now, return mock data structure
        const mockWeatherData = {
            temperature: Math.round(20 + Math.random() * 20), // 20-40°C
            humidity: Math.round(40 + Math.random() * 40), // 40-80%
            windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
            conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
            forecast: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                temperature: Math.round(18 + Math.random() * 25),
                condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Thunderstorm'][Math.floor(Math.random() * 5)]
            }))
        };
        
        console.log('✅ Mock IMD weather data generated');
        
        res.json({
            success: true,
            weatherData: mockWeatherData,
            source: 'IMD MAUSAM API (Mock)',
            location: location,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('IMD Weather API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch IMD weather data',
            details: error.message
        });
    }
});

// Get weather data by location
router.get('/:location', async (req, res) => {
    try {
        const { location } = req.params;
        
        console.log(`🌤️ Weather data request for: ${location}`);
        
        // TODO: Implement actual IMD API call here
        // const imdResponse = await fetch(`https://api.imd.gov.in/weather/${location}`, {
        //     headers: { 'Authorization': `Bearer ${process.env.IMD_API_KEY}` }
        // });
        
        res.json({
            success: true,
            message: `Weather data for ${location} (IMD integration pending)`,
            location: location
        });
        
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch weather data'
        });
    }
});

module.exports = router;
