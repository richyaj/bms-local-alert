# Use the official Playwright image — includes all Chromium system dependencies
FROM mcr.microsoft.com/playwright:v1.48.2-jammy

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Playwright browsers are pre-installed in the base image,
# but we explicitly install chromium to ensure the right version
RUN npx playwright install chromium

# Copy source code
COPY . .

# Run the monitor
CMD ["npm", "start"]
