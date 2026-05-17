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
      <aside className="w-64 bg-surface border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-2xl font-serif font-bold text-accent">Cover Letter Generator</Link>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-accent/10 text-accent font-medium border border-accent/20' 
                    : 'text-textMuted hover:bg-gray-800 hover:text-textMain'
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
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-textMuted hover:bg-red-500/10 hover:text-red-400 w-full transition-colors"
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
            
            <div className="flex items-center space-x-3">
              <Link to="/dashboard/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold">{user?.full_name}</div>
                  <div className="text-xs text-textMuted">{user?.email}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent text-base flex items-center justify-center font-bold text-lg overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-textMuted hover:text-red-400 transition-colors ml-2"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
