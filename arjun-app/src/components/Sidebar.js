import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      const token = localStorage.getItem('authToken');

      try {
        await fetch('http://localhost:8080/api/users/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }

      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? 'FZ' : 'FriendZone'}</h2>
        <button 
          className="toggle-btn" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="sidebar-user">
        {user?.userImage ? (
          <img src={user.userImage} alt="Profile" className="sidebar-avatar" />
        ) : (
          <div className="sidebar-avatar-placeholder">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        )}
        {!collapsed && (
          <div className="sidebar-user-info">
            <h4>{user?.fullName}</h4>
            <p>@{user?.username}</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className="sidebar-link active">
          <span className="sidebar-icon">🏠</span>
          {!collapsed && <span>Dashboard</span>}
        </Link>
        <Link to="/profile" className="sidebar-link">
          <span className="sidebar-icon">👤</span>
          {!collapsed && <span>Profile</span>}
        </Link>
        <Link to="/friends" className="sidebar-link">
          <span className="sidebar-icon">👥</span>
          {!collapsed && <span>Friends</span>}
        </Link>
        <Link to="/messages" className="sidebar-link">
          <span className="sidebar-icon">💬</span>
          {!collapsed && <span>Messages</span>}
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link logout-btn">
          <span className="sidebar-icon">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
