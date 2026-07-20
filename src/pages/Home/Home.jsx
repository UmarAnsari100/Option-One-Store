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
  return (
    <>
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