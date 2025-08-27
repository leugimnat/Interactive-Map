# Interactive Map

A responsive interactive map built with Google Maps API, using HTML, CSS, and JavaScript. This map leverages Google's extensive location database instead of requiring static location data.

## Features
- **Geographic location search** - Search for cities, states, countries, and regions
- **Real-time place search** using Google Places API
- **Intelligent search detection** - Automatically detects location vs. place searches
- **Dynamic markers** with category-based styling (color + emoji)
- **Rich info windows** with photos, ratings, and place details
- **Live search** with debouncing for better performance
- **Category filtering** (parks, museums, restaurants, landmarks, etc.)
- **Adaptive zoom levels** based on location type (country, state, city)
- **Responsive UI** with overlay controls
- **Dark theme** optimized for the map interface

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure the API Key
1. Open `assets/js/app.js`
2. Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key:
   ```javascript
   const GOOGLE_MAPS_API_KEY = 'your-actual-api-key-here';
   ```

### 3. Run Locally
Since this uses Google Maps API, you need to serve it from a web server (not just open the HTML file directly).

#### Option 1: Python Server
```bash
# Python 3
python -m http.server 8080
# Then open http://localhost:8080/
```

#### Option 2: Node.js Server
```bash
npx serve .
# Or install globally: npm install -g serve
```

#### Option 3: XAMPP/WAMP
Place this folder under `htdocs` and access via `http://localhost/Interactive-Map/`

## How to Use

### Location Search
1. **Search for places**: Type specific business names like "Starbucks", "McDonald's"
2. **Search by category**: Type categories like "restaurants", "hotels", "museums"
3. **Search locations**: Type cities, states, or countries like:
   - "New York" or "New York, NY"
   - "California" or "CA"
   - "Paris, France"
   - "Tokyo, Japan"
   - "London, UK"

### Navigation
1. **Filter**: Use the category dropdown to filter results by type
2. **Explore**: Click on markers to see detailed information with photos and ratings
3. **Navigate**: Click "View" in search results to focus on specific places
4. **Zoom**: The map automatically adjusts zoom based on search type (country, state, city)

## Customization

### Modify Categories
Edit the `categoryStyle` object in `assets/js/app.js` to add or modify categories:

```javascript
const categoryStyle = {
  park: { color: '#22c55e', emoji: '🌳', types: ['park'] },
  museum: { color: '#f59e0b', emoji: '🖼️', types: ['museum'] },
  // Add your own categories...
};
```

### Change Default Location
Modify the map center in the `initMap()` function:

```javascript
center: { lat: 40.7589, lng: -73.9851 }, // Change to your preferred location
```

### Styling
- Edit `assets/css/styles.css` to customize the appearance
- The dark theme can be modified by changing CSS custom properties in `:root`

## API Usage & Costs

This application uses Google Maps API which has usage limits and costs:
- **Free tier**: $200 credit per month
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests

For development and small-scale use, the free tier is usually sufficient.

## Credits
- **Maps**: Google Maps Platform
- **Places Data**: Google Places API
- **Icons**: Custom SVG markers with emoji
