import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mxxjgqhlokmyljdgpwkx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eGpncWhsb2tteWxqZGdwd2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Nzg0MzYsImV4cCI6MjA3NjE1NDQzNn0.Q0vCTphoF_Rv713vlBpDeyDsXJ1AJ6_D436z3twKB88';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Chat functions
export const searchUsers = async (searchQuery) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, full_name, user_image')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .limit(10);

    if (error) throw error;
    return { success: true, users: data };
  } catch (error) {
    console.error('Search users error:', error);
    return { success: false, error: error.message };
  }
};

export const createOrGetChat = async (userId1, userId2) => {
  try {
    // Ensure consistent ordering (smaller UUID first)
    const [user1, user2] = [userId1, userId2].sort();

    // Check if chat exists
    const { data: existingChat, error: searchError } = await supabase
      .from('user_chats')
      .select('*')
      .or(`and(user_id_1.eq.${user1},user_id_2.eq.${user2}),and(user_id_1.eq.${user2},user_id_2.eq.${user1})`)
      .single();

    if (existingChat) {
      return { success: true, chat: existingChat };
    }

    // Create new chat
    const { data: newChat, error: createError } = await supabase
      .from('user_chats')
      .insert([{ user_id_1: user1, user_id_2: user2 }])
      .select()
      .single();

    if (createError) throw createError;
    return { success: true, chat: newChat };
  } catch (error) {
    console.error('Create/get chat error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserChats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_chats')
      .select(`
        user_chat_id,
        user_id_1,
        user_id_2,
        created_at,
        user1:users!user_chats_user_id_1_fkey(user_id, username, full_name, user_image),
        user2:users!user_chats_user_id_2_fkey(user_id, username, full_name, user_image)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, chats: data };
  } catch (error) {
    console.error('Get user chats error:', error);
    return { success: false, error: error.message };
  }
};

export const getMessages = async (chatId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        message_id,
        user_chat_id,
        sender_id,
        text,
        images,
        created_at,
        is_read,
        sender:users(user_id, username, full_name, user_image)
      `)
      .eq('user_chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, messages: data };
  } catch (error) {
    console.error('Get messages error:', error);
    return { success: false, error: error.message };
  }
};

export const sendMessage = async (chatId, senderId, text, images = null) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        user_chat_id: chatId,
        sender_id: senderId,
        text: text,
        images: images,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: data };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: error.message };
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('message_id', messageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Mark message as read error:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToMessages = (chatId, callback) => {
  const subscription = supabase
    .channel(`messages:${chatId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `user_chat_id=eq.${chatId}`
    }, callback)
    .subscribe();

  return subscription;
};

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve({
        data: reader.result,
        name: file.name,
        type: file.type,
        size: file.size
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

// Download file from base64
export const downloadBase64File = (base64Data, filename) => {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Friend Request Functions
export const sendFriendRequest = async (senderId, receiverId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        is_approved: null
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, request: data };
  } catch (error) {
    console.error('Send friend request error:', error);
    return { success: false, error: error.message };
  }
};

export const getFriendRequests = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        request_id,
        sender_id,
        receiver_id,
        created_at,
        is_approved,
        responded_at,
        sender:users!requests_sender_id_fkey(user_id, username, full_name, user_image),
        receiver:users!requests_receiver_id_fkey(user_id, username, full_name, user_image)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, requests: data };
  } catch (error) {
    console.error('Get friend requests error:', error);
    return { success: false, error: error.message };
  }
};

export const respondToFriendRequest = async (requestId, isApproved) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .update({
        is_approved: isApproved,
        responded_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, request: data };
  } catch (error) {
    console.error('Respond to friend request error:', error);
    return { success: false, error: error.message };
  }
};

export const getFriends = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        request_id,
        sender_id,
        receiver_id,
        created_at,
        sender:users!requests_sender_id_fkey(user_id, username, full_name, user_image),
        receiver:users!requests_receiver_id_fkey(user_id, username, full_name, user_image)
      `)
      .eq('is_approved', true)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) throw error;
    
    // Map to get the "other" user (friend)
    const friends = data.map(req => {
      return req.sender_id === userId ? req.receiver : req.sender;
    });

    return { success: true, friends };
  } catch (error) {
    console.error('Get friends error:', error);
    return { success: false, error: error.message };
  }
};

export const removeFriend = async (userId1, userId2) => {
  try {
    const { error } = await supabase
      .from('requests')
      .delete()
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Remove friend error:', error);
    return { success: false, error: error.message };
  }
};

export const checkFriendshipStatus = async (userId1, userId2) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('request_id, sender_id, receiver_id, is_approved')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    
    if (!data) {
      return { success: true, status: 'none' }; // No request exists
    }

    if (data.is_approved === null) {
      return { 
        success: true, 
        status: data.sender_id === userId1 ? 'sent' : 'received',
        requestId: data.request_id 
      };
    }

    if (data.is_approved === true) {
      return { success: true, status: 'friends', requestId: data.request_id };
    }

    return { success: true, status: 'rejected' };
  } catch (error) {
    console.error('Check friendship status error:', error);
    return { success: false, error: error.message };
  }
};

export default supabase;
