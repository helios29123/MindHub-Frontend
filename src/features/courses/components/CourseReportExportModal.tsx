import React, { useState } from 'react';
import { Download, Printer, X, FileSpreadsheet, FileText, CheckCircle2, BarChart3, BookOpen, Users, DollarSign, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Course } from '@/shared/types';
import { toast } from 'sonner';

interface CourseReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  totalCoursesCount: number;
  currentFiltersDescription?: string;
}

export const CourseReportExportModal: React.FC<CourseReportExportModalProps> = ({
  isOpen,
  onClose,
  courses,
  totalCoursesCount,
  currentFiltersDescription = 'Tất cả các khóa học'
}) => {
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  if (!isOpen) return null;

  // Analytics summary for the report
  const totalCourses = courses.length;
  const freeCoursesCount = courses.filter(c => c.price === 0 || c.salePrice === 0).length;
  const paidCoursesCount = totalCourses - freeCoursesCount;
  
  const averagePrice = totalCourses > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.salePrice ?? c.price ?? 0), 0) / totalCourses)
    : 0;

  const averageRating = totalCourses > 0
    ? (courses.reduce((acc, c) => acc + (c.rating || 4.5), 0) / totalCourses).toFixed(1)
    : '4.8';

  const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  // Group by category
  const categoryStats: Record<string, number> = {};
  courses.forEach(c => {
    const cat = c.category || 'Khác';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  // Export to CSV Function with UTF-8 BOM
  const handleExportCSV = () => {
    try {
      setIsExportingCsv(true);
      
      const headers = ['Mã KH', 'Tên Khóa Học', 'Giảng Viên', 'Danh Mục', 'Cấp Độ', 'Giá Gốc (VNĐ)', 'Giá Bán (VNĐ)', 'Đánh Giá', 'Lượt Đăng Ký', 'Ngày Tạo'];
      
      const rows = courses.map(c => [
        `"${c.id}"`,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${(c.instructorName || 'MindHub Instructor').replace(/"/g, '""')}"`,
        `"${(c.category || 'Công nghệ').replace(/"/g, '""')}"`,
        `"${c.requirements?.[0]?.includes('Nâng cao') ? 'Nâng cao' : 'Cơ bản'}"`,
        c.price || 0,
        c.salePrice ?? c.price ?? 0,
        c.rating || 4.8,
        c.enrolledCount || 0,
        `"${c.createdAt || new Date().toISOString().split('T')[0]}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\r\n');

      // Add UTF-8 BOM (\uFEFF) for Excel compatibility with Vietnamese characters
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const filename = `MindHub_BaoCao_KhoaHoc_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Xuất file CSV thành công!', {
        description: `Đã tải xuống file ${filename} (${courses.length} bản ghi).`
      });
    } catch (err: any) {
      console.error('CSV Export Error:', err);
      toast.error('Lỗi khi xuất dữ liệu CSV');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Printable PDF View Function
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Vui lòng cho phép mở cửa sổ bật lên để in báo cáo PDF');
      return;
    }

    const reportDate = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const categoryRowsHtml = Object.entries(categoryStats).map(([cat, count]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${cat}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${count} khóa học</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${((count / totalCourses) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    const courseTableRowsHtml = courses.map((c, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${index + 1}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${c.title}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${c.instructorName || 'MindHub Instructor'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${c.category || 'Công nghệ'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #16a34a;">${(c.salePrice ?? c.price ?? 0).toLocaleString('vi-VN')} đ</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600; color: #d97706;">★ ${c.rating || 4.8}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">${(c.enrolledCount || 0).toLocaleString('vi-VN')}</td>
      </tr>
    `).join('');

    const printDocument = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Báo Cáo Danh Mục Khóa Học MindHub - ${reportDate}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
          .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
          .stat-value { font-size: 22px; font-weight: 800; color: #2563eb; margin-top: 4px; }
          .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #1e293b; color: #ffffff; font-weight: 700; text-align: left; padding: 10px 12px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">MINDHUB ACADEMY</div>
            <div class="meta">Hệ Thống Quản Lý & Xuất Báo Cáo Khóa Học</div>
          </div>
          <div style="text-align: right;">
            <div class="title">BÁO CÁO CATALÓG KHÓA HỌC</div>
            <div class="meta">Ngày xuất: ${reportDate}</div>
            <div class="meta">Bộ lọc: ${currentFiltersDescription}</div>
          </div>
        </div>

        <!-- Metric Summary Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Tổng Khóa Học</div>
            <div class="stat-value">${totalCourses}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Học Viên Đăng Ký</div>
            <div class="stat-value">${totalEnrollments.toLocaleString('vi-VN')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Giá Trung Bình</div>
            <div class="stat-value">${averagePrice.toLocaleString('vi-VN')} đ</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Đánh Giá Trung Bình</div>
            <div class="stat-value">★ ${averageRating}</div>
          </div>
        </div>

        <h3 style="margin-bottom: 8px; color: #0f172a;">1. Phân bổ theo Danh mục</h3>
        <table>
          <thead>
            <tr>
              <th>Danh Mục</th>
              <th style="text-align: right;">Số Khóa Học</th>
              <th style="text-align: right;">Tỷ Lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRowsHtml}
          </tbody>
        </table>

        <h3 style="margin-top: 28px; margin-bottom: 8px; color: #0f172a;">2. Danh sách Chi tiết Khóa học (${courses.length} / ${totalCoursesCount})</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">STT</th>
              <th>Tên Khóa Học</th>
              <th>Giảng Viên</th>
              <th>Danh Mục</th>
              <th style="text-align: right;">Giá Bán</th>
              <th style="text-align: center;">Đánh Giá</th>
              <th style="text-align: right;">Học Viên</th>
            </tr>
          </thead>
          <tbody>
            ${courseTableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>Báo cáo tự động trích xuất từ hệ thống MindHub platform</div>
          <div>Người lập báo cáo: Ban Quản Lý Khóa Học</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printDocument);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border/80 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Xuất Báo Cáo Danh Mục Khóa Học</h2>
              <p className="text-xs text-muted-foreground font-medium">
                Xem thống kê & tải file dữ liệu ({courses.length} khóa học hiển thị)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" /> Tổng khóa học
              </span>
              <span className="text-xl font-black text-foreground mt-1">{totalCourses}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{paidCoursesCount} trả phí, {freeCoursesCount} miễn phí</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex flex-col">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" /> Tổng học viên
              </span>
              <span className="text-xl font-black text-foreground mt-1">{totalEnrollments.toLocaleString('vi-VN')}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Lượt đăng ký học</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Giá trung bình
              </span>
              <span className="text-xl font-black text-foreground mt-1">{averagePrice.toLocaleString('vi-VN')}đ</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Theo danh mục lọc</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> Đánh giá
              </span>
              <span className="text-xl font-black text-foreground mt-1">★ {averageRating}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Điểm trung bình</span>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-foreground">Chọn định dạng báo cáo</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: CSV Export */}
              <div 
                onClick={handleExportCSV}
                className="group cursor-pointer p-4 rounded-2xl border border-border hover:border-emerald-500/50 bg-card hover:bg-emerald-500/5 transition-all duration-300 flex items-start gap-4 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-foreground group-hover:text-emerald-600 transition-colors">
                      Xuất File CSV (Excel)
                    </h4>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Định dạng file `.csv` chuẩn tiếng Việt (UTF-8 BOM), đầy đủ thông tin để phân tích trên Excel / Google Sheets.
                  </p>
                </div>
              </div>

              {/* Option 2: Printable PDF Report */}
              <div 
                onClick={handlePrintPDF}
                className="group cursor-pointer p-4 rounded-2xl border border-border hover:border-primary/50 bg-card hover:bg-primary/5 transition-all duration-300 flex items-start gap-4 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Printer className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                      In / Lưu PDF Báo Cáo
                    </h4>
                    <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Xuất bản báo cáo trang trọng gồm biểu đồ danh mục, thống kê chỉ số và danh sách chi tiết có thể in hoặc lưu PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Table of Courses */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Xem trước danh sách ({courses.length} khóa học)</h3>
              <span className="text-xs text-muted-foreground">Sắp xếp theo thứ tự hiển thị</span>
            </div>

            <div className="border border-border/70 rounded-2xl overflow-hidden bg-card">
              <div className="max-h-48 overflow-y-auto divide-y divide-border/60">
                {courses.map((course, idx) => (
                  <div key={course.id || idx} className="p-3 flex items-center justify-between text-xs hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="w-5 font-bold text-muted-foreground text-center shrink-0">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{course.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {course.instructorName || 'MindHub Instructor'} • {course.category || 'Công nghệ'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <span className="font-black text-foreground">
                        {(course.salePrice ?? course.price ?? 0).toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-amber-500 font-bold">★ {course.rating || 4.8}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-muted/20">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Báo cáo khớp với bộ lọc hiện tại
          </span>
          <Button variant="outline" onClick={onClose} className="rounded-xl px-5">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
