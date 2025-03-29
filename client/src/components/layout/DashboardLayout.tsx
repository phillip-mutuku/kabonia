'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/userSlice';
import { useHashConnect } from '@/hooks/useHashConnect';
import { motion, AnimatePresence } from 'framer-motion';

// First install react-icons:
// npm install react-icons
// or: yarn add react-icons
import { 
  FiHome, 
  FiFolder, 
  FiShoppingBag, 
  FiBriefcase, 
  FiDollarSign, 
  FiShield, 
  FiSettings,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut
} from 'react-icons/fi';

// Sidebar item interface
interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get user and authentication state from Redux
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

  // Use HashConnect hook for wallet connection
  const { 
    isConnected, 
    accountId, 
    connectToWallet, 
    disconnectFromWallet, 
    isLoading
  } = useHashConnect();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle ESC key press to close sidebar
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  useEffect(() => {
    // Check if user authentication is being loaded
    const checkAuth = async () => {
      // Add a small delay to allow Redux to populate state
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoadingAuth(false);
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoadingAuth]);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const navigation: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FiHome,
      current: pathname === '/dashboard',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FiFolder,
      current: pathname === '/projects',
    },
    {
      name: 'Marketplace',
      href: '/marketplace',
      icon: FiShoppingBag,
      current: pathname === '/marketplace',
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: FiBriefcase,
      current: pathname === '/portfolio',
    },
    {
      name: 'Tokens',
      href: '/tokens',
      icon: FiDollarSign,
      current: pathname === '/tokens',
    },
    {
      name: 'Verification',
      href: '/verification',
      icon: FiShield,
      current: pathname === '/verification',
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 z-40 h-full w-64 md:hidden"
          >
            <div className="h-full flex flex-col overflow-y-auto bg-gray-900">
              {/* Close button */}
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <FiX className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Logo */}
              <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-red-950 to-yellow-900">
                <span className="text-2xl font-bold text-yellow-200">
                  CarbonX
                </span>
              </div>

              {/* Navigation links */}
              <div className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200 ${
                      item.current
                        ? 'bg-red-900 text-white'
                        : 'text-gray-300 hover:bg-red-800 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200 ${
                        item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
                
                <Link
                  href="/settings"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200 ${
                    pathname === '/settings'
                      ? 'bg-red-900 text-white'
                      : 'text-gray-300 hover:bg-red-800 hover:text-white'
                  }`}
                >
                  <FiSettings
                    className={`mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200 ${
                      pathname === '/settings' ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  Settings
                </Link>
              </div>

              {/* Mobile user profile and logout */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-red-700 flex items-center justify-center text-white font-semibold">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {currentUser?.name || 'User'}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="mt-1 text-sm font-medium text-gray-300 hover:text-white flex items-center"
                    >
                      <FiLogOut className="mr-1 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div 
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-red-950 to-yellow-900">
            {isCollapsed ? (
              <span className="text-2xl font-bold text-yellow-200">K</span>
            ) : (
              <span className="text-2xl font-bold text-yellow-200">
                Kabonia
              </span>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col py-4 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    item.current
                      ? 'bg-red-900 text-white'
                      : 'text-gray-300 hover:bg-red-800 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon
                    className={`flex-shrink-0 h-6 w-6 transition-colors duration-200 ${
                      item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    } ${isCollapsed ? '' : 'mr-3'}`}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              ))}
              
              <Link
                href="/settings"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  pathname === '/settings'
                    ? 'bg-red-900 text-white'
                    : 'text-gray-300 hover:bg-red-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FiSettings
                  className={`flex-shrink-0 h-6 w-6 transition-colors duration-200 ${
                    pathname === '/settings' ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  } ${isCollapsed ? '' : 'mr-3'}`}
                />
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </nav>
          </div>

          {/* User profile */}
          <div className="p-4 flex border-t border-gray-700">
            {isCollapsed ? (
              <div className="flex-1 flex justify-center">
                <div className="h-10 w-10 rounded-full bg-red-700 flex items-center justify-center text-white font-semibold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              </div>
            ) : (
              <div className="relative flex-shrink-0 w-full group block" ref={dropdownRef}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-red-700 flex items-center justify-center text-white font-semibold">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {currentUser?.name || 'User'}
                    </p>
                  </div>
                  <FiChevronDown 
                    className={`ml-1 h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
                
                {/* User dropdown menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 left-0 right-0 mt-2 shadow-lg rounded-md overflow-hidden"
                    >
                      <div className="py-1 bg-gray-900 border border-gray-700 rounded-md">
                        <Link 
                          href="/settings" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-red-800 hover:text-white"
                        >
                          Account Settings
                        </Link>
                        <div className="border-t border-gray-700 my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-800 hover:text-white"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {/* Collapse toggle button */}
          <div className="p-4 flex justify-center border-t border-gray-700">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-800 hover:bg-yellow-700 text-yellow-100 hover:text-white transition-colors duration-200"
            >
              {isCollapsed ? (
                <FiChevronRight className="h-5 w-5" />
              ) : (
                <FiChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className={`flex flex-col flex-1 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} transition-all duration-300 ease-in-out`}>
        {/* Mobile header */}
        <div className="sticky top-0 z-30 md:hidden flex-shrink-0 flex h-16 bg-gradient-to-r from-red-900 to-yellow-800 shadow-md">
          <button
            type="button"
            className="px-4 text-yellow-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <FiMenu className="h-6 w-6" />
          </button>
          
          {/* Mobile logo */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              CarbonX
            </span>
          </div>
          
          {/* Mobile profile dropdown */}
          <div className="flex items-center px-4">
            <div className="relative">
              <button
                className="flex text-yellow-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-red-900 rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-red-700 flex items-center justify-center text-white font-semibold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              </button>
              
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg"
                  >
                    <div className="py-1 rounded-md bg-gray-900 border border-gray-700">
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-red-800 hover:text-white"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-800 hover:text-white"
                      >
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Top navigation bar */}
        <div className="sticky top-0 z-20 flex-shrink-0 flex h-16 bg-gradient-to-r from-red-900 to-yellow-800 shadow-md">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-white">
                {navigation.find((item) => item.current)?.name || 'Dashboard'}
              </h1>
            </div>
            
            {/* Wallet connection button area */}
            <div className="ml-4 flex items-center md:ml-6">
              {isConnected ? (
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-3">
                    <div className="-ml-1 mr-1.5 h-2 w-2 bg-green-400 rounded-full" />
                    Connected
                  </span>
                  <span className="text-sm text-white mr-3 hidden sm:inline-block truncate max-w-[120px]">
                    {accountId || ''}
                  </span>
                  <button
                    onClick={disconnectFromWallet}
                    className="inline-flex items-center px-3 py-1.5 border border-white text-xs font-medium rounded shadow-sm text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-900 focus:ring-white transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectToWallet}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-yellow-200 text-sm font-medium rounded-md shadow-sm text-yellow-100 bg-transparent hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-900 focus:ring-yellow-200 transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FiDollarSign className="mr-2 h-5 w-5" />
                      Connect Wallet
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}