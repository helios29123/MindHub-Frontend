import React, { useState } from 'react';
import { Heart, Trash2, Tag, CreditCard, CheckCircle, Download, Landmark, BookOpen, FileText, Gift, Info } from 'lucide-react';
import { Course, Order, Coupon } from '../types';
import { SYSTEM_COUPONS } from '../data';

interface CartAndCheckoutProps {
  wishlistCourseIds: string[];
  allCourses: Course[];
  enrolledCourseIds: string[];
  onEnrollSuccess: (courseIds: string[], order: Order) => void;
  onClose: () => void;
  onToggleFavorite: (courseId: string) => void;
  onEnterLesson: (course: Course) => void;
  initialCourseId?: string | null;
}

export default function CartAndCheckout({
  wishlistCourseIds,
  allCourses,
  enrolledCourseIds,
  onEnrollSuccess,
  onClose,
  onToggleFavorite,
  onEnterLesson,
  initialCourseId = null
}: CartAndCheckoutProps) {
  const [couponCode, setCouponCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'momo' | 'vnpay'>('bank');
  
  // Checkout flow phase: 'wishlist' | 'paying' | 'receipt'
  const [phase, setPhase] = useState<'wishlist' | 'paying' | 'receipt'>(() => {
    if (initialCourseId) {
      return 'paying';
    }
    return 'wishlist';
  });
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(() => {
    if (initialCourseId) {
      return allCourses.find((c) => c.id === initialCourseId) || null;
    }
    return null;
  });
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const wishlistCourses = allCourses.filter((c) => wishlistCourseIds.includes(c.id));
  
  // Calculations for single course checkout
  const rawSubtotal = checkoutCourse ? (checkoutCourse.salePrice || checkoutCourse.price) : 0;
  const discountAmount = activeDiscount ? Math.round((rawSubtotal * activeDiscount.percent) / 100) : 0;
  const finalTotal = rawSubtotal - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    // Fetch coupons dynamically from local storage or fallback to system static presets
    const saved = localStorage.getItem('mindhub_coupons');
    let couponsList: Coupon[] = SYSTEM_COUPONS;
    if (saved) {
      try {
        couponsList = JSON.parse(saved);
      } catch (err) {
        console.error("Lỗi parse coupons:", err);
      }
    }

    const matched = couponsList.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (matched) {
      // Check if this coupon is course-restricted and does not match checkoutCourse
      if (matched.targetCourseId && checkoutCourse && checkoutCourse.id !== matched.targetCourseId) {
        setCouponError(`Mã giảm giá này chỉ khả dụng cho khóa học mục tiêu được quy định riêng.`);
        return;
      }
      
      setActiveDiscount({ code: matched.code, percent: matched.discount });
      setCouponSuccess(`Đã áp dụng mã ${matched.code}: Giảm ${matched.discount}%`);
    } else {
      setCouponError('Mã giảm giá không chính xác hoặc đã hết hạn.');
    }
  };

  const handleStartPurchase = (course: Course) => {
    setCheckoutCourse(course);
    setPhase('paying');
  };

  const handleMockPaymentSuccess = (status: 'success' | 'pending' = 'success') => {
    if (!checkoutCourse) return;
    
    // Generate order receipt
    const orderId = 'MIND-' + Math.floor(100000 + Math.random() * 900000);
    const order: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      courses: [{ id: checkoutCourse.id, title: checkoutCourse.title, price: checkoutCourse.salePrice || checkoutCourse.price }],
      discountAmount: discountAmount,
      total: finalTotal,
      status: status,
      paymentMethod: paymentMethod === 'bank' ? 'Chuyển khoản Ngân hàng' : paymentMethod === 'momo' ? 'Ví Momo' : 'VNPAY QR'
    };

    setCreatedOrder(order);
    setPhase('receipt');
    onEnrollSuccess(status === 'success' ? [checkoutCourse.id] : [], order);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-brand-light-active overflow-hidden flex flex-col max-h-[92vh] text-main-darker animate-fade-in relative">
        
        {/* Header Ribbon */}
        <div className="bg-[#432c28] p-4 text-brand-light flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            {initialCourseId ? (
              <CreditCard className="w-4.5 h-4.5 text-amber-300" />
            ) : (
              <Heart className="w-4.5 h-4.5 text-rose-400 fill-rose-400" />
            )}
            <span className="font-display font-bold text-xs sm:text-sm">
              {initialCourseId ? "Thanh toán Ghi danh khóa học | MindHub" : "Khóa học Yêu thích & Tuyển sinh | MindHub"}
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-xs bg-white/10 hover:bg-white/20 py-1.5 px-3.5 rounded-lg text-brand-light hover:text-white transition-all font-semibold"
          >
            Đóng [✕]
          </button>
        </div>

        {/* Info Banner in wishlist page */}
        {phase === 'wishlist' && (
          <div className="bg-[#fffcf5] border-b border-[#f3e6cf] p-3 px-5 text-[10.5px] text-stone-700 flex items-center gap-2 shrink-0">
            <Gift className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-left font-serif leading-relaxed">Nơi lưu giữ những lộ trình chất lượng cao bạn ưu tiên học tập. Ghi danh tuyển sinh trực tuyến nhận ưu đãi vĩnh viễn qua cổng chuyển khoản.</span>
          </div>
        )}

        {/* Scrollable contents wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 tactile-scrollbar">
          
          {phase === 'wishlist' && (
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2 text-left">
                Khóa học yêu thích lưu trữ ({wishlistCourses.length} dự phòng)
              </h3>

              {wishlistCourses.length === 0 ? (
                <div className="text-center py-16 space-y-3.5">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-400">
                    <Heart className="w-8 h-8 opacity-75" />
                  </div>
                  <p className="text-xs font-semibold text-stone-500">Chưa có khóa học nào dưới mục Ước nguyện.</p>
                  <p className="text-[11px] text-stone-400">Hãy nhấn biểu tượng Yêu thích ở các khóa học ngoài trang chủ để lưu trữ học vụ tại đây!</p>
                  <button onClick={onClose} className="bg-[#432c28] hover:bg-black text-white text-xs py-2 px-5 rounded-xl font-bold transition-all shadow-xs">
                    Khám phá Khóa học ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 tactile-scrollbar">
                  {wishlistCourses.map((c) => {
                    const isEnrolled = enrolledCourseIds.includes(c.id);
                    return (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-3.5 bg-white border border-stone-250 rounded-2xl hover:shadow-xs transition-all relative text-left">
                        <img src={c.image} alt="Course banner" className="w-24 h-15 object-cover rounded-xl shrink-0 border" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono font-bold uppercase">{c.subcategory}</span>
                          <h4 className="text-xs font-bold text-stone-900 truncate mt-1 leading-snug">{c.title}</h4>
                          <p className="text-[10.5px] text-stone-500 mt-0.5">Giảng viên: {c.instructorName}</p>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-stone-105">
                          <div className="text-left sm:text-right">
                            <span className="text-xs font-black text-stone-800 block">{formatVND(c.salePrice || c.price)}</span>
                            {c.salePrice && (
                              <span className="text-[10px] text-stone-400 line-through font-mono">{formatVND(c.price)}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {isEnrolled ? (
                              <button
                                onClick={() => onEnterLesson(c)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-1 whitespace-nowrap"
                              >
                                <BookOpen className="w-3.5 h-3.5" /> Học Ngay
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartPurchase(c)}
                                className="bg-[#432c28] hover:bg-black text-white text-[10px] py-2 px-4.5 rounded-xl font-bold transition-all flex items-center justify-center whitespace-nowrap"
                              >
                                Ghi danh ngay
                              </button>
                            )}
                            
                            <button 
                              onClick={() => onToggleFavorite(c.id)}
                              className="text-stone-400 hover:text-red-500 p-2 hover:bg-stone-50 rounded-lg transition-colors border"
                              title="Loại khỏi yêu thích"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PAYING FLow: Restructured into a beautiful 2-column layout on iPad & Desktop */}
          {phase === 'paying' && checkoutCourse && (
            <div className="space-y-4">
              <div className="text-left border-b border-stone-105 pb-3">
                <span className="text-[9px] font-mono tracking-widest font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">CỔNG TIẾP NHẬN GHIDANH AN TOÀN VPBANK LỐC-XÍCH</span>
                <h3 className="text-base font-bold text-stone-900 mt-1.5">Tuyển sinh trực tuyến: {checkoutCourse.title}</h3>
                <p className="text-[11px] text-stone-500 italic mt-0.5">Thời hạn: Nhận toàn quyền truy cập cập nhật bài giảng vĩnh viễn</p>
              </div>

              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                
                {/* COLUMN 1 (Left 5 cols): Payment selection methods, Coupons inputs and note */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="block text-xs font-bold text-stone-800">1. Chọn Cổng / Ví liên kết:</span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`border p-2.5 rounded-xl flex items-center gap-3 text-left transition-all ${paymentMethod === 'bank' ? 'border-[#8b5e3c] bg-[#faf6f2] shadow-xs' : 'border-stone-200 hover:bg-stone-50'}`}
                    >
                      <div className="p-1.5 bg-stone-100 rounded-lg"><Landmark className="w-4 h-4 text-[#432c28]" /></div>
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">Ngân Hàng Chuyển Khoản</span>
                        <span className="text-[9.5px] text-stone-500">Mã QR ngân hàng tự động</span>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`border p-2.5 rounded-xl flex items-center gap-3 text-left transition-all ${paymentMethod === 'momo' ? 'border-[#8b5e3c] bg-[#faf6f2] shadow-xs' : 'border-stone-200 hover:bg-stone-50'}`}
                    >
                      <div className="p-1.5 bg-pink-50 text-pink-700 text-xs font-mono font-black rounded-lg w-7 h-7 flex items-center justify-center border">M</div>
                      <div>
                        <span className="text-xs font-bold text-stone-850 block">Ví Momo Pay</span>
                        <span className="text-[9.5px] text-stone-505">Chuyển ví mượt mà nhanh hơn</span>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('vnpay')}
                      className={`border p-2.5 rounded-xl flex items-center gap-3 text-left transition-all ${paymentMethod === 'vnpay' ? 'border-[#8b5e3c] bg-[#faf6f2] shadow-xs' : 'border-stone-200 hover:bg-stone-50'}`}
                    >
                      <div className="p-1.5 bg-blue-50 rounded-lg"><CreditCard className="w-4 h-4 text-blue-600" /></div>
                      <div>
                        <span className="text-xs font-bold text-stone-850 block">Cổng VNPAY QR Code</span>
                        <span className="text-[9.5px] text-stone-505">Quét dọn bằng ứng dụng ngân hàng</span>
                      </div>
                    </button>
                  </div>

                  {/* Apply coupon voucher */}
                  <form onSubmit={handleApplyCoupon} className="border-t border-stone-200/60 pt-3 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-stone-800 block">Danh mục mã khuyến mãi giảm giá:</span>
                    <div className="flex gap-2 text-xs">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                        <input 
                          type="text" 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Mã giảm học phí hàng năm..."
                          className="w-full text-xs pl-8 pr-3 py-1.5 border border-stone-200 bg-stone-50 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b5e3c]"
                        />
                      </div>
                      <button type="submit" className="bg-stone-900 hover:bg-black text-white text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-xs">
                        Áp mã
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-600 font-semibold">{couponError}</p>}
                    {couponSuccess && <p className="text-[10px] text-emerald-600 font-semibold">{couponSuccess}</p>}
                  </form>

                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 text-[10px] text-amber-900 leading-normal font-serif text-justify">
                    💡 <b>Thông báo:</b> Mã ưu đãi <b>WELCOMEMIND</b> giảm giá trực tiếp 10% học phí ghi nhận ngay. Hãy sử dụng để kiểm soát hóa đơn tốt nhất!
                  </div>
                </div>

                {/* COLUMN 2 (Right 7 cols): VPBANK Specs & simulated submit */}
                <div className="lg:col-span-7 space-y-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5">
                  <span className="block text-xs font-bold text-stone-850 border-b pb-1">2. Chi tiết Lệnh nạp chuyển học phí trực tuyến:</span>
                  
                  <div className="space-y-1.5 leading-normal text-xs text-stone-700">
                    <div className="flex justify-between pb-1.5 border-b border-stone-250/50 font-serif">
                      <span className="text-stone-450">Ngân hàng thụ hưởng:</span>
                      <span className="font-bold text-stone-800">VPBANK (Việt Nam Thịnh Vượng)</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-stone-250/50">
                      <span className="text-stone-450">Số tài khoản:</span>
                      <span className="font-mono font-black text-[#432c28] text-sm tracking-wider">314159265359</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-stone-250/50">
                      <span className="text-stone-450">Tên thụ hưởng pháp nhân:</span>
                      <span className="font-semibold text-stone-800">CÔNG TY CPDV GIÁO DỤC MINDHUB VN</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-stone-250/50">
                      <span className="text-stone-400">Giá gốc học phần:</span>
                      <span className="text-[#a8a19a] line-through font-mono">{formatVND(rawSubtotal)}</span>
                    </div>
                    
                    {activeDiscount && (
                      <div className="flex justify-between pb-1.5 border-b border-stone-250/50 text-emerald-600 font-bold">
                        <span>Voucher giảm giá áp dụng:</span>
                        <span>-{formatVND(discountAmount)} ({activeDiscount.percent}%)</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between py-1 border-b-2 border-dashed border-stone-300">
                      <span className="text-stone-700 font-bold text-xs sm:text-sm">Tổng chuyển chính xác:</span>
                      <span className="font-black text-[#852b21] text-sm sm:text-base">{formatVND(finalTotal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-red-600 font-bold uppercase text-[10.5px]">Nội dung Chuyển tiền (Memos):</span>
                      <span className="font-mono font-bold text-red-600 uppercase bg-red-100/70 border border-red-300/50 px-2 py-0.5 rounded text-xs select-all">MIND{checkoutCourse.id.replace('course-', '').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="bg-stone-850 text-amber-100 p-2.5 rounded-xl border border-stone-800 text-[10px] space-y-1">
                    <p className="font-bold flex items-center gap-1"><Info className="w-3 h-3 text-amber-300" /> HƯỚNG DẪN GIẢ LẬP THANH TOÁN:</p>
                    <p className="font-serif">Bạn có lựa chọn hai cổng thanh toán giả lập bên dưới: <b>Cổng Tự Động</b> sẽ tự động ghi danh bạn ngay lập tức, trong khi <b>Cổng Chờ Duyệt</b> tạo đơn hàng chờ cần được phê duyệt trạng thái bởi Kiểm duyệt viên/Admin (hoặc phê duyệt thủ công trong hồ sơ của bạn).</p>
                  </div>

                  {/* Actions row inside col 2 */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-stone-200/85">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        type="button"
                        onClick={() => handleMockPaymentSuccess('success')} 
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10.5px] font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Thanh toán tự động (Ghi danh ngay)
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => handleMockPaymentSuccess('pending')} 
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[10.5px] font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Landmark className="w-4 h-4" /> Chuyển khoản thường (Chờ phê duyệt)
                      </button>
                    </div>

                    <div className="flex justify-start">
                      <button 
                        type="button"
                        onClick={() => {
                          if (initialCourseId) {
                            onClose();
                          } else {
                            setPhase('wishlist');
                          }
                        }} 
                        className="px-4 py-2 border border-stone-300 text-[10.5px] rounded-xl hover:bg-stone-100 text-stone-600 font-bold text-center cursor-pointer transition-all"
                      >
                        {initialCourseId ? "Hủy bỏ & Quay lại" : "Quay lại wishlist"}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* RECEIPT FRAME */}
          {phase === 'receipt' && createdOrder && checkoutCourse && (
            <div className="space-y-4 text-center max-w-lg mx-auto">
              {createdOrder.status === 'success' ? (
                <>
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                    <CheckCircle className="w-6 h-6 animate-scale-up" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-800">Ghi danh Học viên thành công!</h3>
                  <p className="text-xs text-stone-550 leading-relaxed font-serif">
                    Giao dịch đã hoàn tất và được kích hoạt tự động. Khóa học <b>{checkoutCourse.title}</b> đã chính thức mở khóa vĩnh viễn cho tài khoản của bạn!
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 border border-amber-200 animate-pulse">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-800">Đơn hàng đang chờ xử lý thanh toán!</h3>
                  <p className="text-xs text-stone-550 leading-relaxed font-serif">
                    Yêu cầu chuyển khoản học phí cho khóa <b>{checkoutCourse.title}</b> đã được lưu lại với trạng thái <b>Chờ phê duyệt</b>. Sau khi bạn chuyển khoản chuyển tiền, dữ liệu sẽ sớm được cập nhật kích hoạt.
                  </p>
                </>
              )}

              {/* Tax Invoice Sheet widget */}
              <div className="border border-stone-250 bg-white rounded-2xl p-4 sm:p-5 text-left text-xs space-y-3.5 shadow-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold text-stone-800 text-xs sm:text-sm">HÓA ĐƠN ĐIỆN TỬ E-RECEIPT</span>
                  <span className="font-mono text-stone-400 text-[10px]">{createdOrder.id}</span>
                </div>
                <div className="space-y-1.5 text-stone-500 font-sans">
                  <p>Mã hóa đơn: <span className="text-stone-850 font-bold font-mono">{createdOrder.id}</span></p>
                  <p>Trạng thái thanh toán: {createdOrder.status === 'success' ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold font-mono uppercase text-[9.5px] border border-emerald-200">Đã thanh toán</span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold font-mono uppercase text-[9.5px] border border-amber-200">Đang chờ xử lý (Pending)</span>
                  )}</p>
                  <p>Học viên thụ hưởng: <span className="text-stone-850 font-semibold">T. T. Sang (truongthanhsang31415@gmail.com)</span></p>
                  <p>Ngày ghi nhận: <span className="text-stone-850 font-semibold">{createdOrder.date}</span></p>
                  <p>Hình thức: <span className="text-stone-850 font-semibold">{createdOrder.paymentMethod}</span></p>
                </div>
                
                <div className="border-t border-b border-stone-100 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-705 truncate max-w-xs">{checkoutCourse.title}</span>
                    <span className="font-bold text-[#432c28] ml-2 shrink-0">{formatVND(checkoutCourse.salePrice || checkoutCourse.price)}</span>
                  </div>
                </div>

                {createdOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-650 font-semibold">
                    <span>Mã ưu đãi khuyến mãi:</span>
                    <span>-{formatVND(createdOrder.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-black text-sm text-stone-900 pt-1">
                  <span>TỔNG THANH TOÁN:</span>
                  <span className="text-[#852b21]">{formatVND(createdOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <button 
                  type="button"
                  onClick={() => alert(`Đã tải xuống file biên lai học phí điện tử PDF cho đơn hàng ${createdOrder.id}`)}
                  className="inline-flex justify-center items-center gap-1.5 text-xs text-stone-600 hover:bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl bg-white font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Tải biên lai PDF
                </button>
                
                {createdOrder.status === 'success' ? (
                  <button 
                    type="button"
                    onClick={() => {
                      onClose();
                      onEnterLesson(checkoutCourse);
                    }} 
                    className="flex-1 bg-[#432c28] hover:bg-black text-white py-2 px-5 rounded-xl text-xs font-bold shadow-md transition-all animate-pulse"
                  >
                    Tiến vào lớp học ngay »
                  </button>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        // Dynamically update this order to success
                        const completedOrder = { ...createdOrder, status: 'success' as const };
                        setCreatedOrder(completedOrder);
                        onEnrollSuccess([checkoutCourse.id], completedOrder);
                        alert("Đơn hàng đã được xác nhận thanh toán thành công thông qua mô phỏng!");
                      }} 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-bold shadow-md transition-all"
                    >
                      Phê duyệt nhanh (Thanh toán xong)
                    </button>
                    <button 
                      type="button"
                      onClick={onClose} 
                      className="bg-stone-800 hover:bg-black text-white py-2 px-4 rounded-xl text-xs font-bold shadow-md transition-all"
                    >
                      Đóng đơn hàng
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* System safety note */}
        <div className="bg-stone-50 px-5 py-3 border-t border-[#e8ded3]/80 flex items-center gap-2 text-[10px] text-stone-400 justify-center shrink-0">
          <FileText className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold text-center leading-tight">Mọi thanh toán hóa đơn học thuật trên MindHub được bảo hộ bảo chứng bởi cơ quan thuế Việt Nam.</span>
        </div>

      </div>
    </div>
  );
}
