import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Sparkles } from 'lucide-react';
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import './About.css';

const About = () => {
  return (
    <div className="about-page-wrapper">
      <SEO
        title="About Us | Option One Store - Maison de Luxe"
        description="Learn about the heritage of Option One Store, our commitment to quiet luxury, Swiss-trained horology, and Italian leather craftsmanship."
        canonical="https://optiononestore.com/about"
        jsonLd={seoService.getBreadcrumbSchema([{ name: 'About Us', path: '/about' }])}
      />

      {/* Editorial Header */}
      <div className="about-header">
        <div className="container">
          <span className="about-subtitle">OUR MANIFESTO</span>
          <h1 className="about-title">Crafting Time, Style,<br/>& Quiet Luxury</h1>
        </div>
      </div>

      {/* Narrative Section */}
      <section className="about-story section-padding">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>The Heritage of Option One</h2>
              <p>
                Founded in 2012, Option One Store began with a singular, uncompromising vision: to design and curate everyday accessories that marry heritage craftsmanship with contemporary design. We believe that true luxury lies in the details—the precision of a quartz movement, the texture of hand-stitched vegetable-tanned leather, and the heavy weight of solid gold vermeil.
              </p>
              <p>
                Every piece in our catalog is engineered to endure. We collaborate exclusively with family-owned Italian tanneries and Swiss-trained horologists who share our standard of excellence. We don't believe in fast fashion; we believe in creating objects that collect stories, transcending seasons to remain forever in style.
              </p>
            </div>
            <div className="story-image-container">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop" 
                alt="Workspace atelier" 
                className="story-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>2012</h3>
              <p>Year Founded</p>
            </div>
            <div className="stat-card">
              <h3>15+</h3>
              <p>Global Boutiques</p>
            </div>
            <div className="stat-card">
              <h3>50k+</h3>
              <p>Discerning Clients</p>
            </div>
            <div className="stat-card">
              <h3>100%</h3>
              <p>Conflict-Free Stones</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values section-padding">
        <div className="container">
          <h2 className="values-section-title text-center">Our Commitment</h2>
          <div className="values-grid">
            <div className="value-card">
              <ShieldCheck size={32} strokeWidth={1.2} />
              <h4>Uncompromising Quality</h4>
              <p>We source only the highest grade stainless steel, genuine full-grain calf leathers, and scratch-resistant sapphire crystal glass.</p>
            </div>
            
            <div className="value-card">
              <Award size={32} strokeWidth={1.2} />
              <h4>Artisanal Integrity</h4>
              <p>Each leather bag is hand-finished in Florence, and each watch caliber is certified by our master watchmakers.</p>
            </div>

            <div className="value-card">
              <Sparkles size={32} strokeWidth={1.2} />
              <h4>Ethical Luxury</h4>
              <p>All jewelry elements utilize ethically sourced metals and certified lab-grown diamonds, reducing ecological impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-card">
            <h2>Experience Option One</h2>
            <p>Step inside our digital catalog or visit our flagship boutique in Manhattan.</p>
            <Link to="/shop" className="btn btn-primary">Shop The Collection</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;