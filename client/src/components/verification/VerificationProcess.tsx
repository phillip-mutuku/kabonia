'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { createToken } from '@/store/slices/tokenSlice';
import { verificationService } from '@/services/verificationService';
import { tokenService } from '@/services/tokenService';
import { VerificationBadge } from './VerificationBadge';

interface VerificationProcessProps {
  project: {
    _id: string;
    name: string;
    description: string;
    location: string;
    area: number;
    projectType: string;
    verificationStatus?: string;
  };
}

export const VerificationProcess: React.FC<VerificationProcessProps> = ({ project }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [error, setError] = useState('');
  const [projectToken, setProjectToken] = useState<any>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  // Fetch verification data if already started
  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const verification = await verificationService.getProjectVerification(project._id);
        setVerification(verification);
        
        // Check if verification exists before accessing properties
        if (verification) {
          // Set step based on verification status
          if (verification.status === 'pending') {
            setStep(3);
          } else if (verification.status === 'in_progress') {
            setStep(4);
          } else if (verification.status === 'approved' || verification.status === 'rejected') {
            setStep(5);
            
            // Check if a token exists for this project
            if (verification.status === 'approved') {
              checkForProjectToken();
            }
          }
        }
      } catch (error) {
        console.log('No verification found or error:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (project._id) {
      fetchVerification();
    }
  }, [project._id]);

  // Check if a token exists for this project
  const checkForProjectToken = async () => {
    try {
      const tokens = await tokenService.getProjectTokens(project._id);
      if (tokens && tokens.data && tokens.data.length > 0) {
        setProjectToken(tokens.data[0]);
      }
    } catch (error) {
      console.error('Error checking for project token:', error);
    }
  };

  // Create a token for this project
  const handleCreateToken = async () => {
    try {
      setIsCreatingToken(true);
      setError('');
      
      await dispatch(createToken({
        projectId: project._id,
        tokenName: `${project.name} Credits`,
        tokenSymbol: `${project.projectType.substring(0, 3).toUpperCase()}`,
        initialSupply: 0,
        decimals: 2
      }) as any);
      
      // Refresh token information
      await checkForProjectToken();
      setIsCreatingToken(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create token');
      setIsCreatingToken(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (step === 2) {
      try {
        setLoading(true);
        setError('');
        
        // Use the new combined method
        await verificationService.submitProjectForVerification(
          project._id,
          {
            documents: documents,
            additionalInfo: additionalInfo
          }
        );
        
        // Move to next step after successful submission
        setStep(3);
      } catch (error: any) {
        setError(error.message || 'Failed to submit for verification');
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const renderVerificationResults = () => {
    if (!verification) return null;

    if (verification.status === 'approved') {
      return (
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Verification Approved!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your project has been successfully verified.</p>
                
                {verification.results && (
                  <div className="mt-2">
                    <p className="font-medium">Carbon Credits Awarded:</p>
                    <p className="text-2xl font-bold">{verification.results.carbonCredits}</p>
                    
                    {verification.results.recommendations && verification.results.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Recommendations:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {verification.results.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4">
                  {projectToken ? (
                    <Button
                      variant="primary"
                      onClick={() => window.location.href = `/tokens/mint?project=${project._id}`}
                    >
                      Mint Carbon Credits
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleCreateToken}
                      isLoading={isCreatingToken}
                    >
                      Create Token for This Project
                    </Button>
                  )}
                </div>
                
                {/* Show token info if exists */}
                {projectToken && (
                  <div className="mt-4 p-3 bg-white rounded-md border border-green-100">
                    <p className="font-medium text-gray-700">Project Token:</p>
                    <p className="text-sm text-gray-600">{projectToken.tokenId}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {new Date(projectToken.creationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (verification.status === 'rejected') {
      return (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Verification Rejected</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Unfortunately, your project verification was not approved.</p>
                
                {verification.comments && (
                  <div className="mt-2">
                    <p className="font-medium">Reason:</p>
                    <p className="mt-1">{verification.comments}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(1)}
                  >
                    Restart Verification Process
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Verification Process</h3>
          <VerificationBadge status={verification?.status || project.verificationStatus || 'pending'} />
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Follow these steps to verify your carbon project and mint carbon credits.
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
      ) : (
        <div className="px-4 py-5 sm:p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((currentStep) => (
                <React.Fragment key={currentStep}>
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      step >= currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > currentStep ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{currentStep}</span>
                    )}
                  </div>
                  {currentStep < 5 && (
                    <div
                      className={`h-0.5 w-full ${
                        step > currentStep ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-5 text-center">
              <div className="text-xs font-medium text-gray-700">Eligibility</div>
              <div className="text-xs font-medium text-gray-700">Documents</div>
              <div className="text-xs font-medium text-gray-700">Submitted</div>
              <div className="text-xs font-medium text-gray-700">Review</div>
              <div className="text-xs font-medium text-gray-700">Results</div>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Project Eligibility Check</h4>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">Your project meets the basic eligibility criteria.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="px-4 py-5 bg-gray-50 sm:p-6">
                      <h5 className="text-sm font-medium text-gray-700">Project Details</h5>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                          <dd className="mt-1 text-sm text-gray-900">{project.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Location</dt>
                          <dd className="mt-1 text-sm text-gray-900">{project.location}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Area</dt>
                          <dd className="mt-1 text-sm text-gray-900">{project.area} hectares</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900 line-clamp-3">{project.description}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button onClick={handleSubmit} variant="primary">
                    Continue to Document Submission
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Document Submission</h4>
                <p className="mb-4 text-sm text-gray-600">
                  Please upload the required documents to support your project verification. The more comprehensive
                  your documentation, the more accurate your carbon credit allocation will be.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Required Documents</label>
                    <div className="mt-1 bg-white p-4 border border-gray-300 rounded-md">
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Project boundary documentation (maps, GIS files)
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Methodology documentation
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Baseline carbon calculations
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Proof of ownership or right to carbon credits
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Monitoring plan
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Documents</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG, GIS files up to 10MB</p>
                      </div>
                    </div>
                    {documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{documents.length} files selected</p>
                        <ul className="mt-1 text-xs text-gray-500">
                          {Array.from(documents).map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                      Additional Information
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        rows={4}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Provide any additional context about your project that will help with verification..."
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
                
                <div className="mt-6 flex space-x-3">
                  <Button onClick={() => setStep(1)} variant="secondary">
                    Back
                  </Button>
                  <Button
                  onClick={handleSubmit}
                  variant="primary"
                  isLoading={loading}
                  disabled={documents.length === 0 || project.status !== 'draft'}
                >
                  Submit for Verification
                </Button>
                </div>
                {project.status !== 'draft' && (
                <div className="mt-2 text-sm text-amber-600">
                  This project has already been submitted for verification.
                </div>
              )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Verification Submitted</h4>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Your verification request has been submitted. Our verification team will review your project
                        and documentation. This process usually takes 3-14 days.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border border-gray-200 rounded-md overflow-hidden">
                  <div className="px-4 py-5 bg-gray-50 sm:p-6">
                    <h5 className="text-sm font-medium text-gray-700">Verification Details</h5>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {verification && new Date(verification.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                          <VerificationBadge status={verification?.status || 'pending'} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Documents Submitted</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {verification?.documents?.length || 0} files
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estimated Completion</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {verification && 
                            new Date(new Date(verification.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="secondary"
                  >
                    Refresh Status
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Verification In Progress</h4>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your verification is currently being reviewed by our team. You will be notified once
                        the review is complete.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border border-gray-200 rounded-md overflow-hidden">
                  <div className="px-4 py-5 bg-gray-50 sm:p-6">
                    <h5 className="text-sm font-medium text-gray-700">Verification Progress</h5>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">Document Validation</div>
                          <div className="text-sm text-green-600">Completed</div>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">Methodology Assessment</div>
                          <div className="text-sm text-green-600">Completed</div>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">Carbon Calculation Review</div>
                          <div className="text-sm text-yellow-600">In Progress</div>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">Final Approval</div>
                          <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-gray-300 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="secondary"
                  >
                    Refresh Status
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && renderVerificationResults()}
          </div>
        </div>
      )}
    </Card>
  );
};