import React, { useEffect } from 'react';
import { LayoutDashboard, Settings, Target, Map, Menu, X, ChevronRight, Users, Sparkles, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useStore } from '../context/Store';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'roadmap' | 'tracking' | 'settings' | 'manager' | 'admin';
  onTabChange: (tab: 'dashboard' | 'roadmap' | 'tracking' | 'settings' | 'manager' | 'admin') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { state } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // If wizard is not configured, don't show the layout frame, just children (Wizard)
  if (!state.isConfigured) {
    return <main className="min-h-screen bg-gray-50 dark:bg-capi-dark-900 transition-colors">{children}</main>;
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { id: 'roadmap', icon: Map, label: 'Ma Roadmap' },
    { id: 'tracking', icon: Target, label: 'Saisie des actions' },
    { id: 'manager', icon: Sparkles, label: 'Analyse Coach' },
    { id: 'admin', icon: ShieldCheck, label: 'Reporting' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ] as const;

  const renderNavItem = (id: typeof activeTab, Icon: any, label: string) => (
    <button
      key={id}
      onClick={() => {
        onTabChange(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group
        ${activeTab === id 
          ? 'bg-capi-blue-600 text-white shadow-lg shadow-capi-blue-600/30' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-capi-dark-800 hover:text-capi-blue-600 dark:hover:text-capi-blue-400'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={activeTab === id ? 'text-white' : 'text-gray-400 group-hover:text-capi-blue-500 dark:text-gray-500 dark:group-hover:text-capi-blue-400'} />
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      {activeTab !== id && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-capi-blue-300 dark:text-capi-blue-500" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-capi-dark-900 flex overflow-x-hidden transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-capi-dark-900 border-r border-gray-100 dark:border-capi-dark-700 fixed h-full z-20 shadow-sm transition-colors duration-300">
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-2xl font-black text-capi-dark-900 dark:text-white flex items-center gap-2 tracking-tighter">
            <div className="bg-capi-blue-600 p-1.5 rounded-lg">
                <Target className="text-white" size={20} strokeWidth={3} />
            </div>
            SmartPilot
          </h1>
        </div>
        
        <nav className="flex-1 px-6 space-y-2">
          {navItems.map(item => renderNavItem(item.id, item.icon, item.label))}
        </nav>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mode</span>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-capi-dark-800 text-gray-600 dark:text-capi-blue-400 hover:scale-105 transition-all"
                title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
          </div>
          <div className="bg-gradient-to-br from-capi-blue-600 to-capi-blue-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <Target size={100} />
            </div>
            <p className="text-[10px] font-black opacity-60 uppercase mb-1 tracking-widest">Objectif Actif</p>
            <p className="font-black text-lg leading-tight">Focus &<br/>Discipline</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white/80 dark:bg-capi-dark-900/90 backdrop-blur-md border-b border-gray-100 dark:border-capi-dark-700 z-40 px-4 py-4 flex items-center shadow-sm transition-colors duration-300">
        {/* Burger Button - TOP LEFT */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 bg-gray-50 dark:bg-capi-dark-800 text-gray-600 dark:text-white rounded-xl active:scale-95 transition-transform"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <h1 className="flex-1 text-center text-lg font-black text-capi-dark-900 dark:text-white flex justify-center items-center gap-2 pr-2">
          <Target className="text-capi-blue-600" size={18} strokeWidth={3} />
          SmartPilot
        </h1>

        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-gray-50 dark:bg-capi-dark-800 text-gray-600 dark:text-capi-blue-400 rounded-xl active:scale-95 transition-transform"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-capi-dark-900 z-30 pt-24 px-6 animate-in slide-in-from-left duration-300">
          <div className="space-y-3">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Navigation</p>
             {navItems.map(item => renderNavItem(item.id, item.icon, item.label))}
          </div>
          
          <div className="mt-12 p-6 bg-capi-blue-50 dark:bg-capi-dark-800 rounded-3xl border border-capi-blue-100 dark:border-capi-dark-700">
             <p className="font-bold text-capi-blue-900 dark:text-white text-sm mb-1">C'est le moment de performer.</p>
             <p className="text-xs text-capi-blue-500 dark:text-gray-400">Suivez vos actions chaque jour pour garantir vos résultats.</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 pt-24 md:pt-10 w-full max-w-[100vw]">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};