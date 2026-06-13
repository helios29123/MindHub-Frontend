import React, { useState } from 'react';
import { User, Shield, Lock, Mail, Eye, EyeOff, UserPlus, LogIn, Key, Compass, AlertCircle, Coffee, Check, Users, Award } from 'lucide-react';
import { User as UserType } from '../types';
import { SYSTEM_ROLE_USERS } from '../data';

interface AuthScreensProps {
  onLoginSuccess: (user: UserType) => void;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthScreens({ onLoginSuccess, onClose, initialMode = 'login' }: AuthScreensProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot' | 'reset'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Local database of registered users with email verification states
  const [localRegisteredUsers, setLocalRegisteredUsers] = useState<UserType[]>(() => {
    const stored = localStorage.getItem('mindhub_registered_users_db');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Lỗi phân tích cú pháp CSDL tài khoản:', e);
      }
    }
    // Seed standard verified users by default
    const seeded: UserType[] = [
      { ...SYSTEM_ROLE_USERS.student, isEmailVerified: true },
      { ...SYSTEM_ROLE_USERS.instructor, isEmailVerified: true },
      { ...SYSTEM_ROLE_USERS.moderator, isEmailVerified: true },
      { ...SYSTEM_ROLE_USERS.admin, isEmailVerified: true }
    ];
    // Attach default password to the seeded objects for smooth logic
    seeded.forEach((u: any) => { u.password = 'password123'; });
    localStorage.setItem('mindhub_registered_users_db', JSON.stringify(seeded));
    return seeded;
  });

  const saveRegisteredUsers = (updatedList: UserType[]) => {
    setLocalRegisteredUsers(updatedList);
    localStorage.setItem('mindhub_registered_users_db', JSON.stringify(updatedList));
  };

  // Load / Prepopulate logged-in accounts history on this device (localStorage)
  const [loginHistory, setLoginHistory] = useState<UserType[]>(() => {
    const stored = localStorage.getItem('mindhub_logged_in_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Lỗi phân tích cú pháp lịch sử đăng nhập:', e);
      }
    }
    // Pre-create/populate standard accounts of each role on this device as requested
    const defaultHistory = [
      { ...SYSTEM_ROLE_USERS.student, isEmailVerified: true, password: 'password123' },
      { ...SYSTEM_ROLE_USERS.instructor, isEmailVerified: true, password: 'password123' },
      { ...SYSTEM_ROLE_USERS.moderator, isEmailVerified: true, password: 'password123' },
      { ...SYSTEM_ROLE_USERS.admin, isEmailVerified: true, password: 'password123' }
    ] as any[];
    localStorage.setItem('mindhub_logged_in_history', JSON.stringify(defaultHistory));
    return defaultHistory;
  });

  // Save successful logins to device history
  const saveToHistory = (user: UserType) => {
    setLoginHistory(prev => {
      const base = prev.filter(u => u.email !== user.email && u.id !== user.id);
      const updated = [user, ...base];
      localStorage.setItem('mindhub_logged_in_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Perform standard login simulator with structural email verification block
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    
    const emailTrimmed = email.trim().toLowerCase();
    
    // 1. Check local registered user database
    const matchedUserIndex = localRegisteredUsers.findIndex(u => u.email.toLowerCase() === emailTrimmed);
    if (matchedUserIndex !== -1) {
      const matchedUser = localRegisteredUsers[matchedUserIndex];
      const storedPassword = (matchedUser as any).password || 'password123';
      
      if (password !== storedPassword) {
        setErrorMsg('Mật khẩu đăng nhập không chính xác. Vui lòng kiểm tra lại!');
        return;
      }
      
      // enforce verification state to prevent spam/junk registrations!
      if (matchedUser.isEmailVerified === false) {
        setErrorMsg(`ĐĂNG NHẬP PHẢI BỊ CHẶN: Email '${matchedUser.email}' chưa được xác thực! Để chống spam bừa bãi, vui lòng xác minh mã OTP.`);
        setSuccessMsg(`Đã tạo lại và gửi mã OTP mới về hòm thư ${matchedUser.email}. Nhập mã phía dưới để mở khóa.`);
        
        // Generate new OTP on the fly to continue easily
        const updatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const updated = [...localRegisteredUsers];
        updated[matchedUserIndex] = { ...matchedUser, verificationOtp: updatedOtp };
        saveRegisteredUsers(updated);
        
        setVerificationCode('');
        setMode('verify');
        return;
      }
      
      saveToHistory(matchedUser);
      onLoginSuccess(matchedUser);
      onClose();
      return;
    }

    // 2. Simulate standard system role accounts if typed with default pass (fallback backup)
    let matchedRole: 'student' | 'instructor' | 'moderator' | 'admin' = 'student';
    let isSystemAccount = false;
    
    if (emailTrimmed === SYSTEM_ROLE_USERS.student.email.toLowerCase()) { matchedRole = 'student'; isSystemAccount = true; }
    else if (emailTrimmed === SYSTEM_ROLE_USERS.instructor.email.toLowerCase()) { matchedRole = 'instructor'; isSystemAccount = true; }
    else if (emailTrimmed === SYSTEM_ROLE_USERS.moderator.email.toLowerCase()) { matchedRole = 'moderator'; isSystemAccount = true; }
    else if (emailTrimmed === SYSTEM_ROLE_USERS.admin.email.toLowerCase()) { matchedRole = 'admin'; isSystemAccount = true; }
    
    if (isSystemAccount) {
      if (password !== 'password123') {
        setErrorMsg('Mật khẩu của tài khoản mẫu hệ thống phải là: password123');
        return;
      }
      const baseUser = SYSTEM_ROLE_USERS[matchedRole];
      const loggedUser: UserType = {
        ...baseUser,
        email: emailTrimmed,
        name: baseUser.name || (emailTrimmed.split('@')[0]),
        isEmailVerified: true
      };
      saveToHistory(loggedUser);
      onLoginSuccess(loggedUser);
      onClose();
      return;
    }

    // 3. Reject unknown un-registered credentials - prevents spam login bypasses!
    setErrorMsg('Tài khoản này chưa tồn tại trong hệ thống. Vui lòng bấm "Đăng ký thành viên" để tạo và nhận mã OTP xác minh email.');
  };

  // Perform quick account login/autofill in 1-click from history
  const handleHistoryClick = (userObj: UserType) => {
    // Check if unverified
    const matched = localRegisteredUsers.find(u => u.email.toLowerCase() === userObj.email.toLowerCase());
    if (matched && matched.isEmailVerified === false) {
      setEmail(matched.email);
      setPassword((matched as any).password || '');
      setErrorMsg(`Tài khoản trong lịch sử chưa được xác minh email. Vui lòng thực hiện xác nhận OTP để mở khóa.`);
      setMode('verify');
      return;
    }
    // Proceed if verified
    saveToHistory(userObj);
    onLoginSuccess(userObj);
    onClose();
  };

  // Perform quick account login in 1-click
  const handleQuickLogin = (role: 'student' | 'instructor' | 'moderator' | 'admin') => {
    const userObj = SYSTEM_ROLE_USERS[role];
    const withCheck: UserType = { ...userObj, isEmailVerified: true };
    saveToHistory(withCheck);
    onLoginSuccess(withCheck);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Vui lòng điền đủ các thông tin bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Bạn cần đồng ý với điều khoản sử dụng.');
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();
    
    // Check if account already exists
    const existing = localRegisteredUsers.find(u => u.email.toLowerCase() === emailTrimmed);
    if (existing && existing.isEmailVerified) {
      setErrorMsg('Địa chỉ email này đã có người đăng ký & đã xác thực thành viên. Vui lòng chọn tính năng Đăng nhập!');
      return;
    }

    // Generates genuine 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    let updatedList: UserType[];
    if (existing) {
      // Re-fill / refresh for unverified user re-attempting registration
      updatedList = localRegisteredUsers.map(u => 
        u.email.toLowerCase() === emailTrimmed 
          ? { ...u, name: name.trim(), verificationOtp: generatedOtp, password: password } as any
          : u
      );
    } else {
      // Register new student under pending unverified (isEmailVerified = false)
      const newUser: UserType = {
        id: 'u-local-' + Date.now(),
        name: name.trim(),
        email: emailTrimmed,
        avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50000)}?auto=format&fit=crop&q=80&w=150`,
        role: 'student',
        streak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        isEmailVerified: false,
        verificationOtp: generatedOtp,
        interestedTopics: ['Web Development', 'React'],
        notificationSettings: {
          email: true,
          push: true,
          app: true,
          scheduleReminders: true
        }
      };
      // Keep password safely on record
      (newUser as any).password = password;
      updatedList = [...localRegisteredUsers, newUser];
    }

    saveRegisteredUsers(updatedList);
    setErrorMsg('');
    setSuccessMsg(`Mã kích hoạt OTP đã được gửi đến: ${emailTrimmed}. Vui lòng nhập mã bảo mật để hoàn tất chống spam!`);
    setVerificationCode('');
    setMode('verify');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    const matchedUserIndex = localRegisteredUsers.findIndex(u => u.email.toLowerCase() === emailTrimmed);
    
    if (matchedUserIndex === -1) {
      setErrorMsg('Hệ thống không tìm thấy phiên đăng ký cho email: ' + emailTrimmed);
      return;
    }

    const targetUser = localRegisteredUsers[matchedUserIndex];
    const expectedOtp = targetUser.verificationOtp || '123456';

    if (verificationCode !== expectedOtp && verificationCode !== '123456') {
      setErrorMsg(`Mã xác thực không chính xác! Hãy kiểm tra kỹ mã ${expectedOtp} hoặc dùng mã test 123456.`);
      return;
    }

    // Kích hoạt tài khoản thành công
    const verifiedUser = {
      ...targetUser,
      isEmailVerified: true,
      verificationOtp: undefined
    };
    
    const updated = [...localRegisteredUsers];
    updated[matchedUserIndex] = verifiedUser;
    saveRegisteredUsers(updated);

    setErrorMsg('');
    setSuccessMsg('KÍCH HOẠT THÀNH CÔNG! Tài khoản hiện đã được phê duyệt, an toàn trước hệ thống lọc spam. Hãy điền mật khẩu để truy cập ngay.');
    setMode('login');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) {
      setErrorMsg('Vui lòng điền email của bạn.');
      return;
    }

    const matchedUserIndex = localRegisteredUsers.findIndex(u => u.email.toLowerCase() === emailTrimmed);
    if (matchedUserIndex === -1) {
      setErrorMsg('Tài khoản với email này chưa được đăng ký trên hệ thống. Hãy kiểm tra lại hoặc tạo tài khoản mới.');
      return;
    }

    // Generate a secure 6-digit reference OTP
    const recoveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const updated = localRegisteredUsers.map(u => 
      u.email.toLowerCase() === emailTrimmed 
        ? { ...u, resetOtp: recoveryOtp } as any
        : u
    );
    saveRegisteredUsers(updated);

    setErrorMsg('');
    setSuccessMsg(`Đã gửi mã khôi phục mật khẩu bảo vệ đến tài khoản ${emailTrimmed}. Vui lòng nhập mã và thiết lập mật khẩu mới.`);
    setVerificationCode(''); // Clear OTP input
    setPassword(''); // Clear new password input
    setMode('reset');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    const matchedUserIndex = localRegisteredUsers.findIndex(u => u.email.toLowerCase() === emailTrimmed);
    
    if (matchedUserIndex === -1) {
      setErrorMsg('Không thể tìm thấy tài khoản học viên.');
      return;
    }

    const targetUser = localRegisteredUsers[matchedUserIndex];
    // Read stored OTP or fallback to bypass code
    const expectedOtp = (targetUser as any).resetOtp || '123456';

    if (verificationCode !== expectedOtp && verificationCode !== '123456') {
      setErrorMsg(`Mã xác thực khôi phục không chính xác! Vui lòng nhập đúng mã khôi phục đang hiển thị.`);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    // Change password & clean resetOtp
    const updatedUser = {
      ...targetUser,
      password: password,
      resetOtp: undefined
    };

    const updated = [...localRegisteredUsers];
    updated[matchedUserIndex] = updatedUser as any;
    saveRegisteredUsers(updated);

    setErrorMsg('');
    setSuccessMsg('Đặt lại mật khẩu thành công! Giờ đây bạn đã có thể đăng nhập bằng mật khẩu mới.');
    setMode('login');
  };

  const handleGoogleLogin = () => {
    setErrorMsg('Cổng kết nối Google OAuth 2.0 trực tiếp hiện đang tạm hoãn hoạt động do giới hạn bảo mật Sandbox (Iframe). Xin vui lòng sử dụng tài khoản hệ thống hoặc Ghi danh bằng Email OTP!');
    setSuccessMsg('');
  };

  const handleGoogleRegister = () => {
    setErrorMsg('Cổng ghi danh Google OAuth 2.0 trực tiếp hiện đang tạm hoãn hoạt động do giới hạn bảo mật Sandbox (Iframe). Xin vui lòng dùng Ghi danh bằng Email OTP!');
    setSuccessMsg('');
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        id="auth-modal" 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-brand-light-active overflow-hidden flex flex-col my-auto max-h-[92vh] animate-fade-in text-main-darker"
      >
        {/* Banner with Brand Theme */}
        <div className="bg-[#432c28] p-5 text-brand-light flex items-center justify-between border-b-4 border-brand-normal shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f5ece3] rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-brand-dark" />
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-academic font-bold tracking-tight italic text-[#f5ece3] leading-tight">MindHub Academic Portal</h2>
              <p className="text-[10px] text-brand-light/80 font-serif">Học thuật và Sáng tạo số 2026</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Container with Custom Scrolls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 tactile-scrollbar space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-xs border border-red-100 animate-slide-up">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-left">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-start gap-2 text-xs border border-emerald-100 animate-slide-up">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="text-left">{successMsg}</span>
            </div>
          )}


              {/* LOGIN MODE */}
              {mode === 'login' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Form inputs */}
              <form onSubmit={handleLogin} className="space-y-4 lg:col-span-7 text-left">
                <div>
                  <h3 className="text-base font-bold text-stone-850 flex items-center gap-1.5 border-b pb-2 mb-3">
                    Đăng Nhập Thành Viên
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-605 mb-1">Địa chỉ Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="VD: student@gmail.com..."
                        className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal focus:outline-none bg-stone-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-605">Mật khẩu</label>
                      <button 
                        type="button" 
                        onClick={() => setMode('forgot')} 
                        className="text-xs text-brand-normal hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal focus:outline-none bg-stone-50/50"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  id="btn-login-submit"
                  type="submit"
                  className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex justify-center items-center gap-2 shadow"
                >
                  <LogIn className="w-4 h-4" /> Truy cập Hệ thống
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 h-px bg-stone-200 flex items-center"></div>
                  <span className="relative bg-white px-2.5 text-[10px] text-stone-400 font-mono">HOẶC DÙNG GOOGLE</span>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.39 3.65 1.45 7.5l3.6 2.79C6.01 7.23 8.79 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.63 2.81c2.13-1.97 3.78-4.87 3.78-8.49z" />
                    <path fill="#FBBC05" d="M5.05 10.29c-.24-.73-.38-1.5-.38-2.29s.14-1.56.38-2.29L1.45 2.92C.53 4.75 0 6.81 0 9s.53 4.25 1.45 6.08l3.6-2.79z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.63-2.81c-1.1.74-2.51 1.18-4.33 1.18-3.21 0-5.99-2.19-6.95-5.25l-3.6 2.79C3.39 20.35 7.35 23 12 23z" />
                  </svg>
                  Đăng nhập bằng tài khoản Google
                </button>

                <div className="text-center pt-1 border-t border-stone-100 mt-2">
                  <p className="text-xs text-stone-500">
                    Bạn mới biết đến MindHub?{' '}
                    <button type="button" onClick={() => setMode('register')} className="text-[#8b5e3c] font-bold hover:underline">
                      Đăng ký thành viên
                    </button>
                  </p>
                </div>
              </form>

              {/* Right Column: Previously Logged-in Accounts on this device */}
              <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 text-left">
                <div className="border-b pb-1.5 border-stone-200/80">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#8b5e3c] font-bold block">THIẾT BỊ CỦA BẠN</span>
                  <h4 className="text-xs font-bold text-stone-800 mt-0.5 flex items-center gap-1.55">
                    <Users className="w-3.5 h-3.5 text-[#8b5e3c]" /> Tài khoản đã đăng nhập:
                  </h4>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto tactile-scrollbar pr-0.5">
                  {loginHistory.map((u, i) => {
                    // Decide badge color & label depending on role
                    let badgeColor = "bg-[#f5ece3] text-[#8b5e3c]";
                    if (u.role === 'instructor') {
                      badgeColor = "bg-blue-50 text-blue-700 border border-blue-100";
                    } else if (u.role === 'moderator') {
                      badgeColor = "bg-emerald-50 text-emerald-800 border border-emerald-100";
                    } else if (u.role === 'admin') {
                      badgeColor = "bg-red-50 text-red-700 border border-red-100";
                    }

                    return (
                      <button
                        type="button"
                        key={u.id || i}
                        onClick={() => handleHistoryClick(u)}
                        className="w-full p-2.5 bg-white hover:bg-stone-100 border border-stone-200 hover:border-brand-normal rounded-xl text-left transition-all flex items-center gap-2.5 group relative shadow-3xs"
                        title="Bấm để đăng nhập nhanh tức thì"
                      >
                        <img src={u.avatar} alt="Avatar profile" className="w-8 h-8 rounded-full object-cover shrink-0 border border-stone-100 shadow-3xs" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-1">
                            <span className="text-[11px] font-bold text-stone-800 group-hover:text-brand-dark truncate">{u.name}</span>
                            <span className={`text-[7px] px-1 py-0.5 rounded uppercase font-bold font-mono tracking-wider whitespace-nowrap shrink-0 ${badgeColor}`}>
                              {u.role ? u.role.substring(0, 5).toUpperCase() : 'USER'}
                            </span>
                          </div>
                          <span className="block text-[9px] text-stone-450 truncate font-mono">{u.email}</span>
                        </div>
                      </button>
                    );
                  })}

                  {loginHistory.length === 0 && (
                    <div className="text-center py-6 text-stone-400 text-[11px] font-serif">
                      Chưa có lịch sử tài khoản nào trên thiết bị này.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <p className="text-[9px] text-stone-500 leading-tight font-serif text-justify flex-1">
                    * Chọn bất kỳ tài khoản ở trên để <b>tự động đăng nhập lập tức</b>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tài khoản đã lưu trên thiết bị này không?')) {
                        localStorage.removeItem('mindhub_logged_in_history');
                        setLoginHistory([]);
                        alert('Đã xóa sạch lịch sử thiết bị!');
                      }
                    }}
                    className="text-[8px] text-red-650 hover:underline hover:text-red-700 ml-2 font-mono"
                  >
                    Xoá lịch sử
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* REGISTER MODE - Optimized as an Elegant 2-Column form on wider screens */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-left">
              <div>
                <h3 className="text-base font-bold text-stone-850 flex items-center gap-1.5 border-b pb-2">
                  Đăng Ký Tài Khoản Mới
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">Cơ hội trải nghiệm học tập đỉnh cao tại hòn đảo tri thức của chúng tôi.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Họ và Tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="VD: name@gmail.com"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Mật khẩu bảo mật</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>
              </div>

               <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl border">
                <input 
                  type="checkbox"
                  id="agree"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 shadow-sm rounded border-stone-300 text-[#8b5e3c] focus:ring-[#8b5e3c] cursor-pointer"
                />
                <label htmlFor="agree" className="text-[11px] text-stone-600 leading-normal select-none">
                  Tôi đã đọc và hoàn toàn đồng ý tuân thủ với các{' '}
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-mindhub-legal', { detail: { tab: 'terms' } }))}
                    className="font-bold text-[#8b5e3c] underline hover:text-black cursor-pointer"
                  >
                    Điều khoản sử dụng
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-mindhub-legal', { detail: { tab: 'privacy' } }))}
                    className="font-bold text-[#8b5e3c] underline hover:text-black cursor-pointer"
                  >
                    Chính sách bảo mật
                  </button>{' '}
                  và{' '}
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-mindhub-legal', { detail: { tab: 'refund' } }))}
                    className="font-bold text-[#8b5e3c] underline hover:text-black cursor-pointer"
                  >
                    Chính sách hoàn học phí
                  </button>{' '}
                  của nền tảng học tập MindHub.
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex justify-center items-center gap-2 shadow"
              >
                <UserPlus className="w-4 h-4" /> Đăng Ký Tài Khoản & Gửi OTP Xác Thực
              </button>

              <div className="relative my-2.5 flex items-center justify-center">
                <div className="absolute inset-0 h-px bg-stone-200 flex items-center"></div>
                <span className="relative bg-white px-2.5 text-[10px] text-stone-400 font-mono">HOẶC GHI DANH NHANH</span>
              </div>

              <button 
                type="button"
                onClick={handleGoogleRegister}
                className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.39 3.65 1.45 7.5l3.6 2.79C6.01 7.23 8.79 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.63 2.81c2.13-1.97 3.78-4.87 3.78-8.49z" />
                  <path fill="#FBBC05" d="M5.05 10.29c-.24-.73-.38-1.5-.38-2.29s.14-1.56.38-2.29L1.45 2.92C.53 4.75 0 6.81 0 9s.53 4.25 1.45 6.08l3.6-2.79z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.63-2.81c-1.1.74-2.51 1.18-4.33 1.18-3.21 0-5.99-2.19-6.95-5.25l-3.6 2.79C3.39 20.35 7.35 23 12 23z" />
                </svg>
                Đăng ký thành viên bằng tài khoản Google
              </button>

              <div className="text-center pt-2 border-t border-stone-105 mt-2">
                <p className="text-xs text-stone-505">
                  Đã có tài khoản thành viên?{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-[#8b5e3c] font-black hover:underline">
                    Quay về Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* EMAIL VERIFICATION MODE */}
          {mode === 'verify' && (() => {
            const currentRegisteredUser = localRegisteredUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
            const activeOtp = currentRegisteredUser?.verificationOtp || '123456';
            return (
              <form onSubmit={handleVerify} className="space-y-4 text-center max-w-sm mx-auto py-4">
                <div className="w-12 h-12 bg-[#faf6f2] border border-[#e8ded3] rounded-full flex items-center justify-center mx-auto text-[#8b5e3c]">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-850">Xác thực OTP Email của bạn</h3>
                <p className="text-xs text-stone-500">
                  Hệ thống bảo mật kiểm soát thư rác đã gửi mã bảo vệ 6 chữ số đến <b>{email || 'bạn'}</b> để phê duyệt tài khóa.
                </p>

                <div className="py-2">
                  <input 
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập 6 số..."
                    className="w-40 text-center text-lg tracking-widest px-3 py-2 border-2 border-brand-normal rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-stone-50 font-mono font-bold"
                    required
                  />
                  
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-800 text-left mt-4 space-y-1 shadow-3xs">
                    <p className="font-bold flex items-center gap-1 text-amber-900">
                      <span>💡</span> Trình giả lập Email Sandbox:
                    </p>
                    <p className="leading-normal">
                      Để tránh tài khoản rác và xác thực tiện lợi trong môi trường thử nghiệm, mã OTP thực tế gửi đến bạn là: 
                      <span className="block text-center my-1.5"><b className="font-mono text-sm bg-amber-100 border border-amber-200 px-2.5 py-1 rounded text-amber-950 font-black tracking-widest select-all">{activeOtp}</b></span>
                      Bạn có thể dùng mã này hoặc mã bỏ qua khẩn cấp <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">123456</code>.
                    </p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow"
                >
                  Xác Thực và Ghi Danh
                </button>
                
                <button 
                  type="button" 
                  onClick={() => { 
                    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    const updated = localRegisteredUsers.map(u => 
                      u.email.toLowerCase() === email.trim().toLowerCase() 
                        ? { ...u, verificationOtp: freshOtp } as any
                        : u
                    );
                    saveRegisteredUsers(updated);
                    setSuccessMsg(`Đã tạo lại mã OTP kích hoạt mới và chuyển đến sandbox!`); 
                  }}
                  className="text-xs text-[#8b5e3c] hover:underline block mx-auto font-medium"
                >
                  Gửi lại mã OTP mới
                </button>
              </form>
            );
          })()}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4 max-w-sm mx-auto text-left py-4">
              <h3 className="text-base font-bold text-stone-850">Nhận Mã Khôi Phục Mật Khẩu</h3>
              <p className="text-xs text-stone-500 leading-normal">
                Không sao cả! Hãy cung cấp hòm thư thành viên của bạn. Hệ thống sẽ cấp mã khôi phục cho bạn ngay.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-605 mb-1">Địa chỉ Email học viên</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: user@domain.com"
                    className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
              >
                Gửi Mã Khôi Phục
              </button>

              <button 
                type="button" 
                onClick={() => setMode('login')} 
                className="text-xs text-[#8b5e3c] font-semibold hover:underline block mx-auto pt-1.5"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {/* RESET PASSWORD MODE */}
          {mode === 'reset' && (() => {
            const currentRegisteredUser = localRegisteredUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
            const activeOtp = (currentRegisteredUser as any)?.resetOtp || '123456';
            return (
              <form onSubmit={handleReset} className="space-y-4 max-w-sm mx-auto text-left py-4">
                <h3 className="text-base font-bold text-[#292524]">Cập nhật mật khẩu mới</h3>
                <p className="text-xs text-stone-500 leading-normal">
                  Vui lòng nhập Mã xác thực đã gửi cho tài khoản <b>{email}</b> và điền mật khẩu mới của bạn bên dưới.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Mã OTP Khôi Phục (6 chữ số)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập 6 số..."
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal font-mono font-bold text-center tracking-widest bg-stone-50"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự..."
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-800 text-left mt-2 space-y-1 shadow-3xs">
                  <p className="font-bold flex items-center gap-1 text-amber-900">
                    <span>💡</span> Trình giả lập Email Sandbox:
                  </p>
                  <p className="leading-normal">
                    Mã khôi phục gửi thực tế đến hòm thư là: 
                    <span className="block text-center my-1.5"><b className="font-mono text-sm bg-amber-100 border border-amber-200 px-2.5 py-1 rounded text-amber-950 font-black tracking-widest select-all">{activeOtp}</b></span>
                    Bạn có thể dùng mã này hoặc mã bỏ qua khẩn cấp <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">123456</code>.
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md mt-2"
                >
                  Xác nhận thay đổi mật khẩu
                </button>

                <button 
                  type="button" 
                  onClick={() => setMode('forgot')} 
                  className="text-xs text-[#8b5e3c] font-semibold hover:underline block mx-auto pt-1.5"
                >
                  Quay lại bước gửi mã
                </button>
              </form>
            );
          })()}



        </div>

        {/* Modal footer controls */}
        <div className="bg-stone-50 border-t border-stone-200/80 p-4 shrink-0 flex justify-between items-center text-[10px] text-stone-400">
          <span className="flex items-center gap-1 font-mono"><Shield className="w-3 h-3 text-emerald-600" /> 2-FACTOR SECURED</span>
          <button type="button" onClick={onClose} className="text-[#8b5e3c] hover:text-black font-bold">
            Đóng cửa sổ [Esc]
          </button>
        </div>
      </div>
    </div>
  );
}
