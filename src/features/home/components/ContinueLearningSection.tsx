import React from "react";
import { Link } from "react-router-dom";
import { IRecentCourse } from "@/types/learningDashboard";

interface Props {
  recentCourse: IRecentCourse;
}

export function ContinueLearningSection({ recentCourse }: Props) {
  return (
    <div className="bg-gradient-to-r from-card to-primary/5 rounded-2xl border border-border/50 shadow-sm overflow-hidden p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Link className="w-full md:w-48 aspect-video rounded-xl overflow-hidden shrink-0 relative group cursor-pointer border border-border block" to={`/course/${recentCourse.course_id}`}>
          <img alt="Course Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={recentCourse.thumbnail_url} />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play h-5 w-5 ml-1" aria-hidden="true"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
            </div>
          </div>
        </Link>
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <Link className="text-xs font-bold text-primary uppercase tracking-wider hover:underline" to={`/roadmaps/${recentCourse.category_name.toLowerCase().replace(/ /g, '-')}`}>Đang học • {recentCourse.category_name}</Link>
            <span className="text-xs font-bold text-muted-foreground">{recentCourse.progress_percent}%</span>
          </div>
          <Link className="hover:underline block" to={`/course/${recentCourse.course_id}`}>
            <h3 className="text-lg font-bold mb-1">{recentCourse.title}</h3>
          </Link>
          <p className="text-sm text-foreground font-medium mb-4">
            {recentCourse.current_lesson ? `${recentCourse.current_lesson.index_text}: ${recentCourse.current_lesson.title}` : 'Chưa bắt đầu bài học nào'}
          </p>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full" style={{ width: `${recentCourse.progress_percent}%` }}></div>
          </div>
          <div className="flex items-center gap-3">
            <Link className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 active:scale-[0.98] transition-transform h-9 py-2 w-full md:w-auto rounded-full font-bold px-8" to={recentCourse.current_lesson ? `/course/${recentCourse.course_id}/learn/${recentCourse.current_lesson.lesson_id}` : `/course/${recentCourse.course_id}/learn`}>
              Tiếp tục bài học
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play w-3.5 h-3.5 ml-2" aria-hidden="true"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
            </Link>
            <Link className="items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent active:scale-[0.98] transition-transform h-8 px-3 text-xs rounded-full text-muted-foreground hover:text-foreground hidden md:flex" to={`/course/${recentCourse.course_id}`}>
              Xem đề cương
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
