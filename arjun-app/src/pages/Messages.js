import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Messages.css';
import Sidebar from '../components/Sidebar';
import { 
  searchUsers, 
  getUserChats, 
  createOrGetChat, 
  getMessages, 
  sendMessage,
  subscribeToMessages 
} from '../utils/supabase';

function Messages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

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

    setUser({ userId, username, fullName, userImage });
    loadChats(userId);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.user_chat_id);
      
      // Subscribe to real-time messages
      const subscription = subscribeToMessages(
        selectedChat.user_chat_id,
        (payload) => {
          console.log('New message:', payload);
          setMessages(prev => [...prev, payload.new]);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async (userId) => {
    const result = await getUserChats(userId);
    if (result.success) {
      setChats(result.chats);
    }
  };

  const loadMessages = async (chatId) => {
    const result = await getMessages(chatId);
    if (result.success) {
      setMessages(result.messages);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const result = await searchUsers(query);
    if (result.success) {
      // Filter out current user
      const filtered = result.users.filter(u => u.user_id !== user.userId);
      setSearchResults(filtered);
    }
    setSearching(false);
  };

  const handleStartChat = async (selectedUser) => {
    const result = await createOrGetChat(user.userId, selectedUser.user_id);
    
    if (result.success) {
      // Reload chats
      await loadChats(user.userId);
      
      // Select the chat
      const chatWithUser = {
        user_chat_id: result.chat.user_chat_id,
        otherUser: selectedUser
      };
      setSelectedChat(chatWithUser);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleSelectChat = (chat) => {
    // Determine which user is the "other" user
    const otherUser = chat.user_id_1 === user.userId ? chat.user2 : chat.user1;
    
    setSelectedChat({
      user_chat_id: chat.user_chat_id,
      otherUser: otherUser
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    setSendingMessage(true);
    const result = await sendMessage(
      selectedChat.user_chat_id,
      user.userId,
      newMessage.trim()
    );

    if (result.success) {
      setNewMessage('');
      loadMessages(selectedChat.user_chat_id);
    }
    setSendingMessage(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
      <div className="messages-container">
        {/* Chats List */}
        <div className="chats-sidebar">
          <div className="chats-header">
            <h2>Messages</h2>
          </div>
          
          {/* Search Users */}
          <div className="search-users">
            <input
              type="text"
              placeholder="Search users to chat..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searching && <div className="search-loading">Searching...</div>}
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(result => (
                  <div 
                    key={result.user_id} 
                    className="search-result-item"
                    onClick={() => handleStartChat(result)}
                  >
                    {result.user_image ? (
                      <img src={result.user_image} alt={result.username} className="result-avatar" />
                    ) : (
                      <div className="result-avatar-placeholder">
                        {result.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="result-info">
                      <h4>{result.full_name}</h4>
                      <p>@{result.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chats List */}
          <div className="chats-list">
            {chats.length === 0 ? (
              <div className="no-chats">
                <p>No chats yet</p>
                <span>Search for users to start chatting!</span>
              </div>
            ) : (
              chats.map(chat => {
                const otherUser = chat.user_id_1 === user.userId ? chat.user2 : chat.user1;
                return (
                  <div
                    key={chat.user_chat_id}
                    className={`chat-item ${selectedChat?.user_chat_id === chat.user_chat_id ? 'active' : ''}`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    {otherUser.user_image ? (
                      <img src={otherUser.user_image} alt={otherUser.username} className="chat-avatar" />
                    ) : (
                      <div className="chat-avatar-placeholder">
                        {otherUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="chat-info">
                      <h4>{otherUser.full_name}</h4>
                      <p>@{otherUser.username}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-main">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="messages-header">
                {selectedChat.otherUser.user_image ? (
                  <img 
                    src={selectedChat.otherUser.user_image} 
                    alt={selectedChat.otherUser.username} 
                    className="header-avatar" 
                  />
                ) : (
                  <div className="header-avatar-placeholder">
                    {selectedChat.otherUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="header-info">
                  <h3>{selectedChat.otherUser.full_name}</h3>
                  <p>@{selectedChat.otherUser.username}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-content">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <span>Start the conversation!</span>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.message_id}
                      className={`message ${msg.sender_id === user.userId ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">
                        <p>{msg.text}</p>
                        <span className="message-time">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="message-input"
                  disabled={sendingMessage}
                />
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? '...' : '📤'}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <h2>💬 Messages</h2>
                <p>Select a chat or search for users to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
