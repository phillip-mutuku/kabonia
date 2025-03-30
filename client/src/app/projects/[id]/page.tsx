'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { normalizeCoordinates } from '@/types';
import { getProjectById } from '@/store/slices/projectSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, ProjectStatus, VerificationStatus } from '@/types/project';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}




export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = params;
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentProject, isLoading: loading, error } = useSelector((state: RootState) => state.project);
  const { currentUser: user } = useSelector((state: RootState) => state.user);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getProjectById(id) as any);
    }
  }, [dispatch, id]);



useEffect(() => {
  // Check for Google Maps API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log('Google Maps API Key exists:', !!apiKey);
  
  if (!apiKey) {
    console.warn('Google Maps API Key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file');
  } else {
    console.log('API Key length:', apiKey.length);
    console.log('API Key starts with:', apiKey.substring(0, 4) + '...');
  }
  
  // Check project coordinates
  if (currentProject && currentProject.coordinates) {
    console.log('Project coordinates:', currentProject.coordinates);
    console.log('Coordinates type:', typeof currentProject.coordinates);
    
    if (typeof currentProject.coordinates === 'object') {
      console.log('Coordinates keys:', Object.keys(currentProject.coordinates));
    }
    
    // Test coordinate normalization
    const normalized = normalizeCoordinates(currentProject.coordinates);
    console.log('Normalized coordinates:', normalized);
    
    // Check if coordinates are valid
    const isValid = normalized.lat !== 0 && normalized.lng !== 0 && 
                  !isNaN(normalized.lat) && !isNaN(normalized.lng);
    console.log('Are coordinates valid?', isValid);
    
    // Check if the coordinates would work for a Google Maps URL
    if (isValid && apiKey) {
      const testUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${normalized.lat},${normalized.lng}&zoom=10&size=600x400&maptype=hybrid&key=${apiKey}`;
      console.log('Test URL for map:', testUrl);
      
      const testImg = new Image();
      testImg.onerror = () => console.error('Test map URL failed to load');
      testImg.onload = () => console.log('Test map URL loaded successfully');
      testImg.src = testUrl;
    }
  } else {
    console.warn('Project coordinates are missing or undefined');
  }
}, [currentProject]);


  // Check if user is the owner of the project
  const isOwner = currentProject && user && currentProject.owner === user._id;

  // Handle edit project
  const handleEditProject = () => {
    router.push(`/projects/${id}/edit`);
  };

  const refreshProject = () => {
    dispatch(getProjectById(id) as any);
  };

  // Function to derive verification status from project data
  const deriveVerificationStatus = (project: Project): string => {
    if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.ACTIVE) {
      return VerificationStatus.APPROVED;
    }
    
    // Check verification history if it exists
    if (project.verificationHistory && project.verificationHistory.length > 0) {
      // Get the latest verification record
      const latestVerification = project.verificationHistory[project.verificationHistory.length - 1];
      if (latestVerification.status) {
        return latestVerification.status;
      }
    }
    
    // Fall back to the verification status field if it exists
    return project.verificationStatus || VerificationStatus.PENDING;
  };

  // Handle verification submission
  const handleVerify = () => {
    router.push(`/verification?project=${id}`);
  };

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Button onClick={refreshProject} variant="secondary">
          Refresh Project Data
        </Button>
      </div>
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <svg
              className="animate-spin h-10 w-10 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : error ? (
          <Card className="p-6 bg-red-50 border border-red-200">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="ml-3 text-lg font-medium text-red-800">Error loading project</h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="secondary"
              >
                Go Back
              </Button>
            </div>
          </Card>
        ) : !currentProject ? (
          <Card className="p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The project you are looking for does not exist or has been removed.
              </p>
              <div className="mt-6">
                <Link href="/projects">
                  <Button variant="primary">
                    View All Projects
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentProject.name}</h2>
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-500 mr-2">{currentProject.projectType}</span>
                  <VerificationBadge status={deriveVerificationStatus(currentProject)} />
                </div>
              </div>
              {isOwner && (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleEditProject}
                    variant="secondary"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Project
                  </Button>
                  
                  {deriveVerificationStatus(currentProject) !== VerificationStatus.APPROVED && 
                   deriveVerificationStatus(currentProject) !== VerificationStatus.VERIFIED ? (
                    <Button
                      onClick={handleVerify}
                      variant="primary"
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      Verify Project
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/tokens/mint?project=${id}`)}
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Mint Credits
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Project Images */}
            <div className="aspect-w-16 aspect-h-7 bg-gray-200 rounded-lg overflow-hidden">
              {currentProject.images && currentProject.images.length > 0 ? (
                <img 
                  src={currentProject.images[0]} 
                  alt={currentProject.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Project Details</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="prose max-w-none text-gray-700">
                      <p>{currentProject.description}</p>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h4 className="text-base font-medium text-gray-900">Project Information</h4>
                      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div>
                          <dt className="text-gray-500">Location</dt>
                          <dd className="mt-1 text-gray-900">{currentProject.location}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Project Type</dt>
                          <dd className="mt-1 text-gray-900">{currentProject.projectType}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Area</dt>
                          <dd className="mt-1 text-gray-900">{currentProject.area} hectares</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Status</dt>
                          <dd className="mt-1 text-gray-900">{currentProject.status}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Carbon Credits</dt>
                          <dd className="mt-1 text-gray-900">
                            {currentProject.carbonCredits || currentProject.actualCarbonCapture || 'Not yet verified'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Verified Status</dt>
                          <dd className="mt-1">
                            <VerificationBadge status={deriveVerificationStatus(currentProject)} />
                          </dd>
                        </div>
                        {currentProject.startDate && (
                          <div>
                            <dt className="text-gray-500">Start Date</dt>
                            <dd className="mt-1 text-gray-900">
                              {new Date(currentProject.startDate).toLocaleDateString()}
                            </dd>
                          </div>
                        )}
                        {currentProject.endDate && (
                          <div>
                            <dt className="text-gray-500">End Date</dt>
                            <dd className="mt-1 text-gray-900">
                              {new Date(currentProject.endDate).toLocaleDateString()}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {/* Verification Status Box */}
                    {deriveVerificationStatus(currentProject) === VerificationStatus.APPROVED || 
                     deriveVerificationStatus(currentProject) === VerificationStatus.VERIFIED ? (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Verified Project</h3>
                              <div className="mt-2 text-sm text-green-700">
                                <p>
                                  This project has been verified by our certification team. Carbon credits can now be minted.
                                </p>
                                <div className="mt-4">
                                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                    <div>
                                      <dt className="font-medium">Verified Area</dt>
                                      <dd>{currentProject.area} hectares</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium">Carbon Credits</dt>
                                      <dd>{currentProject.carbonCredits || 'Pending calculation'}</dd>
                                    </div>
                                  </dl>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Verification Required</h3>
                              <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                  This project needs to be verified before carbon credits can be minted.
                                  {isOwner && (
                                    <span> Use the "Verify Project" button above to start the verification process.</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                      {/* Project Location - SVG Fallback Map */}
                            <Card className="overflow-hidden">
                              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-base leading-6 font-medium text-gray-900">Project Location</h3>
                              </div>
                              <div className="h-64 bg-gray-100 relative">
                                {(() => {
                                  const coords = normalizeCoordinates(currentProject.coordinates);
                                  console.log('Project coordinates:', currentProject.coordinates);
                                  console.log('Normalized coordinates:', coords);
                                  
                                  // Check if we have valid coordinates
                                  const hasValidCoords = coords.lat !== 0 && coords.lng !== 0 && 
                                                      !isNaN(coords.lat) && !isNaN(coords.lng);
                                  
                                  if (hasValidCoords) {
                                    const x = ((coords.lng + 180) / 360) * 1000; 
                                    const y = ((90 - coords.lat) / 180) * 500; 
                                    
                                    return (
                                      <div className="relative w-full h-full bg-blue-50">
                                        {/* Simple world map SVG */}
                                        <svg viewBox="0 0 1000 500" className="absolute w-full h-full">
                                          <rect x="0" y="0" width="1000" height="500" fill="#cfe8fc" />
                                          
                                          {/* Simple continent outlines - very simplified */}
                                          <g fill="#e9e9e9">
                                            {/* Africa */}
                                            <path d="M500,200 C530,180 560,190 580,240 C600,290 590,320 560,350 C530,380 510,330 490,310 C470,290 470,220 500,200 Z" />
                                            
                                            {/* Europe */}
                                            <path d="M490,150 C520,130 550,120 580,140 C610,160 590,180 570,190 C550,200 530,190 510,180 C490,170 480,160 490,150 Z" />
                                            
                                            {/* Asia */}
                                            <path d="M600,150 C650,120 700,100 750,120 C800,140 820,200 850,220 C880,240 900,280 850,300 C800,320 750,340 700,320 C650,300 620,250 600,220 C580,190 580,160 600,150 Z" />
                                            
                                            {/* Australia */}
                                            <path d="M800,350 C830,330 860,330 880,350 C900,370 900,400 880,420 C860,440 830,440 810,420 C790,400 790,370 800,350 Z" />
                                            
                                            {/* North America */}
                                            <path d="M200,150 C250,120 300,100 350,120 C400,140 420,200 400,240 C380,280 330,290 280,270 C230,250 220,220 200,190 C180,160 180,160 200,150 Z" />
                                            
                                            {/* South America */}
                                            <path d="M250,320 C280,300 310,310 320,340 C330,370 340,410 320,440 C300,470 270,470 250,440 C230,410 230,370 250,320 Z" />
                                          </g>
                                          
                                          {/* Location marker */}
                                          <circle cx={x} cy={y} r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                                          
                                          {/* Add a pulsing effect to the marker */}
                                          <circle cx={x} cy={y} r="16" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6">
                                            <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                                          </circle>
                                        </svg>
                                        
                                        {/* Location info overlay */}
                                        <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-md shadow-sm text-xs text-gray-700">
                                          Coordinates: {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
                                        </div>
                                        
                                        {/* Location name */}
                                        <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded-md shadow-sm text-sm font-medium text-gray-800">
                                          {currentProject.location || "Project Location"}
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                                        <svg className="h-12 w-12 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-sm">{currentProject.location || "Location not specified"}</p>
                                        <p className="text-xs mt-1">Coordinates not available</p>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                              <div className="px-4 py-4 text-sm text-gray-500">
                                <div><span className="font-medium">Location:</span> {currentProject.location || "Not specified"}</div>
                                <div>
                                  <span className="font-medium">Coordinates:</span> {
                                    (() => {
                                      const coords = normalizeCoordinates(currentProject.coordinates);
                                      return (coords.lat !== 0 || coords.lng !== 0) ? 
                                        `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 
                                        "Not available";
                                    })()
                                  }
                                </div>
                                <div><span className="font-medium">Area:</span> {currentProject.area} hectares</div>
                              </div>
                            </Card>
                
                      {/* Project Owner */}
                      <Card className="overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                          <h3 className="text-base leading-6 font-medium text-gray-900">Project Owner</h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                              {currentProject.ownerName ? currentProject.ownerName.charAt(0) : 'U'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{currentProject.ownerName || 'Unknown Owner'}</div>
                              <div className="text-xs text-gray-500">{isOwner ? 'You are the owner' : 'Project Developer'}</div>
                            </div>
                          </div>
                          
                          {!isOwner && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <Button
                                onClick={() => router.push(`/messages?recipient=${currentProject.owner}`)}
                                variant="secondary"
                                fullWidth
                              >
                                <svg
                                  className="-ml-1 mr-2 h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
                                  />
                                </svg>
                                Contact Owner
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                      
                      {/* Token Actions */}
                      {(deriveVerificationStatus(currentProject) === VerificationStatus.VERIFIED || 
                        deriveVerificationStatus(currentProject) === VerificationStatus.APPROVED) && (
                        <Card className="overflow-hidden">
                          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-base leading-6 font-medium text-gray-900">Carbon Credits</h3>
                          </div>
                          <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-sm text-gray-500">Credit Price</span>
                              <span className="text-lg font-bold text-gray-900">${currentProject.price || '15.00'}</span>
                            </div>
                            <div className="flex justify-between items-baseline mb-6">
                              <span className="text-sm text-gray-500">Available Credits</span>
                              <span className="text-lg font-bold text-gray-900">{currentProject.carbonCredits || 0}</span>
                            </div>
                            
                            <div className="space-y-3">
                              <Button
                                onClick={() => router.push(`/marketplace?projectId=${id}`)}
                                variant="primary"
                                fullWidth
                              >
                                <svg
                                  className="-ml-1 mr-2 h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                Buy Credits
                              </Button>
                              
                              {isOwner && (
                                <Button
                                  onClick={() => router.push(`/tokens/mint?project=${id}`)}
                                  variant="secondary"
                                  fullWidth
                                >
                                  <svg
                                    className="-ml-1 mr-2 h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Mint Credits
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
            
            {/* Similar Projects */}
            <Card className="overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Similar Projects</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500 mb-4">Other {currentProject.projectType} projects you might be interested in:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="h-24 bg-gray-100 rounded-md mb-2 flex items-center justify-center text-gray-400 text-sm">
                      Similar Project Preview
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">Similar {currentProject.projectType} Project</h4>
                    <p className="text-xs text-gray-500 mt-1">Location, area, and other details would appear here.</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}