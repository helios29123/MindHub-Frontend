import React, { useRef, useEffect } from 'react';
import { Lesson } from '@/shared/types';
import { PlayCircle } from 'lucide-react';
import { classroomApi } from '../api';

interface VideoPlayerProps {
  activeLesson: Lesson | null;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function VideoPlayer({ activeLesson, onEnded, onTimeUpdate }: VideoPlayerProps) {
  const lastSavedSecondRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    lastSavedSecondRef.current = 0;
  }, [activeLesson?.id]);

  useEffect(() => {
    const handleSeekEvent = (e: CustomEvent<{ seconds: number }>) => {
      if (videoRef.current && typeof e.detail?.seconds === 'number') {
        videoRef.current.currentTime = e.detail.seconds;
        videoRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('mindhub_seek_video' as any, handleSeekEvent as any);
    return () => {
      window.removeEventListener('mindhub_seek_video' as any, handleSeekEvent as any);
    };
  }, []);

  if (!activeLesson) {
    return (
      <div className="w-full aspect-video bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
        <p>Vui lòng chọn bài học</p>
      </div>
    );
  }

  const isVideo = activeLesson.type === 'video' || Boolean(activeLesson.videoUrl);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const currentSecond = Math.floor(video.currentTime);
    const durationSecond = Math.floor(video.duration || 0);

    (window as any).__mindhub_current_video_time = video.currentTime;

    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime, video.duration || 0);
    }

    // Throttle API progress saves: Sync with backend DB every 5 seconds of watching
    if (activeLesson.id && currentSecond > 0 && Math.abs(currentSecond - lastSavedSecondRef.current) >= 5) {
      lastSavedSecondRef.current = currentSecond;
      classroomApi.saveVideoPlaybackRatio(activeLesson.id, currentSecond, durationSecond)
        .catch(err => console.warn('Failed to sync video playback progress with DB:', err));
    }
  };

  const handleVideoEnded = () => {
    if (activeLesson.id) {
      classroomApi.markLessonAsComplete(activeLesson.id)
        .catch(err => console.warn('Failed to mark lesson complete on video end:', err));
    }
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
      {isVideo && activeLesson.videoUrl ? (
        <video 
          ref={videoRef}
          key={activeLesson.id} // Ensure video re-mounts on lesson change
          controls 
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          autoPlay
        >
          <source src={activeLesson.videoUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      ) : (
        <div className="text-center p-6 text-slate-300">
          <PlayCircle className="w-16 h-16 mb-4 opacity-50 mx-auto" />
          <h3 className="text-xl font-bold mb-2">{activeLesson.title}</h3>
          
          {activeLesson.type === 'video' && !activeLesson.videoUrl ? (
            <div className="bg-red-950/40 border border-red-500/50 text-red-200 p-4 rounded-xl mt-4 max-w-md mx-auto">
              <p className="font-bold mb-1">⚠️ Video Đang Cập Nhật</p>
              <p className="text-xs opacity-90">Giảng viên chưa upload video cho bài học này hoặc đường dẫn video bị lỗi. Hệ thống đang tiến hành cập nhật. Xin vui lòng quay lại sau.</p>
            </div>
          ) : (
            <p className="text-sm opacity-80 mt-2">
              {activeLesson.type === 'quiz' ? 'Bài kiểm tra / Quiz' 
                : activeLesson.type === 'assignment' ? 'Bài tập / Assignment' 
                : 'Tài liệu / Document'}
            </p>
          )}
          {activeLesson.type !== 'video' && (
            <button 
              className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium"
              onClick={handleVideoEnded}
            >
              Hoàn thành bài học
            </button>
          )}
        </div>
      )}
    </div>
  );
}
