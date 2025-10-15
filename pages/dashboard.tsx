import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { dashboardAPI, tasksAPI } from '@/utils/api';
import { FiCheckCircle, FiClock, FiFileText, FiAward, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        dashboardAPI.getStats(),
        tasksAPI.getTasks({ limit: 5 }),
      ]);
      setStats(statsRes.data.stats);
      setRecentTasks(tasksRes.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-myntra-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      completed: 'badge badge-success',
      in_progress: 'badge badge-info',
      pending: 'badge badge-warning',
      blocked: 'badge badge-danger',
    };
    return badges[status] || 'badge';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-myntra-primary">Myntra</h1>
              <p className="text-gray-600">Employee Onboarding</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-myntra-secondary">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.designation}</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/');
                }}
                className="text-sm text-myntra-primary hover:text-myntra-accent"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-myntra-primary to-myntra-accent rounded-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to Myntra! 🎉
          </h2>
          <p className="text-lg opacity-90">
            We're excited to have you on board. Let's get you started with your onboarding journey.
          </p>
          <div className="mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Onboarding Progress</span>
                <span className="font-bold text-xl">{stats?.onboarding?.progress || 0}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${stats?.onboarding?.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-myntra-secondary">
                  {stats?.tasks?.total || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiCheckCircle className="text-3xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.tasks?.completed || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiTrendingUp className="text-3xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Documents</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.documents?.verified || 0}/{stats?.documents?.total || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiFileText className="text-3xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Training</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.training?.completed || 0}/{stats?.training?.total || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FiAward className="text-3xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-myntra-secondary">Recent Tasks</h3>
            <button
              onClick={() => router.push('/tasks')}
              className="text-myntra-primary hover:text-myntra-accent text-sm font-semibold"
            >
              View All →
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiClock className="text-5xl mx-auto mb-3 opacity-50" />
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task: any) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-myntra-secondary mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(task.status)}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => router.push('/tasks')}
            className="card hover:shadow-xl transition-shadow text-left"
          >
            <FiCheckCircle className="text-4xl text-myntra-primary mb-3" />
            <h3 className="text-lg font-bold text-myntra-secondary mb-2">My Tasks</h3>
            <p className="text-sm text-gray-600">
              View and complete your onboarding tasks
            </p>
          </button>

          <button
            onClick={() => router.push('/documents')}
            className="card hover:shadow-xl transition-shadow text-left"
          >
            <FiFileText className="text-4xl text-myntra-primary mb-3" />
            <h3 className="text-lg font-bold text-myntra-secondary mb-2">Documents</h3>
            <p className="text-sm text-gray-600">
              Upload and manage your documents
            </p>
          </button>

          <button
            onClick={() => router.push('/training')}
            className="card hover:shadow-xl transition-shadow text-left"
          >
            <FiAward className="text-4xl text-myntra-primary mb-3" />
            <h3 className="text-lg font-bold text-myntra-secondary mb-2">Training</h3>
            <p className="text-sm text-gray-600">
              Complete your training modules
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
