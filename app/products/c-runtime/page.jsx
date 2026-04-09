import SubcategoryPageClient from "../c/[category]/[subcategory]/SubcategoryPageClient";

export const metadata = {
  title: "Products | Asian Import Export",
  description: "Browse products from our live catalog.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProductsRuntimePage() {
  return <SubcategoryPageClient />;
}