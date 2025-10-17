// Auth utility functions for managing sessions

const API_BASE_URL = 'http://localhost:8080/api/users';

/**
 * Check if user is logged in
 */
export const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = () => {
  return {
    userId: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    fullName: localStorage.getItem('fullName'),
    userImage: localStorage.getItem('userImage'),
    sessionId: localStorage.getItem('sessionId'),
    token: localStorage.getItem('authToken')
  };
};

/**
 * Save user session data to localStorage
 */
export const saveSession = (data) => {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userId', data.userId);
  localStorage.setItem('username', data.username);
  localStorage.setItem('fullName', data.fullName);
  localStorage.setItem('sessionId', data.sessionId);
  if (data.userImage) {
    localStorage.setItem('userImage', data.userImage);
  }
};

/**
 * Clear all session data
 */
export const clearSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('fullName');
  localStorage.removeItem('userImage');
  localStorage.removeItem('sessionId');
};

/**
 * Validate current token with server
 */
export const validateToken = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();
    
    if (!data.valid) {
      clearSession();
    }
    
    return data;
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
};

/**
 * Logout user and clear session
 */
export const logout = async () => {
  const token = localStorage.getItem('authToken');

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  clearSession();
  window.location.href = '/login';
};

/**
 * Login user
 */
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      saveSession(data);
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Signup new user
 */
export const signup = async (username, password, fullName, userImage = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, fullName, userImage })
    });

    const data = await response.json();

    if (response.ok) {
      saveSession(data);
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export default {
  isAuthenticated,
  getCurrentUser,
  saveSession,
  clearSession,
  validateToken,
  logout,
  login,
  signup,
  getAuthHeaders
};
