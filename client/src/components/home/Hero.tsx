'use client'
import React from 'react';
import Link from 'next/link';

export const Hero = () => {
  return (
    <div className="relative overflow-hidden" style={{ 
      background: 'linear-gradient(to bottom, #8B4000 0%, #5D001E 15%, #450014 100%)'
    }}>
      {/* Animated background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Animated floating orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-500 rounded-full mix-blend-soft-light filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -top-10 right-1/3 w-48 h-48 bg-amber-400 rounded-full mix-blend-soft-light filter blur-xl opacity-15 animate-float-delay"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-400 rounded-full mix-blend-soft-light filter blur-xl opacity-15 animate-float-slow"></div>
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-amber-500 rounded-full mix-blend-soft-light filter blur-xl opacity-10 animate-float-delay-slow"></div>
        
        {/* Animated particles */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-amber-300 rounded-full animate-particle-1"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-400 rounded-full animate-particle-2"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-amber-300 rounded-full animate-particle-3"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-amber-400 rounded-full animate-particle-4"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-24 sm:pt-32 sm:pb-40 flex flex-col items-center justify-center text-center">
            {/* Animated Badge */}
            <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold bg-black bg-opacity-20 backdrop-blur-sm text-white rounded-full border border-white border-opacity-20 animate-pulse-slow">
              AI-Powered Carbon Credit Trading Platform
            </div>
            
            {/* Main heading with gradient */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl max-w-4xl">
              <span className="block mb-2">Predict, Trade & Impact:</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 animate-gradient">
                The Future of Carbon Credits
              </span>
            </h1>
            
            {/* Description */}
            <p className="mt-6 text-xl leading-relaxed text-white text-opacity-90 max-w-2xl mx-auto">
              Our AI-driven platform predicts market trends, optimizes trading decisions, and maximizes the impact of your carbon credit investments.
            </p>
            
            {/* CTA Buttons with hover animation */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/projects" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-amber-500 hover:bg-amber-600 transition-all duration-200 transform hover:scale-105">
                Start Trading
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 animate-bounce-x" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/marketplace" className="inline-flex items-center justify-center px-8 py-4 border border-gray-800 text-base font-medium rounded-lg text-white bg-black bg-opacity-60 hover:bg-opacity-80 transition-colors duration-200 transform hover:scale-105">
                Explore Marketplace
              </Link>
            </div>
            
            {/* Trust indicators with subtle animations */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 max-w-3xl mx-auto">
              <div className="flex items-center text-white text-opacity-90 animate-fade-in group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400 group-hover:text-amber-300 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Blockchain Verified</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-white bg-opacity-20"></div>
              <div className="flex items-center text-white text-opacity-90 animate-fade-in animation-delay-300 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400 group-hover:text-amber-300 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <span>AI Prediction Models</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-white bg-opacity-20"></div>
              <div className="flex items-center text-white text-opacity-90 animate-fade-in animation-delay-600 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400 group-hover:text-amber-300 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                <span>Global Marketplace</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Curved bottom edge */}
      <div className="relative h-24">
        <svg
          className="absolute bottom-0 w-full h-24 text-white"
          preserveAspectRatio="none"
          viewBox="0 0 1440 74"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 24L60 22C120 20 240 16 360 24C480 32 600 52 720 57.3C840 63 960 53 1080 49.3C1200 45 1320 47 1380 48L1440 49V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0V24Z" />
        </svg>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 7s ease-in-out 1s infinite;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delay-slow {
          animation: float 9s ease-in-out 2s infinite;
        }

        @keyframes particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-particle-1 {
          animation: particle 8s ease-in-out infinite;
        }
        .animate-particle-2 {
          animation: particle 12s ease-in-out 2s infinite;
        }
        .animate-particle-3 {
          animation: particle 10s ease-in-out 1s infinite;
        }
        .animate-particle-4 {
          animation: particle 14s ease-in-out 3s infinite;
        }

        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s ease-in-out infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 5s ease infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default Hero;