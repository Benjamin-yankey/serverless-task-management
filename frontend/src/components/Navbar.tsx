import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
          Task Management System
        </div>
        <div className="navbar-menu">
          <span className="navbar-user">
            {user?.signInDetails?.loginId}
            {isAdmin && <span className="admin-badge">Admin</span>}
          </span>
          <button className="btn btn-secondary" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
