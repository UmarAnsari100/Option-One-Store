/**
 * Instagram Service - Server-side Meta Graph API Integration
 * Handles Instagram Professional / Business account sync with in-memory caching and luxury fallback.
 * Access tokens are kept strictly server-side and never exposed to the client.
 */

// In-Memory Cache (10-minute TTL)
const CACHE_TTL_MS = 10 * 60 * 1000;
let instagramCache = {
  data: null,
  cachedAt: 0
};

// Curated Luxury Fallback Posts (Used when credentials are not configured or Meta API is unreachable)
const FALLBACK_POSTS = [
  {
    id: 'opt-ig-1',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Precision in motion. The Maison Skeleton Tourbillon in 316L stainless steel and sapphire crystal. #OptionOne #HauteHorlogerie',
    timestamp: '2026-03-08T14:20:00Z'
  },
  {
    id: 'opt-ig-2',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Handcrafted Italian full-grain calfskin leather atelier bag. Form, function, and everlasting grace. #OptionOneLeather #Atelier',
    timestamp: '2026-03-07T11:45:00Z'
  },
  {
    id: 'opt-ig-3',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: '18K Yellow Gold & Solitaire Pavé Diamond necklace. Subtle grandeur designed for modern evenings. #FineJewelry #OptionOne',
    timestamp: '2026-03-06T16:10:00Z'
  },
  {
    id: 'opt-ig-4',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Studio Active Noise Cancelling acoustic headphones. Precision beryllium drivers meeting tailored comfort. #OptionOneAudio',
    timestamp: '2026-03-05T09:30:00Z'
  },
  {
    id: 'opt-ig-5',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'The Executive Wardrobe edit. Tailored silhouettes engineered for visionary leadership. #ExecutiveStyle #MaisonDeLuxe',
    timestamp: '2026-03-04T18:00:00Z'
  },
  {
    id: 'opt-ig-6',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Rose gold chronometer accents. Every second calibrated to absolute perfection. #LuxuryLifestyle #OptionOne',
    timestamp: '2026-03-03T13:15:00Z'
  },
  {
    id: 'opt-ig-7',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Refined gems crafted with timeless heritage. Explore the Maison signature jewelry collection. #TimelessBeauty',
    timestamp: '2026-03-02T10:00:00Z'
  },
  {
    id: 'opt-ig-8',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Precision automotive travel accessories. Seamless aesthetics on open roads. #AutomotiveLuxury #OptionOneLifestyle',
    timestamp: '2026-03-01T15:40:00Z'
  }
];

class InstagramService {
  /**
   * Normalizes raw Meta/Instagram API item into public schema
   */
  normalizeMedia(item) {
    const isVideo = item.media_type === 'VIDEO';
    const image = isVideo ? (item.thumbnail_url || item.media_url) : item.media_url;
    const thumbnail = item.thumbnail_url || item.media_url;

    return {
      id: String(item.id),
      mediaType: item.media_type || 'IMAGE',
      image: image || '',
      thumbnail: thumbnail || '',
      permalink: item.permalink || 'https://www.instagram.com/optiononestore',
      caption: item.caption || 'Option One Store curated piece.',
      timestamp: item.timestamp || new Date().toISOString()
    };
  }

  /**
   * Retrieves Instagram feed with in-memory caching and fallback
   */
  async getFeed() {
    const now = Date.now();

    // 1. Return fresh cache if available
    if (instagramCache.data && (now - instagramCache.cachedAt < CACHE_TTL_MS)) {
      return {
        data: instagramCache.data,
        source: 'cache',
        cachedAt: instagramCache.cachedAt
      };
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID?.trim();

    // 2. If credentials are missing, serve fallback gracefully
    if (!accessToken) {
      return {
        data: FALLBACK_POSTS,
        source: 'fallback',
        message: 'INSTAGRAM_ACCESS_TOKEN not configured. Serving curated fallback.'
      };
    }

    // 3. Fetch from Meta Graph API
    try {
      const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
      let metaUrl;

      if (accountId) {
        // Meta Graph API for Instagram Professional/Business Account
        metaUrl = `https://graph.facebook.com/v22.0/${accountId}/media?fields=${fields}&limit=12&access_token=${accessToken}`;
      } else {
        // Meta Basic Display / User Token flow
        metaUrl = `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${accessToken}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(metaUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      const json = await response.json();

      if (json.error) {
        console.error('[Meta Instagram API Error]:', json.error.message);
        // Fall back to previous cache if exists, otherwise fallback posts
        if (instagramCache.data) {
          return { data: instagramCache.data, source: 'cache_stale' };
        }
        return { data: FALLBACK_POSTS, source: 'fallback', error: json.error.message };
      }

      if (Array.isArray(json.data) && json.data.length > 0) {
        const normalized = json.data.map((item) => this.normalizeMedia(item));

        // Update in-memory cache
        instagramCache = {
          data: normalized,
          cachedAt: now
        };

        return {
          data: normalized,
          source: 'meta_api',
          cachedAt: now
        };
      }

      // If empty array returned from Meta
      return { data: FALLBACK_POSTS, source: 'fallback' };
    } catch (err) {
      console.error('[Instagram Fetch Exception]:', err.message);
      if (instagramCache.data) {
        return { data: instagramCache.data, source: 'cache_stale' };
      }
      return { data: FALLBACK_POSTS, source: 'fallback', error: err.message };
    }
  }

  getFallbackFeed() {
    return FALLBACK_POSTS;
  }
}

export const instagramService = new InstagramService();
