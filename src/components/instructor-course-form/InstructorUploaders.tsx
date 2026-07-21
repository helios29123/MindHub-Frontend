import React, { useState, useRef } from 'react';
import { Upload, X, Film, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { ApiService } from '../../services/api';

interface UploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

// 1. Image Uploader
export const InstructorImageUploader: React.FC<UploaderProps> = ({ value, onChange, label }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Chỉ chấp nhận định dạng JPG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Dung lượng hình ảnh không được vượt quá 5MB.');
      return;
    }

    try {
      setUploading(true);
      const res = await ApiService.uploadInstructorFile(file, 'course_thumbnail');
      onChange(res.url);
    } catch (e) {
      setError('Tải lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && <label className="block text-[10.5px] font-bold text-stone-600 mb-1">{label}</label>}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer transition-all"
      >
        {value ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <img src={value} alt="Preview" className="w-full max-h-32 object-cover rounded-lg border" />
            <button 
              type="button" 
              onClick={() => onChange('')}
              className="text-rose-500 hover:underline font-bold text-[10px] cursor-pointer"
            >
              Xóa ảnh
            </button>
          </div>
        ) : (
          <div className="py-2">
            <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
            <p className="text-[10px] text-stone-500 font-bold">Kéo thả ảnh bìa hoặc Click chọn</p>
            <p className="text-[8.5px] text-stone-400">JPG, PNG, WEBP tối đa 5MB</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
          className="hidden" 
          accept="image/*" 
        />
      </div>
      {uploading && <div className="text-[9.5px] text-emerald-600 font-bold">Đang tải ảnh lên...</div>}
      {error && <div className="text-[9.5px] text-rose-500 font-bold">{error}</div>}
    </div>
  );
};

// 2. Video Uploader
export const InstructorVideoUploader: React.FC<UploaderProps & { type: 'course_intro_video' | 'lesson_video' }> = ({ value, onChange, label, type }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
      setError('Chỉ chấp nhận định dạng MP4, MOV hoặc WEBM.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Dung lượng video không được vượt quá 100MB.');
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      const progressTimer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 15));
      }, 200);

      const res = await ApiService.uploadInstructorFile(file, type);
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => {
        onChange(res.url);
        setUploading(false);
      }, 300);
    } catch (e) {
      setError('Tải lên video thất bại.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && <label className="block text-[10.5px] font-bold text-stone-600 mb-1">{label}</label>}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer transition-all"
      >
        {value ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video max-h-32 bg-black rounded-lg overflow-hidden border">
              <video src={value} controls className="w-full h-full object-contain" />
            </div>
            <button 
              type="button" 
              onClick={() => onChange('')}
              className="text-rose-500 hover:underline font-bold text-[10px] cursor-pointer"
            >
              Xóa video
            </button>
          </div>
        ) : (
          <div className="py-2">
            <Film className="w-6 h-6 text-stone-400 mx-auto mb-1" />
            <p className="text-[10px] text-stone-500 font-bold">Kéo thả file video hoặc Click chọn</p>
            <p className="text-[8.5px] text-stone-400">MP4, MOV, WEBM tối đa 100MB</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
          className="hidden" 
          accept="video/*" 
        />
      </div>
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-stone-500">
            <span>Đang tải video...</span>
            <span className="text-emerald-600">{progress}%</span>
          </div>
        </div>
      )}
      {error && <div className="text-[9.5px] text-rose-500 font-bold">{error}</div>}
    </div>
  );
};

// 3. Asset Uploader
interface AssetUploaderProps {
  onAssetUploaded: (asset: { file_url: string; file_name: string; file_type: string; file_size: number }) => void;
  label?: string;
}

export const InstructorAssetUploader: React.FC<AssetUploaderProps> = ({ onAssetUploaded, label }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    if (file.size > 20 * 1024 * 1024) {
      setError('Dung lượng tài liệu không được vượt quá 20MB.');
      return;
    }

    try {
      setUploading(true);
      const res = await ApiService.uploadInstructorFile(file, 'lesson_asset');
      onAssetUploaded({
        file_url: res.url,
        file_name: file.name,
        file_type: file.name.split('.').pop() || 'pdf',
        file_size: file.size
      });
    } catch (e) {
      setError('Tải lên tài liệu thất bại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && <label className="block text-[10.5px] font-bold text-stone-600 mb-1">{label}</label>}
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full bg-[#f0fdf4] hover:bg-[#e6f4ea] text-[#10b981] border border-emerald-100 py-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <Upload className="w-3.5 h-3.5" /> {uploading ? 'Đang đính kèm...' : 'Tải tài liệu đính kèm'}
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
        className="hidden" 
      />
      {error && <div className="text-[9px] text-rose-500 font-bold">{error}</div>}
    </div>
  );
};
