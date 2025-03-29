import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="text-white py-6" style={{ backgroundColor: '#5D001E' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              CarbonX
            </Link>
          </div>
          
          <p className="text-sm text-gray-300 mt-2 md:mt-0">
            &copy; {new Date().getFullYear()} CarbonX. All rights reserved.
          </p>
          
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href="/terms" className="text-xs text-gray-300 hover:text-amber-300 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-gray-300 hover:text-amber-300 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};