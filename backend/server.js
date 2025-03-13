require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Location = require('./models/Location'); // Import the Location model

const app = express(); // ✅ FIX: Define app before using it
app.use(express.json()); // Enable JSON parsing
app.use(cors()); // Enable CORS for frontend communication

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('🔥 MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// ✅ Store Location Data (POST Request)
app.post('/locations', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  try {
    const newLocation = new Location({ latitude, longitude });
    await newLocation.save();
    res.json({ message: '📍 Location saved!', location: newLocation });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error });
  }
});

// ✅ Fetch All Locations (GET Request)
app.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error });
  }
});

// ✅ Test API Route
app.get('/', (req, res) => {
  res.send('✅ API is working with MongoDB!');
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
