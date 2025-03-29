import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Layout = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">ACME BaaS</Link>
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/projects" className="hover:text-blue-200">Projects</Link>
            <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
          </div>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            Menu
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden container mx-auto px-4 py-2 flex flex-col space-y-2">
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/projects" className="hover:text-blue-200">Projects</Link>
            <button onClick={handleLogout} className="hover:text-blue-200 text-left">Logout</button>
          </div>
        )}
      </header>
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-300 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} ACME Backend as a Service</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 