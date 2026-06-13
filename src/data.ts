import { Course, User, Notification, Order, FlaggedItem, PayoutRequest, AuditLog, Banner } from './types';

export const INITIAL_USER: User = {
  id: 'u-01',
  name: 'Trần Thanh Sang',
  email: 'truongthanhsang31415@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  role: 'student',
  streak: 5,
  lastActiveDate: '2026-05-25',
  bio: 'Sinh viên công nghệ nhiệt huyết, đam mê lập trình frontend và trí tuệ nhân tạo.',
  interestedTopics: ['Web Development', 'React', 'Artificial Intelligence', 'UI/UX Design'],
  notificationSettings: {
    email: true,
    push: true,
    app: true,
    scheduleReminders: true
  }
};

export const SYSTEM_ROLE_USERS: Record<string, User> = {
  student: {
    ...INITIAL_USER,
    role: 'student'
  },
  instructor: {
    id: 'u-02',
    name: 'Dr. Lê Quốc Khánh',
    email: 'khanh.le@mindhub.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    role: 'instructor',
    streak: 12,
    lastActiveDate: '2026-05-26',
    bio: 'Chuyên gia AI & Cloud Computing, cựu Kỹ sư nghiên cứu tại Google Brain.',
    interestedTopics: ['Deep Learning', 'Generative AI', 'Cloud Stack'],
    notificationSettings: {
      email: true,
      push: true,
      app: true,
      scheduleReminders: false
    },
    payoutInfo: {
      bankName: 'Techcombank',
      accountNumber: '1903456789123',
      accountHolder: 'LE QUOC KHANH',
      balance: 42500000 // 42.5M VND
    }
  },
  moderator: {
    id: 'u-03',
    name: 'Nguyễn Minh Thư',
    email: 'thu.nguyen@mindhub.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    role: 'moderator',
    streak: 3,
    lastActiveDate: '2026-05-26',
    bio: 'Trưởng ban kiểm duyệt chất lượng nội dung tại MindHub.',
    interestedTopics: ['Ethics', 'Education Policy'],
    notificationSettings: {
      email: true,
      push: false,
      app: true,
      scheduleReminders: false
    }
  },
  admin: {
    id: 'u-04',
    name: 'Admin MindHub',
    email: 'admin@mindhub.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    streak: 99,
    lastActiveDate: '2026-05-26',
    bio: 'Tổng quản trị viên hệ thống MindHub.',
    interestedTopics: ['Analytics', 'System Scale', 'Security'],
    notificationSettings: {
      email: true,
      push: true,
      app: true,
      scheduleReminders: true
    }
  }
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Chinh Phục React 19 & Next.js 15: Từ Cơ Bản Đến Cao Cấp',
    subtitle: 'Làm chủ framework hàng đầu hiện nay với React Compiler, Server Actions, Server Components và Streaming UI.',
    description: 'Khóa học này sẽ đưa bạn đi từ số không đến việc xây dựng các ứng dụng web phức tạp, tối ưu hóa SEO hoàn hảo và đạt hiệu năng đỉnh cao với React 19 và Next.js 15. Bạn sẽ được làm quen với các khái niệm đột phá mới nhất như React Compiler, `use` Hook, các tính năng Server Actions trực tiếp mà không cần backend API truyền thống.',
    category: 'Development',
    subcategory: 'Web Development',
    instructorName: 'Dr. Lê Quốc Khánh',
    instructorTitle: 'Cựu Kỹ sư Google Brain',
    instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    instructorBio: 'Dr. Lê Quốc Khánh có hơn 12 năm kinh nghiệm trong ngành phát triển phần mềm và nghiên cứu AI. Anh từng dẫn dắt nhiều dự án lớn và có hàng chục ấn phẩm khoa học uy tín quốc tế.',
    price: 1200000,
    salePrice: 799000,
    rating: 4.8,
    reviewCount: 342,
    enrolledCount: 1540,
    completionRate: 85,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
    requirements: [
      'Kiến thức cơ bản vững chắc về HTML, CSS và JavaScript (ES6+)',
      'Đã làm quen sơ bộ với cách hoạt động của NPM và Node.js'
    ],
    willLearn: [
      'Tối ưu hóa re-render tự động với React Compiler hoàn toàn mới',
      'Ứng dụng Server Actions để tương tác cơ sở dữ liệu siêu tốc',
      'Xử lý bất đồng bộ mượt mà với use(), Action state, và Form Status',
      'Deployment và tối ưu hóa CDN trên Vercel tối ưu điểm Tốc độ Tải trang'
    ],
    status: 'active',
    chapters: [
      {
        id: 'c1-ch1',
        title: 'Chương 1: Giới thiệu React 19 & Kiến trúc Next.js mới',
        lessons: [
          {
            id: 'c1-ch1-l1',
            title: '1.1 Tổng quan về cuộc cách mạng React 19',
            type: 'video',
            duration: '14:25',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            isPreview: true,
            resources: [
              { id: 'res-1', title: 'Giấy thông hành khóa học PDF', url: '#', size: '1.8 MB' },
              { id: 'res-2', title: 'Source code khởi động dự án', url: '#', size: '420 KB' }
            ],
            content: 'Giới thiệu về React 19 mới với React Compiler cốt lỗi giúp loại bỏ nhu cầu useMemo, useCallback thủ công.'
          },
          {
            id: 'c1-ch1-l2',
            title: '1.2 Server Components vs Client Components thực tiễn',
            type: 'video',
            duration: '18:10',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            isPreview: true,
            content: 'Hướng dẫn chi tiết lúc nào nên dùng Server Components để tăng tốc độ tải trang SEO và lúc nào sử dụng Client Components.'
          },
          {
            id: 'c1-ch1-l3',
            title: '1.3 Trắc nghiệm: Nắm vững nguyên lý kết xuất (Rendering)',
            type: 'quiz',
            duration: '5 Câu hỏi',
            quiz: {
              id: 'quiz-c1-ch1',
              title: 'Bài kiểm tra kiến thức Kết xuất Next.js',
              questions: [
                {
                  id: 'q1',
                  question: 'Mặc định, các Component định nghĩa trong thư mục `app` của Next.js là loại nào?',
                  options: [
                    'Client Component',
                    'Server Component',
                    'Shared Component',
                    'Static Component'
                  ],
                  correctIndex: 1,
                  explanation: 'Mặc định mọi Component trong thư mục `app` được coi là React Server Component (RSC), trừ khi có chỉ thị "use client" đặt ở đầu file.'
                },
                {
                  id: 'q2',
                  question: 'Từ khóa nào dùng để kích hoạt React Compiler tự động?',
                  options: [
                    'Sử dụng directive "use memo"',
                    'Sử dụng hook useMemo',
                    'Mặc định trong React 19 build và cấu hình compiler',
                    'Bắt buộc cài đặt thêm babel-plugin-react'
                  ],
                  correctIndex: 2,
                  explanation: 'React Compiler sẽ tự động phân tích và ghi nhớ memoize các phần tử mà không cần directive hay code thủ công nào từ lập trình viên.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'c1-ch2',
        title: 'Chương 2: Làm chủ Server Actions & Biểu mẫu bảo mật',
        lessons: [
          {
            id: 'c1-ch2-l1',
            title: '2.1 Khởi tạo Server Action đầu tiên của bạn',
            type: 'video',
            duration: '22:40',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            isPreview: false,
            content: 'Tìm hiểu cách định nghĩa hàm với "use server" và gọi trực tiếp từ sự kiện onSubmit của Form.'
          },
          {
            id: 'c1-ch2-l2',
            title: '2.2 Xử lý Loading State bằng useActionState và useFormStatus',
            type: 'video',
            duration: '15:15',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            isPreview: false,
            content: 'Sử dụng các hook tích hợp mới của React 19 để theo dõi trạng thái gửi form đơn giản mà cực kỳ hiệu quả.'
          },
          {
            id: 'c1-ch2-l3',
            title: 'Bài tập bắt buộc: Viết Form Đăng ký tin tức bảo mật',
            type: 'assignment',
            duration: 'Nộp bài',
            assignment: {
              id: 'assign-c1-ch2',
              title: 'Xây dựng Server Action Validate Form nâng cao',
              description: 'Hãy xây dựng một Form nhận email có kiểm tra trùng lặp trên database giả lập, xử lý phản hồi lỗi định dạng email bằng zod, và hiển thị trạng thái Loading mượt mà khi submit. Bạn cần cung cấp link Github chứa code của bạn.',
              maxPoints: 100,
              dueDate: 'Hạn nộp: Đêm nay 23:59'
            }
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Nguyễn Văn Hùng',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        comment: 'Khóa học tuyệt vời! Những điểm mới của React 19 được anh Khánh giải thích cực kỳ xúc tích và dễ hình dung. Dự án thực hành rất thực tế.',
        date: '2026-05-20'
      },
      {
        id: 'rev-2',
        userName: 'Hoàng Thùy Linh',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        rating: 4,
        comment: 'Bài học video rất chất lượng, tuy nhiên phần Server Actions lúc mới làm quen hơi khó hiểu một chút, may mắn có AI Mentor giải thích lại giùm.',
        date: '2026-05-22'
      }
    ],
    faqs: [
      {
        question: 'Tôi có cần biết React trước khi học khóa này?',
        answer: 'Kiến thức React cơ bản sẽ giúp bạn tiếp thu nhanh hơn, nhưng khóa học vẫn có phần ôn tập tổng quan và giải thích kỹ lưỡng từng bước cho cả người mới.'
      },
      {
        question: 'Hỗ trợ giải đáp thắc mắc như thế nào?',
        answer: 'Bạn có thể gửi câu hỏi trực tiếp tại mục Q&A dưới mỗi bài học để được Giảng viên và cộng đồng trả lời, kết hợp hỏi đáp tức thì với AI Mentor tích hợp 24/7.'
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Thiết Kế Đồ Họa Đột Phá với AI & Figma',
    subtitle: 'Ứng dụng Midjourney, Stable Diffusion và plugin Figma AI để tăng tốc quy trình thiết kế giao diện gấp 10 lần.',
    description: 'Biến kỹ năng thiết kế của bạn trở nên vượt bậc bằng cách kết hợp sức mạnh sáng tạo không giới hạn của trí tuệ nhân tạo thế hệ mới vào quy trình UI/UX truyền thống của Figma. Bạn sẽ học cách tạo assets, hình minh họa tuyệt đẹp từ câu lệnh text, tự động tối ưu hóa bản phác thảo và chỉnh sửa giao diện nhanh chóng.',
    category: 'Design',
    subcategory: 'UI/UX Design',
    instructorName: 'Sarah Nguyễn',
    instructorTitle: 'Design Lead tại VinFast',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    instructorBio: 'Sarah có hơn 8 năm thiết kế hệ thống giao diện cho các tập đoàn lớn toàn cầu. Cô luôn đón đầu các xu hướng công nghệ thiết kế AI tiên tiến.',
    price: 950000,
    salePrice: 590000,
    rating: 4.9,
    reviewCount: 189,
    enrolledCount: 920,
    completionRate: 78,
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1541462608141-2ffb16df3e2b?auto=format&fit=crop&q=80&w=800',
    requirements: [
      'Có tài khoản Figma miễn phí và cơ bản biết kéo thả hình khối',
      'Điện thoại hoặc máy tính có thể truy cập Discord để dùng Midjourney'
    ],
    willLearn: [
      'Xây dựng câu lệnh Prompt tối ưu để tạo Layout Web độc đáo',
      'Biến phác thảo tay nguệch ngoạc thành UI vector hoàn hảo',
      'Tạo bộ Icon, Illustration đồng bộ phong cách thương hiệu',
      'Tích hợp các plugin Figma thông minh tự phát sinh nội dung text'
    ],
    status: 'active',
    chapters: [
      {
        id: 'c2-ch1',
        title: 'Chương 1: Cách mạng AI trong quy trình UI/UX hiện đại',
        lessons: [
          {
            id: 'c2-ch1-l1',
            title: '1.1 Tổng quan về AI Design và ranh giới sáng tạo',
            type: 'video',
            duration: '10:50',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            isPreview: true,
            content: 'Giới thiệu các loại AI hỗ trợ thiết kế giúp designer bứt phá năng suất.'
          },
          {
            id: 'c2-ch1-l2',
            title: '1.2 Làm quen với Midjourney và cấu trúc Prompt UI',
            type: 'video',
            duration: '16:40',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            isPreview: true,
            content: 'Hướng dẫn cụ thể phong cách câu lệnh để ra được giao diện người dùng sạch và hiện đại.'
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-3',
        userName: 'Lê Minh Quốc',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        comment: 'Đỉnh cao thực lực! Figma AI kết hợp Prompt vẽ minh họa giúp mình tiết kiệm hàng chục tiếng đồng hồ vẽ tay cho khách hàng.',
        date: '2026-05-24'
      }
    ],
    faqs: []
  },
  {
    id: 'course-3',
    title: 'Python & Generative AI Agents ứng dụng thực tế',
    subtitle: 'Xây dựng các hệ thống tự động hóa công việc bằng mô hình ngôn ngữ lớn (LLMs), AI Agent bằng framework LangChain và CrewAI.',
    description: 'Học cách tạo ra các Trợ lý thông minh tự động đọc tài liệu, gửi mail, tự tìm kiếm thông tin và phân tích tài chính. Đây là kỹ năng được săn đón nhất trong kỉ nguyên AI hóa doanh nghiệp.',
    category: 'Artificial Intelligence',
    subcategory: 'AI Engineering',
    instructorName: 'Dr. Lê Quốc Khánh',
    instructorTitle: 'Cựu Kỹ sư Google Brain',
    instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    instructorBio: 'Giảng viên uy tín trong lĩnh vực phát triển các hệ thống AI phân tán.',
    price: 1800000,
    salePrice: 1350000,
    rating: 4.7,
    reviewCount: 94,
    enrolledCount: 520,
    completionRate: 64,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800',
    requirements: ['Biết lập trình Python cơ bản', 'Đã biết khái niệm về API'],
    willLearn: [
      'Thiết lập môi trường ảo Python và gọi API OpenAI/Gemini',
      'Sử dụng LangChain cấu hình chuỗi suy nghĩ RAG',
      'Lập trình phi tập trung với CrewAI phối hợp 3 Robot làm việc cùng lúc'
    ],
    status: 'active',
    chapters: [
      {
        id: 'c3-ch1',
        title: 'Chương 1: Những khối gạch đầu tiên của AI Agent',
        lessons: [
          {
            id: 'c3-ch1-l1',
            title: '1.1 Khái niệm AI Agent vs Chatbot thông thường',
            type: 'video',
            duration: '12:00',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            isPreview: true,
            content: 'Giải thích tại sao Agent thông minh hơn nhờ khả năng sử dụng công cụ bên ngoài (Tools).'
          }
        ]
      }
    ],
    reviews: [],
    faqs: []
  },
  {
    id: 'course-4',
    title: 'Kinh Doanh Số Độc Bản & Affiliate Marketing thực chiến',
    subtitle: 'Thiết lập phễu bán hàng tự động, làm chủ tiếp thị liên kết và tối ưu hóa hệ thống thụ động trọn đời.',
    description: 'Hướng dẫn từ tư duy sản phẩm số, định vị thương hiệu cá nhân, đến các kỹ năng chạy chiến dịch affiliate đạt hoa hồng khủng trên TikTok Shop, Shopee và các mạng tiếp thị quốc tế.',
    category: 'Marketing',
    subcategory: 'Affiliate Marketing',
    instructorName: 'Minh Beta',
    instructorTitle: 'Triệu phú Affiliate',
    instructorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    instructorBio: 'Kinh nghiệm 10 năm chinh chiến tiếp thị liên kết ngoại sản phẩm phần mềm SaaS.',
    price: 650000,
    salePrice: 399000,
    rating: 4.6,
    reviewCount: 145,
    enrolledCount: 890,
    completionRate: 72,
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    requirements: ['Điện thoại kết nối mạng', 'Tinh thần kiên trì thử nghiệm'],
    willLearn: [],
    status: 'active',
    chapters: [],
    reviews: [],
    faqs: []
  },
  {
    id: 'course-5',
    title: 'Phát Triển Hệ Thống Web phân tán siêu nặng (Draft)',
    subtitle: 'Nội dung đang chuẩn bị biên soạn.',
    description: 'Khóa học này đang ở trạng thái nháp, chờ duyệt để kiểm tra quy trình kiểm duyệt.',
    category: 'Development',
    subcategory: 'Backend Engineering',
    instructorName: 'Dr. Lê Quốc Khánh',
    instructorTitle: 'Cựu Kỹ sư Google Brain',
    instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    instructorBio: '',
    price: 2500000,
    rating: 0,
    reviewCount: 0,
    enrolledCount: 0,
    completionRate: 0,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    requirements: [],
    willLearn: [],
    status: 'pending', // Pending moderation review
    rejectionReason: '',
    chapters: [],
    reviews: [],
    faqs: []
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: '🔥 Thử thách hàng ngày mới!',
    message: 'Duy trì chuỗi học liên tục. Click học ít nhất 1 bài để giữ ngọn lửa 5 ngày của bạn!',
    type: 'reminder',
    date: '10 phút trước',
    read: false
  },
  {
    id: 'notif-2',
    title: '🎉 Thanh toán thành công',
    message: 'Chào mừng bạn đến với khóa học "Chinh Phục React 19 & Next.js 15". Chúng tôi đã mở khóa toàn bộ bài học và tài liệu của bạn.',
    type: 'success',
    date: '1 giờ trước',
    read: false
  },
  {
    id: 'notif-3',
    title: '📚 Bài tập mới phản hồi',
    message: 'Giảng viên Lê Quốc Khánh đã chấm điểm & nhận xét bài tập Server Actions của bạn: Đạt 95/100 điểm.',
    type: 'info',
    date: 'Hôm qua',
    read: true
  }
];

export const INITIAL_FAVORITES: string[] = ['course-2']; // Course IDs

export const INITIAL_CART: string[] = []; // Course IDs

export const MOCK_NOTIFY_LIST: Notification[] = [
  ...INITIAL_NOTIFICATIONS,
  {
    id: 'notif-4',
    title: '⚠️ Cập nhật bảo mật tài khoản',
    message: 'Mật khẩu của bạn đã được thay đổi thành công vào lúc 10:20 sáng nay.',
    type: 'warning',
    date: '3 ngày trước',
    read: true
  }
];

export const FLAGGED_REVIEWS_MOCK: FlaggedItem[] = [
  {
    id: 'flag-1',
    type: 'review',
    content: 'Khóa học dở tệ, lừa đảo, mất tiền oan!',
    reason: 'Ngôn từ kích động thô tục',
    reporter: 'u-101 (Học viên)',
    status: 'pending',
    courseId: 'course-1',
    courseTitle: 'Chinh phục React 19 & Next.js 15'
  },
  {
    id: 'flag-2',
    type: 'comment',
    content: 'Mọi người qua trang web tencucre.xyz để tải tài liệu lậu miễn phí đi nhé, không cần mua ở đây.',
    reason: 'Phát tán link bản quyền lậu, spam',
    reporter: 'u-102 (Học viên)',
    status: 'pending',
    courseId: 'course-2',
    courseTitle: 'Thiết kế hệ thống UX/UI cao cấp'
  }
];

export const PAYOUT_REQUESTS_MOCK: PayoutRequest[] = [
  {
    id: 'pay-1',
    instructorId: 'u-02',
    instructorName: 'Dr. Lê Quốc Khánh',
    amount: 15000000,
    status: 'pending',
    date: '2026-05-25'
  },
  {
    id: 'pay-2',
    instructorId: 'u-05',
    instructorName: 'Sarah Nguyễn',
    amount: 8000000,
    status: 'completed',
    date: '2026-05-18'
  }
];

export const AUDIT_LOGS_MOCK: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'u-04',
    userName: 'Admin MindHub',
    userRole: 'admin',
    action: 'CẬP NHẬT CẤU HÌNH HỆ THỐNG',
    timestamp: '2026-05-26 09:30:15',
    details: 'Thay đổi tỷ lệ hoa hồng giảng viên từ 25% lên 30%.'
  },
  {
    id: 'log-2',
    userId: 'u-03',
    userName: 'Nguyễn Minh Thư',
    userRole: 'moderator',
    action: 'DUYỆT KHÓA HỌC',
    timestamp: '2026-05-25 15:42:00',
    details: 'Phê duyệt xuất bản khóa học: UI/UX Masterclass của Sarah Nguyễn.'
  },
  {
    id: 'log-3',
    userId: 'u-04',
    userName: 'Admin MindHub',
    userRole: 'admin',
    action: 'KHÓA TÀI KHOẢN NGƯỜI DÙNG',
    timestamp: '2026-05-24 11:12:44',
    details: 'Khóa tài khoản spammer_no1@gmail.com vĩnh viễn.'
  }
];

export const GENERAL_FAQ = [
  {
    id: 'faq-g1',
    q: 'Bằng cấp/Chứng chỉ từ MindHub có giá trị thế nào?',
    a: 'Chứng chỉ MindHub có mã định danh mã hóa duy nhất để nhà tuyển dụng xác thực trực tuyến công khai. Nhiều học viên của chúng tôi đã đính kèm vào LinkedIn và vượt qua vòng phỏng vấn tại các doanh nghiệp lớn.'
  },
  {
    id: 'faq-g2',
    q: 'Chính sách hoàn tiền của MindHub hoạt động ra sao?',
    a: 'Chúng tôi hỗ trợ hoàn tiền 100% trong vòng 7 ngày kể từ lúc mua nếu bạn học chưa vượt quá 10% thời lượng khóa học và không vi phạm điều khoản dịch vụ.'
  },
  {
    id: 'faq-g3',
    q: 'Tôi có thể tải video xuống học ngoại tuyến (offline) hay không?',
    a: 'Bạn hoàn toàn có thể sử dụng ứng dụng di động MindHub hoặc chọn chế độ Cache Trực tuyến trong trình duyệt để tải tạm thời nội dung bài học và học khi không có kết nối internet.'
  }
];

export const SYSTEM_COUPONS = [
  { code: 'WELCOMEMIND', discount: 10, description: 'Giảm 10% cho đơn hàng đầu tiên.' },
  { code: 'SUMMER26', discount: 20, description: 'Đại tiệc mùa hè giảm giá 20% toàn sàn!' },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'Nghệ thuật đào tạo số',
    subtitle: 'Nền tảng học tập trực tuyến chắt lọc tinh hoa từ phương pháp giáo dục truyền thống và trải nghiệm công nghệ tinh tế. Hôm nay bạn đang thắp sáng ngọn lửa học tập!',
    actionText: 'Bắt đầu học tập',
    actionUrl: '#courses-explorer',
    isActive: true,
    backgroundColor: '#fcf8f2',
    textColor: '#432c28',
    accentColor: '#8b5e3c'
  },
  {
    id: 'banner-2',
    title: 'Khai Phá Kỷ Nguyên Generative AI',
    subtitle: 'Tăng tốc x10 hiệu suất công việc với các kỹ năng Prompt Engineering, LLMs thực chiến cùng Giáo sư Google Brain.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600',
    actionText: 'Xem khóa học AI',
    actionUrl: 'Artificial Intelligence',
    isActive: true,
    backgroundColor: '#edf9f6',
    textColor: '#0f3a3c',
    accentColor: '#10b981'
  },
  {
    id: 'banner-3',
    title: 'Thiết Kế Đồ Hoạ Hiện Đại & Figma Pro',
    subtitle: 'Nắm trọn tư duy bố cục, màu sắc và xây dựng hệ thống Design System chuyên nghiệp nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    actionText: 'Tìm hiểu ngay',
    actionUrl: 'Design',
    isActive: true,
    backgroundColor: '#fdf2f8',
    textColor: '#50072b',
    accentColor: '#ec4899'
  }
];

