import React from 'react';
import HeroSection from '@/components/HeroSection';
import UBSGrid from '@/components/UBSGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <UBSGrid />
      <Footer />
    </div>
  );
};

export default Index;
