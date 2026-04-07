import { Suspense } from "react";
import SearchResultsContent from "@/components/Search/SearchResults";
import { SearchPageSkeleton } from "@/components/shared/RouteSkeletons";

export const metadata = {
  title: "Search Products | Find What You Need | Asian Import Export",
  description:
    "Search our extensive product catalog. Find agriculture, seafood, metals, vehicles, and wood products from Asian Import Export. Fast shipping, wholesale prices.",
  keywords: [
    "search products",
    "find products",
    "product search",
    "bulk products",
    "import export search",
    "wholesale search",
  ],
  openGraph: {
    title: "Search Products - Asian Import Export Co LTD",
    description: "Search our complete product catalog with advanced filters.",
    url: "https://asianimportexport.com/search",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Search Products - Asian Import Export",
    description: "Find products in our catalog",
  },
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResultsContent />
    </Suspense>
  );
}
