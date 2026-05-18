import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusSquare, 
  User, 
  LogOut,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Letters', path: '/dashboard/letters', icon: <FileText size={20} /> },
    { name: 'Generate New', path: '/dashboard/generate', icon: <PlusSquare size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-sidebar)] border-r border-gray-800 flex flex-col text-white">
        <div className="p-6 pb-2">
          <Link to="/" className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <img src="/favicon.png" alt="Logo" className="w-10 h-10 flex-shrink-0" />
            <span>Cover Letter Generator</span>
          </Link>
        </div>

        {/* User Profile in Sidebar */}
        <div className="flex flex-col items-center justify-center p-6 border-b border-gray-800/50 mb-4">
          <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center font-bold text-3xl overflow-hidden mb-3 border-4 border-accent/20">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="text-sm font-bold text-white text-center w-full truncate">{user?.full_name}</div>
          <div className="text-xs text-gray-400 text-center w-full truncate">{user?.email}</div>
        </div>
        
        <nav className="flex-1 pl-4 mt-2 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                  isActive 
                    ? 'bg-base text-textMain font-medium rounded-l-full relative -mr-px z-10 shadow-[-5px_0_15px_rgba(0,0,0,0.1)]' 
                    : 'text-gray-400 hover:bg-white/10 hover:text-white rounded-lg mr-4'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-surface/50 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-bold font-serif">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleTheme}
              className="text-textMuted hover:text-accent transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button 
              onClick={() => {
                import('react-hot-toast').then(({ default: toast }) => {
                  toast('No new notifications', { icon: '🔔' });
                });
                // Find and hide the red dot
                const dot = document.getElementById('notif-dot');
                if(dot) dot.style.display = 'none';
              }}
              className="text-textMuted hover:text-accent transition-colors relative"
            >
              <Bell size={24} />
              <span id="notif-dot" className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Background Purple Glow matching landing page */}
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#7F5DF4]/15 to-[#00B4D8]/10 rounded-full blur-3xl pointer-events-none z-0"></div>
          
          <div className="max-w-6xl mx-auto h-full relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
