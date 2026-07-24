import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Lock, Globe, Facebook, Linkedin, Youtube, 
  Bell, Settings, ShieldCheck, CreditCard, Sparkles, Key, Eye, EyeOff, HelpCircle,
  CheckCircle, XCircle, AlertTriangle, Shield, Check, Loader2,
  ChevronRight, Star, Camera, Landmark, Smartphone, Laptop, RefreshCw, X
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { INSTRUCTOR_PROFILE_MOCK } from '../../data/instructorProfileMock';

interface Props {
  currentUser: any;
  onUpdateUser?: (updated: any) => void;
}

export default function InstructorProfilePage({ currentUser, onUpdateUser }: Props) {
  // Parse initial tab from search params
  const getTabFromUrl = (): 'profile' | 'notifications' | 'settings' => {
    if (typeof window === 'undefined') return 'profile';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'notifications' || tab === 'settings') return tab;
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'settings'>(getTabFromUrl());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized with mock fallback by default
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.name || currentUser?.full_name || INSTRUCTOR_PROFILE_MOCK.fullName,
    email: currentUser?.email || INSTRUCTOR_PROFILE_MOCK.email,
    phone: currentUser?.phone || INSTRUCTOR_PROFILE_MOCK.phone,
    expertise: INSTRUCTOR_PROFILE_MOCK.expertise,
    bio: INSTRUCTOR_PROFILE_MOCK.bio,
    website: INSTRUCTOR_PROFILE_MOCK.website,
    facebook: INSTRUCTOR_PROFILE_MOCK.facebook,
    linkedin: INSTRUCTOR_PROFILE_MOCK.linkedin,
    youtube: INSTRUCTOR_PROFILE_MOCK.youtube,
    avatar: currentUser?.avatar || INSTRUCTOR_PROFILE_MOCK.avatar
  });

  // Settings & Security states
  const [emailNotify, setEmailNotify] = useState(INSTRUCTOR_PROFILE_MOCK.quickSettings.emailNotifications);
  const [smsAlerts, setSmsAlerts] = useState(INSTRUCTOR_PROFILE_MOCK.quickSettings.smsAlerts);
  
  // Password form states & show/hide password toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP Modal states
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Sessions state
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    show_social_links: true,
    allow_messages: true
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // System notifications list
  const [notificationsList, setNotificationsList] = useState<any[]>(INSTRUCTOR_PROFILE_MOCK.notifications);

  // Account status & payout
  const [accountStatusInfo, setAccountStatusInfo] = useState({
    status: INSTRUCTOR_PROFILE_MOCK.accountStatus.status,
    emailVerified: true,
    phoneVerified: true,
    policyCompliance: INSTRUCTOR_PROFILE_MOCK.accountStatus.policyCompliance,
    reputation: INSTRUCTOR_PROFILE_MOCK.accountStatus.reputation
  });

  // Bank account shortcut
  const [bankAccount, setBankAccount] = useState({
    bankName: INSTRUCTOR_PROFILE_MOCK.payoutShortcut.bankName,
    accountNumber: INSTRUCTOR_PROFILE_MOCK.payoutShortcut.accountNumber,
    isDefault: INSTRUCTOR_PROFILE_MOCK.payoutShortcut.isDefault
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync tab change with URL search params
  const handleTabChange = (newTab: 'profile' | 'notifications' | 'settings') => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Load Profile & Notifications
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getInstructorProfile(currentUser?.id);
        const data = res?.data || res;
        if (data) {
          const account = data.account || data;
          const profile = data.profile || data;
          const social = data.social_links || {};
          const settings = data.quick_settings || {};
          const verification = data.verification || {};
          const payout = data.payout_shortcut || {};

          setProfileForm({
            fullName: data.full_name || account.full_name || data.name || currentUser?.name || INSTRUCTOR_PROFILE_MOCK.fullName,
            email: data.email || account.email || currentUser?.email || INSTRUCTOR_PROFILE_MOCK.email,
            phone: data.phone || account.phone || currentUser?.phone || INSTRUCTOR_PROFILE_MOCK.phone,
            expertise: data.expertise || profile.expertise || INSTRUCTOR_PROFILE_MOCK.expertise,
            bio: data.bio || profile.bio || INSTRUCTOR_PROFILE_MOCK.bio,
            website: social.website || INSTRUCTOR_PROFILE_MOCK.website,
            facebook: social.facebook || INSTRUCTOR_PROFILE_MOCK.facebook,
            linkedin: social.linkedin || INSTRUCTOR_PROFILE_MOCK.linkedin,
            youtube: social.youtube || INSTRUCTOR_PROFILE_MOCK.youtube,
            avatar: data.avatar_url || data.avatar || currentUser?.avatar || INSTRUCTOR_PROFILE_MOCK.avatar
          });

          if (settings.email_notifications !== undefined) setEmailNotify(Boolean(settings.email_notifications));
          if (settings.sms_alerts !== undefined) setSmsAlerts(Boolean(settings.sms_alerts));

          const isPhoneVerified = Boolean(verification.phone_verified || data.phone || account.phone);

          setAccountStatusInfo(prev => ({
            ...prev,
            status: data.account_status || prev.status,
            emailVerified: verification.email_verified ?? prev.emailVerified,
            phoneVerified: isPhoneVerified,
            policyCompliance: data.policy_compliance || prev.policyCompliance,
            reputation: data.reputation_score ? `${data.reputation_score}/5` : prev.reputation
          }));

          if (payout.bank_name || payout.account_number) {
            setBankAccount({
              bankName: payout.bank_name || bankAccount.bankName,
              accountNumber: payout.account_number || bankAccount.accountNumber,
              isDefault: payout.isDefault ?? true
            });
          }
        }
      } catch (err) {
        console.warn('Failed to fetch instructor profile from API, fallback to current user context:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadNotifications = async () => {
      try {
        const notifRes = await ApiService.getInstructorNotifications();
        const items = notifRes?.data?.data || notifRes?.data || (Array.isArray(notifRes) ? notifRes : null);
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.slice(0, 8).map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            title: item.title || 'Thông báo hệ thống',
            desc: item.message || item.desc || '',
            time: item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
            type: item.type || 'policy'
          }));
          setNotificationsList(mapped);
        }
      } catch (err) {
        console.warn('Failed to load notifications from API:', err);
      }
    };

    loadProfile();
    loadNotifications();
  }, [currentUser]);

  // Load Sessions & Privacy settings
  useEffect(() => {
    const loadSessions = async () => {
      setLoadingSessions(true);
      try {
        const res = await ApiService.getInstructorSessions();
        const data = res?.data || res;
        if (Array.isArray(data)) {
          setSessionsList(data);
        }
      } catch (err) {
        console.warn('Failed to fetch sessions from API:', err);
      } finally {
        setLoadingSessions(false);
      }
    };

    const loadPrivacy = async () => {
      try {
        const res = await ApiService.getInstructorPrivacySettings();
        const data = res?.data || res;
        if (data) {
          setPrivacySettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Failed to fetch privacy settings from API:', err);
      }
    };

    if (activeTab === 'settings') {
      loadSessions();
      loadPrivacy();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      showToast('Họ và tên không được để trống.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await ApiService.updateInstructorProfile({
        full_name: profileForm.fullName,
        phone: profileForm.phone,
        expertise: profileForm.expertise,
        bio: profileForm.bio,
        social_links: {
          website: profileForm.website,
          facebook: profileForm.facebook,
          linkedin: profileForm.linkedin,
          youtube: profileForm.youtube
        }
      });
      
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          name: profileForm.fullName,
          full_name: profileForm.fullName,
          phone: profileForm.phone
        });
      }
      showToast('Cập nhật hồ sơ giảng viên thành công!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật hồ sơ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Dung lượng ảnh tối đa là 5MB.', 'error');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Định dạng ảnh không hợp lệ. Vui lòng chọn JPG, PNG hoặc WEBP.', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await ApiService.uploadInstructorAvatar(file);
      const newAvatarUrl = res?.data?.avatar_url || res?.data?.avatar || res?.avatar_url || res?.avatar;
      
      if (newAvatarUrl) {
        setProfileForm(prev => ({ ...prev, avatar: newAvatarUrl }));
        if (onUpdateUser) {
          onUpdateUser({
            ...currentUser,
            avatar: newAvatarUrl,
            avatar_url: newAvatarUrl
          });
        }
        showToast('Tải ảnh đại diện thành công!');
      } else {
        showToast('Tải ảnh đại diện hoàn tất.');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải ảnh đại diện.', 'error');
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleToggleEmailNotify = async () => {
    const nextVal = !emailNotify;
    setEmailNotify(nextVal);
    try {
      await ApiService.updateInstructorNotificationPreferences({ email_notifications: nextVal });
      showToast(`Đã ${nextVal ? 'bật' : 'tắt'} thông báo qua Email.`);
    } catch (err: any) {
      setEmailNotify(!nextVal);
      showToast(err.message || 'Lỗi cập nhật cài đặt thông báo.', 'error');
    }
  };

  const handleToggleSmsAlerts = async () => {
    if (!profileForm.phone || !profileForm.phone.trim()) {
      showToast('Bạn cần cập nhật số điện thoại trước khi bật SMS Alerts.', 'error');
      return;
    }
    const nextVal = !smsAlerts;
    setSmsAlerts(nextVal);
    try {
      await ApiService.updateInstructorNotificationPreferences({ sms_alerts: nextVal });
      showToast(`Đã ${nextVal ? 'bật' : 'tắt'} thông báo SMS.`);
    } catch (err: any) {
      setSmsAlerts(!nextVal);
      showToast(err.message || 'Lỗi cập nhật cài đặt SMS.', 'error');
    }
  };

  // Step 1: Submit password form to request Email OTP
  const handleRequestPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ thông tin mật khẩu.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu mới và xác nhận mật khẩu không khớp.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Mật khẩu mới phải có từ 8 ký tự trở lên.', 'error');
      return;
    }
    if (newPassword === currentPassword) {
      showToast('Mật khẩu mới không được trùng với mật khẩu hiện tại.', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await ApiService.sendChangePasswordOtp({
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword
      });

      const masked = res?.data?.masked_email || 'in****@mindhub.test';
      const countdown = res?.data?.resend_after || 60;

      setMaskedEmail(masked);
      setResendCountdown(countdown);
      setOtpCode('');
      setShowOtpModal(true);
      showToast(res.message || 'Mã OTP đã được gửi đến email của bạn.');
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi mã OTP xác minh.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setIsSendingOtp(true);
    setOtpError(null);
    try {
      const res = await ApiService.sendChangePasswordOtp({
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword
      });
      setResendCountdown(res?.data?.resend_after || 60);
      showToast(res.message || 'Đã gửi lại mã OTP mới đến email của bạn.');
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi lại mã OTP.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 3: Verify OTP and finalize Password Change
  const handleVerifyAndChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      setOtpError('Vui lòng nhập đúng 6 chữ số OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await ApiService.changeInstructorPassword({
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword,
        otp: cleanOtp
      });

      showToast('Đổi mật khẩu thành công!');
      setShowOtpModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
    } catch (err: any) {
      setOtpError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Revoke other active sessions
  const handleRevokeOtherSessions = async () => {
    setRevokingSessions(true);
    try {
      await ApiService.revokeOtherInstructorSessions();
      showToast('Đã đăng xuất thành công khỏi các thiết bị khác.');
      const res = await ApiService.getInstructorSessions();
      if (res?.data) setSessionsList(res.data);
    } catch (err: any) {
      showToast(err.message || 'Lỗi đăng xuất thiết bị khác.', 'error');
    } finally {
      setRevokingSessions(false);
    }
  };

  const [loadingPrivacyModal, setLoadingPrivacyModal] = useState(false);

  const handleOpenPrivacyModal = async () => {
    setShowPrivacyModal(true);
    setLoadingPrivacyModal(true);
    try {
      const res = await ApiService.getInstructorPrivacySettings();
      const data = res?.data || res;
      if (data) {
        setPrivacySettings({
          profile_visibility: data.profile_visibility || 'public',
          show_email: Boolean(data.show_email),
          show_phone: Boolean(data.show_phone),
          show_social_links: Boolean(data.show_social_links),
          allow_messages: Boolean(data.allow_messages ?? true)
        });
      }
    } catch (err: any) {
      showToast('Không thể tải tùy chọn quyền riêng tư.', 'error');
    } finally {
      setLoadingPrivacyModal(false);
    }
  };

  // Save Privacy Settings
  const handleSavePrivacy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (savingPrivacy) return;

    setSavingPrivacy(true);
    try {
      await ApiService.updateInstructorPrivacySettings({
        profile_visibility: privacySettings.profile_visibility,
        show_email: Boolean(privacySettings.show_email),
        show_phone: Boolean(privacySettings.show_phone),
        show_social_links: Boolean(privacySettings.show_social_links)
      });
      showToast('Cập nhật tùy chọn quyền riêng tư thành công!');
      setShowPrivacyModal(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu quyền riêng tư.', 'error');
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <div className="w-full text-left relative pb-12 instructor-profile-page">
      {/* Hidden file input for avatar upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/jpeg,image/png,image/webp" 
        onChange={handleAvatarFileSelect} 
        className="hidden" 
      />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* MODAL 1: OTP EMAIL VERIFICATION FOR PASSWORD CHANGE */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative overflow-hidden">
            <button 
              type="button"
              onClick={() => { setShowOtpModal(false); setOtpCode(''); setOtpError(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 text-[#007A64] rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">Xác minh OTP Email</h3>
                <p className="text-[11px] text-[#737373] font-medium">Bảo mật đổi mật khẩu 2 bước</p>
              </div>
            </div>

            <p className="text-xs text-[#595959] leading-relaxed mb-4">
              Hệ thống đã gửi mã OTP 6 chữ số tới địa chỉ email: <strong className="text-[#06091a] font-bold">{maskedEmail}</strong>. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác/spam).
            </p>

            <form onSubmit={handleVerifyAndChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Mã OTP (6 chữ số) *</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(null); }}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A64] bg-white font-mono font-black text-center text-xl tracking-[8px] text-[#06091a]"
                />
                {otpError && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {otpError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#737373] font-medium">Chưa nhận được mã?</span>
                <button 
                  type="button"
                  disabled={resendCountdown > 0 || isSendingOtp}
                  onClick={handleResendOtp}
                  className="text-[#007A64] font-bold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
                >
                  {isSendingOtp && <Loader2 className="w-3 h-3 animate-spin" />}
                  {resendCountdown > 0 ? `Gửi lại mã sau ${resendCountdown}s` : 'Gửi lại mã OTP'}
                </button>
              </div>

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => { setShowOtpModal(false); setOtpCode(''); setOtpError(null); }}
                  className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  className="px-5 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Xác nhận đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRIVACY SETTINGS MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button 
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">Tùy chọn quyền riêng tư</h3>
                <p className="text-[11px] text-[#737373] font-medium">Quản lý hiển thị thông tin cá nhân trên trang công khai</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-[#121b4b]">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Chế độ hiển thị hồ sơ</label>
                <select 
                  value={privacySettings.profile_visibility}
                  onChange={e => setPrivacySettings(prev => ({ ...prev, profile_visibility: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
                >
                  <option value="public">Công khai (Tất cả mọi người)</option>
                  <option value="students_only">Chỉ học viên đã đăng ký</option>
                  <option value="private">Riêng tư (Chỉ mình tôi)</option>
                </select>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-[#e7e8ed]">
                <div>
                  <span className="font-bold text-[#06091a] text-xs block">Hiển thị Email công khai</span>
                  <span className="font-medium text-[#737373] text-[10px] block mt-0.5">Cho phép hiển thị email cá nhân trên trang giảng viên</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setPrivacySettings(prev => ({ ...prev, show_email: !prev.show_email }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${privacySettings.show_email ? 'bg-[#007A64]' : 'bg-[#e7e8ed]'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${privacySettings.show_email ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-[#e7e8ed]">
                <div>
                  <span className="font-bold text-[#06091a] text-xs block">Hiển thị Số điện thoại</span>
                  <span className="font-medium text-[#737373] text-[10px] block mt-0.5">Cho phép người học xem số điện thoại liên hệ</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setPrivacySettings(prev => ({ ...prev, show_phone: !prev.show_phone }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${privacySettings.show_phone ? 'bg-[#007A64]' : 'bg-[#e7e8ed]'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${privacySettings.show_phone ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-[#e7e8ed]">
                <div>
                  <span className="font-bold text-[#06091a] text-xs block">Hiển thị Mạng xã hội</span>
                  <span className="font-medium text-[#737373] text-[10px] block mt-0.5">Hiển thị liên kết Facebook, LinkedIn, YouTube</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setPrivacySettings(prev => ({ ...prev, show_social_links: !prev.show_social_links }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${privacySettings.show_social_links ? 'bg-[#007A64]' : 'bg-[#e7e8ed]'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${privacySettings.show_social_links ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>
            </div>

            <div className="pt-5 border-t border-[#e7e8ed] flex gap-3 justify-end mt-4">
              <button 
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
              >
                Hủy
              </button>
              <button 
                type="button"
                disabled={savingPrivacy}
                onClick={handleSavePrivacy}
                className="px-5 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingPrivacy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Lưu quyền riêng tư
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-[#737373] font-medium mb-1">
          <span>Tài khoản</span>
          <span className="text-[#a3a3a3]">&gt;</span>
          <span className="text-[#06091a] font-bold">Trung tâm tài khoản</span>
        </div>
        <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Trung tâm tài khoản</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Main Tabs & Forms */}
        <div className="flex-1 w-full min-w-0 bg-white rounded-2xl border border-[#e7e8ed] shadow-sm overflow-hidden">
          
          {/* horizontal tab panel */}
          <div className="flex border-b border-[#e7e8ed] bg-slate-50/20 px-6">
            <button
              type="button"
              onClick={() => handleTabChange('profile')}
              className={`py-4 px-4 text-xs font-black uppercase border-b-2 transition-all cursor-pointer mr-6 ${
                activeTab === 'profile' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Hồ sơ giảng viên
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('notifications')}
              className={`py-4 px-4 text-xs font-black uppercase border-b-2 transition-all cursor-pointer mr-6 ${
                activeTab === 'notifications' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Thông báo
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('settings')}
              className={`py-4 px-4 text-xs font-black uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === 'settings' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Cài đặt
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-[#06091a] text-sm font-black uppercase tracking-wider mb-6 pb-2 border-b border-[#e7e8ed]">
                  Thông tin cá nhân
                </h2>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Left Column inside Card: Avatar upload */}
                  <div className="w-full md:w-44 shrink-0 flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <img 
                        src={profileForm.avatar} 
                        alt="avatar" 
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" 
                      />
                      <button 
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 bg-white border border-[#dbdde4] p-1.5 rounded-full shadow hover:bg-slate-50 cursor-pointer text-[#595959] disabled:opacity-50"
                      >
                        {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin text-[#007A64]" /> : <Camera className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed mb-3">
                      JPG, PNG hoặc WEBP.<br />Tối đa 5MB.
                    </p>
                    <button 
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 border border-[#dbdde4] text-[#121b4b] hover:bg-[#e7e8ed] text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 justify-center"
                    >
                      {uploadingAvatar && <Loader2 className="w-3 h-3 animate-spin text-[#007A64]" />}
                      {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}
                    </button>
                  </div>

                  {/* Right Column inside Card: Form Fields */}
                  <form onSubmit={handleSaveProfile} className="flex-1 w-full space-y-4 text-xs font-semibold text-[#121b4b]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Họ và tên */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Họ và tên *</label>
                        <input 
                          required
                          type="text" 
                          name="fullName"
                          value={profileForm.fullName} 
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>

                      {/* Email Readonly with lock icon */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Email *</label>
                        <div className="relative">
                          <input 
                            readOnly
                            type="email" 
                            value={profileForm.email} 
                            className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl bg-slate-50 font-medium text-[#737373] cursor-not-allowed pr-10" 
                          />
                          <Lock className="w-4 h-4 text-[#a3a3a3] absolute right-3.5 top-3" />
                        </div>
                      </div>

                      {/* Số điện thoại */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Số điện thoại</label>
                        <input 
                          type="text" 
                          name="phone"
                          value={profileForm.phone} 
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>

                      {/* Lĩnh vực chuyên môn */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Lĩnh vực chuyên môn</label>
                        <input 
                          type="text" 
                          name="expertise"
                          value={profileForm.expertise} 
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>
                    </div>

                    {/* Tiểu sử */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Giới thiệu bản thân / Tiểu sử</label>
                      <textarea 
                        rows={4}
                        name="bio"
                        value={profileForm.bio} 
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] leading-relaxed resize-y" 
                      />
                    </div>

                    {/* Mạng xã hội */}
                    <div className="pt-4 border-t border-[#e7e8ed] space-y-3">
                      <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider">Liên kết mạng xã hội</h3>

                      {/* Website */}
                      <div className="flex gap-2">
                        <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50/50 flex justify-between items-center text-[#737373]">
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#007A64]" /> Website</span>
                          <span className="text-[8px]">▼</span>
                        </div>
                        <input 
                          type="url" 
                          name="website"
                          value={profileForm.website} 
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                          className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>

                      {/* Facebook */}
                      <div className="flex gap-2">
                        <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50/50 flex justify-between items-center text-[#737373]">
                          <span className="flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook</span>
                          <span className="text-[8px]">▼</span>
                        </div>
                        <input 
                          type="url" 
                          name="facebook"
                          value={profileForm.facebook} 
                          onChange={handleInputChange}
                          placeholder="https://facebook.com/user"
                          className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>

                      {/* LinkedIn */}
                      <div className="flex gap-2">
                        <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50/50 flex justify-between items-center text-[#737373]">
                          <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn</span>
                          <span className="text-[8px]">▼</span>
                        </div>
                        <input 
                          type="url" 
                          name="linkedin"
                          value={profileForm.linkedin} 
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/user"
                          className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>

                      {/* YouTube */}
                      <div className="flex gap-2">
                        <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50/50 flex justify-between items-center text-[#737373]">
                          <span className="flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube</span>
                          <span className="text-[8px]">▼</span>
                        </div>
                        <input 
                          type="url" 
                          name="youtube"
                          value={profileForm.youtube} 
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/@channel"
                          className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>
                    </div>

                    {/* Submit buttons */}
                    <div className="pt-5 border-t border-[#e7e8ed] flex justify-end gap-3">
                      <button 
                        type="button" 
                        onClick={() => showToast('Mọi thay đổi chưa lưu đã bị hủy.')}
                        className="px-6 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-bold bg-white"
                      >
                        Lưu thay đổi
                      </button>
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white rounded-xl transition-all shadow-sm cursor-pointer font-bold disabled:opacity-50"
                      >
                        {saving ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-[#06091a] text-sm font-black uppercase tracking-wider border-b border-[#e7e8ed] pb-2">
                  Thông báo hệ thống
                </h2>
                <div className="divide-y divide-[#e7e8ed]">
                  {notificationsList.map(n => {
                    let icon = <Bell className="w-4 h-4" />;
                    let colorClass = "text-amber-600 bg-amber-50";
                    if (n.type === 'payout') {
                      icon = <CreditCard className="w-4 h-4 text-emerald-600" />;
                      colorClass = "text-emerald-600 bg-emerald-50";
                    } else if (n.type === 'review') {
                      icon = <User className="w-4 h-4 text-blue-600" />;
                      colorClass = "text-blue-600 bg-blue-50";
                    } else if (n.type === 'trend') {
                      icon = <Sparkles className="w-4 h-4 text-purple-600" />;
                      colorClass = "text-purple-600 bg-purple-50";
                    }
                    return (
                      <div key={n.id} className="py-4 first:pt-0 flex items-start gap-4 text-xs font-semibold">
                        <div className={`p-2.5 rounded-xl shrink-0 ${colorClass}`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-[#06091a]">{n.title}</h4>
                            <span className="text-[10px] text-[#737373]">{n.time}</span>
                          </div>
                          <p className="text-[#595959] font-medium mt-1 leading-relaxed">{n.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-[#06091a] text-sm font-black uppercase tracking-wider border-b border-[#e7e8ed] pb-2">
                  Đổi mật khẩu bảo mật
                </h2>
                
                {/* 2-Step Password Form with Show/Hide Password toggles */}
                <form onSubmit={handleRequestPasswordOtp} className="space-y-4 text-xs font-semibold max-w-md text-[#121b4b]">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#595959]">Mật khẩu hiện tại *</label>
                    <div className="relative">
                      <input 
                        required
                        type={showCurrentPassword ? "text" : "password"} 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-3 text-[#737373] hover:text-[#06091a] cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#595959]">Mật khẩu mới *</label>
                    <div className="relative">
                      <input 
                        required
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-[#737373] hover:text-[#06091a] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#595959]">Xác nhận mật khẩu mới *</label>
                    <div className="relative">
                      <input 
                        required
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3 text-[#737373] hover:text-[#06091a] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSendingOtp || !currentPassword || !newPassword || !confirmPassword}
                      className="px-5 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white rounded-xl transition-all shadow-sm font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                      Gửi mã OTP qua Email
                    </button>
                  </div>
                </form>

                {/* Real Active Login Sessions */}
                <div className="pt-6 border-t border-[#e7e8ed] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black text-[#06091a] uppercase tracking-wider">Phiên đăng nhập hiện tại</h3>
                      <p className="text-[11px] text-[#737373] font-medium mt-0.5">Danh sách các thiết bị đang đăng nhập tài khoản của bạn</p>
                    </div>
                    {sessionsList.length > 1 && (
                      <button
                        type="button"
                        disabled={revokingSessions}
                        onClick={handleRevokeOtherSessions}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        {revokingSessions ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        Đăng xuất các thiết bị khác
                      </button>
                    )}
                  </div>

                  {loadingSessions ? (
                    <div className="p-6 text-center text-[#737373] text-xs font-medium bg-slate-50 rounded-xl">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#007A64] mb-2" />
                      Đang tải danh sách phiên đăng nhập...
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {(sessionsList.length > 0 ? sessionsList : [
                        {
                          id: 'current',
                          device: 'Chrome Browser',
                          platform: 'Windows 11',
                          ip_address: '127.0.0.1',
                          last_activity_at: 'Vừa hoạt động xong',
                          is_current: true
                        }
                      ]).map(session => (
                        <div key={session.id} className="p-4 bg-slate-50 rounded-xl border border-[#dbdde4] flex justify-between items-center text-xs">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg border border-[#e7e8ed] text-[#007A64] shrink-0 mt-0.5">
                              {session.platform?.toLowerCase().includes('android') || session.platform?.toLowerCase().includes('ios') ? (
                                <Smartphone className="w-4 h-4" />
                              ) : (
                                <Laptop className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#06091a]">{session.device} ({session.platform})</p>
                              <p className="text-[10px] text-[#737373] mt-0.5 font-medium">
                                IP: {session.ip_address || '127.0.0.1'} • {session.is_current ? 'Vừa hoạt động xong' : session.last_activity_at}
                              </p>
                            </div>
                          </div>
                          {session.is_current ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-250 px-2.5 py-0.5 rounded-lg shrink-0">
                              Thiết bị này
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#737373] font-medium shrink-0">
                              Đã đăng nhập
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Sidebar cards */}
        <div className="w-full lg:w-[330px] xl:w-[360px] shrink-0 space-y-4">
          
          {/* Card 1: Thông báo hệ thống gần đây */}
          <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e7e8ed]">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider">Thông báo hệ thống gần đây</h3>
              <button 
                type="button"
                onClick={() => handleTabChange('notifications')}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold text-[#121b4b]">
              {notificationsList.map(n => {
                let iconBg = "bg-emerald-50 text-emerald-600";
                let icon = <CreditCard className="w-4 h-4" />;
                if (n.type === 'review') {
                  iconBg = "bg-blue-50 text-blue-600";
                  icon = <User className="w-4 h-4" />;
                } else if (n.type === 'trend') {
                  iconBg = "bg-purple-50 text-purple-600";
                  icon = <Sparkles className="w-4 h-4" />;
                } else if (n.type === 'policy') {
                  iconBg = "bg-amber-50 text-amber-600";
                  icon = <Bell className="w-4 h-4" />;
                }
                return (
                  <div key={n.id} className="flex gap-3">
                    <div className={`p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center ${iconBg}`}>
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-[#06091a] text-[11px] truncate leading-tight">{n.title}</h4>
                        <span className="text-[#a3a3a3] text-[9.5px] font-medium shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[#737373] font-medium text-[9.5px] leading-relaxed mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Cài đặt nhanh */}
          <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider pb-2 border-b border-[#e7e8ed]">
              Cài đặt nhanh
            </h3>
            
            <div className="space-y-4 text-xs font-bold text-[#121b4b]">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#737373] mt-0.5" />
                  <div>
                    <span className="font-bold text-[#06091a] text-[11px] block">Thông báo qua Email</span>
                    <span className="font-medium text-[#737373] text-[9.5px] leading-relaxed block mt-0.5">Nhận thông báo về khóa học, học viên và thanh toán.</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleToggleEmailNotify}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer mt-0.5 shrink-0 ${emailNotify ? 'bg-[#007A64]' : 'bg-[#e7e8ed]'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${emailNotify ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>

              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#737373] mt-0.5" />
                  <div>
                    <span className="font-bold text-[#06091a] text-[11px] block">SMS Alerts</span>
                    <span className="font-medium text-[#737373] text-[9.5px] leading-relaxed block mt-0.5">Nhận SMS cho các thông báo quan trọng.</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleToggleSmsAlerts}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer mt-0.5 shrink-0 ${smsAlerts ? 'bg-[#007A64]' : 'bg-[#e7e8ed]'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${smsAlerts ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>

              <button 
                type="button"
                onClick={() => handleTabChange('settings')}
                className="w-full text-left py-2 border-t border-[#e7e8ed] flex justify-between items-center font-bold text-[#121b4b] hover:text-[#007A64] cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[#06091a] text-[11px] font-bold">
                  <Lock className="w-4 h-4 text-[#737373]" />
                  <div>
                    <span className="block">Đổi mật khẩu</span>
                    <span className="block text-[9.5px] text-[#737373] font-medium mt-0.5">Cập nhật mật khẩu để bảo vệ tài khoản.</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#999999]" />
              </button>

              <button 
                type="button"
                onClick={handleOpenPrivacyModal}
                className="w-full text-left py-2 border-t border-[#e7e8ed] flex justify-between items-center font-bold text-[#121b4b] hover:text-[#007A64] cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[#06091a] text-[11px] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#737373]" />
                  <div>
                    <span className="block">Tùy chọn quyền riêng tư</span>
                    <span className="block text-[9.5px] text-[#737373] font-medium mt-0.5">Quản lý thông tin hiển thị trên hồ sơ công khai.</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#999999]" />
              </button>
            </div>
          </div>

          {/* Card 3: Trạng thái tài khoản */}
          <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed]">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider">Trạng thái tài khoản</h3>
              <span className="inline-flex items-center bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">
                {accountStatusInfo.status}
              </span>
            </div>
            
            <div className="space-y-3 text-xs font-bold text-[#121b4b]">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Xác minh email
                </span>
                <span className="text-[#06091a] text-[11px] font-bold">
                  {accountStatusInfo.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Xác minh số điện thoại
                </span>
                <span className="text-[#06091a] text-[11px] font-bold">
                  {accountStatusInfo.phoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Tuân thủ chính sách
                </span>
                <span className="text-emerald-600 font-bold">{accountStatusInfo.policyCompliance}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Điểm uy tín
                </span>
                <span className="text-[#06091a] font-bold flex items-center gap-1">
                  {accountStatusInfo.reputation} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#e7e8ed]">
              <button 
                type="button"
                onClick={() => showToast('Trạng thái tài khoản đang hoạt động bình thường.')}
                className="text-[11px] font-bold text-[#007A64] hover:underline cursor-pointer block text-left"
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          {/* Card 4: Lối tắt tài khoản nhận tiền */}
          <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider pb-2 border-b border-[#e7e8ed]">
              Lối tắt tài khoản nhận tiền
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-[#dbdde4] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-[#e7e8ed] rounded-xl shrink-0">
                  <Landmark className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <p className="font-black text-[#06091a] text-[11px] leading-tight">{bankAccount.bankName}</p>
                  <p className="text-[10px] text-[#737373] font-medium mt-1">{bankAccount.accountNumber}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <span className="inline-flex items-center bg-emerald-50 text-emerald-700 font-bold border border-emerald-250 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                  Mặc định
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => showToast('Vui lòng quản lý tài khoản trong trang Rút tiền.')}
              className="w-full py-2.5 border border-dashed border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-[10px] font-black rounded-xl transition-colors cursor-pointer block text-center uppercase tracking-wider"
            >
              + Thêm tài khoản
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
