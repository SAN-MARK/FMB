import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { RoleSelectionScreen } from './screens/RoleSelectionScreen';
import { ReportFoundScreen } from './screens/ReportFoundScreen';
import { DropOffHubScreen } from './screens/DropOffHubScreen';
import { TagGeneratedScreen } from './screens/TagGeneratedScreen';
import { ItemReceivedScreen } from './screens/ItemReceivedScreen';
import { SearchLostScreen } from './screens/SearchLostScreen';
import { ActiveCasesScreen } from './screens/ActiveCasesScreen';
import { HubOperatorScreen } from './screens/HubOperatorScreen';
import { AuthModal } from './components/common/AuthModal';

const AppContent: React.FC = () => {
  const { currentScreen, errorMessage, successNotification, dismissError, clearNotification } = useApp();

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-start antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Global Notifications Toast */}
      {successNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-tertiary-container text-on-tertiary px-4 py-2.5 rounded-full text-xs font-label-bold shadow-lg flex items-center gap-2 animate-bounce-short">
          <span className="material-symbols-outlined text-base filled text-tertiary-fixed">
            check_circle
          </span>
          <span>{successNotification}</span>
          <button onClick={clearNotification} className="ml-1 opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-error text-on-error px-4 py-2.5 rounded-full text-xs font-label-bold shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{errorMessage}</span>
          <button onClick={dismissError} className="ml-1 opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Screen Router */}
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'role-selection' && <RoleSelectionScreen />}
      {currentScreen === 'report-found' && <ReportFoundScreen />}
      {currentScreen === 'drop-off' && <DropOffHubScreen />}
      {currentScreen === 'tag-generated' && <TagGeneratedScreen />}
      {currentScreen === 'item-received' && <ItemReceivedScreen />}
      {currentScreen === 'search-lost' && <SearchLostScreen />}
      {currentScreen === 'active-cases' && <ActiveCasesScreen />}
      {currentScreen === 'hub-console' && <HubOperatorScreen />}

      {/* Authentication & Persona Dialog */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
