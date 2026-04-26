// app/blog/page.js
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BlogsClient from "./blogClient";
import BlogDetailsContent from "./blogDetailsContent";

function BlogsPageContent() {
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');
  
  // যদি URL এ id থাকে → ব্লগ ডিটেইলস দেখাও
  if (blogId) {
    return <BlogDetailsContent />;
  }
  
  // নাহলে ব্লগ লিস্টিং পেজ দেখাও
  return <BlogsClient />;
}

export default function BlogsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BlogsPageContent />
    </Suspense>
  );
}