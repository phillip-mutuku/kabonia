import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../common/Card';

const featuredProjects = [
  {
    id: '1',
    name: 'Amazon Rainforest Conservation',
    location: 'Brazil',
    description:
      'Protecting 50,000 hectares of pristine rainforest in the Amazon basin from deforestation, preserving biodiversity and carbon sequestration.',
    imageSrc: '/assets/images/amazon.jpg',
    captureAmount: 250000,
    creditPrice: 18.5,
    status: 'verified',
  },
  {
    id: '2',
    name: 'Kenyan Reforestation Initiative',
    location: 'Kenya',
    description:
      'Reforesting degraded lands in Kenya with native tree species, improving soil quality and creating sustainable livelihoods for local communities.',
    imageSrc: '/assets/images/kenya.jpg',
    captureAmount: 75000,
    creditPrice: 15.2,
    status: 'verified',
  },
  {
    id: '3',
    name: 'Renewable Energy Transition',
    location: 'India',
    description:
      'Replacing coal power plants with solar energy facilities, reducing carbon emissions and improving local air quality in urban areas.',
    imageSrc: '/assets/images/india.jpg',
    captureAmount: 125000,
    creditPrice: 14.8,
    status: 'verified',
  },
];

export const ProjectShowcase = () => {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Featured Projects</h2>
          <p className="mt-4 text-lg text-gray-600">
            Explore some of our verified carbon capture projects making a real impact on climate change.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Card key={project.id} hoverEffect className="flex flex-col h-full">
              <div className="relative h-48 rounded-t-lg overflow-hidden">
                {/* We're using a colored placeholder, but in production you'd use real images */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {project.location}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary-600">${project.creditPrice}</div>
                    <div className="text-xs text-gray-500">per credit</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-gray-600">{project.description}</p>
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">Carbon Offset</div>
                      <div className="font-semibold text-gray-700">
                        {project.captureAmount.toLocaleString()} tons
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Token Supply</div>
                      <div className="font-semibold text-gray-700">
                        {project.captureAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Link href={`/projects/${project.id}`} className="text-primary-600 hover:text-primary-700">
                  View Details
                </Link>
                <Link href="/marketplace" className="btn btn-primary btn-sm">
                  Buy Credits
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/projects" className="btn btn-outline">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
};