import React from 'react';
import { ShieldCheck, Lock, Truck, RefreshCw } from 'lucide-react';
import './WhyChooseUs.css';

const features = [
  {
    id: 1,
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
    title: 'Premium Quality',
    desc: 'Finest materials for timeless products.'
  },
  {
    id: 2,
    icon: <Truck size={28} strokeWidth={1.5} />,
    title: 'Fast Shipping',
    desc: 'Complimentary shipping on all orders.'
  },
  {
    id: 3,
    icon: <RefreshCw size={28} strokeWidth={1.5} />,
    title: 'Easy Returns',
    desc: 'Hassle-free returns within 30 days.'
  },
  {
    id: 4,
    icon: <Lock size={28} strokeWidth={1.5} />,
    title: 'Secure Payment',
    desc: '100% secure and protected payments.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us-section section-padding">
      <div className="container">
        <div className="features-grid">
          {features.map(feature => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <div className="feature-content">
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
