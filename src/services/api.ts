import { Course, Chapter, Lesson, User, QAMessage, StudentProgress, PayoutRequest, AuditLog } from '../types';

/**
 * MindHub API Service Configuration and Integration Layer
 * 
 * This service is designed to serve as the unified bridge between the React frontend 
 * and your upcoming real backend (Node.js/Express, Go, Python, Laravel, etc.).
 * 
 * HOW TO INTEGRATE WITH REAL BACKEND:
 * 1. Set the VITE_API_MODE environment variable to "api" (or toggle via the Developer Panel in the UI).
 * 2. Configure VITE_API_BASE_URL in your .env file to match your backend port (e.g., http://localhost:8000/api).
 * 3. Keep the payload formats here synchronized with your backend database schemas.
 */

export interface ApiConfig {
  mode: 'mock' | 'api';
  baseUrl: string;
  authToken?: string;
  isLogEnabled: boolean;
}

// Read configuration from local storage or environment variables
const initialMode = (localStorage.getItem('mindhub_api_mode') as 'mock' | 'api') || 'mock';
const initialBaseUrl = localStorage.getItem('mindhub_api_base_url') || (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api';

const config: ApiConfig = {
  mode: initialMode,
  baseUrl: initialBaseUrl,
  authToken: localStorage.getItem('mindhub_api_token') || undefined,
  isLogEnabled: true,
};

// Simplified Dev Logger
const devLog = (category: string, action: string, payload?: any) => {
  if (config.isLogEnabled) {
    console.log(`%c[API ${config.mode.toUpperCase()}] %c${category} -> ${action}`, 'color: #8a72ec; font-weight: bold;', 'color: #10b981;', payload || '');
    // Append to virtual logger for developer console in dashboards
    const logs = JSON.parse(localStorage.getItem('mindhub_virtual_api_logs') || '[]');
    const newLog = {
      id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString(),
      mode: config.mode,
      category,
      action,
      payload: payload ? JSON.stringify(payload, null, 2) : 'No payload',
    };
    localStorage.setItem('mindhub_virtual_api_logs', JSON.stringify([newLog, ...logs].slice(0, 100)));
  }
};

/**
 * HTTP Client Utility with Automatic Authorization header injection
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (config.mode === 'mock') {
    throw new Error('apiFetch called while in mock mode.');
  }

  const url = `${config.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (config.authToken) {
    headers.set('Authorization', `Bearer ${config.authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    let errJson;
    try {
      errJson = JSON.parse(errText);
    } catch {
      /* ignore */
    }
    throw new Error(errJson?.message || errJson?.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const ApiService = {
  // Get current active mode & dynamic configurations
  getConfig() {
    return { ...config };
  },

  setMode(mode: 'mock' | 'api') {
    config.mode = mode;
    localStorage.setItem('mindhub_api_mode', mode);
    devLog('Config', 'Changed API mode', { mode });
  },

  setBaseUrl(url: string) {
    config.baseUrl = url;
    localStorage.setItem('mindhub_api_base_url', url);
    devLog('Config', 'Changed API Base URL', { url });
  },

  getVirtualLogs(): Array<{ id: string; time: string; mode: string; category: string; action: string; payload: string }> {
    try {
      return JSON.parse(localStorage.getItem('mindhub_virtual_api_logs') || '[]');
    } catch {
      return [];
    }
  },

  clearVirtualLogs() {
    localStorage.setItem('mindhub_virtual_api_logs', '[]');
  },

  // ==========================================
  // 1. COURSE API ENDPOINTS
  // ==========================================
  async getCourses(): Promise<Course[]> {
    devLog('Courses', 'Fetch all courses request');
    if (config.mode === 'api') {
      return apiFetch<Course[]>('/courses');
    }
    // Static mock response handled in App state
    return [];
  },

  async createCourseDraft(course: Course): Promise<Course> {
    devLog('Courses', 'Create new draft', { id: course.id, title: course.title });
    if (config.mode === 'api') {
      return apiFetch<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(course),
      });
    }
    return course;
  },

  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    devLog('Courses', `Update course detail: ${courseId}`, courseData);
    if (config.mode === 'api') {
      return apiFetch<Course>(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
    }
    return courseData as any;
  },

  async deleteCourse(courseId: string): Promise<{ success: boolean }> {
    devLog('Courses', `Delete course: ${courseId}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/courses/${courseId}`, {
        method: 'DELETE',
      });
    }
    return { success: true };
  },

  // ==========================================
  // 2. CHAPTERS & LESSONS INNER API
  // ==========================================
  async updateCourseChapters(courseId: string, chapters: Chapter[]): Promise<{ success: boolean; chapters: Chapter[] }> {
    devLog('Chapters', `Bulk Sync Curriculum for course ${courseId}`, chapters);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; chapters: Chapter[] }>(`/courses/${courseId}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ chapters }),
      });
    }
    return { success: true, chapters };
  },

  // ==========================================
  // 3. SECURE HLS VIDEO UPLOADER
  // ==========================================
  async uploadLessonVideo(
    file: File, 
    onProgress: (progress: number, status: string) => void
  ): Promise<{ success: boolean; videoUrl: string; duration: string }> {
    devLog('Media', 'Upload direct video file request', { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` });
    
    if (config.mode === 'api') {
      // Real API Mode: uploads using multipart/form-data
      const formData = new FormData();
      formData.append('video', file);
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${config.baseUrl}/media/upload-video`);
        
        if (config.authToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${config.authToken}`);
        }
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete, 'Đang gửi từng cụm byte lên Cloud Storage...');
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch (err) {
              reject(new Error('Invalid response payload from media server.'));
            }
          } else {
            reject(new Error(`Tải video lỗi: status code ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Mất kết nối tới máy chủ lưu trữ HLS.'));
        xhr.send(formData);
      });
    }

    // Return simulation
    return new Promise((resolve) => {
      resolve({
        success: true,
        videoUrl: `https://mindhub-cdn.example.com/videos/${Date.now()}_stream/adaptive.m3u8`,
        duration: '12:45'
      });
    });
  },

  // ==========================================
  // 4. USER AUTH & PROGRESS API
  // ==========================================
  async updateStudentProgress(courseId: string, progress: Partial<StudentProgress>): Promise<Partial<StudentProgress>> {
    devLog('Progress', `Sync student study session for: ${courseId}`, progress);
    if (config.mode === 'api') {
      return apiFetch<StudentProgress>(`/progress/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(progress),
      });
    }
    return progress;
  }
};
