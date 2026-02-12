import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/Store';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Tracking } from './components/Tracking';
import { Roadmap } from './components/Roadmap';
import { Wizard } from './components/Wizard';
import { ManagerView } from './components/ManagerView';
import { AdminView } from './components/AdminView';

const AppContent = () => {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roadmap' | 'tracking' | 'settings' | 'manager' | 'admin'>('dashboard');

  if (!state.isConfigured) {
    return <Wizard />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'roadmap':
        return <Roadmap />;
      case 'tracking':
        return <Tracking />;
      case 'settings':
        return <Settings />;
      case 'manager':
        return <ManagerView />;
      case 'admin':
        return <AdminView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </StoreProvider>
  );
}