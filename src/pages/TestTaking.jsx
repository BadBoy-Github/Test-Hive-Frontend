import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useModal } from '../components/Modal';
import Loader from '../components/Loader';

const TestTaking = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { modal, showModal } = useModal();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabSwitches, setTabSwitches] = useState(0);

  const fetchTest = async () => {
    try {
      setLoading(true);

      const testRes = await API.get(`/tests/${testId}`);
      setTest(testRes.data);
      setTimeLeft(testRes.data.duration * 60);

      const questionsRes = await API.get(`/tests/${testId}/questions`);
      setQuestions(questionsRes.data);

      const attemptRes = await API.post(`/attempts/${testId}/start`);
      setAttemptId(attemptRes.data._id);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load test:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to load test';

      if (errorMessage.includes('Maximum attempts reached')) {
        showModal({
          title: 'Maximum Attempts Reached',
          message: `You have reached the maximum number of attempts (${error.response?.data?.maxAttempts || 'allowed'}) for this test.`,
          onConfirm: () => navigate('/dashboard'),
          confirmText: 'OK',
          type: 'confirm'
        });
        return;
      } else if (errorMessage.includes('not currently available')) {
        showModal({
          title: 'Test Unavailable',
          message: 'This test is not currently available.',
          onConfirm: () => navigate('/dashboard'),
          confirmText: 'OK',
          type: 'confirm'
        });
        return;
      }

      showModal({
        title: 'Error',
        message: errorMessage,
        onConfirm: () => navigate('/dashboard'),
        confirmText: 'OK',
        type: 'confirm'
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId) => {
    const answer = answers[questionId];
    await API.post(`/attempts/${attemptId}/answer`, {
      questionId,
      userAnswer: answer,
      timeTaken: 0 // Calculate properly
    });
  };

  const submitTest = async () => {
    if (!attemptId) {
      showModal({
        title: 'Error',
        message: 'Test session not properly initialized. Please try again.',
        onConfirm: () => navigate('/dashboard'),
        confirmText: 'OK',
        type: 'confirm'
      });
      return;
    }

    try {
      // Submit the current question's answer if not already submitted
      const currentQuestionId = questions[currentQuestion]._id;
      if (answers[currentQuestionId] !== undefined) {
        await submitAnswer(currentQuestionId);
      }

      await API.post(`/attempts/${attemptId}/complete`);
      showModal({
        title: 'Test Submitted',
        message: 'Your test has been submitted successfully!',
        onConfirm: () => navigate('/dashboard'),
        confirmText: 'OK',
        type: 'confirm'
      });
    } catch (error) {
      console.error('Failed to submit test:', error);
      showModal({
        title: 'Submission Error',
        message: 'Failed to submit test. Your progress may not have been saved.',
        onConfirm: () => navigate('/dashboard'),
        confirmText: 'OK',
        type: 'confirm'
      });
    }
  };

  useEffect(() => {
    fetchTest();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && test && attemptId) {
      submitTest();
    }
  }, [timeLeft, test, attemptId]);

  // Anti-cheat measures
  const MAX_TAB_SWITCHES = 3;
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount > MAX_TAB_SWITCHES) {
            submitTest();
          }
          return newCount;
        });
      }
    };

    const preventActions = (e) => {
      e.preventDefault();
      showModal({
        title: 'Action Not Allowed',
        message: 'Copy, paste, cut, or right-click is disabled during the test.',
        onConfirm: () => {},
        confirmText: 'OK',
        type: 'confirm'
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', preventActions);
    document.addEventListener('paste', preventActions);
    document.addEventListener('cut', preventActions);
    document.addEventListener('contextmenu', preventActions);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', preventActions);
      document.removeEventListener('paste', preventActions);
      document.removeEventListener('cut', preventActions);
      document.removeEventListener('contextmenu', preventActions);
    };
  }, [attemptId, showModal, submitTest]);

  const handleAnswer = (questionId, answer, isCheckbox = false) => {
    if (isCheckbox) {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      submitAnswer(questions[currentQuestion]._id);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading || !test || questions.length === 0) return <Loader message="Loading test..." />;

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{test.title}</h1>
          <div className="text-lg">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Question {currentQuestion + 1} of {questions.length}</h2>
          <p className="mb-4">{question.questionText}</p>

          {(question.type === 'mcq' || question.type === 'checkbox') && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type={question.type === 'mcq' ? 'radio' : 'checkbox'}
                    name={question.type === 'mcq' ? 'answer' : `answer-${index}`}
                    value={option}
                    checked={
                      question.type === 'mcq'
                        ? answers[question._id] === option
                        : (answers[question._id] || []).includes(option)
                    }
                    onChange={() => handleAnswer(question._id, option, question.type === 'checkbox')}
                    className="mr-2"
                  />
                  {String.fromCharCode(65 + index)}. {option}
                </label>
              ))}
            </div>
          )}

          {question.type === 'descriptive' && (
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
              placeholder="Enter your answer"
            />
          )}

          {question.type === 'coding' && (
            <textarea
              className="w-full p-2 border rounded font-mono text-sm"
              rows="12"
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
              placeholder="Write your code here..."
            />
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={prevQuestion} disabled={currentQuestion === 0} className="bg-gray-500 text-white px-4 py-2 rounded">Previous</button>
          {currentQuestion < questions.length - 1 ? (
            <button onClick={nextQuestion} className="bg-indigo-600 text-white px-4 py-2 rounded">Next</button>
          ) : (
            <button onClick={submitTest} className="bg-green-600 text-white px-4 py-2 rounded">Submit Test</button>
          )}
        </div>
      </main>
      {modal}
    </div>
  );
};

export default TestTaking;