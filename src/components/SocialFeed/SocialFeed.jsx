import React, { useState, useEffect, useRef } from 'react';
import { socialService } from '../../services/socialService';
import './SocialFeed.css';

// Minimal Inline Instagram SVG Glyph
const InstagramIcon = ({ size = 20, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Video Camera SVG Glyph for Video/Reel Posts
const VideoIcon = ({ size = 16, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const SocialPostCard = ({ post, isAriaHidden = false }) => {
  const altText = post.caption
    ? post.caption.slice(0, 100).replace(/[#@].*$/, '').trim() || 'Option One Store curated piece'
    : 'Option One Store curated piece';

  return (
    <article className="social-post-card" tabIndex={isAriaHidden ? -1 : 0}>
      <a
        href={post.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="social-post-link"
        aria-label={`View Instagram post: ${altText}`}
        tabIndex={isAriaHidden ? -1 : 0}
      >
        <div className="social-image-wrapper">
          <img
            src={post.image || post.thumbnail}
            alt={altText}
            className="social-post-image"
            loading="lazy"
          />

          {post.mediaType === 'VIDEO' && (
            <div className="social-video-badge" title="Instagram Reel / Video">
              <VideoIcon size={14} />
            </div>
          )}

          <div className="social-post-overlay">
            <div className="social-overlay-content">
              <div className="social-ig-header">
                <InstagramIcon size={20} className="social-ig-icon" />
                <span className="social-view-label">View on Instagram</span>
              </div>
              {post.caption && (
                <p className="social-caption-preview">
                  {post.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      </a>
    </article>
  );
};

const SocialFeed = () => {
  const [posts, setPosts] = useState(() => socialService.getFallbackFeed());
  const [isLoading, setIsLoading] = useState(true);
  const marqueeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSocialFeed() {
      try {
        const feed = await socialService.fetchInstagramFeed();
        if (isMounted && Array.isArray(feed) && feed.length > 0) {
          setPosts(feed);
        }
      } catch {
        // Keeps fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSocialFeed();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="social-feed-section" aria-labelledby="curated-collection-heading">
      {/* Section Header */}
      <div className="social-feed-header text-center">
        <span className="social-feed-subtitle">CURATED COLLECTION</span>
        <h3 id="curated-collection-heading">Experience the Option One Lifestyle</h3>
        <p>Discover carefully selected luxury pieces designed for timeless elegance and modern living.</p>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div
        className="social-marquee-container"
        ref={marqueeRef}
        role="region"
        aria-label="Instagram social media carousel"
      >
        <div className="social-marquee-track">
          {/* Primary Set */}
          <div className="social-marquee-group">
            {posts.map((post, idx) => (
              <SocialPostCard key={`primary-${post.id}-${idx}`} post={post} />
            ))}
          </div>

          {/* Seamless Duplicate Set (hidden from screen readers to prevent duplication) */}
          <div className="social-marquee-group" aria-hidden="true">
            {posts.map((post, idx) => (
              <SocialPostCard key={`clone-${post.id}-${idx}`} post={post} isAriaHidden={true} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialFeed;
