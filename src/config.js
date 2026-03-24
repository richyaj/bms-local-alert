// Configuration file - Values can be overridden via environment variables
export const config = {
  // Movie and theater details
  movieTitle: process.env.MOVIE_TITLE || 'Project Hail Mary',
  city: process.env.CITY || 'Chennai',
  theater: process.env.THEATER || 'INOX Luxe',
  format: process.env.FORMAT || 'IMAX',

  // Ntfy configuration
  ntfyTopic: process.env.NTFY_TOPIC || 'bms-imax-hailmary-chen-2026',
  ntfyServer: process.env.NTFY_SERVER || 'https://ntfy.sh',
  bookingUrl: process.env.BOOKING_URL || 'https://www.pvrcinemas.com/',

  // Monitor settings
  checkInterval: parseInt(process.env.CHECK_INTERVAL || '5', 10),
  notifyOnError: process.env.NOTIFY_ON_ERROR !== 'false',

  // Browser settings
  headless: true, // Always headless in container
  slowMo: 0,
};
