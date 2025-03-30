'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { 
  getProjects, 
  ProjectQueryOptions 
} from '@/store/slices/projectSlice';
import { 
  getTokens, 
  TokenQueryOptions 
} from '@/store/slices/tokenSlice';
import { 
  getMarketSummary 
} from '@/store/slices/marketSlice';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { ImpactMetrics } from '@/components/dashboard/ImpactMetrics';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

// Import types
import { Project } from '@/types/project';
import { Token } from '@/types/token';
import { MarketSummary } from '@/types/market';

export default function Dashboard() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const { currentUser: user } = useSelector((state: RootState) => state.user);
  const { projects } = useSelector((state: RootState) => state.project);
  const { tokens } = useSelector((state: RootState) => state.token);
  const { marketSummary: marketStats } = useSelector((state: RootState) => state.market);

  useEffect(() => {
    const projectOptions: ProjectQueryOptions = {};
    const tokenOptions: TokenQueryOptions = {};

    dispatch(getProjects(projectOptions));
    dispatch(getTokens(tokenOptions));
    dispatch(getMarketSummary());
  }, [dispatch]);

  // Safely calculate dashboard statistics
  const totalProjects = projects?.length || 0;
  const totalTokens = tokens?.reduce((sum: number, token: Token) => 
    sum + (token.amount || 0), 0) || 0;
  const totalValue = tokens?.reduce((sum: number, token: Token) => 
    sum + ((token.amount || 0) * (token.currentPrice || 0)), 0) || 0;
  const carbonOffset = tokens?.reduce((sum: number, token: Token) => 
    sum + (token.carbonOffset || 0), 0) || 0;

  // Transform market summary to dashboard stats
  const transformedMarketStats = marketStats ? [
    { 
      name: 'Total Volume', 
      value: marketStats.totalVolume?.toFixed(2) || '0.00', 
      trend: (marketStats.volumeChange24h || 0) >= 0 ? 'up' : 'down', 
      change: `${Math.abs(marketStats.volumeChange24h || 0).toFixed(2)}%` 
    },
    { 
      name: 'Avg Price', 
      value: marketStats.avgPrice?.toFixed(2) || '0.00', 
      trend: (marketStats.priceChange24h || 0) >= 0 ? 'up' : 'down', 
      change: `${Math.abs(marketStats.priceChange24h || 0).toFixed(2)}%` 
    }
  ] : [];
  
  // Dashboard summary stats with null checks
  const stats = [
    { 
      name: 'Total Projects', 
      value: totalProjects, 
      change: '+4%', 
      changeType: 'increase' 
    },
    { 
      name: 'Carbon Credits', 
      value: `${totalTokens?.toFixed(0) || '0'}`, 
      change: '+2.5%', 
      changeType: 'increase', 
      unit: 'tokens' 
    },
    { 
      name: 'Portfolio Value', 
      value: `$${totalValue?.toFixed(2) || '0.00'}`, 
      change: '+12%', 
      changeType: 'increase' 
    },
    { 
      name: 'Carbon Offset', 
      value: `${carbonOffset?.toFixed(2) || '0.00'}`, 
      change: '+18%', 
      changeType: 'increase', 
      unit: 'tons' 
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-red-900 to-yellow-800 p-10 rounded-lg shadow-md text-white mb-6">
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h2>
          <p className="mt-1 text-yellow-100">
            Here's an overview of your carbon credit portfolio and market activity.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="px-4 py-5 sm:p-6 border-l-4 border-red-800 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-gray-900">
                    {stat.value} {stat.unit}
                  </dd>
                </div>
                <div className={`flex items-center ${
                  stat.changeType === 'increase' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" 
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 011-1 1 1 0 011 1v7.586l2.293-2.293a1 1 0 011.414 0z" 
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="text-sm ml-1">{stat.change}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Portfolio Performance</h3>
            <div className="h-96">
              <PortfolioChart />
            </div>
          </Card>
          <Card className="col-span-1 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Carbon Impact</h3>
            <div className="h-96">
              <ImpactMetrics />
            </div>
          </Card>
        </div>

        {/* Market Insights */}
        <Card className="p-6 bg-gray-50 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-maroon-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">AI Market Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {transformedMarketStats.map((stat) => (
              <div key={stat.name} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{stat.name}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    stat.trend === 'up' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900 mt-1">${stat.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity and Market Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Recent Activity</h3>
            <div className="h-80 overflow-auto">
              <ActivityFeed />
            </div>
          </Card>
          <Card className="col-span-1 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Market Trends</h3>
            <dl className="space-y-4 h-80 overflow-auto">
              {transformedMarketStats.map((stat) => (
                <div key={stat.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors duration-200">
                  <dt className="text-sm font-medium text-gray-600">{stat.name}</dt>
                  <dd className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{stat.value}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      stat.trend === 'up' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                    </span>
                  </dd>
                </div>
              ))}
              
              {/* Additional market trend items */}
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors duration-200">
                <dt className="text-sm font-medium text-gray-600">Market Cap</dt>
                <dd className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">$45.2M</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    ↑ 3.4%
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors duration-200">
                <dt className="text-sm font-medium text-gray-600">Active Projects</dt>
                <dd className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">432</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    ↑ 5.2%
                  </span>
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <a 
                href="/marketplace" 
                className="text-sm font-medium text-red-800 hover:text-red-900 flex items-center"
              >
                View marketplace
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </Card>
        </div>

        {/* Project Highlights */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 pb-1 border-b-2 border-red-800">Project Highlights</h3>
            <a 
              href="/projects" 
              className="text-sm font-medium text-red-800 hover:text-red-900 flex items-center"
            >
              View all projects
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.slice(0, 3).map((project: Project) => (
              <Card key={project._id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 bg-gray-200 relative">
                  {project.images && project.images.length > 0 ? (
                    <img 
                      src={project.images[0]} 
                      alt={project.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-yellow-100">
                      <svg
                        className="h-16 w-16 text-red-800"
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
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium shadow-sm ${
                      project.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : project.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-4">
                  <h4 className="text-base font-medium text-gray-900 truncate">{project.name}</h4>
                  <p className="mt-1 text-sm text-gray-500 h-12 overflow-hidden">{project.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-500 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {project.carbonCredits !== undefined ? `${project.carbonCredits} credits` : 'N/A'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{project.location}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                  <a 
                    href={`/projects/${project._id}`}
                    className="text-sm font-medium text-red-800 hover:text-red-900 flex items-center"
                  >
                    View details
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}