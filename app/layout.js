import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import FloatingWhatsApp from "@/components/shared/FloatingWhatsApp";
import FloatingCartButton from "@/components/Cart/FloatingCartButton";
import CartSidebar from "@/components/Cart/CartSidebar";
import { CartProvider } from "@/context/CartContext";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import "./globals.css";
import ScrollToTop from "@/components/shared/ScrollToTop";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/structuredData";

export const metadata = {
  title: {
    default: "Asian Import Export Co LTD - Global Trade Solutions",
    template: "%s | Asian Import Export Co LTD",
  },
  description:
    "Leading import-export company specializing in agriculture, seafood, metals, trucks, vehicles, and wood products. Your trusted partner for international trade.",
  keywords: [
    "import export",
    "international trade",
    "agriculture products",
    "seafood export",
    "metal trading",
    "truck tires",
    "vehicle export",
    "wood products",
    "global trade",
    "Asian Import Export",
    "B2B wholesale",
    "bulk orders",
    "wholesale supplier",
  ],
  authors: [{ name: "Asian Import Export Co LTD" }],
  creator: "Asian Import Export Co LTD",
  publisher: "Asian Import Export Co LTD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://asianimportexport.com"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Asian Import Export Co LTD - Global Trade Solutions",
    description:
      "Leading import-export company specializing in agriculture, seafood, metals, trucks, vehicles, and wood products.",
    url: "https://asianimportexport.com",
    siteName: "Asian Import Export Co LTD",
    images: [
      {
        url: "/og-image.jpg", // Add your OG image
        width: 1200,
        height: 630,
        alt: "Asian Import Export Co LTD",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asian Import Export Co LTD - Global Trade Solutions",
    description:
      "Leading import-export company specializing in agriculture, seafood, metals, trucks, vehicles, and wood products.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification
    // yandex: 'your-yandex-verification',
    // bing: 'your-bing-verification',
  },
};

export default function RootLayout({ children }) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        
        {/* Preload critical assets */}
        <link 
          rel="preload" 
          href="/assets/banner-bg.webp" 
          as="image"
          type="image/webp"
        />
        <link 
          rel="preload" 
          href="/1.webp" 
          as="image"
          type="image/webp"
        />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Microsoft Clarity */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "ta1fgz6ov8");
            `,
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <CartProvider>
            <ScrollToTop />
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar />
            <Suspense
              fallback={
                <div className="flex justify-center items-center min-h-screen">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              }
            >
              <main>{children}</main>
            </Suspense>
            <Footer />
            <FloatingWhatsApp
              phoneNumber="14379003996"
              message="Hello! How can I help you?"
            />
            <FloatingCartButton />
            <CartSidebar />
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
