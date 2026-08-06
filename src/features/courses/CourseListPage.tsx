import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronLeft, ChevronRight, X, Star, 
  LayoutGrid, List, FileSpreadsheet, RotateCcw, Sparkles, 
  BookOpen, Users, Award, SlidersHorizontal, Check 
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CourseCardSkeleton } from './components/CourseCardSkeleton';
import { CourseCard, CourseData } from './components/CourseCard';
import { CourseReportExportModal } from './components/CourseReportExportModal';
import { useCourseList, CourseListFilters } from './hooks/useCourseList';
import { Course } from '@/shared/types';
import { toast } from 'sonner';

const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];
const RATINGS = [4.5, 4.0, 3.5, 3.0];
const SORTS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'highest-rated', label: 'Đánh giá cao nhất' },
  { value: 'lowest-price', label: 'Giá thấp nhất' },
  { value: 'highest-price', label: 'Giá cao nhất' },
];

export default function CourseListPage() {
  const [filters, setFilters] = useState<CourseListFilters>({
    query: '',
    categories: [],
    levels: [],
    minRating: null,
    priceType: 'all',
    sortBy: 'newest',
    page: 1,
    limit: 12
  });

  const [searchInput, setSearchInput] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { 
    courses, 
    totalItems, 
    totalPages, 
    isLoading, 
    error, 
    categoriesList, 
    refetch 
  } = useCourseList(filters);

  // Toggle Category selection
  const toggleCategory = (catName: string) => {
    setFilters(prev => {
      const isSelected = prev.categories.includes(catName);
      const newCats = isSelected 
        ? prev.categories.filter(c => c !== catName)
        : [...prev.categories, catName];
      return { ...prev, categories: newCats, page: 1 };
    });
  };

  // Toggle Level selection
  const toggleLevel = (lvl: string) => {
    setFilters(prev => {
      const isSelected = prev.levels.includes(lvl);
      const newLvls = isSelected
        ? prev.levels.filter(l => l !== lvl)
        : [...prev.levels, lvl];
      return { ...prev, levels: newLvls, page: 1 };
    });
  };

  const setRating = (rating: number | null) => {
    setFilters(prev => ({ ...prev, minRating: prev.minRating === rating ? null : rating, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      categories: [],
      levels: [],
      minRating: null,
      priceType: 'all',
      sortBy: 'newest',
      page: 1,
      limit: 12
    });
    setSearchInput('');
    toast.info('Đã xóa tất cả bộ lọc');
  };

  // Map Course to CourseData for CourseCard
  const courseDataList: CourseData[] = courses.map(c => ({
    id: c.id,
    title: c.title,
    instructor: c.instructorName,
    thumbnail: c.image,
    duration: '20h 30m',
    difficulty: c.requirements?.[0]?.includes('Nâng cao') ? 'Advanced' : c.requirements?.[0]?.includes('Trung cấp') ? 'Intermediate' : 'Beginner',
    price: c.price,
    salePrice: c.salePrice,
    category: c.category,
    rating: c.rating || 4.8,
    enrolledCount: c.enrolledCount,
    description: c.description,
    slug: c.slug
  }));

  const hasActiveFilters = Boolean(
    filters.query || 
    filters.categories.length > 0 || 
    filters.levels.length > 0 || 
    filters.minRating !== null || 
    filters.priceType !== 'all'
  );

  return (
    <div className="min-h-screen bg-background pb-24 pt-6">
      {/* ------------------------------------------------------------- */}
      {/* HERO HEADER SECTION WITH GRADIENT DECORATION */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border/40 mb-8 py-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> MindHub Catalog
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                Khám phá Khoá học
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Nâng tầm kỹ năng với hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu trong ngành.
              </p>
            </div>

            {/* Quick Metrics Header Card */}
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/70 shadow-sm shrink-0 w-full sm:w-auto justify-around sm:justify-start">
              <div className="flex items-center gap-3 pr-4 border-r border-border/60">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-foreground">{totalItems}</div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Khóa học</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-4 border-r border-border/60">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-foreground">15.4K+</div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Học viên</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-foreground">4.9★</div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box in Hero */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm theo tên khóa học, giảng viên, từ khóa..." 
                className="pl-12 pr-10 h-13 w-full bg-card/90 border-border/80 rounded-2xl shadow-xs text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button 
              onClick={() => setIsReportModalOpen(true)}
              className="h-13 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-md flex items-center gap-2 shrink-0"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Xuất Báo Cáo</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ------------------------------------------------------------- */}
          {/* SIDEBAR FILTER PANEL */}
          {/* ------------------------------------------------------------- */}
          <div className={`lg:w-72 shrink-0 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-2 font-black text-lg text-foreground">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <span>Bộ lọc tìm kiếm</span>
                </div>
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Xóa tất cả
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Danh mục khóa học
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {categoriesList.map(cat => {
                    const isChecked = filters.categories.includes(cat.name);
                    return (
                      <label 
                        key={cat.name} 
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isChecked ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/60 text-muted-foreground'}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input 
                            type="checkbox" 
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4 shrink-0"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat.name)}
                          />
                          <span className="text-xs truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                          {cat.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Level Filter */}
              <div className="pt-4 border-t border-border/60">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Cấp độ bài học
                </h3>
                <div className="space-y-2">
                  {LEVELS.map(lvl => {
                    const isChecked = filters.levels.includes(lvl);
                    return (
                      <label 
                        key={lvl} 
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${isChecked ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/60 text-muted-foreground'}`}
                      >
                        <input 
                          type="checkbox" 
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                          checked={isChecked}
                          onChange={() => toggleLevel(lvl)}
                        />
                        <span className="text-xs">{lvl}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-4 border-t border-border/60">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Học phí
                </h3>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'Tất cả học phí' },
                    { id: 'free', label: 'Miễn phí' },
                    { id: 'paid', label: 'Có phí / Trả phí' }
                  ].map((type) => (
                    <label 
                      key={type.id} 
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${filters.priceType === type.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/60 text-muted-foreground'}`}
                    >
                      <input 
                        type="radio"
                        name="priceType"
                        className="border-input text-primary focus:ring-primary h-4 w-4"
                        checked={filters.priceType === type.id}
                        onChange={() => setFilters(prev => ({ ...prev, priceType: type.id as any, page: 1 }))}
                      />
                      <span className="text-xs">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="pt-4 border-t border-border/60">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Đánh giá tối thiểu
                </h3>
                <div className="space-y-1.5">
                  {RATINGS.map(rating => (
                    <button
                      key={rating}
                      onClick={() => setRating(rating)}
                      className={`flex items-center justify-between px-3 py-2 w-full rounded-xl transition-colors ${filters.minRating === rating ? 'bg-amber-500/15 text-amber-700 font-bold border border-amber-500/30' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs">{rating} sao trở lên</span>
                      </div>
                      {filters.minRating === rating && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* MAIN CONTENT AREA */}
          {/* ------------------------------------------------------------- */}
          <div className="flex-1 space-y-6">
            {/* Controls Bar: Results count, Active filter chips, View Switcher & Sort */}
            <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm font-extrabold text-foreground">
                  {isLoading ? 'Đang tải dữ liệu...' : `Hiển thị ${courses.length} / ${totalItems} kết quả`}
                </p>
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {filters.query && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                        Từ khóa: "{filters.query}"
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchInput('')} />
                      </span>
                    )}
                    {filters.categories.map(cat => (
                      <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 text-[11px] font-bold">
                        {cat}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                      </span>
                    ))}
                    {filters.priceType !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                        {filters.priceType === 'free' ? 'Miễn phí' : 'Trả phí'}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, priceType: 'all' }))} />
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* View Switcher */}
                <div className="flex items-center p-1 bg-muted rounded-xl border border-border/60">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Hiển thị dạng lưới"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Hiển thị dạng danh sách"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="lg:hidden rounded-xl h-9"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <Filter className="w-4 h-4 mr-1" /> Bộ lọc
                </Button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground whitespace-nowrap hidden md:inline">Sắp xếp:</span>
                  <select 
                    className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
                  >
                    {SORTS.map(sort => (
                      <option key={sort.value} value={sort.value}>{sort.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <EmptyState 
                title="Không thể kết nối đến máy chủ" 
                description="Đã xảy ra lỗi khi tải danh sách khóa học. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại."
                actionLabel="Tải lại trang"
                onAction={() => refetch()}
              />
            )}

            {/* Loading Skeletons */}
            {!error && isLoading && (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {[...Array(6)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty Search State */}
            {!error && !isLoading && courseDataList.length === 0 && (
              <EmptyState 
                title="Không tìm thấy khoá học phù hợp" 
                description="Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm khác."
                actionLabel="Xoá bộ lọc"
                onAction={resetFilters}
              />
            )}

            {/* Course Cards Grid/List */}
            {!error && !isLoading && courseDataList.length > 0 && (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {courseDataList.map((course) => (
                  <CourseCard key={course.id} course={course} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!error && !isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-border/50">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-xl"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={filters.page === page ? "default" : "ghost"}
                        className="w-10 h-10 rounded-xl font-bold text-xs"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-xl"
                  disabled={filters.page === totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Report Export Modal */}
      <CourseReportExportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        courses={courses}
        totalCoursesCount={totalItems}
        currentFiltersDescription={
          hasActiveFilters
            ? `Bộ lọc active: ${filters.categories.join(', ') || 'Tất cả danh mục'}`
            : 'Tất cả các khóa học'
        }
      />
    </div>
  );
}
