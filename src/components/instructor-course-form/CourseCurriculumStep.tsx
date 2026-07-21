import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit, FileText, CheckCircle, Video, File, HelpCircle, X, 
  ChevronRight, ChevronDown, Upload, Play, Sparkles, AlertTriangle, Eye, Save, 
  Globe, MoreVertical, GripVertical 
} from 'lucide-react';

import SectionModal from './SectionModal';
import LessonModal from './LessonModal';
import AssetModal from './AssetModal';

interface CourseCurriculumStepProps {
  chapters: any[];
  setChapters: React.Dispatch<React.SetStateAction<any[]>>;
  checklistProgress: number;
  missingItems: string[];
  completedItems: string[];
  onSubmitForReview: () => void;
}

export default function CourseCurriculumStep({
  chapters,
  setChapters,
  checklistProgress,
  missingItems,
  completedItems,
  onSubmitForReview
}: CourseCurriculumStepProps) {
  
  // Selection states
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(null);
  const [lessonDraft, setLessonDraft] = useState<any>(null);
  
  // Modal states
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  
  // Edit/Adding tracking states
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [addingLessonSectionIdx, setAddingLessonSectionIdx] = useState<number | null>(null);
  
  // Dropdown states
  const [dropdownOpenSectionIdx, setDropdownOpenSectionIdx] = useState<number | null>(null);
  const [dropdownOpenLessonKey, setDropdownOpenLessonKey] = useState<string | null>(null);
  
  // Collapse/Expand state for chapters
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  // Refs for uploaders
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop State
  const [draggedLesson, setDraggedLesson] = useState<{ sIdx: number; lIdx: number } | null>(null);
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);

  // Auto-select first lesson on mount if available
  useEffect(() => {
    if (chapters.length > 0 && chapters[0].lessons && chapters[0].lessons.length > 0 && activeSectionIdx === null) {
      setActiveSectionIdx(0);
      setActiveLessonIdx(0);
    }
  }, [chapters]);

  // Sync draft state with selection changes
  useEffect(() => {
    if (activeSectionIdx !== null && activeLessonIdx !== null) {
      const lesson = chapters[activeSectionIdx]?.lessons?.[activeLessonIdx];
      if (lesson) {
        // Parse time format mm:ss from seconds
        const seconds = lesson.video_duration_seconds || 0;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const durationStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        // is_preview select mapping
        let previewType = 'none';
        if (lesson.is_preview) {
          previewType = lesson.preview_type || '2'; // default to 2 mins
        }

        setLessonDraft({
          title: lesson.title || '',
          content: lesson.content || '',
          video_url: lesson.video_url || '',
          video_name: lesson.video_name || '',
          video_size: lesson.video_size || '',
          durationStr: durationStr,
          previewType: previewType,
          status: lesson.status || 'draft',
          lesson_type: lesson.lesson_type || 'video',
          resources: lesson.resources || []
        });
      }
    } else {
      setLessonDraft(null);
    }
  }, [activeSectionIdx, activeLessonIdx, chapters]);

  // Handle draft field changes
  const handleUpdateDraftField = (field: string, value: any) => {
    setLessonDraft((prev: any) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  // Drag and Drop handlers for lessons
  const handleLessonDragStart = (e: React.DragEvent, sIdx: number, lIdx: number) => {
    setDraggedLesson({ sIdx, lIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLessonDragOver = (e: React.DragEvent, sIdx: number, lIdx: number) => {
    e.preventDefault();
  };

  const handleLessonDrop = (e: React.DragEvent, targetSIdx: number, targetLIdx: number) => {
    e.preventDefault();
    if (!draggedLesson) return;
    const { sIdx: sourceSIdx, lIdx: sourceLIdx } = draggedLesson;

    if (sourceSIdx === targetSIdx) {
      // Reorder within same section
      setChapters(prev => prev.map((ch, idx) => {
        if (idx !== targetSIdx) return ch;
        const newLessons = [...ch.lessons];
        const [moved] = newLessons.splice(sourceLIdx, 1);
        newLessons.splice(targetLIdx, 0, moved);
        return { ...ch, lessons: newLessons };
      }));
      if (activeSectionIdx === targetSIdx) {
        if (activeLessonIdx === sourceLIdx) {
          setActiveLessonIdx(targetLIdx);
        } else if (activeLessonIdx > sourceLIdx && activeLessonIdx <= targetLIdx) {
          setActiveLessonIdx(activeLessonIdx - 1);
        } else if (activeLessonIdx < sourceLIdx && activeLessonIdx >= targetLIdx) {
          setActiveLessonIdx(activeLessonIdx + 1);
        }
      }
    } else {
      // Move to different section
      setChapters(prev => prev.map((ch, idx) => {
        if (idx === sourceSIdx) {
          return {
            ...ch,
            lessons: ch.lessons.filter((_: any, i: number) => i !== sourceLIdx)
          };
        }
        if (idx === targetSIdx) {
          const newLessons = [...ch.lessons];
          const moved = prev[sourceSIdx].lessons[sourceLIdx];
          newLessons.splice(targetLIdx, 0, moved);
          return { ...ch, lessons: newLessons };
        }
        return ch;
      }));
      setActiveSectionIdx(targetSIdx);
      setActiveLessonIdx(targetLIdx);
    }
    setDraggedLesson(null);
  };

  // Drag and Drop handlers for sections
  const handleSectionDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedSectionIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleSectionDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedSectionIdx === null || draggedSectionIdx === targetIdx) return;

    setChapters(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedSectionIdx, 1);
      updated.splice(targetIdx, 0, moved);
      return updated;
    });

    if (activeSectionIdx === draggedSectionIdx) {
      setActiveSectionIdx(targetIdx);
    } else if (activeSectionIdx > draggedSectionIdx && activeSectionIdx <= targetIdx) {
      setActiveSectionIdx(activeSectionIdx - 1);
    } else if (activeSectionIdx < draggedSectionIdx && activeSectionIdx >= targetIdx) {
      setActiveSectionIdx(activeSectionIdx + 1);
    }

    setDraggedSectionIdx(null);
  };

  // Save Lesson
  const handleSaveLessonInline = () => {
    if (activeSectionIdx !== null && activeLessonIdx !== null && lessonDraft) {
      // Parse mm:ss to seconds
      const parts = lessonDraft.durationStr.split(':');
      let totalSec = 0;
      if (parts.length === 2) {
        totalSec = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
      } else {
        totalSec = parseInt(lessonDraft.durationStr) || 0;
      }

      setChapters(prev => prev.map((ch, sIdx) => {
        if (sIdx !== activeSectionIdx) return ch;
        const updatedLessons = ch.lessons.map((les: any, lIdx: number) => {
          if (lIdx !== activeLessonIdx) return les;
          return {
            ...les,
            title: lessonDraft.title,
            content: lessonDraft.content,
            video_url: lessonDraft.video_url,
            video_name: lessonDraft.video_name,
            video_size: lessonDraft.video_size,
            video_duration_seconds: totalSec,
            is_preview: lessonDraft.previewType !== 'none',
            preview_type: lessonDraft.previewType,
            status: lessonDraft.status,
            lesson_type: lessonDraft.lesson_type,
            resources: lessonDraft.resources || []
          };
        });
        return { ...ch, lessons: updatedLessons };
      }));
      alert('Đã lưu bài học thành công!');
    }
  };

  // Cancel edits
  const handleCancelChanges = () => {
    if (activeSectionIdx !== null && activeLessonIdx !== null) {
      const lesson = chapters[activeSectionIdx]?.lessons?.[activeLessonIdx];
      if (lesson) {
        const seconds = lesson.video_duration_seconds || 0;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const durationStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        setLessonDraft({
          title: lesson.title || '',
          content: lesson.content || '',
          video_url: lesson.video_url || '',
          video_name: lesson.video_name || '',
          video_size: lesson.video_size || '',
          durationStr: durationStr,
          previewType: lesson.is_preview ? (lesson.preview_type || '2') : 'none',
          status: lesson.status || 'draft',
          lesson_type: lesson.lesson_type || 'video',
          resources: lesson.resources || []
        });
      }
    }
  };

  // Section Modal triggers
  const handleOpenAddSection = () => {
    setEditingSectionIdx(null);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sIdx: number) => {
    setEditingSectionIdx(sIdx);
    setIsSectionModalOpen(true);
    setDropdownOpenSectionIdx(null);
  };

  const handleSaveSection = (payload: any) => {
    if (editingSectionIdx !== null) {
      // Editing existing
      setChapters(prev => prev.map((ch, idx) => {
        if (idx !== editingSectionIdx) return ch;
        return {
          ...ch,
          title: payload.title,
          description: payload.description,
          sort_order: payload.sort_order,
          status: payload.status
        };
      }));
      alert('Đã cập nhật chương thành công!');
    } else {
      // Adding new
      const newSec = {
        id: 'sec-' + Date.now(),
        title: payload.title,
        description: payload.description,
        sort_order: payload.sort_order,
        status: payload.status,
        lessons: []
      };
      setChapters(prev => [...prev, newSec]);
      alert('Đã thêm chương thành công!');
    }
    setIsSectionModalOpen(false);
  };

  const handleRemoveSection = (idx: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chương này và toàn bộ bài học bên trong?')) {
      setChapters(prev => prev.filter((_, i) => i !== idx));
      if (activeSectionIdx === idx) {
        setActiveSectionIdx(null);
        setActiveLessonIdx(null);
      }
      setDropdownOpenSectionIdx(null);
    }
  };

  // Lesson Modal triggers
  const handleOpenAddLesson = (sIdx: number) => {
    setAddingLessonSectionIdx(sIdx);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (payload: any) => {
    if (addingLessonSectionIdx !== null) {
      const newLesson = {
        id: 'les-' + Date.now(),
        title: payload.title,
        slug: payload.slug,
        lesson_type: payload.lesson_type,
        content: payload.content,
        video_url: payload.video_url,
        video_duration_seconds: payload.video_duration_seconds,
        is_preview: payload.is_preview,
        status: payload.status,
        sort_order: payload.sort_order,
        resources: []
      };

      setChapters(prev => prev.map((ch, idx) => {
        if (idx !== addingLessonSectionIdx) return ch;
        return { ...ch, lessons: [...(ch.lessons || []), newLesson] };
      }));

      const targetSIdx = addingLessonSectionIdx;
      setAddingLessonSectionIdx(null);
      setIsLessonModalOpen(false);

      // Auto select the new lesson
      setActiveSectionIdx(targetSIdx);
      setTimeout(() => {
        setChapters(curr => {
          setActiveLessonIdx(curr[targetSIdx]?.lessons?.length - 1);
          return curr;
        });
      }, 50);
      alert('Đã thêm bài học thành công!');
    }
  };

  const handleRemoveLesson = (sIdx: number, lIdx: number) => {
    if (window.confirm('Bạn có chắc muốn xóa bài học này?')) {
      setChapters(prev => prev.map((ch, idx) => {
        if (idx !== sIdx) return ch;
        return { ...ch, lessons: ch.lessons.filter((_: any, i: number) => i !== lIdx) };
      }));
      if (activeSectionIdx === sIdx && activeLessonIdx === lIdx) {
        setActiveSectionIdx(null);
        setActiveLessonIdx(null);
      }
      setDropdownOpenLessonKey(null);
    }
  };

  // Asset Modal triggers
  const handleOpenAddAsset = () => {
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (payload: any) => {
    if (lessonDraft) {
      const newAsset = {
        id: 'asset-' + Date.now(),
        title: payload.title,
        file_url: payload.file_url,
        file_name: payload.file_name,
        file_type: payload.file_type,
        file_size: payload.file_size,
        note: payload.note
      };
      handleUpdateDraftField('resources', [...(lessonDraft.resources || []), newAsset]);
      setIsAssetModalOpen(false);
      alert('Đã thêm tài liệu đính kèm thành công!');
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ tài nguyên đính kèm này?')) {
      handleUpdateDraftField('resources', (lessonDraft.resources || []).filter((r: any) => r.id !== assetId));
    }
  };

  // Client-side video file upload mockup
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      const mockSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      handleUpdateDraftField('video_url', mockUrl);
      handleUpdateDraftField('video_name', file.name);
      handleUpdateDraftField('video_size', mockSize);
      handleUpdateDraftField('durationStr', '10:00');
    }
  };

  // Stats calculation
  const totalChapters = chapters.length;
  let totalLessons = 0;
  let totalDurationSeconds = 0;
  let freePreviewsCount = 0;
  let totalAssetsCount = 0;
  let hasVideo = false;

  chapters.forEach(ch => {
    if (ch.lessons) {
      totalLessons += ch.lessons.length;
      ch.lessons.forEach((l: any) => {
        totalDurationSeconds += l.video_duration_seconds || 0;
        if (l.is_preview) freePreviewsCount++;
        if (l.resources && l.resources.length > 0) totalAssetsCount += l.resources.length;
        if (l.video_url) hasVideo = true;
      });
    }
  });

  const formatEstimation = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCollapse = (sIdx: number) => {
    setCollapsedSections(prev => ({ ...prev, [sIdx]: !prev[sIdx] }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Dynamic Checklist Progress Calculation
  const activeMissing = [...missingItems];
  if (totalChapters === 0 && !activeMissing.includes('Ít nhất 1 chương học')) {
    activeMissing.push('Ít nhất 1 chương học');
  }
  if (totalLessons === 0 && !activeMissing.includes('Ít nhất 1 bài giảng')) {
    activeMissing.push('Ít nhất 1 bài giảng');
  }

  // Ensure content checks are added
  if ((totalChapters === 0 || totalLessons === 0) && !activeMissing.includes('Nội dung khóa học (chương & bài học)')) {
    activeMissing.push('Nội dung khóa học (chương & bài học)');
  }

  const dynamicProgress = Math.max(0, Math.min(100, Math.round(((12 - activeMissing.length) / 12) * 100)));

  // SVG Progress Circle geometry
  const radius = 28;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (dynamicProgress / 100) * circumference;

  const isEligibleForReview = totalChapters > 0 && totalLessons > 0;

  return (
    <div className="space-y-4 font-sans text-xs text-stone-850 instructor-course-content-step">
      
      {/* 3-Column Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* ==================================================
            CỘT TRÁI: CẤU TRÚC KHÓA HỌC (col-span-4)
            ================================================== */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs text-left space-y-4 instructor-curriculum-panel relative z-20">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h4 className="font-extrabold text-xs text-stone-900">Cấu trúc khóa học</h4>
              <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                {totalChapters} chương • {totalLessons} bài học
              </p>
            </div>
            <button 
              type="button"
              onClick={handleOpenAddSection}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#10b981] border border-emerald-100 hover:border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-[10.5px] cursor-pointer transition-colors shadow-3xs"
            >
              + Thêm chương
            </button>
          </div>

          {/* Chapters list tree */}
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {chapters.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-xl bg-slate-50/50">
                <p className="text-stone-400 italic">Chưa có chương nào. Hãy thêm chương đầu tiên cho khóa học.</p>
              </div>
            ) : (
              chapters.map((chapter, sIdx) => {
                const isCollapsed = !!collapsedSections[sIdx];
                return (
                  <div 
                    key={chapter.id || sIdx} 
                    className="border border-slate-100/90 rounded-xl p-3 bg-slate-50/20 space-y-2 instructor-section-card relative"
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, sIdx)}
                    onDragOver={(e) => handleSectionDragOver(e, sIdx)}
                    onDrop={(e) => handleSectionDrop(e, sIdx)}
                  >
                    
                    {/* Chapter Header */}
                    <div className="flex justify-between items-center group/chapter">
                      <button 
                        type="button"
                        onClick={() => toggleCollapse(sIdx)}
                        className="flex items-center gap-1.5 text-left min-w-0 flex-1 hover:text-emerald-700 select-none cursor-pointer focus:outline-none"
                      >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-stone-400" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
                        <span className="font-extrabold text-stone-850 truncate text-[11px] select-none">
                          Chương {sIdx + 1}: {chapter.title}
                        </span>
                      </button>
                      
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        <span className="text-[9px] text-stone-400 font-bold bg-white border rounded px-1.5 py-0.2 shrink-0">
                          {chapter.lessons ? chapter.lessons.length : 0} bài học
                        </span>
                        
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setDropdownOpenSectionIdx(dropdownOpenSectionIdx === sIdx ? null : sIdx)}
                            className="p-1 hover:bg-slate-100 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Section Actions Dropdown */}
                          {dropdownOpenSectionIdx === sIdx && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpenSectionIdx(null)} />
                              <div className="absolute right-0 mt-1 w-28 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1 text-stone-700 text-[10px] font-bold">
                                <button 
                                  type="button"
                                  onClick={() => handleOpenEditSection(sIdx)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit className="w-3 h-3" /> Chỉnh sửa
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveSection(sIdx)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer border-t"
                                >
                                  <Trash2 className="w-3 h-3" /> Xóa chương
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lessons list inside Chapter */}
                    {!isCollapsed && (
                      <div className="space-y-1 pl-2 border-l border-slate-200/80 mt-1">
                        {chapter.lessons && chapter.lessons.map((lesson: any, lIdx: number) => {
                          const isSelected = activeSectionIdx === sIdx && activeLessonIdx === lIdx;
                          const durationMin = Math.floor((lesson.video_duration_seconds || 0) / 60);
                          const durationSec = (lesson.video_duration_seconds || 0) % 60;
                          const durationStr = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;
                          const lessonKey = `${sIdx}-${lIdx}`;
                          
                          return (
                            <div 
                              key={lesson.id || lIdx}
                              onClick={() => {
                                setActiveSectionIdx(sIdx);
                                setActiveLessonIdx(lIdx);
                              }}
                              draggable
                              onDragStart={(e) => handleLessonDragStart(e, sIdx, lIdx)}
                              onDragOver={(e) => handleLessonDragOver(e, sIdx, lIdx)}
                              onDrop={(e) => handleLessonDrop(e, sIdx, lIdx)}
                              className={`flex justify-between items-center px-2 py-2 rounded-lg cursor-pointer transition-all instructor-lesson-row group/lesson relative border ${
                                isSelected 
                                  ? 'bg-[#e6f4ea] border-emerald-500/50 text-emerald-800 shadow-3xs font-bold' 
                                  : 'hover:bg-slate-50/70 border-transparent text-stone-650'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1.5">
                                <GripVertical className="w-3 h-3 text-stone-300 shrink-0 cursor-move" />
                                {lesson.lesson_type === 'video' ? (
                                  <Video className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                )}
                                <span className="truncate text-[10.5px]">
                                  {sIdx + 1}.{lIdx + 1} {lesson.title}
                                </span>
                              </span>
                              
                              <div className="flex items-center gap-2 shrink-0 ml-1">
                                <span className="text-[8.5px] font-bold text-stone-400 uppercase">
                                  {lesson.lesson_type === 'video' ? 'Video' : 'Tài liệu'}
                                </span>
                                <span className="text-[8.5px] font-semibold text-stone-455 shrink-0 font-mono">
                                  {lesson.lesson_type === 'video' ? durationStr : 'PDF'}
                                </span>
                                
                                <div className="relative">
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDropdownOpenLessonKey(dropdownOpenLessonKey === lessonKey ? null : lessonKey);
                                    }}
                                    className="p-0.5 hover:bg-slate-200 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </button>
                                  
                                  {/* Lesson Actions Dropdown */}
                                  {dropdownOpenLessonKey === lessonKey && (
                                    <>
                                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpenLessonKey(null)} />
                                      <div className="absolute right-0 mt-1 w-24 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1 text-stone-700 text-[10px] font-bold">
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveLesson(sIdx, lIdx);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" /> Xóa bài
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {(!chapter.lessons || chapter.lessons.length === 0) && (
                          <div className="py-2.5 pl-3 border border-dashed rounded-lg bg-white/40 text-center">
                            <p className="text-[9.5px] text-stone-400 italic">Chưa có bài học nào trong chương này.</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Add Lesson Button */}
                    <div className="pt-2 text-right">
                      <button 
                        type="button"
                        onClick={() => handleOpenAddLesson(sIdx)}
                        className="text-[9px] font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-slate-100 shadow-3xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        + Thêm bài học
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          <div className="border-t pt-3 text-center">
            <span className="text-[9.5px] text-stone-400 font-bold tracking-wide italic">
              Kéo thả để sắp xếp chương và bài học
            </span>
          </div>
        </div>

        {/* ==================================================
            CỘT GIỮA: CHỈNH SỬA BÀI HỌC (col-span-5)
            ================================================== */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left instructor-lesson-editor relative z-10">
          
          {lessonDraft ? (
            <div className="space-y-4">
              
              {/* Editor Header */}
              <div className="flex justify-between items-start border-b pb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-stone-900">Chỉnh sửa bài học</h4>
                  <p className="text-[10px] text-[#8b5e3c] font-bold truncate mt-0.5" title={chapters[activeSectionIdx!]?.title}>
                    Chương {activeSectionIdx! + 1}: {chapters[activeSectionIdx!]?.title}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button 
                    type="button"
                    onClick={() => alert(`Xem trước bài học: ${lessonDraft.title}`)}
                    className="border border-slate-200 hover:bg-slate-50 text-stone-700 font-extrabold px-3 py-1.5 rounded-xl shadow-3xs transition-all flex items-center gap-1 cursor-pointer text-[10.5px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" /> Xem trước
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => handleRemoveLesson(activeSectionIdx!, activeLessonIdx!)}
                    className="p-2 border border-slate-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all cursor-pointer shadow-3xs"
                    title="Xóa bài học"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-4">
                
                {/* 1. Tiêu đề bài học */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-600">Tiêu đề bài học *</label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={150}
                      value={lessonDraft.title}
                      onChange={(e) => handleUpdateDraftField('title', e.target.value)}
                      placeholder="Ví dụ: Lập trình Python là gì?"
                      className="w-full text-[10.5px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/15 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 bottom-2.5 text-[8.5px] text-stone-400 font-bold">
                      {lessonDraft.title ? lessonDraft.title.length : 0}/150
                    </span>
                  </div>
                </div>

                {/* 2. Mô tả bài học */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-600">Mô tả bài học</label>
                  <div className="relative">
                    <textarea 
                      rows={4}
                      maxLength={500}
                      value={lessonDraft.content}
                      onChange={(e) => handleUpdateDraftField('content', e.target.value)}
                      placeholder="Mô tả tóm tắt nội dung bài học..."
                      className="w-full text-[10.5px] font-medium text-stone-700 border border-slate-200 rounded-xl p-3 bg-slate-50/15 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 bottom-2.5 text-[8.5px] text-stone-400 font-bold">
                      {lessonDraft.content ? lessonDraft.content.length : 0}/500
                    </span>
                  </div>
                </div>

                {/* 3. Video bài học */}
                {lessonDraft.lesson_type === 'video' && (
                  <div className="space-y-2 border border-slate-100 rounded-xl p-3.5 bg-slate-50/30">
                    <label className="block text-[10px] font-bold text-stone-600">Video bài học *</label>
                    
                    {lessonDraft.video_url && !lessonDraft.video_url.startsWith('http') ? (
                      /* Mock Upload File Box */
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-3xs select-none">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                            <Play className="w-4 h-4 fill-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-stone-850 truncate text-[10.5px] leading-tight">
                              {lessonDraft.video_name || 'video-bai-giang.mp4'}
                            </p>
                            <span className="text-[9px] text-stone-400 font-bold block mt-0.5">
                              {lessonDraft.video_size || '24.6 MB'}
                            </span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            if (videoInputRef.current) videoInputRef.current.click();
                          }}
                          className="bg-white border hover:bg-slate-50 text-stone-700 px-3 py-1.5 rounded-xl text-[9.5px] font-bold cursor-pointer transition-colors shadow-3xs shrink-0"
                        >
                          Thay đổi tệp
                        </button>
                      </div>
                    ) : (
                      /* Upload Box Drag and Drop Area */
                      <div 
                        onClick={() => {
                          if (videoInputRef.current) videoInputRef.current.click();
                        }}
                        className="border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-xl p-5 text-center bg-white space-y-2 select-none cursor-pointer transition-colors"
                      >
                        <Upload className="w-7 h-7 text-stone-300 mx-auto" />
                        <div>
                          <p className="font-extrabold text-[10px] text-stone-700">Kéo và thả video vào đây hoặc Click</p>
                          <p className="text-[8px] text-stone-400 mt-0.5">Định dạng hỗ trợ: MP4, MOV, WEBM (Tối đa 2GB)</p>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={videoInputRef}
                      onChange={handleVideoUpload}
                      accept="video/*"
                      className="hidden" 
                    />
                  </div>
                )}

                {/* 4. Hoặc nhập URL video */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-600">Hoặc nhập URL video (tùy chọn)</label>
                  <input 
                    type="text"
                    value={lessonDraft.video_url && lessonDraft.video_url.startsWith('http') ? lessonDraft.video_url : ''}
                    onChange={(e) => handleUpdateDraftField('video_url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-[10.5px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
                  />
                  <p className="text-[8.5px] text-stone-400 font-bold">
                    Nhập link YouTube, Vimeo hoặc link video khác
                  </p>
                </div>

                {/* 5. Tài nguyên đính kèm */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b pb-1">
                    <label className="block text-[10px] font-bold text-stone-600">Tài nguyên đính kèm (tùy chọn)</label>
                    <button 
                      type="button" 
                      onClick={handleOpenAddAsset}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-[9px] font-black cursor-pointer shadow-3xs"
                    >
                      + Thêm tệp tài liệu
                    </button>
                  </div>
                  
                  {lessonDraft.resources && lessonDraft.resources.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 instructor-asset-list">
                      {lessonDraft.resources.map((res: any) => (
                        <div key={res.id} className="bg-slate-50/40 border border-slate-100 rounded-xl p-2 px-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <File className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-extrabold text-stone-850 truncate text-[10px]">
                                {res.file_name || res.title}
                              </p>
                              <span className="text-[8.5px] text-stone-400 font-bold block mt-0.5">
                                {typeof res.file_size === 'number' ? formatBytes(res.file_size) : (res.file_size || '512 KB')}
                              </span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveAsset(res.id)}
                            className="p-1 hover:bg-rose-50 hover:text-rose-600 text-stone-400 rounded-lg cursor-pointer transition-all"
                            title="Xóa tài nguyên"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9.5px] text-stone-400 italic">Chưa đính kèm tài nguyên nào.</p>
                  )}
                </div>

                {/* 6. Thời lượng & 7. Xem trước miễn phí */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-600">Thời lượng (mm:ss) *</label>
                    <input 
                      type="text"
                      value={lessonDraft.durationStr}
                      onChange={(e) => handleUpdateDraftField('durationStr', e.target.value)}
                      placeholder="08:30"
                      className="w-full text-[10.5px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-600">Xem trước miễn phí *</label>
                    <select 
                      value={lessonDraft.previewType}
                      onChange={(e) => handleUpdateDraftField('previewType', e.target.value)}
                      className="w-full text-[10.5px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="none">Không cho xem trước</option>
                      <option value="2">Cho phép xem trước 02:00 phút</option>
                      <option value="all">Cho phép xem toàn bộ bài học</option>
                    </select>
                  </div>
                </div>

                {/* 8. Trạng thái bài học */}
                <div className="space-y-2 border-t pt-3">
                  <label className="block text-[10px] font-bold text-stone-600">Trạng thái bài học *</label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex items-start gap-2 border p-2.5 rounded-xl cursor-pointer bg-white hover:bg-slate-50/50">
                      <input 
                        type="radio" 
                        name="lesson-status" 
                        value="draft"
                        checked={lessonDraft.status === 'draft'}
                        onChange={(e) => handleUpdateDraftField('status', e.target.value)}
                        className="mt-0.5 rounded-full text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-extrabold text-[10px] text-stone-850">Bản nháp</p>
                        <p className="text-[8px] text-stone-400 font-medium">Chỉ bạn có thể xem</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 border p-2.5 rounded-xl cursor-pointer bg-white hover:bg-slate-50/50">
                      <input 
                        type="radio" 
                        name="lesson-status" 
                        value="active"
                        checked={lessonDraft.status === 'active' || lessonDraft.status === 'published'}
                        onChange={(e) => handleUpdateDraftField('status', 'active')}
                        className="mt-0.5 rounded-full text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-extrabold text-[10px] text-stone-850">Đã hoàn thành</p>
                        <p className="text-[8px] text-stone-400 font-medium">Học viên có thể xem</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 border p-2.5 rounded-xl cursor-pointer bg-white hover:bg-slate-50/50">
                      <input 
                        type="radio" 
                        name="lesson-status" 
                        value="hidden"
                        checked={lessonDraft.status === 'hidden'}
                        onChange={(e) => handleUpdateDraftField('status', e.target.value)}
                        className="mt-0.5 rounded-full text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-extrabold text-[10px] text-stone-850">Ẩn</p>
                        <p className="text-[8px] text-stone-400 font-medium">Tạm ẩn khỏi khóa học</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2.5 justify-end pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={handleCancelChanges}
                    className="px-4 py-2 border rounded-xl hover:bg-slate-50 text-stone-600 font-bold transition-all cursor-pointer shadow-3xs"
                  >
                    Hủy thay đổi
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveLessonInline}
                    className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl font-black transition-all cursor-pointer shadow-md"
                  >
                    Lưu bài học
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center py-20 border border-dashed rounded-2xl bg-slate-50/40 text-stone-400 space-y-3 select-none flex flex-col justify-center items-center min-h-[350px]">
              <Play className="w-10 h-10 text-stone-300" />
              <div>
                <p className="font-black text-stone-700 text-xs">Chưa chọn bài học</p>
                <p className="text-[10px] mt-1 text-stone-400 max-w-xs mx-auto">
                  Chọn hoặc thêm một bài học ở danh sách bên trái để bắt đầu chỉnh sửa nội dung bài giảng video/tài liệu.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ==================================================
            CỘT PHẢI: CHECKLIST HOÀN THIỆN KHÓA HỌC (col-span-3)
            ================================================== */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left instructor-checklist-card relative z-10">
          <h4 className="font-extrabold text-xs text-stone-900 border-b pb-2 mb-1">
            Checklist hoàn thiện khóa học
          </h4>

          {/* Progress Circular Widget */}
          <div className="flex items-center gap-3.5 bg-slate-50/40 border border-slate-100 rounded-2xl p-3 shadow-3xs">
            {/* SVG Circle Progress */}
            <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-slate-100"
                  strokeWidth={stroke}
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx="32"
                  cy="32"
                />
                <circle
                  className="text-emerald-500 transition-all duration-300 ease-in-out"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx="32"
                  cy="32"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-800">{dynamicProgress}%</span>
            </div>
            
            <div className="min-w-0">
              <h5 className="font-black text-stone-850 text-[11px] leading-tight">
                {dynamicProgress === 100 ? 'Đã hoàn thiện' : 'Chưa hoàn thiện'}
              </h5>
              <p className="text-[9px] text-stone-400 font-bold leading-tight mt-1">
                {dynamicProgress === 100 
                  ? 'Khóa học của bạn đã sẵn sàng để gửi duyệt.' 
                  : 'Hãy bổ sung đầy đủ các thông tin còn thiếu.'}
              </p>
            </div>
          </div>

          {/* Missing Required Items */}
          <div className="space-y-2">
            <h5 className="text-[9.5px] uppercase font-bold text-stone-450 tracking-wider">
              Thiếu các mục bắt buộc ({activeMissing.length})
            </h5>
            {activeMissing.length > 0 ? (
              <ul className="space-y-1.5 pl-1">
                {activeMissing.map((item, idx) => (
                  <li key={idx} className="text-[10px] text-rose-600 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-800 font-extrabold text-[10px]">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Không có mục nào cần bổ sung</span>
              </div>
            )}
          </div>

          {/* Completed Items */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-[9.5px] uppercase font-bold text-stone-450 tracking-wider">
              Đã hoàn thành ({12 - activeMissing.length})
            </h5>
            
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              <ul className="space-y-2">
                {/* Core structural stats always listed */}
                <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                  <span>Tổng số chương: {totalChapters} chương</span>
                </li>
                
                <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                  <span>Tổng số bài học: {totalLessons} bài học</span>
                </li>

                <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                  <span>Thời lượng ước tính: {formatEstimation(totalDurationSeconds)}</span>
                </li>

                {/* Checked list points mapping parent state */}
                {!activeMissing.includes('Mục tiêu học tập') && !activeMissing.includes('Yêu cầu đầu vào') && (
                  <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                    <span>Mục tiêu & yêu cầu</span>
                  </li>
                )}

                {!activeMissing.includes('Giá khuyến mãi hoặc giá gốc') && (
                  <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                    <span>Cấu hình giá cả</span>
                  </li>
                )}

                {!activeMissing.includes('Thumbnail khóa học') && !activeMissing.includes('Video giới thiệu') && (
                  <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                    <span>Hình ảnh & video giới thiệu</span>
                  </li>
                )}

                {hasVideo && (
                  <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                    <span>Video bài học</span>
                  </li>
                )}

                {totalAssetsCount > 0 && (
                  <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                    <span>Tài liệu đính kèm</span>
                  </li>
                )}

                {freePreviewsCount > 0 && (
                  <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                    <span>Xem trước miễn phí</span>
                  </li>
                )}

                <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                  <span>Trạng thái bài học</span>
                </li>

                {completedItems.includes('Tiêu đề khóa học') && (
                  <li className="text-[10px] text-stone-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                    <span>Thông tin cơ bản</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Submit Action */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={onSubmitForReview}
              disabled={!isEligibleForReview || dynamicProgress < 100}
              className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-black text-center py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs uppercase shadow-md flex items-center justify-center gap-1.5"
            >
              🚀 Gửi chờ duyệt
            </button>
            <p className="text-[8.5px] text-stone-400 font-bold text-center leading-normal">
              Khóa học sẽ được gửi đến MindHub để xem xét và duyệt.
            </p>
          </div>

          {/* Warning Message if ineligible */}
          {(!isEligibleForReview || dynamicProgress < 100) && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-[9px] leading-relaxed font-bold flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                {totalChapters === 0 || totalLessons === 0 ? (
                  <p>Bạn cần thêm ít nhất 1 chương và 1 bài học trước khi gửi duyệt.</p>
                ) : (
                  <p>Vui lòng hoàn thiện tất cả các mục bắt buộc trong checklist để có thể gửi duyệt.</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ==================================================
          MODALS INTEGRATION
          ================================================== */}
      
      {/* 1. Modal Thêm/Sửa chương */}
      <SectionModal 
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={handleSaveSection}
        initialData={editingSectionIdx !== null ? chapters[editingSectionIdx] : null}
      />

      {/* 2. Modal Thêm bài học */}
      <LessonModal 
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          setAddingLessonSectionIdx(null);
        }}
        onSave={handleSaveLesson}
        initialData={null}
      />

      {/* 3. Modal Thêm tài nguyên bài học */}
      <AssetModal 
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSave={handleSaveAsset}
        initialData={null}
      />

    </div>
  );
}
