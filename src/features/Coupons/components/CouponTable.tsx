import React, { useState } from 'react';
import { Eye, Edit, Trash2, Power, PowerOff, Copy, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Coupon } from '../types';

interface Props {
  coupons: Coupon[];
  isLoading: boolean;
  onEdit: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
  onCopy: (code: string) => void;
}

const COURSE_MAP: Record<string, { title: string; image: string }> = {
  course_python: {
    title: 'Lập trình Python cơ bản cho người mới bắt đầu',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&auto=format&fit=crop&q=60'
  },
  course_uiux: {
    title: 'Thiết kế UI/UX từ cơ bản đến nâng cao',
    image: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=80&auto=format&fit=crop&q=60'
  },
  course_data: {
    title: 'Data Analysis with Excel & SQL',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&auto=format&fit=crop&q=60'
  },
  course_django: {
    title: 'Lập trình Web với Django Framework',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=80&auto=format&fit=crop&q=60'
  },
  course_devops: {
    title: 'DevOps cơ bản với Docker & Kubernetes',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=80&auto=format&fit=crop&q=60'
  },
  course_ml: {
    title: 'Machine Learning cơ bản với Python',
    image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=80&auto=format&fit=crop&q=60'
  },
  course_marketing: {
    title: 'Khóa học Marketing Online A-Z',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&auto=format&fit=crop&q=60'
  }
};

export const CouponTable: React.FC<Props> = ({ 
  coupons, 
  isLoading, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onCopy 
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [perPage, setPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const renderBadge = (status: Coupon['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-emerald-150">Đang hoạt động</span>;
      case 'inactive':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-slate-200">Tạm tắt</span>;
      case 'expired':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-rose-150">Đã hết hạn</span>;
      case 'used_up':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-amber-150">Đã dùng hết</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 overflow-hidden">
        <div className="p-8 text-center text-slate-400">Đang tải danh sách...</div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 p-16 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8 text-slate-350" />
        </div>
        <h3 className="text-sm font-black text-slate-800">Không tìm thấy mã giảm giá nào</h3>
        <p className="text-slate-400 text-xs font-semibold mt-1">Vui lòng điều chỉnh bộ lọc hoặc tạo mã mới.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 overflow-hidden relative">
      <div className="overflow-x-auto tactile-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <th className="p-4 font-bold whitespace-nowrap">Mã</th>
              <th className="p-4 font-bold whitespace-nowrap min-w-[260px]">Khóa học</th>
              <th className="p-4 font-bold whitespace-nowrap min-w-[90px]">Loại</th>
              <th className="p-4 font-bold whitespace-nowrap">Giá trị</th>
              <th className="p-4 font-bold whitespace-nowrap">Bắt đầu</th>
              <th className="p-4 font-bold whitespace-nowrap">Kết thúc</th>
              <th className="p-4 font-bold whitespace-nowrap text-center">Đã dùng</th>
              <th className="p-4 font-bold whitespace-nowrap text-center">Giới hạn</th>
              <th className="p-4 font-bold whitespace-nowrap text-center min-w-[130px]">Trạng thái</th>
              <th className="p-4 font-bold whitespace-nowrap text-center min-w-[120px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {coupons.map((coupon) => {
              const courseInfo = COURSE_MAP[coupon.course_id] || {
                title: coupon.course_id || 'Áp dụng tất cả khóa học',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80'
              };

              return (
                <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Code */}
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-800 rounded font-mono text-xs font-black border border-slate-100">
                      {coupon.code}
                    </span>
                  </td>

                  {/* Course Details */}
                  <td className="p-4 min-w-[260px]">
                    <div className="flex items-center gap-3">
                      <img 
                        src={courseInfo.image} 
                        alt="cover" 
                        className="w-10 h-6 rounded object-cover border border-slate-100 shrink-0" 
                      />
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[240px] whitespace-nowrap inline-block" title={courseInfo.title}>
                        {courseInfo.title}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-4 min-w-[90px] whitespace-nowrap">
                    {coupon.discount_type === 'percent' ? (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 bg-blue-50 text-blue-750 text-[10px] font-bold rounded border border-blue-100">
                        Phần trăm
                      </span>
                    ) : (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 bg-purple-50 text-purple-750 text-[10px] font-bold rounded border border-purple-100">
                        Số tiền
                      </span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="p-4 font-black text-xs text-slate-800 whitespace-nowrap">
                    {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)}
                  </td>

                  {/* Start Date */}
                  <td className="p-4 text-[11px] text-slate-500 font-bold whitespace-nowrap">
                    {formatDateTime(coupon.start_at)}
                  </td>

                  {/* End Date */}
                  <td className="p-4 text-[11px] text-slate-500 font-bold whitespace-nowrap">
                    {formatDateTime(coupon.end_at)}
                  </td>

                  {/* Used Count */}
                  <td className="p-4 text-center text-xs font-black text-slate-800 whitespace-nowrap">
                    {coupon.used_count}
                  </td>

                  {/* Usage Limit */}
                  <td className="p-4 text-center text-xs font-bold text-slate-400 whitespace-nowrap">
                    {coupon.usage_limit || '∞'}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 text-center min-w-[130px] whitespace-nowrap">
                    {renderBadge(coupon.status)}
                  </td>

                  {/* Actions */}
                  <td className="p-4 min-w-[120px] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button 
                        onClick={() => onCopy(coupon.code)} 
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-450 hover:text-brand-normal hover:bg-slate-100 transition-colors cursor-pointer" 
                        title="Copy mã"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onToggleStatus(coupon)} 
                        className={`h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          coupon.status === 'active' 
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`} 
                        title={coupon.status === 'active' ? 'Tạm tắt mã' : 'Bật mã'}
                      >
                        {coupon.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => onEdit(coupon)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-450 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(coupon.id)} 
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-450 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" 
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-4 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/20 text-slate-500 font-bold text-xs text-left">
        <div>
          Hiển thị 1 đến {coupons.length} trong tổng số {coupons.length} mã
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <select
              value={perPage}
              onChange={(e) => setPerPage(e.target.value)}
              className="appearance-none px-3 py-1.5 border border-slate-200 bg-white rounded-lg outline-none cursor-pointer pr-8 relative font-bold text-slate-700"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c7f88' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
            >
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
              <option value="50">50 / trang</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 bg-brand-normal text-white rounded-lg flex items-center justify-center font-black text-xs">
              1
            </button>
            <button className="w-7 h-7 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center font-black text-xs transition-colors">
              2
            </button>
            <button className="w-7 h-7 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center font-black text-xs transition-colors">
              3
            </button>
            <button 
              disabled={true}
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="absolute inset-0 bg-[#011821]/30 backdrop-blur-3xs flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs w-full mx-4 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-11 h-11 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-sm font-black text-slate-800 mb-1">Xóa mã giảm giá?</h3>
            <p className="text-slate-400 text-xs font-semibold mb-4 leading-normal">Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-bold text-xs flex-1 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors font-bold text-xs flex-1 cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
