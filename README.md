# Asian Import Export Co LTD - Next.js Website

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![SEO Optimized](https://img.shields.io/badge/SEO-Optimized-green)](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

Professional import-export company website built with Next.js 15, featuring full SEO optimization, automatic product indexing, and modern e-commerce capabilities.

## 🌟 Features

- ✅ **Full SEO Optimization** - Every page and product indexed for search engines
- ✅ **Server-Side Rendering** - Fast loading and crawler-friendly
- ✅ **Dynamic Sitemap** - Auto-generated from product catalog
- ✅ **Meta Tags** - Optimized titles, descriptions, and social sharing
- ✅ **Product Catalog** - Dynamic product pages with SEO metadata
- ✅ **Mobile Responsive** - Beautiful design on all devices
- ✅ **Fast Performance** - Next.js automatic optimizations
- ✅ **Open Graph** - Rich social media previews

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.jsx         # Root layout with SEO
│   ├── page.jsx           # Home page
│   ├── aboutUs/           # About page
│   ├── contact/           # Contact page
│   ├── products/          # Products catalog
│   ├── product/[id]/      # Dynamic product pages
│   ├── sitemap.js         # Auto-generated sitemap
│   └── robots.js          # Search engine rules
├── src/
│   ├── components/        # React components
│   ├── Pages/             # Page content components
│   └── lib/               # Utilities
├── public/                # Static assets
│   ├── categories.json    # Product data
│   └── assets/            # Images
└── next.config.mjs        # Next.js configuration
```

## 🎯 SEO Features

### Automatic Product Indexing
Every product in `public/categories.json` is automatically:
- Added to the sitemap
- Given unique SEO metadata
- Optimized for search engines
- Configured for social sharing

### Page-Specific Optimization
Each page includes:
- Unique meta titles and descriptions
- Open Graph tags for social media
- Twitter Card metadata
- Canonical URLs
- Keyword optimization

### Technical SEO
- Server-side rendering (SSR)
- Automatic sitemap generation
- Robots.txt configuration
- Semantic HTML structure
- Fast Core Web Vitals

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **Icons**: React Icons, Lucide React
- **Forms**: EmailJS
- **Notifications**: React Hot Toast

## 🛠️ Configuration

### Update Domain

Replace `https://asianimportexport.com` with your domain in:
- `app/layout.jsx`
- `app/sitemap.js`
- `app/robots.js`

### Google Search Console

Add verification code in `app/layout.jsx`:
```javascript
verification: {
  google: "your-verification-code",
},
```

### Product Data

Update products in `public/categories.json`. The sitemap automatically includes all products.

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Other Platforms

Build the project and deploy the `.next` folder:
```bash
npm run build
```

## 📊 Submit to Search Engines

After deployment:

1. **Google Search Console**
   - Submit sitemap: `https://yourdomain.com/sitemap.xml`
   
2. **Bing Webmaster Tools**
   - Add and verify your site
   - Submit sitemap

## 📝 Migration from Vite

This project was migrated from React + Vite to Next.js. See:
- `MIGRATION_GUIDE.md` - Complete migration details
- `QUICKSTART.md` - Quick setup instructions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary to Asian Import Export Co LTD.

## 📞 Contact

**Asian Import Export Co LTD., LTD**
- Phone: +1 (437) 900-3996
- Website: [Your Domain]
- Alibaba: Trusted Supplier

---


Built with ❤️ using Next.js for optimal SEO and performance

<!-- NEXT_PUBLIC_SITE_URL=https://asianimportexport.com -->



# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=https://asian-expo-impo-backend.vercel.app

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://asianimportexport.com

# Optional: EmailJS Configuration (if using EmailJS as backup)
# NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
# NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
# NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
# here in the dashboard/inquiries/ there no need the  