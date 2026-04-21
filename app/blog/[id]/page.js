// app/blog/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Tag, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Volume2, 
  Download, 
  FileText, 
  ArrowLeft,
  ArrowUp,
  Printer,
  Copy,
  CheckCircle,
  AlertCircle,
  Play,
  Headphones,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Send,
  UserCheck,
  ThumbsUp,
  MoreHorizontal,
  X,
  Sparkles,
  Quote,
  Grid3x3,
  List
} from "lucide-react";
import { 
  fetchBlogById, 
  formatBlogForDisplay, 
  getCoverImageUrl, 
  getVideoEmbedHtml, 
  getAudioPlayerHtml, 
  formatFileSize,
  addBlogComment,
  fetchBlogComments
} from "@/services/blogService";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";

// Loading Skeleton
const BlogSkeleton = () => (
  <div className="animate-pulse">
    <div className="relative h-[50vh] md:h-[60vh] bg-gradient-to-r from-gray-200 to-gray-300">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-32 bg-gray-300 rounded-full mb-4" />
          <div className="h-10 md:h-14 w-3/4 bg-gray-300 rounded-lg mb-4" />
          <div className="flex flex-wrap gap-4 md:gap-6">
            <div className="h-4 w-28 bg-gray-300 rounded" />
            <div className="h-4 w-28 bg-gray-300 rounded" />
            <div className="h-4 w-28 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-11/12" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-64 bg-gray-200 rounded my-8" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-10/12" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-9/12" />
      </div>
    </div>
  </div>
);

