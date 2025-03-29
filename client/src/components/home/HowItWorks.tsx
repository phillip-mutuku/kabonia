import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Project Registration',
    description:
      'Carbon sequestration projects are registered on our platform with detailed information about location, methodology, and expected carbon capture.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Verification Process',
    description:
      'Each project undergoes rigorous verification through satellite imagery, field visits, and documentation review to confirm carbon capture claims.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Tokenization',
    description:
      'Verified carbon credits are tokenized on the Hedera network, creating fungible tokens that represent actual carbon capture amounts.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Marketplace Listing',
    description:
      'Tokenized carbon credits are listed on our marketplace, where AI-powered algorithms help determine fair market valuations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Trading & Portfolio Building',
    description:
      'Buyers can purchase and trade carbon credits, building portfolios of environmental assets with real-world impact.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#FFFAF5' }}>
      {/* Background decoration */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-maroon-600 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">How CarbonX Works</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-maroon-600 to-amber-500 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">
            Our platform simplifies the carbon credit lifecycle from project registration through verification,
            tokenization, and trading.
          </p>
        </div>

        <div className="mt-16 lg:mt-24 relative">
          {/* Line connecting the steps - visible on all screen sizes */}
          <div className="absolute left-6 md:left-1/2 top-8 bottom-0 w-1 bg-gradient-to-b from-maroon-600 via-amber-500 to-maroon-600 md:translate-x-[-0.5px]"></div>

          {/* Steps */}
          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`relative ${index % 2 === 0 ? 'md:pr-8 lg:pr-12' : 'md:pl-8 lg:pl-12'}`}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-duration="1000"
              >
                <div className={`md:flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  {/* Step number circle - positioned absolutely on mobile, relative on desktop */}
                  <div className="absolute left-4 top-7 md:static md:flex md:items-center md:justify-center z-10">
                    <div className={`flex items-center justify-center w-6 h-6 md:w-12 md:h-12 rounded-full font-bold text-white shadow-lg bg-gradient-to-r ${
                      index % 2 === 0 ? 'from-maroon-600 to-amber-500' : 'from-amber-500 to-maroon-600'
                    }`}>
                      <span className="text-xs md:text-base">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`pl-16 md:pl-0 md:w-full ${
                    index % 2 === 0 ? 'md:text-right md:mr-8' : 'md:text-left md:ml-8'
                  }`}>
                    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-amber-200 h-full">
                      <div className="flex items-center mb-4">
                        <div className={`hidden md:flex mr-3 p-3 rounded-full bg-amber-100 text-maroon-600 ${
                          index % 2 === 0 ? 'md:order-last md:ml-3 md:mr-0' : ''
                        }`}>
                          {step.icon}
                        </div>
                        <h3 className={`text-xl font-semibold text-gray-900 ${
                          index % 2 === 0 ? 'md:mr-auto' : 'md:ml-0'
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};