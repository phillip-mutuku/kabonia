'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { verificationService } from '@/services/verificationService';
import { Verification, SatelliteImage } from '@/types/verification';
import { normalizeCoordinates } from '@/types';

// Update the interface to match your actual Project type
interface SatelliteViewProps {
  project: {
    _id: string;
    name: string;
    location: string;
    area: number;
    coordinates?: {
      lat?: number;
      lng?: number;
      latitude?: number;
      longitude?: number;
      type?: string;
      coordinates?: [number, number];
    };
  };
}

export const SatelliteView: React.FC<SatelliteViewProps> = ({ project }) => {
  const [loading, setLoading] = useState(false);
  const [satelliteImages, setSatelliteImages] = useState<SatelliteImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Normalize the coordinates using our utility function
  const coordinates = normalizeCoordinates(project.coordinates);

  // Log coordinates for debugging
  useEffect(() => {
    console.log('Original project coordinates:', project.coordinates);
    console.log('Normalized coordinates:', coordinates);
  }, [project.coordinates]);

  // Get API key from environment variable (or use placeholder for demo)
  const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBtcph5bBHTF7PKFhCctZ7cCLb_6VkKZ6k';

  // Generate satellite image URLs
  const generateImageUrl = (lat: number, lng: number, type: string = 'satellite', zoom: number = 14) => {
    // For production, ensure this key is properly secured
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x400&maptype=${type}&key=${MAPS_API_KEY}`;
  };

  // Check if coordinates are valid
  const hasValidCoordinates = () => {
    return coordinates.lat !== 0 && coordinates.lng !== 0 && 
           !isNaN(coordinates.lat) && !isNaN(coordinates.lng);
  };

  // Fetch verification and satellite imagery if available
  useEffect(() => {
    const fetchData = async () => {
      if (!project._id) return;
      
      try {
        setLoading(true);
        setApiError(null);
        
        // Check if we have valid coordinates first
        if (!hasValidCoordinates()) {
          setApiError("Missing or invalid coordinates for this project.");
          createDemoImages(true); // Create placeholder images
          return;
        }
        
        // Try to get the verification for this project
        const response = await verificationService.getProjectVerifications(project._id);
        
        // Check if we have any verifications
        if (response.data && response.data.length > 0) {
          const latestVerification = response.data[0];
          setVerification(latestVerification);
          
          // Use satellite images from verification if available
          if (latestVerification.satelliteImages && latestVerification.satelliteImages.length > 0) {
            setSatelliteImages(latestVerification.satelliteImages);
          } else {
            // Use demo images with actual coordinates
            createDemoImages();
          }
        } else {
          // No verifications found, use demo images with actual coordinates
          createDemoImages();
        }
      } catch (error) {
        console.error('Error fetching satellite data:', error);
        setApiError("Could not fetch verification data. Using sample imagery instead.");
        createDemoImages();
      } finally {
        setLoading(false);
      }
    };
    
    const createDemoImages = (usePlaceholder = false) => {
      if (usePlaceholder || !hasValidCoordinates()) {
        // Use placeholder images if coordinates are invalid
        setSatelliteImages([
          {
            url: 'https://via.placeholder.com/600x400?text=Satellite+Image+Not+Available',
            date: '2023-01-15',
            description: 'Satellite imagery not available due to missing coordinates'
          }
        ]);
        return;
      }
      
      // Use actual coordinates to create demo images
      setSatelliteImages([
        {
          url: generateImageUrl(coordinates.lat, coordinates.lng, 'satellite'),
          date: '2023-01-15',
          description: 'Baseline satellite imagery'
        },
        {
          url: generateImageUrl(coordinates.lat, coordinates.lng, 'hybrid'),
          date: '2023-03-20',
          description: 'Verification satellite imagery with land use overlay'
        }
      ]);
    };

    fetchData();
  }, [project._id, coordinates.lat, coordinates.lng]);

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-white">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Satellite Imagery</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Satellite monitoring for project verification and progress tracking.
        </p>
      </div>
      
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
      ) : satelliteImages.length === 0 ? (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-6">
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
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No satellite imagery available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {apiError || "Satellite imagery will be available once your verification process begins."}
            </p>
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Project Location</h4>
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-md overflow-hidden">
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                <span>Map preview unavailable</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <div><span className="font-medium">Location:</span> {project.location}</div>
              <div><span className="font-medium">Coordinates:</span> {hasValidCoordinates() ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}` : 'Not available'}</div>
              <div><span className="font-medium">Area:</span> {project.area} hectares</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6">
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-md overflow-hidden">
            <img 
              src={satelliteImages[selectedImage]?.url || 'https://via.placeholder.com/600x400?text=Satellite+Image'} 
              alt="Satellite view" 
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {satelliteImages[selectedImage]?.date && (
                <span>
                  {new Date(satelliteImages[selectedImage].date).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedImage(prev => (prev > 0 ? prev - 1 : satelliteImages.length - 1))}
                className="p-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedImage(prev => (prev < satelliteImages.length - 1 ? prev + 1 : 0))}
                className="p-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              {satelliteImages[selectedImage]?.description || 'Satellite imagery for project verification'}
            </p>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Image Timeline</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {satelliteImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`cursor-pointer border-2 rounded overflow-hidden ${
                      selectedImage === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={image.url} 
                        alt={`Satellite view ${index}`} 
                        className="object-cover" 
                      />
                    </div>
                    <div className="text-xs p-1 text-center text-gray-500 truncate">
                      {image.date && new Date(image.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Project Details</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><span className="font-medium">Location:</span> {project.location}</div>
                <div><span className="font-medium">Coordinates:</span> {hasValidCoordinates() ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}` : 'Not available'}</div>
                <div><span className="font-medium">Area:</span> {project.area} hectares</div>
              </div>
            </div>
            
            {verification && verification.status === 'approved' && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Verification Result</h4>
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Verified Area:</span> {verification?.results?.verifiedArea || project.area} hectares
                  </div>
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Carbon Sequestration Rate:</span> {verification?.results?.sequestrationRate || '5.2'} tCO₂e/ha/year
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}