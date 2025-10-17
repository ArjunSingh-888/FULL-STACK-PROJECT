import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Friends.css';
import Sidebar from '../components/Sidebar';
import {
  supabase,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  checkFriendshipStatus
} from '../utils/supabase';

function Friends() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search
  
  // Friends
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  
  // Friend Requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Search
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    const userImage = localStorage.getItem('userImage');

    if (!token) {
      navigate('/login');
      return;
    }

    const userData = { userId, username, fullName, userImage };
    setUser(userData);
    
    // Load initial data
    loadFriends(userId);
    loadFriendRequests(userId);
    loadAllUsers(userId);
    setLoading(false);
  }, [navigate]);

  const loadFriends = async (userId) => {
    setLoadingFriends(true);
    const result = await getFriends(userId);
    if (result.success) {
      setFriends(result.friends);
    }
    setLoadingFriends(false);
  };

  const loadFriendRequests = async (userId) => {
    setLoadingRequests(true);
    const result = await getFriendRequests(userId);
    if (result.success) {
      // Separate pending received and sent requests
      const pending = result.requests.filter(
        req => req.is_approved === null && req.receiver_id === userId
      );
      const sent = result.requests.filter(
        req => req.is_approved === null && req.sender_id === userId
      );
      
      setPendingRequests(pending);
      setSentRequests(sent);
    }
    setLoadingRequests(false);
  };

  const loadAllUsers = async (currentUserId) => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, username, full_name, user_image')
        .neq('user_id', currentUserId) // Exclude current user
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAllUsers(data);
      setSearchResults(data); // Show all users initially
      
      // Check friendship status for all users
      const statuses = {};
      for (const otherUser of data) {
        const statusResult = await checkFriendshipStatus(currentUserId, otherUser.user_id);
        if (statusResult.success) {
          statuses[otherUser.user_id] = statusResult.status;
        }
      }
      setFriendStatuses(statuses);
    } catch (error) {
      console.error('Load all users error:', error);
    }
    setSearching(false);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(allUsers); // Show all users when search is empty
      return;
    }

    // Filter users locally
    const filtered = allUsers.filter(u => 
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.full_name.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  const handleSendRequest = async (receiverId) => {
    const result = await sendFriendRequest(user.userId, receiverId);
    
    if (result.success) {
      alert('Friend request sent! ✅');
      setFriendStatuses(prev => ({
        ...prev,
        [receiverId]: 'sent'
      }));
      loadFriendRequests(user.userId);
    } else {
      if (result.error.includes('duplicate')) {
        alert('Friend request already sent!');
      } else {
        alert('Failed to send request: ' + result.error);
      }
    }
  };

  const handleAcceptRequest = async (requestId) => {
    const result = await respondToFriendRequest(requestId, true);
    
    if (result.success) {
      alert('Friend request accepted! 🎉');
      loadFriends(user.userId);
      loadFriendRequests(user.userId);
      loadAllUsers(user.userId); // Refresh to update statuses
    } else {
      alert('Failed to accept request: ' + result.error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const result = await respondToFriendRequest(requestId, false);
    
    if (result.success) {
      alert('Friend request declined');
      loadFriendRequests(user.userId);
      loadAllUsers(user.userId); // Refresh to update statuses
    } else {
      alert('Failed to reject request: ' + result.error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    const result = await removeFriend(user.userId, friendId);
    
    if (result.success) {
      alert('Friend removed successfully');
      loadFriends(user.userId);
      loadAllUsers(user.userId); // Refresh to update statuses
    } else {
      alert('Failed to remove friend: ' + result.error);
    }
  };

  const getActionButton = (searchUser) => {
    const status = friendStatuses[searchUser.user_id];
    
    switch (status) {
      case 'friends':
        return <button className="btn-friends" disabled>✓ Friends</button>;
      case 'sent':
        return <button className="btn-pending" disabled>⏳ Request Sent</button>;
      case 'received':
        return <button className="btn-accept" onClick={() => handleAcceptRequest(searchUser.user_id)}>Accept Request</button>;
      case 'none':
      default:
        return <button className="btn-add" onClick={() => handleSendRequest(searchUser.user_id)}>+ Add Friend</button>;
    }
  };

  if (loading) {
    return (
      <div className="friends-page">
        <Sidebar />
        <div className="friends-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <Sidebar />
      
      <div className="friends-container">
        {/* Header */}
        <div className="friends-header">
          <h1>👥 Friends</h1>
          <p>Manage your connections on FriendZone</p>
        </div>

        {/* Tabs */}
        <div className="friends-tabs">
          <button 
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            My Friends ({friends.length})
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({pendingRequests.length})
          </button>
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Find Friends
          </button>
        </div>

        {/* Content */}
        <div className="friends-content">
          {/* My Friends Tab */}
          {activeTab === 'friends' && (
            <div className="friends-list">
              {loadingFriends ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No friends yet</h3>
                  <p>Start by searching for people to connect with!</p>
                  <button className="btn-primary" onClick={() => setActiveTab('search')}>
                    Find Friends
                  </button>
                </div>
              ) : (
                <div className="friends-grid">
                  {friends.map(friend => (
                    <div key={friend.user_id} className="friend-card">
                      <div className="friend-avatar">
                        {friend.user_image ? (
                          <img src={friend.user_image} alt={friend.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="friend-info">
                        <h3>{friend.full_name}</h3>
                        <p>@{friend.username}</p>
                      </div>
                      <div className="friend-actions">
                        <button className="btn-message" onClick={() => navigate('/messages')}>
                          💬 Message
                        </button>
                        <button 
                          className="btn-remove" 
                          onClick={() => handleRemoveFriend(friend.user_id)}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="requests-container">
              {/* Pending Requests (Received) */}
              <div className="requests-section">
                <h2>Friend Requests ({pendingRequests.length})</h2>
                {pendingRequests.length === 0 ? (
                  <div className="empty-state">
                    <p>No pending friend requests</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {pendingRequests.map(request => (
                      <div key={request.request_id} className="request-card">
                        <div className="request-avatar">
                          {request.sender.user_image ? (
                            <img src={request.sender.user_image} alt={request.sender.username} />
                          ) : (
                            <div className="avatar-placeholder">
                              {request.sender.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="request-info">
                          <h3>{request.sender.full_name}</h3>
                          <p>@{request.sender.username}</p>
                          <span className="request-time">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="request-actions">
                          <button 
                            className="btn-accept"
                            onClick={() => handleAcceptRequest(request.request_id)}
                          >
                            ✓ Accept
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleRejectRequest(request.request_id)}
                          >
                            ✗ Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="requests-section">
                <h2>Sent Requests ({sentRequests.length})</h2>
                {sentRequests.length === 0 ? (
                  <div className="empty-state">
                    <p>No sent requests</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {sentRequests.map(request => (
                      <div key={request.request_id} className="request-card">
                        <div className="request-avatar">
                          {request.receiver.user_image ? (
                            <img src={request.receiver.user_image} alt={request.receiver.username} />
                          ) : (
                            <div className="avatar-placeholder">
                              {request.receiver.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="request-info">
                          <h3>{request.receiver.full_name}</h3>
                          <p>@{request.receiver.username}</p>
                          <span className="request-time">
                            Sent on {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="request-status">
                          <span className="status-pending">⏳ Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by username or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>

              {searching ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Searching...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No users found</h3>
                  <p>Try searching with a different name or username</p>
                </div>
              ) : (
                <div className="search-results">
                  <div className="results-header">
                    <p>Showing {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}</p>
                  </div>
                  {searchResults.map(result => (
                    <div key={result.user_id} className="search-result-card">
                      <div className="result-avatar">
                        {result.user_image ? (
                          <img src={result.user_image} alt={result.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {result.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="result-info">
                        <h3>{result.full_name}</h3>
                        <p>@{result.username}</p>
                      </div>
                      <div className="result-action">
                        {getActionButton(result)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;
