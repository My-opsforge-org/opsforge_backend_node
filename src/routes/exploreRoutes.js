const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Simple in-memory cache for Nominatim responses (address -> { data, expiresAt })
const nominatimCache = new Map();
const NOMINATIM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedGeocode(address) {
  const cached = nominatimCache.get(address);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    nominatimCache.delete(address);
    return null;
  }
  return cached.data;
}

function setCachedGeocode(address, data) {
  nominatimCache.set(address, { data, expiresAt: Date.now() + NOMINATIM_CACHE_TTL_MS });
}

// Get coordinates from address
router.get('/geocode', verifyToken, async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({
        error: 'Address parameter is required'
      });
    }

    // Serve from cache if available
    const cached = getCachedGeocode(address);
    if (cached) {
      return res.json(cached);
    }

    // Use Nominatim for geocoding with compliant headers
    const baseUrl = 'https://nominatim.openstreetmap.org/search';
    const params = {
      format: 'json',
      q: address,
      limit: 1
    };

    if (process.env.NOMINATIM_EMAIL) {
      params.email = process.env.NOMINATIM_EMAIL;
    }

    const headers = {
      'User-Agent': process.env.NOMINATIM_USER_AGENT || 'GoTrippingBackend/1.0 (contact: set NOMINATIM_EMAIL)',
      'Referer': process.env.NOMINATIM_REFERER || 'http://localhost',
      'Accept-Language': 'en'
    };

    const response = await axios.get(baseUrl, { params, headers, timeout: 5000 });
    
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      const payload = {
        address: location.display_name,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon)
      };

      // Cache result
      setCachedGeocode(address, payload);

      return res.json(payload);
    }

    return res.status(404).json({
      error: 'Could not find coordinates for the given address'
    });
  } catch (error) {
    // If blocked by Nominatim or other error, give a helpful message
    if (error.response && error.response.status === 403) {
      return res.status(429).json({
        error: 'Geocoding temporarily blocked by provider due to usage policy. Please configure NOMINATIM_USER_AGENT and NOMINATIM_REFERER, and try again later.'
      });
    }
    console.error('Geocoding error:', error);
    return res.status(500).json({
      error: 'An error occurred while geocoding the address'
    });
  }
});

// Get nearby places
router.get('/places', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radius = '1500', type = 'tourist_attraction' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Google Places API key not configured'
      });
    }

    // Construct Google Places API URL
    const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const params = {
      location: `${lat},${lng}`,
      radius,
      type,
      key: apiKey
    };

    const response = await axios.get(placesUrl, { params });
    const data = response.data;

    if (response.status === 200 && data.status === 'OK') {
      return res.json(data);
    }
    return res.status(404).json({
      error: 'Could not fetch places',
      details: data.error_message || 'Unknown error'
    });
  } catch (error) {
    console.error('Places API error:', error);
    return res.status(500).json({
      error: 'An error occurred while fetching places',
      details: error.message
    });
  }
});

module.exports = router;



