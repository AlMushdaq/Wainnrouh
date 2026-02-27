import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper: geocode a place name via Nominatim
async function geocodePlace(query) {
  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      { headers: { 'User-Agent': 'LetsGoApp/1.0' } }
    );
    const results = await response.json();
    if (results.length > 0) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    }
  } catch (err) {
    console.error('Geocode failed for:', query, err);
  }
  return null;
}

// Helper: calculate distance between two points in km (Haversine formula)
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

app.post('/api/ai-suggest', async (req, res) => {
  const { city, category, mood, userLat, userLng } = req.body;

  if (!city || !category || !mood) {
    return res.status(400).json({ error: 'city, category, and mood are required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: `You are a local expert. You ONLY suggest places that are physically located inside the city or area the user specifies. Never suggest places in other cities, countries, or regions. Always respond with valid JSON only — no markdown, no explanation, just the JSON array.`
          },
          {
            role: 'user',
            content: `I am in "${city}"${userLat && userLng ? ` at coordinates (${userLat}, ${userLng})` : ''}. Suggest exactly 5 real places INSIDE "${city}" for "${category}" matching this vibe: "${mood}".

CRITICAL RULES:
- Every single place MUST be physically located inside "${city}" and close to the user's area.
- Use real, existing place names that locals would know.
- No generic chains unless they are popular local favorites.
- Prioritize places that are nearby the user's location.
- Each place must be different.

Respond with ONLY this JSON array (no other text):
[{"name": "Place Name", "address": "Neighborhood or area in ${city}"}, ...]`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));

    let content = data.choices?.[0]?.message?.content || '';

    // Remove markdown code blocks if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Try to extract JSON array
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      content = arrayMatch[0];
    }

    const parsed = JSON.parse(content);
    const places = Array.isArray(parsed) ? parsed : [parsed];

    // Geocode each place and calculate distance (with small delays for Nominatim rate limits)
    const results = [];
    for (const place of places.slice(0, 5)) {
      const coords = await geocodePlace(`${place.name}, ${city}`);
      let distanceKm = null;
      if (coords && userLat && userLng) {
        distanceKm = Math.round(haversineKm(userLat, userLng, coords.lat, coords.lng) * 10) / 10;
      }
      results.push({
        name: place.name,
        address: place.address || '',
        lat: coords?.lat || null,
        lng: coords?.lng || null,
        distanceKm,
      });
      // Small delay to respect Nominatim rate limits (1 req/sec)
      await new Promise(r => setTimeout(r, 1100));
    }

    res.json({ suggestions: results });
  } catch (err) {
    console.error('AI suggestion failed:', err);
    res.status(500).json({ error: 'AI suggestion failed', details: err.message });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.post('/api/scrape', async (req, res) => {
  const { city, category, mood, userLat, userLng } = req.body;

  if (!city || !category) {
    return res.status(400).json({ error: 'city and category are required' });
  }

  const query = mood ? `${mood} ${category}` : category;
  const scraperPath = join(__dirname, 'scraper.py');

  const args = [scraperPath, query, city, '--max', '5'];
  if (mood) args.push('--mood', mood);
  if (userLat) args.push('--lat', String(userLat));
  if (userLng) args.push('--lng', String(userLng));

  try {
    const result = await new Promise((resolve, reject) => {
      execFile('python3', args, { timeout: 60000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          console.error('Scraper error:', error.message);
          console.error('Scraper stderr:', stderr);
          reject(new Error(`Scraper failed: ${error.message}`));
          return;
        }
        try {
          const data = JSON.parse(stdout);
          resolve(data);
        } catch (e) {
          console.error('Scraper output parse error:', stdout);
          reject(new Error('Failed to parse scraper output'));
        }
      });
    });

    res.json(result);
  } catch (err) {
    console.error('Scrape failed:', err);
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

// Helper: run the scraper and return results
function runScraper(query, city, userLat, userLng, maxResults = 10, sortMode = 'distance') {
  const scraperPath = join(__dirname, 'scraper.py');
  const args = [scraperPath, query, city, '--max', String(maxResults), '--sort', sortMode];
  // Always pass user lat/lng so distance can be calculated
  if (userLat) args.push('--lat', String(userLat));
  if (userLng) args.push('--lng', String(userLng));

  return new Promise((resolve, reject) => {
    execFile('python3', args, { timeout: 90000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Scraper error:', error.message);
        console.error('Scraper stderr:', stderr);
        reject(new Error(`Scraper failed: ${error.message}`));
        return;
      }
      try {
        const data = JSON.parse(stdout);
        resolve(data.suggestions || []);
      } catch (e) {
        console.error('Scraper output parse error:', stdout);
        reject(new Error('Failed to parse scraper output'));
      }
    });
  });
}

app.post('/api/smart-suggest', async (req, res) => {
  const { city, category, sortBy, exclude, userLat, userLng } = req.body;

  if (!city || !category || !sortBy) {
    return res.status(400).json({ error: 'city, category, and sortBy are required' });
  }

  // Normalize exclude list for case-insensitive matching
  const excludeSet = new Set((exclude || []).map(n => n.toLowerCase()));

  try {
    // Step 1: Scrape places from Google Maps (get more if we need to exclude some)
    const maxToScrape = 10 + excludeSet.size;
    console.log(`[smart-suggest] Scraping Google Maps for "${category}" in ${city} (sort: ${sortBy}, excluding ${excludeSet.size} places)...`);
    let scraped = [];
    try {
      scraped = await runScraper(category, city, userLat, userLng, maxToScrape, sortBy);
      console.log(`[smart-suggest] Scraped ${scraped.length} places from Google Maps`);
    } catch (err) {
      console.error('[smart-suggest] Scrape failed:', err.message);
      return res.status(500).json({ error: 'Failed to search Google Maps', details: err.message });
    }

    // Filter out already-seen places
    if (excludeSet.size > 0) {
      scraped = scraped.filter(p => !excludeSet.has(p.name.toLowerCase()));
      console.log(`[smart-suggest] After excluding seen: ${scraped.length} places`);
    }

    // Step 2: Calculate distance for all places if user location is available
    if (userLat && userLng) {
      scraped.forEach(p => {
        if (p.lat && p.lng && (p.distanceKm === null || p.distanceKm === undefined)) {
          p.distanceKm = Math.round(haversineKm(userLat, userLng, p.lat, p.lng) * 10) / 10;
        }
      });
    }

    // Step 3: Filter — only keep places with 4+ stars AND 10+ reviews
    let filtered = scraped.filter(p => {
      const hasGoodRating = p.rating && p.rating >= 4.0;
      const hasEnoughReviews = p.reviews && p.reviews >= 10;
      return hasGoodRating && hasEnoughReviews;
    });

    console.log(`[smart-suggest] After quality filter (4+★, 10+ reviews): ${filtered.length} places`);

    // If filter is too strict and we have fewer than 5, include all with 3.5+ stars
    if (filtered.length < 5) {
      filtered = scraped.filter(p => p.rating && p.rating >= 3.5);
      console.log(`[smart-suggest] Relaxed filter (3.5+★): ${filtered.length} places`);
    }

    // If still too few, just use all scraped results
    if (filtered.length < 3) {
      filtered = scraped;
    }

    // Step 4: Sort by the user's preference
    if (sortBy === 'distance') {
      filtered.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortBy === 'stars') {
      filtered.sort((a, b) => {
        // Sort by rating desc, then by reviews desc
        if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
        return (b.reviews || 0) - (a.reviews || 0);
      });
    }

    // Return top 5
    const results = filtered.slice(0, 5).map(p => ({
      name: p.name,
      address: p.address || '',
      rating: p.rating || null,
      reviews: p.reviews || null,
      lat: p.lat || null,
      lng: p.lng || null,
      distanceKm: p.distanceKm ?? null,
      source: 'maps',
    }));

    console.log(`[smart-suggest] Returning ${results.length} places (sorted by ${sortBy})`);
    res.json({ suggestions: results });
  } catch (err) {
    console.error('Smart suggestion failed:', err);
    res.status(500).json({ error: 'Smart suggestion failed', details: err.message });
  }
});

app.post('/api/geocode', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      { headers: { 'User-Agent': 'LetsGoApp/1.0' } }
    );
    const results = await response.json();

    if (results.length > 0) {
      res.json({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
    } else {
      res.json({ lat: null, lng: null });
    }
  } catch (err) {
    console.error('Geocoding failed:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const { default: path } = await import('path');
  app.use(express.static(path.resolve('dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
