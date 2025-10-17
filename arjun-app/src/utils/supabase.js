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

export default supabase;
