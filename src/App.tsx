/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useInventory } from './useInventory';
import { translations } from './i18n';
import { HomePage } from './pages/HomePage';
import { UpdatesPage } from './pages/UpdatesPage';
import { LensPage } from './pages/LensPage';
import { FramePage } from './pages/FramePage';
import { RecordsPage } from './pages/RecordsPage';
import { NotesPage } from './pages/NotesPage';
import { GuidePage } from './pages/GuidePage';
import { AdminPage } from './pages/AdminPage';
import { Home, Search, Glasses, ClipboardList, FileText, Info, Settings, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { soundService } from './services/soundService';

export default function App() {
  const { lang, config } = useInventory();
  const t = translations[lang];
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    soundService.enabled = config.enableSound;
  }, [config.enableSound]);

  const navItems = [
    { id: 'home', icon: Home, label: t.nav_home },
    { id: 'updates', icon: Sparkles, label: t.nav_updates },
    { id: 'lens', icon: Search, label: t.nav_add },
    { id: 'frame', icon: Glasses, label: t.nav_glasses },
    { id: 'records', icon: ClipboardList, label: t.nav_list },
    { id: 'notes', icon: FileText, label: t.nav_extras },
    { id: 'guide', icon: Info, label: t.nav_info },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <HomePage />;
      case 'updates': return <UpdatesPage />;
      case 'lens': return <LensPage />;
      case 'frame': return <FramePage />;
      case 'records': return <RecordsPage />;
      case 'notes': return <NotesPage />;
      case 'guide': return <GuidePage />;
      case 'admin': return <AdminPage onLogout={() => {}} />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="w-10" />
        <div className="flex items-center gap-2">
          <span className="font-black text-blue-900 dark:text-blue-400 tracking-tight text-xl uppercase">{config.shopName}</span>
        </div>
        <button 
          onClick={() => {
            soundService.playClick();
            setActivePage('admin');
          }}
          className={`p-2 rounded-xl transition-all active:scale-90 ${
            activePage === 'admin' 
              ? 'text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-1 py-1 flex justify-around items-center safe-bottom z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundService.playClick();
                setActivePage(item.id);
              }}
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] h-14 rounded-2xl transition-all active:scale-90 ${
                isActive 
                  ? 'text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
