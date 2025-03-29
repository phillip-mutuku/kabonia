'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/userSlice';
import { useHashConnect } from '@/hooks/useHashConnect';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.user);
  const { isConnected, accountId, connectToWallet, disconnectFromWallet } = useHashConnect();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileDropdownOpen && !target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home', auth: false },
    { href: '/projects', label: 'Projects', auth: false },
    { href: '/marketplace', label: 'Marketplace', auth: false },
    { href: '/portfolio', label: 'My Portfolio', auth: true },
    { href: '/verification', label: 'Verification', auth: true, role: 'verifier' },
  ];

  const filteredNavLinks = navLinks.filter(link => {
    if (link.auth && !isAuthenticated) return false;
    if (link.role && currentUser?.role !== link.role) return false;
    return true;
  });

const navbarStyles: React.CSSProperties = {
  position: 'fixed' as 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  transition: 'all 0.3s ease',
  background: isScrolled 
    ? 'linear-gradient(to right, rgba(93, 0, 30, 0.95), rgba(70, 0, 20, 0.95))' 
    : 'transparent',
  boxShadow: isScrolled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
  backdropFilter: isScrolled ? 'blur(8px)' : 'none',
  WebkitBackdropFilter: isScrolled ? 'blur(8px)' : 'none',
  padding: isScrolled ? '0.5rem 0' : '1rem 0'
};

  return (
    <nav style={navbarStyles}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">
            CarbonX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium transition-all duration-200 text-white hover:text-amber-300 ${
                pathname === link.href
                  ? 'border-b-2 border-amber-400'
                  : 'border-b-2 border-transparent'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth/Profile Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Wallet Connection Status */}
              {isConnected ? (
                <button
                  onClick={disconnectFromWallet}
                  className="flex items-center text-sm bg-black bg-opacity-20 text-white px-3 py-1.5 rounded-full border border-amber-500/30 hover:bg-opacity-30 transition-all"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  <span className="truncate max-w-[100px]">{accountId}</span>
                </button>
              ) : (
                <button
                  onClick={connectToWallet}
                  className="flex items-center text-sm bg-amber-500 text-maroon-900 px-4 py-1.5 rounded-md hover:bg-amber-400 transition-all font-medium"
                >
                  Connect Wallet
                </button>
              )}
              
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-1 bg-black bg-opacity-20 rounded-full p-1 pl-1 pr-2 hover:bg-opacity-30 transition-all"
                >
                  <div className="w-8 h-8 bg-amber-500 text-maroon-900 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-sm">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-white transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 py-2 bg-white rounded-md shadow-xl border border-gray-200 animate-fade-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{currentUser?.email}</p>
                    </div>
                    <Link
                      href="/portfolio"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      My Portfolio
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-white hover:text-amber-300 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-amber-500 hover:bg-amber-400 text-maroon-900 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 rounded-md hover:bg-black hover:bg-opacity-10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t border-maroon-800/50 px-4 py-2 animate-fade-down"
          style={{
            background: 'linear-gradient(to right, rgba(93, 0, 30, 0.98), rgba(70, 0, 20, 0.98))',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="space-y-1 pb-3 pt-2">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md font-medium ${
                  pathname === link.href
                    ? 'bg-maroon-800/70 text-amber-400'
                    : 'text-white hover:bg-maroon-800/50 hover:text-amber-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-maroon-800/50 pt-4 pb-3 space-y-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-500 text-maroon-900 rounded-full flex items-center justify-center">
                      <span className="font-semibold">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{currentUser?.name}</div>
                    <div className="text-sm font-medium text-amber-200">{currentUser?.email}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-white hover:bg-maroon-800/50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  {isConnected ? (
                    <div className="px-4 py-2">
                      <div className="flex items-center text-sm bg-black bg-opacity-20 text-white px-3 py-1.5 rounded-full border border-amber-500/30">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        <span className="truncate">{accountId}</span>
                      </div>
                      <button
                        onClick={() => {
                          disconnectFromWallet();
                          setIsMenuOpen(false);
                        }}
                        className="mt-3 text-sm text-red-400 hover:text-red-300 px-3 py-1.5"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        connectToWallet();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-amber-400 hover:bg-maroon-800/50 rounded-md"
                    >
                      Connect Wallet
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-400 hover:bg-maroon-800/50 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 flex flex-col space-y-3">
                <Link
                  href="/login"
                  className="w-full py-2 text-center font-medium text-white border border-amber-500/30 rounded-md hover:bg-maroon-800/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="w-full py-2 text-center font-medium text-maroon-900 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-down {
          animation: fade-down 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};