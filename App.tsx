import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { AddMusicPage } from './pages/AddMusicPage';
import { SettingsPage } from './pages/SettingsPage';
import { MiniPlayer } from './components/Layout/MiniPlayer';

import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen doodle-bg text-neutral-200 selection:bg-green-900 selection:text-green-100 relative">
            <div className="paper-texture"></div>
            <div className="vignette"></div>
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<LibraryPage />} />
                <Route path="/deck" element={<HomePage />} />
                <Route path="/library" element={<Navigate to="/" replace />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="/add" element={<AddMusicPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Redirects/Fallbacks */}
                <Route path="/now-playing" element={<Navigate to="/deck" replace />} />
                <Route path="/account" element={<Navigate to="/settings" replace />} />
              </Routes>

              {/* Conditionally render MiniPlayer only if NOT on /deck */}
              <MiniPlayerWrapper />
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </PlayerProvider>
  );
};

// Helper component to use hooks inside Router
const MiniPlayerWrapper: React.FC = () => {
  const location = useLocation();
  // Don't show mini player on deck page as it has its own controls
  if (location.pathname === '/deck') return null;
  return <MiniPlayer />;
};

export default App;