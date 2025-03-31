'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getProjectById } from '@/store/slices/projectSlice';
import { mintTokens, createToken, getProjectTokens } from '@/store/slices/tokenSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function MintTokensPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams ? searchParams.get('project') : null;
  
  const [amount, setAmount] = useState<number>(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  
  const { currentProject, isLoading: projectLoading } = useSelector((state: RootState) => state.project);
  const { projectTokens, isLoading: tokenLoading } = useSelector((state: RootState) => state.token);
  const loading = projectLoading || tokenLoading || isCreatingToken;

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId) as any);
      dispatch(getProjectTokens(projectId) as any);
    }
  }, [dispatch, projectId]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) {
      setError('Project not found');
      return;
    }
    
    if (!currentProject.carbonCredits || currentProject.carbonCredits <= 0) {
      setError('This project has no carbon credits available for minting');
      return;
    }
    
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    if (amount > currentProject.carbonCredits) {
      setError(`Amount exceeds available credits (${currentProject.carbonCredits})`);
      return;
    }
    
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    try {
      // Check if the project already has a token
      if (projectTokens.length === 0) {
        // Create a token first
        setIsCreatingToken(true);
        
        // Match the exact property names expected by your backend
        await dispatch(createToken({
          projectId: currentProject._id,
          initialSupply: 0,
          tokenName: `${currentProject.name} Credits`,
          tokenSymbol: `${currentProject.projectType.substring(0, 3).toUpperCase()}`,
          decimals: 2
        }) as any);
        
        // Refresh the project tokens
        await dispatch(getProjectTokens(projectId as string) as any);
        setIsCreatingToken(false);
      }
      
      // Get the token ID from the first project token
      const tokenId = projectTokens[0]?.tokenId;
      
      if (!tokenId) {
        throw new Error('Failed to find token for this project');
      }
      
      // Now mint tokens with the correct token ID and match backend expected properties
      await dispatch(mintTokens({
        tokenId: tokenId,
        amount: amount,
        ownerId: currentProject.owner
      }) as any);
      
      // Redirect to tokens page
      router.push('/tokens');
    } catch (err) {
      setError(`Failed to mint tokens: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error minting tokens:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mint Carbon Credits</h1>
          <p className="mt-1 text-sm text-gray-500">
            Mint carbon credits from your verified projects
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
            <p className="ml-3">
              {isCreatingToken ? 'Creating token for your project...' : 'Loading...'}
            </p>
          </div>
        ) : !projectId ? (
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No project selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please select a project to mint carbon credits from.
              </p>
              <div className="mt-6">
                <Link href="/projects">
                  <Button variant="primary">
                    View Your Projects
                  </Button>
                </Link>
              </div>
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
        ) : !currentProject.carbonCredits || currentProject.carbonCredits <= 0 ? (
          <Card className="p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Carbon Credits Available</h3>
              <p className="mt-1 text-sm text-gray-500">
                This project has no carbon credits available for minting.
              </p>
              <div className="mt-6">
                <Link href={`/projects/${projectId}`}>
                  <Button variant="primary">
                    Back to Project
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mint Credits from {currentProject.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                You can mint up to {currentProject.carbonCredits} carbon credits from this project.
              </p>
              {projectTokens.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  Project token: {projectTokens[0].tokenId}
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Project Information</h4>
                  <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentProject.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Project Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentProject.projectType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentProject.location}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Available Credits</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentProject.carbonCredits}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-base font-medium text-gray-900">Mint Details</h4>
                  <div className="mt-4 space-y-4">
                    <Input
                      id="amount"
                      label="Number of Credits to Mint"
                      type="number"
                      min={1}
                      max={currentProject.carbonCredits}
                      value={amount}
                      onChange={handleAmountChange}
                      helperText={`Maximum: ${currentProject.carbonCredits} credits`}
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {showConfirmation ? (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Confirmation</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>You are about to mint {amount} carbon credits from {currentProject.name}.</p>
                            <p className="mt-1">Please confirm to proceed with the minting process.</p>
                            {projectTokens.length === 0 && (
                              <p className="mt-2 font-semibold">Note: A token will be created for this project first before minting.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowConfirmation(false)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={loading}
                      >
                        Confirm Minting
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <Link href={`/projects/${projectId}`}>
                        <Button
                          type="button"
                          variant="secondary"
                        >
                          Cancel
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={loading}
                      >
                        Mint Credits
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}