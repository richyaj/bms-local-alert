# BookMyShow Availability Monitor

A Playwright-based automation tool that monitors BookMyShow for movie availability and sends real-time notifications via ntfy.sh.

## Features

- ✅ Automated BookMyShow website monitoring
- ✅ Checks for movie availability at specific theaters in specific formats
- ✅ Real-time notifications via ntfy.sh
- ✅ Configurable check interval (default: every 5 minutes)
- ✅ Smart notifications (only sends when status changes)
- ✅ Error handling and optional error notifications

## Prerequisites

- Node.js 16+ installed
- An ntfy.sh account (free, no signup needed) or self-hosted ntfy server
- A BookMyShow account (for booking when notified)

## Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
```

3. Playwright will automatically download the necessary browser binaries

## Configuration

Edit `src/config.js` to customize the monitor:

```javascript
{
  movieTitle: 'Your Movie Title',      // Exact movie title from BookMyShow
  city: 'Chennai',                      // Your city
  theater: 'INOX Luxe',                // Theater name
  format: 'IMAX',                       // Movie format
  ntfyTopic: 'bookmyshow_alerts',       // Your ntfy topic
  checkInterval: 5,                     // Check every 5 minutes
  notifyOnError: true,                  // Send error notifications
  headless: true,                       // Hide browser window
}
```

### Configuration Options

- **movieTitle**: The exact name of the movie to monitor
- **city**: City where you want to watch (e.g., 'Chennai', 'Mumbai', 'Bangalore')
- **theater**: Specific theater chain/complex (e.g., 'INOX Luxe', 'PVR Premium')
- **format**: Movie format (e.g., 'IMAX', '2D', 'Dolby', '4DX')
- **ntfyTopic**: Custom ntfy topic name (use lowercase, no spaces)
- **ntfyServer**: ntfy server URL (default: https://ntfy.sh)
- **checkInterval**: Minutes between checks
- **notifyOnError**: Send notifications when an error occurs
- **headless**: Set to `false` to see the browser in action
- **slowMo**: Add delay (ms) between actions for debugging

## Usage

### Start the monitor

```bash
npm start
```

The script will:
1. Perform an immediate check
2. Schedule checks every 5 minutes
3. Send notifications to your ntfy topic when movie becomes available
4. Log all activities to console

### Watch mode (for development)

```bash
npm run dev
```

This uses Node's `--watch` flag to restart on file changes.

## Receiving Notifications

### Option 1: ntfy.sh (Recommended - No Setup)

1. Visit `https://ntfy.sh/your-topic-name` in your browser
2. You'll see notifications in real-time
3. Enable browser notifications for desktop alerts
4. Works on mobile too - just open the URL on your phone

### Option 2: Mobile App

- **iOS**: Use the ntfy app from App Store
- **Android**: Use the ntfy app from Play Store
- Subscribe to your topic name

### Option 3: Integrate with Services

ntfy supports integrations:
- Discord webhooks
- Telegram bots
- Email
- Custom webhooks

See [ntfy documentation](https://docs.ntfy.sh/) for more options.

## Example Configuration

```javascript
// Monitor Dune 2 at INOX Luxe Chennai for IMAX
export const config = {
  movieTitle: 'Dune: Part Two',
  city: 'Chennai',
  theater: 'INOX Luxe',
  format: 'IMAX',
  ntfyTopic: 'dune2_imax_alerts',
  checkInterval: 5,
  notifyOnError: true,
  headless: true,
};
```

## How It Works

1. **Initialization**: Launches a headless Chromium browser
2. **Navigation**: Goes to BookMyShow and selects your city
3. **Search**: Searches for the specified movie
4. **Theater Lookup**: Finds your theater and checks for the format
5. **Availability Check**: Verifies if booking buttons are active
6. **Notification**: Sends ntfy notification if available
7. **Scheduling**: Waits 5 minutes and repeats

## Troubleshooting

### Movie not found
- Verify the exact movie title matches BookMyShow
- Check the movie is released/showing in your city
- Use headless: false to see what's happening

### Theater not found
- Use the exact theater name as shown on BookMyShow
- Check theater availability in your city
- Some theaters may not be available for online booking

### Notifications not received
- Confirm ntfy topic is spelled correctly
- Visit `https://ntfy.sh/your-topic` to verify messages arrive
- Check browser notification permissions
- For mobile: ensure the ntfy app has notification permissions

### Playwright browser issues
- Delete `node_modules` and run `npm install` again
- Check Node.js version (16+ required)
- On macOS: May need to allow Chromium in Security & Privacy

## Stopping the Monitor

Press `Ctrl+C` in the terminal to stop the monitor.

## Performance Notes

- Each check takes 15-30 seconds depending on website speed
- With 5-minute intervals, you'll have ~100-150 checks per day
- Browser is closed after each check to minimize memory usage
- Consider increasing interval if you experience rate limiting

## Advanced Usage

### Custom ntfy Server

If using a self-hosted ntfy instance:

```javascript
ntfyServer: 'https://your-ntfy-instance.com',
```

### Modify Notification Logic

Edit `src/index.js` to change when notifications are sent:

```javascript
// Current: Sends only when movie becomes available
// Modify to: Send every check, include current status, etc.
if (isAvailable && isAvailable !== lastCheckedStatus) {
  // Only sends when status changes from unavailable to available
}
```

## Limitations

- BookMyShow's website structure may change, requiring updates to selectors
- High-demand movies may sell out quickly despite notifications
- Some shows may require membership for online booking
- Timing depends on BookMyShow's server response time

## Support

For ntfy issues: https://docs.ntfy.sh/
For Playwright issues: https://playwright.dev/

## License

MIT

---

**Note**: This tool is for personal use. Respect BookMyShow's Terms of Service and rate limits.
