import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { catConfig } from '../lib/catConfig';

const CARTO_KEY = import.meta.env.VITE_CARTO_KEY;

// Falls back to plain OpenStreetMap tiles (no key needed) if VITE_CARTO_KEY isn't set.
const TILE_URL = CARTO_KEY
  ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function MapView({ places, onSelectPlace }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Init the map once on mount.
  useEffect(() => {
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      [40.73, -73.99],
      13
    );

    L.tileLayer(TILE_URL, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers whenever places changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const cfg = catConfig[place.category];
      if (!cfg) return;

      const icon = L.divIcon({
        className: '',
        html: `<div class="emoji-marker" title="${place.name}">${cfg.emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([place.lat, place.lng], { icon });

      marker.bindPopup(
        `<div class="popup-inner">
          <strong>${place.name}</strong>
          <span>${cfg.label} · ${place.cuisine}</span>
        </div>`,
        { closeButton: false, minWidth: 100 }
      );

      marker.on('click', () => onSelectPlace?.(place));
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [places, onSelectPlace]);

  return <div id="map" ref={containerRef} style={{ flex: 1, zIndex: 1 }} />;
}
