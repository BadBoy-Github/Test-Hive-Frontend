import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import NotAuthorized from './NotAuthorized';

const AdminAttemptDetail = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    return <NotAuthorized />;
  }

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      // Need a new endpoint to get attempt by id for admin
      const res = await API.get(`/admin/attempt/${attemptId}`);
      setAttempt(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!attempt) return <div>Attempt not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Attempt Details</h1>
            <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-900">Back</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Score: {attempt.score}</h2>
          {/* Display answers similar to TestResultDetail */}
          {attempt.answers && attempt.answers.map(answer => (
            <div key={answer._id} className="border p-4 mt-4">
              <p>{answer.questionId.questionText}</p>
              <p>Your answer: {answer.userAnswer}</p>
              <p>Correct: {answer.questionId.correctAnswer}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminAttemptDetail;