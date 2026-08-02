import React, { useEffect, useState } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Trophy, Medal, Star, Flame, Target, Zap } from 'lucide-react';
import { apiFetchEnvelope } from '@/shared/lib/api-client';

export default function AchievementsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetchEnvelope("/users/me/activity")
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy thành tựu:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground text-xs font-medium">Đang tải thành tựu...</span>
        </div>
      </div>
    );
  }

  const { stats, leaderboard } = data;
  const { total_xp, streak_count, completed_courses_count } = stats;

  // Find my rank
  const myRankItem = leaderboard.find((item: any) => item.isMe);
  const rank = myRankItem ? myRankItem.rank : "-";

  // Badges unlocking conditions
  const isFastLearnerUnlocked = completed_courses_count >= 1;
  const isStreakUnlocked = streak_count >= 7;
  const isTopTenUnlocked = rank !== "-" && rank <= 5; // Unlocked if in the top 5
  const isMasterUnlocked = total_xp >= 50000;

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Thành tựu & Huy hiệu</h1>
            <p className="text-muted-foreground">Theo dõi tiến độ học tập và các danh hiệu bạn đã đạt được.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Star className="w-5 h-5" /> Tổng XP</h3>
            <p className="text-4xl font-black">{total_xp.toLocaleString()}</p>
            <p className="text-white/80 text-sm mt-2">
              {rank !== "-" ? `Hạng ${rank} trên Bảng xếp hạng` : "Chưa có thứ hạng"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Flame className="w-5 h-5" /> Chuỗi ngày học</h3>
            <p className="text-4xl font-black">{streak_count} <span className="text-xl">ngày</span></p>
            <p className="text-white/80 text-sm mt-2">
              {streak_count > 0 ? "Giữ vững phong độ nhé!" : "Hãy hoàn thành bài học hôm nay để bắt đầu chuỗi!"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Target className="w-5 h-5" /> Khóa học hoàn thành</h3>
            <p className="text-4xl font-black">{completed_courses_count}</p>
            <p className="text-white/80 text-sm mt-2">Bạn đang làm rất tốt.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Bộ sưu tập Huy hiệu</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {/* Fast Learner Badge */}
          <div className={`bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center shadow-sm transition-all hover:shadow-md ${!isFastLearnerUnlocked ? 'opacity-50 grayscale bg-muted/10 border-dashed' : ''}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${isFastLearnerUnlocked ? 'bg-amber-100 text-amber-500' : 'bg-slate-200 text-slate-400'}`}>
              <Zap className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-sm">Fast Learner</h3>
            <p className="text-xs text-muted-foreground mt-1">Hoàn thành khóa học đầu tiên</p>
            <span className={`text-[10px] font-semibold mt-2 px-2 py-0.5 rounded ${isFastLearnerUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {isFastLearnerUnlocked ? "Đã mở khóa" : "Chưa đạt"}
            </span>
          </div>

          {/* 7 Day Streak Badge */}
          <div className={`bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center shadow-sm transition-all hover:shadow-md ${!isStreakUnlocked ? 'opacity-50 grayscale bg-muted/10 border-dashed' : ''}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isStreakUnlocked ? 'bg-rose-100 text-rose-500' : 'bg-slate-200 text-slate-400'}`}>
              <Flame className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-sm">7 Day Streak</h3>
            <p className="text-xs text-muted-foreground mt-1">Học liên tục 7 ngày</p>
            <span className={`text-[10px] font-semibold mt-2 px-2 py-0.5 rounded ${isStreakUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {isStreakUnlocked ? "Đã mở khóa" : "Chưa đạt"}
            </span>
          </div>

          {/* Top 5 Badge */}
          <div className={`bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center shadow-sm transition-all hover:shadow-md ${!isTopTenUnlocked ? 'opacity-50 grayscale bg-muted/10 border-dashed' : ''}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isTopTenUnlocked ? 'bg-blue-100 text-blue-500' : 'bg-slate-200 text-slate-400'}`}>
              <Medal className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-sm">Top 5</h3>
            <p className="text-xs text-muted-foreground mt-1">Lọt top 5 bảng xếp hạng</p>
            <span className={`text-[10px] font-semibold mt-2 px-2 py-0.5 rounded ${isTopTenUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {isTopTenUnlocked ? "Đã mở khóa" : "Chưa đạt"}
            </span>
          </div>
          
          {/* Master Badge */}
          <div className={`bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center shadow-sm transition-all hover:shadow-md ${!isMasterUnlocked ? 'opacity-50 grayscale bg-muted/10 border-dashed' : ''}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isMasterUnlocked ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
              <Star className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-sm">Master</h3>
            <p className="text-xs text-muted-foreground mt-1">Đạt 50,000 XP</p>
            <span className={`text-[10px] font-semibold mt-2 px-2 py-0.5 rounded ${isMasterUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {isMasterUnlocked ? "Đã mở khóa" : "Chưa đạt"}
            </span>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
