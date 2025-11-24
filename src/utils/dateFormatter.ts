/**
 * Format date for message grouping
 */
export function formatMessageDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Check if two timestamps are on different days
 */
export function isDifferentDay(timestamp1: string, timestamp2: string): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  
  return (
    date1.getDate() !== date2.getDate() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getFullYear() !== date2.getFullYear()
  );
}

/**
 * Get date label for message (for grouping)
 */
export function getDateLabel(
  currentTimestamp: string,
  previousTimestamp?: string
): string | null {
  if (!previousTimestamp) {
    return formatMessageDate(currentTimestamp);
  }

  if (isDifferentDay(currentTimestamp, previousTimestamp)) {
    return formatMessageDate(currentTimestamp);
  }

  return null;
}

