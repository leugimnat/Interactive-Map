/**
 * Interactive Map Application - Refactored Single File
 * All modules combined for compatibility
 */
(function() {
'use strict';

// Configuration
const CONFIG = {
  GOOGLE_MAPS_API_KEY: 'AIzaSyDRkFvtsNt7QLdSBRTNf9yY_0wRKG8zp-M',

  MAP: {
    DEFAULT_CENTER: { lat: 40.7589, lng: -73.9851 },
    DEFAULT_ZOOM: 12,
    MIN_FOCUS_ZOOM: 16,
    SEARCH_RADIUS: 50000,
    MAX_RESULTS: 20
  },

  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 500
  },

  MAP_STYLES: [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#1a1f2e"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#0a0f1d"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#2a2f3b"}]
    }
  ],

  CATEGORIES: {
    park: {
      color: '#22c55e',
      emoji: '🌳',
      types: ['park'],
      label: 'Parks'
    },
    museum: {
      color: '#f59e0b',
      emoji: '🖼️',
      types: ['museum'],
      label: 'Museums'
    },
    restaurant: {
      color: '#ef4444',
      emoji: '🍕',
      types: ['restaurant', 'food'],
      label: 'Restaurants'
    },
    landmark: {
      color: '#3b82f6',
      emoji: '📍',
      types: ['tourist_attraction', 'point_of_interest'],
      label: 'Landmarks'
    },
    shopping: {
      color: '#8b5cf6',
      emoji: '🛍️',
      types: ['shopping_mall', 'store'],
      label: 'Shopping'
    },
    lodging: {
      color: '#06b6d4',
      emoji: '🏨',
      types: ['lodging'],
      label: 'Hotels'
    }
  },

  MARKER: {
    FILL_OPACITY: 0.8,
    STROKE_COLOR: '#ffffff',
    STROKE_WEIGHT: 2,
    SCALE: 12
  },

  INFO_WINDOW: {
    PHOTO_MAX_WIDTH: 200,
    PHOTO_MAX_HEIGHT: 150,
    PLACEHOLDER_IMAGE: 'https://via.placeholder.com/200x150?text=No+Image'
  },

  DOM_IDS: {
    MAP: 'map',
    SEARCH_FORM: 'searchForm',
    SEARCH_INPUT: 'searchInput',
    CATEGORY_FILTER: 'categoryFilter',
    RESULTS: 'results',
    RESULTS_LIST: 'resultsList',
    CLEAR_BTN: 'clearBtn',
    RESULTS_COUNT: 'resultsCount',
    LOADING_OVERLAY: 'loadingOverlay',
    ERROR_OVERLAY: 'errorOverlay'
  }
};

function validateConfig() {
  if (CONFIG.GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Google Maps API key not configured');
  }
  return true;
}

// Map Service Class
class MapService {
  constructor() {
    this.map = null;
    this.infoWindow = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.map = new google.maps.Map(document.getElementById(CONFIG.DOM_IDS.MAP), {
        zoom: CONFIG.MAP.DEFAULT_ZOOM,
        center: CONFIG.MAP.DEFAULT_CENTER,
        styles: CONFIG.MAP_STYLES,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      this.infoWindow = new google.maps.InfoWindow({
        maxWidth: 350,
        pixelOffset: new google.maps.Size(0, -10),
        disableAutoPan: false
      });
      this.isInitialized = true;
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Failed to initialize map:', error);
      throw error;
    }
  }

  getMap() { return this.map; }
  getInfoWindow() { return this.infoWindow; }
  setCenter(location) { if (this.map) this.map.setCenter(location); }
  setZoom(zoom) { if (this.map) this.map.setZoom(zoom); }

  panTo(location, zoom = null) {
    if (this.map) {
      this.map.panTo(location);
      if (zoom !== null) {
        this.map.setZoom(Math.max(this.map.getZoom(), zoom));
      }
    }
  }

  getCenter() {
    if (this.map) {
      const center = this.map.getCenter();
      return { lat: center.lat(), lng: center.lng() };
    }
    return null;
  }

  closeInfoWindow() { if (this.infoWindow) this.infoWindow.close(); }
  isReady() { return this.isInitialized && this.map !== null; }
}

// Places Service Class
class PlacesService {
  constructor(map) {
    this.map = map;
    this.placesService = null;
    this.geocoder = null;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized || !this.map) return;
    try {
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.geocoder = new google.maps.Geocoder();
      this.isInitialized = true;
      console.log('Places service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Places service:', error);
      throw error;
    }
  }

