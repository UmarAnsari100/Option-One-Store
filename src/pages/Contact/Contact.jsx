import React, { useState, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const { showToast } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) tempErrors.name = 'Your name is required';
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      tempErrors.email = 'Valid email is required';
    }
    if (!formData.subject.trim()) tempErrors.subject = 'Subject is required';
    if (!formData.message.trim()) tempErrors.message = 'Message cannot be blank';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSuccess(true);
      showToast('Message sent! Our concierge will contact you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000); // fade out success card
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* Header */}
      <div className="contact-header">
        <div className="container">
          <span className="contact-subtitle">GET IN TOUCH</span>
          <h1 className="contact-title">Contact Concierge</h1>
        </div>
      </div>

      <div className="container section-padding">
        <div className="contact-layout-grid">
          {/* Form Col */}
          <div className="contact-form-card">
            <h2>Send Us A Message</h2>
            <p className="card-desc">
              Have questions about sizing, customization, or shipping? Complete the form below, and our specialized concierge team will respond within 24 hours.
            </p>

            {isSuccess && (
              <div className="contact-success-alert animate-fade">
                <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Thank you! Your inquiry has been sent successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form-element">
              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Enter your name"
                  />
                  {errors.name && <span className="contact-error-txt">{errors.name}</span>}
                </div>

                <div className="contact-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email"
                  />
                  {errors.email && <span className="contact-error-txt">{errors.email}</span>}
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={errors.subject ? 'error' : ''}
                  placeholder="How can we help?"
                />
                {errors.subject && <span className="contact-error-txt">{errors.subject}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={errors.message ? 'error' : ''}
                  placeholder="Type your message here..."
                ></textarea>
                {errors.message && <span className="contact-error-txt">{errors.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary contact-submit-btn">
                <Send size={16} style={{ marginRight: '8px' }} />
                Send Inquiry
              </button>
            </form>
          </div>

          {/* Details Sidebar Col */}
          <div className="contact-details-column">
            {/* Info Cards */}
            <div className="info-cards-stack">
              <div className="info-detail-card">
                <MapPin size={24} className="detail-icon" />
                <div className="detail-text">
                  <h4>Flagship Boutique</h4>
                  <p>100 Elite Plaza, Fifth Avenue</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>

              <div className="info-detail-card">
                <Phone size={24} className="detail-icon" />
                <div className="detail-text">
                  <h4>Call & WhatsApp</h4>
                  <p>WhatsApp: <a href="https://wa.me/923300073073" target="_blank" rel="noopener noreferrer">03300073073</a></p>
                  <p>Toll Free: +1 (800) 555-0199</p>
                </div>
              </div>

              <div className="info-detail-card">
                <Mail size={24} className="detail-icon" />
                <div className="detail-text">
                  <h4>Email Enquiries</h4>
                  <p><a href="mailto:concierge@optiononestore.com">concierge@optiononestore.com</a></p>
                  <p><a href="mailto:support@optiononestore.com">support@optiononestore.com</a></p>
                </div>
              </div>

              <div className="info-detail-card">
                <Clock size={24} className="detail-icon" />
                <div className="detail-text">
                  <h4>Boutique Hours</h4>
                  <p>Mon - Sat: 10:00 AM - 8:00 PM</p>
                  <p>Sunday: 12:00 PM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Map Mock container */}
            <div className="map-mock-container">
              <div className="map-overlay">
                <span>Manhattan Flagship Map</span>
              </div>
              <div className="map-graphic"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;