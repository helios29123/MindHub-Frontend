import React from 'react';
import { HeroBanner } from './components/HeroBanner';
import { RoadmapTimeline } from './components/RoadmapTimeline';
import { SmartDiscovery } from './components/SmartDiscovery';
import { TrendingCourses } from './components/TrendingCourses';
import { NewCourses } from './components/NewCourses';
import { TopInstructors } from './components/TopInstructors';
import { ActivityCalendar } from './components/ActivityCalendar';
import { RecentBadges } from './components/RecentBadges';
import { LearningStatsWidget } from './components/LearningStatsWidget';
import { QuickNavWidget } from './components/QuickNavWidget';
import { RecentlyViewedWidget } from './components/RecentlyViewedWidget';
import { RecommendedCategoriesWidget } from './components/RecommendedCategoriesWidget';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { useHomepageData } from './hooks/useHomepageData';
import { BannerSection } from '@/shared/components/ui/BannerSection';
import { Button } from '@/shared/components/ui/button';

export default function HomePage() {
  const { data, isLoading } = useHomepageData();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted/20 pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cột chính (Main content - Current focus & Gamification) */}
            <div className="flex-1 min-w-0">
              {/* Hero Banner (Replaces CommandCenter) */}
              <HeroBanner />
              
              {/* How far have I progressed? */}
              <RoadmapTimeline />
              
              {/* Banner 2 - Khuyến mãi khóa học nổi bật */}
              <BannerSection
                imageUrl="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop"
                title="Thành thạo kỹ năng mới"
                description="Hàng trăm khóa học chất lượng với ưu đãi đặc biệt đang chờ đón bạn."
                heightClass="min-h-[250px] md:min-h-[300px]"
                className="mb-8"
              >
                <Button className="w-fit rounded-full bg-white text-primary font-bold hover:bg-white/90">
                  Khám phá ngay
                </Button>
              </BannerSection>

              {/* Trending Courses */}
              <TrendingCourses courses={data.trendingCourses} />

              {/* What should I learn next? */}
              <SmartDiscovery courses={data.recommendedCourses} />

              {/* Banner 3 - Giới thiệu khóa học mới */}
              <BannerSection
                imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop"
                title="Đón đầu xu hướng công nghệ"
                description="Cập nhật những kiến thức mới nhất từ các chuyên gia hàng đầu."
                heightClass="min-h-[200px] md:min-h-[250px]"
                className="mb-8"
              />

              {/* New Courses */}
              <NewCourses courses={data.newCourses} />

              {/* Top Instructors */}
              <TopInstructors instructors={data.topInstructors} />
            </div>
            
            {/* Cột phụ (Sidebar - Assistant Widgets) */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-20 flex flex-col">
                {/* Learning Stats */}
                <LearningStatsWidget />

                {/* Daily Goal & Tracking */}
                <ActivityCalendar />
                
                {/* Recently Viewed */}
                <RecentlyViewedWidget />
                
                {/* Recommended Categories */}
                <RecommendedCategoriesWidget categories={data.featuredCategories} />

                {/* Quick Navigation */}
                <QuickNavWidget />
                
                {/* Rewards */}
                <RecentBadges />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