  async searchPlaces(query, category = 'all', location = null) {
    if (!this.isInitialized) throw new Error('Places service not initialized');

    const searchLocation = location || this.map.getCenter();
    const request = {
      location: searchLocation,
      radius: CONFIG.MAP.SEARCH_RADIUS,
      keyword: query
    };

    if (category !== 'all' && CONFIG.CATEGORIES[category]) {
      request.type = CONFIG.CATEGORIES[category].types[0];
    }

    return new Promise((resolve) => {
      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results.slice(0, CONFIG.MAP.MAX_RESULTS));
        } else {
          console.warn('Places search failed:', status);
          resolve([]);
        }
      });
    });
  }

  async geocodeLocation(query) {
    if (!this.isInitialized) throw new Error('Places service not initialized');

    return new Promise((resolve) => {
      this.geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results.length > 0) {
          resolve(results[0]);
        } else {
          console.warn('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  async searchLocationAndPlaces(query, category = 'all') {
    // First try to geocode the location
    const locationResult = await this.geocodeLocation(query);

    if (locationResult) {
      // If we found a location, search for places there
      const location = locationResult.geometry.location;
      return {
        location: locationResult,
        places: await this.searchPlaces('', category, location)
      };
    } else {
      // If no location found, do a regular places search
      return {
        location: null,
        places: await this.searchPlaces(query, category)
      };
    }
  }

  isLocationQuery(query) {
    // Check if query looks like a location (city, state, country)
    const locationKeywords = [
      'city', 'state', 'country', 'province', 'region', 'county', 'district',
      'town', 'village', 'municipality', 'territory', 'area'
    ];

    const queryLower = query.toLowerCase();

    // Check for common location patterns
    const hasLocationKeyword = locationKeywords.some(keyword => queryLower.includes(keyword));
    const hasComma = query.includes(','); // "Paris, France" or "Austin, TX"
    const isShortQuery = query.split(' ').length <= 3; // Short queries are often locations
    const hasStateAbbreviation = /\b[A-Z]{2}\b/.test(query); // "CA", "NY", etc.

    return hasLocationKeyword || hasComma || (isShortQuery && query.length > 3) || hasStateAbbreviation;
  }

  isValidQuery(query) {
    return query && typeof query === 'string' && query.trim().length >= CONFIG.SEARCH.MIN_QUERY_LENGTH;
  }
}

// Marker Manager Class
class MarkerManager {
  constructor(map, infoWindow) {
    this.map = map;
    this.infoWindow = infoWindow;
    this.markers = [];
  }

  getCategoryFromTypes(types) {
    for (const [category, config] of Object.entries(CONFIG.CATEGORIES)) {
      if (config.types.some(type => types.includes(type))) {
        return category;
      }
    }
    return 'landmark';
  }

  createMarkerIcon(category) {
    const style = CONFIG.CATEGORIES[category] || CONFIG.CATEGORIES.landmark;
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: style.color,
      fillOpacity: CONFIG.MARKER.FILL_OPACITY,
      strokeColor: CONFIG.MARKER.STROKE_COLOR,
      strokeWeight: CONFIG.MARKER.STROKE_WEIGHT,
      scale: CONFIG.MARKER.SCALE
    };
  }

  createInfoWindowContent(place, style) {
    const photoUrl = place.photos && place.photos[0]
      ? place.photos[0].getUrl({
          maxWidth: 300,
          maxHeight: 200
        })
      : CONFIG.INFO_WINDOW.PLACEHOLDER_IMAGE;

    const rating = place.rating ? `⭐ ${place.rating}` : '';
    const priceLevel = place.price_level ? '💰'.repeat(place.price_level) : '';
    const categoryLabel = style.types[0].replace('_', ' ');

    // Create rating and price section
    const ratingPriceSection = (rating || priceLevel) ?
      `<div class="rating-price">${rating} ${priceLevel}</div>` : '';

    return `
      <div class="popup">
        <img src="${photoUrl}" alt="${place.name}" loading="lazy" />
        <div>
          <h3>${place.name}</h3>
          <p>${place.vicinity || place.formatted_address || ''}</p>
          ${ratingPriceSection}
          <span class="chip" style="background:${style.color}">
            ${style.emoji} ${categoryLabel}
          </span>
        </div>
      </div>`;
  }

  addMarkersToMap(places) {
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place, index) => {
      const category = this.getCategoryFromTypes(place.types);
      const style = CONFIG.CATEGORIES[category] || CONFIG.CATEGORIES.landmark;

      const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: this.map,
        title: place.name,
        icon: this.createMarkerIcon(category),
        animation: google.maps.Animation.DROP
      });

      const infoContent = this.createInfoWindowContent(place, style);

      marker.addListener('click', () => {
        this.infoWindow.setContent(infoContent);
        this.infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
      bounds.extend(place.geometry.location);
    });

    if (places.length > 0) {
      this.map.fitBounds(bounds);
    }
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  getMarker(index) { return this.markers[index] || null; }

  triggerMarkerClick(index) {
    const marker = this.getMarker(index);
    if (marker) {
      google.maps.event.trigger(marker, 'click');
    }
  }
}

