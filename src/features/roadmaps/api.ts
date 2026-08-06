import { apiFetch, devLog } from '@/shared/lib/api-client';

export interface RoadmapSummary {
  id: string;
  category: 'web' | 'mobile' | 'data' | 'cloud' | 'fullstack';
  categoryLabel: string;
  title: string;
  description: string;
  coursesCount: number;
  duration: string;
  salary: string;
  demand: string;
  skills: string[];
}

export const roadmapsApi = {
  /**
   * Fetch all roadmap paths from Backend API
   */
  async getRoadmaps(): Promise<any[]> {
    devLog('Roadmaps', 'Fetching roadmap catalog & backend course list');
    try {
      const res = await apiFetch<any>('/courses');
      const courses = Array.isArray(res) ? res : res?.data || res?.courses || [];
      return courses;
    } catch (err) {
      console.warn('Backend courses fetch error, falling back to local dataset:', err);
      return [];
    }
  },

  /**
   * Fetch specific Roadmap Details & real backend courses for milestones
   */
  async getRoadmapDetail(roadmapId: string): Promise<any> {
    devLog('Roadmaps', `Fetching detailed roadmap milestones for: ${roadmapId}`);
    try {
      const res = await apiFetch<any>(`/courses?category=${roadmapId}`);
      const courses = Array.isArray(res) ? res : res?.data || res?.courses || [];
      return { roadmapId, courses };
    } catch (err) {
      console.warn(`Failed fetching backend courses for ${roadmapId}, using local dataset:`, err);
      return { roadmapId, courses: [] };
    }
  },

  /**
   * Fetch personalized next learning path from backend for logged in learner
   */
  async getNextLearningPath(): Promise<any> {
    devLog('Roadmaps', 'Fetching personalized recommended learning path');
    try {
      const res = await apiFetch<any>('/me/learning-path/next');
      return res?.data || res;
    } catch (err) {
      console.warn('Learning path API not accessible or unauthenticated:', err);
      return null;
    }
  }
};
