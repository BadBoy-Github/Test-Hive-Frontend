import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestTaking from './pages/TestTaking';
import TestResults from './pages/TestResults';
import AdminDashboard from './pages/AdminDashboard';
import AdminTests from './pages/AdminTests';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/test/:testId" element={<TestTaking />} />
      <Route path="/results" element={<TestResults />} />
      <Route path="/admin/create-test" element={<AdminDashboard />} />
      <Route path="/admin/tests" element={<AdminTests />} />
    </Routes>
  );
}

export default App;
