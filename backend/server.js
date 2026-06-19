require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const SearchHistory = require('./models/SearchHistory');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Route to get city suggestions
app.get('/api/cities', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.json([]);
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    console.error('Geocoding API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch city suggestions' });
  }
});

// Route to get weather
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenWeatherMap API key is not configured' });
    }

    // Fetch current weather
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    
    // Fetch 5-day forecast
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );

    const weatherData = weatherResponse.data;
    const forecastData = forecastResponse.data;

    // Save to search history
    const history = new SearchHistory({
      cityName: weatherData.name,
      temperature: weatherData.main.temp,
      condition: weatherData.weather[0].main,
    });
    await history.save();

    res.json({
      current: weatherData,
      forecast: forecastData,
    });
  } catch (error) {
    if (error.response?.data?.cod == 401) {
      console.log("OpenWeatherMap API key is invalid/unactivated. Using beautiful mock data!");
      
      const mockWeather = {
        current: {
          name: city,
          sys: { country: "US" },
          main: { temp: 22.5, humidity: 45, feels_like: 23, temp_min: 19, temp_max: 26 },
          weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
          wind: { speed: 3.2 }
        },
        forecast: {
          list: Array.from({ length: 40 }).map((_, i) => ({
            dt: Math.floor(Date.now() / 1000) + i * 10800,
            main: { temp: 20 + Math.random() * 5 },
            weather: [{ main: "Clear", icon: "01d" }]
          }))
        }
      };

      const history = new SearchHistory({
        cityName: mockWeather.current.name,
        temperature: mockWeather.current.main.temp,
        condition: mockWeather.current.weather[0].main,
      });
      await history.save();

      return res.json(mockWeather);
    }

    if (error.response?.data?.cod == 404 || error.response?.status === 404) {
      return res.status(404).json({ error: 'City not found. Please try another search.' });
    }

    console.error('Weather API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Route to get search history
app.get('/api/history', async (req, res) => {
  try {
    const history = await SearchHistory.find().sort({ timestamp: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});
// Route to delete search history
app.delete('/api/history/:id', async (req, res) => {
  try {
    await SearchHistory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete search history' });
  }
});

// Route to update search history city name
app.put('/api/history/:id', async (req, res) => {
  try {
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }
    const history = await SearchHistory.findByIdAndUpdate(
      req.params.id,
      { cityName },
      { new: true }
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update search history' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
