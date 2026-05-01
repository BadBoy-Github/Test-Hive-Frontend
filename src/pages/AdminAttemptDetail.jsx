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
            <h1 className="text-3xl font-bold text-gray-900">{attempt.testId.title} - Attempt by {attempt.userId.name}</h1>
            <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-900">Back</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Attempt Details</h2>
              <p className="text-sm text-gray-600">
                Completed on: {new Date(attempt.endTime).toLocaleDateString()} at {new Date(attempt.endTime).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{attempt.score} points</p>
              <p className="text-sm text-gray-500">
                Time taken: {attempt.totalTime ? `${Math.floor(attempt.totalTime)}:${Math.round((attempt.totalTime % 1) * 60).toString().padStart(2, '0')}` : 'N/A'}
              </p>
            </div>
          </div>

          {attempt.testId.showResults ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Results</h3>
              <div className="space-y-4">
                {attempt.answers && attempt.answers.map(answer => (
                  <div key={answer._id} className="border border-gray-200 rounded p-4">
                    <p className="font-medium text-gray-900">{answer.questionId.questionText}</p>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Student's Answer:</p>
                        <p className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {Array.isArray(answer.userAnswer)
                            ? answer.userAnswer.join(', ')
                            : (answer.userAnswer || 'Not answered')}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Correct Answer:</p>
                        <p className="font-medium text-green-600">
                          {Array.isArray(answer.questionId.correctAnswer)
                            ? answer.questionId.correctAnswer.join(', ')
                            : answer.questionId.correctAnswer}
                        </p>
                      </div>
                    </div>

                    {answer.questionId.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900">Explanation:</p>
                        <p className="text-sm text-blue-800">{answer.questionId.explanation}</p>
                      </div>
                    )}

                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-sm px-2 py-1 rounded ${
                        answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Marks: {answer.marksObtained}/{answer.questionId.marks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 rounded">
              <p className="text-yellow-800">
                Detailed results are not released yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAttemptDetail;