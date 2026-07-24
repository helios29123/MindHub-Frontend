import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { 
  Wallet, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  Plus, Sparkles, X, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff,
  Building2, Info, ArrowUpRight, HelpCircle, Bell
} from 'lucide-react';

interface InstructorWithdrawalProps {
  instructorId?: string;
}

const MINIMUM_WITHDRAWAL_AMOUNT = 200000;

export const InstructorWithdrawal: React.FC<InstructorWithdrawalProps> = () => {
  // Summary & Balance state
  const [balance, setBalance] = useState<{
    withdrawableBalance: number;
    pendingWithdrawAmount: number;
    paidWithdrawAmount: number;
    rejectedWithdrawAmount: number;
    pendingCount: number;
    paidCount: number;
    rejectedCount: number;
    canCreateWithdrawal: boolean;
  }>({
    withdrawableBalance: 0,
    pendingWithdrawAmount: 0,
    paidWithdrawAmount: 0,
    rejectedWithdrawAmount: 0,
    pendingCount: 0,
    paidCount: 0,
    rejectedCount: 0,
    canCreateWithdrawal: false,
  });

  // Payout accounts state
  const [payoutAccounts, setPayoutAccounts] = useState<any[]>([]);
  const [activePayoutAccount, setActivePayoutAccount] = useState<any | null>(null);
  const [showMaskedAccount, setShowMaskedAccount] = useState(false);

  // Withdrawals list & pagination state
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, perPage: 5, total: 0 });

  // General loading & Toast state
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Drawer Create Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | number>('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Payout Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<number | string | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    provider: 'bank',
    bankName: 'Techcombank – Ngân hàng TMCP Kỹ thương Việt Nam',
    accountName: '',
    accountNumber: '',
    branch: '',
    isDefault: true,
  });

  // OTP Verification Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);
  const [resendTimer, setResendTimer] = useState(60);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [pendingAccountPayload, setPendingAccountPayload] = useState<any>(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const formatVND = (amount: number | string | null | undefined) => {
    const num = Number(amount || 0);
    const safeNum = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat('vi-VN').format(safeNum) + 'đ';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // OTP Countdown timer effect
  useEffect(() => {
    if (!isOtpModalOpen) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => (prev > 0 ? prev - 1 : 0));
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpModalOpen]);

  // Fetch summary & default account
  const fetchSummaryAndAccounts = useCallback(async () => {
    try {
      const [summaryRes, accountsRes] = await Promise.allSettled([
        ApiService.getInstructorWithdrawalSummary(),
        ApiService.getInstructorPayoutAccounts()
      ]);

      if (summaryRes.status === 'fulfilled') {
        const resData = summaryRes.value?.data || summaryRes.value;
        if (resData && typeof resData === 'object') {
          setBalance({
            withdrawableBalance: Number(resData.available_balance ?? resData.available_revenue ?? 0),
            pendingWithdrawAmount: Number(resData.pending_withdraw_amount ?? 0),
            paidWithdrawAmount: Number(resData.paid_withdraw_amount ?? 0),
            rejectedWithdrawAmount: Number(resData.rejected_withdraw_amount ?? 0),
            pendingCount: Number(resData.pending_count ?? 0),
            paidCount: Number(resData.paid_count ?? 0),
            rejectedCount: Number(resData.rejected_count ?? 0),
            canCreateWithdrawal: Boolean(resData.can_create_withdrawal ?? true),
          });
        }
      }

      if (accountsRes.status === 'fulfilled') {
        const list = accountsRes.value?.data || accountsRes.value;
        if (Array.isArray(list)) {
          setPayoutAccounts(list);
          const defaultAcc = list.find((a: any) => a.is_default) || list[0] || null;
          setActivePayoutAccount(defaultAcc);
          if (defaultAcc) {
            setSelectedAccountId(defaultAcc.id);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch withdrawal summary/accounts:', err);
    }
  }, []);

  // Fetch withdrawals list with pagination
  const fetchWithdrawalsList = useCallback(async (page = 1) => {
    setLoadingList(true);
    try {
      const res = await ApiService.getInstructorWithdrawals({ page, per_page: meta.perPage });
      const items = res?.data || (Array.isArray(res) ? res : []);
      const paginationMeta = res?.meta || {};

      setWithdrawals(Array.isArray(items) ? items : []);
      setMeta({
        currentPage: paginationMeta.current_page || page,
        lastPage: paginationMeta.last_page || 1,
        perPage: paginationMeta.per_page || meta.perPage,
        total: paginationMeta.total || (Array.isArray(items) ? items.length : 0),
      });
    } catch (err) {
      console.warn('Failed to fetch withdrawals list:', err);
      setWithdrawals([]);
    } finally {
      setLoadingList(false);
    }
  }, [meta.perPage]);

  // Initial Load
  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await Promise.all([
        fetchSummaryAndAccounts(),
        fetchWithdrawalsList(1)
      ]);
      setLoading(false);
    };
    initLoad();
  }, [fetchSummaryAndAccounts, fetchWithdrawalsList]);

  // Handle amount change in drawer
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setWithdrawAmount(rawVal);
    setWithdrawError(null);
  };

  const setMaxAmount = () => {
    if (balance.withdrawableBalance > 0) {
      setWithdrawAmount(String(balance.withdrawableBalance));
      setWithdrawError(null);
    }
  };

  // Submit Withdrawal Request
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amountNum = Number(withdrawAmount);
    if (!amountNum || isNaN(amountNum)) {
      setWithdrawError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    if (amountNum < MINIMUM_WITHDRAWAL_AMOUNT) {
      setWithdrawError(`Số tiền rút tối thiểu là ${formatVND(MINIMUM_WITHDRAWAL_AMOUNT)}.`);
      return;
    }
    if (amountNum > balance.withdrawableBalance) {
      setWithdrawError('Số tiền rút không được vượt quá số dư có thể rút.');
      return;
    }
    if (!selectedAccountId) {
      setWithdrawError('Vui lòng chọn tài khoản nhận tiền.');
      return;
    }

    setIsSubmitting(true);
    setWithdrawError(null);

    try {
      await ApiService.createInstructorWithdrawal({
        amount: amountNum,
        payout_account_id: selectedAccountId,
        note: withdrawNote.trim() || undefined,
      });

      showToast('Gửi yêu cầu rút tiền thành công!');
      setWithdrawAmount('');
      setWithdrawNote('');
      
      // Refetch data without page reload
      await Promise.all([
        fetchSummaryAndAccounts(),
        fetchWithdrawalsList(1)
      ]);
    } catch (err: any) {
      setWithdrawError(err.message || 'Lỗi gửi yêu cầu rút tiền. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Pending Withdrawal Request
  const handleCancelWithdrawal = async (id: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu rút tiền này?')) return;

    setCancellingId(id);
    try {
      await ApiService.cancelInstructorWithdrawal(id);
      showToast('Đã hủy yêu cầu rút tiền thành công.');
      await Promise.all([
        fetchSummaryAndAccounts(),
        fetchWithdrawalsList(meta.currentPage)
      ]);
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy yêu cầu rút tiền.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // View Withdrawal Detail
  const handleViewDetail = async (id: number | string) => {
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await ApiService.getInstructorWithdrawal(id);
      setSelectedWithdrawal(res?.data || res);
    } catch (err: any) {
      showToast('Không thể tải chi tiết yêu cầu rút tiền.', 'error');
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Edit/Add Payout Account Modal
  const handleOpenAccountModal = (accountToEdit?: any) => {
    if (accountToEdit) {
      setEditingAccountId(accountToEdit.id);
      setAccountForm({
        provider: accountToEdit.provider || 'bank',
        bankName: accountToEdit.provider_label || 'Techcombank – Ngân hàng TMCP Kỹ thương Việt Nam',
        accountName: accountToEdit.account_name || '',
        accountNumber: accountToEdit.account_number || '',
        branch: accountToEdit.branch_name || 'Chi nhánh Hà Nội',
        isDefault: Boolean(accountToEdit.is_default),
      });
    } else {
      setEditingAccountId(null);
      setAccountForm({
        provider: 'bank',
        bankName: 'Techcombank – Ngân hàng TMCP Kỹ thương Việt Nam',
        accountName: '',
        accountNumber: '',
        branch: 'Chi nhánh Hà Nội',
        isDefault: payoutAccounts.length === 0,
      });
    }
    setIsAccountModalOpen(true);
  };

  // Step 1: Send OTP for Account Change
  const handleSaveAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.accountNumber.trim()) {
      showToast('Vui lòng nhập số tài khoản.', 'error');
      return;
    }
    if (!accountForm.accountName.trim()) {
      showToast('Vui lòng nhập tên chủ tài khoản.', 'error');
      return;
    }

    setSavingAccount(true);
    try {
      const payload = {
        provider: accountForm.provider,
        account_number: accountForm.accountNumber.trim(),
        account_name: accountForm.accountName.trim().toUpperCase(),
        branch_name: accountForm.branch.trim(),
        bank_name: accountForm.bankName,
      };

      setPendingAccountPayload(payload);

      const otpRes = await ApiService.sendInstructorPayoutAccountOtp(editingAccountId || 0, payload);
      const resData = otpRes?.data || otpRes;

      setMaskedEmail(resData?.masked_email || 'in****@mindhub.test');
      setOtpTimer(resData?.expires_in || 300);
      setResendTimer(resData?.resend_after || 60);
      setOtpCode('');
      setOtpError(null);

      setIsAccountModalOpen(false);
      setIsOtpModalOpen(true);
      showToast(otpRes?.message || 'Mã OTP đã được gửi đến email của bạn.');
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi mã OTP xác nhận.', 'error');
    } finally {
      setSavingAccount(false);
    }
  };

  // Step 2: Verify OTP & Apply Account Change
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingOtp) return;

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await ApiService.verifyInstructorPayoutAccountChange(editingAccountId || 0, otpCode.trim());
      const updatedAcc = res?.data || res;

      showToast('Cập nhật tài khoản nhận tiền thành công!');
      setIsOtpModalOpen(false);

      // Synchronously update local states
      if (updatedAcc && updatedAcc.id) {
        setPayoutAccounts(prev => {
          const list = prev.map(a => ({ ...a, is_default: false }));
          const idx = list.findIndex(a => Number(a.id) === Number(updatedAcc.id));
          if (idx >= 0) {
            list[idx] = updatedAcc;
          } else {
            list.unshift(updatedAcc);
          }
          return list;
        });
        setActivePayoutAccount(updatedAcc);
        setSelectedAccountId(updatedAcc.id);
      }

      // Background refetch
      await fetchSummaryAndAccounts();
    } catch (err: any) {
      setOtpError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSendingOtp || !pendingAccountPayload) return;
    setIsSendingOtp(true);
    try {
      const otpRes = await ApiService.sendInstructorPayoutAccountOtp(editingAccountId || 0, pendingAccountPayload);
      const resData = otpRes?.data || otpRes;
      setOtpTimer(resData?.expires_in || 300);
      setResendTimer(resData?.resend_after || 60);
      setOtpError(null);
      showToast('Đã gửi lại mã OTP đến email của bạn.');
    } catch (err: any) {
      setOtpError(err.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Computed drawer button validation
  const amountNum = Number(withdrawAmount);
  const canSubmitWithdrawal = 
    balance.withdrawableBalance > 0 &&
    amountNum >= MINIMUM_WITHDRAWAL_AMOUNT &&
    amountNum <= balance.withdrawableBalance &&
    Boolean(selectedAccountId) &&
    !isSubmitting;

  return (
    <div className="w-full text-left space-y-6 pb-12 font-sans bg-[#f8fafc] min-h-screen">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* HEADER TRANG */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Rút tiền</h1>
          <p className="text-xs font-medium text-[#737373] mt-1">Quản lý tài khoản nhận tiền và các yêu cầu rút tiền của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="p-2.5 rounded-xl bg-white border border-[#e7e8ed] text-[#595959] hover:bg-slate-50 transition-colors relative cursor-pointer shadow-sm">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          <button type="button" className="p-2.5 rounded-xl bg-white border border-[#e7e8ed] text-[#595959] hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BỐ CỤC CHÍNH 2 CỘT DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CỘT TRÁI (~70% WIDTH): SUMMARY CARDS + PAYOUT ACCOUNT + BANNER + TABLE */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 4 CARD TỔNG QUAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Số dư có thể rút */}
            <div className="bg-white rounded-2xl border border-[#e7e8ed] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-[#737373] flex items-center gap-1">
                    Số dư có thể rút <Info className="w-3 h-3 text-[#a3a3a3]" />
                  </span>
                  <div className="text-xl font-black text-blue-600 tracking-tight mt-0.5 truncate">
                    {formatVND(balance.withdrawableBalance)}
                  </div>
                  <span className="text-[10px] font-medium text-[#a3a3a3] block mt-0.5 truncate">Đã bao gồm phí nền tảng</span>
                </div>
              </div>
            </div>

            {/* Card 2: Đang chờ duyệt */}
            <div className="bg-white rounded-2xl border border-[#e7e8ed] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-[#737373] flex items-center gap-1">
                    Đang chờ duyệt <Info className="w-3 h-3 text-[#a3a3a3]" />
                  </span>
                  <div className="text-xl font-black text-amber-600 tracking-tight mt-0.5 truncate">
                    {formatVND(balance.pendingWithdrawAmount)}
                  </div>
                  <span className="text-[10px] font-medium text-[#a3a3a3] block mt-0.5 truncate">Tổng {balance.pendingCount} yêu cầu</span>
                </div>
              </div>
            </div>

            {/* Card 3: Đã thanh toán */}
            <div className="bg-white rounded-2xl border border-[#e7e8ed] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-[#737373] flex items-center gap-1">
                    Đã thanh toán <Info className="w-3 h-3 text-[#a3a3a3]" />
                  </span>
                  <div className="text-xl font-black text-emerald-600 tracking-tight mt-0.5 truncate">
                    {formatVND(balance.paidWithdrawAmount)}
                  </div>
                  <span className="text-[10px] font-medium text-[#a3a3a3] block mt-0.5 truncate">Tổng {balance.paidCount} giao dịch</span>
                </div>
              </div>
            </div>

            {/* Card 4: Bị từ chối */}
            <div className="bg-white rounded-2xl border border-[#e7e8ed] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-[#737373] flex items-center gap-1">
                    Bị từ chối <Info className="w-3 h-3 text-[#a3a3a3]" />
                  </span>
                  <div className="text-xl font-black text-rose-600 tracking-tight mt-0.5 truncate">
                    {formatVND(balance.rejectedWithdrawAmount)}
                  </div>
                  <span className="text-[10px] font-medium text-[#a3a3a3] block mt-0.5 truncate">Tổng {balance.rejectedCount} giao dịch</span>
                </div>
              </div>
            </div>

          </div>

          {/* CARD TÀI KHOẢN NHẬN TIỀN */}
          <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#e7e8ed]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-[#06091a]">Tài khoản nhận tiền</h2>
              </div>
              <button 
                type="button"
                onClick={() => handleOpenAccountModal(activePayoutAccount)}
                className="px-3.5 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-all text-xs cursor-pointer bg-white"
              >
                Cập nhật tài khoản nhận tiền
              </button>
            </div>

            {activePayoutAccount ? (
              <div className="flex items-start gap-4">
                {/* Bank Logo */}
                <div className="w-20 h-16 rounded-xl border border-[#e7e8ed] bg-slate-50 flex items-center justify-center shrink-0 p-2 text-center">
                  <span className="text-[10px] font-black tracking-wider text-rose-600 uppercase">TECHCOMBANK</span>
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-semibold text-[#121b4b] flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-[#737373] block uppercase tracking-wider">Ngân hàng</span>
                    <span className="font-bold text-[#06091a] text-xs block mt-0.5">{activePayoutAccount.provider_label || 'Techcombank – Ngân hàng TMCP Kỹ thương Việt Nam'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#737373] block uppercase tracking-wider">Số tài khoản</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-[#06091a] text-xs">
                        {showMaskedAccount 
                          ? (activePayoutAccount.account_number_masked ? activePayoutAccount.account_number_masked.replace(/\s+/g, '') : '******6789')
                          : (activePayoutAccount.account_number_masked || '1903 **** **** 6789')}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowMaskedAccount(prev => !prev)} 
                        className="text-[#999999] hover:text-[#06091a] p-0.5 rounded cursor-pointer"
                        title="Đổi kiểu che số tài khoản"
                      >
                        {showMaskedAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#737373] block uppercase tracking-wider">Chủ tài khoản</span>
                    <span className="font-bold text-[#06091a] text-xs block mt-0.5 uppercase">{activePayoutAccount.account_name || 'NGUYỄN VĂN A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#737373] block uppercase tracking-wider">Trạng thái xác minh</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                        Đã xác minh OTP
                      </span>
                      <span className="text-[#a3a3a3] text-[9.5px] font-medium">(Bảo mật email)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#737373] bg-slate-50 rounded-xl border border-dashed border-[#dbdde4] space-y-2">
                <p>Bạn chưa thiết lập tài khoản nhận tiền.</p>
                <button 
                  type="button"
                  onClick={() => handleOpenAccountModal()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs cursor-pointer"
                >
                  + Thêm tài khoản nhận tiền
                </button>
              </div>
            )}
          </div>

          {/* BANNER CHU KỲ CHUYỂN TIỀN */}
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/30 rounded-2xl border border-blue-100 p-4 text-xs font-semibold text-[#121b4b] flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-[#06091a] text-xs block">Lưu ý về chu kỳ thanh toán & rút tiền</span>
              <p className="text-[11px] text-[#737373] font-medium leading-relaxed">
                Yêu cầu rút tiền được chấp nhận từ ngày <strong className="text-[#06091a]">01 đến 25</strong> hằng tháng. Số tiền khả dụng sẽ được đối soát và giải ngân tự động sau khi ban quản trị phê duyệt.
              </p>
            </div>
          </div>

          {/* BẢNG LỊCH SỬ RÚT TIỀN */}
          <div className="bg-white rounded-2xl border border-[#e7e8ed] shadow-sm overflow-hidden space-y-3">
            <div className="p-4 border-b border-[#e7e8ed] flex justify-between items-center">
              <h3 className="text-sm font-black text-[#06091a]">Lịch sử yêu cầu rút tiền</h3>
              <span className="text-xs font-bold text-[#737373]">Tổng {meta.total} yêu cầu</span>
            </div>

            {loadingList ? (
              <div className="py-12 text-center text-xs text-[#737373] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Đang tải lịch sử rút tiền...</span>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#737373] space-y-1">
                <Wallet className="w-8 h-8 text-[#dbdde4] mx-auto" />
                <p className="font-bold text-[#06091a]">Chưa có yêu cầu rút tiền nào</p>
                <p className="text-[11px] text-[#a3a3a3]">Các giao dịch rút tiền của bạn sẽ được hiển thị tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#e7e8ed] text-[10px] uppercase font-extrabold text-[#737373] tracking-wider">
                      <th className="py-3 px-4">Mã YC</th>
                      <th className="py-3 px-4">Số tiền</th>
                      <th className="py-3 px-4">Tài khoản nhận (Snapshot)</th>
                      <th className="py-3 px-4">Ngày yêu cầu</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e8ed] font-medium text-[#121b4b]">
                    {withdrawals.map(w => (
                      <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{w.display_code || `#WR-${w.id}`}</td>
                        <td className="py-3.5 px-4 font-black text-[#06091a]">{formatVND(w.amount)}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#06091a]">{w.account?.account_name_snapshot || 'NGUYỄN VĂN A'}</div>
                          <div className="text-[10px] font-mono text-[#737373] mt-0.5">{w.account?.account_number_snapshot_masked || '1903 **** **** 6789'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#737373] font-medium">{formatDate(w.requested_at || w.created_at)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                            w.status === 'approved' || w.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : w.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {w.status_label || w.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button 
                            type="button"
                            onClick={() => handleViewDetail(w.id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            Chi tiết
                          </button>
                          {w.status === 'pending' && (
                            <button 
                              type="button"
                              disabled={cancellingId === w.id}
                              onClick={() => handleCancelWithdrawal(w.id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer disabled:opacity-50"
                            >
                              {cancellingId === w.id ? 'Đang hủy...' : 'Hủy'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {meta.lastPage > 1 && (
              <div className="p-4 border-t border-[#e7e8ed] flex justify-between items-center bg-slate-50/50 text-xs font-bold text-[#737373]">
                <span>Trang {meta.currentPage} / {meta.lastPage}</span>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    disabled={meta.currentPage === 1}
                    onClick={() => fetchWithdrawalsList(meta.currentPage - 1)}
                    className="p-1.5 border border-[#dbdde4] bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    disabled={meta.currentPage === meta.lastPage}
                    onClick={() => fetchWithdrawalsList(meta.currentPage + 1)}
                    className="p-1.5 border border-[#dbdde4] bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* CỘT PHẢI (~30% WIDTH): SIDE DRAWER TẠO YÊU CẦU RÚT TIỀN */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-sm space-y-4 sticky top-6">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#e7e8ed]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-[#06091a]">Tạo yêu cầu rút tiền</h2>
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              
              {/* Select Payout Account */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Tài khoản nhận tiền *</label>
                {payoutAccounts.length > 0 ? (
                  <select 
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-semibold text-xs text-[#06091a]"
                  >
                    {payoutAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.provider_label || 'Ngân hàng'} – {acc.account_number_masked || '1903 **** **** 6789'} ({acc.account_name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex justify-between items-center">
                    <span>Chưa có tài khoản nhận tiền</span>
                    <button type="button" onClick={() => handleOpenAccountModal()} className="text-blue-600 hover:underline">Thêm ngay</button>
                  </div>
                )}
              </div>

              {/* Input Số tiền rút */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-[#595959]">Số tiền rút (VND) *</label>
                  <button 
                    type="button" 
                    onClick={setMaxAmount}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Rút tối đa
                  </button>
                </div>
                <input 
                  type="text" 
                  value={withdrawAmount ? Number(withdrawAmount).toLocaleString('vi-VN') : ''}
                  onChange={handleAmountInputChange}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-sm text-[#06091a] bg-white"
                />
                <span className="text-[10px] text-[#a3a3a3] font-medium block">
                  Tối thiểu: {formatVND(MINIMUM_WITHDRAWAL_AMOUNT)}
                </span>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Ghi chú (Không bắt buộc)</label>
                <textarea 
                  value={withdrawNote}
                  onChange={e => setWithdrawNote(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="Nhập ghi chú cho yêu cầu rút tiền..."
                  className="w-full px-3.5 py-2 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-xs text-[#06091a] bg-white resize-none"
                />
                <div className="text-right">
                  <span className="text-[9px] text-[#a3a3a3] font-medium">
                    {withdrawNote.length}/200
                  </span>
                </div>
              </div>

              {/* Form Validation Error */}
              {withdrawError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {/* Lưu ý Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-[#dbdde4] text-[10px] leading-relaxed text-[#737373] space-y-1 font-medium">
                <p>• Yêu cầu rút tiền sẽ được admin duyệt trong vòng 1-3 ngày làm việc.</p>
                <p>• Sau khi duyệt, tiền sẽ được chuyển theo chu kỳ hằng tháng.</p>
                <p>• Vui lòng đảm bảo thông tin tài khoản nhận tiền chính xác.</p>
              </div>

              {/* Sticky Footer Actions */}
              <div className="pt-2 border-t border-[#e7e8ed] flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-bold bg-white text-xs text-center"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={!canSubmitWithdrawal}
                  className="flex-1 py-2.5 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm font-bold text-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

      {/* MODAL 1: THÊM / CẬP NHẬT TÀI KHOẢN NHẬN TIỀN */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button 
              type="button"
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">
                  {editingAccountId ? 'Cập nhật tài khoản nhận tiền' : 'Thêm tài khoản nhận tiền mới'}
                </h3>
                <p className="text-[11px] text-[#737373] font-medium">Nhập thông tin tài khoản ngân hàng (Yêu cầu xác thực OTP email)</p>
              </div>
            </div>

            <form onSubmit={handleSaveAccountSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Loại tài khoản / Ngân hàng *</label>
                <select 
                  value={accountForm.provider}
                  onChange={e => setAccountForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium text-xs text-[#06091a]"
                >
                  <option value="bank">Ngân hàng (Bank Transfer)</option>
                  <option value="momo">Ví MoMo</option>
                  <option value="zalopay">Ví ZaloPay</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Tên ngân hàng *</label>
                <input 
                  type="text" 
                  value={accountForm.bankName}
                  onChange={e => setAccountForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="Ví dụ: Techcombank"
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-xs text-[#06091a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Số tài khoản *</label>
                <input 
                  type="text" 
                  value={accountForm.accountNumber}
                  onChange={e => setAccountForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Nhập số tài khoản ngân hàng..."
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-xs text-[#06091a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Tên chủ tài khoản *</label>
                <input 
                  type="text" 
                  value={accountForm.accountName}
                  onChange={e => setAccountForm(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="NGUYEN VAN A (Viết hoa không dấu)"
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold text-xs text-[#06091a] uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Chi nhánh ngân hàng</label>
                <input 
                  type="text" 
                  value={accountForm.branch}
                  onChange={e => setAccountForm(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder="Chi nhánh Hà Nội..."
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-xs text-[#06091a]"
                />
              </div>

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={savingAccount}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                  Gửi mã OTP qua Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XÁC THỰC OTP EMAIL KHI THAY ĐỔI TÀI KHOẢN NHẬN TIỀN */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button 
              type="button"
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">
                  Xác thực OTP thay đổi tài khoản
                </h3>
                <p className="text-[11px] text-[#737373] font-medium">
                  Mã OTP đã được gửi đến email <span className="font-bold text-stone-900">{maskedEmail}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Mã OTP 6 chữ số *</label>
                <input 
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtpCode(val);
                    setOtpError(null);
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold text-center tracking-[0.5em] text-lg text-[#06091a] bg-slate-50/50"
                  autoFocus
                />
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[#737373] font-medium pt-1">
                <span>Hiệu lực còn lại: <strong className="text-emerald-700 font-mono">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong></span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || isSendingOtp}
                  onClick={handleResendOtp}
                  className="text-emerald-700 font-bold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {resendTimer > 0 ? `Gửi lại mã (${resendTimer}s)` : 'Gửi lại mã OTP'}
                </button>
              </div>

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isVerifyingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác minh & Áp dụng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM CHI TIẾT YÊU CẦU RÚT TIỀN */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button 
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">
                  Chi tiết yêu cầu {selectedWithdrawal?.display_code || `#WR-${selectedWithdrawal?.id}`}
                </h3>
                <p className="text-[11px] text-[#737373] font-medium">Thông tin xử lý giao dịch rút tiền</p>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-8 text-center text-xs text-[#737373] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Đang tải chi tiết...</span>
              </div>
            ) : selectedWithdrawal ? (
              <div className="space-y-4 text-xs font-semibold text-[#121b4b]">
                <div className="flex justify-between items-center py-2 border-b border-[#e7e8ed]">
                  <span className="text-[#737373]">Số tiền rút</span>
                  <span className="text-base font-black text-blue-600">{formatVND(selectedWithdrawal.amount)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#e7e8ed]">
                  <span className="text-[#737373]">Trạng thái</span>
                  <span className="font-bold text-[#06091a]">{selectedWithdrawal.status_label || selectedWithdrawal.status}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#e7e8ed]">
                  <span className="text-[#737373]">Ngày tạo yêu cầu</span>
                  <span className="font-bold text-[#06091a]">{formatDate(selectedWithdrawal.requested_at || selectedWithdrawal.created_at)}</span>
                </div>

                {selectedWithdrawal.paid_at && (
                  <div className="flex justify-between items-center py-2 border-b border-[#e7e8ed]">
                    <span className="text-[#737373]">Ngày hoàn tất chuyển tiền</span>
                    <span className="font-bold text-emerald-600">{formatDate(selectedWithdrawal.paid_at)}</span>
                  </div>
                )}

                <div className="py-2 border-b border-[#e7e8ed] space-y-1">
                  <span className="text-[#737373] block">Tài khoản nhận tiền (Snapshot)</span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-[#e7e8ed] font-bold text-[#06091a]">
                    <div>{selectedWithdrawal.account?.account_name_snapshot || 'NGUYỄN VĂN A'}</div>
                    <div className="text-[11px] font-mono text-[#737373] mt-0.5">{selectedWithdrawal.account?.account_number_snapshot_masked || '1903 **** **** 6789'}</div>
                  </div>
                </div>

                {selectedWithdrawal.rejected_reason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-1">
                    <span className="font-bold block">Lý do từ chối:</span>
                    <p className="font-medium text-[11px] leading-relaxed">{selectedWithdrawal.rejected_reason}</p>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
};
