import React from 'react';

const features = [
  {
    title: 'Blockchain Verification',
    description:
      'Our platform leverages Hedera Hashgraph blockchain technology to ensure transparent, tamper-proof verification of carbon credits.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: 'Carbon Credit Tokenization',
    description:
      'Convert verified carbon offsets into tradeable tokens that represent real-world environmental impact, backed by the Hedera Token Service.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
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
    ),
  },
  {
    title: 'AI-Powered Valuation',
    description:
      'Our proprietary AI algorithms analyze multiple factors to determine fair market values for carbon credits, ensuring transparent pricing.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    title: 'Transparent Marketplace',
    description:
      'Buy and sell carbon credits with ease on our open marketplace, with complete visibility into project details and verification status.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Real-Time Impact Tracking',
    description:
      'Monitor the environmental impact of your carbon credit investments with detailed analytics and interactive visualizations.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: 'Secure Wallet Integration',
    description:
      'Connect your HashPack wallet for secure, seamless transactions on the Hedera network with minimal gas fees.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
];

export const Features = () => {
  return (
    <section className="py-16 sm:py-20 bg-white relative" id="features">
      {/* Gradient overlay for smooth transition from hero section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-maroon-900 to-white opacity-20"></div>
      
      {/* Wave shape to match hero section */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden" style={{ transform: 'translateY(-98%)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" fill="#ffffff" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,128L80,138.7C160,149,320,171,480,165.3C640,160,800,128,960,128C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-maroon-900 sm:text-4xl mb-4">
            Revolutionizing Carbon Credits with Blockchain Technology
          </h2>
          <div className="h-1 w-24 bg-maroon-800 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700">
            Our platform combines the security of Hedera blockchain with AI-powered valuation to create a
            transparent and efficient marketplace for carbon credits.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              style={{
                borderLeft: "5px solid #5D001E",
              }}
            >
              <div className="p-6">
                <div className="mb-5">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg" 
                    style={{ backgroundColor: '#5D001E', color: 'white' }}>
                  {feature.icon}
                </div>
                </div>
                <h3 className="text-xl font-bold text-maroon-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-1">
                  {feature.description}
                </p>
              </div>
              <div className="bg-maroon-800 h-1"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};