export interface ILearningStatistics {
  active_courses: number;
  completed_courses: number;
  total_learning_hours: number;
  certificates_count: number;
}

export interface ICurrentLesson {
  lesson_id: number;
  title: string;
  index_text: string;
}

export interface IRecentCourse {
  course_id: number;
  title: string;
  thumbnail_url: string;
  category_name: string;
  progress_percent: number;
  current_lesson: ICurrentLesson | null;
}

export interface ILearningDashboardData {
  statistics: ILearningStatistics;
  recent_course: IRecentCourse | null;
}

export interface ILearningDashboardResponse {
  success: boolean;
  message: string;
  data: ILearningDashboardData;
}
