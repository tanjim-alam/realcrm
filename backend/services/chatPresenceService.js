class ChatPresenceService {
  constructor() {
    // Map to track which users are currently on the chat page
    // Structure: { [userId]: { socketId, lastSeen, isOnChatPage } }
    this.chatPresence = new Map();
  }

  // Set user as present on chat page
  setUserOnChatPage(userId, socketId) {
    this.chatPresence.set(userId, {
      socketId,
      lastSeen: new Date(),
      isOnChatPage: true
    });
    console.log(`User ${userId} is now on chat page`);
  }

  // Set user as not on chat page (but still connected)
  setUserOffChatPage(userId) {
    const presence = this.chatPresence.get(userId);
    if (presence) {
      presence.isOnChatPage = false;
      presence.lastSeen = new Date();
      this.chatPresence.set(userId, presence);
      console.log(`User ${userId} left chat page`);
    }
  }

  // Remove user completely (disconnected)
  removeUser(userId) {
    this.chatPresence.delete(userId);
    console.log(`User ${userId} disconnected from chat`);
  }

  // Check if user is on chat page
  isUserOnChatPage(userId) {
    const presence = this.chatPresence.get(userId);
    return presence ? presence.isOnChatPage : false;
  }

  // Get all users who are not on chat page
  getUsersNotOnChatPage(userIds) {
    console.log('Checking users not on chat page for userIds:', userIds);
    console.log('Current chat presence map:', Array.from(this.chatPresence.entries()));
    
    const usersNotOnChatPage = userIds.filter(userId => {
      const isOnChatPage = this.isUserOnChatPage(userId);
      console.log(`User ${userId} is on chat page: ${isOnChatPage}`);
      return !isOnChatPage;
    });
    
    console.log('Users not on chat page result:', usersNotOnChatPage);
    return usersNotOnChatPage;
  }

  // Get all users currently on chat page
  getUsersOnChatPage() {
    const usersOnChatPage = [];
    for (const [userId, presence] of this.chatPresence.entries()) {
      if (presence.isOnChatPage) {
        usersOnChatPage.push(userId);
      }
    }
    return usersOnChatPage;
  }

  // Get presence info for specific users
  getUsersPresence(userIds) {
    const presence = {};
    userIds.forEach(userId => {
      const userPresence = this.chatPresence.get(userId);
      presence[userId] = userPresence ? {
        isOnChatPage: userPresence.isOnChatPage,
        lastSeen: userPresence.lastSeen
      } : {
        isOnChatPage: false,
        lastSeen: null
      };
    });
    return presence;
  }

  // Clean up old entries (optional - for memory management)
  cleanup() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    for (const [userId, presence] of this.chatPresence.entries()) {
      if (presence.lastSeen < oneHourAgo) {
        this.chatPresence.delete(userId);
        console.log(`Cleaned up old presence for user ${userId}`);
      }
    }
  }
}

module.exports = new ChatPresenceService();


