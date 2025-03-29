'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { createProject } from '@/store/slices/projectSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useRouter } from 'next/navigation';
import { ProjectType } from '@/types/project';

export default function CreateProjectPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading: loading, error } = useSelector((state: RootState) => state.project);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedCarbonCapture: '',
    location: '',
    area: '',
    projectType: '',
    startDate: '',
    endDate: '',
    images: [] as File[],
    coordinates: {
      lat: '',
      lng: ''
    }
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    location: '',
    area: '',
    projectType: '',
    startDate: '',
    endDate: '',
    coordinates: ''
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const projectTypes = [
    'Reforestation',
    'Solar',
    'Wind',
    'Conservation',
    'Methane Capture',
    'Energy Efficiency',
    'Biomass'
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for the field
    if (name in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: files
      }));
      
      // Create preview for the first image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      location: '',
      area: '',
      projectType: '',
      startDate: '',
      endDate: '',
      coordinates: ''
    };
    let isValid = true;
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }
    
    if (!formData.area) {
      newErrors.area = 'Area is required';
      isValid = false;
    } else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      newErrors.area = 'Area must be a positive number';
      isValid = false;
    }
    
    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
      isValid = false;
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
      isValid = false;
    }
    
    // Check if both lat and lng are provided or both are empty
    if ((formData.coordinates.lat && !formData.coordinates.lng) || (!formData.coordinates.lat && formData.coordinates.lng)) {
      newErrors.coordinates = 'Both latitude and longitude are required';
      isValid = false;
    }
    
    // Check if lat and lng are valid numbers
    if (formData.coordinates.lat && formData.coordinates.lng) {
      const lat = Number(formData.coordinates.lat);
      const lng = Number(formData.coordinates.lng);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.coordinates = 'Latitude must be between -90 and 90';
        isValid = false;
      } else if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.coordinates = 'Longitude must be between -180 and 180';
        isValid = false;
      }
    }
    
    setFormErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format dates correctly (ISO strings)
    const startDate = formData.startDate ? new Date(formData.startDate).toISOString() : undefined;
    const endDate = formData.endDate ? new Date(formData.endDate).toISOString() : undefined;
    
    // Build project data
    const projectData: any = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      area: Number(formData.area),
      projectType: formData.projectType as ProjectType,
      estimatedCarbonCapture: Number(formData.estimatedCarbonCapture),
      startDate,
      endDate
    };
    
    // Add coordinates in GeoJSON format if provided
    if (formData.coordinates.lat && formData.coordinates.lng) {
      projectData.coordinates = {
        type: 'Point',
        coordinates: [
          Number(formData.coordinates.lng),
          Number(formData.coordinates.lat)
        ]
      };
    }
    
    try {
      console.log('Submitting project data:', projectData);
      const resultAction = await dispatch(createProject(projectData) as any);
      
      if (createProject.fulfilled.match(resultAction)) {
        router.push('/projects');
      } else {
        console.error('Error in project creation:', resultAction.payload);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <p className="mt-1 text-sm text-gray-500">
            Provide details about your carbon credit project.
          </p>
        </div>
        
        <Card className="overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Fill in the basic details for your carbon credit project.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">There was an error creating your project</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {typeof error === 'string' && (
                <div className="rounded-md bg-red-50 p-4 mt-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">API Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Project Name"
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    error={formErrors.name}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Estimated Carbon Capture (tons of CO2)"
                    id="estimatedCarbonCapture"
                    name="estimatedCarbonCapture"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.estimatedCarbonCapture}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className={`shadow-sm block w-full sm:text-sm rounded-md ${
                        formErrors.description 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {formErrors.description && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Location"
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    error={formErrors.location}
                    required
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>

                <div>
                  <Input
                    label="Area (hectares)"
                    id="area"
                    name="area"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.area}
                    onChange={handleChange}
                    error={formErrors.area}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">
                    Project Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="projectType"
                      name="projectType"
                      className={`shadow-sm block w-full sm:text-sm rounded-md ${
                        formErrors.projectType 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      value={formData.projectType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a project type</option>
                      {projectTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {formErrors.projectType && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.projectType}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Start Date"
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    error={formErrors.startDate}
                  />
                </div>

                <div>
                  <Input
                    label="End Date"
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    error={formErrors.endDate}
                  />
                </div>

                <div>
                  <Input
                    label="Latitude"
                    id="lat"
                    name="lat"
                    type="text"
                    value={formData.coordinates.lat}
                    onChange={handleChange}
                    placeholder="e.g., 0.3136"
                  />
                </div>

                <div>
                  <Input
                    label="Longitude"
                    id="lng"
                    name="lng"
                    type="text"
                    value={formData.coordinates.lng}
                    onChange={handleChange}
                    placeholder="e.g., 37.9062"
                  />
                </div>
                {formErrors.coordinates && (
                  <div className="sm:col-span-2">
                    <p className="mt-2 text-sm text-red-600">{formErrors.coordinates}</p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Project Images</label>
                  <div className="mt-1 flex items-center">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Project preview" 
                          className="h-32 w-32 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-md border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400">
                          <svg
                            className="h-10 w-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-5">
                      <div className="relative">
                        <div className="relative flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <label
                            htmlFor="images-upload"
                            className="cursor-pointer"
                          >
                            Upload Images
                            <input
                              id="images-upload"
                              name="images"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              multiple
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Upload images of your project area. PNG, JPG, JPEG up to 10MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => router.push('/projects')}
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="ml-3"
                    isLoading={loading}
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}