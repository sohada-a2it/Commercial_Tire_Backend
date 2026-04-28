// app/blog/BlogDetailsContent.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, User, Clock, Eye, Tag, Share2, Facebook, Twitter,
  Linkedin, Check, ChevronLeft, Heart, MessageCircle,
  Download, FileText, ArrowLeft, ArrowUp, Printer, Copy,
  CheckCircle, AlertCircle, Headphones, Paperclip, ChevronDown,
  ChevronUp, Send, ThumbsUp, X, Quote, Grid3x3, MoveRight,Folder 
} from "lucide-react";
import { fetchBlogById, formatBlogForDisplay, getCoverImageUrl, getVideoEmbedHtml, getAudioPlayerHtml, formatFileSize, addBlogComment, fetchBlogComments, fetchBlogCategories } from "@/services/blogService";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";

// Loading Skeleton
const BlogSkeleton = () => (
  <div className="animate-pulse">
    <div className="relative h-[60vh] md:h-[70vh] bg-gradient-to-r from-gray-200 to-gray-300">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-6 w-32 bg-white/30 rounded-full mb-4" />
          <div className="h-12 md:h-16 w-3/4 bg-white/20 rounded-2xl mb-4" />
          <div className="flex flex-wrap gap-6">
            <div className="h-5 w-28 bg-white/20 rounded-full" />
            <div className="h-5 w-28 bg-white/20 rounded-full" />
            <div className="h-5 w-28 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded-full w-full" />
        <div className="h-4 bg-gray-200 rounded-full w-11/12" />
        <div className="h-4 bg-gray-200 rounded-full w-full" />
        <div className="h-64 bg-gray-200 rounded-2xl my-8" />
        <div className="h-4 bg-gray-200 rounded-full w-full" />
        <div className="h-4 bg-gray-200 rounded-full w-10/12" />
        <div className="h-4 bg-gray-200 rounded-full w-full" />
        <div className="h-4 bg-gray-200 rounded-full w-9/12" />
      </div>
    </div>
  </div>
);
 

// Reading Progress Bar
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percent = (scrolled / maxScroll) * 100;
      setProgress(percent);
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  );
};

// Share Modal
const ShareModal = ({ url, title, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Share this article</h3>
            <p className="text-gray-500 text-sm mt-1">Spread the knowledge with your network</p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877f2] text-white hover:scale-110 transition-transform">
              <Facebook className="h-5 w-5" />
            </a>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1da1f2] text-white hover:scale-110 transition-transform">
              <Twitter className="h-5 w-5" />
            </a>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a66c2] text-white hover:scale-110 transition-transform">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          <div className="flex gap-2">
            <input type="text" value={url} readOnly className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-600" />
            <button onClick={copyToClipboard} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-600 px-4 py-2.5 text-sm text-white hover:from-amber-700 hover:to-amber-700 transition-all">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
 

