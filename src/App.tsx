import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { AuthScreen } from './screens/AuthScreen';
import { RoleSelectionScreen } from './screens/RoleSelectionScreen';
import { ReportFoundScreen } from './screens/ReportFoundScreen';
import { DropOffHubScreen } from './screens/DropOffHubScreen';
import { TagGeneratedScreen } from './screens/TagGeneratedScreen';
import { ItemReceivedScreen } from './screens/ItemReceivedScreen';
import { SearchLostScreen } from './screens/SearchLostScreen';
import { ActiveCasesScreen } from './screens/ActiveCasesScreen';
import { HubOperatorScreen } from './screens/HubOperatorScreen';
import { ProofOfOwnershipScreen } from './screens/ProofOfOwnershipScreen';
import { DesignSystemScreen } from './screens/DesignSystemScreen';
import { AuthModal } from './components/common/AuthModal';

const AppContent: React.FC = () => {
  const { 
    currentScreen, 
    user, 
    isAuthInitialized, 
    errorMessage, 
    successNotification, 
    dismissError, 
    clearNotification,
    navigateTo
  } = useApp();

  // If auth is not yet initialized from Supabase storage/session, show subtle loader
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">
          Initializing FindBack...
        </p>
      </div>
    );
  }

  // Determine active view: If unauthenticated and not splash, gate into AuthScreen
  const renderScreen = () => {
    if (!user && currentScreen !== 'splash') {
      return <AuthScreen />;
    }

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'role-selection':
        return <RoleSelectionScreen />;
      case 'report-found':
        return <ReportFoundScreen />;
      case 'drop-off':
        return <DropOffHubScreen />;
      case 'tag-generated':
        return <TagGeneratedScreen />;
      case 'item-received':
        return <ItemReceivedScreen />;
      case 'search-lost':
        return <SearchLostScreen />;
      case 'proof-of-ownership':
        return <ProofOfOwnershipScreen />;
      case 'design-system':
        return <DesignSystemScreen />;
      case 'active-cases':
        return <ActiveCasesScreen />;
      case 'hub-console':
        return <HubOperatorScreen />;
      default:
        return <RoleSelectionScreen />;
    }
  };

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
      {renderScreen()}

      {/* Quick Access Floating Pill for Design System & Hub Console */}
      <div className="fixed bottom-3 right-3 z-40 hidden md:flex items-center gap-2 bg-[#2B1810]/90 backdrop-blur-xs p-1.5 rounded-full border border-[#E8D5B7]/40 shadow-xl text-[11px] font-jakarta">
        <button
          type="button"
          onClick={() => navigateTo('design-system')}
          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
            currentScreen === 'design-system'
              ? 'bg-[#C8541A] text-white font-bold'
              : 'text-[#E8D5B7] hover:text-white'
          }`}
        >
          🎨 Design System
        </button>
        <button
          type="button"
          onClick={() => navigateTo('hub-console')}
          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
            currentScreen === 'hub-console'
              ? 'bg-[#1A3A5C] text-white font-bold'
              : 'text-[#E8D5B7] hover:text-white'
          }`}
        >
          🏢 Hub Console
        </button>
      </div>

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
