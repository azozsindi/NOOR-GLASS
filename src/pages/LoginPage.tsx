/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLogin: (name: string, password: string) => boolean;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(name, password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="space-y-4">
          <img src="logo.png" alt="Logo" className="w-24 h-24 mx-auto" />
          <h1 className="text-3xl font-black text-blue-900 dark:text-blue-400 tracking-tight">NOOR GLASS</h1>
          <p className="text-slate-500 font-medium">نظام إدارة المخزون 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block pr-1">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pr-10 pl-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-800 outline-none transition-all text-center font-bold"
                  placeholder="Admin"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block pr-1">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pr-10 pl-10 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border ${error ? 'border-red-500 animate-shake' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-blue-800 outline-none transition-all text-center font-mono text-xl tracking-widest`}
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-blue-800"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1 font-bold">بيانات الدخول غير صحيحة</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>

        <div className="pt-8 text-slate-400 text-xs">
          <p>Developed by <b>Abdulaziz Sindi</b></p>
          <p className="mt-1">© 2026 All Rights Reserved</p>
        </div>
      </motion.div>
    </div>
  );
}
