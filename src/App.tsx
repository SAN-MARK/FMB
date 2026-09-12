import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { MyClaimsAndReports } from './components/MyClaimsAndReports';
import { ReportItem } from './components/ReportItem';
import { SearchItems } from './components/SearchItems';
import { AdminPanel } from './components/AdminPanel';

const AppContent: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthenticated = !!user || !!userProfile;

  // Render active view with route protection
  const renderView = () => {
    if (currentTab === 'login' || !isAuthenticated) {
      return (
        <Login
          onSuccess={() => {
            setCurrentTab('dashboard');
          }}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <ProtectedRoute>
            <Dashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'claims_reports':
        return (
          <ProtectedRoute>
            <MyClaimsAndReports onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'report-item':
        return (
          <ProtectedRoute>
            <ReportItem
              onNavigate={handleNavigate}
              onSuccess={() => {
                handleNavigate('claims_reports');
              }}
            />
          </ProtectedRoute>
        );

      case 'search':
        return (
          <ProtectedRoute>
            <SearchItems onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'admin':
        return (
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        );

      default:
        return (
          <ProtectedRoute>
            <Dashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F1ECE2] text-[#1B1B1B] flex flex-col antialiased selection:bg-[#1B1B1B] selection:text-[#F1ECE2]">
      {/* Top Navbar: Only shown when logged in or when viewing an app view */}
      {isAuthenticated && (
        <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
      )}

      {/* Main View Area */}
      <main className="flex-1 bg-[#F1ECE2]">
        {renderView()}
      </main>

      {/* Persistent Bottom Status Bar for INNOVARA '26 Pitch (Editorial Monochrome) */}
      {isAuthenticated && (
        <footer className="py-2.5 px-4 bg-[#E8E1D3] border-t border-[#1B1B1B] text-center text-[11px] font-mono text-[#1B1B1B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4B5D3A]" />
            <span className="text-[#1B1B1B] tracking-wider uppercase">
              FIRESTORE CUSTODY LEDGER : ACTIVE (CHENNAI GRID)
            </span>
          </div>
          <div className="text-[#1B1B1B] font-bold tracking-widest uppercase">
            [ INNOVARA '26 · PITCH DEPLOYMENT · SEP 19 ]
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
