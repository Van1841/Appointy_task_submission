import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUpload, FiSearch, FiBarChart2, FiGrid, FiClock, FiUser, FiLogOut, FiLayers, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

function Layout() {
  const { logout, user } = useAuth();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Main nav items (visible)
  const mainNavItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/upload', icon: FiUpload, label: 'Upload' },
    { to: '/search', icon: FiSearch, label: 'Search' },
  ];

  // Side menu items (hidden in menu)
  const sideMenuItems = [
    { to: '/threads', icon: FiLayers, label: 'Threads' },
    { to: '/memory-graph', icon: FiGrid, label: 'Memory Graph' },
    { to: '/timeline', icon: FiClock, label: 'Timeline' },
    { to: '/reflection', icon: FiBarChart2, label: 'Reflection' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation Bar */}
      <nav className="glass border-b border-dark-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold neon-text">SynapseMind</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 neon-hover ${
                      isActive
                        ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon-glow'
                        : 'text-gray-400 hover:text-white hover:bg-dark-hover hover:shadow-neon-glow-sm'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}

              {/* Menu Button */}
              <button
                onClick={() => setSideMenuOpen(!sideMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-white hover:bg-dark-hover hover:shadow-neon-glow-sm neon-hover"
              >
                <FiMenu className="w-4 h-4" />
                <span className="text-sm font-medium">More</span>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-400">Welcome back,</p>
                <p className="text-sm font-medium text-neon-blue">{user?.name || user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-dark-card hover:bg-red-500/10 hover:text-red-400 transition-all border border-dark-border hover:border-red-500/50"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 glass border-l border-dark-border z-50 transform transition-transform duration-300 ease-in-out ${
          sideMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <h2 className="text-xl font-bold neon-text">Menu</h2>
            <button
              onClick={() => setSideMenuOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-all duration-300 neon-hover"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {sideMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSideMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group neon-hover ${
                      isActive
                        ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon-glow'
                        : 'text-gray-400 hover:text-white hover:bg-dark-hover hover:shadow-neon-glow-sm hover:border-neon-blue/50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Menu Footer */}
          <div className="p-4 border-t border-dark-border">
            <div className="text-center text-sm text-gray-400">
              <p>Logged in as</p>
              <p className="text-neon-blue font-medium mt-1">{user?.name || user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sideMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSideMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-dark-border z-50">
        <div className="flex items-center justify-around py-2">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-300 neon-hover ${
                  isActive ? 'text-neon-blue' : 'text-gray-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setSideMenuOpen(!sideMenuOpen)}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-gray-400 transition-all duration-300 neon-hover"
          >
            <FiMenu className="w-5 h-5" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
