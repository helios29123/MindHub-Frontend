import React from "react";
import { Flame, Zap, Play } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { useApp } from "@/app/AppContext";
import { BannerSection } from "@/shared/components/ui/BannerSection";

export function HeroBanner() {
  const { currentUser, isLoggedIn } = useApp();
  const displayName = currentUser?.name?.split(' ')[0] || "bạn";

  return (
    <BannerSection
      imageUrl="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop"
      priority={true}
      title={isLoggedIn ? `Chào buổi sáng, ${displayName}! 👋` : "Phát triển Hôm nay, Dẫn đầu Ngày mai"}
      description={
        isLoggedIn 
          ? "Bạn có 1 bài học chưa hoàn thành. Hãy giữ vững phong độ nhé!"
          : "Khám phá hàng ngàn khóa học lập trình chất lượng cao. Nâng cấp kỹ năng của bạn ngay hôm nay."
      }
    >
      {isLoggedIn ? (
        <div className="mt-6 flex flex-col md:flex-row gap-4 bg-background/10 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-2xl w-full max-w-3xl">
          {/* Gamification Stats */}
          <div className="flex gap-4 md:pr-6 md:border-r border-white/20 items-center justify-center">
            <Link to="/achievements" className="flex flex-col items-center group">
              <div className="flex items-center text-amber-400 mb-1">
                <Flame className="w-5 h-5 fill-current mr-1 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold">5</span>
              </div>
              <span className="text-xs text-white/80 uppercase tracking-wider font-semibold">Streak</span>
            </Link>
            
            <Link to="/achievements" className="flex flex-col items-center group">
              <div className="flex items-center text-blue-400 mb-1">
                <Zap className="w-5 h-5 fill-current mr-1 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold">450</span>
              </div>
              <span className="text-xs text-white/80 uppercase tracking-wider font-semibold">XP</span>
            </Link>
          </div>
          
          {/* Continue Learning CTA */}
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full text-left">
              <p className="text-xs font-bold text-primary-foreground/90 uppercase tracking-wider mb-1">Tiếp tục học</p>
              <h3 className="text-sm md:text-base font-bold text-white line-clamp-1 mb-1">Lập trình React JS Cơ bản đến Nâng cao</h3>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <Button asChild className="shrink-0 rounded-full bg-white text-primary hover:bg-white/90">
              <Link to="/course/1/learn">
                Tiếp tục
                <Play className="w-4 h-4 ml-2 fill-current" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" className="rounded-full font-bold px-8" asChild>
            <Link to="/courses">Khám phá khóa học</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full font-bold px-8 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white" asChild>
            <Link to="/auth/login">Đăng nhập</Link>
          </Button>
        </div>
      )}
    </BannerSection>
  );
}