// FAQ Item
const FAQItem = ({ faq, index, isOpen, onToggle }) => {
  return (
    <div className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 bg-white">
      <button onClick={() => onToggle(index)} className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold mt-0.5">{index + 1}</div>
          <h4 className="font-semibold text-gray-900 pr-4">{faq.question}</h4>
        </div>
        <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="pl-9 border-l-2 border-amber-200 ml-3">
            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Blog Details Component
export default function BlogDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const blogId = searchParams.get('id');

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const sanitizeConfig = {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'a', 'img', 'figure', 'figcaption', 'div', 'span', 'section', 'article', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'mark', 'small', 'blockquote', 'cite', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'button', 'details', 'summary', 'iframe', 'video', 'source'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'width', 'height', 'target', 'rel', 'data-*', 'aria-*', 'controls', 'autoplay', 'loop', 'muted', 'allow', 'allowfullscreen'],
    ALLOW_DATA_ATTR: true,
  };

  const extractHeadings = useCallback((htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3, h4');
    const extractedHeadings = [];

    headingElements.forEach((heading) => {
      const text = heading.textContent;
      const level = parseInt(heading.tagName[1]);
      const id = heading.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!heading.id) heading.id = id;
      extractedHeadings.push({ text, level, id });
    });

    setHeadings(extractedHeadings);
  }, []);

  useEffect(() => {
    const loadBlog = async () => {
      if (!blogId) {
        router.push('/blog');
        return;
      }

      setLoading(true);
      try {
        const result = await fetchBlogById(blogId);
        if (result.success && result.blog) {
          const formattedBlog = formatBlogForDisplay(result.blog);
          setBlog(formattedBlog);
          if (formattedBlog.content) extractHeadings(formattedBlog.content);
        } else {
          toast.error("Blog not found");
          router.push("/blog");
        }
      } catch (error) {
        console.error("Failed to load blog:", error);
        toast.error(error.message || "Failed to load blog");
        router.push("/blog");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blogId, router, extractHeadings]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const toggleFaq = (index) => setOpenFaqIndex(openFaqIndex === index ? null : index);
  const getSanitizedContent = () => {
    if (!blog?.content) return '';
    return DOMPurify.sanitize(blog.content, sanitizeConfig);
  };

  if (loading) return <BlogSkeleton />;

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h2>
          <p className="text-gray-500 mb-6">The blog you're looking for doesn't exist.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-600 px-6 py-3 text-white hover:from-amber-700 hover:to-amber-700 transition-all shadow-md">
            <ArrowLeft className="w-4 h-4" /> Browse Articles
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const sanitizedContent = getSanitizedContent();
  const hasFaqs = blog.faqs && blog.faqs.length > 0;

  return (
    <>
      <ReadingProgressBar />

      <article className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="relative h-[65vh] md:h-[75vh] bg-gradient-to-r from-gray-900 to-gray-800">
            {blog.coverImage?.url ? (
              <>
                <img src={getCoverImageUrl(blog, { width: 1920, height: 1080, crop: 'fill' })} alt={blog.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-500" />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-500/10" />

            <div className="absolute inset-0 flex items-end">
              <div className="max-w-5xl mx-auto px-4 md:px-6 w-full pb-12 md:pb-16">
                {/* Hero Section - Category Badge অংশটি replace করুন */}
<Link 
  href={`/blog?category=${encodeURIComponent(blog.categories?.[0] || blog.category || 'uncategorized')}`} 
  className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-white hover:bg-white/30 transition-all mb-5 group"
>
  <Tag className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
  {blog.categories && blog.categories.length > 0 
    ? blog.categories.map(cat => cat.displayName || cat).join(', ')
    : (blog.category || "Uncategorized")}
</Link>
{/* Hero Section এর category উপরে বা নিচে multiple badges দেখাতে চাইলে */}
{blog.categories && blog.categories.length > 1 && (
  <div className="flex flex-wrap gap-2 mb-4">
    {blog.categories.map((cat, idx) => (
      <Link 
        key={idx}
        href={`/blog?category=${encodeURIComponent(typeof cat === 'string' ? cat : cat.name)}`}
        className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white hover:bg-white/30 transition-all"
      >
        <Tag className="w-3 h-3" />
        {typeof cat === 'string' ? cat : (cat.displayName || cat.name)}
      </Link>
    ))}
  </div>
)}

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-tight drop-shadow-2xl">
                  {blog.title}
                </h1>

                <div className="flex flex-wrap gap-5 md:gap-8 text-white/90 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <User className="w-4 h-4" />
                    <span>{blog.author || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readTime || 5} min read</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{(blog.views || 0).toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <div className="lg:w-20 flex lg:flex-col justify-center gap-5 lg:sticky lg:top-32 lg:self-start">
              <button onClick={() => setShowShareModal(true)} className="flex lg:flex-col items-center gap-2 text-gray-400 hover:text-amber-500 transition-all duration-200 group">
                <div className="p-2 rounded-xl transition-all group-hover:bg-amber-50">
                  <Share2 className="w-5 h-5 group-hover:text-amber-500" />
                </div>
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {blog.excerpt && (
                <div className="mb-10 p-6 bg-gradient-to-r from-amber-50 via-amber-50 to-amber-50 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Quote className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <p className="text-lg text-gray-700 italic leading-relaxed">{blog.excerpt}</p>
                  </div>
                </div>
              )}

              {blog.audioUrl && (
                <div className="mb-10 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-500 rounded-xl flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Audio Version</span>
                      {blog.audioTitle && <p className="text-xs text-gray-500">{blog.audioTitle}</p>}
                    </div>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: getAudioPlayerHtml(blog) }} />
                </div>
              )}

              {(blog.videoUrl || blog.videoEmbedCode) && (
                <div className="mb-10">
                  <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-full" dangerouslySetInnerHTML={{ __html: getVideoEmbedHtml(blog, { width: '100%', height: '100%' }) }} />
                  </div>
                </div>
              )}

              {blog.galleryImages && blog.galleryImages.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <Grid3x3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Gallery</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {blog.galleryImages.slice(0, 6).map((image, index) => (
                      <div key={index} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300" onClick={() => window.open(image.url, '_blank')}>
                        <img src={image.url} alt={image.alt || `Gallery ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="blog-content">
                <div className="prose prose-lg prose-amber max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24 prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-2 prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-6 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/50 prose-blockquote:p-5 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-gray-700 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-5 prose-pre:overflow-x-auto prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-1 prose-li:text-gray-700 prose-li:marker:text-amber-500 prose-table:border-collapse prose-table:w-full prose-table:my-6 prose-th:border prose-th:border-gray-200 prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-strong:text-gray-900 prose-strong:font-semibold" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
              </div>

              {hasFaqs && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
                      <p className="text-gray-500 mt-1">Got questions? We've got answers</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {blog.faqs.map((faq, idx) => (<FAQItem key={idx} faq={faq} index={idx} isOpen={openFaqIndex === idx} onToggle={toggleFaq} />))}
                  </div>
                </div>
              )}
{/* Tags এর পরে বা আগে Categories দেখানোর জন্য - এই অংশটি Tags এর উপরে বা নিচে যোগ করুন */}
{blog.categories && blog.categories.length > 0 && (
  <div className="mt-8 pt-6 border-t border-gray-200">
    <div className="flex items-center gap-2 mb-4">
      <Folder className="w-5 h-5 text-amber-500" />
      <h4 className="font-semibold text-gray-900">Categories</h4>
    </div>
    <div className="flex flex-wrap gap-2">
      {blog.categories.map((cat, index) => {
        const categoryName = typeof cat === 'string' ? cat : cat.name;
        const displayName = typeof cat === 'string' ? cat : (cat.displayName || cat.name);
        return (
          <Link 
            key={index}
            href={`/blog?category=${encodeURIComponent(categoryName)}`}
            className="rounded-full bg-gradient-to-r from-amber-50 to-amber-50 px-3.5 py-1.5 text-sm text-amber-700 hover:from-amber-500 hover:to-amber-500 hover:text-white transition-all duration-200 border border-amber-200 hover:border-transparent"
          >
            {displayName}
          </Link>
        );
      })}
    </div>
  </div>
)}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-gray-900">Related Topics</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (<Link key={index} href={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded-full bg-gray-100 px-3.5 py-1.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-500 hover:text-white transition-all duration-200">#{tag}</Link>))}
                  </div>
                </div>
              )}

              {blog.attachments && blog.attachments.length > 0 && (
                <div className="mt-8 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Paperclip className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-gray-900">Attachments ({blog.attachments.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {blog.attachments.map((attachment, index) => (
                      <a key={index} href={attachment.fileUrl} download className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <FileText className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{attachment.fileName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )} 

              <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
  <Link href="/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group">
    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to all articles
  </Link>
  
  {/* একাধিক category থাকলে সবগুলো লিংক দেখাবে */}
  {blog.categories && blog.categories.length > 0 && (
    <div className="flex gap-3">
      {blog.categories.slice(0, 2).map((cat, idx) => {
        const categoryName = typeof cat === 'string' ? cat : cat.name;
        const displayName = typeof cat === 'string' ? cat : (cat.displayName || cat.name);
        return (
          <Link 
            key={idx}
            href={`/blog?category=${encodeURIComponent(categoryName)}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group"
          >
            More in {displayName} <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        );
      })}
    </div>
  )}
  
  {/* Single category থাকলে পুরাতন স্টাইল */}
  {(!blog.categories || blog.categories.length === 0) && blog.category && (
    <Link href={`/blog?category=${encodeURIComponent(blog.category)}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group">
      More in {blog.category} <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  )}
</div>
            </div>
          </div>
        </div>
      </article>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-amber-600 to-amber-600 p-3.5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 group">
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {showShareModal && <ShareModal url={shareUrl} title={blog.title} onClose={() => setShowShareModal(false)} />}
    
    </>
  );
}