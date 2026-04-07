import { Suspense } from "react";
import ProductCatalog from "@/components/DynamicProductCatalog/ProductCatalog";
import Banner from "@/components/Home/Banner";
import ServicesSection from "@/components/Home/ServicesSection";
import WhyChooseUs from "@/components/Home/WhyChooseUs";
import { generateFAQSchema } from "@/lib/structuredData";
import OfferBanner from "@/components/Home/OfferBanner";
import { CatalogPageSkeleton } from "@/components/shared/RouteSkeletons";

export const metadata = {
  title: "Asian Import Export Co LTD - Global Trade Partner",
  description:
    "Asian Import Export Co LTD offers comprehensive international trade services including agriculture, seafood, metals, trucks, vehicles, and wood products. Specializing in vehicle parts, truck tires, copper, aluminum, rice, sugar, nuts, and more.",
  keywords: [
    "import export company",
    "international trade",
    "truck tires wholesale",
    "copper scrap",
    "aluminum metal",
    "rice exporter",
    "sugar supplier",
    "cashew nuts",
    "wood pellets",
    "vehicle parts",
    "golf cart",
    "Asian Import Export",
    "global trade solutions",
    "B2B wholesale",
    "bulk orders",
  ],
  openGraph: {
    title: "Asian Import Export Co LTD - Your Global Trade Partner",
    description:
      "Comprehensive international trade services for agriculture, seafood, metals, trucks, vehicles, and wood products.",
    url: "https://asianimportexport.com",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Asian Import Export Co LTD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asian Import Export Co LTD - Global Trade Partner",
    description:
      "Comprehensive international trade services for all your business needs",
  },
  alternates: {
    canonical: "/",
  },
};

// FAQ data for structured data
const faqData = [
  {
    question: "What products do you offer?",
    answer:
      "We offer a wide range of products including truck tires from major brands (Double Coin, Firestone, Goodyear, Michelin, Roadlux), frozen seafood (eel, crab, shrimp, tilapia), metals (copper scrap, cathode copper, aluminum), dry food products (rice, sugar, nuts), agriculture products (potatoes, onions), vehicle parts (golf carts, rims, electric bikes), and wood products (wood pellets).",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we provide international shipping services to over 50 countries worldwide. Shipping costs and delivery times vary based on destination and order quantity. Contact us for specific shipping quotes.",
  },
  {
    question: "What is your minimum order quantity?",
    answer:
      "Minimum order quantities (MOQ) vary by product category. For truck tires, the MOQ is typically 50 units. For other products, please check individual product pages or contact our sales team for specific MOQ information.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We offer flexible payment terms including T/T (Telegraphic Transfer), L/C (Letter of Credit), and other arrangements for qualified buyers. Payment terms can be negotiated based on order size and business relationship.",
  },
  {
    question: "How can I request a quote?",
    answer:
      "You can request a quote by contacting us through our website contact form, email (info@asianimportexport.com), or WhatsApp (+1-437-900-3996). Please provide product details, quantities, and shipping destination for an accurate quote.",
  },
];

export default function Home() {
  const faqSchema = generateFAQSchema(faqData);

  return (
    <>
      {/* FAQ Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Banner />
      <Suspense
        fallback={<CatalogPageSkeleton />}
      >
        <ProductCatalog isHomePage={true} />
      </Suspense>
      <OfferBanner/>
      <ServicesSection />
      <WhyChooseUs />
    </>
  );
}
