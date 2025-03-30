'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { 
  LogOut,  
  AlertTriangle,
  ChevronDown,
  Edit,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout, getProfile } from '@/store/slices/userSlice';
import { projectService } from '@/services/projectService';
import { carbonCalculationService } from '@/services/carbonCalculationService';
import { Project, ProjectStatus } from '@/types/project';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState({ 
    totalProjects: 0, 
    pendingVerification: 0, 
    activeProjects: 0, 
    completedProjects: 0 
  });
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentEditProject, setCurrentEditProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(true);


  async function fetchDashboardData() {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    try {
      setIsLoading(true);
      
      // Fetch pending projects
      const pendingProjectsResult = await projectService.getProjects({ 
        status: ProjectStatus.PENDING_VERIFICATION
      });
      setPendingProjects(pendingProjectsResult.data);
      
      // Fetch all projects
      const allProjectsResult = await projectService.getProjects();
      setAllProjects(allProjectsResult.data);
      
      // Calculate statistics
      const activeProjects = allProjectsResult.data.filter(p => p.status === ProjectStatus.ACTIVE).length;
      const completedProjects = allProjectsResult.data.filter(p => p.status === ProjectStatus.COMPLETED).length;
      const pendingVerification = allProjectsResult.data.filter(p => p.status === ProjectStatus.PENDING_VERIFICATION).length;
      
      setStatistics({
        totalProjects: allProjectsResult.count,
        pendingVerification,
        activeProjects,
        completedProjects
      });
      
      setIsAdmin(true);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }
  

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!currentUser) {
          await dispatch(getProfile() as any).unwrap();
        }
        
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }
        
        if (currentUser && currentUser.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }
        
        // User is admin, load admin data
        fetchDashboardData();
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };
    
    checkAdmin();
  }, [currentUser, isAuthenticated, dispatch, router]);

  // Handle logout using Redux
  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };


  async function handleVerifyProject(projectId: string, approve: boolean) {
    try {
      if (approve) {
        await projectService.updateProject(projectId, {
          status: ProjectStatus.VERIFIED
        });
      } else {
        await projectService.updateProject(projectId, {
          status: ProjectStatus.DRAFT
        });
      }
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Project verification error:', error);
      alert('Failed to update project status. Please try again.');
    }
  }

  async function handleStatusChange(projectId: string, newStatus: ProjectStatus) {
    try {
      // If changing to VERIFIED status, calculate carbon credits
      if (newStatus === ProjectStatus.VERIFIED) {
        // Find the current project in your state
        const project = allProjects.find(p => p._id === projectId);
        
        if (project) {
          // Calculate carbon credits using the service
          const calculatedCredits = carbonCalculationService.calculateCredits(project);
          
          // Update project with both status and calculated credits
          await projectService.updateProject(projectId, {
            status: newStatus,
            carbonCredits: calculatedCredits
          });
          
          alert(`Project verified and ${calculatedCredits} carbon credits calculated.`);
        } else {
          // Just update status if project not found in state
          await projectService.updateProject(projectId, {
            status: newStatus
          });
        }
      } else {
        // For other status changes, just update the status
        await projectService.updateProject(projectId, {
          status: newStatus
        });
      }
      
      // Close modal if open
      setIsEditModalOpen(false);
      setCurrentEditProject(null);
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Project status update error:', error);
      alert('Failed to update project status. Please try again.');
    }
  };

  
  // Function to get a readable status display
  const formatStatus = (status: ProjectStatus): string => {
    return status.replace('_', ' ').split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter projects based on status filter and search term
  const filteredProjects = allProjects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4 text-maroon-600">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-4">Access Restricted</h1>
          <p className="text-gray-600 text-center mb-6">
            This page is only accessible to administrators. 
            Please log in with an admin account or contact your system administrator.
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <span className="px-4 py-2 bg-maroon-600 text-white rounded hover:bg-maroon-700 transition-colors">
                Return to Login
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-maroon-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-600">

      {/* Main content */}
      <div>
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          
          <div className="flex items-center space-x-4">          
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-maroon-600 hover:bg-maroon-700 text-red-950 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Projects"
              value={statistics.totalProjects}
              color="bg-gradient-to-br from-blue-500 to-blue-700"
            />
            <StatCard
              title="Pending Verification"
              value={statistics.pendingVerification}
              color="bg-gradient-to-br from-yellow-500 to-yellow-700"
            />
            <StatCard
              title="Active Projects"
              value={statistics.activeProjects}
              color="bg-gradient-to-br from-green-500 to-green-700"
            />
            <StatCard
              title="Completed Projects"
              value={statistics.completedProjects}
              color="bg-gradient-to-br from-purple-500 to-purple-700"
            />
          </div>

          {/* Pending Verifications */}
          <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
            <div className="bg-maroon-800 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Pending Verification</h2>
              <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                {pendingProjects.length} Projects
              </span>
            </div>
            
            {pendingProjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Carbon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingProjects.map((project) => (
                      <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500">ID: {project._id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                            {project.projectType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.estimatedCarbonCapture || 'N/A'} tons
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleVerifyProject(project._id, true)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleVerifyProject(project._id, false)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">No pending projects found</p>
              </div>
            )}
          </div>

          {/* All Projects */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-maroon-800 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Projects</h2>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-white" />
                <select 
                  className="bg-maroon-700 text-white text-sm rounded-md border-none focus:ring-2 focus:ring-yellow-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value={ProjectStatus.DRAFT}>Draft</option>
                  <option value={ProjectStatus.PENDING_VERIFICATION}>Pending</option>
                  <option value={ProjectStatus.VERIFIED}>Verified</option>
                  <option value={ProjectStatus.ACTIVE}>Active</option>
                  <option value={ProjectStatus.COMPLETED}>Completed</option>
                </select>
              </div>
            </div>
            
            {filteredProjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Carbon Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProjects.map((project) => (
                      <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500">ID: {project._id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.projectType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === ProjectStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                            project.status === ProjectStatus.PENDING_VERIFICATION ? 'bg-yellow-100 text-yellow-800' :
                            project.status === ProjectStatus.VERIFIED ? 'bg-blue-100 text-blue-800' :
                            project.status === ProjectStatus.COMPLETED ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatStatus(project.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.carbonCredits || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setCurrentEditProject(project);
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-maroon-600 text-maroon-600 rounded-md hover:bg-maroon-50 transition-colors text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">No projects found matching the current filters</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Status Edit Modal */}
      {isEditModalOpen && currentEditProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Change Project Status
            </h3>
            <p className="mb-4 text-gray-600">
              Project: <span className="font-medium text-gray-900">{currentEditProject.name}</span>
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status: <span className="font-semibold">{formatStatus(currentEditProject.status)}</span>
              </label>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status:
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.values(ProjectStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(currentEditProject._id, status)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${currentEditProject.status === status 
                        ? 'bg-gray-100 border-2 border-gray-300 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 hover:bg-gray-50'}
                    `}
                    disabled={currentEditProject.status === status}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentEditProject(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Navigation Item Component
function NavItem({ icon, label, href, isActive = false, isSidebarOpen }: { 
  icon: React.ReactNode; 
  label: string; 
  href: string; 
  isActive?: boolean;
  isSidebarOpen: boolean;
}) {
  return (
    <Link href={href}>
      <div className={`
        flex items-center px-6 py-3 mb-2 
        ${isActive ? 'bg-maroon-700 text-white' : 'text-gray-300 hover:bg-maroon-700 hover:text-white'} 
        transition-colors rounded-lg mx-3
      `}>
        <div className={isSidebarOpen ? '' : 'mx-auto'}>
          {icon}
        </div>
        {isSidebarOpen && <span className="ml-3">{label}</span>}
      </div>
    </Link>
  );
}

// Stat Card Component
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`${color} h-2`}></div>
      <div className="p-6">
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </div>
  );
}