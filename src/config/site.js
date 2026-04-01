// Site-wide configuration
export const config = {
  // Contact Information
  contact: {
    whatsapp: "14379003996", // Format: country code + number (no spaces or special chars)
    phone: "+1 (437) 900-3996",
    email: "info@asianimportexport.com",
  },

  // Cart Settings
  cart: {
    minimumTyreQuantity: 50, // Minimum tyres required for truck category
    allowMixedCategories: false, // Whether to allow checkout with mixed categories
  },

  // Order Settings
  order: {
    currency: "USD",
    taxRate: 0, // Set to 0 if no tax, or percentage like 0.08 for 8%
    shippingCost: 0, // Set default shipping cost, or 0 for calculated
  },

  // Email Settings
  // email: {
  //   backendUrl:
  //     process.env.NEXT_PUBLIC_BACKEND_URL ||
  //     "https://asian-import-export-co-backend.vercel.app",
  // },
  email: {
    backendUrl:"http://localhost:5000"
  },

  // Site Information
  site: {
    name: "Asian Import Export Co LTD",
    tagline: "Global Trade Solutions",
    url: "https://asianimportexport.com",
  },
};

export default config;
