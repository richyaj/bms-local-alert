# BookMyShow Availability Monitor - Setup Instructions

## Project Setup Complete ✓

Your Playwright-based BookMyShow availability monitor is ready!

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure your settings** in `src/config.js`
   - Update `movieTitle` with the exact movie name
   - Set your `city`, `theater`, and format (`IMAX`, `2D`, etc.)
   - Create a custom ntfy topic name (or use the default)

3. **Start monitoring**
   ```bash
   npm start
   ```

### How It Works

- Checks BookMyShow every 5 minutes (configurable)
- Sends ntfy notification when movie becomes available for booking
- Logs all activity to console
- Browser runs headlessly (invisible) for efficiency

### Receiving Notifications

**Option 1: In Browser** (Simplest)
- Visit: `https://ntfy.sh/your-topic-name`
- Enable browser notifications
- See alerts in real-time

**Option 2: Mobile App**
- iOS: ntfy app from App Store
- Android: ntfy app from Play Store
- Subscribe to your topic

### Project Structure

```
.
├── src/
│   ├── index.js              # Main scheduler and orchestration
│   ├── bookmyshow.js         # BookMyShow automation logic
│   ├── notifier.js           # ntfy notification sender
│   └── config.js             # Configuration settings
├── package.json              # Dependencies
└── README.md                 # Full documentation
```

### Configuration Guide

Edit `src/config.js`:

```javascript
export const config = {
  movieTitle: 'Dune: Part Two',   // Change this
  city: 'Chennai',                // Your city
  theater: 'INOX Luxe',          // Your theater
  format: 'IMAX',                 // Movie format
  ntfyTopic: 'my-movie-alerts',   // Your topic (lowercase, no spaces)
  checkInterval: 5,               // Every 5 minutes
  headless: true,                 // Set false to see browser
};
```

### Common Issues & Solutions

**Problem**: Movie not found
- Check exact spelling on BookMyShow
- Verify movie is available in your city

**Problem**: Theater not found
- Use exact name from BookMyShow
- Check if theater offers online booking

**Problem**: No notifications received
- Verify ntfy topic name is correct
- Visit `https://ntfy.sh/your-topic` to test

### Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Edit `src/config.js` with your movie details
3. ✅ Run: `npm start`
4. ✅ Visit `https://ntfy.sh/your-topic` to see notifications

---

For detailed information, see [README.md](README.md)
