import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Coupon } from '../types';

interface Props {
  coupon?: Coupon | null;
  onClose: () => void;
  onSubmit: (data: Partial<Coupon>) => Promise<void>;
}

export const CouponForm: React.FC<Props> = ({ coupon, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    name: '',
    course_id: '',
    discount_type: 'percent',
    discount_value: 0,
    usage_limit: undefined,
    start_at: '',
    end_at: '',
    status: 'active',
    description: '',
  });

  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (coupon) {
      // Format dates for input datetime-local
      const start = coupon.start_at ? coupon.start_at.substring(0, 16) : '';
      const end = coupon.end_at ? coupon.end_at.substring(0, 16) : '';
      setFormData({
        ...coupon,
        start_at: start,
        end_at: end
      });
    } else {
      setFormData({
        code: '',
        name: '',
        course_id: '',
        discount_type: 'percent',
        discount_value: 0,
        usage_limit: undefined,
        start_at: '',
        end_at: '',
        status: 'active',
        description: '',
      });
    }
    setValidationError('');
  }, [coupon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'code') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\s+/g, '').toUpperCase() }));
    } else if (name === 'discount_value' || name === 'usage_limit') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    if (!formData.code) {
      setValidationError('Mã giảm giá không được để trống.');
      return false;
    }
    if (!formData.discount_value || formData.discount_value <= 0) {
      setValidationError('Giá trị giảm giá phải lớn hơn 0.');
      return false;
    }
    if (formData.discount_type === 'percent' && formData.discount_value > 100) {
      setValidationError('Phần trăm giảm giá không được vượt quá 100%.');
      return false;
    }
    if (!formData.start_at || !formData.end_at) {
      setValidationError('Vui lòng chọn ngày bắt đầu và kết thúc.');
      return false;
    }
    
    const start = new Date(formData.start_at).getTime();
    const end = new Date(formData.end_at).getTime();
    if (end <= start) {
      setValidationError('Ngày kết thúc phải sau ngày bắt đầu.');
      return false;
    }

    if (!formData.course_id) {
      setValidationError('Vui lòng chọn khóa học áp dụng.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Ensure ISO date strings are sent
      const payload = {
        ...formData,
        name: formData.name || `Khuyến mãi ${formData.code}`,
        start_at: new Date(formData.start_at!).toISOString(),
        end_at: new Date(formData.end_at!).toISOString(),
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Lỗi lưu thông tin mã giảm giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 flex flex-col h-[750px] overflow-hidden text-left">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {coupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá'}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[11px] font-bold">
            {validationError}
          </div>
        )}

        <form id="coupon-drawer-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Mã giảm giá */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã giảm giá *</label>
            <input 
              required 
              type="text" 
              name="code" 
              value={formData.code || ''} 
              onChange={handleChange} 
              placeholder="Nhập mã (VD: WELCOME20)" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal uppercase font-mono font-bold" 
            />
            <p className="text-[9px] text-slate-400 font-semibold">Mã sẽ được viết hoa tự động, không dấu cách.</p>
          </div>

          {/* Loại giảm giá */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại giảm giá *</label>
            <div className="flex gap-2">
              <select 
                required 
                name="discount_type" 
                value={formData.discount_type || 'percent'} 
                onChange={handleChange} 
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer"
              >
                <option value="percent">Phần trăm</option>
                <option value="fixed">Số tiền</option>
              </select>
              <select
                name="discount_type_unit"
                value={formData.discount_type === 'percent' ? '%' : 'fixed'}
                onChange={(e) => {
                  const type = e.target.value === '%' ? 'percent' : 'fixed';
                  setFormData(prev => ({ ...prev, discount_type: type, discount_value: 0 }));
                }}
                className="w-16 px-2 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer"
              >
                <option value="%">%</option>
                <option value="fixed">đ</option>
              </select>
            </div>
          </div>

          {/* Giá trị */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Giá trị *</label>
            <input 
              required 
              type="number" 
              name="discount_value" 
              value={formData.discount_value || ''} 
              onChange={handleChange} 
              placeholder="Nhập giá trị" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-bold" 
            />
            <p className="text-[9px] text-slate-400 font-semibold">
              Ví dụ: {formData.discount_type === 'percent' ? '20 cho 20%' : '100000 cho 100.000đ'}
            </p>
          </div>

          {/* Giới hạn sử dụng */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Giới hạn sử dụng</label>
            <input 
              type="number" 
              name="usage_limit" 
              value={formData.usage_limit || ''} 
              onChange={handleChange} 
              placeholder="Để trống nếu không giới hạn" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold" 
            />
          </div>

          {/* Ngày bắt đầu */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu *</label>
            <div className="relative">
              <input 
                required 
                type="datetime-local" 
                name="start_at" 
                value={formData.start_at || ''} 
                onChange={handleChange} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold" 
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Ngày kết thúc */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày kết thúc *</label>
            <div className="relative">
              <input 
                required 
                type="datetime-local" 
                name="end_at" 
                value={formData.end_at || ''} 
                onChange={handleChange} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold" 
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Khóa học áp dụng */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Khóa học áp dụng *</label>
            <select 
              required 
              name="course_id" 
              value={formData.course_id || ''} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer"
            >
              <option value="">Chọn khóa học</option>
              <option value="course_python">Lập trình Python cơ bản cho người mới bắt đầu</option>
              <option value="course_uiux">Thiết kế UI/UX từ cơ bản đến nâng cao</option>
              <option value="course_data">Data Analysis with Excel & SQL</option>
              <option value="course_django">Lập trình Web với Django Framework</option>
              <option value="course_devops">DevOps cơ bản với Docker & Kubernetes</option>
              <option value="course_ml">Machine Learning cơ bản với Python</option>
              <option value="course_marketing">Khóa học Marketing Online A-Z</option>
            </select>
            <p className="text-[9px] text-slate-400 font-semibold">
              Áp dụng cho một khóa học cụ thể hoặc để trống để áp dụng cho tất cả.
            </p>
          </div>

          {/* Trạng thái */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái *</label>
            <select 
              required 
              name="status" 
              value={formData.status || 'active'} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer"
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm tắt</option>
            </select>
          </div>

          {/* Mô tả */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả tùy chọn</label>
            <textarea 
              name="description" 
              value={formData.description || ''} 
              onChange={handleChange} 
              placeholder="Nhập mô tả cho mã giảm giá" 
              rows={2} 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-medium" 
            />
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-2.5 shrink-0">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-4 py-2 border border-slate-200 text-slate-655 hover:bg-slate-150 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Hủy
        </button>
        <button 
          form="coupon-drawer-form" 
          type="submit" 
          disabled={isSubmitting} 
          className="px-5 py-2 bg-brand-normal hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {coupon ? 'Lưu mã' : 'Tạo mã'}
        </button>
      </div>
    </div>
  );
};
