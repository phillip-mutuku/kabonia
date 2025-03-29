import React from 'react';

type VerificationStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'verified' | string;

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  // Normalize status
  const normalizedStatus = status.toLowerCase();
  
  let bgColor = '';
  let textColor = '';
  let icon = null;
  let label = '';
  
  // Set colors and icon based on status
  switch (normalizedStatus) {
    case 'approved':
    case 'verified':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = (
        <svg className="mr-1 h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
      label = 'Verified';
      break;
    case 'in_progress':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = (
        <svg className="mr-1 h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      label = 'In Progress';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = (
        <svg className="mr-1 h-3 w-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      label = 'Pending';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = (
        <svg className="mr-1 h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
      label = 'Rejected';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      icon = (
        <svg className="mr-1 h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      label = status.charAt(0).toUpperCase() + status.slice(1);
      break;
  }
  
  // Set size classes
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-1.5 py-0.5 text-xs';
      break;
    case 'lg':
      sizeClasses = 'px-3 py-1 text-sm';
      break;
    case 'md':
    default:
      sizeClasses = 'px-2 py-0.5 text-xs';
      break;
  }
  
  return (
    <span className={`inline-flex items-center rounded-full ${bgColor} ${textColor} ${sizeClasses} font-medium`}>
      {icon}
      {label}
    </span>
  );
};