class UserStatusService {
  constructor() {
    this.userStatuses = new Map(); // userId -> { status: 'online'|'offline', lastSeen: Date, socketId: string }
    this.userSockets = new Map(); // socketId -> userId
    this.userPresence = new Map(); // userId -> { isOnChatPage: boolean, lastActivity: Date }
    this.userPages = new Map(); // userId -> { currentPage: string, lastPageChange: Date }
  }

  // Set user as online
  setUserOnline(userId, socketId) {
    const now = new Date();
    this.userStatuses.set(userId, {
      status: 'online',
      lastSeen: now,
      socketId: socketId
    });
    this.userSockets.set(socketId, userId);

    console.log(`User ${userId} is now online (socket: ${socketId})`);
  }

  // Set user as offline
  setUserOffline(socketId) {
    const userId = this.userSockets.get(socketId);
    if (userId) {
      this.userStatuses.set(userId, {
        status: 'offline',
        lastSeen: new Date(),
        socketId: null
      });
      this.userSockets.delete(socketId);
      this.userPresence.delete(userId);

      console.log(`User ${userId} is now offline`);
    }
  }

  // Set user presence (on chat page or not)
  setUserPresence(userId, isOnChatPage) {
    this.userPresence.set(userId, {
      isOnChatPage,
      lastActivity: new Date()
    });

    console.log(`User ${userId} presence updated: ${isOnChatPage ? 'on chat page' : 'not on chat page'}`);
  }

  // Set user current page
  setUserPage(userId, currentPage) {
    this.userPages.set(userId, {
      currentPage,
      lastPageChange: new Date()
    });

    // Also update presence based on page
    const isOnChatPage = currentPage === 'chat';
    this.setUserPresence(userId, isOnChatPage);

    console.log(`User ${userId} is now on page: ${currentPage}`);
  }

  // Get user status
  getUserStatus(userId) {
    return this.userStatuses.get(userId) || {
      status: 'offline',
      lastSeen: null,
      socketId: null
    };
  }

  // Get user presence
  getUserPresence(userId) {
    return this.userPresence.get(userId) || {
      isOnChatPage: false,
      lastActivity: null
    };
  }

  // Get user current page
  getUserPage(userId) {
    return this.userPages.get(userId) || {
      currentPage: null,
      lastPageChange: null
    };
  }

  // Get all online users
  getOnlineUsers() {
    const onlineUsers = [];
    for (const [userId, status] of this.userStatuses) {
      if (status.status === 'online') {
        const presence = this.getUserPresence(userId);
        onlineUsers.push({
          userId,
          lastSeen: status.lastSeen,
          isOnChatPage: presence.isOnChatPage,
          lastActivity: presence.lastActivity
        });
      }
    }
    return onlineUsers;
  }

  // Get all online users (alias for compatibility)
  getAllOnlineUsers() {
    return this.getOnlineUsers();
  }

  // Check if user is online
  isUserOnline(userId) {
    const status = this.userStatuses.get(userId);
    return status && status.status === 'online';
  }

  // Check if user is on chat page
  isUserOnChatPage(userId) {
    const presence = this.userPresence.get(userId);
    return presence ? presence.isOnChatPage : false;
  }

  // Update last seen time
  updateLastSeen(userId) {
    const status = this.userStatuses.get(userId);
    if (status) {
      status.lastSeen = new Date();
    }
  }

  // Update last activity
  updateLastActivity(userId) {
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.lastActivity = new Date();
    } else {
      this.userPresence.set(userId, {
        isOnChatPage: false,
        lastActivity: new Date()
      });
    }
  }

  // Get status for multiple users
  getUsersStatus(userIds) {
    const statuses = {};
    userIds.forEach(userId => {
      const status = this.getUserStatus(userId);
      const presence = this.getUserPresence(userId);
      statuses[userId] = {
        ...status,
        isOnChatPage: presence.isOnChatPage,
        lastActivity: presence.lastActivity
      };
    });
    return statuses;
  }

  // Get users who are not on chat page
  getUsersNotOnChatPage(userIds) {
    return userIds.filter(userId => !this.isUserOnChatPage(userId));
  }

  // Get users who are on chat page
  getUsersOnChatPage() {
    const usersOnChatPage = [];
    for (const [userId, presence] of this.userPresence.entries()) {
      if (presence.isOnChatPage) {
        usersOnChatPage.push(userId);
      }
    }
    return usersOnChatPage;
  }

  // Get active users (online and recently active)
  getActiveUsers(minutesThreshold = 5) {
    const activeUsers = [];
    const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000);

    for (const [userId, status] of this.userStatuses) {
      if (status.status === 'online' && status.lastSeen > threshold) {
        const presence = this.getUserPresence(userId);
        activeUsers.push({
          userId,
          lastSeen: status.lastSeen,
          isOnChatPage: presence.isOnChatPage,
          lastActivity: presence.lastActivity
        });
      }
    }
    return activeUsers;
  }

  // Clean up old entries (for memory management)
  cleanup() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Clean up old presence entries
    for (const [userId, presence] of this.userPresence.entries()) {
      if (presence.lastActivity < oneHourAgo) {
        this.userPresence.delete(userId);
        console.log(`Cleaned up old presence for user ${userId}`);
      }
    }
  }

  // Get statistics
  getStats() {
    const totalUsers = this.userStatuses.size;
    const onlineUsers = this.getOnlineUsers().length;
    const usersOnChatPage = this.getUsersOnChatPage().length;

    return {
      totalUsers,
      onlineUsers,
      usersOnChatPage,
      offlineUsers: totalUsers - onlineUsers
    };
  }
}

module.exports = new UserStatusService();
