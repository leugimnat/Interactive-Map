// Configuration file for Google Maps API
// Copy this file to config.js and add your API key

const CONFIG = {
  // Get your API key from: https://developers.google.com/maps/documentation/javascript/get-api-key
  GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE',
  
  // Default map center (latitude, longitude)
  DEFAULT_CENTER: { lat: 40.7589, lng: -73.9851 }, // New York City
  
  // Default zoom level
  DEFAULT_ZOOM: 12,
  
  // Search radius in meters
  SEARCH_RADIUS: 50000 // 50km
};

// Make config available globally
window.CONFIG = CONFIG;
