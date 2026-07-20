import React from 'react';
import { Star } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Anderson',
    role: 'Verified Buyer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    text: '"The attention to detail is truly unparalleled. It pairs effortlessly with my daily wardrobe while maintaining a sophisticated heritage sensibility."'
  },
  {
    id: 2,
    name: 'Robert Thorne',
    role: 'Verified Buyer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    text: '"Truly a premium product. It has quickly become my daily essential. The craftsmanship and material feel extremely substantial and luxurious."'
  },
  {
    id: 3,
    name: 'Elena Rossi',
    role: 'Verified Buyer',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    text: '"The highest quality I have received. The fact it provides this standard for pieces I wear every single day makes it the absolute perfect investment."'
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">The Option One Experience</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-accent)" color="var(--color-accent)" />
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <img src={testimonial.image} alt={testimonial.name} className="author-image" loading="lazy" />
                <div className="author-info">
                  <h5 className="author-name">{testimonial.name}</h5>
                  <span className="author-role">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;