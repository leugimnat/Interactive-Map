# Interactive Map

A responsive interactive map built with Leaflet, using HTML, CSS, and JavaScript.

## Features
- Customizable markers (color + emoji per category)
- Popups with name, description, and image
- Search by name/description/category
- Category filter dropdown
- Centers/zooms to results and opens the marker
- Responsive UI with overlay controls

## Run locally
If you already use XAMPP, this folder under `htdocs` can be served at a URL like `http://localhost/Interactive-Map/`.

Alternatively, use a simple static server.

### Windows PowerShell (optional)
```
# Python 3
python -m http.server 8080
# Then open http://localhost:8080/
```

## Customize data
Edit `assets/js/app.js` and modify the `places` array: add your own name, description, lat/lng, category, and image URL.

## Credits
- Map tiles: © OpenStreetMap contributors
- Map library: Leaflet
