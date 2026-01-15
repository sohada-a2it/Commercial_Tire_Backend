import React from "react";
import Banner from "../../components/Home/Banner";
import ProductCatalog from "../../components/DynamicProductCatalog/ProductCatalog";
import CompanyStats from "../../components/Home/CompanyStats";
import OfferBanner from "../../components/Home/OfferBanner";
import ServicesSection from "../../components/Home/ServicesSection";
import WhyChooseUs from "../../components/Home/WhyChooseUs";

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
