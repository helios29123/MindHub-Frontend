import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';
import { ILearningDashboardData } from '@/types/learningDashboard';

export const homeApi = {
  async getHomepageData(): Promise<any> {
    devLog('Catalog', 'Get homepage catalog metrics, sliders, and categories');
    return apiFetch<any>('/home');
  },
  async getLearningDashboard(): Promise<ILearningDashboardData> {
    devLog('LearningDashboard', 'Get learning dashboard stats and recent course');
    return apiFetch<ILearningDashboardData>('/me/learning-dashboard');
  },
  async getActivityCalendar(): Promise<import('@/types/learningDashboard').IActivityCalendarData> {
    devLog('ActivityCalendar', 'Get activity calendar and daily mission');
    return apiFetch<import('@/types/learningDashboard').IActivityCalendarData>('/me/activity-calendar');
  }
};
