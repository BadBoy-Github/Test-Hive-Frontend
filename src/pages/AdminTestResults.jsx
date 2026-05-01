import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import NotAuthorized from './NotAuthorized';

const AdminTestResults = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchTests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTests = async () => {
    try {
      const res = await API.get('/tests');
      setTests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForTest = async (testId) => {
    try {
      const res = await API.get(`/admin/tests/${testId}/attempts`);
      // Process attempts to group by student
      const studentMap = {};
      res.data.forEach(attempt => {
        const userId = attempt.user._id;
        if (!studentMap[userId]) {
          studentMap[userId] = {
            _id: userId,
            name: attempt.user.name,
            email: attempt.user.email,
            attempts: []
          };
        }
        studentMap[userId].attempts.push({
          _id: attempt._id,
          number: studentMap[userId].attempts.length + 1,
          score: attempt.score
        });
      });
      // Calculate latest score for each student
      const studentsArray = Object.values(studentMap).map(student => ({
        ...student,
        latestScore: Math.max(...student.attempts.map(a => a.score))
      }));
      setStudents(studentsArray);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') {
    return <NotAuthorized />;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
            <button onClick={() => navigate('/admin/create-test')} className="bg-indigo-600 text-white px-4 py-2 rounded">Back to Dashboard</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!selectedTest ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <div key={test._id} className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg" onClick={() => {
                setSelectedTest(test);
                fetchStudentsForTest(test._id);
              }}>
                <h3 className="text-xl font-semibold">{test.title}</h3>
                <p className="text-gray-600">{test.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedTest(null)} className="mb-4 bg-gray-600 text-white px-4 py-2 rounded">Back to Tests</button>
            <h2 className="text-2xl font-bold mb-4">{selectedTest.title} - Results</h2>
            <div className="space-y-4">
              {students
                .sort((a, b) => b.latestScore - a.latestScore) // Sort by latest score desc
                .map(student => (
                  <div key={student._id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">{student.name} ({student.email})</h3>
                    <p>Latest Score: {student.latestScore}</p>
                    <div className="mt-2 space-y-2">
                      {student.attempts.map(attempt => (
                        <div key={attempt._id} className="bg-gray-100 p-2 rounded cursor-pointer" onClick={() => navigate(`/admin/attempt/${attempt._id}`)}>
                          Attempt {attempt.number}: Score {attempt.score}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTestResults;