// High-performance in-memory cache for AcademiX frontend
// Implements Stale-While-Revalidate (SWR) for instant (0ms) tab switching

const cache = new Map();

/**
 * Synchronously retrieves cached data if available and not expired.
 * Use this in useState initializer for instant 0ms rendering on tab switch.
 *
 * @param {string} url - The API endpoint URL
 * @param {string} [authHeader=''] - Optional authorization header
 * @param {number} [ttlMs=300000] - Time to live in ms (default: 5 minutes)
 * @returns {any|null} Cached data or null
 */
export function getCachedData(url, authHeader = '', ttlMs = 5 * 60 * 1000) {
  const cacheKey = `${url}_${authHeader}`;
  const entry = cache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp < ttlMs) {
    return entry.data;
  }
  return null;
}

/**
 * Stores data into the in-memory cache.
 *
 * @param {string} url - The API endpoint URL
 * @param {any} data - Data to cache
 * @param {string} [authHeader=''] - Optional authorization header
 */
export function setCachedData(url, data, authHeader = '') {
  const cacheKey = `${url}_${authHeader}`;
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Cached fetch helper with automatic in-memory caching.
 *
 * @param {string} url - URL to fetch
 * @param {RequestInit} [options={}] - Standard fetch options
 * @param {number} [ttlMs=300000] - Cache validity in ms
 * @returns {Promise<any>}
 */
export async function cachedFetch(url, options = {}, ttlMs = 5 * 60 * 1000) {
  const method = (options.method || 'GET').toUpperCase();
  const authHeader = options.headers?.Authorization || options.headers?.authorization || '';

  // Only GET requests are cached
  if (method !== 'GET') {
    const res = await fetch(url, options);
    return res;
  }

  const cached = getCachedData(url, authHeader, ttlMs);
  if (cached !== null) {
    return cached;
  }

  const res = await fetch(url, options);
  if (res.ok) {
    const data = await res.json();
    setCachedData(url, data, authHeader);
    return data;
  }
  throw new Error(`Request failed with status ${res.status}`);
}

/**
 * Invalidates cache entries matching a URL prefix (or all entries if no prefix given).
 * Call this when modifying resources (e.g. creating a quiz, updating a student, etc.).
 *
 * @param {string} [urlPrefix] - Prefix to match (e.g., '/api/quizzes')
 */
export function invalidateCache(urlPrefix) {
  if (!urlPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(urlPrefix)) {
      cache.delete(key);
    }
  }
}
