import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useModal } from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import NotAuthorized from './NotAuthorized';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { modal, showModal } = useModal();

  if (!user || user.role !== 'admin') {
    return <NotAuthorized />;
  }
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 60,
    passingScore: 50,
    negativeMarking: false,
    negativeMarkingValue: 0,
    maxAttempts: 1
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestData({
      ...testData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tests', testData);
      showModal({
        title: 'Success',
        message: 'Test created successfully!',
        onConfirm: () => navigate('/admin/tests'),
        confirmText: 'Go to Manage Tests',
        type: 'confirm'
      });
    } catch (err) {
      console.error(err);
      showModal({
        title: 'Error',
        message: 'Failed to create test. Please try again.',
        type: 'confirm'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button onClick={() => navigate('/dashboard')} className="bg-gray-600 text-white px-4 py-2 rounded">Back to Dashboard</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Test</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Test Title</label>
              <input
                type="text"
                name="title"
                value={testData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={testData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={testData.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
                <input
                  type="number"
                  name="passingScore"
                  value={testData.passingScore}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Attempts</label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={testData.maxAttempts}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="negativeMarking"
                checked={testData.negativeMarking}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Enable Negative Marking</label>
            </div>

            {testData.negativeMarking && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Negative Marking Value (per wrong answer)</label>
                <input
                  type="number"
                  name="negativeMarkingValue"
                  value={testData.negativeMarkingValue}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Test
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow cursor-pointer hover:bg-blue-600" onClick={() => navigate('/admin/tests')}>
            <h3 className="text-xl font-semibold">Manage Tests</h3>
            <p>Create, edit, and manage your tests.</p>
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-lg shadow cursor-pointer hover:bg-purple-600" onClick={() => navigate('/admin/test-results')}>
            <h3 className="text-xl font-semibold">Test Results</h3>
            <p>View and analyze test results.</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg shadow cursor-pointer hover:bg-green-600" onClick={() => navigate('/admin/analytics')}>
            <h3 className="text-xl font-semibold">Analytics</h3>
            <p>View detailed analytics and reports.</p>
          </div>
        </div>
      </main>
      {modal}
    </div>
  );
};

export default AdminDashboard;