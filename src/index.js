import cron from 'node-cron';
import { checkMovieAvailability } from './bookmyshow.js';
import { sendNotification, sendNotificationWithLink } from './notifier.js';
import { config } from './config.js';

let lastCheckedStatus = null;

async function runCheck() {
  try {
    console.log(`[${new Date().toISOString()}] Starting availability check...`);
    
    const isAvailable = await checkMovieAvailability(
      config.movieTitle,
      config.city,
      config.theater,
      config.format
    );

    console.log(`[${new Date().toISOString()}] Movie available: ${isAvailable}`);

    // Send notification only if status changed
    if (isAvailable && isAvailable !== lastCheckedStatus) {
      console.log(`[${new Date().toISOString()}] Sending notification...`);
      await sendNotificationWithLink(
        `${config.movieTitle} is now available for booking!`,
        `Location: ${config.city} - ${config.theater} (${config.format})`,
        config.bookingUrl,
        config.ntfyTopic,
        config.ntfyServer
      );
    }

    lastCheckedStatus = isAvailable;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during check:`, error);
    // Optionally send error notification
    if (config.notifyOnError) {
      await sendNotification(
        'Error checking BookMyShow',
        error.message,
        config.ntfyTopic,
        config.ntfyServer
      );
    }
  }
}

// Run immediately on start
console.log('Starting BookMyShow Availability Monitor...');
console.log(`Configuration:
  - Movie: ${config.movieTitle}
  - City: ${config.city}
  - Theater: ${config.theater}
  - Format: ${config.format}
  - Check Interval: ${config.checkInterval} minutes
  - Ntfy Topic: ${config.ntfyTopic}
`);

runCheck();

// Schedule recurring checks every 5 minutes
cron.schedule(`*/${config.checkInterval} * * * *`, runCheck);

console.log(`Monitor started. Will check every ${config.checkInterval} minutes.`);
console.log('Press Ctrl+C to stop.');
