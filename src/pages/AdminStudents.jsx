import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useModal } from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import NotAuthorized from './NotAuthorized';
import Loader from '../components/Loader';

const AdminStudents = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { modal, showModal } = useModal();

  if (!user || user.role !== 'admin') {
    return <NotAuthorized />;
  }
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const fetchStudents = async () => {
    try {
      const res = await API.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      email: '',
      phone: ''
    });
  };

  const startEditingStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      email: student.email,
      phone: student.phone
    });
    setShowStudentForm(true);
  };

  const cancelEditing = () => {
    setEditingStudent(null);
    setShowStudentForm(false);
    resetStudentForm();
  };

  const handleStudentFormChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const saveStudent = async () => {
    try {
      if (editingStudent) {
        await API.put(`/admin/students/${editingStudent._id}`, studentForm);
      } else {
        await API.post('/admin/students', studentForm);
      }
      fetchStudents();
      cancelEditing();
      showModal({
        title: 'Success',
        message: editingStudent ? 'Student updated successfully!' : 'Student added successfully!',
        type: 'confirm'
      });
    } catch (err) {
      console.error(err);
      showModal({
        title: 'Error',
        message: 'Failed to save student. Please try again.',
        type: 'confirm'
      });
    }
  };

  const deleteStudent = async (studentId, studentName) => {
    showModal({
      title: 'Delete Student',
      message: `Are you sure you want to delete "${studentName}"? This will permanently remove their account and all associated data. This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await API.delete(`/admin/students/${studentId}`);
          fetchStudents();
          showModal({
            title: 'Success',
            message: 'Student deleted successfully!',
            type: 'confirm'
          });
        } catch (err) {
          console.error(err);
          showModal({
            title: 'Error',
            message: 'Failed to delete student. Please try again.',
            type: 'confirm'
          });
        }
      },
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'cancel'
    });
  };

  if (loading) return <Loader message="Loading students..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <div className="flex space-x-4">
              {!showStudentForm && (
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    resetStudentForm();
                    setShowStudentForm(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Student
                </button>
              )}
              <button onClick={() => navigate('/dashboard')} className="bg-gray-600 text-white px-4 py-2 rounded">Back to Dashboard</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Students ({students.length})</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div key={student._id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-sm text-gray-500">{student.phone}</p>
                      <p className="text-xs text-gray-400">Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditingStudent(student)}
                        className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStudent(student._id, student.name)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Form */}
          {showStudentForm && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={studentForm.name}
                    onChange={handleStudentFormChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={studentForm.email}
                    onChange={handleStudentFormChange}
                    required
                    disabled={!!editingStudent} // Don't allow email changes for existing students
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={studentForm.phone}
                    onChange={handleStudentFormChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={saveStudent}
                    disabled={!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.phone.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {modal}
    </div>
  );
};

export default AdminStudents;