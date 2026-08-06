import React, { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Clock, BookOpen, Star, ArrowRight, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from 'sonner';

export interface CourseData {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  progress?: number; // 0-100, if enrolled
  status?: "enrolled" | "completed" | "not_enrolled";
  slug?: string;
  price?: number;
  salePrice?: number;
}

const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80'
];

export const CourseCard = React.memo(({ course }: { course: CourseData }) => {
  const [imgError, setImgError] = useState(false);

  const isEnrolled = course.status === "enrolled" || course.progress !== undefined;
  const isCompleted = course.status === "completed" || course.progress === 100;
  
  const difficultyBadges = {
    Beginner: "bg-emerald-500/90 text-white border-emerald-400/30",
    Intermediate: "bg-amber-500/90 text-white border-amber-400/30",
    Advanced: "bg-rose-500/90 text-white border-rose-400/30",
  };

  const difficultyLabels = {
    Beginner: "Cơ bản",
    Intermediate: "Trung cấp",
    Advanced: "Nâng cao",
  };

  const difficulty = course.difficulty || "Beginner";

  // Pick deterministic fallback image if thumbnail fails or is empty/relative demo
  const hash = course.id ? Array.from(String(course.id)).reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const fallbackUrl = FALLBACK_THUMBNAILS[hash % FALLBACK_THUMBNAILS.length];

  const isValidUrl = course.thumbnail && 
    (course.thumbnail.startsWith('http://') || course.thumbnail.startsWith('https://'));

  const displayThumbnail = (imgError || !isValidUrl) ? fallbackUrl : course.thumbnail;

  const displayPrice = course.salePrice || course.price || 299000;
  const originalPrice = course.salePrice ? course.price || 499000 : null;

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCompleted) {
      toast.info('Xem lại khóa học', { description: `Bạn đang mở lại khóa học ${course.title}` });
    } else if (isEnrolled) {
      toast.success('Tiếp tục học', { description: `Đang tải bài học tiếp theo của ${course.title}` });
    } else {
      toast.info('Khám phá khóa học', { description: `Bạn đang xem chi tiết ${course.title}` });
    }
  };

  return (
    <Card className="group overflow-hidden border border-border/70 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full bg-card rounded-2xl">
      {/* 1. COVER IMAGE WITH OVERLAY BADGES */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img 
          src={displayThumbnail} 
          alt={course.title}
          onError={() => setImgError(true)}
          className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
        
        {/* Difficulty Badge Top-Left */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md border shadow-xs ${difficultyBadges[difficulty]}`}>
            {difficultyLabels[difficulty]}
          </span>
        </div>

        {/* Rating Badge Top-Right */}
        <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[11px] font-black text-amber-400 flex items-center gap-1 shadow-xs">
          <Star className="w-3 h-3 fill-current" />
          <span>4.8</span>
        </div>

        {/* Enrolled Progress Bar */}
        {isEnrolled && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/60 backdrop-blur-xs">
            <div 
              className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${course.progress || 0}%` }}
            />
          </div>
        )}
      </div>
      
      {/* 2. CARD CONTENT BODY */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2">
          {/* Instructor Line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <div className="w-4.5 h-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserIcon className="w-2.5 h-2.5" />
            </div>
            <span className="truncate">{course.instructor}</span>
          </div>

          {/* Title */}
          <Link to={`/courses/${course.slug || course.id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-extrabold text-sm leading-snug text-foreground tracking-tight line-clamp-2 min-h-[2.5rem]">
              {course.title}
            </h3>
          </Link>

          {/* Meta Info (Duration & Lessons) */}
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground/90 pt-1">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{course.duration || '20h 30m'}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>24 bài học</span>
            </div>
          </div>
        </div>

        {/* 3. FOOTER PRICE & ACTION BUTTON */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-sm font-black text-foreground tracking-tight leading-none whitespace-nowrap">
              {displayPrice.toLocaleString()}đ
            </span>
            {originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through font-medium whitespace-nowrap mt-0.5">
                {originalPrice.toLocaleString()}đ
              </span>
            )}
          </div>

          {/* Action Button */}
          <Link to={`/courses/${course.slug || course.id}`} className="shrink-0">
            <Button 
              onClick={handleAction} 
              size="sm" 
              variant={isEnrolled ? "default" : "secondary"} 
              className="rounded-xl text-[11px] h-7.5 px-2.5 font-bold shadow-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 flex items-center gap-1 whitespace-nowrap"
            >
              <span>{isCompleted ? "Xem lại" : isEnrolled ? "Học tiếp" : "Xem chi tiết"}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
});

CourseCard.displayName = "CourseCard";
