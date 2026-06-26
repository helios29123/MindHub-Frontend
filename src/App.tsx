import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Compass, Search, User, ShoppingCart, Heart, Bell, Moon, Sun, 
  Settings, Award, Sparkles, BookOpen, Star, Filter, ArrowUpDown, 
  Check, LogOut, FileText, ChevronRight, ChevronLeft, CheckCircle, Shield, 
  HelpCircle, AlertCircle, Edit, Flame, RefreshCw,
  Coffee, Lock, Zap, MessageSquare, Music, Disc, Volume2, VolumeX, Pause, Play, Clock,
  Upload, Trash2, SkipBack, SkipForward, Repeat, UserX, Users, Video,
  ShoppingBag, Landmark, Download, Tag, Globe, Cpu, Layers, Terminal, Database
} from 'lucide-react';

import { loadAndCleanUploadedSongs, saveUploadedSong, deleteUploadedSong, validateMp3File, PlayableSong } from './utils/musicDb';

import { 
  INITIAL_USER, SYSTEM_ROLE_USERS, INITIAL_COURSES, 
  INITIAL_NOTIFICATIONS, INITIAL_FAVORITES, FLAGGED_REVIEWS_MOCK, 
  PAYOUT_REQUESTS_MOCK, INITIAL_BANNERS
} from './data';
import { Course, User as UserType, Order, FlaggedItem, PayoutRequest, Notification, AccountRequest, Lesson, Banner, normalizeUser } from './types';
import { safeLocalStorage as localStorage } from './utils/safeStorage';

// Import subcomponents
import AuthScreens from './components/AuthScreens';
import FooterLegal from './components/FooterLegal';
import CartAndCheckout from './components/CartAndCheckout';
import ClassroomScreen from './components/ClassroomScreen';
import InstructorDashboard from './components/InstructorDashboard';
import AdminDashboard from './components/AdminDashboard';
import { FreePreviewModal } from './components/FreePreviewModal';
import { ApiService } from './services/api';

// Simple custom intersection observer wrapper to achieve smooth scroll animations
interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
}

function ScrollReveal({ children, delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (delayMs > 0) {
          setTimeout(() => {
            setIsVisible(true);
          }, delayMs);
        } else {
          setIsVisible(true);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {children}
    </div>
  );
}

const INSTRUCTORS_DATA = [
  {
    id: 'inst-1',
    name: 'Dr. Lê Quốc Khánh',
    title: 'Cựu Kỹ sư nghiên cứu Google Brain',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    bio: 'Chuyên gia AI & Deep Learning hàng đầu thế giới, người trực tiếp giảng dạy Next.js, Python & Generative AI Agents.',
    expertise: 'Artificial Intelligence',
    expertiseLabel: 'Trí Thức Nhân Tạo',
    isFeatured: true,
    rating: 4.9,
    studentsCount: 3420,
    coursesCount: 4,
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    id: 'inst-2',
    name: 'Sarah Nguyễn',
    title: 'Lead Product Designer tại Figma Việt Nam',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    bio: 'Nhà thiết kế trải nghiệm xuất sắc, làm chủ các Plugin UI/UX Figma và Midjourney phục vụ thiết kế sản phẩm số.',
    expertise: 'Design',
    expertiseLabel: 'Thiết Kế Mỹ Thuật',
    isFeatured: true,
    rating: 4.8,
    studentsCount: 1850,
    coursesCount: 2,
    social: {
      github: '#',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    id: 'inst-3',
    name: 'Minh Beta',
    title: 'Thạc sĩ Quản trị Kinh doanh Harvard',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    bio: 'Nhà sáng lập tài ba, truyền cảm hứng kinh doanh số, phễu bán hàng Marketing và xu thế tự động đột phá.',
    expertise: 'Marketing',
    expertiseLabel: 'Kinh Doanh Số',
    isFeatured: false,
    rating: 4.7,
    studentsCount: 950,
    coursesCount: 1,
    social: {
      github: '#',
      linkedin: '#'
    }
  }
];

export default function App() {
  // --- CORE STATE MANAGERS ---
  const [currentUser, setCurrentUser] = useState<UserType>(() => {
    const stored = localStorage.getItem('mindhub_current_user');
    if (stored) {
      try { return normalizeUser(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
    return INITIAL_USER;
  });
  const [categoriesList, setCategoriesList] = useState<string[]>(['All', 'Development', 'Design', 'Marketing', 'Artificial Intelligence', 'Business & Startup', 'Data Science', 'Cybersecurity']);
  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = localStorage.getItem('mindhub_courses_db');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    const dates: Record<string, string> = {
      'course-1': '2026-05-15',
      'course-2': '2026-04-10',
      'course-3': '2026-05-20',
      'course-4': '2026-03-01',
      'course-5': '2026-05-25',
    };
    return INITIAL_COURSES.map(c => ({
      ...c,
      createdAt: dates[c.id] || '2026-01-01',
      allowFreeDoc: c.id === 'course-1' || c.id === 'course-2' || c.id === 'course-3' ? true : (c.allowFreeDoc || false),
      allowFreeVideo: c.id === 'course-1' || c.id === 'course-2' || c.id === 'course-3' ? true : (c.allowFreeVideo || false),
      freeVideoDuration: c.id === 'course-1' || c.id === 'course-2' || c.id === 'course-3' ? 15 : (c.freeVideoDuration || 30)
    }));
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('mindhub_favorites');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_FAVORITES;
  });
  const [cart, setCart] = useState<string[]>(() => {
    const stored = localStorage.getItem('mindhub_cart');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return [];
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('mindhub_notifications');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_NOTIFICATIONS;
  });
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedItem[]>(() => {
    const stored = localStorage.getItem('mindhub_flagged_reviews');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return FLAGGED_REVIEWS_MOCK;
  });
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    const stored = localStorage.getItem('mindhub_payout_requests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return PAYOUT_REQUESTS_MOCK;
  });
  
  // Account closure & lock request states
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>(() => {
    const stored = localStorage.getItem('mindhub_account_requests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'req-1',
        userId: 'u-101',
        userName: 'Nguyễn Đình Văn',
        userEmail: 'vandinhmock@gmail.com',
        type: 'lock',
        reason: 'Tôi muốn tạm ngừng học tập một thời gian để tập trung vào dự án cá nhân thực tế.',
        timestamp: '2026-06-05T08:30:00Z',
        status: 'pending'
      },
      {
        id: 'req-2',
        userId: 'u-102',
        userName: 'Trịnh Gia Bảo',
        userEmail: 'giabaoxspammer@gmail.com',
        type: 'delete',
        reason: 'Xóa bớt tài khoản phụ để chọn kết nối chính bằng tài khoản Gmail của tôi.',
        timestamp: '2026-06-07T14:15:00Z',
        status: 'pending'
      }
    ];
  });

  const saveAccountRequests = (updated: AccountRequest[]) => {
    setAccountRequests(updated);
    localStorage.setItem('mindhub_account_requests', JSON.stringify(updated));
  };

  const [showAccountClosureForm, setShowAccountClosureForm] = useState(false);
  const [closureType, setClosureType] = useState<'lock' | 'delete'>('lock');
  const [closureReason, setClosureReason] = useState('');
  const [agreeToClosureTerms, setAgreeToClosureTerms] = useState(false);

  const handleResolveAccountRequest = (id: string, action: 'approved' | 'rejected') => {
    const updated = accountRequests.map(r => r.id === id ? { ...r, status: action } as AccountRequest : r);
    saveAccountRequests(updated);
    
    // Create an audit log or trigger alert
    const target = accountRequests.find(r => r.id === id);
    if (target) {
      setToastMessage(`Đã ${action === 'approved' ? 'Phê duyệt chấp thuận' : 'Từ chối'} yêu cầu ${target.type === 'delete' ? 'xóa' : 'khóa'} tài khoản của học viên ${target.userName}`);
    }
  };

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'bestseller' | 'priceAsc' | 'priceDesc' | 'newest' | 'oldest'>('newest');
  const [showHeroPopup, setShowHeroPopup] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'intro'>('home');
  const [coursesPage, setCoursesPage] = useState<number>(1);
  const [favSortBy, setFavSortBy] = useState<'favoritesDesc' | 'ratingDesc' | 'priceAsc'>('favoritesDesc');
  const [recentPurchasedFilter, setRecentPurchasedFilter] = useState<'1_week' | '2_weeks' | '3_weeks' | '1_month' | 'all'>('all');

  // Instructor filtering states
  const [instructorCategory, setInstructorCategory] = useState<string>('All');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState<boolean>(false);

  // Suggestions panel trigger states
  const [showMainSuggestions, setShowMainSuggestions] = useState<boolean>(false);
  const [showBgmSuggestions, setShowBgmSuggestions] = useState<boolean>(false);

  // Enrolled courses (purchased courses by student)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('mindhub_enrolled_courses_db');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return ['course-1'];
  });

  // Orders and transactions history (student payments & admin control)
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('mindhub_orders');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'MIND-128491',
        date: '2026-05-15',
        courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }],
        discountAmount: 120000,
        total: 1080000,
        status: 'success',
        paymentMethod: 'Chuyển khoản Ngân hàng'
      },
      {
        id: 'MIND-894712',
        date: '2026-06-08',
        courses: [{ id: 'course-2', title: 'Xây dựng Microservices hiệu năng cao với Go & gRPC', price: 1600000 }],
        discountAmount: 0,
        total: 1600000,
        status: 'pending',
        paymentMethod: 'Chuyển khoản Ngân hàng'
      }
    ];
  });

  const saveOrders = (updated: Order[]) => {
    setOrders(updated);
    localStorage.setItem('mindhub_orders', JSON.stringify(updated));
  };

  // Banners and homepage advertising
  const [banners, setBanners] = useState<Banner[]>(() => {
    const stored = localStorage.getItem('mindhub_banners');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_BANNERS;
  });

  const saveBanners = (updated: Banner[]) => {
    setBanners(updated);
    localStorage.setItem('mindhub_banners', JSON.stringify(updated));
  };

  // Active Screens & Modals triggers
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('mindhub_is_logged_in');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mindhub_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('mindhub_courses_db', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('mindhub_enrolled_courses_db', JSON.stringify(enrolledCourseIds));
  }, [enrolledCourseIds]);

  useEffect(() => {
    localStorage.setItem('mindhub_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mindhub_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('mindhub_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('mindhub_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mindhub_flagged_reviews', JSON.stringify(flaggedReviews));
  }, [flaggedReviews]);

  useEffect(() => {
    localStorage.setItem('mindhub_payout_requests', JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  useEffect(() => {
    localStorage.setItem('mindhub_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    setCoursesPage(1);
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  const getCoursePurchaseDate = (courseId: string): Date => {
    const matchedOrder = orders.find(o => o.status === 'success' && o.courses.some(item => item.id === courseId));
    if (matchedOrder) {
      return new Date(matchedOrder.date);
    }
    const today = new Date();
    if (courseId === 'course-1') {
      const d = new Date(today);
      d.setDate(today.getDate() - 3);
      return d;
    }
    if (courseId === 'course-2') {
      const d = new Date(today);
      d.setDate(today.getDate() - 10);
      return d;
    }
    if (courseId === 'course-3') {
      const d = new Date(today);
      d.setDate(today.getDate() - 25);
      return d;
    }
    const d = new Date(today);
    d.setDate(today.getDate() - 5);
    return d;
  };

  // API Config Mode replication state to handle immediate dynamic data reloads
  const [apiConfigMode, setApiConfigMode] = useState<'mock' | 'api'>(() => ApiService.getConfig().mode);

  // Sync state and reload data on events
  useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<'mock' | 'api'>;
      setApiConfigMode(customEvent.detail);
    };
    window.addEventListener('mindhub-api-mode-changed', handleModeChange);
    return () => window.removeEventListener('mindhub-api-mode-changed', handleModeChange);
  }, []);

  // Live Load Data Effect when Switching into API mode vs Mock Mode
  useEffect(() => {
    let active = true;
    if (apiConfigMode === 'api') {
      console.log('🔌 Connecting to Live Backend Database via API...');
      
      // Load categories from database
      ApiService.getCategories().then(cats => {
        if (!active) return;
        if (cats && cats.length > 0) {
          setCategoriesList(['All', ...cats.map(c => c.name)]);
        }
      }).catch(e => console.warn('Lỗi nạp danh mục DB:', e));

      // Load courses from database with stable mock data fallback if real API fails/is empty
      ApiService.getCourses().then(coursList => {
        if (!active) return;
        if (coursList && coursList.length > 0) {
          setCourses(coursList);
        } else {
          // API connected but returned no courses - use local storage or static mock data
          const storedCourses = localStorage.getItem('mindhub_courses_db');
          if (storedCourses) {
            try {
              const parsed = JSON.parse(storedCourses);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCourses(parsed);
                return;
              }
            } catch {}
          }
          setCourses(INITIAL_COURSES);
        }
      }).catch(e => {
        console.warn('Lỗi kết nối API Backend thật, tự động nạp dữ liệu Mock dự phòng:', e);
        const storedCourses = localStorage.getItem('mindhub_courses_db');
        if (storedCourses) {
          try {
            const parsed = JSON.parse(storedCourses);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCourses(parsed);
              return;
            }
          } catch {}
        }
        setCourses(INITIAL_COURSES);
      });

      // Load student enrolled courses if logged in and not guest
      if (currentUser && currentUser.id !== 'u-guest') {
        ApiService.getMyEnrolledCourses().then(enrolledList => {
          if (!active) return;
          if (enrolledList && enrolledList.length > 0) {
            setEnrolledCourseIds(enrolledList.map(c => c.id));
          }
        }).catch(e => console.warn('Lỗi nạp lịch sử học khóa học DB:', e));
      }
    } else {
      // Restore cached or default static mockup data in Mock Mode
      const storedCourses = localStorage.getItem('mindhub_courses_db');
      if (storedCourses) {
        try {
          const parsed = JSON.parse(storedCourses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(parsed);
          }
        } catch {
          setCourses(INITIAL_COURSES);
        }
      } else {
        setCourses(INITIAL_COURSES);
      }
      setCategoriesList(['All', 'Development', 'Design', 'Marketing', 'Artificial Intelligence', 'Business & Startup', 'Data Science', 'Cybersecurity']);
    }

    return () => {
      active = false;
    };
  }, [apiConfigMode, currentUser.id]);

  // Listen to global legal / support triggers for decoupled modals activation
  useEffect(() => {
    const handleOpenLegal = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string }>;
      if (customEvent.detail && customEvent.detail.tab) {
        setShowLegal(customEvent.detail.tab);
      }
    };
    window.addEventListener('open-mindhub-legal', handleOpenLegal);
    return () => window.removeEventListener('open-mindhub-legal', handleOpenLegal);
  }, []);

  // Automatically enroll in courses when order status changes to success
  useEffect(() => {
    const successCourseIds = orders
      .filter(o => o.status === 'success')
      .flatMap(o => o.courses.map(c => c.id));
    
    setEnrolledCourseIds(prev => {
      const merged = Array.from(new Set([...prev, ...successCourseIds]));
      if (prev.length === merged.length && prev.every(v => merged.includes(v))) {
        return prev;
      }
      return merged;
    });
  }, [orders]);

  // Reset course pagination page when filters or sorting change
  useEffect(() => {
    setCoursesPage(1);
  }, [searchQuery, selectedCategory, selectedSubcategory, sortBy]);

  // Active Screens & Modals triggers
  const [showCart, setShowCart] = useState(false);
  const [directSelectCourseId, setDirectSelectCourseId] = useState<string | null>(null);
  const [initialCartTab, setInitialCartTab] = useState<'cart' | 'wishlist'>('cart');
  const [showLegal, setShowLegal] = useState<string | null>(null); // tab name if open
  const [showFloatingHelp, setShowFloatingHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<'info' | 'orders'>('info');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMusicHint, setShowMusicHint] = useState(true);

  // --- CONFIGURATION: CHÈN SƠ ĐỒ ĐƯỜNG DẪN VIDEO GIỚI THIỆU TẠI ĐÂY ---
  // Bạn có thể để trống "" để kích hoạt chế độ Demo Cinematic đẹp mắt với hiệu ứng chuyển động,
  // hoặc điền link video thật dạng .mp4 bất kỳ lúc nào để phát video thực sự.
  const INTRO_VIDEO_URL = "";

  // --- INTRO VIDEO POPUP STATES ---
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [introVideoTime, setIntroVideoTime] = useState(0);
  const [introAutoCloseCountdown, setIntroAutoCloseCountdown] = useState<number | null>(null);
  const [introVideoPaused, setIntroVideoPaused] = useState(false);
  const introVideoRef = useRef<HTMLVideoElement>(null);

  // Selected Detail Course viewer
  const [viewedCourse, setViewedCourse] = useState<Course | null>(null);
  const [isDetailDarkMode, setIsDetailDarkMode] = useState<boolean>(false);
  const [selectedDrink, setSelectedDrink] = useState<'espresso' | 'cappuccino' | 'matcha'>('espresso');
  const [selectedTable, setSelectedTable] = useState<number>(5);
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);

  // --- BACKGROUND MUSIC STATES ---
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.25); // default 25% volume
  const [ytUrlInput, setYtUrlInput] = useState('');
  const [bgmSearchQuery, setBgmSearchQuery] = useState('');
  
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const activeSongIdRef = useRef<string | null>(null);

  const [isLoopingSingle, setIsLoopingSingle] = useState(false);
  const isLoopingSingleRef = useRef(isLoopingSingle);
  const nextSongRef = useRef<() => void>(() => {});
  const prevSongRef = useRef<() => void>(() => {});

  useEffect(() => {
    isLoopingSingleRef.current = isLoopingSingle;
  }, [isLoopingSingle]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (showMusicHint) {
      const timer = setTimeout(() => setShowMusicHint(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showMusicHint]);

  useEffect(() => {
    let timer: any;
    if (introAutoCloseCountdown !== null) {
      if (introAutoCloseCountdown > 0) {
        timer = setTimeout(() => {
          setIntroAutoCloseCountdown(prev => prev !== null ? prev - 1 : null);
        }, 1000);
      } else {
        setShowIntroVideo(false);
        setIntroAutoCloseCountdown(null);
      }
    }
    return () => clearTimeout(timer);
  }, [introAutoCloseCountdown]);

  // Programmatically trigger play / manage video playback on open
  useEffect(() => {
    if (showIntroVideo) {
      setIntroVideoTime(0);
      setIntroAutoCloseCountdown(null);
      setIntroVideoPaused(false);
      
      if (INTRO_VIDEO_URL) {
        // Wait for DOM layout before playing
        const timer = setTimeout(() => {
          if (introVideoRef.current) {
            introVideoRef.current.currentTime = 0;
            introVideoRef.current.muted = true;
            introVideoRef.current.playsInline = true;
            const promise = introVideoRef.current.play();
            if (promise !== undefined) {
              promise.catch(err => {
                console.warn("Autoplay was blocked by browser policy, user interaction required:", err);
              });
            }
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      if (introVideoRef.current) {
        try {
          introVideoRef.current.pause();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [showIntroVideo]);

  // Simulation timer for when INTRO_VIDEO_URL is left empty ""
  useEffect(() => {
    let interval: any;
    if (showIntroVideo && !INTRO_VIDEO_URL && !introVideoPaused && introAutoCloseCountdown === null) {
      interval = setInterval(() => {
        setIntroVideoTime(prev => {
          const next = prev + 0.1; // Progress by 100ms
          if (next >= 12) {
            setIntroAutoCloseCountdown(3);
            return 12;
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showIntroVideo, introVideoPaused, introAutoCloseCountdown]);
  
  const PRESET_SONGS = [
    { id: 'song-1', title: '☕ Lofi Sáng Tạo Quán Gỗ', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', isYoutube: false },
    { id: 'song-2', title: '🎷 Jazz Thu Yên Bình', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', isYoutube: false },
    { id: 'song-3', title: '🎹 Piano Tĩnh Tâm', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', isYoutube: false },
    { id: 'song-4', title: '🌿 Bản Giao Hưởng Cát', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', isYoutube: false },
    { id: 'song-lofi-live', title: '🎧 Lofi Girl Live Trực Tuyến', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', isYoutube: true, youtubeId: 'jfKfPfyJRdk' },
  ];
  const [currentSong, setCurrentSong] = useState(PRESET_SONGS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [uploadedSongs, setUploadedSongs] = useState<PlayableSong[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and clean user uploaded songs on mount
  useEffect(() => {
    const fetchUserSongs = async () => {
      try {
        const stored = await loadAndCleanUploadedSongs();
        setUploadedSongs(stored);
      } catch (err) {
        console.error('Error reading user uploaded songs:', err);
      }
    };
    fetchUserSongs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const valResult = await validateMp3File(file);
      if (!valResult.isValid) {
        setMusicNotification({ text: valResult.error || 'Tệp tin không hợp lệ.', type: 'error' });
        setTimeout(() => setMusicNotification(null), 5000);
        setIsUploading(false);
        return;
      }

      const savedSong = await saveUploadedSong(file);
      setUploadedSongs(prev => [...prev, savedSong]);
      
      const appSongFormat = {
        id: savedSong.id,
        title: savedSong.title,
        url: savedSong.url,
        isYoutube: false,
        uploadedAt: savedSong.uploadedAt,
        expiresAt: savedSong.expiresAt
      };
      
      setCurrentSong(appSongFormat as any);
      setIsPlayingMusic(true);
      setMusicNotification({ text: `Tải lên "${file.name}" thành công! Nhạc sẽ lưu tối đa 1 tuần.`, type: 'success' });
      setTimeout(() => setMusicNotification(null), 5000);
    } catch (err: any) {
      setMusicNotification({ text: err.message || 'Lỗi tải nhạc lên.', type: 'error' });
      setTimeout(() => setMusicNotification(null), 5000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteSong = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteUploadedSong(id);
      setUploadedSongs(prev => prev.filter(s => s.id !== id));
      if (currentSong.id === id) {
        const nextSong = PRESET_SONGS[0];
        setCurrentSong(nextSong);
      }
      setMusicNotification({ text: 'Đã xóa bài hát thành công!', type: 'success' });
      setTimeout(() => setMusicNotification(null), 3000);
    } catch (err: any) {
      setMusicNotification({ text: err.message || 'Gặp lỗi khi xóa bài hát.', type: 'error' });
      setTimeout(() => setMusicNotification(null), 3000);
    }
  };

  const getRemainingDays = (expiresAt: number) => {
    const diffMs = expiresAt - Date.now();
    if (diffMs <= 0) return 'Hết hạn';
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (hours < 24) return `Hết hạn sau ${hours} giờ`;
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return `Hết hạn sau ${days} ngày`;
  };

  const handleNextSong = () => {
    const playlist = [...PRESET_SONGS, ...uploadedSongs];
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
    setIsPlayingMusic(true);
  };

  const handlePrevSong = () => {
    const playlist = [...PRESET_SONGS, ...uploadedSongs];
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentSong(playlist[prevIndex]);
    setIsPlayingMusic(true);
  };

  useEffect(() => {
    nextSongRef.current = handleNextSong;
    prevSongRef.current = handlePrevSong;
  }, [currentSong, uploadedSongs]);

  const [musicNotification, setMusicNotification] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const trimmed = url.trim();
    // If it's already a 11-character ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    try {
      if (trimmed.includes('/shorts/')) {
        const parts = trimmed.split('/shorts/');
        if (parts[1]) {
          const id = parts[1].split(/[?#&]/)[0];
          if (id && id.length === 11) return id;
        }
      }
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = trimmed.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        return match[2];
      }
      // Try parsing with new URL searchParams if it's a valid URL
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const parsedUrl = new URL(trimmed);
        const v = parsedUrl.searchParams.get('v');
        if (v && v.length === 11) return v;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const [isYtApiReady, setIsYtApiReady] = useState(false);
  const ytPlayerRef = useRef<any>(null);

  // Load YouTube IFrame Player API script on mount
  useEffect(() => {
    const existing = document.getElementById('youtube-iframe-api-script');
    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const previousCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') previousCallback();
      setIsYtApiReady(true);
    };

    if ((window as any).YT && (window as any).YT.Player) {
      setIsYtApiReady(true);
    }

    const interval = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        setIsYtApiReady(true);
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Sync YouTube Player constructor and state
  useEffect(() => {
    if (!isYtApiReady || !currentSong.isYoutube || !currentSong.youtubeId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {
          console.warn('Error pausing YT video:', e);
        }
      }
      return;
    }

    const placeholder = document.getElementById('youtube-bgm-placeholder');
    if (!placeholder) return;

    if (!ytPlayerRef.current) {
      try {
        ytPlayerRef.current = new (window as any).YT.Player('youtube-bgm-placeholder', {
          height: '100',
          width: '100',
          videoId: currentSong.youtubeId,
          playerVars: {
            autoplay: isPlayingMusic ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(Math.round(musicVolume * 100));
              if (isPlayingMusic) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              const endedState = ((window as any).YT && (window as any).YT.PlayerState) ? (window as any).YT.PlayerState.ENDED : 0;
              if (event.data === endedState) {
                if (isLoopingSingleRef.current) {
                  event.target.playVideo();
                } else {
                  nextSongRef.current();
                }
              }
            }
          }
        });
      } catch (e) {
        console.error('Failed to create YT.Player:', e);
      }
    } else {
      try {
        const currentVideoId = ytPlayerRef.current.getVideoData ? ytPlayerRef.current.getVideoData().video_id : null;
        if (currentVideoId !== currentSong.youtubeId) {
          if (isPlayingMusic) {
            ytPlayerRef.current.loadVideoById({
              videoId: currentSong.youtubeId,
              startSeconds: 0
            });
          } else {
            ytPlayerRef.current.cueVideoById({
              videoId: currentSong.youtubeId,
              startSeconds: 0
            });
          }
        } else {
          if (isPlayingMusic) {
            ytPlayerRef.current.playVideo();
          } else {
            ytPlayerRef.current.pauseVideo();
          }
        }
        ytPlayerRef.current.setVolume(Math.round(musicVolume * 100));
      } catch (err) {
        console.error('Error syncing existing YT.Player state:', err);
      }
    }
  }, [isYtApiReady, currentSong.youtubeId, currentSong.isYoutube]);

  // Sync volume level, play/pause state when changed dynamically from UI
  useEffect(() => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(Math.round(musicVolume * 100));
        if (currentSong.isYoutube) {
          if (isPlayingMusic) {
            ytPlayerRef.current.playVideo();
          } else {
            ytPlayerRef.current.pauseVideo();
          }
        }
      } catch (e) {
        console.warn('Error syncing status to YT.Player:', e);
      }
    }
  }, [isPlayingMusic, musicVolume, currentSong.isYoutube]);

  const handlePlayCustomYt = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeId(ytUrlInput);
    if (ytId) {
      const customSong = {
        id: 'song-custom-' + Date.now(),
        title: '📺 Nhạc YouTube Cá Nhỏ',
        url: ytUrlInput,
        isYoutube: true,
        youtubeId: ytId
      };
      setCurrentSong(customSong);
      setIsPlayingMusic(true);
      setYtUrlInput('');
      setMusicNotification({ text: 'Đã nhận dạng link YouTube! Bắt đầu phát BGM...', type: 'success' });
      setTimeout(() => setMusicNotification(null), 4000);
    } else {
      setMusicNotification({ text: 'Link YouTube không tương thích! Hãy dán đúng địa chỉ hoặc id.', type: 'error' });
      setTimeout(() => setMusicNotification(null), 4000);
    }
  };

  const togglePlayMusic = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const nextState = !isPlayingMusic;
    setIsPlayingMusic(nextState);
    if (!currentSong.isYoutube && audioRef.current) {
      if (nextState) {
        audioRef.current.play().catch(err => console.log('BGM Playback error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Init HTML5 audio element
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    try {
      if (typeof Audio !== 'undefined') {
        audio = new Audio(currentSong.isYoutube ? '' : currentSong.url);
      }
    } catch (e) {
      console.warn('[Audio Polyfill] Audio constructor is blocked or unsupported:', e);
    }

    if (!audio) {
      audioRef.current = null;
      return;
    }

    audio.loop = false;
    audio.volume = musicVolume;
    audioRef.current = audio;

    const handleEnded = () => {
      if (isLoopingSingleRef.current) {
        audioRef.current?.play().catch(err => console.log('BGM Playback error:', err));
      } else {
        nextSongRef.current();
      }
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setMusicCurrentTime(audioRef.current.currentTime || 0);
      }
    };

    const handleDurationChange = () => {
      if (audioRef.current) {
        setMusicDuration(audioRef.current.duration || 0);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleDurationChange);

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {
          console.warn(e);
        }
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('durationchange', handleDurationChange);
        audioRef.current.removeEventListener('loadedmetadata', handleDurationChange);
      }
      audioRef.current = null;
    };
  }, []);

  // Update audio source when song or playing status changed
  useEffect(() => {
    if (!audioRef.current) return;

    if (!currentSong.isYoutube) {
      const isSongChanged = activeSongIdRef.current !== currentSong.id;
      if (isSongChanged) {
        audioRef.current.src = currentSong.url;
        activeSongIdRef.current = currentSong.id;
        setMusicCurrentTime(0);
        setMusicDuration(0);
      }
      audioRef.current.volume = musicVolume;
      audioRef.current.loop = isLoopingSingle;
      if (isPlayingMusic) {
        audioRef.current.play().catch(err => console.log('BGM Playback error:', err));
      } else {
        audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
    }
  }, [currentSong, isPlayingMusic, isLoopingSingle]);

  // Interval for updating YouTube progress bar
  useEffect(() => {
    if (!currentSong.isYoutube || !isPlayingMusic) {
      return;
    }

    const interval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const current = ytPlayerRef.current.getCurrentTime();
          const total = ytPlayerRef.current.getDuration();
          if (typeof current === 'number' && !isNaN(current)) {
            setMusicCurrentTime(current);
          }
          if (typeof total === 'number' && !isNaN(total) && total > 0) {
            setMusicDuration(total);
          }
        } catch (e) {
          // ignore
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentSong.isYoutube, isPlayingMusic, currentSong.youtubeId]);

  // Reset progress when song changes
  useEffect(() => {
    setMusicCurrentTime(0);
    setMusicDuration(0);
  }, [currentSong.id]);

  const handleSeekMusic = (seconds: number) => {
    setMusicCurrentTime(seconds);
    if (!currentSong.isYoutube && audioRef.current) {
      try {
        audioRef.current.currentTime = seconds;
      } catch (err) {
        console.warn('Seeking error:', err);
      }
    } else if (currentSong.isYoutube && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
      } catch (err) {
        console.warn('YT Seeking error:', err);
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync volume level to local audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Active study Classroom classroom
  const [studyingCourse, setStudyingCourse] = useState<Course | null>(null);
  const [previewLesson, setPreviewLesson] = useState<{ lesson: Lesson; course: Course } | null>(null);

  // Profile fields editing
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedBio, setEditedBio] = useState(currentUser.bio || '');
  const [editedPhone, setEditedPhone] = useState(currentUser.phone || '098 765 4321');
  const [editedAvatar, setEditedAvatar] = useState(currentUser.avatar);
  const [topicInput, setTopicInput] = useState('');

  // Password reset modal states
  const [showPasswordPage, setShowPasswordPage] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Interactive demo states for aesthetic gallery
  const [demoSelectedCard, setDemoSelectedCard] = useState<number | null>(null);
  const [demo1AudioActive, setDemo1AudioActive] = useState(false);
  const [demo1Notes, setDemo1Notes] = useState('Sổ học thuật MindHub: Ghi lại kiến thức tâm đắc của bạn...');
  const [demo2Chapter, setDemo2Chapter] = useState<number | null>(null);
  const [demo3QuizStep, setDemo3QuizStep] = useState<number>(0); // 0: init quiz, 1: answered incorrect, 2: answered correct, 3: restart
  const [demo3Answer, setDemo3Answer] = useState<string | null>(null);

  // Play soft rain/lofi sound synthesized via Web Audio API
  const playCozyRainNoise = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 1.8; // soft ambient volume
      }
      
      const brownNoise = ctx.createBufferSource();
      brownNoise.buffer = noiseBuffer;
      brownNoise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      
      brownNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      brownNoise.start();
      
      (window as any)._mindhubRainSource = brownNoise;
      (window as any)._mindhubRainCtx = ctx;
    } catch (e) {
      console.error(e);
    }
  };

  const stopCozyRainNoise = () => {
    try {
      if ((window as any)._mindhubRainSource) {
        (window as any)._mindhubRainSource.stop();
        (window as any)._mindhubRainSource = null;
      }
      if ((window as any)._mindhubRainCtx) {
        (window as any)._mindhubRainCtx.close();
        (window as any)._mindhubRainCtx = null;
      }
    } catch (e) {}
  };

  useEffect(() => {
    setEditedName(currentUser.name);
    setEditedBio(currentUser.bio || '');
    setEditedPhone(currentUser.phone || '098 765 4321');
    setEditedAvatar(currentUser.avatar);
  }, [currentUser]);

  const AVAILABLE_AVATARS = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150"
  ];

  const PREDEFINED_TOPICS = [
    'React & Next.js',
    'Trí tuệ Nhân tạo (AI)',
    'Phát triển Web di động',
    'Thiết kế Đồ họa UX/UI',
    'Digital Marketing',
    'Cơ sở dữ liệu NoSQL',
    'Cố vấn Công nghệ',
    'Điện toán Đám mây & DevOps'
  ];

  const handleBuyCourseNow = (courseId: string) => {
    if (!isLoggedIn) {
      alert('Vui lòng Đăng sinh viên hoặc Đăng nhập MindHub để đăng ký tuyển sinh!');
      setShowAuth(true);
      return;
    }
    if (enrolledCourseIds.includes(courseId)) {
      alert('Bạn đã sở hữu khóa học này rồi, vui lòng kiểm tra phòng học!');
      return;
    }
    setDirectSelectCourseId(courseId);
    setShowCart(true);
  };

  // --- PERSPECTIVE/ROLE SWITCHER ---
  const handleSwitchRole = (role: 'student' | 'instructor' | 'admin') => {
    const targetUser = SYSTEM_ROLE_USERS[role];
    setCurrentUser(targetUser);
    // Reset view states
    setViewedCourse(null);
    setStudyingCourse(null);
    setIsEditingProfile(false);
    
    // Set matching welcome notification for selected role
    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      title: `Switch Role: Quyền ${role.toUpperCase()}`,
      message: `Đã kích hoạt giao diện điều hướng dành riêng cho ${role === 'admin' ? 'Quản trị viên' : role === 'instructor' ? 'Giảng viên' : 'Học viên'}.`,
      type: 'success',
      date: 'Vừa xong',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  // --- SHOPPING & WISHLIST ACTIONS ---
  const handleToggleFavorite = (courseId: string) => {
    if (!isLoggedIn) {
      alert('Vui lòng Đăng nhập để sử dụng tính năng lưu trữ yêu thích!');
      setShowAuth(true);
      return;
    }
    setFavorites(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleAddToCart = (courseId: string) => {
    if (!isLoggedIn) {
      alert('Vui lòng Đăng nhập để ghi danh khóa học vào giỏ hàng!');
      setShowAuth(true);
      return;
    }
    if (enrolledCourseIds.includes(courseId)) {
      alert('Bạn đã sở hữu khóa học này rồi, vui lòng kiểm tra phòng học!');
      return;
    }
    if (!cart.includes(courseId)) {
      setCart(prev => [...prev, courseId]);
      alert('Đã thêm thành công khóa học vào giỏ hàng MindHub!');
    } else {
      alert('Khóa học đã nằm sẵn trong giỏ hàng.');
    }
  };

  const handleRemoveFromCart = (courseId: string) => {
    setCart(prev => prev.filter(id => id !== courseId));
  };

  const handleEnrollSuccess = (purchasedIds: string[], order: Order) => {
    if (order.status === 'success') {
      setEnrolledCourseIds(prev => Array.from(new Set([...prev, ...purchasedIds])));
    }
    const courseIdsInOrder = order.courses.map(item => item.id);
    setCart(prev => prev.filter(id => !courseIdsInOrder.includes(id)));
    
    saveOrders([order, ...orders]);
    
    const successNotify: Notification = {
      id: 'notif-order-' + Date.now(),
      title: order.status === 'success' ? '📈 Ghi danh tự động thành công!' : '⏳ Đơn hàng đang chờ xử lý!',
      message: order.status === 'success' 
        ? `Bạn đã ghi danh lớp học mới thành công. Hãy bắt đầu học tập ngay!`
        : `Yêu cầu thanh toán của bạn đang được lưu trữ dưới trạng thái Chờ duyệt. Hãy vào Hồ sơ để kiểm tra đơn hàng.`,
      type: 'info',
      date: 'Vừa xong',
      read: false
    };
    setNotifications([successNotify, ...notifications]);
  };

  // --- INSTRUCTOR & MODERATION CRUD DISPATCHERS ---
  const handleCreateCourseDraft = (newC: Course) => {
    setCourses(prev => [newC, ...prev]);
  };

  const handleUpdateCourse = (updatedC: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedC.id ? updatedC : c));
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleApproveCourse = (courseId: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'active' } : c));
  };

  const handleRejectCourse = (courseId: string, reason: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'rejected', rejectionReason: reason } : c));
  };

  const handleResolveFlag = (flagId: string, action: 'dismiss' | 'resolved') => {
    const activeFlag = flaggedReviews.find(f => f.id === flagId);
    if (activeFlag && action === 'resolved') {
      const { courseId, content } = activeFlag;
      if (courseId) {
        setCourses(prev => prev.map(c => {
          if (c.id === courseId) {
            return {
              ...c,
              reviews: c.reviews.filter(rev => rev.comment !== content)
            };
          }
          return c;
        }));
      }
    }
    setFlaggedReviews(prev => prev.filter(f => f.id !== flagId));
  };

  const handleApprovePayout = (requestId: string) => {
    setPayoutRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'completed' } : r));
  };

  const handleRejectPayout = (requestId: string) => {
    setPayoutRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'success' | 'pending' | 'failed') => {
    let syncedEnrolled = false;
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    saveOrders(updated);
    
    // Auto-create a notification
    const orderObj = updated.find(o => o.id === orderId);
    if (orderObj) {
      if (nextStatus === 'success') {
        const purchasedIds = orderObj.courses.map(c => c.id);
        setEnrolledCourseIds(prev => Array.from(new Set([...prev, ...purchasedIds])));
      }

      const relatedCourseId = orderObj.courses[0]?.id;
      const relatedCourse = courses.find(c => c.id === relatedCourseId);
      
      const notify: Notification = {
        id: 'notif-order-adm-' + Date.now(),
        title: nextStatus === 'success' ? '✅ Đơn hàng đã được phê duyệt!' : '❌ Giao dịch bị từ chối!',
        message: nextStatus === 'success' 
          ? `Đơn hàng #${orderId} cho khóa "${relatedCourse?.title || 'Khóa học'}" đã được phê duyệt thành công!`
          : `Giao dịch đơn hàng #${orderId} không thành công hoặc bị từ chối hoàn trả.`,
        type: 'info',
        date: 'Vừa xong',
        read: false
      };
      setNotifications(prev => [notify, ...prev]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser(prev => ({
      ...prev,
      name: editedName,
      bio: editedBio,
      phone: editedPhone,
      avatar: editedAvatar
    }));
    setIsEditingProfile(false);
    alert('Đã cập nhật hồ sơ cá nhân của bạn!');
  };

  const handleTogglePredefinedTopic = (topic: string) => {
    setCurrentUser(prev => {
      const exists = prev.interestedTopics.includes(topic);
      return {
        ...prev,
        interestedTopics: exists 
          ? prev.interestedTopics.filter(t => t !== topic) 
          : [...prev.interestedTopics, topic]
      };
    });
  };

  // Safe password change simulator
  const handleChangePassword = () => {
    alert('Mã đặt lại mật khẩu an toàn đã được mã hóa gửi về hòm thư ' + currentUser.email);
  };

  // Account closure demand simulation
  const handleRequestAccountClosure = () => {
    setClosureReason('');
    setClosureType('lock');
    setAgreeToClosureTerms(false);
    setShowAccountClosureForm(true);
  };

  const handleSubmitAccountClosureRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureReason.trim()) {
      alert('Vui lòng nhập lý do cụ thể để chúng tôi giải quyết đơn nhanh chóng nhất.');
      return;
    }
    if (!agreeToClosureTerms) {
      alert('Vui lòng xác nhận bạn chịu trách nhiệm hoàn toàn đối với các rủi ro đã nêu.');
      return;
    }

    const newReq: AccountRequest = {
      id: 'req-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      type: closureType,
      reason: closureReason.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    saveAccountRequests([newReq, ...accountRequests]);
    setShowAccountClosureForm(false);
    setIsEditingProfile(false); // also hide profile edit modal for clarity
    setToastMessage(`Gửi yêu cầu ${closureType === 'delete' ? 'XÓA VĨNH VIỄN' : 'TẠM KHÓA'} tài khoản thành công! Đơn của bạn đã được chuyển đến Ban Quản Trị Hệ Thống.`);
  };

  // --- FILTER & SORT CALC ---
  // Using state categoriesList instead of hardcoded list
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'All') {
      return Array.from(new Set(courses.map(c => c.subcategory).filter(Boolean))) as string[];
    } else {
      return Array.from(new Set(
        courses
          .filter(c => c.category === selectedCategory)
          .map(c => c.subcategory)
          .filter(Boolean)
      )) as string[];
    }
  }, [courses, selectedCategory]);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSubcat = selectedSubcategory === 'All' || c.subcategory === selectedSubcategory;
    
    // Non-active or hidden courses are invisible to standard Student role
    const isVisibleForCurrentRole = currentUser.role !== 'student' || (c.status === 'active' && !c.isHidden);

    return matchesSearch && matchesCat && matchesSubcat && isVisibleForCurrentRole;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'bestseller') return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    if (sortBy === 'priceAsc') return (a.salePrice || a.price) - (b.salePrice || b.price);
    if (sortBy === 'priceDesc') return (b.salePrice || b.price) - (a.salePrice || a.price);
    if (sortBy === 'newest') {
      const dateA = a.createdAt || (a.isNew ? '2026-05-20' : '2026-01-01');
      const dateB = b.createdAt || (b.isNew ? '2026-05-20' : '2026-01-01');
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
    if (sortBy === 'oldest') {
      const dateA = a.createdAt || (a.isNew ? '2026-05-20' : '2026-01-01');
      const dateB = b.createdAt || (b.isNew ? '2026-05-20' : '2026-01-01');
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    }
    return 0;
  });

  const coursesPerPage = 6;
  const totalCoursesPages = Math.ceil(sortedCourses.length / coursesPerPage);
  const safeCoursesPage = Math.min(Math.max(1, coursesPage), totalCoursesPages || 1);
  const paginatedCourses = sortedCourses.slice(
    (safeCoursesPage - 1) * coursesPerPage,
    safeCoursesPage * coursesPerPage
  );

  const featuredCourses = courses.filter(c => c.isFeatured && c.status === 'active' && !c.isHidden);
  const newCourses = courses.filter(c => c.isNew && c.status === 'active' && !c.isHidden);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // --- SEARCH SUGGESTIONS ENGINES ---
  const getSearchSuggestions = (query: string) => {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    
    const suggestions: { type: 'course' | 'instructor' | 'category' | 'subcategory'; value: string }[] = [];
    
    // Check categories
    const categories = ['Development', 'Design', 'Marketing', 'Artificial Intelligence'];
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(q) && !suggestions.some(s => s.value === cat && s.type === 'category')) {
        suggestions.push({ type: 'category', value: cat });
      }
    });

    // Check instructors
    const instructors = Array.from(new Set(courses.map(c => c.instructorName))) as string[];
    instructors.forEach(inst => {
      if (inst.toLowerCase().includes(q) && !suggestions.some(s => s.value === inst && s.type === 'instructor')) {
        suggestions.push({ type: 'instructor', value: inst });
      }
    });

    // Check course subcategories
    const subcats = Array.from(new Set(courses.map(c => c.subcategory))) as string[];
    subcats.forEach(sub => {
      if (sub.toLowerCase().includes(q) && !suggestions.some(s => s.value === sub && s.type === 'subcategory')) {
        suggestions.push({ type: 'subcategory', value: sub });
      }
    });

    // Check course titles
    courses.forEach(c => {
      if (c.title.toLowerCase().includes(q) && !suggestions.some(s => s.value === c.title && s.type === 'course')) {
        suggestions.push({ type: 'course', value: c.title });
      }
    });

    return suggestions.slice(0, 8); // Safe limit
  };

  const getBgmSuggestions = (query: string) => {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const allSongs = [...PRESET_SONGS, ...uploadedSongs];
    const suggestions = allSongs
      .filter(song => song.title.toLowerCase().includes(q))
      .map(song => ({ id: song.id, title: song.title, songObj: song }));
    return suggestions.slice(0, 5);
  };

  const handleSelectSuggestion = (item: { type: 'course' | 'instructor' | 'category' | 'subcategory'; value: string }) => {
    if (item.type === 'category') {
      setSelectedCategory(item.value);
      setSelectedSubcategory('All');
      setSearchQuery('');
    } else if (item.type === 'subcategory') {
      const parentCourse = courses.find(c => c.subcategory === item.value);
      if (parentCourse) {
        setSelectedCategory(parentCourse.category);
      } else {
        setSelectedCategory('All');
      }
      setSelectedSubcategory(item.value);
      setSearchQuery('');
    } else {
      setSearchQuery(item.value);
      setSelectedCategory('All');
      setSelectedSubcategory('All');
    }
    setShowMainSuggestions(false);
    
    // Scroll automatically 
    setTimeout(() => {
      const el = document.getElementById('available-courses-section') || document.getElementById('courses-explorer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const handleSelectInstructorCourses = (name: string) => {
    setSearchQuery(name);
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setTimeout(() => {
      const el = document.getElementById('available-courses-section') || document.getElementById('courses-explorer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col text-main-darker selection:bg-brand-light-active selection:text-brand-dark relative overflow-hidden">
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Creative moving color frames / background organic blobs to keep interface breathing and airy */}
      <div className="absolute top-24 left-[-15%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-[#f5ece3] to-[#f7ede2] opacity-65 blur-3xl animate-drift-blob-1 pointer-events-none select-none z-0"></div>
      <div className="absolute top-[42rem] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-[#eedecf] to-white opacity-55 blur-3xl animate-drift-blob-2 pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-[20rem] left-[15%] w-[48rem] h-[48rem] rounded-full bg-gradient-to-tr from-[#fbf9f6] to-[#f5ece3] opacity-60 blur-3xl animate-drift-blob-1 pointer-events-none select-none z-0"></div>
      
      {/* Decorative vintage SVG coffee grid patterns to prevent blank emptiness */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none z-0 bg-[radial-gradient(#432c28_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
      
      {/* 🔮 INTERACTIVE ROLE SWITCHER TOP BAR (PROPOSAL ONLY SANDBOX) */}
      <div className="bg-main-darker text-[#eceaea] p-2.5 px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs border-b border-brand-light/15 shrink-0 select-none z-10">
        <div className="flex items-center gap-1.5 font-light">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          <span><b>Hộp cát thử nghiệm (Role Simulator Tab):</b> Thử nhanh các phân quyền UI MindHub</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            id="role-switch-student"
            onClick={() => handleSwitchRole('student')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${currentUser.role === 'student' ? 'bg-brand-normal text-brand-light scale-105 shadow' : 'bg-[#e3dfdf]/15 hover:bg-[#e3dfdf]/25'}`}
          >
            Học viên
          </button>
          <button 
            id="role-switch-instructor"
            onClick={() => handleSwitchRole('instructor')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${currentUser.role === 'instructor' ? 'bg-brand-normal text-brand-light scale-105 shadow' : 'bg-[#e3dfdf]/15 hover:bg-[#e3dfdf]/25'}`}
          >
            Giảng viên
          </button>
          <button 
            id="role-switch-admin"
            onClick={() => handleSwitchRole('admin')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${currentUser.role === 'admin' ? 'bg-brand-normal text-brand-light scale-105 shadow' : 'bg-[#e3dfdf]/15 hover:bg-[#e3dfdf]/25'}`}
          >
            Admin hệ thống
          </button>
        </div>
      </div>

      {/* --- SITE NAVIGATION HEADER --- */}
      <header className="bg-white border-b border-brand-light-active py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        
        {/* Logo / Brand Name */}
        <button 
          onClick={() => { setViewedCourse(null); setStudyingCourse(null); }}
          className="flex items-center gap-2.5 text-deep-indigo group select-none text-left shrink-0 animate-fade-in"
        >
          <div className="p-2.5 bg-pale-cyan rounded-xl group-hover:bg-brand-light-hover transition-colors flex items-center justify-center border border-emerald-250/30">
            <Globe className="w-5 h-5 text-forest-teal animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div className="hidden xs:block">
            <span className="font-suisseintl font-black text-lg md:text-2xl tracking-tighter text-deep-ink leading-none block select-none">MindHub</span>
            <span className="text-[9px] text-slate font-suisseintlmono block mt-0.5 uppercase tracking-wide">Hệ thống Đào tạo & Quản trị Tri thức</span>
          </div>
        </button>

        {/* Beautiful Header Search Bar */}
        <div className="flex-1 max-w-[140px] xs:max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4 relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm bài khóa, giảng viên..."
              value={searchQuery}
              onFocus={() => setShowMainSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowMainSuggestions(true);
                if (e.target.value.length > 0) {
                  const el = document.getElementById('available-courses-section') || document.getElementById('courses-explorer');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              className="w-full text-[11px] sm:text-xs pl-8 sm:pl-9 pr-7 py-1.5 bg-stone-50 hover:bg-stone-50/70 border border-brand-light-active rounded-xl focus:bg-white focus:ring-1 focus:ring-deep-indigo focus:border-deep-indigo focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowMainSuggestions(false);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] text-stone-400 hover:text-deep-indigo font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* SUGGESTIONS MENU OVERLAY */}
          {showMainSuggestions && searchQuery.trim().length > 0 && (
            <>
              <div className="fixed inset-0 z-30 cursor-default bg-transparent" onClick={() => setShowMainSuggestions(false)} />
              <div tabIndex={-1} className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e8ded3] rounded-2xl shadow-xl z-40 max-h-72 overflow-y-auto divide-y divide-[#e8ded3]/30 text-left py-1">
                {(() => {
                  const list = getSearchSuggestions(searchQuery);
                  if (list.length === 0) {
                    return (
                      <div className="p-3.5 text-[11px] text-stone-400 italic text-center">
                        Không tìm thấy gợi ý trùng khớp.
                      </div>
                    );
                  }
                  return list.map((item, idx) => {
                    let badgeColor = "bg-stone-50 text-stone-600";
                    let typeLabel = "Bài học";
                    if (item.type === 'category') {
                      badgeColor = "bg-amber-150 text-amber-900";
                      typeLabel = "Danh mục";
                    } else if (item.type === 'instructor') {
                      badgeColor = "bg-emerald-150 text-emerald-900";
                      typeLabel = "Giảng viên";
                    } else if (item.type === 'subcategory') {
                      badgeColor = "bg-sky-150 text-sky-900";
                      typeLabel = "Chuyên đề";
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full px-3.5 py-2.5 hover:bg-[#faf6f2] flex items-center justify-between transition-colors gap-2 text-left cursor-pointer border-none"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="text-xs font-semibold text-stone-800 truncate leading-snug animate-none">
                            {item.value}
                          </span>
                        </div>
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shrink-0 ${badgeColor}`}>
                          {typeLabel}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </div>

        {/* Global actions row */}
        <div className="flex items-center gap-2 md:gap-4 text-xs">

          {/* Spinning Music Disc Button */}
          <div className="relative">
            {showMusicHint && (
              <div className="absolute top-full mt-3 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-56 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl shadow-lg z-50 text-left animate-bounce duration-1000">
                {/* Little triangle arrow pointing up */}
                <div className="absolute bottom-full right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 -mb-[5px] w-2 h-2 bg-amber-50 border-l border-t border-amber-200/80 rotate-45" />
                <div className="flex gap-1.5 items-start">
                  <span className="text-xs shrink-0 select-none animate-pulse">🎵</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#432c28] leading-tight">Góc chill nhạc nền!</p>
                    <p className="text-[9px] text-stone-600 mt-0.5 leading-relaxed">Bạn có thể bật nhạc Lofi ấm áp tại đây khi tự học nhé!</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMusicHint(false);
                    }}
                    className="text-[9px] text-[#8b5e3c] font-black h-4 w-4 hover:bg-amber-100 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    title="Đóng"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div 
              className="flex items-center gap-1.5 bg-[#faf6f2] hover:bg-[#eedecf] border border-[#e8ded3] rounded-full pl-1.5 pr-2.5 py-1 transition-all cursor-pointer select-none"
              onClick={() => setShowMusicMenu(!showMusicMenu)}
              title="Nhấn để chọn nhạc nền / gắn link YouTube phát nhạc"
            >
              
              {/* CD Disc Rotating Element */}
              <div 
                className={`w-6 h-6 rounded-full bg-[#432c28] flex items-center justify-center shrink-0 ${isPlayingMusic ? 'animate-spin-slow' : ''}`}
                style={{ animationPlayState: isPlayingMusic ? 'running' : 'paused' }}
              >
                {/* 2D monochrome CD center hole indicator inside the vinyl disc design */}
                <span className="w-1.5 h-1.5 rounded-full bg-[#fbf9f6]" />
              </div>

              {/* Text metadata */}
              <div className="text-left leading-tight hidden sm:block max-w-[90px] md:max-w-[120px]">
                <span className="block text-[8px] text-stone-405 font-mono font-bold tracking-wider uppercase leading-none">Bản nhạc BGM</span>
                <span className="block text-[10px] text-[#432c28] font-bold truncate leading-snug">{currentSong.title.substring(2)}</span>
              </div>
            </div>

            {/* Quick Play/Pause button right next to it */}
            <button 
              onClick={togglePlayMusic}
              className={`absolute -bottom-1 -right-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-bold border shadow-xs transition-transform hover:scale-110 cursor-pointer z-10 ${isPlayingMusic ? 'bg-amber-100 text-[#8b5e3c] border-[#e8ded3]' : 'bg-white text-stone-500 border-stone-300'}`}
              title={isPlayingMusic ? "Tạm dừng nhạc" : "Bật phát nhạc nền"}
            >
              {isPlayingMusic ? '⏸' : '▶'}
            </button>

            {/* Float menu for BGM selection & custom Youtube linking */}
            {showMusicMenu && (
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 text-left"
                onClick={() => setShowMusicMenu(false)}
              >
                <div 
                  className="bg-[#fbf9f6] rounded-2xl w-full max-w-2xl border border-[#e8ded3] p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto tactile-scrollbar flex flex-col animate-scale-up text-xs text-stone-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center border-b border-[#e8ded3]/80 pb-2.5">
                    <span className="font-bold flex items-center gap-2 text-[#432c28]">
                      <Music className="w-4 h-4 text-[#8b5e3c]" /> Nhạc Nền Trang Web
                    </span>
                    <button 
                      onClick={() => setShowMusicMenu(false)}
                      className="text-[11px] text-[#8b5e3c] hover:text-black font-extrabold hover:bg-stone-200/50 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                  {/* Left Column: Trạng thái phát & Nút điều khiển */}
                  <div className="space-y-3">
                    <span className="block text-[8.5px] text-[#8b5e3c] uppercase tracking-widest font-extrabold pb-0.5 border-b border-[#e8ded3]/55">Bản Nhạc Hiện Tại:</span>
                    
                    {/* Playing state Indicator widget */}
                    <div className="bg-[#faf6f2] border border-[#e8ded3]/60 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-[#432c28] flex items-center justify-center shrink-0 ${isPlayingMusic ? 'animate-spin-slow' : ''}`}>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#fbf9f6]" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="block text-[8px] text-stone-450 font-mono font-bold leading-none uppercase">Đang phát:</span>
                          <span className="block text-[11px] font-bold text-[#432c28] truncate mt-1" title={currentSong.title}>{currentSong.title}</span>
                        </div>
                      </div>

                      {/* Dynamic Progress Slider */}
                      <div className="space-y-1">
                        <div className="relative w-full h-1.5 bg-stone-200 rounded-lg group cursor-pointer overflow-hidden">
                          <input
                            type="range"
                            min="0"
                            max={musicDuration || 100}
                            value={musicCurrentTime}
                            onChange={(e) => handleSeekMusic(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title="Tua nhạc"
                          />
                          <div 
                            className="absolute left-0 top-0 h-full bg-[#8b5e3c] rounded-lg pointer-events-none transition-all duration-75"
                            style={{ width: `${musicDuration ? (musicCurrentTime / musicDuration) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[7.5px] text-stone-450 font-mono font-bold leading-none select-none">
                          <span>{formatTime(musicCurrentTime)}</span>
                          <span>{musicDuration > 0 ? formatTime(musicDuration) : '--:--'}</span>
                        </div>
                      </div>

                      {/* Controller Playback Actions Row */}
                      <div className="flex items-center justify-center gap-3 pt-1.5 border-t border-[#e8ded3]/40">
                        {/* Loop song button */}
                        <button
                          type="button"
                          onClick={() => setIsLoopingSingle(!isLoopingSingle)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            isLoopingSingle 
                              ? 'bg-[#8b5e3c]/15 text-[#8b5e3c] border border-[#8b5e3c]/35 font-bold' 
                              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100 border border-transparent'
                          }`}
                          title={isLoopingSingle ? "Đang bật lặp lại một bài (Tắt để tự động chuyển tiếp)" : "Đang tắt lặp bài (Bật để lặp lại một bài)"}
                        >
                          <Repeat className="w-3.5 h-3.5" />
                        </button>

                        {/* Previous Song */}
                        <button
                          type="button"
                          onClick={handlePrevSong}
                          className="p-1.5 rounded-lg text-[#432c28] hover:text-[#8b5e3c] hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Bài trước"
                        >
                          <SkipBack className="w-3.5 h-3.5" />
                        </button>

                        {/* Play / Pause Toggle */}
                        <button
                          type="button"
                          onClick={() => togglePlayMusic()}
                          className="w-8 h-8 rounded-full bg-[#432c28] hover:bg-[#8b5e3c] text-white flex items-center justify-center font-bold shadow-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                          title={isPlayingMusic ? "Tạm dừng" : "Phát"}
                        >
                          {isPlayingMusic ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />}
                        </button>

                        {/* Next Song */}
                        <button
                          type="button"
                          onClick={handleNextSong}
                          className="p-1.5 rounded-lg text-[#432c28] hover:text-[#8b5e3c] hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Bài tiếp theo"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      {/* Small state feedback mode labels */}
                      <div className="text-[8.5px] text-[#8b5e3c]/90 text-center leading-none italic select-none font-semibold">
                        Chế độ: {isLoopingSingle ? '🔁 Lặp 1 bài' : '🔀 Tự động chuyển tiếp'}
                      </div>
                    </div>

                    {/* Volume Slider for BGM / YouTube Audio control */}
                    <div className="space-y-1.5 bg-[#faf6f2]/40 border border-[#e8ded3]/30 rounded-xl p-2.5 text-[9.5px]">
                      <div className="flex justify-between items-center text-stone-450 font-medium leading-none mb-1">
                        <span>Âm lượng ({currentSong.isYoutube ? 'YouTube' : 'BGM'}):</span>
                        <span className="font-bold">{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <VolumeX className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05" 
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                          className="w-full h-1 bg-[#e8ded3] rounded-lg appearance-none cursor-pointer accent-[#8b5e3c]"
                        />
                        <Volume2 className="w-3.5 h-3.5 text-[#8b5e3c] shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Thư viện & Chức năng tải lên / Youtube */}
                  <div className="space-y-3 lg:border-l lg:border-[#e8ded3]/60 lg:pl-4">
                    {/* Search bar inside BGM menu */}
                    <div className="space-y-1">
                      <span className="block text-[8.5px] text-[#8b5e3c]/85 uppercase tracking-widest font-extrabold font-mono font-medium">Tìm kiếm bài hát:</span>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm tên bài hát ở dưới..."
                          value={bgmSearchQuery}
                          onFocus={() => setShowBgmSuggestions(true)}
                          onChange={(e) => {
                            setBgmSearchQuery(e.target.value);
                            setShowBgmSuggestions(true);
                          }}
                          className="w-full text-[10px] pl-7 pr-6 py-1.5 bg-white border border-stone-305 focus:border-[#8b5e3c] focus:outline-none rounded-lg text-stone-800 font-medium"
                        />
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        {bgmSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setBgmSearchQuery('');
                              setShowBgmSuggestions(false);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 font-bold p-0.5 text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        )}

                        {/* BGM SUGGESTIONS OVERLAY */}
                        {showBgmSuggestions && bgmSearchQuery.trim().length > 0 && (
                          <>
                            <div className="fixed inset-0 z-30 cursor-default bg-transparent" onClick={() => setShowBgmSuggestions(false)} />
                            <div tabIndex={-1} className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e8ded3] rounded-xl shadow-lg z-45 max-h-40 overflow-y-auto divide-y divide-[#e8ded3]/30 text-left py-1">
                              {(() => {
                                const list = getBgmSuggestions(bgmSearchQuery);
                                if (list.length === 0) {
                                  return (
                                    <p className="p-2 text-[10px] text-stone-400 italic text-center">Không tìm thấy bài hát nào.</p>
                                  );
                                }
                                return list.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      setCurrentSong(item.songObj);
                                      setIsPlayingMusic(true);
                                      setBgmSearchQuery(item.title);
                                      setShowBgmSuggestions(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 hover:bg-[#faf6f2]/80 text-[10px] text-stone-700 font-medium truncate flex items-center gap-1.5 transition-colors text-left border-none cursor-pointer"
                                  >
                                    <Music className="w-3 h-3 text-[#8b5e3c] shrink-0" />
                                    <span className="truncate">{item.title}</span>
                                  </button>
                                ));
                              })()}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preset tracks */}
                    <div className="space-y-1">
                      <span className="block text-[8.5px] text-[#8b5e3c]/85 uppercase tracking-widest font-extrabold font-mono font-medium">Thư viện nhạc:</span>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1.5 tactile-scrollbar">
                        {(() => {
                          const filtered = PRESET_SONGS.filter(song => 
                            song.title.toLowerCase().includes(bgmSearchQuery.toLowerCase())
                          );
                          if (filtered.length === 0) {
                            return <p className="text-[9px] text-stone-400 italic text-center py-1">Không tìm thấy bài hát nào.</p>;
                          }
                          return filtered.map((song) => {
                            const isCurrent = song.id === currentSong.id;
                            return (
                              <button
                                key={song.id}
                                onClick={() => {
                                  setCurrentSong(song);
                                  setIsPlayingMusic(true);
                                }}
                                className={`w-full text-left p-1.5 rounded-lg text-[10px] font-medium flex items-center justify-between transition-colors border cursor-pointer ${
                                  isCurrent 
                                    ? 'bg-[#faf6f2] border-[#8b5e3c] text-[#8b5e3c]' 
                                    : 'bg-white hover:bg-[#faf6f2]/40 border-stone-200 text-stone-600'
                                }`}
                              >
                                <span className="truncate">{song.title}</span>
                                {isCurrent && <span className="text-[10px] animate-pulse">🎵</span>}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* User uploaded tracks */}
                    <div className="space-y-1 border-t border-[#e8ded3]/50 pt-2 text-stone-800">
                      <span className="block text-[8.5px] text-[#8b5e3c]/85 uppercase tracking-widest font-extrabold font-mono font-medium">Nhạc tải lên (lưu 1 tuần):</span>
                      {(() => {
                        const filtered = uploadedSongs.filter(song => 
                          song.title.toLowerCase().includes(bgmSearchQuery.toLowerCase())
                        );
                        if (filtered.length === 0) {
                          return (
                            <p className="text-[9px] text-stone-400 italic text-center py-1">
                              {bgmSearchQuery ? 'Không tìm thấy bài hát nào.' : 'Chưa tải lên bài hát nào.'}
                            </p>
                          );
                        }
                        return (
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1.5 tactile-scrollbar">
                            {filtered.map((song) => {
                              const isCurrent = song.id === currentSong.id;
                              return (
                                <div
                                  key={song.id}
                                  onClick={() => {
                                    setCurrentSong(song as any);
                                    setIsPlayingMusic(true);
                                  }}
                                  className={`w-full text-left p-1.5 rounded-lg text-[9.5px] font-medium flex items-center justify-between transition-colors border cursor-pointer group ${
                                    isCurrent 
                                      ? 'bg-[#faf6f2] border-[#8b5e3c] text-[#8b5e3c]' 
                                      : 'bg-white hover:bg-[#faf6f2]/40 border-stone-200 text-stone-600'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0 pr-2">
                                    <span className="block truncate font-medium">{song.title.replace(/^🎵 /, '')}</span>
                                    <span className="block text-[7.5px] text-stone-400 font-mono mt-0.5">{getRemainingDays(song.expiresAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {isCurrent && <span className="text-[10px] animate-pulse mr-1">🎵</span>}
                                    <button
                                      onClick={(e) => handleDeleteSong(song.id, e)}
                                      className="p-1 text-stone-400 hover:text-red-500 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                                      title="Xóa bài hát"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Upload Section Box */}
                    <div className="space-y-1 border-t border-[#e8ded3]/50 pt-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".mp3" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full py-1.5 px-3 border border-dashed rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#faf6f2]/60 hover:border-[#8b5e3c] group transition-all text-stone-605 cursor-pointer ${
                          isUploading ? 'border-amber-300 bg-[#faf6f2]/30 cursor-not-allowed' : 'border-stone-300 md:border-dashed'
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 text-[#8b5e3c] animate-spin" />
                            <span className="text-[9.5px] font-bold text-[#8b5e3c]">Đang tải và kiểm tra...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#8b5e3c] transition-colors" />
                            <span className="text-[9.5px] font-bold group-hover:text-[#8b5e3c] transition-colors">Tải lên file .mp3 (Dưới 6 phút)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* YouTube Link Integration section */}
                    <form onSubmit={handlePlayCustomYt} className="space-y-1.5 border-t border-[#e8ded3]/50 pt-2">
                      <span className="block text-[8.5px] text-stone-450 uppercase tracking-widest font-extrabold">Từ YouTube:</span>
                      <div className="flex gap-1.5">
                        <input 
                          type="text" 
                          placeholder="Mã video id hoặc đường link YouTube..." 
                          value={ytUrlInput}
                          onChange={(e) => setYtUrlInput(e.target.value)}
                          className="flex-1 text-[9.5px] px-2 py-1 bg-white border border-stone-300 focus:border-[#8b5e3c] focus:outline-none rounded-lg text-stone-800"
                        />
                        <button 
                          type="submit"
                          className="bg-[#432c28] hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
                        >
                          Phát
                        </button>
                      </div>
                    </form>

                    {/* Notification Banner */}
                    {musicNotification && (
                      <div className={`p-1.5 rounded-lg text-[9.5px] font-bold text-center border leading-snug animate-fade-in ${
                        musicNotification.type === 'success' 
                          ? 'bg-[#f4fbf7] text-[#1b6b45] border-[#d4eedc]' 
                          : 'bg-[#fff5f5] text-[#b32b2b] border-[#fcd5d5]'
                      }`}>
                        {musicNotification.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {currentUser.role === 'student' && (
            <>
              {/* Favorites trigger count - Clickable overlay modal */}
              <button 
                onClick={() => {
                  setShowCart(true);
                }}
                className="relative p-2 text-deep-indigo hover:text-deep-indigo/90 transition-colors"
                title="Sản phẩm yêu thích"
              >
                <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-deep-indigo text-deep-indigo' : 'text-stone-500'}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-deep-indigo text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Help Center icon button trigger */}
          <button 
            onClick={() => setShowLegal('faq')}
            className="p-2 text-stone-750 hover:text-[#8b5e3c] relative flex items-center justify-center cursor-pointer transition-colors"
            title="Trung tâm Trợ giúp, FAQ và Tài liệu chính sách"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications tray badge button toggle - Monochrome styled */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-stone-750 hover:text-black relative"
              title="Thông báo cá nhân"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => {
                if (!n.targetCourseId || n.targetCourseId === 'all') return true;
                return enrolledCourseIds.includes(n.targetCourseId);
              }).filter(n => !n.read).length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-stone-850 rounded-full"></span>
              )}
            </button>

            {/* Notification drop menu layout */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-xl border border-brand-light-active p-4 space-y-3 z-50 text-left text-xs animate-fade-in text-main-darker">
                <div className="flex justify-between items-center border-b border-brand-light-active pb-2">
                  <span className="font-bold flex items-center gap-1">🔔 Thông báo cá nhân</span>
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      alert('Đã đánh dấu đọc tất cả!');
                    }}
                    className="text-[10px] text-brand-normal hover:underline font-semibold"
                  >
                    Xem tất cả & Đọc
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(() => {
                    const filteredNotifs = notifications.filter(n => {
                      if (!n.targetCourseId || n.targetCourseId === 'all') return true;
                      return enrolledCourseIds.includes(n.targetCourseId);
                    });

                    if (filteredNotifs.length === 0) {
                      return (
                        <div className="py-8 text-center text-stone-400 font-bold">
                          Chưa có thông báo mới nào.
                        </div>
                      );
                    }

                    return filteredNotifs.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 rounded-xl text-xs leading-normal relative border ${n.read ? 'bg-white border-brand-light' : 'bg-brand-light/35 border-brand-light-active font-medium'}`}
                      >
                        <h4 className="text-[11px] font-bold text-main-normal flex items-center gap-1">
                          {n.targetCourseId && n.targetCourseId !== 'all' && (
                            <span className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded text-[8.5px] font-black scale-95 shrink-0 block">LỚP</span>
                          )}
                          {n.title}
                        </h4>
                        <p className="text-[10.5px] text-gray-500 mt-0.5">{n.message}</p>
                        <span className="block text-[8px] text-gray-400 mt-1">{n.date}</span>
                      </div>
                    ));
                  })()}
                </div>

                {/* Simulated notifications toggle setting switcher */}
                <div className="border-t border-brand-light-active pt-2 text-[10px] space-y-1 text-gray-400">
                  <div className="flex justify-between items-center">
                    <span>Nhận thông báo email</span>
                    <input 
                      type="checkbox" 
                      checked={currentUser.notificationSettings.email}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setCurrentUser(prev => ({
                          ...prev,
                          notificationSettings: { ...prev.notificationSettings, email: val }
                        }));
                      }}
                      className="rounded text-brand-normal scale-90"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Nhắc nhở lịch học liên kết</span>
                    <input 
                      type="checkbox" 
                      checked={currentUser.notificationSettings.scheduleReminders}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setCurrentUser(prev => ({
                          ...prev,
                          notificationSettings: { ...prev.notificationSettings, scheduleReminders: val }
                        }));
                        alert(val ? 'Đã bật nhắc nhở lịch học!' : 'Đã tắt nhắc lịch!');
                      }}
                      className="rounded text-brand-normal scale-90"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profiles Avatar and Role info */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-brand-light-active select-none shrink-0 font-sans">
              <button 
                onClick={() => {
                  setShowAuth(true);
                }}
                className="px-3 py-1.5 border border-stone-250 bg-white hover:bg-stone-50 text-stone-700 font-bold text-[10px] md:text-[11px] rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                Đăng Nhập
              </button>
              <button 
                onClick={() => {
                  setShowAuth(true);
                }}
                className="px-3.5 py-1.5 bg-[#432c28] hover:bg-black text-brand-light hover:text-white font-bold text-[10px] md:text-[11px] rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                Đăng ký
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-brand-light-active shrink-0">
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 group text-left cursor-pointer"
              >
                <img src={currentUser.avatar} alt="User Avatar" className="w-8 h-8 rounded-full border border-brand-light-active object-cover" />
                <div className="hidden md:block">
                  <span className="font-bold block tracking-tight truncate max-w-28 text-main-normal leading-none group-hover:text-brand-normal">{currentUser.name}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono font-bold mt-1.5 block">{currentUser.role}</span>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  setShowLogoutConfirm(true);
                }}
                className="p-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

        </div>
      </header>

      {/* --- SIDEBAR AND PERSPECTIVES ROUTING SWAP --- */}
      <main className="flex-1 p-4 md:p-12 max-w-7xl mx-auto w-full space-y-10 relative z-10">

        {/* 🎬 INTRODUCTORY CINEMATIC SHOWCASE VIDEO POPUP */}
        {showIntroVideo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[9999] flex items-center justify-center p-3 sm:p-5 animate-fade-in">
            <div className="bg-[#1c1410] border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-scale-up aspect-video sm:aspect-[16/10] md:aspect-video flex flex-col">
              
              {/* Close Button & Header Overlays */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-2">
                {/* Countdown visual if ended */}
                {introAutoCloseCountdown !== null ? (
                  <span className="bg-amber-500/90 text-[10px] text-white font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
                     <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                     Tự tắt sau {introAutoCloseCountdown}s
                  </span>
                ) : (
                  <span className="bg-black/60 backdrop-blur-md border border-stone-700/50 text-[9px] text-stone-300 font-mono font-bold px-2.5 py-1 rounded-full">
                    Góc giới thiệu • {Math.min(Math.floor(introVideoTime), 12)}s / 12s
                  </span>
                )}
                
                <button
                  onClick={() => {
                    setShowIntroVideo(false);
                    setIntroAutoCloseCountdown(null);
                    if (introVideoRef.current) {
                      introVideoRef.current.pause();
                    }
                  }}
                  className="bg-black/65 hover:bg-black/90 text-white/95 border border-stone-700/60 p-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer font-extrabold text-[12px] hover:scale-105"
                  title="Nhấn để đóng sớm"
                >
                  ✕
                </button>
              </div>

              {/* The Cinematic Stock Video Loop */}
              <div 
                className="flex-1 w-full relative group cursor-pointer overflow-hidden"
                onClick={() => {
                  if (INTRO_VIDEO_URL) {
                    if (introVideoRef.current) {
                      if (introVideoRef.current.paused) {
                        introVideoRef.current.play().catch(err => console.warn(err));
                      } else {
                        introVideoRef.current.pause();
                      }
                    }
                  } else {
                    setIntroVideoPaused(prev => !prev);
                  }
                }}
              >
                {INTRO_VIDEO_URL ? (
                  <video
                    ref={introVideoRef}
                    src={INTRO_VIDEO_URL}
                    className="w-full h-full object-cover object-center scale-[1.01] brightness-[0.7] transition-all"
                    loop={false}
                    muted={true}
                    playsInline={true}
                    autoPlay={true}
                    preload="auto"
                    onPlay={() => setIntroVideoPaused(false)}
                    onPause={() => setIntroVideoPaused(true)}
                    onTimeUpdate={() => {
                      if (introVideoRef.current) {
                        const cur = introVideoRef.current.currentTime;
                        setIntroVideoTime(cur);
                        if (cur >= 12 && introAutoCloseCountdown === null) {
                          introVideoRef.current.pause();
                          setIntroAutoCloseCountdown(3);
                        }
                      }
                    }}
                    onEnded={() => {
                      if (introAutoCloseCountdown === null) {
                        setIntroAutoCloseCountdown(3);
                      }
                    }}
                  />
                ) : (
                  /* GORGEOUS CINEMATIC PLACEHOLDER SIMULATION */
                  <div className="w-full h-full bg-[#1c1410] relative flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden h-full">
                    {/* Golden particles & orbital glow to signify digital classroom environment */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,94,60,0.15)_0%,transparent_70%)] animate-pulse pointer-events-none" />
                    
                    {/* Rotating soft glow rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#8b5e3c]/10 rounded-full animate-spin [animation-duration:30s] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-dashed border-[#8b5e3c]/5 rounded-full animate-spin [animation-duration:45s] pointer-events-none" />

                    {/* Cute micro mockup cards inside */}
                    <div className="relative space-y-4 z-10 transition-transform duration-500 hover:scale-[1.02]">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8b5e3c] to-[#eedecf]/80 shadow-2xl flex items-center justify-center relative animate-bounce [animation-duration:4s]">
                          {/* Inner icon like computer or play button */}
                          <svg className="w-8 h-8 text-[#1c1410]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                          </svg>
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[8px] text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Demo</span>
                        </div>
                      </div>

                      <div className="space-y-1 max-w-sm">
                        <span className="block text-[9px] text-[#eedecf] uppercase tracking-widest font-mono font-black bg-stone-900/60 border border-stone-800 px-3 py-1 rounded-full w-max mx-auto shrink-0 shadow-inner">
                          🎥 MÀN HÌNH CHAO ĐÓN GIỚI THIỆU
                        </span>
                        <h4 className="text-base font-extrabold text-[#eedecf] font-serif italic mt-2">
                          Sẵn sàng cho tệp tin video của bạn!
                        </h4>
                        <p className="text-[10.5px] text-stone-300 leading-relaxed max-w-xs mx-auto pt-0.5 font-sans">
                          Sửa đổi dòng <code className="bg-stone-900/80 px-1 py-0.5 rounded text-[#eedecf] font-mono text-[9.5px]">INTRO_VIDEO_URL</code> trong <code className="bg-stone-900/80 px-1 py-0.5 rounded text-amber-400 font-mono text-[9.5px]">src/App.tsx</code> bất kỳ lúc nào để liên kết trực tiếp video của bạn.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtile Central Play-State Prompt Overlay */}
                {introVideoPaused && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 animate-fade-in pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-xl animate-pulse backdrop-blur-xs">
                      <span className="text-xl ml-1">▶</span>
                    </div>
                    <span className="text-[10px] text-amber-100 font-bold tracking-wider uppercase mt-3 filter drop-shadow">
                      Bấm để tiếp tục xem giới thiệu
                    </span>
                  </div>
                )}

                {/* Ambient vignette background shadow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30 pointer-events-none" />

                {/* CINEMATIC CAPTIONS OVERLAY (Synchronized with introVideoTime) */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8 space-y-2 pointer-events-none text-left">
                  {/* Dynamic Slide indicators */}
                  <div className="flex gap-1 mb-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const isActive = Math.min(Math.floor(introVideoTime / 3), 3) === idx;
                      return (
                        <div 
                          key={idx} 
                          className={`h-1 rounded-full transition-all duration-300 ${isActive ? 'w-6 bg-[#eedecf]' : 'w-2 bg-stone-600/60'}`} 
                        />
                      );
                    })}
                  </div>

                  {/* Caption Content */}
                  {Math.min(Math.floor(introVideoTime / 3), 3) === 0 && (
                    <div className="animate-fade-in-up space-y-1.5">
                      <span className="text-[10px] text-[#eedecf] font-extrabold tracking-widest uppercase font-mono bg-[#8b5e3c]/50 px-2.5 py-0.5 rounded-full inline-block backdrop-blur-xs">
                        ✦ THẾ GIỚI HỌC TẬP ✦
                      </span>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight font-serif italic">
                        Bứt phá giới hạn tự học tại MindHub
                      </h2>
                      <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-sans max-w-lg">
                        Không gian trực tuyến tinh túy kết hợp giữa tri học truyền thống và công nghệ giáo dục hiện đại.
                      </p>
                    </div>
                  )}

                  {Math.min(Math.floor(introVideoTime / 3), 3) === 1 && (
                    <div className="animate-fade-in-up space-y-1.5">
                      <span className="text-[10px] text-[#eedecf] font-extrabold tracking-widest uppercase font-mono bg-[#8b5e3c]/50 px-2.5 py-0.5 rounded-full inline-block backdrop-blur-xs">
                        ⚡ TIỆN ÍCH ĐỘC BẢN ⚡
                      </span>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight font-serif italic">
                        Chương trình & Tiến trình cá nhân hóa
                      </h2>
                      <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-sans max-w-lg">
                        Học viên theo dõi cụ thể tiến độ với bài giảng trực quan, làm bài thực hành chuẩn mực cao.
                      </p>
                    </div>
                  )}

                  {Math.min(Math.floor(introVideoTime / 3), 3) === 2 && (
                    <div className="animate-fade-in-up space-y-1.5">
                      <span className="text-[10px] text-[#eedecf] font-extrabold tracking-widest uppercase font-mono bg-[#8b5e3c]/50 px-2.5 py-0.5 rounded-full inline-block backdrop-blur-xs">
                        ☕ GÓC CHILL HOÀN HẢO ☕
                      </span>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight font-serif italic">
                        Học sâu tập trung cùng Lofi BGM
                      </h2>
                      <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-sans max-w-lg">
                        Sở hữu quầy pha trà, espresso thư thái và thư viện nhạc nền đa dạng cho cảm hứng bay bổng.
                      </p>
                    </div>
                  )}

                  {Math.min(Math.floor(introVideoTime / 3), 3) === 3 && (
                    <div className="animate-fade-in-up space-y-1.5">
                      <span className="text-[10px] text-[#eedecf] font-extrabold tracking-widest uppercase font-mono bg-[#8b5e3c]/50 px-2.5 py-0.5 rounded-full inline-block backdrop-blur-xs">
                        🔥 KHỞI ĐỘNG ĐAM MÊ 🔥
                      </span>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight font-serif italic">
                        Kiến tạo tương lai tri thức của bạn
                      </h2>
                      <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-sans max-w-lg">
                        Lựa chọn học phần, rèn luyện chăm chỉ và thăng hoa mỗi ngày ngay trên hòn đảo học tập này!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gold Progress Visual Anchor at bottom of player */}
              <div className="h-1 bg-stone-800 w-full relative">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-100 ease-out" 
                  style={{ width: `${Math.min((introVideoTime / 12) * 100, 100)}%` }}
                />
              </div>

            </div>
          </div>
        )}

        {/* Profile Edit Modal overlays */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            
            {showPasswordPage ? (
              // 🔒 SAFE PASSWORD CHANGE VIEW SUBPAGE
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 space-y-4 text-left text-xs text-main-darker animate-fade-in border shadow-2xl relative max-h-[85vh] overflow-y-auto tactile-scrollbar">
                <h3 className="font-display font-semibold text-[#8b5e3c] text-sm flex items-center gap-1.5 border-b pb-2">
                   <Lock className="w-4 h-4 text-[#8b5e3c]" /> Đặt Lại Mật Khẩu Tài Khoản
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Mật khẩu hiện tại:</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs px-3 py-2 border rounded-xl bg-white text-stone-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Mật khẩu mới:</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full text-xs px-3 py-2 border rounded-xl bg-white text-stone-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Xác nhận mật khẩu mới:</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full text-xs px-3 py-2 border rounded-xl bg-white text-stone-800"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowPasswordPage(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }} 
                    className="px-4 py-2 border rounded-xl bg-slate-50 cursor-pointer text-stone-700 hover:bg-stone-100 font-bold transition-all"
                  >
                    Quay lại
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!oldPassword || !newPassword || !confirmPassword) {
                        alert('Vui lòng điền đầy đủ cả 3 loại mật khẩu!');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        alert('Mật khẩu mới và Nhập lại mật khẩu không trùng khớp!');
                        return;
                      }
                      alert('Cập nhật mật khẩu mới thành công!');
                      setShowPasswordPage(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-4 py-2 bg-[#432c28] hover:bg-black text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Xác nhận Đổi
                  </button>
                </div>
              </div>
            ) : (
              // ⚙️ STANDARD ACCOUNT EDIT VIEW (WITH REMOVED CUSTOM INPUTS & AVATAR SELECTION) - 2 Columns Layout
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 text-left text-xs text-main-darker animate-fade-in border shadow-2xl max-h-[90vh] overflow-y-auto tactile-scrollbar relative">
                <div className="flex items-center justify-between border-b pb-3.5">
                  <div>
                    <h3 className="font-display font-semibold text-main-normal text-sm md:text-base">Hồ sơ cá nhân & Cấu hình học tập</h3>
                    <p className="text-[10px] text-gray-550 mt-0.5 font-sans">Cập nhật thông tin nhận diện học thuật và cấu hình các đề xuất của bạn.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingProfile(false)}
                    className="p-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 text-[10px] hover:text-black transition cursor-pointer font-bold"
                  >
                    Đóng [✕]
                  </button>
                </div>

                {/* Quick Avatar overview stats block */}
                <div className="flex gap-4 items-center bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl">
                  <img src={editedAvatar} alt="Avatar Preview" className="w-12 h-12 rounded-full border border-brand-normal object-cover shadow-sm bg-white" />
                  <div className="text-left flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs block text-stone-850 font-mono">{currentUser.email}</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold text-[8px] uppercase font-mono tracking-wider">
                        <Check className="w-2.5 h-2.5 text-emerald-600" /> Đã xác minh
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded uppercase font-mono font-black text-[8px] tracking-wider">{currentUser.role}</span>
                      <span>Học lực tích lũy: <b>{currentUser.streak} ngày streak</b> liên tiếp</span>
                      <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-bounce" />
                    </p>
                  </div>
                </div>

                {/* SUB-TAB NAV (2D FLAT MONOCHROME) */}
                <div className="flex border-b border-stone-200 text-xs font-bold gap-4">
                  <button
                    type="button"
                    onClick={() => setProfileActiveTab('info')}
                    className={`pb-2.5 px-1 relative transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${profileActiveTab === 'info' ? 'border-[#8b5e3c] text-[#8b5e3c]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                  >
                    <User className="w-4 h-4 shrink-0" />
                    Hồ Sơ & Cấu Hình
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileActiveTab('orders')}
                    className={`pb-2.5 px-1 relative transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${profileActiveTab === 'orders' ? 'border-[#8b5e3c] text-[#8b5e3c]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    Đơn hàng & Thanh toán ({orders.length})
                  </button>
                </div>

                {profileActiveTab === 'info' ? (
                  <>
                    {/* Two-Column Responsive Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
                      
                      {/* COLUMN 1: Avatar Picker segment, Họ và Tên, Số điện thoại */}
                      <div className="space-y-4">
                        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 space-y-3">
                          <h4 className="font-bold text-[#8b5e3c] uppercase tracking-widest text-[9px] border-b pb-1">1. Định danh cá nhân</h4>
                          
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1.5">Ảnh đại diện nhận diện:</label>
                            <div className="flex flex-wrap gap-2">
                              {AVAILABLE_AVATARS.map((url, i) => (
                                <button
                                  type="button"
                                  key={i}
                                  onClick={() => setEditedAvatar(url)}
                                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                    editedAvatar === url ? 'border-[#8b5e3c] ring-2 ring-[#8b5e3c]/40 scale-105' : 'border-stone-200 hover:border-stone-400'
                                  }`}
                                >
                                  <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Họ và Tên thành viên:</label>
                            <input 
                              type="text" 
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="w-full text-xs px-3 py-2 border rounded-xl bg-white text-stone-800 focus:ring-1 focus:ring-brand-normal focus:outline-none focus:border-[#8b5e3c]"
                              placeholder="Nhập tên thật của bạn"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Số điện thoại liên hệ:</label>
                            <input 
                              type="tel" 
                              value={editedPhone}
                              onChange={(e) => setEditedPhone(e.target.value)}
                              placeholder="Ví dụ: 098 765 4321"
                              className="w-full text-xs px-3 py-2 border rounded-xl font-mono bg-white text-stone-800 focus:ring-1 focus:ring-brand-normal focus:outline-none focus:border-[#8b5e3c]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* COLUMN 2: Tiểu sử học tập ngắn, Chủ đề quan tâm, Khóa tài khoản, Thay đổi mật khẩu */}
                      <div className="space-y-4">
                        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 space-y-3">
                          <h4 className="font-bold text-[#8b5e3c] uppercase tracking-widest text-[9px] border-b pb-1">2. Trải nghiệm học học thuật</h4>
                          
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Tiểu sử học tập ngắn:</label>
                            <input 
                              type="text" 
                              value={editedBio}
                              onChange={(e) => setEditedBio(e.target.value)}
                              className="w-full text-xs px-3 py-2 border rounded-xl bg-white text-stone-800 focus:ring-1 focus:ring-brand-normal focus:outline-none focus:border-[#8b5e3c]"
                              placeholder="Ví dụ: Đam mê nghiên cứu khoa học máy tính"
                            />
                          </div>

                          {/* Topics selection customized (Chỉ chọn chủ đề có sẵn, không tự gõ) */}
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1.5">Chủ đề học thuật quan tâm:</label>
                            
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white border rounded-xl tactile-scrollbar">
                              {PREDEFINED_TOPICS.map(topic => {
                                const isChosen = currentUser.interestedTopics.includes(topic);
                                return (
                                  <button
                                    type="button"
                                    key={topic}
                                    onClick={() => handleTogglePredefinedTopic(topic)}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all cursor-pointer ${
                                      isChosen 
                                        ? 'bg-[#8b5e3c] text-white shadow-xs font-bold' 
                                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                                    }`}
                                  >
                                    {isChosen ? `✓ ${topic}` : `+ ${topic}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Security quick actions */}
                          <div className="pt-2 border-t flex flex-col gap-1.5 font-sans">
                            <button 
                              type="button" 
                              onClick={() => setShowPasswordPage(true)} 
                              className="text-left text-[#8b5e3c] hover:underline font-bold flex items-center gap-1.5 text-[10px] cursor-pointer"
                            >
                              <Lock className="w-3 h-3 text-[#8b5e3c]" /> Đặt lại mật khẩu tài khoản bảo mật
                            </button>
                            <button 
                              type="button" 
                              onClick={handleRequestAccountClosure} 
                              className="text-left text-red-650 hover:underline font-semibold flex items-center gap-1.5 text-[10px] cursor-pointer"
                            >
                              <AlertCircle className="w-3 h-3 text-red-500" /> Đề xuất Đóng/Xóa vĩnh viễn tài khoản
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t text-xs">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)} 
                        className="px-4 py-2 border border-stone-200 rounded-xl bg-slate-50 hover:bg-stone-100 text-stone-600 font-bold transition-all cursor-pointer"
                      >
                        Hủy Bỏ
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-[#432c28] hover:bg-black text-white rounded-xl font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Lưu Hồ Sơ & Cấu Hình
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#8b5e3c] uppercase tracking-widest text-[9.5px]">Lịch sử giao dịch & Đóng học phí</h4>
                      <span className="text-[10px] text-stone-400 font-mono">VPBANK API Sandbox</span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-10 border border-dashed rounded-xl bg-slate-50/50">
                        <p className="text-stone-550 italic">Bạn chưa thực hiện bất kỳ giao dịch mua khóa học nào.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {orders.map((or) => {
                          const formatVND = (num: number) => {
                            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
                          };
                          return (
                            <div key={or.id} className="border border-stone-200 rounded-xl p-3.5 space-y-2.5 bg-white hover:border-stone-300 transition-all text-xs">
                              <div className="flex justify-between items-start flex-wrap gap-2 pb-2 border-b border-stone-100">
                                <div className="space-y-0.5 text-left">
                                  <p className="font-bold font-mono text-stone-850">Mã đơn: #{or.id}</p>
                                  <p className="text-[10px] text-stone-400">Ngày đặt mua: {or.date}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {or.status === 'success' ? (
                                    <span className="bg-emerald-50 text-emerald-700 font-bold font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-250 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Thành công (Paid)
                                    </span>
                                  ) : or.status === 'pending' ? (
                                    <span className="bg-amber-50 text-amber-700 font-bold font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-amber-250 flex items-center gap-1 animate-pulse">
                                      <Clock className="w-3 h-3 text-amber-600" /> Chờ phê duyệt (Pending)
                                    </span>
                                  ) : (
                                    <span className="bg-stone-50 text-stone-500 font-bold font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-stone-400" /> Đã hủy (Failed)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1 text-left">
                                {or.courses.map((c) => (
                                  <div key={c.id} className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-stone-750 truncate max-w-[280px]">{c.title}</span>
                                    <span className="font-mono text-stone-550">{formatVND(c.price)}</span>
                                  </div>
                                ))}
                              </div>

                              {or.discountAmount > 0 && (
                                <div className="flex justify-between text-[11px] text-emerald-600 font-medium text-left">
                                  <span>Mã giảm giá áp dụng:</span>
                                  <span>-{formatVND(or.discountAmount)}</span>
                                </div>
                              )}

                              <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-stone-100 text-left">
                                <span className="text-stone-700 uppercase tracking-wider text-[9.5px]">Tổng thanh toán:</span>
                                <span className="text-[#852b21]">{formatVND(or.total)}</span>
                              </div>

                              <div className="flex justify-between items-center flex-wrap gap-2 text-[10px] text-stone-400 pt-1 border-t border-stone-50">
                                <span>Phương thức: {or.paymentMethod}</span>
                                <div className="flex items-center gap-2">
                                  {or.status === 'pending' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleUpdateOrderStatus(or.id, 'success');
                                          const relatedCourse = courses.find(c => c.id === or.courses[0]?.id);
                                          alert(`Tuyệt vời! Thanh toán cho đơn hàng ${or.id} đã được kích hoạt thành công. Bạn đã được tự động ghi danh vào lớp "${relatedCourse?.title || 'Khóa học'}".`);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all cursor-pointer"
                                      >
                                        Phê duyệt thanh toán (Ghi danh ngay)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
                                            handleUpdateOrderStatus(or.id, 'failed');
                                          }
                                        }}
                                        className="px-2.5 py-1 border border-stone-200 hover:bg-red-50 hover:text-red-650 hover:border-red-200 text-stone-500 font-bold rounded-lg transition-all cursor-pointer"
                                      >
                                        Hủy đơn
                                      </button>
                                    </>
                                  )}
                                  {or.status === 'success' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const relatedCourse = courses.find(c => c.id === or.courses[0]?.id);
                                        if (relatedCourse) {
                                          setIsEditingProfile(false);
                                          setDirectSelectCourseId(relatedCourse.id);
                                        } else {
                                          alert("Khóa học không tìm thấy hoặc đã bị tháo rỡ.");
                                        }
                                      }}
                                      className="px-3 py-1 bg-[#432c28] hover:bg-black text-white font-bold rounded-lg transition-all shrink-0 cursor-pointer"
                                    >
                                      Vào học ngay »
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex justify-end pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-5 py-2 border border-stone-200 rounded-xl bg-slate-50 hover:bg-stone-100 text-stone-600 font-bold text-xs cursor-pointer transition-all"
                      >
                        Đóng Lại
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

          </div>
        )}

        {/* 🚨 ACCOUNT LOCK / DELETION REQUEST FORM MODAL */}
        {showAccountClosureForm && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-4 animate-fade-in text-left">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl relative max-h-[90vh] overflow-y-auto tactile-scrollbar">
              <div className="flex items-center justify-between border-b pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-stone-900 text-sm md:text-base">Đơn Yêu Cầu Khóa / Xóa Tài Khoản</h3>
                    <p className="text-[10px] text-gray-500 leading-none">Chuyển lên Ban Quản Trị Hệ Thống thẩm định</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowAccountClosureForm(false)}
                  className="text-stone-400 hover:text-black hover:bg-stone-100 p-1.5 rounded-lg text-xs font-mono transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitAccountClosureRequest} className="space-y-4 text-xs text-stone-850">
                <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-stone-400 font-mono block">THÔNG TIN THÀNH VIÊN ĐỀ XUẤT:</span>
                  <div className="text-xs font-bold text-stone-800">{currentUser.name}</div>
                  <div className="text-xs font-mono text-stone-500">{currentUser.email}</div>
                </div>

                {/* Option Lock vs Delete */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-stone-700">Hình thức xử lý đề xuất:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setClosureType('lock')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        closureType === 'lock' 
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                        ⏳ Tại Khóa Tài Khoản
                      </div>
                      <p className="text-[10px] text-stone-500 leading-tight mt-1">Bảo lưu toàn bộ tiến trình học, điểm tích lũy & chứng chỉ. Có thể mở khóa bất kỳ lúc nào.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClosureType('delete')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        closureType === 'delete' 
                          ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-red-900 text-[11px] flex items-center gap-1">
                        🚨 Xóa Vĩnh Viễn
                      </div>
                      <p className="text-[10px] text-stone-500 leading-tight mt-1">Hủy bỏ vĩnh viễn mọi dữ liệu, tiến độ học, quyền đăng nhập & khóa học đã mua.</p>
                    </button>
                  </div>
                </div>

                {/* Reason Text Area */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-stone-700">Lý do khóa / xóa tài khoản (Bắt buộc):</label>
                  <textarea
                    rows={4}
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    placeholder="Vui lòng cung cấp lý do cụ thể để ban quản lý phê chuẩn nhanh chóng..."
                    className="w-full text-xs p-3 border border-stone-300 rounded-xl focus:ring-1 focus:ring-[#8b5e3c] focus:border-[#8b5e3c] focus:outline-none"
                    required
                  />
                </div>

                {/* Warning message based on type */}
                <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
                  closureType === 'delete' 
                    ? 'bg-red-50/70 border-red-200 text-red-900' 
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}>
                  <p className="font-bold flex items-center gap-1 text-xs">
                    ⚠️ {closureType === 'delete' ? 'Cảnh báo Bảo mật Xóa vĩnh viễn:' : 'Lưu ý Tại khóa tài khoản:'}
                  </p>
                  <p className="mt-1">
                    {closureType === 'delete' 
                      ? 'Thao tác xóa tài khoản tuân thủ quy định bảo mật. Hệ thống sẽ thanh lọc triết để database, bạn sẽ mất quyền truy cập vào các khóa học đã mua.' 
                      : 'Khi tài khoản tại khóa, toàn bộ nội dung của bạn được ẩn khỏi mạng xã hội MindHub nhưng vẫn giữ nguyên quyền lợi.'}
                  </p>
                </div>

                {/* Confirm checkbox */}
                <div className="flex items-start gap-2.5 pt-1.5">
                  <input
                    type="checkbox"
                    id="confirm-closure-terms"
                    checked={agreeToClosureTerms}
                    onChange={(e) => setAgreeToClosureTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#8b5e3c] focus:ring-[#8b5e3c]"
                    required
                  />
                  <label htmlFor="confirm-closure-terms" className="text-[11px] text-stone-605 leading-snug select-none cursor-pointer font-medium">
                    Tôi cam kết đã thấu hiểu đầy đủ tác động bảo mật và chấp nhận chịu trách nhiệm cho quyết định này.
                  </label>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex gap-2.5 justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAccountClosureForm(false)}
                    className="px-4 py-2 border border-stone-200 rounded-xl bg-slate-50 hover:bg-stone-100 text-stone-600 font-bold transition-all cursor-pointer"
                  >
                    Bỏ Qua
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-white rounded-xl font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ${
                      closureType === 'delete' ? 'bg-red-600 hover:bg-red-750' : 'bg-[#432c28] hover:bg-black'
                    }`}
                  >
                    Gửi Yêu Cầu Thẩm Định
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Safe Logout Confirm Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in text-left">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>
              <div className="text-center">
                <h3 className="font-display font-bold text-stone-850 text-sm">Xác nhận đăng xuất</h3>
                <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">Bộ lưu trữ sẽ đưa bạn về vai trò khách tham quan. Bạn có muốn đăng xuất khỏi phiên làm việc này không?</p>
              </div>
              <div className="flex gap-2.5 justify-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl bg-slate-50 hover:bg-stone-100 text-stone-600 font-bold text-[11px] cursor-pointer transition-all"
                >
                  Bỏ qua
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsLoggedIn(false);
                    // Reset to visitor Guest user representation
                    setCurrentUser({
                      id: 'u-guest',
                      name: 'Khách Ghé Thăm',
                      email: 'guest@mindhub.edu.vn',
                      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
                      role: 'student',
                      streak: 0,
                      lastActiveDate: '2026-06-08',
                      interestedTopics: [],
                      notificationSettings: {
                        email: false,
                        push: false,
                        app: false,
                        scheduleReminders: false
                      }
                    });
                    setEnrolledCourseIds([]);
                    setCart([]);
                    setIsEditingProfile(false);
                    setShowLogoutConfirm(false);
                    setToastMessage('Đăng xuất thành công! Hệ thống đã đưa bạn về giao diện Khách Tham Quan.');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl font-bold text-[11px] cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  Xác nhận đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Floating Custom Toast Alerts */}
        {toastMessage && (
          <div className="fixed top-24 right-4 sm:right-6 md:right-8 bg-stone-900/95 border border-stone-850 text-white shadow-2xl p-3.5 px-4 rounded-2xl z-[10000] max-w-sm flex items-start gap-2.5 animate-fade-in text-xs font-semibold backdrop-blur-xs text-left">
            <span className="text-emerald-400 shrink-0 select-none font-bold">✓</span>
            <div className="flex-1">
              <p className="leading-snug text-[11px]">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-[10px] text-stone-500 hover:text-white ml-1 font-mono transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* --- DYNAMIC VIEWS INTEGRATIONS BY ROLE / SEPARATE COURSE PAGE --- */}
        {viewedCourse ? (
          <div className="space-y-8 animate-fade-in text-left">
            
            {/* Top Navigation Bar for Separate Detail Page */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8ded3] pb-4">
              <button 
                onClick={() => setViewedCourse(null)}
                className="inline-flex items-center gap-1.5 text-xs text-[#5c3e38] hover:text-[#432c28] font-bold bg-[#faf6f2] hover:bg-[#eedecf] px-3.5 py-2.5 rounded-xl border border-[#e8ded3] transition-all shadow-3xs"
              >
                ← Quay lại Danh sách Khóa học
              </button>
              
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs tracking-tight text-stone-500 font-sans">Chế độ hiển thị:</span>
                <div className="flex bg-[#faf6f2] p-0.5 rounded-lg border border-[#e8ded3]">
                  <button 
                    type="button"
                    onClick={() => setIsDetailDarkMode(false)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${!isDetailDarkMode ? 'bg-[#8b5e3c] text-white shadow-xs' : 'text-stone-500 hover:text-black'}`}
                  >
                    <Sun className="w-3 h-3" /> Sáng
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsDetailDarkMode(true)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${isDetailDarkMode ? 'bg-[#8b5e3c] text-white shadow-xs' : 'text-stone-500 hover:text-black'}`}
                  >
                    <Moon className="w-3 h-3" /> Tối
                  </button>
                </div>
              </div>
            </div>

            {/* Main Course Detail Layout Area */}
            <div className={`rounded-3xl overflow-hidden shadow-sm border transition-all duration-300 ${isDetailDarkMode ? 'bg-[#1c1210] border-[#382622] text-[#eee5db]' : 'bg-[#faf9f6] border-[#e8ded3] text-stone-800'}`}>
              
              {/* Cover Banner */}
              <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <img src={viewedCourse.image} alt="Banner detail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <span className="text-[10px] bg-[#faf6f2] text-[#432c28] px-2 py-0.5 rounded font-mono font-bold uppercase w-fit mb-2 border border-[#e8ded3]/40">
                    {viewedCourse.category} • {viewedCourse.subcategory}
                  </span>
                  <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">{viewedCourse.title}</h2>
                  <p className="text-xs md:text-sm text-gray-300 mt-1 leading-snug">{viewedCourse.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8">
                
                {/* Curriculum and details (Left 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* What you'll learn */}
                  {viewedCourse.willLearn && viewedCourse.willLearn.length > 0 && (
                    <div className={`p-5 rounded-2xl ${isDetailDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/95 border border-[#e8ded3] shadow-3xs'}`}>
                      <h4 className="font-bold text-[#432c28] text-sm mb-3">Bạn sẽ gặt hái được gì?</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-justify">
                        {viewedCourse.willLearn.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <Check className="w-3.5 h-3.5 text-[#8b5e3c] mt-0.5 shrink-0" />
                            <span className={isDetailDarkMode ? 'text-stone-300' : 'text-stone-700'}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {viewedCourse.requirements && viewedCourse.requirements.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-[#432c28]">Yêu cầu học tập:</h4>
                      <ul className="list-inside text-xs space-y-2 pl-2 text-justify">
                        {viewedCourse.requirements.map((item, idx) => (
                          <li key={idx} className={`flex items-start gap-2 ${isDetailDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                            <span className="inline-block w-1.5 h-1.5 bg-[#8b5e3c] rounded-full mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Syllabus / Course Outline */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm font-sans text-[#432c28]">Nội dung chương trình đào tạo ({viewedCourse.chapters?.length || 0} chương học):</h4>
                    {viewedCourse.chapters && viewedCourse.chapters.map(chapter => (
                      <div key={chapter.id} className={`p-4 rounded-xl border ${isDetailDarkMode ? 'bg-white/5 border-white/5 text-stone-300' : 'bg-white border-[#e8ded3] text-stone-800'} text-xs text-left`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#432c28] leading-none flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#8b5e3c]" />
                            {chapter.title}
                          </span>
                          <span className="text-[10px] text-stone-400 shrink-0 font-mono italic">{chapter.lessons.length} bài • {(chapter as any).duration || '45 phút'}</span>
                        </div>
                        <ul className="mt-2.5 space-y-2 pl-3 border-l border-[#8b5e3c]/20">
                          {chapter.lessons.map(lesson => {
                            const isEnrolled = enrolledCourseIds.includes(viewedCourse.id);
                            // It is previewable if we are not enrolled and the course allows free preview of this lesson type
                            const isPreviewable = !isEnrolled && (
                              (lesson.type === 'doc' && viewedCourse.allowFreeDoc) ||
                              (lesson.type === 'video' && viewedCourse.allowFreeVideo)
                            );
                            return (
                              <li key={lesson.id} className="text-[11px] text-stone-600 flex items-center justify-between hover:text-stone-900 py-1 border-b border-stone-100 last:border-none">
                                <span className="truncate max-w-xs md:max-w-sm flex items-center gap-1.5">
                                  {lesson.type === 'video' ? (
                                    <Video className="w-3 h-3 text-amber-600 shrink-0" />
                                  ) : (
                                    <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                                  )}
                                  <span>{lesson.title}</span>
                                </span>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-[9px] text-stone-400">{lesson.duration || '5:00'}</span>
                                  {isPreviewable && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewLesson({ lesson, course: viewedCourse });
                                      }}
                                      className="bg-amber-50 border border-amber-300 hover:bg-amber-600 hover:text-white hover:border-amber-600 text-amber-800 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Học thử</span>
                                      <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-600 animate-pulse" />
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Course Instructor Profile */}
                  <div className={`p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start ${isDetailDarkMode ? 'bg-white/5 border border-white/10' : 'bg-[#faf6f2] border border-[#e8ded3]'}`}>
                    <img src={viewedCourse.instructorAvatar} alt="Instructor" className="w-14 h-14 rounded-full border border-[#8b5e3c] shrink-0 object-cover" />
                    <div>
                      <span className={`font-bold text-xs block ${isDetailDarkMode ? 'text-brand-light-active' : 'text-[#432c28]'}`}>{viewedCourse.instructorName}</span>
                      <span className="text-[10px] text-[#8b5e3c] block font-medium mt-0.5">{viewedCourse.instructorTitle}</span>
                      <p className={`text-[11px] italic mt-2 leading-relaxed text-left ${isDetailDarkMode ? 'text-stone-305' : 'text-stone-600'}`}>{viewedCourse.instructorBio}</p>
                    </div>
                  </div>

                  {/* FAQs */}
                  {viewedCourse.faqs && viewedCourse.faqs.length > 0 && (
                    <div className="space-y-3 text-left">
                      <h4 className="font-bold text-sm text-[#432c28]">Câu hỏi thường gặp:</h4>
                      <div className="space-y-2">
                        {viewedCourse.faqs.map((faq, idx) => (
                          <details key={idx} className={`p-3 rounded-xl border text-xs cursor-pointer ${isDetailDarkMode ? 'bg-white/5 border-white/5 text-stone-300' : 'bg-white border-[#e8ded3] text-stone-800'}`}>
                            <summary className="font-bold focus:outline-none flex justify-between items-center text-[#432c28] list-none">
                              <span className="flex-1 text-left">{faq.q || faq.question}</span>
                              <span className="text-stone-400 font-bold ml-2">▼</span>
                            </summary>
                            <p className="mt-2 text-stone-600 leading-relaxed pl-4 border-l-2 border-[#8b5e3c] text-left whitespace-pre-wrap">{faq.a || faq.answer}</p>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Reviews */}
                  <div className="space-y-4 text-left">
                    <h4 className="font-bold text-sm flex items-center gap-1.5 text-[#432c28]">
                      <Star className="w-4 h-4 text-[#8b5e3c] fill-[#8b5e3c] shrink-0" /> Đánh giá học viên ({viewedCourse.reviews?.length || 0})
                    </h4>
                    {viewedCourse.reviews && viewedCourse.reviews.length > 0 ? (
                      viewedCourse.reviews.map(rev => (
                        <div key={rev.id} className={`p-4 rounded-xl border text-xs space-y-2 ${isDetailDarkMode ? 'bg-[#221715] border-white/5 text-stone-300' : 'bg-white border-[#e8ded3] text-stone-800 shadow-3xs'}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#432c28]">{rev.userName || (rev as any).user || 'Học viên'}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              ))}
                            </div>
                          </div>
                          <p className="text-stone-500 leading-snug">{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 italic">Chưa có lượt đánh giá nào cho khóa học này.</p>
                    )}
                  </div>

                </div>

                {/* Checkout sidebar box (Right 1 column) */}
                <div className="space-y-4">
                  <div className={`p-6 rounded-2xl border ${isDetailDarkMode ? 'bg-[#281b18] border-[#3d2a25]' : 'bg-[#faf6f2] border-[#e8ded3]'} space-y-4 text-left shadow-xs sticky top-32`}>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Ghi danh & Học tập</p>
                    <div>
                      {viewedCourse.salePrice ? (
                        <div className="space-y-1">
                          <span className="text-xl md:text-2xl font-black text-rose-650 block">{formatVND(viewedCourse.salePrice)}</span>
                          <span className="text-xs text-stone-400 line-through">Giá gốc: {formatVND(viewedCourse.price)}</span>
                        </div>
                      ) : (
                        <span className="text-xl md:text-2xl font-black text-[#432c28] block">{formatVND(viewedCourse.price)}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {enrolledCourseIds.includes(viewedCourse.id) ? (
                        <button 
                          onClick={() => {
                            setStudyingCourse(viewedCourse);
                          }}
                          className="w-full bg-[#432c28] hover:bg-[#5c3e38] flex items-center justify-center gap-1.5 text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          Vào Học Ngay
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            handleBuyCourseNow(viewedCourse.id);
                          }}
                          className="w-full bg-deep-indigo hover:bg-deep-indigo/95 flex items-center justify-center text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          Mua Ngay
                        </button>
                      )}
                    </div>

                    {/* Quick highlight points */}
                    <ul className="text-[10.5px] text-stone-600 space-y-3 pt-3 border-t border-[#e8ded3]">
                      <li className="flex items-center gap-2 font-medium">
                        <Zap className="w-3.5 h-3.5 text-[#8b5e3c] shrink-0" />
                        <span>Kích hoạt lập tức qua chuyển khoản</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#8b5e3c] shrink-0" />
                        <span>Quyền sở hữu đầy đủ học liệu trọn đời</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <Award className="w-3.5 h-3.5 text-[#8b5e3c] shrink-0" />
                        <span>Có cấp chứng nhận MindHub khi hoàn tất</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Exit Navigation Button */}
            <div className="flex justify-center border-t border-[#e8ded3] pt-6">
              <button 
                onClick={() => setViewedCourse(null)} 
                className="bg-[#faf6f2] hover:bg-[#eedecf] text-[#5c3e38] hover:text-[#432c28] py-2.5 px-7 rounded-xl font-bold text-xs border border-[#e8ded3] transition-all cursor-pointer shadow-3xs"
              >
                ← Quay lại danh mục khóa học
              </button>
            </div>

          </div>
        ) : currentUser.role === 'instructor' ? (
          <InstructorDashboard 
            currentUser={currentUser}
            courses={courses}
            onCreateCourseDraft={handleCreateCourseDraft}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onClose={() => handleSwitchRole('student')}
          />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard 
            currentUser={currentUser}
            courses={courses}
            onUpdateCourses={(updated) => setCourses(updated)}
            payoutRequests={payoutRequests}
            onApprovePayout={handleApprovePayout}
            onRejectPayout={handleRejectPayout}
            accountRequests={accountRequests}
            onResolveAccountRequest={handleResolveAccountRequest}
            onClose={() => handleSwitchRole('student')}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            categoriesList={categoriesList}
            onUpdateCategories={setCategoriesList}
            banners={banners}
            onUpdateBanners={saveBanners}
            notifications={notifications}
            onUpdateNotifications={(updated) => setNotifications(updated)}
            flaggedReviews={flaggedReviews}
            onResolveFlag={handleResolveFlag}
            onApproveCourse={handleApproveCourse}
            onRejectCourse={handleRejectCourse}
          />
        ) : (
          /* --- STUDENT PERSPECTIVE (PRIMARY INTERACTIVITIES) --- */
          <div className="space-y-8 text-sm text-left animate-fade-in pb-12">
            
            {/* Page Tabs Navigation (Trang Chủ vs Trang Giới Thiệu) */}
            <div className="flex border-b border-mist gap-6 select-none font-sans sticky top-[72px] bg-[#fbf9f6]/95 backdrop-blur-md z-30 pt-3 pb-0 px-4 md:px-6">
              <button 
                onClick={() => setActiveTab('home')}
                className={`pb-3 -mb-[1px] text-[13px] md:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === 'home' ? 'border-deep-indigo text-deep-ink font-black' : 'border-transparent text-stone-400 hover:text-stone-750'}`}
              >
                <span>Khám Phá Khóa Học</span>
              </button>
              <button 
                onClick={() => setActiveTab('intro')}
                className={`pb-3 -mb-[1px] text-[13px] md:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === 'intro' ? 'border-deep-indigo text-deep-ink font-black' : 'border-transparent text-stone-400 hover:text-stone-750'}`}
              >
                <span>Giới Thiệu MindHub</span>
              </button>
            </div>

            {activeTab === 'home' ? (
              <>
                {/* Elegant Header & Current Courses Side-by-Side Layout */}
                <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
                  {/* Left Side: Khóa học đang tham gia (Takes remaining space) */}
                  <div className="flex-1 bg-[#fcfcfc] border border-stone-150 rounded-3xl p-4 md:p-5 flex flex-col justify-between shadow-3xs text-left">
                    <div>
                      <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
                        <h3 className="text-sm md:text-base font-extrabold flex items-center gap-2 text-[#432c28]">
                          <BookOpen className="w-5 h-5 text-brand-normal" /> Khóa học đang tham gia
                        </h3>
                        <span className="text-[10px] bg-[#f5ece3] text-[#8b5e3c] font-bold px-2.5 py-1 rounded-md">
                          {courses.filter(c => enrolledCourseIds.includes(c.id)).length} KHÓA ĐANG HỌC
                        </span>
                      </div>

                      {courses.filter(c => enrolledCourseIds.includes(c.id)).length === 0 ? (
                        <div className="text-center py-6 text-stone-400 bg-white border border-dashed border-stone-200 rounded-2xl">
                          <p className="text-xs font-medium">Bạn chưa bắt đầu khóa học nào. Khám phá các khóa học bên dưới để bắt đầu học ngay!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {courses.filter(c => enrolledCourseIds.includes(c.id)).map(c => (
                            <div key={c.id} className="border border-brand-light-active rounded-2xl p-4 bg-white flex flex-col justify-between hover-glow-card transition-all text-left space-y-3">
                              <div className="flex gap-3">
                                <img src={c.image} alt="Avatar" className="w-14 h-10 object-cover rounded-lg shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[8px] bg-[#f5ece3] text-[#432c28] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Đang học</span>
                                  <h4 className="font-bold text-xs text-main-normal truncate mt-0.5">{c.title}</h4>
                                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">{c.instructorName}</p>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-400">
                                  <span>Tiến độ:</span>
                                  <span className="font-bold text-brand-dark">{c.completionRate || 60}%</span>
                                </div>
                                <div className="w-full bg-[#f5ece3] h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-brand-normal h-full animate-progress-fluid" style={{ width: `${c.completionRate || 60}%` }}></div>
                                </div>
                              </div>

                              <button 
                                onClick={() => setStudyingCourse(c)}
                                className="w-full bg-[#432c28] hover:bg-brand-darker text-brand-light py-1.5 rounded-lg text-[10px] font-bold transition-all text-center block cursor-pointer"
                              >
                                Vào lớp học ngay »
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Welcome back card (Compact: 100px to 200px wide, say 200px) */}
                  <div className="w-full lg:w-[200px] shrink-0 bg-white border border-brand-light-active p-4 rounded-3xl shadow-subtle flex flex-col justify-between text-center space-y-3">
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-[#f5ece3] text-[#8b5e3c] rounded-full flex items-center justify-center mx-auto font-bold text-sm">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none">
                          Chào mừng quay lại
                        </h4>
                        <p className="text-xs font-black text-brand-dark truncate max-w-full px-1" title={currentUser.name}>
                          {currentUser.name}!
                        </p>
                      </div>
                      <p className="text-[10.5px] text-stone-500 leading-snug">
                        Cùng tiếp tục thắp sáng ngọn lửa tri thức hôm nay tại MindHub.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowHeroPopup(true)}
                      className="w-full bg-deep-indigo hover:bg-midnight-teal text-white text-[10.5px] font-bold py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap animate-none"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse shrink-0" />
                      <span>Xem Bản Tin</span>
                    </button>
                  </div>
                </div>

            {/* NEW SECTION: DANH SÁCH KHÓA HỌC (AVAILABLE COURSES) WITH PAGINATION */}
            <ScrollReveal delayMs={100}>
              <div id="available-courses-section" className="space-y-6 pt-2">
                <div className="bg-white border border-mist p-5 rounded-3xl space-y-4 shadow-xs">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-mist pb-4 text-left">
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-deep-ink flex items-center gap-2">
                        <Compass className="w-6 h-6 text-deep-indigo" /> Danh Sách Khóa Học
                      </h3>
                      <p className="text-stone-500 text-xs">
                        Khám phá các khóa học tinh hoa chắt lọc được thiết kế chuyên biệt cho mọi học viên.
                      </p>
                    </div>
                    <span className="text-[10px] bg-pale-cyan text-forest-teal font-bold px-3 py-1.5 rounded-md uppercase tracking-wider font-mono select-none">
                      {sortedCourses.length} KHÓA HỌC HIỆN CÓ
                    </span>
                  </div>

                  <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                    {/* Left: Search input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onFocus={() => setShowMainSuggestions(true)}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowMainSuggestions(true);
                        }}
                        placeholder="Tìm khóa học, bài học, giảng viên..."
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-brand-light-active rounded-xl focus:ring-1 focus:ring-brand-normal focus:outline-none bg-slate-50"
                      />

                      {/* SUGGESTIONS MENU OVERLAY FOR CATALOG SEARCH */}
                      {showMainSuggestions && searchQuery.trim().length > 0 && (
                        <>
                          <div className="fixed inset-0 z-30 cursor-default bg-transparent" onClick={() => setShowMainSuggestions(false)} />
                          <div tabIndex={-1} className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e8ded3] rounded-2xl shadow-xl z-40 max-h-72 overflow-y-auto divide-y divide-[#e8ded3]/30 text-left py-1">
                            {(() => {
                              const list = getSearchSuggestions(searchQuery);
                              if (list.length === 0) {
                                return (
                                  <div className="p-3.5 text-[11px] text-stone-400 italic text-center">
                                    Không tìm thấy gợi ý trùng khớp.
                                  </div>
                                );
                              }
                              return list.map((item, idx) => {
                                let badgeColor = "bg-stone-50 text-stone-600";
                                let typeLabel = "Bài học";
                                if (item.type === 'category') {
                                  badgeColor = "bg-amber-150 text-amber-900";
                                  typeLabel = "Danh mục";
                                } else if (item.type === 'instructor') {
                                  badgeColor = "bg-emerald-150 text-emerald-950";
                                  typeLabel = "Giảng viên";
                                } else if (item.type === 'subcategory') {
                                  badgeColor = "bg-sky-150 text-sky-950";
                                  typeLabel = "Chuyên đề";
                                }
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectSuggestion(item)}
                                    className="w-full px-3.5 py-2 hover:bg-[#faf6f2] flex items-center justify-between transition-colors gap-2 text-left cursor-pointer border-none"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                      <span className="text-xs font-semibold text-stone-800 truncate leading-none">
                                        {item.value}
                                      </span>
                                    </div>
                                    <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shrink-0 ${badgeColor}`}>
                                      {typeLabel}
                                    </span>
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right: Sort dropdown */}
                    <div className="flex items-center gap-2 text-xs w-full lg:w-auto justify-end shrink-0">
                      <ArrowUpDown className="w-4 h-4 text-gray-450" />
                      <span className="text-gray-400 font-medium">Sắp xếp theo:</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border border-brand-light-active rounded-xl px-3 py-2 bg-white focus:outline-none text-[11px] font-medium text-stone-750"
                      >
                        <option value="newest">Khóa học mới nhất</option>
                        <option value="rating">Đánh giá tốt nhất</option>
                        <option value="bestseller">Bán chạy nhất</option>
                        <option value="priceAsc">Giá tăng dần</option>
                        <option value="priceDesc">Giá giảm dần</option>
                        <option value="oldest">Khóa học cũ nhất</option>
                      </select>
                    </div>
                  </div>

                  {/* Two-tiered Learning Categories and Subcategories */}
                  <div className="border-t border-stone-100 pt-4 space-y-3.5">
                    {/* Tier 1: Parent Categories */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider select-none shrink-0 mr-1">Danh mục chính:</span>
                      <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        {categoriesList.map((cat) => (
                          <button 
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setSelectedSubcategory('All');
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat ? 'bg-deep-indigo text-white shadow-xs scale-102 font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'}`}
                          >
                            {cat === 'All' ? 'Tất cả phần' : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tier 2: Subcategories (nested/indented look) */}
                    {availableSubcategories.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 bg-[#fdfcfb] border border-stone-150/60 p-2.5 rounded-2xl pl-4 animate-fade-in">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider select-none shrink-0 mr-1 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-[#8b5e3c]" /> Chuyên đề con:
                        </span>
                        <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar">
                          {/* "Tất cả" chip for Subcategories */}
                          <button 
                            onClick={() => setSelectedSubcategory('All')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${selectedSubcategory === 'All' ? 'bg-[#8b5e3c] text-white shadow-3xs font-bold' : 'bg-stone-50 border border-stone-200/50 hover:bg-stone-100 text-stone-550'}`}
                          >
                            Tất cả chuyên đề
                          </button>
                          
                          {availableSubcategories.map((sub) => (
                            <button 
                              key={sub}
                              onClick={() => setSelectedSubcategory(sub)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${selectedSubcategory === sub ? 'bg-[#8b5e3c] text-white shadow-3xs font-bold' : 'bg-stone-50 border border-stone-200/50 hover:bg-stone-100 text-stone-550'}`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course grid with 4 columns on large screen */}
                {paginatedCourses.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-white border border-dashed rounded-2xl">
                    <p className="font-semibold">Không tìm thấy khóa học nào phù hợp với yêu cầu tìm kiếm của bạn.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedCourses.map((c) => {
                        const isEnrolled = enrolledCourseIds.includes(c.id);
                        return (
                          <div 
                            key={c.id} 
                            className="border border-brand-light-active bg-white rounded-3xl overflow-hidden flex flex-col justify-between hover-glow-card transition-all duration-300 text-left"
                          >
                            <div className="relative">
                              <img src={c.image} alt="Course banner" className="w-full h-40 object-cover" />
                              <button 
                                onClick={() => handleToggleFavorite(c.id)}
                                className="absolute top-2 right-2 bg-white/95 p-2 rounded-full hover:bg-white text-deep-indigo scale-100 active:scale-95 transition-all shadow-md z-10"
                                title="Yêu thích"
                              >
                                <Heart className={`w-4 h-4 ${favorites.includes(c.id) ? 'fill-deep-indigo text-deep-indigo' : 'text-gray-400'}`} />
                              </button>
                              
                              <div className="absolute bottom-2 left-2 flex gap-1">
                                {c.isBestseller && (
                                  <span className="text-[8px] bg-yellow-500 text-brand-light px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm">Bán chạy</span>
                                )}
                                {c.isNew && (
                                  <span className="text-[8px] bg-blue-600 text-brand-light px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm">Mới nhất</span>
                                )}
                              </div>
                            </div>

                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-gray-500 block uppercase font-mono tracking-wider font-semibold">{c.subcategory}</span>
                                <h4 className="text-[14px] font-bold text-main-darker leading-snug line-clamp-2 hover:text-brand-normal cursor-pointer mt-1" onClick={() => setViewedCourse(c)}>
                                  {c.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 mt-1 italic">Giảng viên: {c.instructorName}</p>
                                
                                <div className="flex items-center gap-1 text-[11px] text-yellow-500 mt-1.5 font-bold">
                                  <span>{c.rating}</span>
                                  <span>★</span>
                                  <span className="text-gray-400 font-normal text-[10px]">({c.reviewCount})</span>
                                </div>
                              </div>

                              <div className="border-t border-stone-100 pt-3 flex items-center justify-between mt-3">
                                <div>
                                  {c.salePrice ? (
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-bold text-brand-dark">{formatVND(c.salePrice)}</span>
                                      <span className="text-[10px] text-stone-400 line-through">{formatVND(c.price)}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[13px] font-bold text-brand-dark">{formatVND(c.price)}</span>
                                  )}
                                </div>

                                <div className="flex gap-1.5 flex-nowrap">
                                  <button 
                                    onClick={() => setViewedCourse(c)}
                                    className="bg-[#f5ece3] hover:bg-[#dbcdc3] text-brand-dark text-[10px] font-bold py-2.5 px-4.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    Chi tiết
                                  </button>
                                  {isEnrolled ? (
                                    <button 
                                      onClick={() => setStudyingCourse(c)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2.5 px-4.5 rounded-xl transition-all whitespace-nowrap"
                                    >
                                      Đang học
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleBuyCourseNow(c.id)}
                                      className="bg-deep-indigo hover:bg-deep-indigo/95 text-white text-[10px] font-bold py-2.5 px-5 rounded-xl transition-all flex items-center justify-center cursor-pointer whitespace-nowrap"
                                    >
                                      Mua Ngay
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Elegant Pagination controls */}
                    {totalCoursesPages > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-6 pb-2">
                        <button
                          onClick={() => setCoursesPage(prev => Math.max(1, prev - 1))}
                          disabled={safeCoursesPage === 1}
                          className="p-2 rounded-xl border border-brand-light-active bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer animate-none"
                          title="Trang trước"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: totalCoursesPages }).map((_, idx) => {
                            const pageNum = idx + 1;
                            const isCurrent = pageNum === safeCoursesPage;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCoursesPage(pageNum)}
                                className={`w-8.5 h-8.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                                  isCurrent
                                    ? 'bg-deep-indigo text-white border-deep-indigo shadow-xs scale-105'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCoursesPage(prev => Math.min(totalCoursesPages, prev + 1))}
                          disabled={safeCoursesPage === totalCoursesPages}
                          className="p-2 rounded-xl border border-brand-light-active bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer animate-none"
                          title="Trang sau"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* FAQ banner helper panel in integrated layout */}
                <div className="bg-brand-light/40 border border-brand-light-active p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-brand-normal shrink-0" />
                    <div>
                      <h4 className="font-bold text-brand-dark text-xs">Có câu hỏi về MindHub?</h4>
                      <p className="text-gray-500 text-[10.5px]">Chính sách cam kết hoàn trả 100% học liệu số trong 7 ngày nếu không hài lòng.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLegal('faq')}
                    className="bg-white hover:bg-stone-50 border border-brand-light-active rounded-xl px-4 py-2 text-xs text-[#8b5e3c] font-bold transition-all shadow-3xs shrink-0 cursor-pointer"
                  >
                    Xem câu hỏi phổ biến »
                  </button>
                </div>
              </div>
            </ScrollReveal>



            {/* SECTION 2: TOP KHÓA HỌC ĐƯỢC YÊU THÍCH NHẤT */}
            <ScrollReveal delayMs={150}>
              <div className="bg-[#fcfcfc] border border-stone-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-3xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2 text-[#432c28]">
                      <Heart className="w-5 h-5 fill-deep-indigo text-deep-indigo" /> Top Khóa Học Được Yêu Thích Nhất
                    </h3>
                    <p className="text-[10.5px] text-stone-500">
                      Những khóa học học thuật đỉnh cao thu hút đông đảo lượng quan tâm thảo luận nhất tuần qua.
                    </p>
                  </div>

                  {/* Sort favorites controls */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <span className="text-[10.5px] text-stone-400 font-bold">Sắp xếp:</span>
                    <select
                      value={favSortBy}
                      onChange={(e) => setFavSortBy(e.target.value as any)}
                      className="border border-stone-200 rounded-lg px-2 py-1 bg-white focus:outline-none text-[10.5px] font-bold text-stone-700 shadow-3xs"
                    >
                      <option value="favoritesDesc">Yêu thích nhiều nhất</option>
                      <option value="ratingDesc">Đánh giá tốt nhất</option>
                      <option value="priceAsc">Giá thấp nhất</option>
                    </select>
                  </div>
                </div>

                {/* Grid of Top Favorited Courses */}
                {(() => {
                  // Attach virtual favoriteCount & sort
                  const sortedFavs = [...courses]
                    .map(c => ({
                      ...c,
                      favoriteCount: Math.floor(c.enrolledCount * 0.45 + c.reviewCount * 1.6 + c.rating * 15)
                    }))
                    .sort((a, b) => {
                      if (favSortBy === 'favoritesDesc') return b.favoriteCount - a.favoriteCount;
                      if (favSortBy === 'ratingDesc') return b.rating - a.rating;
                      if (favSortBy === 'priceAsc') return (a.salePrice || a.price) - (b.salePrice || b.price);
                      return 0;
                    })
                    .slice(0, 4); // show top 4 favorited courses!

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {sortedFavs.map(c => {
                        const isEnrolled = enrolledCourseIds.includes(c.id);
                        return (
                          <div key={c.id} className="bg-white border border-stone-150 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-[#8b5e3c]/30 transition-all text-left space-y-3 relative group">
                            <button 
                              onClick={() => handleToggleFavorite(c.id)}
                              className="absolute top-2.5 right-2.5 bg-white/95 p-1.5 rounded-full hover:bg-white text-deep-indigo shadow-xs z-10 transition-transform active:scale-90"
                              title="Yêu thích"
                            >
                              <Heart className={`w-3.5 h-3.5 ${favorites.includes(c.id) ? 'fill-deep-indigo text-deep-indigo' : 'text-stone-300'}`} />
                            </button>

                            <div className="space-y-2">
                              <div className="relative overflow-hidden h-28 bg-stone-100 rounded-xl">
                                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                                <div className="absolute top-2 left-2 bg-[#8b5e3c] text-white font-mono text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                  🔥 {c.favoriteCount.toLocaleString()} quan tâm
                                </div>
                              </div>

                              <div className="min-w-0">
                                <span className="text-[8px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono font-bold uppercase">{c.subcategory}</span>
                                <h4 className="font-extrabold text-xs text-main-normal leading-snug line-clamp-2 mt-1 cursor-pointer hover:text-[#8b5e3c]" onClick={() => setViewedCourse(c)}>
                                  {c.title}
                                </h4>
                                <div className="flex items-center gap-1 text-[10px] text-yellow-500 mt-1 font-bold">
                                  <span>{c.rating}</span>
                                  <span>★</span>
                                  <span className="text-gray-400 font-normal text-[9px]">({c.reviewCount})</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-50 text-[11px] mt-2">
                              <div className="font-bold text-[#432c28]">
                                {c.salePrice ? formatVND(c.salePrice) : formatVND(c.price)}
                              </div>

                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => setViewedCourse(c)}
                                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-750 text-[9.5px] font-bold py-1.5 px-3 rounded-xl transition cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                {isEnrolled ? (
                                  <button 
                                    onClick={() => setStudyingCourse(c)}
                                    className="bg-emerald-50 text-emerald-800 text-[9.5px] font-bold py-1.5 px-3 rounded-xl transition"
                                  >
                                    Đang học
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleBuyCourseNow(c.id)}
                                    className="bg-deep-indigo hover:bg-deep-indigo/95 text-white text-[9.5px] font-bold py-1.5 px-3 rounded-xl transition-all shadow-3xs"
                                  >
                                    Mua Ngay
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </ScrollReveal>

          </>
        ) : (
          /* --- INTRODUCTION TAB VIEW --- */
          <div className="space-y-10 text-sm text-left animate-fade-in pb-12">
            {/* Intro Hero Section with Stats */}
            <ScrollReveal delayMs={100}>
              <div className="bg-[#fcf8f2] border border-[#e8ded3] p-6 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#e8d8c8]/50 rounded-full filter blur-2xl opacity-40 select-none pointer-events-none animate-float-slow"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  <div className="lg:col-span-7 space-y-4 md:space-y-5">
                    <span className="text-[10px] bg-[#8b5e3c]/10 text-[#8b5e3c] px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                      VỀ MINDHUB ACADEMY
                    </span>
                    
                    <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-[#432c28] leading-tight font-serif">
                      Nghệ thuật đào tạo số & <br />
                      Trải nghiệm học tập tĩnh lặng
                    </h2>
                    
                    <p className="text-xs md:text-sm text-stone-605 leading-relaxed font-sans max-w-xl">
                      Nền tảng học tập trực tuyến chắt lọc tinh hoa từ phương pháp giáo dục truyền thống mộc mạc và trải nghiệm công nghệ tinh tế nhất. Hôm nay bạn đang thắp sáng ngọn lửa học tập cùng MindHub!
                    </p>

                    {/* Interactive Tech Sandbox Environment Panel */}
                    <div className="space-y-3 pt-3 pb-1 border-t border-brand-light-active/30 max-w-lg bg-white/40 backdrop-blur-3xs border border-mist p-3.5 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-deep-indigo uppercase tracking-wider block flex items-center gap-1.5">
                          ⚡ Môi Trường Sandbox Lab:
                        </span>
                        <span className="text-[8px] bg-pale-cyan text-forest-teal px-1.5 py-0.5 rounded-full font-bold">
                          Thiết lập phiên làm việc trực tuyến
                        </span>
                      </div>
                      
                      {/* Sandbox Selections */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <button 
                          onClick={() => setSelectedDrink('espresso')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${selectedDrink === 'espresso' ? 'bg-deep-indigo text-white border-deep-indigo shadow-md' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}
                        >
                          <Cpu className="w-3.5 h-3.5 text-deep-indigo" />
                          <span>Cloud VM</span>
                        </button>
                        <button 
                          onClick={() => setSelectedDrink('cappuccino')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${selectedDrink === 'cappuccino' ? 'bg-deep-indigo text-white border-deep-indigo shadow-md' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}
                        >
                          <Layers className="w-3.5 h-3.5 text-forest-teal" />
                          <span>Agent AI</span>
                        </button>
                        <button 
                          onClick={() => setSelectedDrink('matcha')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${selectedDrink === 'matcha' ? 'bg-deep-indigo text-white border-deep-indigo shadow-md' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}
                        >
                          <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Web Dev</span>
                        </button>
                      </div>

                      {/* Table Number */}
                      <div className="pt-1.5 border-t border-stone-150 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-stone-500 font-bold">Server Node:</span>
                          <span className="text-[10px] bg-deep-indigo text-white px-1.5 py-0.5 rounded font-black">
                            Node #{selectedTable < 10 ? `0${selectedTable}` : selectedTable}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-white border border-stone-200 p-0.5 rounded-lg select-none">
                          <button 
                            type="button"
                            onClick={() => setSelectedTable(prev => Math.max(1, prev - 1))}
                            disabled={selectedTable <= 1}
                            className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-stone-600 bg-stone-50 rounded cursor-pointer"
                          >
                            -
                          </button>
                          <input 
                            type="number"
                            min={1}
                            max={99}
                            value={selectedTable || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setSelectedTable(isNaN(val) ? 1 : Math.min(99, Math.max(1, val)));
                            }}
                            className="w-6 text-center font-bold text-stone-850 text-[10px] bg-transparent border-0 p-0 focus:ring-0 focus:outline-hidden"
                          />
                          <button 
                            type="button"
                            onClick={() => setSelectedTable(prev => Math.min(99, prev + 1))}
                            disabled={selectedTable >= 99}
                            className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-stone-600 bg-stone-50 rounded cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stats Row moved directly here from Hero Banner */}
                    <div className="pt-3 border-t border-brand-light-active/40 flex gap-4 items-center text-[11px] text-stone-500">
                      <div>
                        <span className="font-serif italic text-base font-bold text-[#432c28] block">15k+</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">HỌC VIÊN</span>
                      </div>
                      <div className="w-px h-6 bg-brand-light-active/50"></div>
                      <div>
                        <span className="font-serif italic text-base font-bold text-[#432c28] block">120+</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">CHUYÊN GIA</span>
                      </div>
                      <div className="w-px h-6 bg-brand-light-active/50"></div>
                      <div>
                        <span className="font-serif italic text-base font-bold text-[#8b5e3c] block font-semibold">4.9/5</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">ĐÁNH GIÁ</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative flex flex-col items-center justify-center p-2">
                    <div className="absolute inset-0 bg-white border border-brand-light-active rounded-2xl -translate-x-2 -translate-y-2 z-0"></div>
                    <div className="relative w-full h-[220px] md:h-[260px] rounded-2xl overflow-hidden border-2 border-white shadow-md z-10">
                      <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                        alt="Thư viện học thuật" 
                        className="w-full h-full object-cover select-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 1B. PROMOTIONAL SHOWCASE SECTION (GÓC TRỰC QUAN MINDHUB: TRỰC TIẾP TRẢI NGHIỆM TINH HOA) */}
            <ScrollReveal delayMs={150}>
              <div className="bg-white border border-brand-light-hover rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#faf5ec] pb-4 gap-2 text-left">
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#432c28] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-brand-normal hover:scale-110 transition-transform" /> Góc Trực Quan MindHub: Trực Tiếp Trải Nghiệm Tinh Hoa
                    </h3>
                    <p className="text-stone-500 text-[11.5px] mt-1">Cùng ngắm nhìn và <b>tương tác thử trực tiếp</b> với ba trải nghiệm học tập độc quyền tại lớp học số mộc mạc của chúng tôi.</p>
                  </div>
                  <span className="text-[10px] bg-[#f5ece3] text-brand-dark uppercase tracking-widest font-mono font-bold px-3 py-1.5 rounded-md self-start md:self-auto select-none">
                    MINDHUB INTERACTION
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Promo Card 1 - Focus Box with Interactive Rain Sound Synthesis and Note typing */}
                  <div className="group rounded-2xl overflow-hidden border border-brand-light-active hover:border-brand-normal/40 transition-all duration-300 bg-[#faf7f2]/30 flex flex-col justify-between p-2 min-h-[530px] md:min-h-[550px]">
                    <div>
                      <div className="relative overflow-hidden h-44 md:h-48 bg-stone-100 rounded-xl">
                        <img 
                          src="https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600" 
                          alt="Góc Học Tập MindHub" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                        />
                        <div className="absolute top-2 left-2 bg-[#432c28] text-white font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Tương tác thử • 01. Audio âm cảnh
                        </div>
                      </div>
                      <div className="p-4 text-left space-y-3.5">
                        <h4 className="font-extrabold text-[#432c28] text-sm md:text-base">01. Trải nghiệm học tĩnh lặng</h4>
                        <p className="text-stone-500 text-[11px] leading-relaxed">
                          Từng bài học được tinh gọn mộc mạc tựa cuốn sổ tay da bên tách Latte thơm ngát. Thử bật nhạc âm cảnh gỗ để đạt tập trung cao độ:
                        </p>

                        <div className="pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (demo1AudioActive) {
                                stopCozyRainNoise();
                                setDemo1AudioActive(false);
                              } else {
                                playCozyRainNoise();
                                setDemo1AudioActive(true);
                              }
                            }}
                            className={`w-full py-3 px-5 rounded-xl border text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${demo1AudioActive ? 'bg-[#8b5e3c] hover:bg-[#734c2f] text-white border-[#8b5e3c]' : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-750 shadow-2xs'}`}
                          >
                            {demo1AudioActive ? '✕ Tắt Tiếng Mưa Rào mộc' : '🎧 Phát Tiếng Mưa Gỗ Cafe (Thư Giãn)'}
                          </button>
                        </div>

                        {demo1AudioActive && (
                          <div className="flex gap-1 items-end h-4 justify-center py-1 bg-amber-50 rounded-lg">
                            <span className="w-1 bg-[#8b5e3c] rounded-full h-1/2 animate-ping"></span>
                            <span className="w-1 bg-[#8b5e3c] rounded-full h-full animate-pulse"></span>
                            <span className="w-1 bg-[#8b5e3c] rounded-full h-2/3 animate-ping"></span>
                            <span className="text-[9px] font-mono text-[#8b5e3c] font-bold">Đang phát brown-noise mịn...</span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block">Sổ tay nháp ý tưởng trực tuyến:</span>
                          <textarea
                            value={demo1Notes}
                            onChange={(e) => setDemo1Notes(e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-stone-200 focus:border-[#8b5e3c] focus:ring-1 focus:ring-[#8b5e3c] focus:outline-none rounded-xl p-2.5 text-[10.5px] text-stone-700 resize-none font-sans"
                            placeholder="Ghi lại ý nghĩ của bạn..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promo Card 2 - Scholar Syllabus Outline with Click-to-Expand Chapters */}
                  <div className="group rounded-2xl overflow-hidden border border-brand-light-active hover:border-brand-normal/40 transition-all duration-300 bg-[#faf7f2]/30 flex flex-col justify-between p-2 min-h-[530px] md:min-h-[550px]">
                    <div>
                      <div className="relative overflow-hidden h-44 md:h-48 bg-stone-100 rounded-xl">
                        <img 
                          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600" 
                          alt="Kho Kiến Thức Quán Cafe" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                        />
                        <div className="absolute top-2 left-2 bg-[#432c28] text-white font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Tương tác thử • 02. Bài chuyên khảo mẫu
                        </div>
                      </div>
                      <div className="p-4 text-left space-y-3.5">
                        <h4 className="font-extrabold text-[#432c28] text-sm md:text-base">02. Học liệu chắt lọc tinh hoa</h4>
                        <p className="text-stone-500 text-[11px] leading-relaxed">
                          Tri thức tại đây không dàn trải xô bồ ngoài thị trường. Hãy bấm "Xem thử" giáo trình cô đọng 3 chương cốt lõi ngay:
                        </p>

                        <div className="space-y-1.5 pt-1">
                          {[
                            { num: 1, title: 'Bản chất vòng đời State React', desc: 'Sự khác nhau cơ bản giữa render queue, batching gom cụm cập nhật mới nhất và useRef giữ tham chiếu bảo mật.' },
                            { num: 2, title: 'Clean Architecture mộc mạc', desc: 'Phục dựng kết nối decoupled cô lập side-effects, phân tầng logic API trong server đem lại điểm 10 tin cậy sạch sẽ.' },
                            { num: 3, title: 'Nghệ thuật đàm thoại prompt AI', desc: 'Thiết lập mô hình tư duy hội thoại bám sát văn hóa địa phương Việt để tối ưu năng suất làm việc gấp 10 lần.' }
                          ].map((ch) => (
                            <div key={ch.num} className="bg-white border border-stone-150 rounded-xl p-2.5 text-left transition-all hover:border-[#8b5e3c]/50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDemo2Chapter(demo2Chapter === ch.num ? null : ch.num);
                                }}
                                className="w-full flex justify-between items-center text-[10.5px] font-bold text-[#432c28] text-left cursor-pointer"
                              >
                                <span className="truncate pr-1">Chương {ch.num}: {ch.title}</span>
                                <span className="text-[9px] text-[#8b5e3c] shrink-0 font-extrabold font-mono">{demo2Chapter === ch.num ? '▲ Đóng' : '▼ Xem'}</span>
                              </button>
                              {demo2Chapter === ch.num && (
                                <p className="text-[10px] text-stone-600 mt-2 pb-0.5 animate-fade-in font-serif leading-relaxed border-t border-dashed border-stone-100 pt-1.5">
                                  {ch.desc}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promo Card 3 - Interactive AI Mentor Mini Quiz Prompt with Answers */}
                  <div className="group rounded-2xl overflow-hidden border border-brand-light-active hover:border-brand-normal/40 transition-all duration-300 bg-[#faf7f2]/30 flex flex-col justify-between p-2 min-h-[530px] md:min-h-[550px]">
                    <div>
                      <div className="relative overflow-hidden h-44 md:h-48 bg-stone-100 rounded-xl">
                        <img 
                          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600" 
                          alt="Coding Academic Mộc Mạc" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                        />
                        <div className="absolute top-2 left-2 bg-[#432c28] text-white font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Tương tác thử • 03. Trợ giáo ảo AI
                        </div>
                      </div>
                      <div className="p-4 text-left space-y-3.5">
                        <h4 className="font-extrabold text-[#432c28] text-sm md:text-base">03. Cố vấn học tập AI chu đáo</h4>
                        <p className="text-stone-500 text-[11px] leading-relaxed">
                          Nhận diện lỗ hổng kiến thức chuẩn xác. Mời bạn trả lời thử câu hỏi mấu chốt được đưa ra bởi AI Mentor:
                        </p>

                        <div className="bg-white border border-stone-200 rounded-xl p-3 text-left space-y-2.5 shadow-2xs">
                          {demo3QuizStep === 0 ? (
                            <div className="space-y-1.5 text-left">
                              <p className="font-bold text-[10.5px] text-[#432c28] leading-tight">
                                Q: Có nên dùng thuộc tính "index" trong mảng làm giá trị cho thuộc tính "key" khi render trong React?
                              </p>
                              <div className="flex flex-col gap-1 pt-1.5">
                                <button
                                  onClick={() => setDemo3QuizStep(1)}
                                  className="w-full bg-stone-50 hover:bg-[#8b5e3c]/5 border border-stone-100 p-2 rounded-lg text-left text-[10px] text-stone-750 font-bold cursor-pointer transition-all"
                                >
                                  A. Có, vì index luôn độc nhất tự động
                                </button>
                                <button
                                  onClick={() => setDemo3QuizStep(2)}
                                  className="w-full bg-stone-50 hover:bg-[#8b5e3c]/5 border border-stone-100 p-2 rounded-lg text-left text-[10px] text-stone-750 font-bold cursor-pointer transition-all"
                                >
                                  B. Hạn chế, vì có thể gây xáo trộn sai lệch state
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 animate-fade-in text-left">
                              {demo3QuizStep === 2 ? (
                                <>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase inline-block font-mono font-bold">Đúng rồi! ✓</span>
                                  <p className="text-[10px] text-stone-600 leading-normal font-sans pt-1">
                                    React định vị thẻ dựa trên "key" để tối thiểu re-renders. Khi bạn Sort/Filter mảng, index bị xáo sẽ làm React gắn nhầm state nội bộ của thẻ cũ sang thẻ mới, tạo bug giao diện nguy hại khó lường!
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold uppercase inline-block font-mono font-bold">Chưa chuẩn xác! ✕</span>
                                  <p className="text-[10px] text-stone-600 leading-normal font-sans pt-1">
                                    Dùng index làm key là phản mẫu (anti-pattern) khi list mảng bị sắp xếp lại, xóa chèn phần tử. Hãy ưu tiên dùng id duy nhất (uuid, db id) để React đối sánh DOM ảo một cách tuyệt đối chính xác!
                                  </p>
                                </>
                              )}
                              <button
                                onClick={() => setDemo3QuizStep(0)}
                                className="w-fit bg-[#432c28] text-white rounded-xl px-4 py-2 text-[9.5px] font-bold mt-1.5 inline-block hover:opacity-90 cursor-pointer transition-all"
                              >
                                Tương Tác Lại ↺
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scholar Inspiring Quote */}
                <div className="bg-[#faf7f2] border-l-3 border-[#8b5e3c] p-4 rounded-r-xl text-center">
                  <p className="italic text-xs md:text-sm text-[#432c28] leading-relaxed">
                    "Tri thức đích thực không nằm ở lượng video ta tích góp, mà nằm ở trải nghiệm tinh thần an nhiên tựa những giờ phút suy ngẫm bên bàn gỗ trà chiều."
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* FAQ banner helper panel in integrated layout */}
            <ScrollReveal delayMs={200}>
              <div className="bg-[#fcfcfc] border border-stone-150 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 text-left shadow-2xs">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-[#8b5e3c] shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-[#432c28] text-sm">Có câu hỏi về MindHub?</h4>
                    <p className="text-stone-500 text-xs">Chính sách cam kết hoàn trả 100% học liệu số trong 7 ngày nếu không hài lòng.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLegal('faq')}
                  className="bg-white hover:bg-stone-50 border border-stone-200 rounded-xl px-4.5 py-2.5 text-xs text-[#8b5e3c] font-bold transition-all shadow-3xs shrink-0 cursor-pointer"
                >
                  Xem câu hỏi phổ biến »
                </button>
              </div>
            </ScrollReveal>
          </div>
        )}

            {/* 👨‍🏫 INSTRUCTORS SHOWCASE: VIEW, FILTER, FEATURED */}
            <ScrollReveal delayMs={180}>
              <div className="space-y-5 border-t border-brand-light-active pt-6 mt-6">
                
                {/* Header section with text */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-3 border-b border-brand-light-active text-left w-full">
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-display font-extrabold flex items-center gap-1.5 text-main-normal leading-tight">
                      <Users className="w-5 h-5 text-brand-normal" /> Đội ngũ Giảng viên Chuyên môn MindHub
                    </h3>
                    <p className="text-stone-500 text-[11px] md:text-xs">
                      Tìm sự đồng hành lý tưởng từ các cựu kỹ sư Google, chuyên gia thiết kế Figma và diễn giả Harvard uyên bác.
                    </p>
                  </div>

                  {/* Filter actions: category select & featured star button */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Category Filter dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wide select-none">Lọc lĩnh vực:</span>
                      <select
                        value={instructorCategory}
                        onChange={(e) => setInstructorCategory(e.target.value)}
                        className="border border-brand-light-active rounded-xl px-2.5 py-1.5 bg-white focus:outline-none text-[11px] text-stone-700 font-medium"
                      >
                        <option value="All">Tất cả lĩnh vực</option>
                        <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI)</option>
                        <option value="Design">Thiết kế & Mỹ thuật</option>
                        <option value="Marketing">Kinh doanh & Tiếp thị</option>
                      </select>
                    </div>

                    {/* Featured star toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowOnlyFeatured(prev => !prev)}
                      className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold flex items-center gap-1 transition-all select-none border border-brand-light-active ${showOnlyFeatured ? 'bg-amber-50/85 border-amber-300 text-amber-900 shadow-3xs scale-102 font-heavy' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${showOnlyFeatured ? 'fill-amber-400 text-amber-500' : 'text-stone-400'}`} />
                      <span>Xem Giảng Viên Nổi Bật</span>
                      {showOnlyFeatured && <span className="ml-1 w-2 h-2 bg-brand-normal rounded-full inline-block animate-ping" />}
                    </button>
                  </div>
                </div>

                {/* Sub-filtering status tags */}
                {(instructorCategory !== 'All' || showOnlyFeatured) && (
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-[10px] text-stone-400">Đang hoạt động bộ lọc:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {instructorCategory !== 'All' && (
                        <span className="text-[9.5px] bg-[#f5ece3] text-[#432c28] px-2.5 py-1 rounded-full font-bold">
                          Chuyên môn: {instructorCategory === 'Artificial Intelligence' ? 'AI / Tech' : instructorCategory === 'Design' ? 'UI/UX Design' : 'Marketing / Biz'}
                        </span>
                      )}
                      {showOnlyFeatured && (
                        <span className="text-[9.5px] bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-0.5">
                          ⭐ Chỉ hiện Nổi Bật
                        </span>
                      )}
                      <button 
                        onClick={() => { setInstructorCategory('All'); setShowOnlyFeatured(false); }}
                        className="text-[9.5px] text-brand-normal font-bold hover:underline"
                      >
                        [Xóa lọc]
                      </button>
                    </div>
                  </div>
                )}

                {/* Grid of Instructors */}
                {(() => {
                  const filtered = INSTRUCTORS_DATA.filter(inst => {
                    const matchesCat = instructorCategory === 'All' || inst.expertise === instructorCategory;
                    const matchesFeat = !showOnlyFeatured || inst.isFeatured;
                    return matchesCat && matchesFeat;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-10 text-stone-400 bg-white border border-dashed rounded-2xl w-full">
                        <p className="text-xs font-semibold">Không tìm thấy giảng viên tiêu chuẩn nào phù hợp với bộ lọc đã chọn.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {filtered.map(inst => (
                        <div 
                          key={inst.id} 
                          className={`relative border rounded-2xl p-5 bg-white flex flex-col justify-between hover-glow-card transition-all text-left space-y-4 duration-300 ${inst.isFeatured ? 'border-amber-200 shadow-3xs hover:border-amber-300' : 'border-brand-light-active'}`}
                        >
                          {/* Featured badge */}
                          {inst.isFeatured && (
                            <div className="absolute top-3 right-3 bg-amber-50 border border-amber-200 text-amber-850 text-[8.5px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-3xs select-none">
                              ⭐ Nổi bật
                            </div>
                          )}

                          <div className="space-y-3.5">
                            {/* Avatar row */}
                            <div className="flex gap-4">
                              <img 
                                src={inst.avatar} 
                                alt={inst.name} 
                                referrerPolicy="no-referrer"
                                className="w-13 h-13 rounded-xl object-cover border border-stone-200 shrink-0 shadow-sm"
                              />
                              <div className="min-w-0">
                                <h4 className="font-display font-bold text-[#432c28] text-sm truncate">{inst.name}</h4>
                                <p className="text-[10px] text-stone-400 leading-tight truncate mt-0.5">{inst.title}</p>
                                <span className="text-[8.5px] font-mono font-bold bg-[#f5ece3] text-[#432c28] px-1.5 py-0.5 rounded uppercase mt-2.5 inline-block text-center leading-none tracking-wide">
                                  {inst.expertiseLabel}
                                </span>
                              </div>
                            </div>

                            {/* Bio */}
                            <p className="text-stone-600 font-medium text-[11px] leading-relaxed italic border-t border-dashed border-stone-100 pt-2.5">
                              "{inst.bio}"
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-stone-50">
                            <div className="flex items-center gap-1">
                              <span className="text-amber-500">★</span>
                              <span className="font-bold text-stone-750">{inst.rating}</span>
                              <span className="text-stone-400">({inst.studentsCount.toLocaleString()} học viên)</span>
                            </div>
                            <span className="text-stone-400 text-[10.5px] font-medium font-mono lowercase">
                              📚 {inst.coursesCount} khóa học
                            </span>
                          </div>

                          {/* Action button */}
                          <button 
                            type="button"
                            onClick={() => handleSelectInstructorCourses(inst.name)}
                            className="w-full bg-[#faf6f2] hover:bg-brand-normal hover:text-white text-[#8b5e3c] border border-brand-light-active py-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 group cursor-pointer"
                          >
                            <span>Xem các khóa học</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </ScrollReveal>

             {/* SECTION 4: KHÓA HỌC ĐÃ MUA GẦN ĐÂY */}
            <ScrollReveal delayMs={200}>
              <div className="bg-[#fcfcfc] border border-stone-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-3xs text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2 text-[#432c28]">
                      <BookOpen className="w-5 h-5 text-[#8b5e3c]" /> Khóa học đã mua gần đây
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Hiển thị danh sách khóa học bạn sở hữu dựa trên mốc thời gian mua hàng.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className="text-[10.5px] text-stone-500 font-bold">Lọc thời gian mua:</span>
                    <select
                      value={recentPurchasedFilter}
                      onChange={(e) => setRecentPurchasedFilter(e.target.value as any)}
                      className="border border-stone-200 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none text-[10.5px] font-bold text-stone-700 shadow-3xs"
                    >
                      <option value="all">Toàn bộ thời gian ({courses.filter(c => enrolledCourseIds.includes(c.id)).length})</option>
                      <option value="1_week">Trong vòng 1 tuần</option>
                      <option value="2_weeks">Trong vòng 2 tuần</option>
                      <option value="3_weeks">Trong vòng 3 tuần</option>
                      <option value="1_month">Trong vòng 1 tháng</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const filteredEnrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id)).filter(c => {
                    if (recentPurchasedFilter === 'all') return true;
                    const pDate = getCoursePurchaseDate(c.id);
                    const diffMs = new Date().getTime() - pDate.getTime();
                    const diffDays = diffMs / (1000 * 60 * 60 * 24);
                    if (recentPurchasedFilter === '1_week') return diffDays <= 7;
                    if (recentPurchasedFilter === '2_weeks') return diffDays <= 14;
                    if (recentPurchasedFilter === '3_weeks') return diffDays <= 21;
                    if (recentPurchasedFilter === '1_month') return diffDays <= 30;
                    return true;
                  });

                  if (enrolledCourseIds.length === 0) {
                    return (
                      <div className="text-center py-8 text-stone-400 bg-white border border-dashed border-stone-200 rounded-2xl">
                        <p className="text-xs font-medium">Bạn chưa sở hữu khóa học nào. Hãy khám phá các khóa học chất lượng cao của chúng tôi dưới đây!</p>
                      </div>
                    );
                  }

                  if (filteredEnrolledCourses.length === 0) {
                    return (
                      <div className="text-center py-10 text-stone-400 bg-white border border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center space-y-1">
                        <p className="text-xs font-semibold text-stone-500">Không tìm thấy khóa học nào đã mua trong khoảng thời gian này.</p>
                        <p className="text-[10.5px] text-stone-400">Thử thay đổi bộ lọc thời gian để hiển thị đầy đủ hơn.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredEnrolledCourses.map(c => {
                        const purchaseDate = getCoursePurchaseDate(c.id);
                        return (
                          <div key={c.id} className="bg-white border border-stone-150 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all text-left space-y-3 relative">
                            <div className="flex gap-3">
                              <img src={c.image} alt="Cover" className="w-16 h-12 object-cover rounded-lg shrink-0 border" />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className="text-[8px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{c.subcategory}</span>
                                  <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-mono font-bold">
                                    Mua ngày: {purchaseDate.toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-main-normal truncate mt-1.5" title={c.title}>{c.title}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5 italic">Giảng viên: {c.instructorName}</p>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[9px] text-stone-500 font-bold">
                                <span>Tiến độ học tập:</span>
                                <span>{c.completionRate || 0}%</span>
                              </div>
                              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${c.completionRate || 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                              <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Đã kích hoạt
                              </span>
                              <button 
                                onClick={() => setStudyingCourse(c)}
                                className="bg-[#8b5e3c] hover:bg-[#5c3e38] text-white text-[10.5px] font-bold py-1.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap shadow-3xs"
                              >
                                Học tiếp »
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </ScrollReveal>� 


            {/* ❤️ WISHLIST FAVORITES PORTAL WITH DIRECT SINGLE COURSE PAYMENTS */}
            {favorites.length > 0 && (
              <ScrollReveal delayMs={240}>
                <div className="space-y-4 border-t border-brand-light-active pt-6 mt-6">
                  <h3 className="text-base md:text-lg font-extrabold flex items-center gap-1.5 text-[#432c28]">
                    <Heart className="w-5 h-5 fill-deep-indigo text-deep-indigo" /> Danh sách khóa học yêu thích của bạn
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.filter(c => favorites.includes(c.id)).map(c => {
                      const isEnrolled = enrolledCourseIds.includes(c.id);
                      return (
                        <div key={c.id} className="border border-brand-light-active rounded-2xl p-4 bg-white flex flex-col justify-between hover:shadow-md transition-all text-left space-y-3 relative">
                          <button 
                            onClick={() => handleToggleFavorite(c.id)}
                            className="absolute top-2.5 right-2.5 bg-stone-100 p-1.5 rounded-full hover:bg-stone-200 text-stone-700 transition"
                            title="Xóa khỏi yêu thích"
                          >
                            ✕
                          </button>
                          
                          <div className="flex gap-3">
                            <img src={c.image} alt="Cover" className="w-16 h-12 object-cover rounded-lg shrink-0 border" />
                            <div className="min-w-0">
                              <span className="text-[8px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono font-bold uppercase">{c.subcategory}</span>
                              <h4 className="font-bold text-xs text-main-normal truncate mt-1">{c.title}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5 italic">Giảng viên: {c.instructorName}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-50 text-xs">
                            <div className="space-y-0.5">
                              {c.salePrice ? (
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-[#432c28]">{formatVND(c.salePrice)}</span>
                                  <span className="text-[10px] text-stone-400 line-through font-mono">{formatVND(c.price)}</span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-[#432c28]">{formatVND(c.price)}</span>
                              )}
                            </div>

                            {isEnrolled ? (
                              <button 
                                onClick={() => setStudyingCourse(c)}
                                className="bg-emerald-50 text-emerald-800 text-[10px] font-bold py-2.5 px-4.5 rounded-xl transition whitespace-nowrap"
                              >
                                Đã sở hữu ✓
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBuyCourseNow(c.id)}
                                className="bg-deep-indigo hover:bg-deep-indigo/95 text-white text-[10px] font-bold py-2.5 px-5 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer whitespace-nowrap"
                              >
                                Mua Ngay
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* HERO BANNER POPUP MODAL */}
            {showHeroPopup && (
              <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto pointer-events-none">
                <div className="fixed inset-0 bg-transparent pointer-events-auto" onClick={() => setShowHeroPopup(false)} />
                <div className="relative bg-white border-2 border-[#e8ded3] rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col pointer-events-auto">
                  
                  {/* Modal Header / Close button */}
                  <div className="absolute top-4 right-4 z-40">
                    <button 
                      onClick={() => setShowHeroPopup(false)}
                      className="bg-black/75 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md font-bold text-sm cursor-pointer border border-white/20"
                      title="Đóng"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="overflow-y-auto p-2 sm:p-4 md:p-6">
                    {(() => {
                      const activeBanners = banners.filter(b => b.isActive);
                      const displayBanners = (activeBanners.length > 0 ? activeBanners : [
                        {
                          id: 'banner-1',
                          title: 'Nghệ thuật đào tạo số',
                          subtitle: 'Nền tảng học tập trực tuyến chắt lọc tinh hoa từ phương pháp giáo dục truyền thống và trải nghiệm công nghệ tinh tế. Hôm nay bạn đang thắp sáng ngọn lửa học tập!',
                          actionText: 'Bắt đầu học tập',
                          actionUrl: '#courses-explorer',
                          backgroundColor: '#fcf8f2',
                          textColor: '#432c28',
                          accentColor: '#8b5e3c',
                          imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000",
                          isActive: true
                        }
                      ]) as Banner[];
                      
                      const safeIndex = (currentBannerIndex + displayBanners.length) % displayBanners.length;
                      const currentBanner = displayBanners[safeIndex];

                      const handleActionClick = () => {
                        setShowHeroPopup(false);
                        const url = currentBanner.actionUrl || '';
                        if (url.startsWith('#')) {
                          const el = document.getElementById(url.replace('#', '')) || document.getElementById('available-courses-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        } else if (categoriesList.includes(url)) {
                          setSelectedCategory(url);
                          const el = document.getElementById('available-courses-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          const el = document.getElementById('available-courses-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      };

                      return (
                        <div 
                          style={{ backgroundColor: currentBanner.backgroundColor || '#fcf8f2', color: currentBanner.textColor || '#432c28' }}
                          className="p-6 md:p-10 rounded-2xl border border-brand-light-active relative overflow-hidden text-left"
                        >
                          {/* Decorative background logo blob */}
                          <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#e8d8c8]/50 rounded-full filter blur-2xl opacity-40 select-none pointer-events-none animate-float-slow"></div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
                            
                            {/* Left Column - Content */}
                            <div className="lg:col-span-7 space-y-4 lg:space-y-5">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-xs shadow-3xs inline-block"
                                  style={{ color: currentBanner.accentColor }}
                                >
                                  TIN TỔNG TIÊU ĐIỂM
                                </span>
                                {displayBanners.length > 1 && (
                                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-black/5 rounded-md font-bold">
                                    Trang {safeIndex + 1}/{displayBanners.length}
                                  </span>
                                )}
                              </div>
                              
                              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.1]">
                                Xin chào, <span className="underline font-semibold" style={{ textDecorationColor: currentBanner.accentColor }}>{currentUser.name}</span>!
                                <span className="block font-serif italic font-normal text-2xl md:text-3xl lg:text-[36px] mt-2 leading-[1.15]" style={{ color: currentBanner.accentColor }}>
                                  {currentBanner.title}
                                </span>
                              </h1>
                              
                              <p className="text-xs md:text-sm leading-relaxed font-sans max-w-xl opacity-90">
                                {currentBanner.subtitle}
                              </p>

                              <div className="flex flex-wrap gap-2 pt-1">
                                <button 
                                  onClick={handleActionClick}
                                  style={{ backgroundColor: currentBanner.accentColor }}
                                  className="inline-flex items-center justify-center gap-2 text-white px-8 py-3 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer hover:brightness-105"
                                >
                                  {currentBanner.actionText} <span className="text-sm">→</span>
                                </button>
                                
                                <button 
                                  onClick={() => {
                                    setShowIntroVideo(true);
                                    setIntroVideoTime(0);
                                    setIntroAutoCloseCountdown(null);
                                    setShowHeroPopup(false); // also close modal to view video
                                  }}
                                  className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-stone-700 border border-brand-light-active px-6 py-3 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                                >
                                  Xem giới thiệu <span className="text-xs">▶</span>
                                </button>
                              </div>

                              {/* Interactive Tech Sandbox Environment Panel */}
                              <div className="space-y-3 pt-3 pb-1 border-t border-brand-light-active/30 max-w-lg bg-white/40 backdrop-blur-3xs border border-mist p-3.5 rounded-xl shadow-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-deep-indigo uppercase tracking-wider block flex items-center gap-1.5">
                                    ⚡ Môi Trường Sandbox Lab:
                                  </span>
                                  <span className="text-[8px] bg-pale-cyan text-forest-teal px-1.5 py-0.5 rounded-full font-bold">
                                    Thiết lập phiên làm việc trực tuyến
                                  </span>
                                </div>
                                
                                {/* Sandbox Selections */}
                                <div className="grid grid-cols-3 gap-1.5">
                                  <button 
                                    onClick={() => setSelectedDrink('espresso')}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${selectedDrink === 'espresso' ? 'bg-deep-indigo text-white border-deep-indigo shadow-md' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}
                                  >
                                    <Cpu className="w-3.5 h-3.5 text-deep-indigo" />
                                    <span>Cloud VM</span>
                                  </button>
                                  <button 
                                    onClick={() => setSelectedDrink('cappuccino')}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${selectedDrink === 'cappuccino' ? 'bg-deep-indigo text-white border-deep-indigo shadow-md' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}
                                  >
                                    <Layers className="w-3.5 h-3.5 text-forest-teal" />
                                    <span>Agent AI</span>
                                  </button>
                                  <button 
                                    onClick={() => setSelectedDrink('matcha')}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${selectedDrink === 'matcha' ? 'bg-deep-indigo text-white border-deep-indigo shadow-md' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}
                                  >
                                    <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Web Dev</span>
                                  </button>
                                </div>

                                {/* Table Number */}
                                <div className="pt-1.5 border-t border-stone-150 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-stone-500 font-bold">Server Node:</span>
                                    <span className="text-[10px] bg-deep-indigo text-white px-1.5 py-0.5 rounded font-black">
                                      Node #{selectedTable < 10 ? `0${selectedTable}` : selectedTable}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 bg-white border border-stone-200 p-0.5 rounded-lg select-none">
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedTable(prev => Math.max(1, prev - 1))}
                                      disabled={selectedTable <= 1}
                                      className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-stone-600 bg-stone-50 rounded"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="number"
                                      min={1}
                                      max={99}
                                      value={selectedTable || ''}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setSelectedTable(isNaN(val) ? 1 : Math.min(99, Math.max(1, val)));
                                      }}
                                      className="w-6 text-center font-bold text-stone-850 text-[10px] bg-transparent border-0 p-0 focus:ring-0 focus:outline-hidden"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedTable(prev => Math.min(99, prev + 1))}
                                      disabled={selectedTable >= 99}
                                      className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-stone-600 bg-stone-50 rounded"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Stats Row */}
                              <div className="pt-3 border-t border-brand-light-active/40 flex gap-4 items-center text-[11px] text-stone-500">
                                <div>
                                  <span className="font-serif italic text-base font-bold text-[#432c28] block">15k+</span>
                                  <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">HỌC VIÊN</span>
                                </div>
                                <div className="w-px h-6 bg-brand-light-active/50"></div>
                                <div>
                                  <span className="font-serif italic text-base font-bold text-[#432c28] block">120+</span>
                                  <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">CHUYÊN GIA</span>
                                </div>
                                <div className="w-px h-6 bg-brand-light-active/50"></div>
                                <div>
                                  <span className="font-serif italic text-base font-bold text-[#432c28] block font-semibold text-[#8b5e3c]">4.9/5</span>
                                  <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">ĐÁNH GIÁ</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Image */}
                            <div className="lg:col-span-5 relative flex flex-col items-center justify-center p-2">
                              <div className="absolute inset-0 bg-white border border-brand-light-active rounded-2xl -translate-x-2 -translate-y-2 z-0"></div>
                              <div className="relative w-full h-[220px] md:h-[260px] rounded-2xl overflow-hidden border-2 border-white shadow-md z-10">
                                <img 
                                  src={currentBanner.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000"} 
                                  alt={currentBanner.title} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover select-none" 
                                />
                              </div>

                              {/* Arrows */}
                              {displayBanners.length > 1 && (
                                <div className="absolute bottom-4 right-4 z-30 flex gap-1.5">
                                  <button
                                    onClick={() => setCurrentBannerIndex(prev => (prev - 1 + displayBanners.length) % displayBanners.length)}
                                    className="w-8 h-8 bg-stone-900/85 hover:bg-stone-900 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer text-xs"
                                  >
                                    ←
                                  </button>
                                  <button
                                    onClick={() => setCurrentBannerIndex(prev => (prev + 1) % displayBanners.length)}
                                    className="w-8 h-8 bg-stone-900/85 hover:bg-stone-900 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer text-xs"
                                  >
                                    →
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* --- FREE LESSON PREVIEW OVERLAYS --- */}
      {previewLesson && (
        <FreePreviewModal 
          previewLesson={previewLesson}
          onClose={() => setPreviewLesson(null)}
          onBuyNow={(courseId) => {
            setPreviewLesson(null);
            handleBuyCourseNow(courseId);
          }}
        />
      )}

      {/* --- CLASSROOM LEARNING SIMULATION ACTIVE SHEET OVERLAYS --- */}
      {studyingCourse && (
        <ClassroomScreen 
          course={studyingCourse}
          currentUser={currentUser}
          enrolledCourseIds={enrolledCourseIds}
          onClose={() => setStudyingCourse(null)}
        />
      )}

      {/* --- CART AND CHECKOUT MODAL OVERLAYS --- */}
      {showCart && (
        <CartAndCheckout 
          wishlistCourseIds={favorites}
          allCourses={courses}
          enrolledCourseIds={enrolledCourseIds}
          onEnrollSuccess={handleEnrollSuccess}
          onClose={() => {
            setShowCart(false);
            setDirectSelectCourseId(null);
          }}
          onToggleFavorite={handleToggleFavorite}
          onEnterLesson={(course) => {
            setShowCart(false);
            setDirectSelectCourseId(null);
            setStudyingCourse(course);
          }}
          initialCourseId={directSelectCourseId}
        />
      )}

      {/* --- STATICS LEGAL TERMS MODAL OVERLAYS --- */}
      {showLegal && (
        <FooterLegal 
          initialTab={showLegal as any}
          onClose={() => setShowLegal(null)}
        />
      )}

      {/* --- AUTHENTICATION MODAL OVERLAYS --- */}
      {showAuth && (
        <AuthScreens
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsLoggedIn(true);
            // Quick in-app success notification
            alert(`Đăng nhập thành công! Chào mừng, ${user.name} (${user.role.toUpperCase()})`);
          }}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* --- STATIC SITE FOOTER LINKS --- */}
      <footer className="bg-main-dark text-brand-light py-12 px-4 md:px-8 border-t border-brand-light/10 mt-12 shrink-0 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-left text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Compass className="w-5 h-5 text-brand-normal" />
              <span className="font-display font-medium text-sm tracking-tight">MindHub E-Learning</span>
            </div>
            <p className="text-gray-400 leading-normal text-[10.5pt] font-light">
              Hệ thống quản lý thông minh kiến tạo tri thức từ việc rèn luyện thực tế kết hợp trợ lý AI Mentor đồng hành.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-white uppercase text-[10px] tracking-widest text-[#dbcdc3] block">Về MindHub</span>
            <button onClick={() => setShowLegal('faq')} className="block text-gray-400 hover:text-white text-left font-light">Xem câu hỏi FAQ</button>
            <button onClick={() => setShowLegal('terms')} className="block text-gray-400 hover:text-white text-left font-light">Điều khoản dịch vụ</button>
            <button onClick={() => setShowLegal('privacy')} className="block text-gray-400 hover:text-white text-left font-light">Bản quyền thông tin</button>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-white uppercase text-[10px] tracking-widest text-[#dbcdc3] block">Hỗ trợ khẩn cấp</span>
            <button onClick={() => setShowLegal('contact')} className="block text-gray-400 hover:text-white text-left font-light">Gửi Ticket yêu cầu trợ giúp</button>
            <button onClick={() => setShowLegal('refund')} className="block text-gray-400 hover:text-white text-left font-light">Chính sách hoàn trả học phí</button>
            <span className="block text-gray-450 font-sans font-light">Email: help@mindhub.edu.vn</span>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-white uppercase text-[10px] tracking-widest text-[#dbcdc3] block">Bảo mật giao dịch</span>
            <p className="text-gray-450 font-light">Đơn vị quản lý: Công ty Cổ phần Công nghệ Giáo Dục Quốc Tế MindHub Việt Nam.</p>
            <span className="text-[10px] bg-white/10 text-white p-1 px-2.5 rounded block text-center font-bold">XÁC THỰC BOUTIQUE SSL</span>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-brand-light/10 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400">
          <span>MindHub e-learning platform © 2026. Tất cả chỉ là giao diện mô phỏng React & Tailwind CSS.</span>
          <div className="flex gap-3 mt-2 sm:mt-0">
            <button onClick={() => alert('Xác thực chứng chỉ MindHub bằng mã hóa block chuỗi an toàn')} className="hover:underline">Xác thực chứng chỉ công khai</button>
          </div>
        </div>
      </footer>

      {/* --- FLOATING HELP & SUPPORT CENTER QUICK ACTION WIDGET --- */}
      <div className="fixed bottom-6 right-6 z-[9900] select-none text-xs">
        {/* Toggleable Action Hub menu pop-up */}
        {showFloatingHelp && (
          <div className="absolute bottom-16 right-0 w-64 bg-white rounded-2xl border border-[#e8ded3] shadow-2xl p-4.5 space-y-3.5 text-left text-stone-800 animate-scale-up">
            <div className="border-b border-[#e8ded3]/60 pb-2">
              <span className="font-bold text-xs text-[#8b5e3c] block">💬 Trợ Giúp & Hỗ Trợ</span>
              <span className="text-[10px] text-stone-400 mt-0.5 block leading-tight">MindHub Việt Nam - Trực tuyến 24/7 giải đáp thắc mắc</span>
            </div>
            
            <div className="space-y-1.5 font-medium text-[11.5px]">
              <button 
                onClick={() => { setShowLegal('faq'); setShowFloatingHelp(false); }}
                className="w-full text-left py-1.5 px-2 bg-stone-50 hover:bg-[#faf6f2] hover:text-[#8b5e3c] rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                ❓ Xem câu hỏi FAQ chung
              </button>
              <button 
                onClick={() => { setShowLegal('contact'); setShowFloatingHelp(false); }}
                className="w-full text-left py-1.5 px-2 bg-stone-50 hover:bg-[#faf6f2] hover:text-[#8b5e3c] rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                🎟️ Gửi ticket liên hệ hỗ trợ
              </button>
              <button 
                onClick={() => { setShowLegal('terms'); setShowFloatingHelp(false); }}
                className="w-full text-left py-1.5 px-2 bg-stone-50 hover:bg-[#faf6f2] hover:text-[#8b5e3c] rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                📜 Điều khoản sử dụng MindHub
              </button>
              <button 
                onClick={() => { setShowLegal('privacy'); setShowFloatingHelp(false); }}
                className="w-full text-left py-1.5 px-2 bg-stone-50 hover:bg-[#faf6f2] hover:text-[#8b5e3c] rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                🛡️ Chính sách bảo mật dữ liệu
              </button>
              <button 
                onClick={() => { setShowLegal('refund'); setShowFloatingHelp(false); }}
                className="w-full text-left py-1.5 px-2 bg-stone-50 hover:bg-[#faf6f2] hover:text-[#8b5e3c] rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                💸 Chính sách hoàn trả học phí
              </button>
            </div>
            
            <div className="bg-[#faf6f2] p-2 rounded-xl text-[9px] text-[#8b5e3c] font-bold text-center leading-normal border border-[#eedecf]/55">
              💡 Phản hồi cam kết trong vòng 12h!
            </div>
          </div>
        )}

        {/* Floating head-set indicator button with animated outer soundwave pulse rings */}
        <button 
          onClick={() => setShowFloatingHelp(!showFloatingHelp)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white bg-[#432c28] hover:bg-black transition-all shadow-xl hover:scale-105 cursor-pointer relative z-40 group ${showFloatingHelp ? 'ring-4 ring-amber-100/60' : ''}`}
          title="Mở Trung tâm trợ giúp"
        >
          {showFloatingHelp ? (
            <span className="text-sm font-black transform duration-200">✕</span>
          ) : (
            <>
              {/* Outer wave rings */}
              <span className="absolute inset-0 rounded-full bg-[#8b5e3c]/20 animate-ping opacity-75 pointer-events-none group-hover:block" />
              <HelpCircle className="w-6 h-6 text-brand-light" />
              {/* Notification red blink badge dots */}
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white flex items-center justify-center font-bold text-[7px] text-white animate-pulse">!</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden YouTube player placeholder */}
      <div className="fixed w-1 h-1 opacity-0 pointer-events-none -bottom-10 -left-10 overflow-hidden">
        <div id="youtube-bgm-placeholder"></div>
      </div>

    </div>
  );
}
