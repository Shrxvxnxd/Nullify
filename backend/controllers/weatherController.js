const cities = require('../utils/cities');

// 5-minute in-memory cache
let cache = {
    data: null,
    timestamp: 0
};

async function getLiveTemperatures(req, res) {
    // Check cache (5 minutes = 300000ms)
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < 300000)) {
        return res.json({ success: true, temperatures: cache.data, cached: true });
    }

    try {
        // Construct multi-coordinate lists
        const lats = cities.map(c => c.lat).join(',');
        const lons = cities.map(c => c.lon).join(',');

        // Batch fetch from Open-Meteo (Single API Call for all 100 cities)
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            // Handle single city response structure if it happens, but normally it returns array for multi-coords
            const normalizedData = Array.isArray(data) ? data : [data];

            const weatherData = cities.map((city, index) => {
                const cityWeather = normalizedData[index];
                if (cityWeather && cityWeather.current_weather) {
                    return {
                        city: city.name,
                        latitude: city.lat,
                        longitude: city.lon,
                        temperature: Math.round(cityWeather.current_weather.temperature)
                    };
                }
                return null;
            }).filter(d => d !== null);

            if (weatherData.length === 0) throw new Error('Failed to parse Open-Meteo response');

            cache = { data: weatherData, timestamp: now };
            return res.json({ success: true, temperatures: weatherData, cached: false });
        }

        // Process array response
        const weatherData = cities.map((city, index) => {
            const cityWeather = data[index];
            if (cityWeather && cityWeather.current_weather) {
                return {
                    city: city.name,
                    latitude: city.lat,
                    longitude: city.lon,
                    temperature: Math.round(cityWeather.current_weather.temperature)
                };
            }
            return null;
        }).filter(d => d !== null);

        cache = { data: weatherData, timestamp: now };
        res.json({ success: true, temperatures: weatherData, cached: false });

    } catch (err) {
        console.error('[getLiveTemperatures 100-city error]', err);
        res.status(500).json({ success: false, error: 'Weather data temporarily unavailable' });
    }
}

module.exports = {
    getLiveTemperatures
};
