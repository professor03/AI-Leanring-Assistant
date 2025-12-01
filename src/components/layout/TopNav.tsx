import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import clsx from 'clsx';

const TopNav = () => {
  const navigate = useNavigate();
  const { isChatOpen, toggleChat, setPetActive, resetData } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logo clicked - navigating to home');
    navigate('/');
  };

  const handleResetData = () => {
    resetData();
    setIsResetConfirmOpen(false);
    setIsMenuOpen(false);
    navigate('/');
    // Optional: Show a toast or alert
    alert('所有資料已重置！');
  };

  return (
    <>
      <header className={clsx(
        "fixed top-0 left-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-2xl shadow-sm transition-all duration-300 ease-in-out",
        isChatOpen ? "right-0 md:right-96" : "right-0"
      )}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div
            onClick={handleLogoClick}
            className="cursor-pointer select-none"
            style={{ pointerEvents: 'auto' }}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-500 pointer-events-none">AI 大學生學習助理</p>
            <h1 className="text-2xl font-semibold text-text-dark hover:text-primary transition-colors pointer-events-none">AI Learning Assistant</h1>
          </div>
          {/* New navigation items for desktop, placed next to the logo */}
          <div className="hidden md:flex items-center gap-4 ml-8">
            <NavLink to="/memory" icon="🧠" label="Memory Bank" />
            <NavLink to="/galaxy" icon="🌌" label="Galaxy" />
            <NavLink to="/notes" icon="📝" label="Notes" />
          </div>
          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <div className="glass-pill text-xs hidden sm:block">Inspired by Apple design</div>

            {/* Desktop: Settings Button */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="重置資料"
            >
              ⚙️
            </button>

            {/* Menu Trigger Button (Mobile Only) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center transition-transform active:scale-95"
            >
              <img src="/menu-icon.png" alt="Menu" className="w-8 h-8 object-contain" />
            </button>

            {/* Desktop: 'A' Avatar (Static / Profile Link) */}
            <div className="hidden md:flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-white/80 to-secondary/60 text-text-dark shadow-glow">
              A
            </div>

            {/* Dropdown Menu (Mobile Only) */}
            {isMenuOpen && (
              <div className="md:hidden absolute top-14 right-0 w-48 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-2 animate-fade-in origin-top-right">
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      toggleChat();
                      setIsMenuOpen(false);
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                      isChatOpen ? "bg-primary/10 text-primary" : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <span className="text-lg">💬</span>
                    {isChatOpen ? '關閉聊天室' : 'AI 聊天室'}
                  </button>

                  <div className="h-px bg-gray-200 my-1"></div>

                  {/* Mobile Navigation Links */}
                  <button
                    onClick={() => {
                      navigate('/memory');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <span className="text-lg">🧠</span>
                    Memory Bank
                  </button>
                  <button
                    onClick={() => {
                      navigate('/galaxy');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <span className="text-lg">🌌</span>
                    Galaxy
                  </button>
                  <button
                    onClick={() => {
                      navigate('/notes');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <span className="text-lg">📝</span>
                    Notes
                  </button>

                  <div className="h-px bg-gray-200 my-1"></div>

                  <button
                    onClick={() => {
                      setPetActive(true); // Wake up pet
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <span className="text-lg">🐾</span>
                    呼叫小寵物
                  </button>

                  <button
                    onClick={() => {
                      setPetActive(false); // Hide pet
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-lg">🚫</span>
                    隱藏小寵物
                  </button>

                  <div className="h-px bg-gray-200 my-1"></div>

                  <button
                    onClick={() => {
                      setIsResetConfirmOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-lg">⚙️</span>
                    重置所有資料
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-white/50 animate-scale-in">
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
          </div>
        </div>
      )}
    </>
  );
};

function NavLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default TopNav;

