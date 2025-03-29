'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// Sample activity data (would come from API in real app)
const SAMPLE_ACTIVITIES = [
  {
    id: 1,
    type: 'purchase',
    message: 'You purchased 15 carbon credits from Amazon Rainforest Conservation Project',
    timestamp: '2023-03-24T14:32:00Z',
    amount: 15,
    value: 225.50,
    project: { name: 'Amazon Rainforest Conservation', id: 'proj123' }
  },
  {
    id: 2,
    type: 'sale',
    message: 'You sold 5 carbon credits to @greenhorizons',
    timestamp: '2023-03-20T09:45:00Z',
    amount: 5,
    value: 78.25,
    project: { name: 'Solar Farm Kenya', id: 'proj456' }
  },
  {
    id: 3,
    type: 'verification',
    message: 'Your project Reforestation Initiative was verified',
    timestamp: '2023-03-18T16:20:00Z',
    project: { name: 'Reforestation Initiative', id: 'proj789' }
  },
  {
    id: 4,
    type: 'minting',
    message: '20 new carbon credits were minted from your Wind Farm Project',
    timestamp: '2023-03-15T11:05:00Z',
    amount: 20,
    project: { name: 'Wind Farm Project', id: 'proj012' }
  },
  {
    id: 5,
    type: 'listing',
    message: 'You listed 10 carbon credits for sale at $16.50 each',
    timestamp: '2023-03-10T15:30:00Z',
    amount: 10,
    value: 165.00,
    project: { name: 'Solar Farm Kenya', id: 'proj456' }
  }
];

// Function to format date in a human-readable way
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }).format(date);
  }
};

// Function to get icon based on activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    case 'sale':
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      );
    case 'verification':
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
          <svg className="h-6 w-6 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'minting':
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center shadow-sm">
          <svg className="h-6 w-6 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'listing':
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center shadow-sm">
          <svg className="h-6 w-6 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

export const ActivityFeed: React.FC = () => {
  // In a real app, this would fetch activity data from the API
  // For now, we'll use the sample data
  const activities = SAMPLE_ACTIVITIES;

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index !== activities.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gradient-to-b from-red-300 to-yellow-300"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-4 group">
                {getActivityIcon(activity.type)}
                <div className="min-w-0 flex-1 pt-1.5 px-3 py-2 rounded-lg transition-colors duration-200 group-hover:bg-gray-50">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <div className="text-right text-xs whitespace-nowrap text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <time dateTime={activity.timestamp}>{formatDate(activity.timestamp)}</time>
                    </div>
                  </div>
                  {activity.amount && (
                    <p className="mt-1 text-xs text-gray-600 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded">
                      {activity.type === 'purchase' && `Purchased ${activity.amount} credits for ${activity.value?.toFixed(2)}`}
                      {activity.type === 'sale' && `Sold ${activity.amount} credits for ${activity.value?.toFixed(2)}`}
                      {activity.type === 'minting' && `Minted ${activity.amount} new credits`}
                      {activity.type === 'listing' && `Listed ${activity.amount} credits at ${(activity.value! / activity.amount).toFixed(2)} each`}
                    </p>
                  )}
                  {activity.project && (
                    <p className="mt-1 text-xs text-gray-600">
                      Project:{' '}
                      <a href={`/projects/${activity.project.id}`} className="font-medium text-red-800 hover:text-red-900 transition-colors duration-200">
                        {activity.project.name}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-center">
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-800 to-yellow-700 rounded-full hover:from-red-900 hover:to-yellow-800 shadow-sm hover:shadow transition-all duration-200">
          View all activity
        </button>
      </div>
    </div>
  );
};