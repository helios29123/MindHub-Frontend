import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ApiService } from '@/services/api';

interface VNPayReturnPageProps {
  onNavigate?: (path: string) => void;
}

export default function VNPayReturnPage({ onNavigate }: VNPayReturnPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef');
  const amountStr = searchParams.get('vnp_Amount');
  const errorMessage = searchParams.get('error');

  const amount = amountStr ? Number(amountStr) / 100 : 0;

  useEffect(() => {
    const handleVerify = async () => {
      try {
        if (errorMessage) {
          setIsSuccess(false);
          setMessage(decodeURIComponent(errorMessage));
          setLoading(false);
          return;
        }

        if (responseCode === '00') {
          setIsSuccess(true);
          setMessage('Thanh toán đơn hàng qua VNPay thành công!');
          // Optionally call API to parse/confirm callback if needed
          if (window.location.search) {
            try {
              await ApiService.parseVNPayCallback(window.location.search.substring(1));
            } catch (err) {
              console.warn('API callback parse note:', err);
            }
          }
        } else if (responseCode) {
          setIsSuccess(false);
          setMessage(`Thanh toán thất bại hoặc đã bị hủy (Mã lỗi: ${responseCode})`);
        } else {
          setIsSuccess(true);
          setMessage('Xử lý phản hồi thanh toán hoàn tất.');
        }
      } catch (err: any) {
        setIsSuccess(false);
        setMessage(err?.message || 'Có lỗi xảy ra khi xác thực giao dịch VNPay.');
      } finally {
        setLoading(false);
      }
    };

    handleVerify();
  }, [responseCode, errorMessage]);

  const handleGoToMyCourses = () => {
    if (onNavigate) {
      onNavigate('/my-courses');
    } else {
      navigate('/my-courses');
    }
  };

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('/');
    } else {
      navigate('/');
    }
  };

  const handleRetry = () => {
    if (onNavigate) {
      onNavigate('/cart');
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border/50 shadow-lg p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Đang xác thực kết quả thanh toán từ VNPay...</p>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Thanh toán thành công!</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>

            {(txnRef || amount > 0) && (
              <div className="w-full bg-muted/30 rounded-xl p-4 mb-6 text-left text-xs space-y-2 border border-border/50">
                {txnRef && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã giao dịch:</span>
                    <span className="font-semibold text-foreground">{txnRef}</span>
                  </div>
                )}
                {amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <span className="font-semibold text-emerald-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <span className="font-semibold text-foreground">Cổng VNPay</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button onClick={handleGoToMyCourses} className="flex-1 font-bold rounded-xl gap-2">
                <BookOpen className="w-4 h-4" />
                Khóa học của tôi
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="flex-1 font-bold rounded-xl">
                Trang chủ
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Thanh toán thất bại</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button onClick={handleRetry} className="flex-1 font-bold rounded-xl gap-2">
                Thử lại thanh toán
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="flex-1 font-bold rounded-xl">
                Trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
