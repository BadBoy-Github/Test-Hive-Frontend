import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import Loader from '../components/Loader';

const TestResultDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await API.get('/attempts/results');

      // Filter results for this specific test and sort by date
      const testResults = res.data
        .filter(result => result.testId._id === testId)
        .sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
      setResults(testResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user, testId]);

  if (authLoading || loading) return <Loader message="Loading detailed results..." />;
  if (!user) return <div>Please login to view results</div>;

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
              <a href="/results" className="text-indigo-600 hover:text-indigo-900">Back to Results</a>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for this test.</p>
          </div>
        </main>
      </div>
    );
  }

  const testTitle = results[0].testId.title;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">{testTitle} - Results</h1>
            <a href="/results" className="text-indigo-600 hover:text-indigo-900">Back to All Results</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {results.map(result => (
            <div key={result._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Attempt #{results.indexOf(result) + 1}</h2>
                  <p className="text-sm text-gray-600">
                    Completed on: {new Date(result.endTime).toLocaleDateString()} at {new Date(result.endTime).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{result.score} points</p>
                  <p className="text-sm text-gray-500">
                    Time taken: {result.totalTime ? `${Math.floor(result.totalTime)}:${Math.round((result.totalTime % 1) * 60).toString().padStart(2, '0')}` : 'N/A'}
                  </p>
                </div>
              </div>

              {result.testId.showResults ? (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Results</h3>
                  <div className="space-y-4">
                    {result.answers.map(answer => (
                      <div key={answer._id} className="border border-gray-200 rounded p-4">
                        <p className="font-medium text-gray-900">{answer.questionId.questionText}</p>

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Your Answer:</p>
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
                    Detailed results and correct answers will be available once the admin releases them.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TestResultDetail;