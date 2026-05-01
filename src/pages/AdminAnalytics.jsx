import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import NotAuthorized from './NotAuthorized';
import Loader from '../components/Loader';

const AdminAnalytics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <NotAuthorized />;
  }
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loader message="Loading analytics..." />;

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <a href="/dashboard" className="text-indigo-600 hover:text-indigo-900">Back to Dashboard</a>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <a href="/dashboard" className="text-indigo-600 hover:text-indigo-900">Back to Dashboard</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Overview Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-indigo-600">{analytics.totalStudents}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Tests</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.totalTests}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Attempts</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalAttempts}</p>
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top 3 Students by Average Score</h3>
          {analytics.topStudents.length > 0 ? (
            <div className="space-y-4">
              {analytics.topStudents.map((student, index) => (
                <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{student.averageScore.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">{student.totalAttempts} attempts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No student data available.</p>
          )}
        </div>

        {/* Test Performance */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Performance Overview</h3>
          {analytics.testPerformance.length > 0 ? (
            <div className="space-y-4">
              {analytics.testPerformance.map(test => (
                <div key={test._id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{test.title}</h4>
                    <span className="text-sm text-gray-500">{test.attemptsCount} attempts</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Average Score</p>
                      <p className="font-semibold text-indigo-600">{test.averageScore.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Highest Score</p>
                      <p className="font-semibold text-green-600">{test.highestScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Lowest Score</p>
                      <p className="font-semibold text-red-600">{test.lowestScore}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No test performance data available.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    activity.type === 'test_completed' ? 'bg-green-100 text-green-800' :
                    activity.type === 'test_created' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;