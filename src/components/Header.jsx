import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold hover:text-gray-200">
          Test Hive
        </Link>
        <DarkModeToggle />
      </div>
    </header>
  );
};

export default Header;