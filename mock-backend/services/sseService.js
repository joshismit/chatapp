/**
 * SSE Service
 * Manages Server-Sent Events connections for real-time updates
 */

class SSEService {
  constructor() {
    // Map of conversationId -> Set of client connections
    this.clients = new Map();
    // Map of userId -> Set of connections
    this.userConnections = new Map();
  }

  /**
   * Add a new SSE client connection
   */
  addClient(conversationId, userId, res) {
    if (!this.clients.has(conversationId)) {
      this.clients.set(conversationId, new Set());
    }
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }

    const client = {
      res,
      conversationId,
      userId,
      lastActivity: Date.now(),
    };

    this.clients.get(conversationId).add(client);
    this.userConnections.get(userId).add(client);

    // Set up SSE headers with CORS configuration
    // CORS headers - use environment variable if set, otherwise allow all in dev
    const allowedOrigin = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")[0].trim() // Use first origin for SSE
      : process.env.NODE_ENV === "production"
      ? null // Deny in production if not configured
      : "*"; // Allow all in development

    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    };

    if (allowedOrigin) {
      headers["Access-Control-Allow-Origin"] = allowedOrigin;
      headers["Access-Control-Allow-Credentials"] = "true";
      headers["Access-Control-Allow-Headers"] = "Cache-Control, Authorization";
    }

    res.writeHead(200, headers);

    // Send initial connection message
    this.sendToClient(client, "connected", {
      message: "SSE connection established",
      conversationId,
      timestamp: new Date().toISOString(),
    });

    return client;
  }

  /**
   * Remove a client connection
   */
  removeClient(conversationId, userId, client) {
    if (this.clients.has(conversationId)) {
      this.clients.get(conversationId).delete(client);
      if (this.clients.get(conversationId).size === 0) {
        this.clients.delete(conversationId);
      }
    }

    if (this.userConnections.has(userId)) {
      this.userConnections.get(userId).delete(client);
      if (this.userConnections.get(userId).size === 0) {
        this.userConnections.delete(userId);
      }
    }
  }

  /**
   * Send data to a specific client
   */
  sendToClient(client, eventType, data) {
    try {
      const eventData = JSON.stringify(data);
      client.res.write(`event: ${eventType}\n`);
      client.res.write(`data: ${eventData}\n\n`);
      client.lastActivity = Date.now();
    } catch (error) {
      console.error("Error sending SSE to client:", error);
      this.removeClient(client.conversationId, client.userId, client);
    }
  }

  /**
   * Broadcast message to all clients in a conversation (except sender)
   */
  broadcastMessage(conversationId, message, excludeUserId = null) {
    if (!this.clients.has(conversationId)) {
      return;
    }

    const clients = this.clients.get(conversationId);
    const messageData = {
      id: message.messageId || message.id,
      messageId: message.messageId || message.id,
      text: message.text,
      senderId: message.senderId,
      conversationId: message.conversationId,
      type: message.type || "text",
      status: message.status || "sent",
      createdAt: message.createdAt || new Date().toISOString(),
      sender: message.sender || null,
    };

    clients.forEach((client) => {
      // Don't send to the sender
      if (excludeUserId && client.userId === excludeUserId) {
        return;
      }
      this.sendToClient(client, "message", messageData);
    });
  }

  /**
   * Broadcast status update to conversation participants
   */
  broadcastStatusUpdate(conversationId, messageId, status, userId) {
    if (!this.clients.has(conversationId)) {
      return;
    }

    const clients = this.clients.get(conversationId);
    const statusData = {
      messageId,
      status,
      conversationId,
      userId,
      timestamp: new Date().toISOString(),
    };

    clients.forEach((client) => {
      this.sendToClient(client, "statusUpdate", statusData);
    });
  }

  /**
   * Broadcast typing indicator
   */
  broadcastTyping(conversationId, userId, displayName, isTyping) {
    if (!this.clients.has(conversationId)) {
      return;
    }

    const clients = this.clients.get(conversationId);
    const typingData = {
      userId,
      displayName,
      isTyping,
      conversationId,
      timestamp: new Date().toISOString(),
    };

    clients.forEach((client) => {
      // Don't send to the user who is typing
      if (client.userId === userId) {
        return;
      }
      this.sendToClient(client, "typing", typingData);
    });
  }

  /**
   * Broadcast online status change
   */
  broadcastOnlineStatus(userId, isOnline, lastSeen) {
    if (!this.userConnections.has(userId)) {
      return;
    }

    const clients = this.userConnections.get(userId);
    const statusData = {
      userId,
      isOnline,
      lastSeen,
      timestamp: new Date().toISOString(),
    };

    clients.forEach((client) => {
      this.sendToClient(client, "onlineStatus", statusData);
    });
  }

  /**
   * Send heartbeat to keep connection alive
   */
  sendHeartbeat(client) {
    try {
      client.res.write(": heartbeat\n\n");
      client.lastActivity = Date.now();
    } catch (error) {
      console.error("Error sending heartbeat:", error);
      this.removeClient(client.conversationId, client.userId, client);
    }
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections() {
    const now = Date.now();
    const STALE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    this.clients.forEach((clients, conversationId) => {
      clients.forEach((client) => {
        if (now - client.lastActivity > STALE_TIMEOUT) {
          console.log(
            `Removing stale connection for conversation: ${conversationId}`
          );
          this.removeClient(conversationId, client.userId, client);
          try {
            client.res.end();
          } catch (error) {
            // Connection already closed
          }
        }
      });
    });
  }

  /**
   * Get connection count for a conversation
   */
  getConnectionCount(conversationId) {
    return this.clients.has(conversationId)
      ? this.clients.get(conversationId).size
      : 0;
  }

  /**
   * Get all active conversations
   */
  getActiveConversations() {
    return Array.from(this.clients.keys());
  }
}

// Singleton instance
const sseService = new SSEService();

// Cleanup stale connections every minute
setInterval(() => {
  sseService.cleanupStaleConnections();
}, 60000);

module.exports = sseService;
