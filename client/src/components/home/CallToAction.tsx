import React from 'react';
import Link from 'next/link';

export const CallToAction = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-gray-50">
      {/* Top diagonal accent */}
      <div className="absolute top-0 left-0 right-0 h-28 z-0" style={{ backgroundColor: "#5D001E", transform: "skewY(-2deg)", transformOrigin: "top left" }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto pt-10">
          {/* Main CTA Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transform translate-y-4" 
            style={{ 
              boxShadow: "0 10px 40px rgba(93, 0, 30, 0.15)", 
              background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(252,248,240,1) 100%)",
              borderTop: "3px solid #5D001E",
              borderBottom: "3px solid #B78C00"
            }}>
            <div className="px-8 py-10 sm:px-12 sm:py-14 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-5" style={{ color: "#5D001E" }}>
                Join the Global Movement for Carbon Neutrality
              </h2>
              <div className="w-32 h-1 mx-auto mb-6 rounded-full" style={{ background: "linear-gradient(to right, #5D001E, #B78C00)" }}></div>
              <p className="text-base md:text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Whether you're a project developer looking to monetize carbon capture efforts or an
                investor seeking to offset your carbon footprint, CarbonX provides the platform you need.
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-6 py-3 text-white font-medium rounded-lg shadow-lg hover:opacity-90 transition-all duration-300"
                style={{ background: "linear-gradient(to right, #5D001E, #B78C00)" }}
              >
                Create an Account
              </Link>
            </div>
          </div>

          {/* Three columns section */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Project Developers",
                description: "Register your carbon capture project, get verified, and monetize your environmental impact.",
                icon: (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                )
              },
              {
                title: "Investors & Businesses",
                description: "Offset your carbon footprint by purchasing verified carbon credits from impactful projects.",
                icon: (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                )
              },
              {
                title: "Verifiers",
                description: "Join our network of expert verifiers to validate carbon capture projects and ensure integrity.",
                icon: (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
                    />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                style={{
                  background: "linear-gradient(135deg, #5D001E 0%, #450015 100%)",
                  boxShadow: "0 20px 25px -5px rgba(93, 0, 30, 0.3), 0 10px 10px -5px rgba(93, 0, 30, 0.2)"
                }}
              >
                <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(250,244,232,1) 100%)" }} className="p-8">
                  <div className="flex items-center mb-5">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mr-4 shadow-md" 
                      style={{ 
                        background: "linear-gradient(135deg, #5D001E 0%, #B78C00 100%)" 
                      }}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: "#5D001E" }}>{item.title}</h3>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="h-2" style={{ background: "linear-gradient(to right, #B78C00, #5D001E)" }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};