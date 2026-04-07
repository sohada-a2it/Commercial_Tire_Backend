"use client";

import { Suspense } from "react";
import SearchResultsContent from "@/components/Search/SearchResults";
import { SearchPageSkeleton } from "@/components/shared/RouteSkeletons";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResultsContent />
    </Suspense>
  );
}
