import { chromium } from 'playwright';
import { config } from './config.js';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a movie is available for booking on BookMyShow
 * @param {string} movieTitle - The exact movie title to search for
 * @param {string} city - City name (e.g., 'Chennai')
 * @param {string} theater - Theater name (e.g., 'INOX Luxe')
 * @param {string} format - Movie format (e.g., 'IMAX')
 * @returns {Promise<boolean>} - True if movie is available for booking
 */
export async function checkMovieAvailability(movieTitle, city, theater, format) {
  let browser;
  try {
    browser = await chromium.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    console.log('Navigating to PVR INOX...');
    await page.goto('https://www.pvrcinemas.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Best-effort city selection to initialize the website state.
    await page.getByText(new RegExp(escapeRegExp(city), 'i')).first().click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1200);

    console.log(`Checking movie '${movieTitle}' in ${city} via PVR APIs...`);
    const result = await page.evaluate(async ({ movieTitle, city, theater, format }) => {
      const normalize = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const includes = (a, b) => normalize(a).includes(normalize(b));

      const requestHeaders = {
        'content-type': 'application/json',
        appVersion: '1.0',
        chain: 'PVR',
        country: 'INDIA',
        platform: 'WEBSITE',
        city,
        authorization: 'Bearer',
      };

      const callApi = async (url, body) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(body),
        });
        const json = await response.json().catch(() => ({}));
        return { status: response.status, json };
      };

      const nowShowingResponse = await callApi(
        'https://api3.pvrcinemas.com/api/v1/booking/content/nowshowing',
        { city }
      );

      if (nowShowingResponse.status !== 200) {
        return {
          available: false,
          reason: `Now showing API failed with status ${nowShowingResponse.status}`,
        };
      }

      const allMovies = (nowShowingResponse.json?.output?.mv || []).flatMap((group) => group.films || []);
      const titleMatches = allMovies.filter((film) =>
        includes(film.filmName || film.filmCommonName || '', movieTitle)
      );

      if (!titleMatches.length) {
        return {
          available: false,
          reason: 'Movie not found in PVR now-showing list for selected city',
          movieCount: allMovies.length,
        };
      }

      const requestedFormat = normalize(format);
      const scoredMovies = titleMatches
        .map((film) => {
          let score = 0;
          const filmName = normalize(film.filmName || film.filmCommonName || '');
          const filmFormat = normalize(film.format || '');

          if (filmName === normalize(movieTitle)) score += 4;
          if (filmName.includes(normalize(movieTitle))) score += 2;
          if (requestedFormat && (filmFormat.includes(requestedFormat) || filmName.includes(requestedFormat))) {
            score += 3;
          }

          return { film, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      const formatMatchesShow = (show, experience, film) => {
        if (!requestedFormat) return true;

        const haystack = [
          film?.format,
          film?.filmName,
          experience?.experience,
          experience?.experienceKey,
          show?.movieFormat,
          show?.filmFormat,
          show?.screenType,
          show?.soundFormat,
          show?.screenName,
        ]
          .map((item) => normalize(item))
          .join(' | ');

        return haystack.includes(requestedFormat);
      };

      const isShowAvailable = (show) => {
        const statusText = normalize(show?.statusTxt);
        if (show?.status === 1) return true;
        if (statusText.includes('available')) return true;
        const seats = Number(show?.availableSeats || 0);
        if (seats > 0 && !statusText.includes('sold')) return true;
        return false;
      };

      const inspected = [];

      for (const candidate of scoredMovies) {
        const film = candidate.film;
        const sessionsResponse = await callApi(
          'https://api3.pvrcinemas.com/api/v1/booking/content/msessions',
          {
            city,
            mid: film.filmId,
            experience: 'ALL',
            specialTag: 'ALL',
            lat: '12.883208',
            lng: '80.3613280',
            lang: 'ALL',
            format: 'ALL',
            dated: 'NA',
            time: '08:00-24:00',
            cinetype: 'ALL',
            hc: 'ALL',
            adFree: false,
          }
        );

        if (sessionsResponse.status !== 200) {
          inspected.push({ filmName: film.filmName, reason: `msessions:${sessionsResponse.status}` });
          continue;
        }

        const cinemaSessions = sessionsResponse.json?.output?.movieCinemaSessions || [];
        inspected.push({ filmName: film.filmName, cinemas: cinemaSessions.length });

        for (const cinemaEntry of cinemaSessions) {
          const cinemaName = cinemaEntry?.cinema?.name || '';
          if (theater && !includes(cinemaName, theater)) continue;

          const experienceSessions = cinemaEntry?.experienceSessions || [];
          for (const experience of experienceSessions) {
            const shows = experience?.shows || [];
            for (const show of shows) {
              if (!formatMatchesShow(show, experience, film)) continue;
              if (!isShowAvailable(show)) continue;

              return {
                available: true,
                reason: 'Matching available show found',
                match: {
                  filmName: film.filmName,
                  theater: cinemaName,
                  format: show?.movieFormat || show?.filmFormat || experience?.experience || film?.format || 'N/A',
                  showTime: show?.showTime || 'N/A',
                  availableSeats: Number(show?.availableSeats || 0),
                },
              };
            }
          }
        }
      }

      return {
        available: false,
        reason: 'No matching available shows found in PVR session data',
        inspected,
      };
    }, { movieTitle, city, theater, format });

    if (result.available) {
      const match = result.match || {};
      console.log(`✓ Available on PVR: ${match.theater} | ${match.showTime} | ${match.format}`);
      return true;
    }

    console.log(`Not available on PVR: ${result.reason || 'No details'}`);
    if (Array.isArray(result.inspected) && result.inspected.length) {
      console.log(`Inspected variants: ${result.inspected.map((x) => x.filmName).join(', ')}`);
    }
    return false;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
