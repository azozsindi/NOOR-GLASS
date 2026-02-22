/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useInventory } from './useInventory';
import { translations } from './i18n';
import { HomePage } from './pages/HomePage';
import { LensPage } from './pages/LensPage';
import { FramePage } from './pages/FramePage';
import { RecordsPage } from './pages/RecordsPage';
import { NotesPage } from './pages/NotesPage';
import { GuidePage } from './pages/GuidePage';
import { AdminPage } from './pages/AdminPage';
import { Home, Search, Glasses, ClipboardList, FileText, Info, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { LoginPage } from './pages/LoginPage';
import { soundService } from './services/soundService';
import { Staff } from './types';

export default function App() {
  const { lang, config } = useInventory();
  const t = translations[lang];
  const [activePage, setActivePage] = useState('home');
  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('noor_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (name: string, password: string) => {
    soundService.playClick();
    const user = config.staff.find(s => s.name === name && s.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('noor_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    soundService.playClick();
    setCurrentUser(null);
    localStorage.removeItem('noor_user');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const hasPermission = (page: string) => {
    if (currentUser.role === 'admin') return true;
    if (page === 'home' || page === 'guide' || page === 'notes') return true;
    if (page === 'lens' && currentUser.permissions.includes('add_lens')) return true;
    if (page === 'frame' && currentUser.permissions.includes('add_frame')) return true;
    if (page === 'records' && currentUser.permissions.includes('view_records')) return true;
    if (page === 'admin' && currentUser.permissions.includes('admin_access')) return true;
    return false;
  };

  const navItems = [
    { id: 'home', icon: Home, label: t.nav_home },
    { id: 'lens', icon: Search, label: t.nav_add, permission: 'add_lens' },
    { id: 'frame', icon: Glasses, label: t.nav_glasses, permission: 'add_frame' },
    { id: 'records', icon: ClipboardList, label: t.nav_list, permission: 'view_records' },
    { id: 'notes', icon: FileText, label: t.nav_extras },
    { id: 'guide', icon: Info, label: t.nav_info },
    { id: 'admin', icon: Settings, label: t.nav_admin, permission: 'admin_access' },
  ].filter(item => !item.permission || hasPermission(item.id));

  const renderPage = () => {
    if (!hasPermission(activePage)) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Lock size={48} className="mb-4 opacity-20" />
          <p className="font-bold">{t.perm_denied}</p>
        </div>
      );
    }
    switch (activePage) {
      case 'home': return <HomePage />;
      case 'lens': return <LensPage />;
      case 'frame': return <FramePage />;
      case 'records': return <RecordsPage />;
      case 'notes': return <NotesPage />;
      case 'guide': return <GuidePage />;
      case 'admin': return <AdminPage onLogout={handleLogout} />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-center shadow-sm">
        <div className="flex items-center gap-2">
          <img src="logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="font-black text-blue-900 dark:text-blue-400 tracking-tight">NOOR GLASS</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex justify-around items-center safe-bottom z-50">
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
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-slate-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
