import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '../search/GlobalSearch';

const TopNav = () => {
  const navigate = useNavigate();
  const { isChatOpen, toggleChat, setPetActive, resetData } = useAppStore();
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const appMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (appMenuRef.current && !appMenuRef.current.contains(event.target as Node)) {
        setIsAppMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/');
  };

  const handleResetData = () => {
    resetData();
    setIsResetConfirmOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
    alert('所有資料已重置！');
  };

  const apps = [
    { name: 'Notes', icon: '📝', path: '/notes', color: 'bg-blue-100 text-blue-600' },
    { name: 'Presentation', icon: '📊', path: '/presentation', color: 'bg-purple-100 text-purple-600' },
    { name: 'Galaxy', icon: '🌌', path: '/galaxy', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Memory Bank', icon: '🧠', path: '/memory', color: 'bg-amber-100 text-amber-600' },
    { name: 'Study Plan', icon: '📅', path: '/study-plan', color: 'bg-green-100 text-green-600' },
    { name: 'Vault', icon: '📂', path: '/vault', color: 'bg-slate-100 text-slate-600' }
  ];

  return (
    <>
      <header className={clsx(
        "fixed top-0 left-0 z-50 w-full border-b border-white/40 bg-white/80 backdrop-blur-2xl shadow-sm transition-all duration-300 ease-in-out",
        isChatOpen ? "pr-0 md:pr-96" : ""
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

          {/* Left Section: App Switcher & Logo */}
          <div className="flex items-center gap-4">
            {/* App Switcher (9-Dot Menu) */}
            <div className="relative" ref={appMenuRef}>
              <button
                onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="應用程式"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                </svg>
              </button>

              {/* Desktop App Dropdown */}
              <AnimatePresence>
                {isAppMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="hidden md:block absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {apps.map((app) => (
                        <Link
                          key={app.name}
                          to={app.path}
                          onClick={() => setIsAppMenuOpen(false)}
                          className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${app.color} group-hover:scale-110 transition-transform`}>
                            {app.icon}
                          </div>
                          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                            {app.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logo */}
            <div
              onClick={handleLogoClick}
              className="cursor-pointer select-none"
            >
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gray-500 font-medium">AI Student OS</p>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Learning Assistant</h1>
            </div>
          </div>

          {/* Center Section: Search Bar - Desktop */}
          <div className="hidden md:block flex-1">
            <GlobalSearch />
          </div>

          {/* Right Section: User & Mobile Menu */}
          <div className="flex items-center gap-3" ref={mobileMenuRef}>
            {/* ... (keep existing right section content) ... */}
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="重置資料"
              >
                ⚙️
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
                A
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-14 right-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 md:hidden z-50"
                >
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        toggleChat();
                        setIsMobileMenuOpen(false);
                      }}
                      className={clsx(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                        isChatOpen ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <span className="text-lg">💬</span>
                      {isChatOpen ? '關閉聊天室' : 'AI 聊天室'}
                    </button>

                    <div className="h-px bg-gray-100 my-1" />

                    <button
                      onClick={() => {
                        setPetActive(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700"
                    >
                      <span className="text-lg">🐾</span>
                      呼叫小寵物
                    </button>

                    <button
                      onClick={() => {
                        setIsResetConfirmOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <span className="text-lg">⚙️</span>
                      重置資料
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Search Bar - New Row */}
        <div className="md:hidden px-4 pb-3 w-full">
          <GlobalSearch />
        </div>
      </header>

      {/* Mobile Full-Screen App Menu */}
      <AnimatePresence>
        {isAppMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-sm p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">應用程式</h2>
              <button
                onClick={() => setIsAppMenuOpen(false)}
                className="p-2 bg-white/10 rounded-full text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {apps.map((app) => (
                <Link
                  key={app.name}
                  to={app.path}
                  onClick={() => setIsAppMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 active:scale-95 transition-transform"
                >
                  <div className="text-4xl mb-3">{app.icon}</div>
                  <span className="text-sm font-medium text-white text-center leading-tight">
                    {app.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-2xl mb-4">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">確定要重置所有資料嗎？</h3>
                <p className="text-gray-500 text-sm mb-6">
                  此操作將清除所有筆記、測驗、研究結果和寵物進度。此操作無法復原。
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleResetData}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                  >
                    確認重置
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNav;
