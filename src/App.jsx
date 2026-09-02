import { useState } from 'react';
import { usePlaces } from './hooks/usePlaces';
import { useFilters } from './hooks/useFilters';
import { useAuth } from './hooks/useAuth';
import MapView from './components/MapView';
import PlaceDetailPanel from './components/PlaceDetailPanel';
import TopBar from './components/TopBar';
import FilterPanel from './components/FilterPanel';
import EboardControls from './components/EboardControls';
import LoginModal from './components/LoginModal';

export default function App() {
  const { places, loading, error, reload } = usePlaces();
  const filters = useFilters(places);
  const { currentUser, login, logout } = useAuth();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

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

      <EboardControls
        currentUser={currentUser}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenAccountSettings={() => console.log('TODO: account settings modal')}
        onOpenMyRecs={() => console.log('TODO: my recs modal')}
        onLogout={logout}
        onOpenAddPlace={() => console.log('TODO: add/edit place modal')}
      />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} />
    </>
  );
}
