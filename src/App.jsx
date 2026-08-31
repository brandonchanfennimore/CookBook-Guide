import { useState } from 'react';
import { usePlaces } from './hooks/usePlaces';
import { useFilters } from './hooks/useFilters';
import MapView from './components/MapView';
import PlaceDetailPanel from './components/PlaceDetailPanel';
import TopBar from './components/TopBar';
import FilterPanel from './components/FilterPanel';

export default function App() {
  const { places, loading, error } = usePlaces();
  const filters = useFilters(places);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  return (
    <>
      <TopBar
        filters={filters}
        filterPanelOpen={filterPanelOpen}
        onToggleFilterPanel={() => setFilterPanelOpen((o) => !o)}
      />

      <div className="main">
        {loading && <div className="status-banner">Loading places…</div>}
        {error && <div className="status-banner status-error">Error: {error}</div>}

        <FilterPanel
          open={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
          filters={filters}
          places={places}
        />

        <MapView places={filters.filteredPlaces} onSelectPlace={setSelectedPlace} />

        <PlaceDetailPanel place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      </div>
    </>
  );
}
