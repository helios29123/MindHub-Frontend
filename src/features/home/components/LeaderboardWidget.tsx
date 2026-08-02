import React, { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetchEnvelope } from "@/shared/lib/api-client";

export function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetchEnvelope("/users/me/activity")
      .then((res) => {
        setLeaderboard(res.data.leaderboard || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy bảng xếp hạng:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6 animate-pulse h-60 flex flex-col items-center justify-center">
        <Trophy className="w-8 h-8 text-muted-foreground/30 animate-bounce mb-2" />
        <span className="text-muted-foreground text-xs font-medium">Đang tải bảng xếp hạng...</span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold">Bảng Xếp Hạng</h3>
        </div>
        <Link to="/achievements" className="text-xs text-primary hover:underline font-medium">Chi tiết</Link>
      </div>

      <div className="space-y-4">
        {leaderboard.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu xếp hạng</p>
        ) : (
          leaderboard.map((user) => (
            <div 
              key={user.id} 
              className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${user.isMe ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'}`}
            >
              <div className="w-6 text-center font-bold text-sm text-muted-foreground shrink-0">
                {user.rank === 1 ? <Medal className="w-5 h-5 text-yellow-500 mx-auto" /> : 
                 user.rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" /> : 
                 user.rank === 3 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" /> : 
                 user.rank}
              </div>
              
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover bg-muted" 
              />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${user.isMe ? 'text-primary' : ''}`}>
                  {user.name} {user.isMe && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1 font-bold">Bạn</span>}
                </p>
                <p className="text-xs text-muted-foreground">{user.xp.toLocaleString()} XP</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
