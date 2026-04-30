import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useModal } from '../components/Modal';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { modal, showModal } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (_) {
      showModal({
        title: 'Login Failed',
        message: 'Invalid login credentials. Please check your email and password.',
        type: 'confirm'
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.name.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Name is required.',
        type: 'confirm'
      });
      return;
    }
    if (!formData.email.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Email is required.',
        type: 'confirm'
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a valid email address.',
        type: 'confirm'
      });
      return;
    }
    if (!formData.phone.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Phone number is required.',
        type: 'confirm'
      });
      return;
    }
    if (formData.password.length < 6) {
      showModal({
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
        type: 'confirm'
      });
      return;
    }

    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors?.map(e => e.msg).join(', ') ||
                          'Unknown error';
      showModal({
        title: 'Registration Failed',
        message: errorMessage,
        type: 'confirm'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="flex items-center">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {!isLogin && (
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-2" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required={!isLogin}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="flex items-center">
              <FaLock className="text-gray-400 mr-2" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-b-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default Login;