// UI Controller Class
class UIController {
  constructor() {
    this.elements = {};
    this.searchTimeout = null;
    this.initializeElements();
  }

  initializeElements() {
    this.elements = {
      searchForm: document.getElementById(CONFIG.DOM_IDS.SEARCH_FORM),
      searchInput: document.getElementById(CONFIG.DOM_IDS.SEARCH_INPUT),
      categoryFilter: document.getElementById(CONFIG.DOM_IDS.CATEGORY_FILTER),
      results: document.getElementById(CONFIG.DOM_IDS.RESULTS),
      resultsList: document.getElementById(CONFIG.DOM_IDS.RESULTS_LIST),
      clearBtn: document.getElementById(CONFIG.DOM_IDS.CLEAR_BTN)
    };
  }

  populateCategoryFilter() {
    if (!this.elements.categoryFilter) return;
    this.elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    Object.entries(CONFIG.CATEGORIES).forEach(([key, category]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = category.label;
      this.elements.categoryFilter.appendChild(option);
    });
  }

  displaySearchResults(places, onPlaceClick, locationInfo = null) {
    if (!this.elements.resultsList) return;
    this.elements.resultsList.innerHTML = '';

    // Update results count
    this.updateResultsCount(places.length);

    // If we have location info, show it first
    if (locationInfo) {
      const locationItem = this.createLocationInfoItem(locationInfo);
      this.elements.resultsList.appendChild(locationItem);
    }

    if (!places.length) {
      if (!locationInfo) {
        this.displayNoResults();
        return;
      }
      // If we have location but no places, show a message
      const noPlacesItem = document.createElement('li');
      noPlacesItem.innerHTML = '<span class="muted">No specific places found in this area. Try searching for a category like "restaurants" or "museums".</span>';
      this.elements.resultsList.appendChild(noPlacesItem);
      this.showResults();
      return;
    }

    places.forEach((place, index) => {
      const category = this.getCategoryFromTypes(place.types);
      const style = CONFIG.CATEGORIES[category] || CONFIG.CATEGORIES.landmark;

      const li = document.createElement('li');
      li.innerHTML = `
        <span>${style.emoji}</span>
        <div>
          <div>${place.name}</div>
          <div class="muted">${place.vicinity || ''}</div>
        </div>
        <button type="button" aria-label="Show ${place.name} on map">View</button>`;

      const button = li.querySelector('button');
      const clickHandler = () => onPlaceClick(place, index);

      button.addEventListener('click', clickHandler);
      li.addEventListener('click', clickHandler);

      this.elements.resultsList.appendChild(li);
    });

    this.showResults();
  }

  updateResultsCount(count) {
    const resultsCount = document.getElementById(CONFIG.DOM_IDS.RESULTS_COUNT);
    if (resultsCount) {
      resultsCount.textContent = count === 1 ? '1 result' : `${count} results`;
    }
  }

