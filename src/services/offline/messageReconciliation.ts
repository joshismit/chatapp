import { StoredMessage } from '../../types/message';
import { QueuedMessage } from './offlineQueue';
import { loadConversation, saveConversation } from '../storage';

export interface ServerMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ReconciliationResult {
  merged: StoredMessage[];
  conflicts: Array<{
    local: StoredMessage;
    server: ServerMessage;
    resolution: 'server' | 'local';
  }>;
}

/**
 * Conflict Resolution Strategy:
 * 
 * 1. Server ID wins: If server has an ID, use server version
 * 2. Timestamp comparison: If both exist, newer timestamp wins
 * 3. Server priority: If timestamps are equal, server version takes precedence
 * 4. Local fallback: Only use local if server doesn't have the message
 * 
 * Rationale:
 * - Server is source of truth for message IDs
 * - Timestamps ensure chronological order
 * - Server priority prevents duplicate messages
 */
export async function reconcileMessages(
  conversationId: string,
  serverMessages: ServerMessage[]
): Promise<ReconciliationResult> {
  try {
    // Load local messages
    const localMessages = await loadConversation(conversationId);
    const conflicts: ReconciliationResult['conflicts'] = [];
    const merged: StoredMessage[] = [];
    const processedIds = new Set<string>();

    // Process server messages first (server is source of truth)
    for (const serverMsg of serverMessages) {
      const localMatch = localMessages.find(
        (local) =>
          local.id === serverMsg.id ||
          local.serverId === serverMsg.id ||
          (local.text === serverMsg.text &&
            Math.abs(
              new Date(local.createdAt).getTime() -
                new Date(serverMsg.createdAt).getTime()
            ) < 5000) // Within 5 seconds
      );

      if (localMatch) {
        // Conflict detected - resolve using strategy
        const resolution = resolveConflict(localMatch, serverMsg);
        
        if (resolution === 'server') {
          conflicts.push({
            local: localMatch,
            server: serverMsg,
            resolution: 'server',
          });
          
          // Use server version
          merged.push({
            id: serverMsg.id,
            text: serverMsg.text,
            senderId: serverMsg.senderId,
            createdAt: serverMsg.createdAt,
            status: serverMsg.status,
            serverId: serverMsg.id,
          });
        } else {
          // Keep local version (rare case)
          merged.push(localMatch);
        }
        
        processedIds.add(localMatch.id);
        processedIds.add(serverMsg.id);
      } else {
        // New server message
        merged.push({
          id: serverMsg.id,
          text: serverMsg.text,
          senderId: serverMsg.senderId,
          createdAt: serverMsg.createdAt,
          status: serverMsg.status,
          serverId: serverMsg.id,
        });
        processedIds.add(serverMsg.id);
      }
    }

    // Add local messages that weren't on server (pending/queued)
    for (const localMsg of localMessages) {
      if (
        !processedIds.has(localMsg.id) &&
        !processedIds.has(localMsg.serverId || '')
      ) {
        // Only keep local messages that are still pending
        if (localMsg.status === 'sending' || !localMsg.serverId) {
          merged.push(localMsg);
        }
      }
    }

    // Sort by createdAt descending
    merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Save reconciled messages
    await saveConversation(conversationId, merged);

    return { merged, conflicts };
  } catch (error) {
    console.error('Error reconciling messages:', error);
    throw error;
  }
}

/**
 * Resolve conflict between local and server message
 * Returns 'server' or 'local' to indicate which version to use
 */
function resolveConflict(
  local: StoredMessage,
  server: ServerMessage
): 'server' | 'local' {
  // Rule 1: Server ID always wins (server is source of truth)
  if (server.id && !local.serverId) {
    return 'server';
  }

  // Rule 2: Compare timestamps - newer wins
  const localTime = new Date(local.createdAt).getTime();
  const serverTime = new Date(server.createdAt).getTime();
  
  if (serverTime > localTime) {
    return 'server';
  }
  
  if (localTime > serverTime) {
    return 'local';
  }

  // Rule 3: If timestamps equal, server priority
  return 'server';
}

/**
 * Reconcile queued messages with server responses
 */
export async function reconcileQueuedMessages(
  queuedMessages: QueuedMessage[],
  serverMessages: ServerMessage[]
): Promise<{
  sent: QueuedMessage[];
  failed: QueuedMessage[];
  conflicts: Array<{ queued: QueuedMessage; server: ServerMessage }>;
}> {
  const sent: QueuedMessage[] = [];
  const failed: QueuedMessage[] = [];
  const conflicts: Array<{ queued: QueuedMessage; server: ServerMessage }> = [];

  for (const queued of queuedMessages) {
    // Try to find matching server message
    const serverMatch = serverMessages.find(
      (server) =>
        server.text === queued.text &&
        Math.abs(
          new Date(server.createdAt).getTime() -
            new Date(queued.createdAt).getTime()
        ) < 10000 // Within 10 seconds
    );

    if (serverMatch) {
      // Message was successfully sent
      sent.push(queued);
      conflicts.push({ queued, server: serverMatch });
    } else {
      // Message not found on server - might have failed
      failed.push(queued);
    }
  }

  return { sent, failed, conflicts };
}

