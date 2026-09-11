import { apiUrl } from '../config/api';

/**
 * Social Service - Handles Instagram Feed retrieval via backend proxy.
 * Uses centralized apiUrl() configuration. Zero client-side tokens.
 */

// Curated Client Fallback Posts (Used if network/server is offline)
const CLIENT_FALLBACK_POSTS = [
  {
    id: 'local-fallback-1',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Maison Skeleton Automatic Tourbillon. Pure mechanical poetry on your wrist. #OptionOne #HauteHorlogerie',
    timestamp: '2026-03-08T14:20:00Z'
  },
  {
    id: 'local-fallback-2',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Handcrafted Italian full-grain calfskin leather atelier bag. Form, function, and everlasting grace. #OptionOneLeather #Atelier',
    timestamp: '2026-03-07T11:45:00Z'
  },
  {
    id: 'local-fallback-3',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: '18K Yellow Gold & Solitaire Pavé Diamond necklace. Subtle grandeur designed for modern evenings. #FineJewelry #OptionOne',
    timestamp: '2026-03-06T16:10:00Z'
  },
  {
    id: 'local-fallback-4',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Studio Active Noise Cancelling acoustic headphones. Precision beryllium drivers meeting tailored comfort. #OptionOneAudio',
    timestamp: '2026-03-05T09:30:00Z'
  },
  {
    id: 'local-fallback-5',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'The Executive Wardrobe edit. Tailored silhouettes engineered for visionary leadership. #ExecutiveStyle #MaisonDeLuxe',
    timestamp: '2026-03-04T18:00:00Z'
  },
  {
    id: 'local-fallback-6',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Rose gold chronometer accents. Every second calibrated to absolute perfection. #LuxuryLifestyle #OptionOne',
    timestamp: '2026-03-03T13:15:00Z'
  },
  {
    id: 'local-fallback-7',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Refined gems crafted with timeless heritage. Explore the Maison signature jewelry collection. #TimelessBeauty',
    timestamp: '2026-03-02T10:00:00Z'
  },
  {
    id: 'local-fallback-8',
    mediaType: 'IMAGE',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/optiononestore',
    caption: 'Precision automotive travel accessories. Seamless aesthetics on open roads. #AutomotiveLuxury #OptionOneLifestyle',
    timestamp: '2026-03-01T15:40:00Z'
  }
];

class SocialService {
  /**
   * Fetches the latest Instagram posts from the backend proxy
   * @returns {Promise<Array>} Array of normalized post objects
   */
  async fetchInstagramFeed() {
    try {
      const response = await fetch(apiUrl('/api/social/instagram'));

      if (!response.ok) {
        console.warn(`[SocialService] Backend returned HTTP ${response.status}. Using fallback posts.`);
        return CLIENT_FALLBACK_POSTS;
      }

      const result = await response.json();

      if (Array.isArray(result.data) && result.data.length > 0) {
        return result.data.map((item) => ({
          id: String(item.id),
          mediaType: item.mediaType || 'IMAGE',
          image: item.image || item.thumbnail || '',
          thumbnail: item.thumbnail || item.image || '',
          permalink: item.permalink || 'https://www.instagram.com/optiononestore',
          caption: item.caption || 'Option One Store curated piece.',
          timestamp: item.timestamp || new Date().toISOString()
        }));
      }

      return CLIENT_FALLBACK_POSTS;
    } catch (err) {
      console.warn('[SocialService] Network error fetching Instagram feed. Using fallback posts:', err.message);
      return CLIENT_FALLBACK_POSTS;
    }
  }

  getFallbackFeed() {
    return CLIENT_FALLBACK_POSTS;
  }
}

export const socialService = new SocialService();
