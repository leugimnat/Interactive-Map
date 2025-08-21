/* Interactive Map - Leaflet */
(function () {
  'use strict';

  // Sample data: name, description, lat, lng, category, image
  const places = [
    {
      id: 'central-park',
      name: 'Central Park',
      description: 'Iconic urban park in the heart of Manhattan.',
      lat: 40.7829,
      lng: -73.9654,
      category: 'Park',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60&auto=format&fit=crop'
    },
    {
      id: 'moma',
      name: 'Museum of Modern Art',
      description: 'World-class collection of modern and contemporary art.',
      lat: 40.7614,
      lng: -73.9776,
      category: 'Museum',
      image: 'https://images.unsplash.com/photo-1544207240-7194b3e76e6a?w=600&q=60&auto=format&fit=crop'
    },
    {
      id: 'joes-pizza',
      name: "Joe's Pizza",
      description: 'Famous NYC slice joint loved by locals and tourists.',
      lat: 40.7306,
      lng: -73.9995,
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1541745537413-b8048e8f1c36?w=600&q=60&auto=format&fit=crop'
    },
    {
      id: 'brooklyn-bridge',
      name: 'Brooklyn Bridge',
      description: 'Historic suspension bridge linking Manhattan and Brooklyn.',
      lat: 40.7061,
      lng: -73.9969,
      category: 'Landmark',
      image: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=600&q=60&auto=format&fit=crop'
    },
    {
      id: 'golden-gate',
      name: 'Golden Gate Bridge',
      description: 'San Francisco’s iconic red-orange suspension bridge.',
      lat: 37.8199,
      lng: -122.4783,
      category: 'Landmark',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=60&auto=format&fit=crop'
    },
    {
      id: 'hyde-park',
      name: 'Hyde Park',
      description: 'One of London’s largest Royal Parks.',
      lat: 51.507268,
      lng: -0.16573,
      category: 'Park',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60&auto=format&fit=crop'
    }
  ];

  // Category styles
  const categoryStyle = {
    Park:   { color: '#22c55e', emoji: '🌳' },
    Museum: { color: '#f59e0b', emoji: '🖼️' },
    Food:   { color: '#ef4444', emoji: '🍕' },
    Landmark: { color: '#3b82f6', emoji: '📍' }
  };

  // Build category list
  const categories = Array.from(new Set(places.map(p => p.category)));

  // DOM elements
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const results = document.getElementById('results');
  const resultsList = document.getElementById('resultsList');
  const clearBtn = document.getElementById('clearBtn');

  // Populate category filter
  for (const c of categories) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  }

  // Utilities
  const normalize = s => (s || '').toString().toLowerCase().trim();
  const matches = (place, query, category) => {
    const q = normalize(query);
    const inCat = category === 'all' || place.category === category;
    if (!q) return inCat;
    return inCat && (
      normalize(place.name).includes(q) ||
      normalize(place.description).includes(q) ||
      normalize(place.category).includes(q)
    );
  };

  // Create a custom SVG icon as data URI
  function makeIcon(color, emoji) {
    const svg = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      <defs>
        <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <g filter="url(#s)">
        <circle cx="21" cy="21" r="12" fill="${color}" />
        <text x="21" y="24" text-anchor="middle" font-size="14">${emoji}</text>
      </g>
    </svg>`;
    const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    return L.icon({ iconUrl: url, iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -18] });
  }

  // Map init
  const map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true,
    worldCopyJump: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markersLayer = L.layerGroup().addTo(map);

  // Create markers
  const markerById = new Map();
  const latlngs = [];

  places.forEach(place => {
    const style = categoryStyle[place.category] || { color: '#8b5cf6', emoji: '⭐' };
    const marker = L.marker([place.lat, place.lng], { icon: makeIcon(style.color, style.emoji) });

    const chipStyle = `background:${style.color}`;
    const popupHtml = `
      <div class="popup">
        <img src="${place.image}" alt="${place.name}" />
        <div>
          <h3>${place.name}</h3>
          <p>${place.description}</p>
          <span class="chip" style="${chipStyle}">${style.emoji} ${place.category}</span>
        </div>
      </div>`;

    marker.bindPopup(popupHtml, { closeButton: true, minWidth: 240 });
    marker.addTo(markersLayer);
    markerById.set(place.id, marker);
    latlngs.push([place.lat, place.lng]);
  });

  if (latlngs.length) {
    map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });
  } else {
    map.setView([0, 0], 2);
  }

  // Search
  function renderResults(list) {
    resultsList.innerHTML = '';
    if (!list.length) {
      const li = document.createElement('li');
      li.innerHTML = '<span class="muted">No matches found</span>';
      resultsList.appendChild(li);
      results.hidden = false;
      return;
    }

    list.forEach(p => {
      const li = document.createElement('li');
      const style = categoryStyle[p.category] || { color: '#8b5cf6', emoji: '⭐' };
      li.innerHTML = `
        <span>${style.emoji}</span>
        <div>
          <div>${p.name}</div>
          <div class="muted">${p.category}</div>
        </div>
        <button type="button" aria-label="Show on map">View</button>`;
      li.querySelector('button').addEventListener('click', () => focusPlace(p));
      li.addEventListener('click', () => focusPlace(p));
      resultsList.appendChild(li);
    });

    results.hidden = false;
  }

  function focusPlace(place) {
    const marker = markerById.get(place.id);
    if (!marker) return;
    const target = marker.getLatLng();
    map.flyTo(target, Math.max(map.getZoom(), 14), { duration: 0.6 });
    setTimeout(() => marker.openPopup(), 650);
  }

  function applyFilter() {
    const query = searchInput.value;
    const cat = categoryFilter.value;
    const filtered = places.filter(p => matches(p, query, cat));

    // Update marker visibility
    markersLayer.clearLayers();
    const visibleLatLngs = [];
    filtered.forEach(p => {
      const marker = markerById.get(p.id);
      if (marker) {
        marker.addTo(markersLayer);
        visibleLatLngs.push(marker.getLatLng());
      }
    });

    if (filtered.length === 1) {
      focusPlace(filtered[0]);
    } else if (visibleLatLngs.length) {
      map.fitBounds(L.latLngBounds(visibleLatLngs), { padding: [30, 30] });
    }

    renderResults(filtered);
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFilter();
  });

  categoryFilter.addEventListener('change', () => applyFilter());

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = 'all';
    results.hidden = true;
    // reset markers
    markersLayer.clearLayers();
    places.forEach(p => markerById.get(p.id)?.addTo(markersLayer));
    if (latlngs.length) map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });
  });

  // Optional: live search while typing (debounced)
  let t = 0;
  searchInput.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => applyFilter(), 200);
  });
})();
