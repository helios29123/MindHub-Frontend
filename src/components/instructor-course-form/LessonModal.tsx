import React, { useState, useEffect } from 'react';
import { X, Video, FileText } from 'lucide-react';
import { InstructorVideoUploader } from './InstructorUploaders';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    slug: string;
    lesson_type: 'video' | 'doc';
    content: string;
    video_url: string;
    video_duration_seconds: number;
    is_preview: boolean;
    status: string;
    sort_order: number;
  }) => void;
  initialData?: {
    title: string;
    slug: string;
    lesson_type: 'video' | 'doc';
    content: string;
    video_url: string;
    video_duration_seconds: number;
    is_preview: boolean;
    status: string;
    sort_order: number;
  } | null;
}

export default function LessonModal({ isOpen, onClose, onSave, initialData }: LessonModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'doc'>('video');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationStr, setDurationStr] = useState('10:00'); // mm:ss
  const [isPreview, setIsPreview] = useState(false);
  const [status, setStatus] = useState('active');
  const [sortOrder, setSortOrder] = useState(1);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSlug(initialData.slug || '');
      setLessonType(initialData.lesson_type || 'video');
      setContent(initialData.content || '');
      setVideoUrl(initialData.video_url || '');
      
      const seconds = initialData.video_duration_seconds || 0;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setDurationStr(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      
      setIsPreview(initialData.is_preview || false);
      setStatus(initialData.status || 'active');
      setSortOrder(initialData.sort_order || 1);
    } else {
      setTitle('');
      setSlug('');
      setLessonType('video');
      setContent('');
      setVideoUrl('');
      setDurationStr('10:00');
      setIsPreview(false);
      setStatus('active');
      setSortOrder(1);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert duration mm:ss to seconds
    const parts = durationStr.split(':');
    let totalSec = 0;
    if (parts.length === 2) {
      totalSec = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    } else {
      totalSec = parseInt(durationStr) || 0;
    }

    onSave({
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      lesson_type: lessonType,
      content,
      video_url: videoUrl,
      video_duration_seconds: totalSec,
      is_preview: isPreview,
      status,
      sort_order: sortOrder
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-xs font-sans text-stone-850">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-sm font-black text-stone-900">{initialData ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Tiêu đề bài học *</label>
              <input 
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Giới thiệu khóa học"
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Đường dẫn (slug)</label>
              <input 
                type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                placeholder="lap-trinh-python-co-ban"
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Loại bài học</label>
              <select 
                value={lessonType} onChange={(e) => setLessonType(e.target.value as any)}
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
              >
                <option value="video">Video bài giảng</option>
                <option value="doc">Bài đọc lý thuyết (HTML/Markdown)</option>
              </select>
            </div>
            {lessonType === 'video' && (
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1">Thời lượng (mm:ss)</label>
                <input 
                  type="text" value={durationStr} onChange={(e) => setDurationStr(e.target.value)}
                  placeholder="08:45"
                  className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Conditional Input for Video */}
          {lessonType === 'video' && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border">
              <InstructorVideoUploader 
                value={videoUrl} onChange={(url) => setVideoUrl(url)}
                type="lesson_video" label="Tải lên Video bài học"
              />
              <div>
                <label className="block text-[9.5px] font-bold text-stone-500 mb-1">Hoặc nhập URL video bài học:</label>
                <input 
                  type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Conditional Input for Doc */}
          {lessonType === 'doc' && (
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Nội dung bài viết (Markdown/HTML)</label>
              <textarea 
                rows={6} value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung bài viết hướng dẫn..."
                className="w-full text-[11px] font-medium text-stone-700 border border-slate-200 rounded-xl p-2.5 bg-slate-50/20 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Trạng thái</label>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
              >
                <option value="active">Hoạt động công khai (Active)</option>
                <option value="draft">Bản nháp (Draft)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-stone-750">Học thử miễn phí (Preview)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-bold text-stone-600">Hủy</button>
            <button type="submit" className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white font-black rounded-xl">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}
