import React from 'react';
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import { Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';
import './Blog.css';

const Blog = () => {
  const articles = [
    {
      id: 1,
      title: 'The Art of Mechanical Longevity: Horology Basics',
      category: 'Luxury Watches',
      date: 'June 18, 2026',
      readTime: '6 min read',
      excerpt: 'Mechanical watches represent the peak of miniature craftsmanship. Discover why proper winding cycles, periodic cleaning, and magnetic safety preserve watch accuracy for decades.',
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Caring for Full-Grain Calfskin & Vachetta Leather',
      category: 'Leather Care',
      date: 'June 28, 2026',
      readTime: '5 min read',
      excerpt: 'Fine leather is a living material that ages beautifully with a rich patina. Learn how to condition, clean spills, and store handbags away from intense humidity.',
      image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'The Modern Gentleman: Grooming & Boardroom Accessories',
      category: 'Style Guides',
      date: 'July 05, 2026',
      readTime: '4 min read',
      excerpt: 'Cufflinks, pocket squares, and leather briefcases are small details that define a professional. We explore accessory pairings that command respect in elite rooms.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 4,
      title: 'Pruning Your Jewelry: Cleaning Diamonds & Gold Vermeil',
      category: 'Jewelry Care',
      date: 'July 11, 2026',
      readTime: '7 min read',
      excerpt: 'Gold plating vermeil is sensitive to perfumes and cosmetics. Our gemologist team outlines a step-by-step cleaning guide using warm water and micro-fiber cloths.',
      image: 'https://images.unsplash.com/photo-1599643477874-5c866f466cb5?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 5,
      title: 'AW26 Fashion Forecast: The Rise of Monochromatic Textures',
      category: 'Fashion Trends',
      date: 'July 14, 2026',
      readTime: '8 min read',
      excerpt: 'The transition into winter calls for layered fabrics and structured shapes. Explore designer houses redefining quiet luxury through wool coats and minimalist boots.',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 6,
      title: 'The Gifting Protocol: Choosing Timeless Heirlooms',
      category: 'Gift Guides',
      date: 'July 16, 2026',
      readTime: '5 min read',
      excerpt: 'When choosing gifts for corporate clients or family, choose heirlooms over trends. Learn why designer wallets, sterling card cases, and emeralds are universally admired.',
      image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop'
    }
  ];

  return (
    <div className="blog-page-wrapper">
      <SEO
        title="Luxury Editorial & Horology Insights | Option One Store Blog"
        description="Inside horological engineering, fine leather craftsmanship, wardrobe guidelines, and accessory etiquette curated by Option One Store concierge editors."
        canonical="https://optiononestore.com/blog"
        jsonLd={seoService.getBreadcrumbSchema([{ name: 'Luxury Editorial', path: '/blog' }])}
      />
      {/* Blog Hero */}
      <section className="blog-hero-section">
        <div className="container text-center">
          <div className="blog-badge">
            <Sparkles size={12} className="sparkle-icon" />
            <span>THE ATELIER JOURNAL</span>
          </div>
          <h1 className="blog-headline">Luxury Editorial</h1>
          <p className="blog-subheading">
            Inside horological engineering, fine leather craftsmanship, wardrobe guidelines, and accessory etiquette curated by our concierge editors.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="blog-grid-section container">
        <div className="blog-articles-grid">
          {articles.map((article) => (
            <article className="blog-article-card" key={article.id}>
              <div className="article-img-frame">
                <img src={article.image} alt={article.title} className="article-img" loading="lazy" />
                <span className="article-category-tag">{article.category}</span>
              </div>
              
              <div className="article-body">
                <div className="article-meta-row">
                  <div className="meta-item">
                    <Calendar size={12} />
                    <span>{article.date}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={12} />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>
                
                <button className="article-read-btn" onClick={() => alert('Our complete editorial article viewer is launching in the next chronicle issue!')}>
                  <span>Read Article</span>
                  <ArrowRight size={14} className="btn-arrow" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
