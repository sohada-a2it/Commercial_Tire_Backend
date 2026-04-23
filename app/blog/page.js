'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  Clock, 
  Filter, 
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  ArrowRight,
  Folder,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { fetchBlogs, formatBlogForDisplay } from '@/services/blogService';
import toast from 'react-hot-toast';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [regularBlogs, setRegularBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllRegular, setShowAllRegular] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredPerView, setFeaturedPerView] = useState(3);
  const sliderRef = useRef(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
    limit: 12
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Update featured per view based on screen size
  useEffect(() => {
    const updatePerView = () => {
      const width = window.innerWidth;
      if (featuredBlogs.length === 1) {
        setFeaturedPerView(1);
      } else if (featuredBlogs.length === 2) {
        setFeaturedPerView(2);
      } else {
        if (width < 640) setFeaturedPerView(1);
        else if (width < 1024) setFeaturedPerView(2);
        else setFeaturedPerView(3);
      }
    };
    
    updatePerView();
    window.addEventListener('resize', updatePerView);
    return () => window.removeEventListener('resize', updatePerView);
  }, [featuredBlogs.length]);

  // Load blogs on mount and filter change
  useEffect(() => {
    loadBlogs();
  }, [filters]);

  // Extract unique categories from blogs
  useEffect(() => {
    if (blogs.length > 0) {
      const uniqueCategories = [...new Set(blogs.map(blog => blog.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [blogs]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const result = await fetchBlogs({
        ...filters,
        isPublished: 'true',
        status: 'published'
      });
      
      const formattedBlogs = (result.blogs || []).map(formatBlogForDisplay);
      setBlogs(formattedBlogs);
      
      // Separate featured and regular blogs
      const featured = formattedBlogs.filter(blog => blog.isFeatured).sort((a, b) => (b.featuredPriority || 0) - (a.featuredPriority || 0));
      const regular = formattedBlogs.filter(blog => !blog.isFeatured);
      
      setFeaturedBlogs(featured);
      setRegularBlogs(regular);
      setCurrentSlide(0);
      
      setPagination(result.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 1,
        hasNextPage: result.pagination?.hasNextPage || false,
        hasPrevPage: result.pagination?.hasPrevPage || false
      });
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleCategoryFilter = (category) => {
    setFilters({ ...filters, category: category === filters.category ? '' : category, page: 1 });
    setShowAllRegular(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', page: 1, limit: 12 });
    setShowAllRegular(false);
  };

  const handleShowMore = () => {
    setShowAllRegular(true);
  };

  const handleShowLess = () => {
    setShowAllRegular(false);
    window.scrollTo({ top: document.getElementById('regular-section')?.offsetTop - 100, behavior: 'smooth' });
  };

  // Slider navigation
  const nextSlide = () => {
    const maxSlide = Math.ceil(featuredBlogs.length / featuredPerView) - 1;
    if (currentSlide < maxSlide) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Recent';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  // Get reading time display
  const getReadTimeDisplay = (minutes) => {
    if (!minutes) return '5 min read';
    return `${minutes} min read`;
  };

  // Compact Blog Card Component - ✅ ID ব্যবহার করে লিংক
  const BlogCard = ({ blog, isFeatured = false, isFullWidth = false }) => {
    const [imageError, setImageError] = useState(false);
    
    if (isFullWidth) {
      // Full width featured blog layout
      return (
        <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <Link href={`/blog/${blog._id || blog.id}`} className="md:w-2/5 overflow-hidden">
              <div className="relative h-64 md:h-full bg-gradient-to-br from-gray-100 to-gray-200">
                {blog.coverImage?.url && !imageError ? (
                  <img
                    src={blog.coverImage.url}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {blog.isFeatured && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </div>
                )}
              </div>
            </Link>
            
            {/* Content */}
            <div className="md:w-3/5 p-6 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                {blog.category && (
                  <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                    {blog.category}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(blog.customDate || blog.publishedAt || blog.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getReadTimeDisplay(blog.readTime)}</span>
                </div>
              </div>
              
              <Link href={`/blog/${blog._id || blog.id}`}>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
                  {blog.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {blog.excerpt || (blog.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...')}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                    {(blog.author || 'A')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{blog.author || 'Admin'}</span>
                </div>
                <Link 
                  href={`/blog/${blog._id || blog.id}`}
                  className="text-amber-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      );
    }
    
    // Compact card layout for regular and slider featured - ✅ ID ব্যবহার করে লিংক
    return (
      <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Image */}
        <Link href={`/blog/${blog._id || blog.id}`} className="block overflow-hidden">
          <div className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ${isFeatured ? 'h-48' : 'h-40'}`}>
            {blog.coverImage?.url && !imageError ? (
              <img
                src={blog.coverImage.url}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {blog.isFeatured && !isFeatured && (
              <div className="absolute top-2 left-2 bg-amber-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-current" /> Featured
              </div>
            )}
          </div>
        </Link>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
            {blog.category && (
              <span className="text-amber-600 font-medium">{blog.category}</span>
            )}
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(blog.customDate || blog.publishedAt || blog.createdAt)}</span>
            </div>
          </div>
          
          {/* Title */}
          <Link href={`/blog/${blog._id || blog.id}`}>
            <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors ${isFeatured ? 'text-base' : 'text-sm'}`}>
              {blog.title}
            </h3>
          </Link>
          
          {/* Excerpt - only for featured cards */}
          {isFeatured && (
            <p className="text-gray-500 text-xs line-clamp-2 mb-3">
              {blog.excerpt?.slice(0, 80) || (blog.content?.replace(/<[^>]*>/g, '').slice(0, 80) + '...')}
            </p>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                {(blog.author || 'A')[0].toUpperCase()}
              </div>
              <span className="text-xs text-gray-600 truncate max-w-[80px]">{blog.author || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-0.5">
                <Eye className="w-3 h-3" />
                <span>{blog.views || 0}</span>
              </div>
              <Link 
                href={`/blog/${blog._id || blog.id}`}
                className="text-amber-600 hover:text-amber-700"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  };

  // Skeleton
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-4">
        <div className="flex gap-2 mb-2">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-3 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="flex items-center justify-between pt-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const visibleRegular = showAllRegular ? regularBlogs : regularBlogs.slice(0, 12);
  const totalSlides = Math.ceil(featuredBlogs.length / featuredPerView);
  const showSliderControls = featuredBlogs.length > featuredPerView;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-600 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Insights & Updates
          </h1>
          <p className="text-base md:text-lg text-amber-100 max-w-2xl mx-auto">
            Explore our latest articles, industry insights, and company news
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                showFilters || filters.category
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {filters.category && (
                <span className="ml-0.5 px-1.5 py-0.5 bg-amber-100 rounded-full text-xs">
                  1
                </span>
              )}
            </button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  Categories
                </h3>
                {filters.category && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                      filters.category === cat
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {categories.length === 0 && !loading && (
                  <p className="text-xs text-gray-400">No categories</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Featured Blogs Section */}
        {!loading && featuredBlogs.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Featured
                </h2>
              </div>
              
              {showSliderControls && (
                <div className="flex gap-1">
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide >= totalSlides - 1}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Featured Content */}
            {featuredBlogs.length === 1 ? (
              <BlogCard blog={featuredBlogs[0]} isFeatured={true} isFullWidth={true} />
            ) : (
              <div className="relative overflow-hidden">
                <div 
                  ref={sliderRef}
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * (100 / featuredPerView)}%)` }}
                >
                  {featuredBlogs.map((blog, index) => (
                    <div 
                      key={blog.id} 
                      className="flex-shrink-0 px-2"
                      style={{ width: `${100 / featuredPerView}%` }}
                    >
                      <BlogCard blog={blog} isFeatured={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Slider Dots */}
            {showSliderControls && (
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentSlide === idx ? 'w-5 bg-amber-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Blogs Section */}
        <div id="regular-section">
          {!loading && regularBlogs.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {featuredBlogs.length > 0 ? 'More Articles' : 'All Articles'}
              </h2>
            </div>
          )}

          {/* Results Info */}
          {!loading && regularBlogs.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                {visibleRegular.length} of {regularBlogs.length} articles
              </p>
              {(filters.search || filters.category) && (
                <p className="text-xs text-gray-500">
                  Filtered by: <span className="font-medium text-gray-700">"{filters.search || filters.category}"</span>
                </p>
              )}
            </div>
          )}

          {/* Blog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : regularBlogs.length === 0 && featuredBlogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No articles found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {filters.search || filters.category ? "Try adjusting your search" : "Check back later"}
              </p>
              {(filters.search || filters.category) && (
                <button onClick={clearFilters} className="text-sm text-amber-600 hover:text-amber-700">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleRegular.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
              
              {/* Show More / Show Less */}
              {regularBlogs.length > 12 && (
                <div className="text-center mt-8">
                  {!showAllRegular ? (
                    <button
                      onClick={handleShowMore}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm hover:bg-amber-700 transition-all shadow-sm"
                    >
                      Load More
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleShowLess}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition-all"
                    >
                      Show Less
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}