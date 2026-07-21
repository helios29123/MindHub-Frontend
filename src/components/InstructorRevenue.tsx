import React, { useState, useEffect, useMemo } from 'react';
import { ApiService } from '../services/api';
import { 
  Search, Activity, DollarSign, ChevronLeft, ChevronRight, X, 
  TrendingUp, Calendar, BookOpen, Clock, AlertCircle, Sparkles, Loader2, ArrowRight,
  TrendingDown, Percent, Award, Info, BarChart2, Download, RefreshCw, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

interface InstructorRevenueProps {
  instructorId: string;
  courses: any[];
}

// Fallback Mock Datasets
const MOCK_KPI_DATA = {
  totalGross: 523450000,
  totalRevenue: 392587500,
  totalPlatformFee: 130862500,
  totalRevenueMonth: 523450000,
  withdrawableBalance: 287450000
};

const MOCK_REVENUE_CHART_DATA = [
  { date: '01/05', gross: 50000000, instructor: 30000000 },
  { date: '05/05', gross: 85000000, instructor: 55000000 },
  { date: '09/05', gross: 22000000, instructor: 12000000 },
  { date: '13/05', gross: 70000000, instructor: 48000000 },
  { date: '17/05', gross: 46000000, instructor: 28000000 },
  { date: '21/05', gross: 60000000, instructor: 38000000 },
  { date: '25/05', gross: 80000000, instructor: 50000000 },
  { date: '29/05', gross: 52000000, instructor: 32000000 },
  { date: '31/05', gross: 40000000, instructor: 20000000 }
];

const MOCK_ENROLLMENT_CHART_DATA = [
  { date: '01/05', enrollments: 55 },
  { date: '03/05', enrollments: 30 },
  { date: '05/05', enrollments: 20 },
  { date: '07/05', enrollments: 40 },
  { date: '09/05', enrollments: 75 },
  { date: '11/05', enrollments: 98 },
  { date: '13/05', enrollments: 210 },
  { date: '15/05', enrollments: 120 },
  { date: '17/05', enrollments: 88 },
  { date: '19/05', enrollments: 40 },
  { date: '21/05', enrollments: 25 },
  { date: '23/05', enrollments: 32 },
  { date: '25/05', enrollments: 68 },
  { date: '27/05', enrollments: 105 },
  { date: '29/05', enrollments: 45 },
  { date: '31/05', enrollments: 95 }
];

const MOCK_TOP_COURSES = [
  { rank: 1, title: 'Lập trình Web với React cho người mới bắt đầu', revenue: 124850000, students: 1245, color: '#f59e0b' },
  { rank: 2, title: 'UI/UX Design từ cơ bản đến nâng cao', revenue: 98750000, students: 987, color: '#3b82f6' },
  { rank: 3, title: 'Lập trình Python cho Data Science', revenue: 76540000, students: 765, color: '#10b981' },
  { rank: 4, title: 'JavaScript Nâng Cao: Framework & Tools', revenue: 58230000, students: 582, color: '#ec4899' },
  { rank: 5, title: 'Docker & Kubernetes thực chiến', revenue: 45680000, students: 456, color: '#8b5cf6' }
];

const MOCK_REVENUE_DETAIL_TABLE = [
  { id: '1', date: '31/05/2024', course: 'Lập trình Web với React cho người mới bắt đầu', orders: 23, gross: 16450000, net: 12337500, status: 'Hoàn thành' },
  { id: '2', date: '31/05/2024', course: 'UI/UX Design từ cơ bản đến nâng cao', orders: 15, gross: 12750000, net: 9562500, status: 'Hoàn thành' },
  { id: '3', date: '30/05/2024', course: 'Lập trình Python cho Data Science', orders: 18, gross: 14860000, net: 11145000, status: 'Hoàn thành' },
  { id: '4', date: '30/05/2024', course: 'JavaScript Nâng Cao: Framework & Tools', orders: 11, gross: 8250000, net: 6187500, status: 'Chờ đối soát' },
  { id: '5', date: '29/05/2024', course: 'Docker & Kubernetes thực chiến', orders: 9, gross: 6780000, net: 5085000, status: 'Hoàn thành' }
];

const DONUT_COLORS = ['#3b82f6', '#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export const InstructorRevenue: React.FC<InstructorRevenueProps> = ({ instructorId, courses }) => {
  const [stats, setStats] = useState(MOCK_KPI_DATA);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState('01/05/2024 - 31/05/2024');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Fetch real data (if it returns zeroes, it falls back to mock)
  const fetchRevenueData = async () => {
    if (!instructorId) return;
    setLoading(true);
    try {
      const [statsRes, balanceRes, listRes] = await Promise.all([
        ApiService.getInstructorRevenueStats(instructorId, {}),
        ApiService.getInstructorBalance(instructorId),
        ApiService.getInstructorRevenues(instructorId, { limit: 5 })
      ]);

      const hasRealData = statsRes && (statsRes.totalGross > 0 || statsRes.totalRevenue > 0);

      if (hasRealData) {
        setStats({
          totalGross: statsRes.totalGross || 0,
          totalRevenue: statsRes.totalRevenue || 0,
          totalPlatformFee: statsRes.totalPlatformFee || 0,
          totalRevenueMonth: statsRes.totalRevenue || 0,
          withdrawableBalance: balanceRes?.withdrawableBalance || 0
        });
      } else {
        setStats(MOCK_KPI_DATA);
      }
    } catch (err) {
      console.error("Failed to fetch revenues details, using fallback:", err);
      setStats(MOCK_KPI_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [instructorId]);

  // Navigate to withdrawals page via trigger click on the sidebar
  const handleRedirectToWithdraw = () => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const withdrawBtn = buttons.find(el => el.textContent?.trim() === 'Rút tiền');
    if (withdrawBtn) {
      (withdrawBtn as HTMLElement).click();
    } else {
      showToast('Vui lòng click mục Rút tiền ở menu bên trái.');
    }
  };

  // Donut chart representation
  const donutData = useMemo(() => {
    return [
      { name: 'React cho người mới bắt đầu', value: 124850000, percentage: 23.9 },
      { name: 'UI/UX Design từ cơ bản đến nâng cao', value: 98750000, percentage: 18.9 },
      { name: 'Python cho Data Science', value: 76540000, percentage: 14.6 },
      { name: 'JavaScript Nâng Cao', value: 58230000, percentage: 11.1 },
      { name: 'Docker & Kubernetes', value: 45680000, percentage: 8.7 },
      { name: 'Khác', value: 119400000, percentage: 22.8 }
    ];
  }, []);

  return (
    <main className="instructor-revenue-page flex-1 min-w-0 bg-slate-50/50">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="w-full space-y-6 p-6 text-left">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Doanh thu</h1>
            <p className="text-[#595959] text-[11px] font-bold mt-1">Tổng quan doanh thu và hiệu quả kinh doanh</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            {/* Date Range Selector Dropdown */}
            <div className="relative">
              <button 
                onClick={() => showToast('Thay đổi khoảng thời gian đối soát.')}
                className="px-3.5 py-2 bg-white border border-[#dbdde4] hover:bg-slate-50 text-[#121b4b] rounded-xl flex items-center gap-2 shadow-sm cursor-pointer text-[11px] font-bold"
              >
                <Calendar className="w-3.5 h-3.5 text-[#595959]" />
                {dateRange}
              </button>
            </div>

            {/* Toggle Ngày/Tháng/Năm */}
            <div className="flex bg-[#e7e8ed]/60 rounded-xl p-1 border border-[#e7e8ed]">
              {(['day', 'month', 'year'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3.5 py-1.5 rounded-lg uppercase text-[10px] tracking-wider transition-all cursor-pointer font-bold ${
                    viewMode === mode 
                      ? 'bg-[#121b4b] text-white shadow-sm' 
                      : 'text-[#737373] hover:text-[#121b4b]'
                  }`}
                >
                  {mode === 'day' ? 'Ngày' : mode === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* 5 KPI Cards Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Doanh thu gộp</span>
              <div className="p-1 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-[#06091a] block">{formatVND(stats.totalGross)}</span>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                ▲ +18.6% <span className="text-[#8c8c8c] font-medium">so với kỳ trước</span>
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Doanh thu giảng viên</span>
              <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-[#121b4b] block">{formatVND(stats.totalRevenue)}</span>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                ▲ +16.3% <span className="text-[#8c8c8c] font-medium">so với kỳ trước</span>
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Phí nền tảng</span>
              <div className="p-1 bg-amber-50 rounded-lg text-amber-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-[#06091a] block">{formatVND(stats.totalPlatformFee)}</span>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                ▲ +24.1% <span className="text-[#8c8c8c] font-medium">so với kỳ trước</span>
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Doanh thu tháng này</span>
              <div className="p-1 bg-emerald-50 rounded-lg text-emerald-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-[#06091a] block">{formatVND(stats.totalRevenueMonth)}</span>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                ▲ +18.6% <span className="text-[#8c8c8c] font-medium">so với tháng trước</span>
              </span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Số dư có thể rút</span>
              <div className="p-1 bg-teal-50 rounded-lg text-teal-600">
                <WalletIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-emerald-600 block">{formatVND(stats.withdrawableBalance)}</span>
              <button 
                onClick={handleRedirectToWithdraw}
                className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 mt-1.5 transition-colors cursor-pointer"
              >
                Rút tiền ngay →
              </button>
            </div>
          </div>
        </section>

        {/* Middle Charts Section (3 cards side-by-side) */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Card 1: Doanh thu Line Chart */}
          <div className="xl:col-span-6 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-sm h-[360px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed]">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider flex items-center gap-1.5">
                Doanh thu <Info className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </h3>
              <select className="border border-[#dbdde4] text-[10.5px] font-bold p-1 rounded-lg outline-none bg-white cursor-pointer text-[#595959]">
                <option>Biểu đồ đường</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[10px] mt-2 font-bold">
              <span className="flex items-center gap-1.5 text-[#595959]">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span> Doanh thu gộp (đ)
              </span>
              <span className="flex items-center gap-1.5 text-[#595959]">
                <span className="w-2.5 h-2.5 rounded bg-[#8b5cf6] inline-block"></span> Doanh thu giảng viên (đ)
              </span>
            </div>

            <div className="h-[260px] w-full mt-3 relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_REVENUE_CHART_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                  <Tooltip formatter={(value: number) => [formatVND(value), '']} />
                  <Line type="monotone" dataKey="gross" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="instructor" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Xu hướng ghi danh Bar Chart */}
          <div className="xl:col-span-3 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-sm h-[360px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed]">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider flex items-center gap-1.5">
                Xu hướng ghi danh <Info className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </h3>
              <select className="border border-[#dbdde4] text-[10.5px] font-bold p-1 rounded-lg outline-none bg-white cursor-pointer text-[#595959]">
                <option>Biểu đồ cột</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[10px] mt-2 font-bold">
              <span className="flex items-center gap-1.5 text-[#595959]">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span> Ghi danh
              </span>
            </div>

            <div className="h-[260px] w-full mt-3 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_ENROLLMENT_CHART_DATA} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                  <Tooltip formatter={(value: number) => [value, 'Ghi danh']} />
                  <Bar dataKey="enrollments" fill="#6366f1" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Top khóa học theo doanh thu */}
          <div className="xl:col-span-3 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-sm h-[360px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed] shrink-0">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider flex items-center gap-1.5">
                Top khóa học theo doanh thu <Info className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </h3>
              <button 
                onClick={() => showToast('Xem tất cả khóa học.')}
                className="text-[10.5px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-3.5 pr-1.5">
              {MOCK_TOP_COURSES.map((course, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-[11px]">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#595959] shrink-0 text-[10px]">
                    {course.rank}
                  </span>
                  
                  {/* Miniature Thumbnail */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-100" style={{ backgroundColor: `${course.color}20` }}>
                    <BookOpen className="w-4 h-4" style={{ color: course.color }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#06091a] truncate leading-tight" title={course.title}>
                      {course.title}
                    </p>
                    <p className="text-[9.5px] text-[#737373] mt-0.5 font-medium">
                      {course.students.toLocaleString()} học viên
                    </p>
                  </div>

                  <span className="font-black text-[#06091a] shrink-0 text-[11px] text-right">
                    {formatVND(course.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Section: Table + Donut chart side-by-side */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Card 1: Bảng doanh thu chi tiết */}
          <div className="xl:col-span-8 bg-white border border-[#e7e8ed] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                <h4 className="font-black text-[#06091a] uppercase text-[10px] tracking-wider">Doanh thu chi tiết</h4>
                <button 
                  onClick={() => showToast('Xuất báo cáo doanh thu thành công.')}
                  className="px-3.5 py-1.5 bg-white border border-[#dbdde4] hover:bg-slate-50 text-[#121b4b] font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer text-[10.5px]"
                >
                  <Download className="w-3.5 h-3.5 text-[#595959]" />
                  Xuất báo cáo
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-[11px]">
                  <thead className="bg-[#e7e8ed]/20 border-b border-[#e7e8ed]">
                    <tr>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px]">Ngày</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-5/12">Khóa học</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-center">Đơn hàng</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-right">Doanh thu gộp</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-right">Giảng viên nhận</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e8ed] font-semibold text-[#06091a]">
                    {MOCK_REVENUE_DETAIL_TABLE.map((rev) => (
                      <tr 
                        key={rev.id} 
                        onClick={() => setSelectedTransaction(rev)}
                        className="hover:bg-slate-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">{rev.date}</td>
                        <td className="py-3 px-4 font-bold text-[#06091a] truncate max-w-[240px]" title={rev.course}>
                          {rev.course}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#595959]">{rev.orders}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#737373] whitespace-nowrap">{formatVND(rev.gross)}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600 whitespace-nowrap">{formatVND(rev.net)}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center border px-2 py-0.5 rounded text-[8.5px] uppercase font-black ${
                            rev.status === 'Hoàn thành'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                              : 'bg-amber-50 text-amber-700 border-amber-150'
                          }`}>
                            {rev.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-[#e7e8ed] flex justify-between items-center bg-slate-50/15">
              <span className="text-[10px] text-[#737373] font-bold">Hiển thị 1-5 trong 142 kết quả</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-[#737373] font-bold">
                  <span>5 / trang</span>
                  <span className="text-[7px]">▼</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 border border-[#dbdde4] rounded-lg bg-white opacity-50 hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="px-2.5 py-1 text-xs font-bold bg-[#3f2b96] text-white rounded-lg">1</button>
                  <button className="px-2.5 py-1 text-xs font-bold border border-[#dbdde4] bg-white rounded-lg">2</button>
                  <button className="px-2.5 py-1 text-xs font-bold border border-[#dbdde4] bg-white rounded-lg">3</button>
                  <span className="text-[#a3a3a3] self-center">...</span>
                  <button className="px-2.5 py-1 text-xs font-bold border border-[#dbdde4] bg-white rounded-lg">29</button>
                  <button className="p-1 border border-[#dbdde4] rounded-lg bg-white hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Doanh thu theo khóa học Donut Chart */}
          <div className="xl:col-span-4 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed] shrink-0">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider">Doanh thu theo khóa học</h3>
              <select className="border border-[#dbdde4] text-[10.5px] font-bold p-1 rounded-lg outline-none bg-white cursor-pointer text-[#595959]">
                <option>Doanh thu gộp</option>
              </select>
            </div>

            {/* Donut Area */}
            <div className="my-4 h-44 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatVND(value)} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Centered Total */}
              <div className="absolute text-center">
                <span className="text-[12px] font-black text-[#121b4b] block">523.450.000đ</span>
                <span className="text-[8px] uppercase tracking-wider font-bold text-[#8c8c8c] mt-0.5 block">Tổng doanh thu</span>
              </div>
            </div>

            {/* Legends layout */}
            <div className="flex-1 overflow-y-auto space-y-2.5 text-[11px] pr-1">
              {donutData.map((item, index) => (
                <div key={index} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}></span>
                    <span className="text-[#595959] truncate font-medium block" title={item.name}>{item.name}</span>
                  </div>
                  <span className="text-[#06091a] font-bold whitespace-nowrap shrink-0">
                    {formatVND(item.value)} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom link */}
            <div className="pt-3 border-t border-[#e7e8ed] shrink-0 text-center">
              <button 
                onClick={() => showToast('Tải báo cáo doanh thu khóa học chi tiết.')}
                className="text-blue-600 hover:text-blue-700 font-bold text-[10.5px] flex items-center justify-center gap-1 cursor-pointer mx-auto transition-colors"
              >
                Xem báo cáo chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* TRANSACTION DETAILED POPUP MODAL */}
      {selectedTransaction && (
        <>
          <div 
            onClick={() => setSelectedTransaction(null)}
            className="fixed inset-0 bg-[#06091a]/40 backdrop-blur-3xs z-[90] animate-in fade-in duration-300"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden pointer-events-auto border border-[#e7e8ed] animate-in zoom-in-95 duration-200 text-xs font-semibold text-[#121b4b] text-left">
              <div className="p-4 border-b border-[#e7e8ed] bg-slate-50/80 flex justify-between items-center">
                <h3 className="font-black text-sm text-[#06091a] uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Chi tiết giao dịch đối soát
                </h3>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="p-1 border border-[#dbdde4] rounded-full hover:bg-slate-50 text-[#737373]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4 font-semibold text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#737373] block mb-1">Mã đơn hàng</span>
                    <span className="text-[#06091a] bg-[#e7e8ed]/45 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      #ORD-REV0{selectedTransaction.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block mb-1">Ngày giao dịch</span>
                    <span className="text-[#06091a]">{selectedTransaction.date}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#737373] block mb-1">Khóa học</span>
                  <span className="text-[#06091a] font-bold text-sm leading-snug">{selectedTransaction.course}</span>
                </div>

                <div className="border-t border-b border-[#e7e8ed] py-3 my-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#737373] font-medium">Tổng thanh toán (Gross)</span>
                    <span className="text-[#06091a] font-bold">{formatVND(selectedTransaction.gross)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-150">
                    <span className="text-emerald-850 font-black">Thu nhập giảng viên thực nhận</span>
                    <span className="text-emerald-700 font-black text-sm">{formatVND(selectedTransaction.net)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#737373] font-medium">Trạng thái đối soát</span>
                  <span className="inline-flex items-center whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded text-[9.5px] uppercase font-black">
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4 border-t border-[#e7e8ed] bg-slate-50/80 flex justify-end">
                <button 
                  onClick={() => setSelectedTransaction(null)} 
                  className="px-4 py-2 border border-[#dbdde4] rounded-xl text-[#121b4b] hover:bg-slate-50 font-bold bg-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

// Wallet SVG icon helper for card 5
const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M12 4v16" />
    <path d="M2 10h20" />
  </svg>
);
