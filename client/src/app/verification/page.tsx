'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { VerificationProcess } from '@/components/verification/VerificationProcess';
import { SatelliteView } from '@/components/verification/SatelliteView';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import Link from 'next/link';
import { ProjectStatus } from '@/types/project';
import { getUserProjects } from '@/store/slices/projectSlice';
import { normalizeCoordinates } from '@/types';

export default function VerificationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userProjects, isLoading, isAuthenticated } = useSelector((state: RootState) => ({
    userProjects: state.project.userProjects,
    isLoading: state.project.isLoading,
    isAuthenticated: state.user.isAuthenticated
  }));
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
   // Filter projects that can be verified
   const verifiableProjects = userProjects.filter(
    project => project.status === ProjectStatus.DRAFT || 
               project.status === ProjectStatus.PENDING_VERIFICATION || 
               project.status === ProjectStatus.ACTIVE
  );
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserProjects());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    console.log('All user projects:', userProjects);
    console.log('Project statuses:', userProjects.map(p => p.status));

    // Debug coordinates for each project
    userProjects.forEach(project => {
      console.log(`Project ${project.name} coordinates:`, project.coordinates);
      const normalized = normalizeCoordinates(project.coordinates);
      console.log(`Project ${project.name} normalized coordinates:`, normalized);
    });
  }, [userProjects]);

  // Get the selected project
  const selectedProject = selectedProjectId
    ? userProjects.find(project => project._id === selectedProjectId)
    : null;

  // Set first project as selected by default if none is selected
  useEffect(() => {
    if (verifiableProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(verifiableProjects[0]._id);
    }
  }, [verifiableProjects, selectedProjectId]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Verification</h2>
          <p className="mt-1 text-sm text-gray-500">
            Verify your carbon projects to mint carbon credits.
          </p>
        </div>

        {/* Project Selection */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Project</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <svg
                className="animate-spin h-8 w-8 text-primary-600"
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
          ) : verifiableProjects.length === 0 ? (
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
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects available for verification</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a project first before starting the verification process.
              </p>
              <div className="mt-6">
                <Link href="/projects/create">
                  <Button variant="primary">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Project
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiableProjects.map((project) => (
                <div
                  key={project._id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedProjectId === project._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProjectId(project._id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-medium text-gray-900 truncate">{project.name}</h4>
                    <VerificationBadge status={project.verificationStatus || 'pending'} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className="font-medium">Area:</span>
                    <span className="ml-1">{project.area} hectares</span>
                    <span className="mx-1">•</span>
                    <span className="font-medium">Type:</span>
                    <span className="ml-1">{project.projectType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Verification Process */}
        {selectedProject && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VerificationProcess project={selectedProject} />
            </div>
            <div className="lg:col-span-1">
              <SatelliteView project={selectedProject} />
            </div>
          </div>
        )}

        {/* Verification FAQ */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verification FAQ</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-medium text-gray-900">What is the verification process?</h4>
              <p className="mt-1 text-sm text-gray-500">
                Verification is the process of validating your carbon project's claims through third-party assessment. Once verified, you can mint carbon credits that can be sold on the marketplace.
              </p>
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">How long does verification take?</h4>
              <p className="mt-1 text-sm text-gray-500">
                The verification process typically takes 3-14 days depending on the project complexity and required documentation.
              </p>
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">What documents do I need?</h4>
              <p className="mt-1 text-sm text-gray-500">
                Required documents include project boundaries, methodology documentation, baseline calculations, proof of ownership, and any relevant certificates or permits.
              </p>
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">How are carbon credits calculated?</h4>
              <p className="mt-1 text-sm text-gray-500">
                Carbon credits are calculated based on your project's carbon sequestration or emission reduction potential, following accepted methodologies for your project type.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}