  createLocationInfoItem(locationInfo) {
    const li = document.createElement('li');
    li.style.backgroundColor = 'rgba(92, 200, 255, 0.1)';
    li.style.borderLeft = '3px solid #5cc8ff';
    li.style.marginBottom = '8px';

    const locationName = locationInfo.formatted_address || locationInfo.name;
    const locationType = this.getLocationTypeLabel(locationInfo.types);

    li.innerHTML = `
      <span>📍</span>
      <div>
        <div style="font-weight: 600;">${locationName}</div>
        <div class="muted">${locationType}</div>
      </div>
      <span style="color: #5cc8ff; font-size: 12px;">Location Found</span>`;

    return li;
  }

  getLocationTypeLabel(types) {
    if (types.includes('country')) return 'Country';
    if (types.includes('administrative_area_level_1')) return 'State/Province';
    if (types.includes('administrative_area_level_2')) return 'County/Region';
    if (types.includes('locality')) return 'City';
    if (types.includes('sublocality')) return 'District';
    if (types.includes('neighborhood')) return 'Neighborhood';
    return 'Location';
  }

  displayLocationFound(locationInfo, category) {
    if (!this.elements.resultsList) return;
    this.elements.resultsList.innerHTML = '';

    const locationItem = this.createLocationInfoItem(locationInfo);
    this.elements.resultsList.appendChild(locationItem);

    const suggestionItem = document.createElement('li');
    suggestionItem.innerHTML = `
      <span>💡</span>
      <div>
        <div>Try searching for specific places</div>
        <div class="muted">Search for "restaurants", "hotels", "attractions", etc. in this area</div>
      </div>`;
    this.elements.resultsList.appendChild(suggestionItem);

    this.showResults();
  }

  displayNoResults() {
    if (!this.elements.resultsList) return;
    this.elements.resultsList.innerHTML = '<li><span class="muted">No places found</span></li>';
    this.showResults();
  }

  showResults() { if (this.elements.results) this.elements.results.hidden = false; }
  hideResults() { if (this.elements.results) this.elements.results.hidden = true; }

  clearSearch() {
    if (this.elements.searchInput) this.elements.searchInput.value = '';
    if (this.elements.categoryFilter) this.elements.categoryFilter.value = 'all';
    this.hideResults();
  }

  getSearchQuery() { return this.elements.searchInput ? this.elements.searchInput.value.trim() : ''; }
  getSelectedCategory() { return this.elements.categoryFilter ? this.elements.categoryFilter.value : 'all'; }

  setupEventListeners(callbacks) {
    const { onSearch, onCategoryChange, onClear, onLiveSearch } = callbacks;

    if (this.elements.searchForm && onSearch) {
      const searchHandler = (e) => {
        e.preventDefault();
        const query = this.getSearchQuery();
        const category = this.getSelectedCategory();
        if (query) onSearch(query, category);
      };
      this.elements.searchForm.addEventListener('submit', searchHandler);
    }

    if (this.elements.categoryFilter && onCategoryChange) {
      const categoryHandler = () => {
        const query = this.getSearchQuery();
        const category = this.getSelectedCategory();
        if (query) onCategoryChange(query, category);
      };
      this.elements.categoryFilter.addEventListener('change', categoryHandler);
    }

    if (this.elements.clearBtn && onClear) {
      const clearHandler = () => {
        this.clearSearch();
        onClear();
      };
      this.elements.clearBtn.addEventListener('click', clearHandler);
    }

    if (this.elements.searchInput && onLiveSearch) {
      const liveSearchHandler = () => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          const query = this.getSearchQuery();
          const category = this.getSelectedCategory();
          if (query.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
            onLiveSearch(query, category);
          }
        }, CONFIG.SEARCH.DEBOUNCE_DELAY);
      };
      this.elements.searchInput.addEventListener('input', liveSearchHandler);
    }
  }

  getCategoryFromTypes(types) {
    for (const [category, config] of Object.entries(CONFIG.CATEGORIES)) {
      if (config.types.some(type => types.includes(type))) {
        return category;
      }
    }
    return 'landmark';
  }

  showLoading() {
    if (this.elements.resultsList) {
      this.elements.resultsList.innerHTML = '<li><span class="muted">Searching...</span></li>';
      this.showResults();
    }
  }

  showError(message) {
    if (this.elements.resultsList) {
      this.elements.resultsList.innerHTML = `<li><span class="muted">Error: ${message}</span></li>`;
      this.showResults();
    }
  }
}

