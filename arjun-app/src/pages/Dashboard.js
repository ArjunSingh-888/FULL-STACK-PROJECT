import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../components/Sidebar';
import { getFriends } from '../utils/supabase';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    const userImage = localStorage.getItem('userImage');
    const userId = localStorage.getItem('userId');

    if (!token) {
      // Not logged in, redirect to login
      navigate('/login');
      return;
    }

    // Validate token with server
    const validateToken = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.valid) {
          setUser({
            userId,
            username,
            fullName,
            userImage
          });
          
          // Load friend count
          loadFriendCount(userId);
        } else {
          // Token invalid, clear and redirect
          localStorage.clear();
          navigate('/login');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.clear();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [navigate]);

  const loadFriendCount = async (userId) => {
    const result = await getFriends(userId);
    if (result.success) {
      setFriendCount(result.friends.length);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.fullName || user?.username}! 👋</h1>
          <p className="dashboard-subtitle">Here's what's happening with your account today.</p>
        </div>

        <div className="dashboard-content">

          <div className="dashboard-profile-section">
            <h2>Your Profile</h2>
            <div className="profile-card">
              {user?.userImage ? (
                <img src={user.userImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-details">
                <h3>{user?.fullName}</h3>
                <p className="username">@{user?.username}</p>
                <p className="user-id">ID: {user?.userId}</p>
                <button className="edit-profile-btn">Edit Profile</button>
              </div>
            </div>
          </div>

          <div className="dashboard-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🎉</div>
                <div className="activity-text">
                  <p>You joined FriendZone!</p>
                  <span className="activity-time">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
