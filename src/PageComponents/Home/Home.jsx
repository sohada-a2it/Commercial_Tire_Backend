import React from "react";
import dynamic from "next/dynamic";
import Banner from "../../components/Home/Banner";
import ProductCatalog from "../../components/DynamicProductCatalog/ProductCatalog";

// Lazy load below-the-fold components
const CompanyStats = dynamic(() => import("../../components/Home/CompanyStats"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />
});
const OfferBanner = dynamic(() => import("../../components/Home/OfferBanner"), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse" />
});
const ServicesSection = dynamic(() => import("../../components/Home/ServicesSection"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});
const WhyChooseUs = dynamic(() => import("../../components/Home/WhyChooseUs"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});

const Home = () => {
  return (
    <>
      <Banner />
      <ProductCatalog isHomePage={true} />
      <OfferBanner />
      <ServicesSection />
      <WhyChooseUs />
    </>
  );
};

export default Home;
