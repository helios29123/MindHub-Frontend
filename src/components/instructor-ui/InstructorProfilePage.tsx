import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Lock, Globe, Facebook, Linkedin, Youtube, 
  Bell, Settings, ShieldCheck, CreditCard, Sparkles, Key, Eye, HelpCircle,
  CheckCircle, XCircle, AlertTriangle, Shield, Check, Loader2,
  ChevronRight, Star, Camera, Landmark
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { INSTRUCTOR_PROFILE_MOCK } from '../../data/instructorProfileMock';

interface Props {
  currentUser: any;
  onUpdateUser?: (updated: any) => void;
}

export default function InstructorProfilePage({ currentUser, onUpdateUser }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'settings'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states initialized with mock fallback by default
  const [profileForm, setProfileForm] = useState({
    fullName: INSTRUCTOR_PROFILE_MOCK.fullName,
    email: INSTRUCTOR_PROFILE_MOCK.email,
    phone: INSTRUCTOR_PROFILE_MOCK.phone,
    expertise: INSTRUCTOR_PROFILE_MOCK.expertise,
    bio: INSTRUCTOR_PROFILE_MOCK.bio,
    website: INSTRUCTOR_PROFILE_MOCK.website,
    facebook: INSTRUCTOR_PROFILE_MOCK.facebook,
    linkedin: INSTRUCTOR_PROFILE_MOCK.linkedin,
    youtube: INSTRUCTOR_PROFILE_MOCK.youtube,
    avatar: INSTRUCTOR_PROFILE_MOCK.avatar
  });

  // Settings states
  const [emailNotify, setEmailNotify] = useState(INSTRUCTOR_PROFILE_MOCK.quickSettings.emailNotifications);
  const [smsAlerts, setSmsAlerts] = useState(INSTRUCTOR_PROFILE_MOCK.quickSettings.smsAlerts);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Bank account shortcut
  const [bankAccount, setBankAccount] = useState({
    bankName: INSTRUCTOR_PROFILE_MOCK.payoutShortcut.bankName,
    accountNumber: INSTRUCTOR_PROFILE_MOCK.payoutShortcut.accountNumber,
    isDefault: INSTRUCTOR_PROFILE_MOCK.payoutShortcut.isDefault
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getInstructorProfile(currentUser?.id);
        if (res) {
          // Check if API returns empty/incomplete data
          const data = res.data || res;
          const hasRealData = data.name || data.fullName || data.email;
          
          if (hasRealData) {
            setProfileForm(prev => ({
              ...prev,
              fullName: data.name || data.fullName || prev.fullName,
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
              expertise: data.expertise || prev.expertise,
              bio: data.bio || prev.bio,
              website: data.website || prev.website,
              facebook: data.facebook || prev.facebook,
              linkedin: data.linkedin || prev.linkedin,
              youtube: data.youtube || prev.youtube,
              avatar: data.avatar || prev.avatar
            }));
          } else {
            // Empty data - use mock
            useMockData();
          }
        } else {
          useMockData();
        }
      } catch (err) {
        console.error('Failed to load profile data, using mock fallback', err);
        useMockData();
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      setProfileForm({
        fullName: INSTRUCTOR_PROFILE_MOCK.fullName,
        email: INSTRUCTOR_PROFILE_MOCK.email,
        phone: INSTRUCTOR_PROFILE_MOCK.phone,
        expertise: INSTRUCTOR_PROFILE_MOCK.expertise,
        bio: INSTRUCTOR_PROFILE_MOCK.bio,
        website: INSTRUCTOR_PROFILE_MOCK.website,
        facebook: INSTRUCTOR_PROFILE_MOCK.facebook,
        linkedin: INSTRUCTOR_PROFILE_MOCK.linkedin,
        youtube: INSTRUCTOR_PROFILE_MOCK.youtube,
        avatar: INSTRUCTOR_PROFILE_MOCK.avatar
      });
    };

    if (currentUser?.id) {
      loadProfile();
    } else {
      useMockData();
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName) {
      showToast('Họ và tên không được để trống.', 'error');
      return;
    }

    setSaving(true);
    try {
      await ApiService.updateInstructorProfile({
        name: profileForm.fullName,
        phone: profileForm.phone,
        expertise: profileForm.expertise,
        bio: profileForm.bio,
        website: profileForm.website,
        facebook: profileForm.facebook,
        linkedin: profileForm.linkedin,
        youtube: profileForm.youtube
      });
      
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          name: profileForm.fullName,
          phone: profileForm.phone
        });
      }
      showToast('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật hồ sơ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ các trường mật khẩu.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Mật khẩu mới phải có từ 8 ký tự trở lên.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 850)); // mock api latency
      showToast('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Lỗi đổi mật khẩu.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full text-left relative pb-12 instructor-profile-page">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
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
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-4 text-xs font-black uppercase border-b-2 transition-all cursor-pointer mr-6 ${
                activeTab === 'profile' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Hồ sơ giảng viên
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-4 text-xs font-black uppercase border-b-2 transition-all cursor-pointer mr-6 ${
                activeTab === 'notifications' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Thông báo
            </button>
            <button
              onClick={() => setActiveTab('settings')}
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
                        onClick={() => showToast('Tính năng đổi ảnh đại diện sẽ hoạt động trên môi trường production.')}
                        className="absolute bottom-1 right-1 bg-white border border-[#dbdde4] p-1.5 rounded-full shadow hover:bg-slate-50 cursor-pointer text-[#595959]"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed mb-3">
                      JPG, PNG hoặc WEBP.<br />Tối đa 5MB.
                    </p>
                    <button 
                      type="button"
                      onClick={() => showToast('Tính năng tải ảnh lên đang sẵn sàng.')}
                      className="px-4 py-1.5 border border-[#dbdde4] text-[#121b4b] hover:bg-[#e7e8ed] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Đổi ảnh
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
                            name="email"
                            value={profileForm.email} 
                            className="w-full pl-3.5 pr-10 py-2.5 border border-[#dbdde4] rounded-xl bg-slate-50 text-[#737373] font-medium cursor-not-allowed" 
                          />
                          <Lock className="w-3.5 h-3.5 text-[#999999] absolute right-3.5 top-3.5" />
                        </div>
                        <p className="text-[10px] text-[#737373] font-medium mt-0.5">Email không thể thay đổi.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Số điện thoại */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Số điện thoại *</label>
                        <input 
                          required
                          type="text" 
                          name="phone"
                          value={profileForm.phone} 
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                        />
                      </div>

                      {/* Chuyên môn select dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Chuyên môn *</label>
                        <select 
                          name="expertise"
                          value={profileForm.expertise} 
                          onChange={(e: any) => setProfileForm(prev => ({ ...prev, expertise: e.target.value }))}
                          className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] cursor-pointer"
                        >
                          <option value="Lập trình Web">Lập trình Web</option>
                          <option value="Thiết kế UI/UX">Thiết kế UI/UX</option>
                          <option value="Marketing Digital">Marketing Digital</option>
                          <option value="Khoa học dữ liệu">Khoa học dữ liệu</option>
                        </select>
                      </div>
                    </div>

                    {/* Giới thiệu bản thân */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">Giới thiệu bản thân *</label>
                      <div className="relative">
                        <textarea 
                          required
                          name="bio"
                          value={profileForm.bio} 
                          onChange={handleInputChange}
                          maxLength={500}
                          rows={4}
                          className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] leading-relaxed" 
                        />
                        <span className="absolute bottom-2.5 right-3 text-[10px] text-[#737373]">
                          {profileForm.bio.length}/500
                        </span>
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="pt-4 border-t border-[#e7e8ed] space-y-3">
                      <h3 className="text-[10px] uppercase font-bold text-[#06091a] tracking-wider">Liên kết mạng xã hội</h3>
                      
                      {/* Website */}
                      <div className="flex gap-2">
                        <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50/50 flex justify-between items-center text-[#737373]">
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Website</span>
                          <span className="text-[8px]">▼</span>
                        </div>
                        <input 
                          type="url" 
                          name="website"
                          value={profileForm.website} 
                          onChange={handleInputChange}
                          placeholder="https://website.com"
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
                  {INSTRUCTOR_PROFILE_MOCK.notifications.map(n => {
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
                
                <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold max-w-md text-[#121b4b]">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#595959]">Mật khẩu hiện tại</label>
                    <input 
                      required
                      type="password" 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#595959]">Mật khẩu mới</label>
                    <input 
                      required
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#595959]">Xác nhận mật khẩu mới</label>
                    <input 
                      required
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]" 
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="px-5 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white rounded-xl transition-all shadow-sm font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                      Đổi mật khẩu
                    </button>
                  </div>
                </form>

                {/* Login sessions */}
                <div className="pt-6 border-t border-[#e7e8ed] space-y-3">
                  <h3 className="text-xs font-black text-[#06091a] uppercase tracking-wider">Phiên đăng nhập hiện tại</h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-[#dbdde4] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#06091a]">Chrome Browser (Windows 11)</p>
                      <p className="text-[10px] text-[#737373] mt-0.5 font-medium">IP: 192.168.1.5 • Vừa hoạt động xong</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-250 px-2.5 py-0.5 rounded-lg">
                      Thiết bị này
                    </span>
                  </div>
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
                onClick={() => setActiveTab('notifications')}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold text-[#121b4b]">
              {INSTRUCTOR_PROFILE_MOCK.notifications.map(n => {
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
                  onClick={() => setEmailNotify(!emailNotify)}
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
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer mt-0.5 shrink-0 ${smsAlerts ? 'bg-[#007A64]' : 'bg-[#e7e8ed]'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${smsAlerts ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>

              <button 
                onClick={() => setActiveTab('settings')}
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
                onClick={() => showToast('Chức năng Tùy chọn quyền riêng tư đang phát triển.')}
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
                {INSTRUCTOR_PROFILE_MOCK.accountStatus.status}
              </span>
            </div>
            
            <div className="space-y-3 text-xs font-bold text-[#121b4b]">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Xác minh email
                </span>
                <span className="text-[#06091a] text-[11px] font-bold">Đã xác minh</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Xác minh số điện thoại
                </span>
                <span className="text-[#06091a] text-[11px] font-bold">Đã xác minh</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Tuân thủ chính sách
                </span>
                <span className="text-emerald-600 font-bold">Tốt</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[#737373] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Điểm uy tín
                </span>
                <span className="text-[#06091a] font-bold flex items-center gap-1">
                  {INSTRUCTOR_PROFILE_MOCK.accountStatus.reputation} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#e7e8ed]">
              <button 
                onClick={() => showToast('Đang mở chi tiết trạng thái tài khoản.')}
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
              onClick={() => showToast('Vui lòng thêm tài khoản trong trang Rút tiền.')}
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
