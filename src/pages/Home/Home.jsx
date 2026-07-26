import React from 'react';
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import Hero from '../../components/Hero/Hero';
import Categories from '../../components/Categories/Categories';
import BestSellers from '../../components/BestSellers/BestSellers';
import Collections from '../../components/Collections/Collections';
import PromoBanner from '../../components/PromoBanner/PromoBanner';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import Testimonials from '../../components/Testimonials/Testimonials';
import Newsletter from '../../components/Newsletter/Newsletter';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';

const Home = () => {
  const jsonLdSchemas = [
    seoService.getWebsiteSchema(),
    seoService.getOrganizationSchema()
  ];

  return (
    <>
      <SEO
        title="Option One Store | Premium Watches, Fashion, Electronics & Luxury Accessories"
        description="Shop premium watches, fine jewelry, designer bags, acoustic audio, and luxury lifestyle products with worldwide shipping from Option One Store."
        canonical="https://optiononestore.com/"
        jsonLd={jsonLdSchemas}
      />
      <Hero />
      <ScrollReveal><Categories /></ScrollReveal>
      <ScrollReveal><BestSellers /></ScrollReveal>
      <ScrollReveal><Collections /></ScrollReveal>
      <ScrollReveal><PromoBanner /></ScrollReveal>
      <ScrollReveal><WhyChooseUs /></ScrollReveal>
      <ScrollReveal><Testimonials /></ScrollReveal>
      <ScrollReveal><Newsletter /></ScrollReveal>
    </>
  );
};

export default Home;