// Table of Contents Component
const TableOfContents = ({ headings }) => {
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden lg:block fixed right-8 top-32 w-72 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
      >
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <List className="w-4 h-4 text-teal-600" />
          Table of Contents
        </h3>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="p-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <nav className="space-y-1">
            {headings.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className={`block px-3 py-2 text-sm rounded-lg transition-all ${
                  activeId === heading.id
                    ? "bg-teal-50 text-teal-700 font-medium border-l-2 border-teal-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                style={{ paddingLeft: `${heading.level * 16}px` }}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

// Share Modal Component
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Share this article</h3>
          <p className="text-gray-600 text-sm mb-6">Spread the knowledge with your network</p>
          
          <div className="flex justify-center gap-4 mb-6">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877f2] text-white hover:scale-110 transition-transform"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1da1f2] text-white hover:scale-110 transition-transform"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a66c2] text-white hover:scale-110 transition-transform"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50"
            />
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comments Component
const CommentsSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: ""
  });

  const loadComments = async (pageNum = 1) => {
    setLoading(true);
    try {
      const result = await fetchBlogComments(blogId, { page: pageNum, limit: 10 });
      if (result.success) {
        if (pageNum === 1) {
          setComments(result.comments);
        } else {
          setComments(prev => [...prev, ...result.comments]);
        }
        setHasMore(result.pagination?.hasNextPage || false);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const result = await addBlogComment(blogId, {
        name: formData.name,
        email: formData.email,
        comment: formData.comment
      });
      
      if (result.success) {
        toast.success("Comment posted successfully!");
        setFormData({ name: "", email: "", comment: "" });
        await loadComments(1);
      }
    } catch (error) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      loadComments(1);
    }
  }, [blogId]);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-teal-600" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-2xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Leave a comment</h4>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Your name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
              required
            />
            <input
              type="email"
              placeholder="Your email (optional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>
          <textarea
            placeholder="Your comment *"
            rows={4}
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loading && page === 1 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <>
            {comments.map((comment, index) => (
              <div key={index} className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {comment.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{comment.name}</span>
                      {comment.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.comment}</p>
                    <button className="mt-2 text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Like
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadComments(nextPage);
                }}
                disabled={loading}
                className="w-full py-3 text-center text-teal-600 hover:text-teal-700 font-medium"
              >
                {loading ? "Loading..." : "Load more comments"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Main Blog Details Component
export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  // Extract headings from content
  const extractHeadings = useCallback((htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3, h4');
    const extractedHeadings = [];
    
    headingElements.forEach((heading) => {
      const text = heading.textContent;
      const level = parseInt(heading.tagName[1]);
      const id = heading.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      if (!heading.id) {
        heading.id = id;
      }
      
      extractedHeadings.push({ text, level, id });
    });
    
    setHeadings(extractedHeadings);
  }, []);

  // Load blog data
  useEffect(() => {
    const loadBlog = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const result = await fetchBlogById(id);
        if (result.success && result.blog) {
          const formattedBlog = formatBlogForDisplay(result.blog);
          setBlog(formattedBlog);
          
          if (formattedBlog.content) {
            extractHeadings(formattedBlog.content);
          }
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
  }, [id, router, extractHeadings]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <BlogSkeleton />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">The blog you're looking for doesn't exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white hover:bg-teal-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const sanitizedContent = DOMPurify.sanitize(blog.content || '');

  return (
    <>
      <article className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-[50vh] md:h-[65vh] bg-gradient-to-r from-gray-900 to-gray-800">
            {blog.coverImage?.url ? (
              <>
                <img
                  src={getCoverImageUrl(blog, { width: 1920, height: 1080, crop: 'fill' })}
                  alt={blog.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-blue-900" />
            )}
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-5xl mx-auto px-4 md:px-6 w-full pb-12 md:pb-16">
                {/* Category Badge */}
                <Link
                  href={`/blog?category=${encodeURIComponent(blog.category)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white hover:bg-white/30 transition-colors mb-4"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {blog.category}
                </Link>
                
                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {blog.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 md:gap-6 text-white/90 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{blog.author || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {blog.publishedAt 
                        ? new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : new Date(blog.createdAt).toLocaleDateString()
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readTime || 5} min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{blog.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Actions */}
            <div className="lg:w-16 flex lg:flex-col justify-center gap-4 lg:sticky lg:top-32 lg:self-start">
              <button
                onClick={() => setLiked(!liked)}
                className="flex lg:flex-col items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group"
              >
                <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-500 group-hover:text-red-500'}`} />
                <span className="text-xs">{liked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button
                onClick={() => setSaved(!saved)}
                className="flex lg:flex-col items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors group"
              >
                <Bookmark className={`w-6 h-6 ${saved ? 'fill-yellow-500 text-yellow-500' : 'group-hover:fill-yellow-500 group-hover:text-yellow-500'}`} />
                <span className="text-xs">{saved ? 'Saved' : 'Save'}</span>
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="flex lg:flex-col items-center gap-2 text-gray-500 hover:text-teal-500 transition-colors"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-xs">Share</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex lg:flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Printer className="w-6 h-6" />
                <span className="text-xs">Print</span>
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Excerpt */}
              {blog.excerpt && (
                <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl border-l-4 border-teal-500">
                  <p className="text-lg text-gray-700 italic leading-relaxed">
                    "{blog.excerpt}"
                  </p>
                </div>
              )}

              {/* Audio Player */}
              {blog.audioUrl && (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Headphones className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-gray-900">Audio Version</span>
                    {blog.audioTitle && <span className="text-sm text-gray-600">- {blog.audioTitle}</span>}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: getAudioPlayerHtml(blog) }} />
                </div>
              )}

              {/* Video Embed */}
              {(blog.videoUrl || blog.videoEmbedCode) && (
                <div className="mb-8">
                  <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-lg">
                    <div
                      className="absolute top-0 left-0 w-full h-full"
                      dangerouslySetInnerHTML={{ 
                        __html: getVideoEmbedHtml(blog, { width: '100%', height: '100%' })
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Gallery Images */}
              {blog.galleryImages && blog.galleryImages.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Grid3x3 className="w-5 h-5 text-teal-600" />
                    Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {blog.galleryImages.slice(0, 6).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(image.url, '_blank')}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div 
                className="prose prose-lg prose-teal max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-2xl prose-img:shadow-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50 prose-blockquote:p-4 prose-blockquote:rounded-r-xl
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:text-gray-700
                  prose-table:border-collapse prose-table:w-full
                  prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2
                  prose-td:border prose-td:border-gray-300 prose-td:p-2
                "
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Related Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {blog.attachments && blog.attachments.length > 0 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({blog.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {blog.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.fileUrl}
                        download
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-teal-600" />
                          <div>
                            <p className="font-medium text-gray-900">{attachment.fileName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <CommentsSection blogId={blog.id} />
            </div>
          </div>
        </div>
      </article>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full bg-teal-600 p-3 text-white shadow-lg hover:bg-teal-700 transition-all hover:scale-110"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          url={shareUrl}
          title={blog.title}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Table of Contents */}
      <TableOfContents headings={headings} />
    </>
  );
}