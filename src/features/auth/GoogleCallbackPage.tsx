import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { authApi } from '@/features/auth/api';
import { setAuthToken } from '@/shared/lib/api-client';
import { normalizeUser } from '@/shared/types';
import { toast } from 'sonner';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setIsLoggedIn, setCurrentUser } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const token = searchParams.get('token');
    const errorCode = searchParams.get('code');

    if (status === 'success' && token) {
      // 1. Save auth token
      setAuthToken(token);

      // 2. Fetch authenticated user profile
      authApi.getCurrentUser()
        .then((userData) => {
          const user = normalizeUser(userData);
          setIsLoggedIn(true);
          setCurrentUser(user);
          localStorage.setItem('mindhub_is_logged_in', 'true');
          localStorage.setItem('mindhub_current_user', JSON.stringify(user));

          toast.success(`Chào mừng ${user.name} đã đăng nhập thành công!`);
          navigate('/', { replace: true });
        })
        .catch((err) => {
          console.error('Lỗi khi lấy thông tin người dùng Google:', err);
          setErrorMsg('Không thể lấy thông tin tài khoản Google. Vui lòng thử lại.');
          toast.error('Đăng nhập Google thất bại');
        });
    } else {
      const msg = errorCode === 'account_disabled'
        ? 'Tài khoản Google này đã bị khóa hoặc vô hiệu hóa.'
        : 'Đăng nhập Google không thành công hoặc bị hủy.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  }, [searchParams, navigate, setIsLoggedIn, setCurrentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-stone-200/80 p-8 text-center">
        {!errorMsg ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-bold text-stone-800">Đang xác thực tài khoản Google...</h2>
            <p className="text-sm text-stone-500">Vui lòng chờ trong giây lát, hệ thống đang thiết lập phiên đăng nhập của bạn.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-stone-800">Đăng nhập thất bại</h2>
            <p className="text-sm text-stone-600">{errorMsg}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all cursor-pointer"
            >
              Quay lại trang Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
