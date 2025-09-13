class UserStatusService {
  constructor() {
    this.userStatuses = new Map(); // userId -> { status: 'online'|'offline', lastSeen: Date, socketId: string }
    this.userSockets = new Map(); // socketId -> userId
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
    }
  }

  // Get user status
  getUserStatus(userId) {
    return this.userStatuses.get(userId) || {
      status: 'offline',
      lastSeen: null,
      socketId: null
    };
  }

  // Get all online users
  getOnlineUsers() {
    const onlineUsers = [];
    for (const [userId, status] of this.userStatuses) {
      if (status.status === 'online') {
        onlineUsers.push({
          userId,
          lastSeen: status.lastSeen
        });
      }
    }
    return onlineUsers;
  }

  // Check if user is online
  isUserOnline(userId) {
    const status = this.userStatuses.get(userId);
    return status && status.status === 'online';
  }

  // Update last seen time
  updateLastSeen(userId) {
    const status = this.userStatuses.get(userId);
    if (status) {
      status.lastSeen = new Date();
    }
  }

  // Get status for multiple users
  getUsersStatus(userIds) {
    const statuses = {};
    userIds.forEach(userId => {
      statuses[userId] = this.getUserStatus(userId);
    });
    console.log('getUsersStatus called with userIds:', userIds);
    console.log('Current userStatuses map:', Array.from(this.userStatuses.entries()));
    console.log('Returning statuses:', statuses);
    return statuses;
  }
}

module.exports = new UserStatusService();


