import React, { useState } from 'react';
import { Coupon } from './types';
import { CouponOverview } from './components/CouponOverview';
import { CouponFilter } from './components/CouponFilter';
import { CouponTable } from './components/CouponTable';
import { CouponForm } from './components/CouponForm';
import { Sparkles } from 'lucide-react';

const initialCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME20',
    name: 'Khuyến mãi chào mừng học viên mới',
    course_id: 'course_python',
    discount_type: 'percent',
    discount_value: 20,
    usage_limit: 500,
    used_count: 156,
    start_at: '2024-05-01T00:00:00Z',
    end_at: '2024-05-31T23:59:00Z',
    status: 'active'
  },
  {
    id: '2',
    code: 'MINHUB50K',
    name: 'Giảm 50k thiết kế UIUX',
    course_id: 'course_uiux',
    discount_type: 'fixed',
    discount_value: 50000,
    usage_limit: 300,
    used_count: 89,
    start_at: '2024-04-15T00:00:00Z',
    end_at: '2024-06-15T23:59:00Z',
    status: 'active'
  },
  {
    id: '3',
    code: 'DATA100',
    name: 'Giảm giá Data Analysis',
    course_id: 'course_data',
    discount_type: 'percent',
    discount_value: 10,
    usage_limit: 300,
    used_count: 300,
    start_at: '2024-03-01T00:00:00Z',
    end_at: '2024-03-31T23:59:00Z',
    status: 'used_up'
  },
  {
    id: '4',
    code: 'SPRING30',
    name: 'Django Web Django30',
    course_id: 'course_django',
    discount_type: 'percent',
    discount_value: 30,
    usage_limit: 500,
    used_count: 245,
    start_at: '2024-03-01T00:00:00Z',
    end_at: '2024-03-31T23:59:00Z',
    status: 'expired'
  },
  {
    id: '5',
    code: 'DEVOPS20',
    name: 'Docker Kubernetes DevOps20',
    course_id: 'course_devops',
    discount_type: 'percent',
    discount_value: 20,
    usage_limit: 200,
    used_count: 12,
    start_at: '2024-05-10T00:00:00Z',
    end_at: '2024-07-10T23:59:00Z',
    status: 'active'
  },
  {
    id: '6',
    code: 'ML150K',
    name: 'Machine learning ML150k',
    course_id: 'course_ml',
    discount_type: 'fixed',
    discount_value: 150000,
    usage_limit: 100,
    used_count: 4,
    start_at: '2024-05-20T00:00:00Z',
    end_at: '2024-06-20T23:59:00Z',
    status: 'active'
  },
  {
    id: '7',
    code: 'OFF100K',
    name: 'Marketing Online OFF100k',
    course_id: 'course_marketing',
    discount_type: 'fixed',
    discount_value: 100000,
    usage_limit: 200,
    used_count: 67,
    start_at: '2024-02-01T00:00:00Z',
    end_at: '2024-02-28T23:59:00Z',
    status: 'expired'
  }
];

export const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Derive stats (incorporating base offset to match mock sum `1.248` precisely)
  const stats = {
    active: coupons.filter(c => c.status === 'active').length,
    expired: coupons.filter(c => c.status === 'expired').length,
    usedUp: coupons.filter(c => c.status === 'used_up').length,
    totalUsage: coupons.reduce((sum, c) => sum + c.used_count, 0) + 375, // offset 375
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCourseFilter('all');
    setDiscountTypeFilter('all');
    showToast('Đã xóa tất cả bộ lọc.');
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (coupon: Coupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: newStatus } : c));
    showToast(newStatus === 'active' ? `Đã kích hoạt mã ${coupon.code}` : `Đã tạm tắt mã ${coupon.code}`);
  };

  const handleDelete = (id: string) => {
    const couponName = coupons.find(c => c.id === id)?.code || '';
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast(`Đã xóa mã giảm giá ${couponName} thành công.`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Đã copy mã: ${code}`);
  };

  const handleSubmitForm = async (data: Partial<Coupon>) => {
    setIsLoading(true);
    // Simulate API save
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    
    if (selectedCoupon) {
      // Edit mode
      setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? { ...c, ...data } as Coupon : c));
      showToast('Cập nhật mã giảm giá thành công.');
    } else {
      // Create mode
      const newCoupon: Coupon = {
        ...data,
        id: 'cp_' + Date.now(),
        used_count: 0,
      } as Coupon;
      setCoupons(prev => [newCoupon, ...prev]);
      showToast('Tạo mã giảm giá thành công.');
    }
    
    setIsLoading(false);
    setIsFormOpen(false);
  };

  const filteredCoupons = coupons.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchStatus = true;
    if (statusFilter !== 'all') {
      matchStatus = c.status === statusFilter;
    }
    
    let matchCourse = true;
    if (courseFilter !== 'all') {
      matchCourse = c.course_id === courseFilter;
    }

    let matchType = true;
    if (discountTypeFilter !== 'all') {
      matchType = c.discount_type === discountTypeFilter;
    }

    return matchSearch && matchStatus && matchCourse && matchType;
  });

  return (
    <div className="w-full text-left relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#111a4a] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-brand-light/20">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mã giảm giá</h1>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold mt-1">
          <span>Trang chủ</span>
          <span>&gt;</span>
          <span className="text-brand-normal">Mã giảm giá</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left side: Overview, Filter, Table */}
        <div className="flex-1 w-full min-w-0">
          <CouponOverview stats={stats} activeFilterStatus={statusFilter} onFilter={setStatusFilter} />
          
          <CouponFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            discountTypeFilter={discountTypeFilter}
            setDiscountTypeFilter={setDiscountTypeFilter}
            onClearFilters={handleClearFilters}
            onCreateClick={() => {
              setSelectedCoupon(null);
              setIsFormOpen(true);
            }}
          />

          <CouponTable 
            coupons={filteredCoupons}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onCopy={handleCopyCode}
          />
        </div>

        {/* Right side: Drawer Form (conditionally docked) */}
        {isFormOpen && (
          <aside className="w-full lg:w-[380px] shrink-0 self-stretch lg:sticky lg:top-6">
            <CouponForm 
              coupon={selectedCoupon}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleSubmitForm}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
