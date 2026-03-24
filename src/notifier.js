import axios from 'axios';

function sanitizeHeaderValue(value) {
  if (typeof value !== 'string') return '';
  // Node.js headers must not contain control chars and should remain ASCII-safe.
  return value.replace(/[^\x20-\x7E]/g, '').trim();
}

/**
 * Sends a notification via ntfy.sh
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} topic - ntfy topic name
 * @param {string} server - ntfy server URL (default: https://ntfy.sh)
 */
export async function sendNotification(title, message, topic, server = 'https://ntfy.sh') {
  try {
    const url = `${server}/${topic}`;
    const safeTitle = sanitizeHeaderValue(title) || 'BookMyShow Alert';
    
    const response = await axios.post(url, message, {
      headers: {
        'Title': safeTitle,
        'Priority': 'high',
        'Tags': 'movie,bookmyshow,alarm',
      },
      timeout: 10000,
    });

    console.log(`✓ Notification sent to topic '${topic}': ${response.status}`);
    return true;
  } catch (error) {
    console.error(`Error sending notification:`, error.message);
    return false;
  }
}

/**
 * Sends a notification with a clickable link
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - URL to open when clicked
 * @param {string} topic - ntfy topic name
 * @param {string} server - ntfy server URL
 */
export async function sendNotificationWithLink(
  title,
  message,
  link,
  topic,
  server = 'https://ntfy.sh'
) {
  try {
    const url = `${server}/${topic}`;
    const safeTitle = sanitizeHeaderValue(title) || 'BookMyShow Alert';
    const safeLink = sanitizeHeaderValue(link);
    
    const response = await axios.post(url, message, {
      headers: {
        'Title': safeTitle,
        'Click': safeLink,
        'Priority': 'high',
        'Tags': 'movie,bookmyshow,alarm',
      },
      timeout: 10000,
    });

    console.log(`✓ Notification with link sent to topic '${topic}': ${response.status}`);
    return true;
  } catch (error) {
    console.error(`Error sending notification:`, error.message);
    return false;
  }
}
