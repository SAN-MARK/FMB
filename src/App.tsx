import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
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

      case 'report-item':
        return (
          <ProtectedRoute>
            <ReportItem
              onNavigate={handleNavigate}
              onSuccess={() => {
                // optionally navigate or celebrate
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
    <div className="min-h-screen bg-[#060612] text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar: Only shown when logged in or when viewing an app view */}
      {isAuthenticated && (
        <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Persistent Bottom Status Bar for INNOVARA '26 Pitch */}
      {isAuthenticated && (
        <footer className="py-2.5 px-4 bg-[#090b20]/90 border-t border-indigo-950 text-center text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Firebase Firestore: Connected (Live Real-time)</span>
          </div>
          <div className="text-cyan-400 font-bold">
            INNOVARA '26 · PITCH READY (SEP 19)
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