// Main Application Class
class InteractiveMapApp {
  constructor() {
    this.mapService = null;
    this.placesService = null;
    this.markerManager = null;
    this.uiController = null;
    this.searchResults = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      validateConfig();
      this.uiController = new UIController();
      this.uiController.populateCategoryFilter();
      await this.loadGoogleMapsAPI();
      await this.initializeServices();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('Interactive Map App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize the map application');
    }
  }

  async initializeServices() {
    this.mapService = new MapService();
    await this.mapService.initialize();
    this.placesService = new PlacesService(this.mapService.getMap());
    this.placesService.initialize();
    this.markerManager = new MarkerManager(
      this.mapService.getMap(),
      this.mapService.getInfoWindow()
    );
  }

  setupEventListeners() {
    this.uiController.setupEventListeners({
      onSearch: (query, category) => this.handleSearch(query, category),
      onCategoryChange: (query, category) => this.handleSearch(query, category),
      onClear: () => this.handleClear(),
      onLiveSearch: (query, category) => this.handleSearch(query, category)
    });
  }

  async handleSearch(query, category) {
    if (!this.placesService.isValidQuery(query)) return;

    try {
      this.uiController.showLoading();
      this.markerManager.clearMarkers();
      this.mapService.closeInfoWindow();

      let places = [];
      let locationInfo = null;

      // Check if this looks like a location search (city, state, country)
      if (this.placesService.isLocationQuery(query)) {
        const result = await this.placesService.searchLocationAndPlaces(query, category);
        places = result.places;
        locationInfo = result.location;

        // If we found a location, move the map there
        if (locationInfo) {
          const location = {
            lat: locationInfo.geometry.location.lat(),
            lng: locationInfo.geometry.location.lng()
          };
          this.mapService.setCenter(location);

          // Set appropriate zoom level based on location type
          const zoomLevel = this.getZoomLevelForLocationType(locationInfo);
          this.mapService.setZoom(zoomLevel);
        }
      } else {
        // Regular places search
        places = await this.placesService.searchPlaces(query, category);
      }

      this.searchResults = places;

      if (places.length > 0) {
        this.uiController.displaySearchResults(places, (place, index) => {
          this.focusPlace(place, index);
        }, locationInfo);
        this.markerManager.addMarkersToMap(places);
      } else {
        if (locationInfo) {
          this.uiController.displayLocationFound(locationInfo, category);
        } else {
          this.uiController.displayNoResults();
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      this.uiController.showError('Search failed. Please try again.');
    }
  }

  getZoomLevelForLocationType(locationInfo) {
    const types = locationInfo.types || [];

    if (types.includes('country') || types.includes('political')) {
      return 6; // Country level
    } else if (types.includes('administrative_area_level_1')) {
      return 8; // State/Province level
    } else if (types.includes('administrative_area_level_2')) {
      return 10; // County level
    } else if (types.includes('locality') || types.includes('sublocality')) {
      return 12; // City level
    } else if (types.includes('neighborhood')) {
      return 14; // Neighborhood level
    }

    return 10; // Default zoom
  }

  handleClear() {
    this.markerManager.clearMarkers();
    this.mapService.closeInfoWindow();
    this.searchResults = [];
  }

  focusPlace(place, markerIndex) {
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    this.mapService.panTo(location, CONFIG.MAP.MIN_FOCUS_ZOOM);

    setTimeout(() => {
      this.markerManager.triggerMarkerClick(markerIndex);
    }, 300);
  }

  showError(message) {
    const mapElement = document.getElementById(CONFIG.DOM_IDS.MAP);
    if (mapElement) {
      mapElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #0a0f1d; color: #e8ecf1; text-align: center; padding: 20px;">
          <div>
            <h2>Error</h2>
            <p>${message}</p>
          </div>
        </div>`;
    }
  }

  async loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
      if (CONFIG.GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
        this.showError(`
          <h2>Google Maps API Key Required</h2>
          <p>Please add your Google Maps API key to the configuration</p>
          <p>Get your API key at: <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" style="color: #5cc8ff;">Google Cloud Console</a></p>
        `);
        reject(new Error('API key not configured'));
        return;
      }

      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      window.initGoogleMaps = () => {
        delete window.initGoogleMaps;
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      document.head.appendChild(script);
    });
  }
}

// Create and initialize the application
const app = new InteractiveMapApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.initialize());
} else {
  app.initialize();
}

})(); // Close IIFE
