import React from 'react';
import { Award, Users, BookOpen, Target, Sparkles, Globe } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Học viên trực tuyến', value: '50,000+', icon: <Users className="w-6 h-6" /> },
    { label: 'Khóa học chất lượng', value: '150+', icon: <BookOpen className="w-6 h-6" /> },
    { label: 'Giảng viên chuyên gia', value: '45+', icon: <Award className="w-6 h-6" /> },
    { label: 'Tỷ lệ hài lòng', value: '98%', icon: <Sparkles className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-12 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Về <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">MindHub</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Chúng tôi là nền tảng học tập trực tuyến hàng đầu, mang đến các khóa học chuyên sâu về công nghệ, thiết kế và kỹ năng số. 
            Mục tiêu của chúng tôi là trang bị cho bạn những kiến thức thực tiễn nhất để tự tin bước vào kỷ nguyên số.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#151b2b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:-translate-y-1 transition-transform shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8 text-emerald-500" />
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              MindHub ra đời với sứ mệnh xóa bỏ khoảng cách kỹ năng công nghệ tại Việt Nam. Chúng tôi tin rằng bất kỳ ai cũng có thể làm chủ công nghệ nếu được tiếp cận đúng phương pháp và người hướng dẫn tận tâm.
            </p>
            <ul className="space-y-4">
              {[
                'Cung cấp kiến thức chuẩn quốc tế với chi phí tối ưu.',
                'Cập nhật liên tục các xu hướng công nghệ mới nhất.',
                'Môi trường học tập chủ động, linh hoạt mọi lúc mọi nơi.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
                alt="MindHub Team working"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
