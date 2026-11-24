'use client';

import { API_BASE_URL, API_ORIGIN } from '../config/apiConfig';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FolderTree,
  Radio,
  Sparkles,
  Plus,
  Search,
  Edit3,
  Music,
  BookOpen,
  CheckCircle2,
  Database,
  Globe,
  Calendar,
  Compass,
  MapPin,
  FileText,
  Users,
  Image as ImageIcon,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  Layers,
  BellRing,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  LogOut,
  Lock,
  Archive,
  Key,
  User,
  Trash2,
  Play,
  ArrowLeft,
  CheckSquare,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  AlertTriangle,
  Upload,
  Save,
  LifeBuoy,
  Palette,
  MessageSquare,
  Landmark,
  Edit,
  CheckCircle,
  Send,
  X,
  Clock,
  Smartphone,
  Share2,
  ExternalLink,
  Flame,
  Scroll,
  Tv,
  HeartHandshake,
  ArrowRight,
  AlertCircle,
  Info,
  Phone,
  Mail,
  LogIn
} from 'lucide-react';
import { SplashScreenManager } from './components/SplashScreenManager';
import { RichTextEditor } from './components/RichTextEditor';
import { TranslationModal, FieldDefinition } from './components/TranslationModal';


interface DeityItem {
  id: string;
  name: string;
  alternateName?: string;
  category: 'God' | 'Goddess' | 'Avatar' | 'Cosmic Form' | string;
  vahana?: string;
  moolaMantra?: string;
  primaryTemple?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive: boolean;
}

interface SupportTicketItem {
  id: number;
  ticket_number: string;
  user_id?: number;
  user_name: string;
  user_email?: string;
  user_phone?: string;
  user_role?: string;
  subject: string;
  category?: string;
  priority?: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  admin_response?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  isAudio: boolean;
  isArchived: boolean;
  description: string;
  subtitle?: string;
  imageUrl?: string;
  artwork?: string;
  subcategoriesCount?: number;
  devotionalCount?: number;
}

interface SubcategoryItem {
  id: string;
  title: string;
  slug: string;
  parentTitle?: string;
  parentId?: number;
  parentSlug?: string;
  parentKey?: string;
  description: string;
  displayOrder?: number;
  isAudio?: boolean;
  imageUrl?: string;
}

interface ParentLookupItem {
  id: number | string;
  slug: string;
  title: string;
  parentId?: number | null;
  subcategoriesCount?: number;
}

interface FullCategoryDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isAudio?: boolean;
  displayOrder?: number;
  isSubcategory?: boolean;
  isType?: boolean;
  isPublished?: boolean;
  sacredText?: string | null;
  meaning?: string | null;
  parentId?: number | string | null;
  parentSlug?: string | null;
  parentTitle?: string | null;
  imageUrl?: string | null;
  hasExactTranslation?: boolean;
  exactTitle?: string | null;
  exactDescription?: string | null;
  requestedLang?: string;
  translations?: Array<{ code: string; name: string; title: string; description: string | null }>;
  subcategories?: Array<{ id: string; title: string; slug: string; description: string | null }>;
  contents?: Array<{ id: number; title: string; sacredText: string | null; meaning: string | null }>;
  createdAt?: string;
  updatedAt?: string;
}

interface DevotionalContentItem {
  id: number;
  title: string;
  slug: string;
  sacredText?: string;
  meaning?: string;
  isPublished?: boolean;
  displayOrder?: number;
  categoryId: number;
  category?: any;
}

interface FestivalItem {
  id: number;
  slug: string;
  festivalDate: string;
  sourceNote?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations?: Array<{
    name: string;
    description?: string;
    language?: { code: string; name: string };
  }>;
}

interface AudioItem {
  id: number;
  title: string;
  slug: string;
  duration: string;
  status: string;
  url: string;
}

interface LanguageItem {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isDefault: boolean;
  status: string;
  translationCount?: number;
}

interface AppUserItem {
  id: number;
  phoneNumber?: string;
  deviceUuid?: string;
  fullName?: string;
  email?: string;
  preferredLang: string;
  isSuspended: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletionRequested?: boolean;
  deletionRequestedAt?: string;
  deletionReason?: string;
  createdAt: string;
}

interface AuditLogItem {
  id: number;
  action: string;
  targetType: string;
  targetId?: string;
  detailsJson?: string;
  createdAt: string;
  admin?: { fullName: string; email: string };
}

interface CmsItem {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalLanguages: number;
  activeCategories: number;
  activeSubcategories: number;
  publishedDevotionalItems: number;
  totalAudioFiles: number;
  panchangamEvents: number;
  activeFestivals: number;
  publishedCmsPages?: number;
  database: string;
  systemHealth: string;
}

const resolveLogoDisplayUrl = (url?: string) => {
  if (!url || !url.trim()) return '/images/saranam-ayyappa-official-emblem.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/images/')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

const resolveDeityImageUrl = (url?: string) => {
  if (!url || !url.trim()) return 'https://saranamayyappa.in/images/temples/banner-sabarimala-hd.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads') || url.startsWith('uploads/')) {
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  if (url.startsWith('/')) {
    return `https://saranamayyappa.in${url}`;
  }
  return url;
};

const resolveTempleImageUrl = (url?: string) => {
  if (!url || !url.trim()) return 'https://saranamayyappa.in/images/temples/banner-sabarimala-hd.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads') || url.startsWith('uploads/')) {
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  if (url.startsWith('/')) {
    return `https://saranamayyappa.in${url}`;
  }
  return url;
};

const categoryArtworkMap: Record<string, string> = {
  pooja: '/images/categories/art-pooja-trans.png',
  stotras: '/images/categories/art-stotras-trans.png',
  slokas: '/images/categories/art-slokas-trans.png',
  songs: '/images/categories/art-bhajans-trans.png',
  bhajans: '/images/categories/art-bhajans-trans.png',
  'live-streams': '/images/categories/art-live-trans.png',
  live: '/images/categories/art-live-trans.png',
  panchangam: '/images/categories/art-panchangam-trans.png',
  festivals: '/images/categories/art-stotras-trans.png',
  temples: '/images/categories/art-temples-trans.png',
  donations: '/images/categories/art-donations-trans.png',
};

const resolveArtworkUrl = (url?: string) => {
  if (!url || !url.trim()) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads') || url.startsWith('uploads/')) {
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

const renderServiceIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'flame': return <Flame className="w-5 h-5 text-amber-500" />;
    case 'bookopen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
    case 'scroll': return <Scroll className="w-5 h-5 text-amber-600" />;
    case 'music': return <Music className="w-5 h-5 text-rose-500" />;
    case 'tv': return <Tv className="w-5 h-5 text-sky-500" />;
    case 'calendar': return <Calendar className="w-5 h-5 text-emerald-600" />;
    case 'sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
    case 'landmark': return <Landmark className="w-5 h-5 text-amber-500" />;
    case 'hearthandshake': return <HeartHandshake className="w-5 h-5 text-rose-400" />;
    default: return <Sparkles className="w-5 h-5 text-amber-400" />;
  }
};

export default function EnterpriseSuperAdminDashboard() {
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<{ id: number; email: string; fullName: string; role: string }>({
    id: 0,
    email: '',
    fullName: '',
    role: ''
  });

  const loadAdminProfile = useCallback(async (emailHint?: string) => {
    try {
      const email = emailHint || adminProfile?.email || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ayyappa_admin_profile') || '{}').email : '') || 'admin@ayyappa.org';
      if (!email) return;
      const res = await fetch(`${API_BASE_URL}/admin/profile?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.email) {
          setAdminProfile(data);
          setEditFullName(data.fullName || '');
          if (typeof window !== 'undefined') {
            localStorage.setItem('ayyappa_admin_profile', JSON.stringify(data));
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch admin profile:', e);
    }
  }, [adminProfile?.email]);

  // Check auth synchronously on client mount before rendering anything
  useEffect(() => {
    loadAppLogo();
    try {
      const token = localStorage.getItem('ayyappa_admin_token');
      const saved = localStorage.getItem('ayyappa_admin_profile');
      if (token && token !== 'dev_master_token_authenticated') {
        setIsAuthenticated(true);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAdminProfile(parsed);
            setEditFullName(parsed.fullName || '');
          } catch { }
        }
        loadAdminProfile();
      } else {
        localStorage.removeItem('ayyappa_admin_token');
        localStorage.removeItem('ayyappa_admin_profile');
        setIsAuthenticated(false);
      }
    } catch { } finally {
      setIsAuthChecking(false);
    }
  }, [loadAdminProfile]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginEmailTouched, setLoginEmailTouched] = useState<boolean>(false);
  const [loginPasswordTouched, setLoginPasswordTouched] = useState<boolean>(false);
  const [rememberAdmin, setRememberAdmin] = useState<boolean>(true);

  // Restore remembered email on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('ayyappa_admin_saved_email');
      if (savedEmail) {
        setLoginEmail(savedEmail);
      }
    }
  }, []);

  // Active Selected Type inside Subcategory View Detailed Page ('all' or type index number)
  const [activeViewTypeTab, setActiveViewTypeTab] = useState<'all' | number>('all');

  // Profile Edit State
  const [editFullName, setEditFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // =========================================================
  // GODS & GODDESSES (DEITIES) MANAGEMENT STATE & HANDLERS
  // =========================================================
  const [deities, setDeities] = useState<DeityItem[]>([]);
  const [deityCategoryFilter, setDeityCategoryFilter] = useState<string>('ALL');
  const [deitySearch, setDeitySearch] = useState<string>('');
  const [editingDeity, setEditingDeity] = useState<Partial<DeityItem> | null>(null);
  const [isDeityModalOpen, setIsDeityModalOpen] = useState<boolean>(false);

  const loadDeities = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/deities`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data)) {
          setDeities(data.data);
          return;
        }
      }
      setDeities([]);
    } catch (err) {
      console.error('Failed to load deities from DB:', err);
      setDeities([]);
    }
  }, []);

  const handleOpenCreateDeity = () => {
    setEditingDeity({
      id: '',
      name: '',
      alternateName: '',
      category: 'God',
      vahana: '',
      moolaMantra: '',
      primaryTemple: '',
      description: '',
      imageUrl: '/images/temples/banner-sabarimala-hd.png',
      displayOrder: (deities.length + 1),
      isActive: true,
    });
    setIsDeityModalOpen(true);
  };

  const handleOpenEditDeity = (deity: DeityItem) => {
    setEditingDeity({ ...deity });
    setIsDeityModalOpen(true);
  };

  const handleDeityImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data && editingDeity) {
        setEditingDeity({ ...editingDeity, imageUrl: base64Data });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDeity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeity?.name?.trim()) {
      alert('Deity Name is required.');
      return;
    }

    try {
      setLoading(true);
      const isExisting = deities.some(d => d.id === editingDeity.id);
      const url = isExisting
        ? `${API_BASE_URL}/admin/deities/${editingDeity.id}`
        : `${API_BASE_URL}/admin/deities`;
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDeity),
      });

      if (res.ok) {
        setNotification(isExisting ? 'Deity entry updated successfully.' : 'New Deity entry created successfully.');
        setTimeout(() => setNotification(null), 3500);
        setIsDeityModalOpen(false);
        setEditingDeity(null);
        loadDeities();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || 'Failed to save deity.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error saving deity.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeity = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this Deity entry?')) return;
    try {
      setLoading(true);
      await fetch(`${API_BASE_URL}/admin/deities/${id}`, { method: 'DELETE' });
    } catch { }
    setDeities(prev => prev.filter(d => d.id !== id));
    setNotification('Deity entry removed successfully.');
    setTimeout(() => setNotification(null), 3500);
    setLoading(false);
  };

  const handleToggleDeityStatus = async (deity: DeityItem) => {
    const updated = { ...deity, isActive: !deity.isActive };
    try {
      await fetch(`${API_BASE_URL}/admin/deities/${deity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updated.isActive }),
      });
    } catch { }
    setDeities(prev => prev.map(d => d.id === deity.id ? updated : d));
    setNotification(`Deity status updated to ${updated.isActive ? 'Active' : 'Inactive'}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const [pageMode, setPageMode] = useState<'LIST' | 'EDIT_CATEGORY' | 'VIEW_CATEGORY' | 'EDIT_SUBCATEGORY' | 'EDIT_TYPE'>('LIST');
  const [viewDetail, setViewDetail] = useState<FullCategoryDetail | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Shared Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [selectedParentCategoryFilter, setSelectedParentCategoryFilter] = useState<string>('all');
  const [selectedSubcategoryForTypes, setSelectedSubcategoryForTypes] = useState<string>('all');
  const [parentLookupList, setParentLookupList] = useState<ParentLookupItem[]>([]);
  const parentLookupListRef = useRef<ParentLookupItem[]>([]);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subFormTitle, setSubFormTitle] = useState('');
  const [subFormSlug, setSubFormSlug] = useState('');
  const [subFormParentId, setSubFormParentId] = useState<number | ''>('');
  const [subFormDescription, setSubFormDescription] = useState('');
  const [subFormImageUrl, setSubFormImageUrl] = useState('');

  // Subcategory Pagination States
  const [subPage, setSubPage] = useState(1);
  const [subLimit, setSubLimit] = useState(15);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subTotalCount, setSubTotalCount] = useState(0);

  // Type Pagination & Form States
  const [typePage, setTypePage] = useState(1);
  const [typeLimit, setTypeLimit] = useState(15);
  const [typeTotalPages, setTypeTotalPages] = useState(1);
  const [typeTotalCount, setTypeTotalCount] = useState(0);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [typeFormCategoryId, setTypeFormCategoryId] = useState<number | ''>('');
  const [typeFormParentId, setTypeFormParentId] = useState<number | string>('all');
  const [allSubcategoriesList, setAllSubcategoriesList] = useState<SubcategoryItem[]>([]);
  const [typeFormTitle, setTypeFormTitle] = useState('');
  const [typeFormSlug, setTypeFormSlug] = useState('');
  const [typeFormSacredText, setTypeFormSacredText] = useState('');
  const [typeFormMeaning, setTypeFormMeaning] = useState('');
  const [typeFormDisplayOrder, setTypeFormDisplayOrder] = useState<number>(1);
  const [typeFormIsPublished, setTypeFormIsPublished] = useState(true);
  const [devotionalContent, setDevotionalContent] = useState<DevotionalContentItem[]>([]);
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [cmsPages, setCmsPages] = useState<CmsItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [users, setUsers] = useState<AppUserItem[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<AppUserItem[]>([]);
  const [softDeletedUsers, setSoftDeletedUsers] = useState<AppUserItem[]>([]);
  const [userSubTab, setUserSubTab] = useState<'all' | 'requests'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Dedicated Dynamic Dharma Kartha Records State
  const [dharmaKarthas, setDharmaKarthas] = useState<any[]>([]);
  const [dkLoading, setDkLoading] = useState(false);
  const [dkSearch, setDkSearch] = useState('');
  const [selectedDkRecord, setSelectedDkRecord] = useState<any | null>(null);
  const [selectedDkTempleIndex, setSelectedDkTempleIndex] = useState(0);
  const [activeDkDetailTab, setActiveDkDetailTab] = useState<'about' | 'speciality' | 'contact' | 'timings' | 'events' | 'festivals' | 'gallery'>('about');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Server-side Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioFilter, setIsAudioFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en');
  const [tickerText, setTickerText] = useState('');
  const [appLogoUrl, setAppLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('ayyappa_admin_logo') || '';
      } catch { }
    }
    return '';
  });
  const [customLogoInput, setCustomLogoInput] = useState('');
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);

  // Settings: Title, Description, and Theme Colors (Loaded dynamically from DB API)
  const [appTitle, setAppTitle] = useState('');
  const [appTagline, setAppTagline] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [themePrimaryColor, setThemePrimaryColor] = useState('');
  const [themeSecondaryColor, setThemeSecondaryColor] = useState('');
  const [themeBackgroundColor, setThemeBackgroundColor] = useState('');
  const [themeSurfaceColor, setThemeSurfaceColor] = useState('');

  // App Store Download Links (Loaded dynamically from DB API)
  const [playStoreUrl, setPlayStoreUrl] = useState('');
  const [appStoreUrl, setAppStoreUrl] = useState('');

  // Social Media Links (Loaded dynamically from DB API)
  const [socialYoutubeUrl, setSocialYoutubeUrl] = useState('');
  const [socialTelegramUrl, setSocialTelegramUrl] = useState('');
  const [socialInstagramUrl, setSocialInstagramUrl] = useState('');
  const [socialFacebookUrl, setSocialFacebookUrl] = useState('');
  const [socialWhatsappUrl, setSocialWhatsappUrl] = useState('');

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [ticketStats, setTicketStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [selectedTicketFilter, setSelectedTicketFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  // Devotional Services State (from /categories/services API)
  const [devotionalServices, setDevotionalServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [selectedViewService, setSelectedViewService] = useState<any | null>(null);
  const [isViewServiceModalOpen, setIsViewServiceModalOpen] = useState(false);
  const [editingCategoryService, setEditingCategoryService] = useState<any | null>(null);
  const [isServiceEditModalOpen, setIsServiceEditModalOpen] = useState(false);
  const [isSavingCategoryService, setIsSavingCategoryService] = useState(false);

  // Temple Types State
  const [templeTypes, setTempleTypes] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [isTempleTypeModalOpen, setIsTempleTypeModalOpen] = useState(false);
  const [editingTempleType, setEditingTempleType] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [templeTypeForm, setTempleTypeForm] = useState({ id: '', name: '', description: '' });
  const [isSavingTempleType, setIsSavingTempleType] = useState(false);

  // Sacred Temples Management State (Dynamically fetched from DB via API)
  const [templesList, setTemplesList] = useState<any[]>([]);
  const [isTemplesLoading, setIsTemplesLoading] = useState(false);
  const [templeSearch, setTempleSearch] = useState('');
  const [templeDeityFilter, setTempleDeityFilter] = useState('ALL');
  const [templeStateFilter, setTempleStateFilter] = useState('ALL');
  const [isTempleModalOpen, setIsTempleModalOpen] = useState(false);
  const [editingTemple, setEditingTemple] = useState<any | null>(null);
  const [isSavingTemple, setIsSavingTemple] = useState(false);
  const [isViewingTemple, setIsViewingTemple] = useState(false);
  const [viewingTempleItem, setViewingTempleItem] = useState<any | null>(null);
  const [templeForm, setTempleForm] = useState({
    name: '',
    templeType: 'MAIN_TEMPLE',
    alternateName: '',
    slug: '',
    deityId: 'Lord Ayyappa',
    deityName: 'Lord Ayyappa',
    city: '',
    district: '',
    state: 'Andhra Pradesh',
    country: 'India',
    address: '',
    pincode: '',
    shortDescription: '',
    about: '',
    history: '',
    speciality: '',
    officePhone: '',
    officialEmail: '',
    officialWebsite: '',
    morningTimings: '03:00 AM – 01:00 PM',
    eveningTimings: '03:00 PM – 11:00 PM',
    phone: '',
    email: '',
    website: '',
    heroImageUrl: '',
    thumbnailUrl: '',
    hasLiveDarshan: false,
    liveStreamId: '',
    isActive: true,
    teName: '',
    knName: '',
    taName: '',
    mlName: '',
    hiName: '',
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Industry-grade Toast System
  const [adminToast, setAdminToast] = useState<{
    id: number;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setAdminToast({ id, title, message, type });
  }, []);

  useEffect(() => {
    if (!adminToast) return;
    const timer = setTimeout(() => {
      setAdminToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [adminToast]);

  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIsAudio, setFormIsAudio] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  // CMS Editor State
  const [selectedCmsKey, setSelectedCmsKey] = useState<string>('about_us');
  const [cmsEditTitle, setCmsEditTitle] = useState('');
  const [cmsEditContent, setCmsEditContent] = useState('');
  const [isSavingCms, setIsSavingCms] = useState(false);

  // Accordion State: Only one section can be expanded at a time
  const [expandedSection, setExpandedSection] = useState<'cms' | 'users' | 'categories' | 'vidhanam' | 'audio' | null>('cms');

  // Sidebar Subtitle States
  const [selectedUserSubtitle, setSelectedUserSubtitle] = useState<'devotees' | 'dharma_karthas'>('devotees');
  const [selectedCategorySubtitle, setSelectedCategorySubtitle] = useState<'devotional_services' | 'subcategories' | 'temples' | 'poojas' | 'events'>('devotional_services');
  const [selectedVidhanamSubtitle, setSelectedVidhanamSubtitle] = useState<'gods' | 'slokas' | 'astothrams' | 'stotras'>('gods');
  const [selectedMusicSubtitle, setSelectedMusicSubtitle] = useState<'bhajans' | 'slogans' | 'aarti'>('bhajans');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Sync CMS Editor fields when active tab or selected key changes
  useEffect(() => {
    if (cmsPages.length > 0) {
      const page = cmsPages.find(p => p.key === selectedCmsKey);
      if (page) {
        setCmsEditTitle(page.description || page.key);
        setCmsEditContent(page.value || '');
      }
    }
  }, [selectedCmsKey, cmsPages]);

  const handleSaveCmsPage = async () => {
    if (!selectedCmsKey) return;
    setIsSavingCms(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/cms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: selectedCmsKey,
          description: cmsEditTitle,
          value: cmsEditContent
        })
      });
      if (res.ok) {
        setNotification(`CMS Page "${cmsEditTitle || selectedCmsKey}" saved successfully.`);
        loadCms();
      } else {
        alert('Failed to save CMS Page');
      }
    } catch {
      alert('Error connecting to API server');
    } finally {
      setIsSavingCms(false);
    }
  };
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [editingLangId, setEditingLangId] = useState<number | null>(null);
  const [langCode, setLangCode] = useState('');
  const [langName, setLangName] = useState('');
  const [langNativeName, setLangNativeName] = useState('');
  const [isTranslatingNative, setIsTranslatingNative] = useState(false);

  // Devotional Content Modal State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentSlug, setContentSlug] = useState('');
  const [contentCategoryId, setContentCategoryId] = useState('1');
  const [contentSacredText, setContentSacredText] = useState('');
  const [contentMeaning, setContentMeaning] = useState('');
  const [contentIsPublished, setContentIsPublished] = useState(true);

  // Festival Modal & Detail State (Create, Edit, Delete, View All, View By ID)
  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);
  const [editingFestivalId, setEditingFestivalId] = useState<number | null>(null);
  const [festivalName, setFestivalName] = useState('');
  const [festivalSlug, setFestivalSlug] = useState('');
  const [festivalDate, setFestivalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [festivalNote, setFestivalNote] = useState('');
  const [festivalIsPublished, setFestivalIsPublished] = useState(true);
  const [isSavingFestival, setIsSavingFestival] = useState(false);
  const [selectedViewFestival, setSelectedViewFestival] = useState<FestivalItem | any | null>(null);
  const [isViewFestivalModalOpen, setIsViewFestivalModalOpen] = useState(false);
  const [festivalSearch, setFestivalSearch] = useState('');
  const [festivalYear, setFestivalYear] = useState<string>('2026');
  const [livePanchangam, setLivePanchangam] = useState<any>(null);
  const [panchangamCity, setPanchangamCity] = useState('Hyderabad');
  // Dynamic Vedic Panchangam Directory State (CRUD)
  const [panchangamYear, setPanchangamYear] = useState<number>(new Date().getFullYear());
  const [panchangamMonth, setPanchangamMonth] = useState<number>(new Date().getMonth() + 1);
  const [panchangamEntries, setPanchangamEntries] = useState<any[]>([]);
  const [isLoadingPanchangamEntries, setIsLoadingPanchangamEntries] = useState(false);
  const [isPanchangamModalOpen, setIsPanchangamModalOpen] = useState(false);
  const [isViewPanchangamModalOpen, setIsViewPanchangamModalOpen] = useState(false);
  const [selectedViewPanchangam, setSelectedViewPanchangam] = useState<any | null>(null);
  const [panchangamForm, setPanchangamForm] = useState<any>({
    id: null,
    date: new Date().toISOString().slice(0, 10),
    city: 'Hyderabad',
    vaaram: '',
    samvatsaram: 'Sri Krodhi Naama Samvatsara',
    paksham: 'Shukla Paksha',
    tithi: 'Prathama',
    tithiEndTime: '04:15 PM',
    nakshatram: 'Ashwini',
    nakshatraEndTime: '06:30 PM',
    sunrise: '06:15 AM',
    sunset: '06:05 PM',
    rahuKalam: '04:30 PM - 06:00 PM',
    yamagandam: '01:30 PM - 03:00 PM',
    gulikaKalam: '09:00 AM - 10:30 AM',
    abhijit: '11:45 AM - 12:35 PM',
    varjyam: '08:30 AM - 10:05 AM',
    ayanaRitu: 'Uttarayanam / Shishira Ritu',
    notes: ''
  });
  const [isSavingPanchangam, setIsSavingPanchangam] = useState(false);

  // Google Cloud Translation Advanced v3 State
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [translationTargetModule, setTranslationTargetModule] = useState('categories');
  const [translationRecordId, setTranslationRecordId] = useState<number | string | undefined>(undefined);
  const [translationFields, setTranslationFields] = useState<FieldDefinition[]>([]);
  const [translationApplyHandler, setTranslationApplyHandler] = useState<((fields: { [key: string]: string }, targetLang: string) => void) | undefined>(undefined);

  const openTranslationModal = (
    moduleName: string,
    recordId: number | string | undefined,
    fieldsToTranslate: FieldDefinition[],
    onApply?: (fields: { [key: string]: string }, targetLang: string) => void
  ) => {
    setTranslationTargetModule(moduleName);
    setTranslationRecordId(recordId);
    setTranslationFields(fieldsToTranslate);
    setTranslationApplyHandler(() => onApply);
    setTranslationModalOpen(true);
  };

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Auth Handler: Strictly Dynamic Verification via Live API / Database (Zero Fallback / Mock Data)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoginEmailTouched(true);
    setLoginPasswordTouched(true);

    const email = loginEmail.trim();
    if (!email) {
      setAuthError('Please enter your administrative email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('Please enter a valid administrative email format (e.g. admin@ayyappa.org).');
      return;
    }
    if (!loginPassword) {
      setAuthError('Please enter your master authentication password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Invalid administrative credentials. Access denied.');
        setIsLoggingIn(false);
        return;
      }
      if (!data.token || !data.admin) {
        setAuthError('Authentication response invalid. Please contact server administrator.');
        setIsLoggingIn(false);
        return;
      }
      if (rememberAdmin && typeof window !== 'undefined') {
        localStorage.setItem('ayyappa_admin_saved_email', email);
      }
      setIsAuthenticated(true);
      setAdminProfile(data.admin);
      setEditFullName(data.admin.fullName);
      setActiveTab('dashboard');
      setExpandedSection(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayyappa_admin_token', data.token);
        localStorage.setItem('ayyappa_admin_profile', JSON.stringify(data.admin));
      }
      setNotification(`Welcome back, ${data.admin.fullName}!`);
    } catch {
      setAuthError('Unable to connect to authentication server. Please check your network connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ayyappa_admin_token') : null;
      if (token) {
        await fetch(`${API_BASE_URL}/admin/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ token })
        });
      }
    } catch (e) {
      console.warn('Backend session logout notice:', e);
    }
    setIsAuthenticated(false);
    setLoginPassword('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayyappa_admin_token');
      localStorage.removeItem('ayyappa_admin_profile');
    }
    setNotification('You have logged out securely. Backend session revoked.');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminProfile.id, fullName: editFullName })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminProfile(prev => ({ ...prev, fullName: editFullName }));
        setNotification('Admin Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch {
      alert('Error updating profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: adminProfile.id,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNotification('Password successfully rotated with Bcrypt 12 rounds encryption!');
      } else {
        alert(data.message || 'Password update failed');
      }
    } catch {
      alert('Error changing password');
    }
  };

  // 1. Load Categories
  const loadCategories = useCallback((pageNum = 1, search = '', lang = 'en', audio = '', currentLimit = 15) => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/categories`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', String(currentLimit));
    url.searchParams.set('lang', lang);
    if (search) url.searchParams.set('search', search);
    if (audio) url.searchParams.set('isAudio', audio);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setCategories(res.data);
          setTotalPages(res.meta?.totalPages || 1);
          setTotalCount(res.meta?.totalRecords || 0);
          setPage(res.meta?.page || 1);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // 2. Load Subcategories & Category Lookup
  const loadParentLookup = useCallback((lang = 'en') => {
    fetch(`${API_BASE_URL}/admin/categories?limit=100&lang=${lang}`)
      .then(res => res.json())
      .then(res => {
        const list = (res && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          parentLookupListRef.current = list;
          setParentLookupList(list);
        }
      })
      .catch(() => {
        fetch(`${API_BASE_URL}/admin/categories/parents?lang=${lang}`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              parentLookupListRef.current = data;
              setParentLookupList(data);
            }
          })
          .catch(() => { });
      });
  }, []);

  const loadAllSubcategoriesList = useCallback((lang = 'en') => {
    fetch(`${API_BASE_URL}/admin/subcategories?limit=500&lang=${lang}`)
      .then(res => res.json())
      .then(res => {
        const list = res && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          setAllSubcategoriesList(list);
        }
      })
      .catch(() => { });
  }, []);

  const resolveParentId = useCallback((keyOrId: string): string => {
    if (!keyOrId || keyOrId === 'all') return 'all';
    const list = parentLookupListRef.current.length > 0 ? parentLookupListRef.current : parentLookupList;
    const needle = String(keyOrId).toLowerCase().trim();
    if (needle === 'pooja' || needle === 'pooja-vidhanam' || needle === 'poojalu-vrathaalu' || needle === '113') {
      const pMatch = list.find(p => String(p.id) === '113') || list.filter(p => p.slug === 'pooja-vidhanam' || p.slug === 'poojalu-vrathaalu' || p.slug === 'pooja').sort((a, b) => (b.subcategoriesCount || 0) - (a.subcategoriesCount || 0))[0];
      if (pMatch) return String(pMatch.id);
      return '113';
    }
    if (needle === 'stotras' || needle === 'divine-stotras' || needle === '4' || needle === '114') {
      const candidates = list.filter(p =>
        String(p.id) === '114' || String(p.id) === '4' ||
        p.slug === 'stotras' || p.slug === 'divine-stotras' || p.slug === 'stotramulu' || p.slug === 'slogans-of-sri-ayyappa-swami'
      );
      const activeMatch = candidates.find(p => (p.subcategoriesCount || 0) > 0) || candidates[0];
      if (activeMatch) return String(activeMatch.id);
      return '114';
    }
    if (needle === 'slokas' || needle === 'daily-slokas' || needle === '115') {
      const slMatch = list.find(p => String(p.id) === '115') || list.filter(p => p.slug === 'slokas' || p.slug === 'daily-slokas' || p.slug?.includes('shlok')).sort((a, b) => (b.subcategoriesCount || 0) - (a.subcategoriesCount || 0))[0];
      if (slMatch) return String(slMatch.id);
      return '115';
    }
    if (needle === 'songs' || needle === 'bhajans' || needle === '116') {
      const bMatch = list.find(p => String(p.id) === '116') || list.filter(p => p.slug === 'songs' || p.slug === 'bhajans' || p.slug === 'bhajana-keerthanalu').sort((a, b) => (b.subcategoriesCount || 0) - (a.subcategoriesCount || 0))[0];
      if (bMatch) return String(bMatch.id);
      return '116';
    }
    const exact = list.find(p => String(p.id) === needle || p.slug?.toLowerCase() === needle);
    if (exact) return String(exact.id);
    const found = list.find(p =>
      p.slug?.toLowerCase().startsWith(needle) ||
      p.title?.toLowerCase() === needle
    );
    return found ? String(found.id) : keyOrId;
  }, [parentLookupList]);

  const loadSubcategories = useCallback((pageNum = 1, search = '', lang = selectedLang, parentId = selectedParentCategoryFilter, currentLimit = subLimit) => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/subcategories`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', String(currentLimit));
    url.searchParams.set('lang', lang);
    if (search && search.trim() !== '') url.searchParams.set('search', search.trim());
    if (parentId && parentId !== 'all') {
      const resolved = resolveParentId(parentId);
      url.searchParams.set('parentId', resolved);
    }

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res && res.data) {
          setSubcategories(res.data);
          if (res.meta) {
            setSubTotalCount(res.meta.totalRecords ?? res.data.length);
            setSubTotalPages(res.meta.totalPages ?? 1);
            setSubPage(res.meta.page ?? pageNum);
          } else {
            setSubTotalCount(res.data.length);
            setSubTotalPages(1);
            setSubPage(pageNum);
          }
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [selectedLang, selectedParentCategoryFilter, resolveParentId, subLimit]);

  // 3. Load Devotional Content (Subcategory Types)
  const loadDevotionalContent = useCallback((pageNum = 1, search = '', catId = selectedSubcategoryForTypes, currentLimit = typeLimit) => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/content`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', String(currentLimit));
    if (search && search.trim() !== '') url.searchParams.set('search', search.trim());
    if (catId && catId !== 'all') url.searchParams.set('categoryId', String(catId));

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res && res.data) {
          setDevotionalContent(res.data);
          if (res.meta) {
            setTypeTotalCount(res.meta.totalRecords ?? res.data.length);
            setTypeTotalPages(res.meta.totalPages ?? 1);
            setTypePage(res.meta.page ?? pageNum);
          } else {
            setTypeTotalCount(res.data.length);
            setTypeTotalPages(1);
            setTypePage(pageNum);
          }
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [selectedSubcategoryForTypes, typeLimit]);

  // 4. Load Festivals & Live Panchangam
  const loadPanchangam = useCallback((city = 'Hyderabad', lang = 'en') => {
    fetch(`${API_BASE_URL}/panchangam/day?city=${city}&lang=${lang}`)
      .then(res => res.json())
      .then(data => setLivePanchangam(data))
      .catch(() => { });
  }, []);

  const loadPanchangamEntries = useCallback((city = panchangamCity, year = panchangamYear, month = panchangamMonth, lang = selectedLang) => {
    setIsLoadingPanchangamEntries(true);
    const url = new URL(`${API_BASE_URL}/admin/panchangam/entries`);
    url.searchParams.set('city', city);
    url.searchParams.set('year', String(year));
    url.searchParams.set('month', String(month));
    url.searchParams.set('lang', lang);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setPanchangamEntries(res.data);
      })
      .catch((err) => console.error('Failed to load panchangam entries:', err))
      .finally(() => setIsLoadingPanchangamEntries(false));
  }, [panchangamCity, panchangamYear, panchangamMonth, selectedLang]);

  const handleOpenCreatePanchangamOverride = (day?: any) => {
    if (day) {
      setPanchangamForm({
        id: day.id || null,
        date: day.date,
        city: day.city || panchangamCity,
        vaaram: day.vaaram || '',
        samvatsaram: day.samvatsaram || 'Sri Krodhi Naama Samvatsara',
        paksham: day.paksham || 'Shukla Paksha',
        tithi: day.tithi || 'Prathama',
        tithiEndTime: day.tithiEndTime || '04:15 PM',
        nakshatram: day.nakshatram || 'Ashwini',
        nakshatraEndTime: day.nakshatraEndTime || '06:30 PM',
        sunrise: day.sunrise || '06:15 AM',
        sunset: day.sunset || '06:05 PM',
        rahuKalam: day.rahuKalam || '04:30 PM - 06:00 PM',
        yamagandam: day.yamagandam || '01:30 PM - 03:00 PM',
        gulikaKalam: day.gulikaKalam || '09:00 AM - 10:30 AM',
        abhijit: day.abhijit || '11:45 AM - 12:35 PM',
        varjyam: day.varjyam || '08:30 AM - 10:05 AM',
        ayanaRitu: day.ayanaRitu || 'Uttarayanam / Shishira Ritu',
        notes: day.notes || ''
      });
    } else {
      const now = new Date();
      setPanchangamForm({
        id: null,
        date: now.toISOString().slice(0, 10),
        city: panchangamCity,
        vaaram: '',
        samvatsaram: 'Sri Krodhi Naama Samvatsara',
        paksham: 'Shukla Paksha',
        tithi: 'Prathama',
        tithiEndTime: '04:15 PM',
        nakshatram: 'Ashwini',
        nakshatraEndTime: '06:30 PM',
        sunrise: '06:15 AM',
        sunset: '06:05 PM',
        rahuKalam: '04:30 PM - 06:00 PM',
        yamagandam: '01:30 PM - 03:00 PM',
        gulikaKalam: '09:00 AM - 10:30 AM',
        abhijit: '11:45 AM - 12:35 PM',
        varjyam: '08:30 AM - 10:05 AM',
        ayanaRitu: 'Uttarayanam / Shishira Ritu',
        notes: ''
      });
    }
    setIsPanchangamModalOpen(true);
  };

  const handleSavePanchangamOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPanchangam(true);
    try {
      const method = panchangamForm.id ? 'PUT' : 'POST';
      const endpoint = panchangamForm.id
        ? `${API_BASE_URL}/admin/panchangam/entries/${panchangamForm.id}`
        : `${API_BASE_URL}/admin/panchangam/entries`;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...panchangamForm,
          lang: selectedLang,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`Panchangam entry for ${panchangamForm.date} successfully saved!`);
        setIsPanchangamModalOpen(false);
        loadPanchangamEntries(panchangamCity, panchangamYear, panchangamMonth, selectedLang);
        loadPanchangam(panchangamCity, selectedLang);
      } else {
        alert(data.message || 'Error saving Panchangam entry');
      }
    } catch (err: any) {
      alert(err.message || 'Network error saving Panchangam entry');
    } finally {
      setIsSavingPanchangam(false);
    }
  };

  const handleDeletePanchangamOverride = async (id: number, dateStr: string) => {
    if (!confirm(`Are you sure you want to delete the custom override for ${dateStr}? This day will revert back to automatic astronomical calculation.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/panchangam/entries/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`Override for ${dateStr} deleted. Reverted to astronomical calculation.`);
        loadPanchangamEntries(panchangamCity, panchangamYear, panchangamMonth, selectedLang);
        loadPanchangam(panchangamCity, selectedLang);
      } else {
        alert(data.message || 'Error deleting override');
      }
    } catch (err: any) {
      alert(err.message || 'Network error deleting override');
    }
  };

  const loadFestivals = useCallback((pageNum = 1, search = '', year = '2026') => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/panchangam/festivals`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '100');
    if (search && search.trim() !== '') url.searchParams.set('search', search.trim());
    if (year && year !== 'all') url.searchParams.set('year', year);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setFestivals(res.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Load Devotional Services directly from /categories/services API
  const loadCategoryServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/services`);
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        setDevotionalServices(json.data);
      }
    } catch (e) {
      console.error('Failed to load category services:', e);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // 5. Load Audio
  const loadAudio = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/media/audio`)
      .then(res => res.json())
      .then(res => { if (res.data) setAudioList(res.data); })
      .catch(() => { });
  }, []);

  // 6. Load CMS
  const loadCms = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/cms`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCmsPages(data); })
      .catch(() => { });
  }, []);

  const loadStats = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/dashboard/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => { });
  }, []);

  const loadLanguages = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/languages`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLanguages(data); })
      .catch(() => { });
  }, []);

  const loadUsers = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/users?status=all`)
      .then(res => res.json())
      .then(res => { if (res.data) setUsers(res.data); })
      .catch(() => { });
  }, []);

  const loadDeletionRequests = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/users/deletion-requests`)
      .then(res => res.json())
      .then(res => { if (res.data) setDeletionRequests(res.data); })
      .catch(() => { });
  }, []);

  const loadSoftDeletedUsers = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/users/soft-deleted`)
      .then(res => res.json())
      .then(res => { if (res.data) setSoftDeletedUsers(res.data); })
      .catch(() => { });
  }, []);

  const loadDharmaKarthas = useCallback((searchQuery?: string) => {
    setDkLoading(true);
    const q = searchQuery !== undefined ? searchQuery : dkSearch;
    const url = `${API_BASE_URL}/admin/dharma-karthas${q ? `?search=${encodeURIComponent(q)}` : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setDharmaKarthas(res.data);
        }
      })
      .catch(() => { })
      .finally(() => setDkLoading(false));
  }, [dkSearch]);

  const handleSoftDeleteUser = async (userId: number, userName?: string) => {
    if (!window.confirm(`Are you sure you want to SOFT-DELETE devotee account #${userId} (${userName || 'User'})? They will be deactivated and unable to log in.`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/soft-delete`, { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message || 'User soft-deleted successfully.');
        setTimeout(() => setNotification(null), 4000);
        loadUsers();
        loadDeletionRequests();
        loadSoftDeletedUsers();
      } else {
        alert(json.message || 'Failed to soft delete user');
      }
    } catch {
      alert('Error executing soft delete');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestoreUser = async (userId: number, userName?: string) => {
    if (!window.confirm(`Are you sure you want to RESTORE devotee account #${userId} (${userName || 'User'})? Their account will be reactivated.`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/restore`, { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message || 'User restored successfully.');
        setTimeout(() => setNotification(null), 4000);
        loadUsers();
        loadDeletionRequests();
        loadSoftDeletedUsers();
      } else {
        alert(json.message || 'Failed to restore user');
      }
    } catch {
      alert('Error executing restore');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDismissDeletionRequest = async (userId: number, userName?: string) => {
    if (!window.confirm(`Are you sure you want to DISMISS account deletion request for devotee #${userId} (${userName || 'User'})? The account will remain active in good standing.`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/dismiss-deletion-request`, { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message || 'Deletion request dismissed successfully.');
        setTimeout(() => setNotification(null), 4000);
        loadUsers();
        loadDeletionRequests();
        loadSoftDeletedUsers();
      } else {
        alert(json.message || 'Failed to dismiss deletion request');
      }
    } catch {
      alert('Error dismissing deletion request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePermanentDeleteUser = async (userId: number, userName?: string) => {
    if (!window.confirm(`⚠️ PERMANENT PURGE WARNING!\n\nAre you sure you want to PERMANENTLY delete devotee #${userId} (${userName || 'User'}) from the database?\n\nThis will permanently purge their profile, bookmarks, and preferences. THIS ACTION CANNOT BE UNDONE!`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/permanent-delete`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message || 'User permanently purged from database.');
        setTimeout(() => setNotification(null), 4000);
        loadUsers();
        loadDeletionRequests();
        loadSoftDeletedUsers();
      } else {
        alert(json.message || 'Failed to permanently delete user');
      }
    } catch {
      alert('Error executing permanent deletion');
    } finally {
      setActionLoadingId(null);
    }
  };

  const loadAuditLogs = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/audit-logs`)
      .then(res => res.json())
      .then(res => { if (res.data) setAuditLogs(res.data); })
      .catch(() => { });
  }, []);

  const loadTicker = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/settings/ticker`)
      .then(res => res.json())
      .then(data => { if (data.ticker) setTickerText(data.ticker); })
      .catch(() => { });
  }, []);

  const loadAppLogo = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/settings/general`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          if (res.data.app_logo) {
            setAppLogoUrl(res.data.app_logo);
            setCustomLogoInput(res.data.app_logo);
            try {
              localStorage.setItem('ayyappa_admin_logo', res.data.app_logo);
            } catch { }
          }
          if (res.data.app_title) setAppTitle(res.data.app_title);
          if (res.data.app_tagline) setAppTagline(res.data.app_tagline);
          if (res.data.app_description) setAppDescription(res.data.app_description);
          if (res.data.theme_primary_color) setThemePrimaryColor(res.data.theme_primary_color);
          if (res.data.theme_secondary_color) setThemeSecondaryColor(res.data.theme_secondary_color);
          if (res.data.theme_background_color) setThemeBackgroundColor(res.data.theme_background_color);
          if (res.data.theme_surface_color) setThemeSurfaceColor(res.data.theme_surface_color);
          if (res.data.app_play_store_url) setPlayStoreUrl(res.data.app_play_store_url);
          if (res.data.app_app_store_url) setAppStoreUrl(res.data.app_app_store_url);
          if (res.data.social_youtube_url) setSocialYoutubeUrl(res.data.social_youtube_url);
          if (res.data.social_telegram_url) setSocialTelegramUrl(res.data.social_telegram_url);
          if (res.data.social_instagram_url) setSocialInstagramUrl(res.data.social_instagram_url);
          if (res.data.social_facebook_url) setSocialFacebookUrl(res.data.social_facebook_url);
          if (res.data.social_whatsapp_url) setSocialWhatsappUrl(res.data.social_whatsapp_url);
        }
      })
      .catch(() => { });
  }, []);

  const loadTickets = useCallback((status = selectedTicketFilter, search = searchQuery) => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/tickets`);
    if (status && status !== 'ALL') url.searchParams.set('status', status);
    if (search) url.searchParams.set('search', search);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setTickets(res.data);
          if (res.stats) setTicketStats(res.stats);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [selectedTicketFilter, searchQuery]);

  const loadTempleTypes = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/temple-types`)
      .then(res => res.json())
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setTempleTypes(res.data);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const loadAdminTemples = useCallback(async (customQuery?: string, customDeity?: string, customState?: string) => {
    setIsTemplesLoading(true);
    const q = customQuery !== undefined ? customQuery : templeSearch;
    const deity = customDeity !== undefined ? customDeity : templeDeityFilter;
    const state = customState !== undefined ? customState : templeStateFilter;

    let url = `${API_BASE_URL}/admin/temples?includeInactive=true&lang=${selectedLang}`;
    if (q && q.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
    if (deity && deity !== 'ALL') url += `&deity=${encodeURIComponent(deity)}`;
    if (state && state !== 'ALL') url += `&state=${encodeURIComponent(state)}`;

    try {
      let res = await fetch(url);
      if (!res.ok) {
        url = `${API_BASE_URL}/temples?includeInactive=true&lang=${selectedLang}`;
        if (q && q.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
        if (deity && deity !== 'ALL') url += `&deity=${encodeURIComponent(deity)}`;
        if (state && state !== 'ALL') url += `&state=${encodeURIComponent(state)}`;
        res = await fetch(url);
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setTemplesList(data.data);
      } else if (Array.isArray(data)) {
        setTemplesList(data);
      }
    } catch (err) {
      console.error('Failed to load temples:', err);
    } finally {
      setIsTemplesLoading(false);
    }
  }, [selectedLang, templeSearch, templeDeityFilter, templeStateFilter]);

  const handleOpenCreateTemple = () => {
    setEditingTemple(null);
    setTempleForm({
      name: '',
      templeType: 'MAIN_TEMPLE',
      alternateName: '',
      slug: '',
      deityId: 'Lord Ayyappa',
      deityName: 'Lord Ayyappa',
      city: '',
      district: '',
      state: 'Andhra Pradesh',
      country: 'India',
      address: '',
      pincode: '',
      shortDescription: '',
      about: '',
      history: '',
      speciality: '',
      officePhone: '',
      officialEmail: '',
      officialWebsite: '',
      morningTimings: '03:00 AM – 01:00 PM',
      eveningTimings: '03:00 PM – 11:00 PM',
      phone: '',
      email: '',
      website: '',
      heroImageUrl: '',
      thumbnailUrl: '',
      hasLiveDarshan: false,
      liveStreamId: '',
      isActive: true,
      teName: '',
      knName: '',
      taName: '',
      mlName: '',
      hiName: '',
    });
    setIsTempleModalOpen(true);
  };

  const handleOpenEditTemple = (temple: any) => {
    setEditingTemple(temple);
    const timings = temple.timings || {};
    const contact = temple.contact || {};
    const localNames = temple.localNames || {};
    const specialityStr = Array.isArray(temple.speciality)
      ? temple.speciality.join('\n')
      : (typeof temple.speciality === 'string' ? temple.speciality : '');

    setTempleForm({
      name: temple.originalName || temple.name || '',
      templeType: temple.templeType || temple.type || 'MAIN_TEMPLE',
      alternateName: temple.alternateName || '',
      slug: temple.id || temple.slug || '',
      deityId: temple.deityName || temple.deityId || 'Lord Ayyappa',
      deityName: temple.deityName || temple.deityId || 'Lord Ayyappa',
      city: temple.city || '',
      district: temple.district || '',
      state: temple.state || 'Andhra Pradesh',
      country: temple.country || 'India',
      address: temple.address || '',
      pincode: temple.pincode || '',
      shortDescription: temple.shortDescription || '',
      about: temple.about || '',
      history: temple.history || '',
      speciality: specialityStr,
      officePhone: contact.phone || temple.officePhone || '',
      officialEmail: contact.email || temple.officialEmail || '',
      officialWebsite: contact.website || temple.officialWebsite || '',
      morningTimings: timings.morning || '03:00 AM – 01:00 PM',
      eveningTimings: timings.evening || '03:00 PM – 11:00 PM',
      phone: contact.phone || temple.officePhone || '',
      email: contact.email || temple.officialEmail || '',
      website: contact.website || temple.officialWebsite || '',
      heroImageUrl: temple.heroImageUrl || temple.thumbnailUrl || '',
      thumbnailUrl: temple.thumbnailUrl || temple.heroImageUrl || '',
      hasLiveDarshan: Boolean(temple.hasLiveDarshan),
      liveStreamId: temple.liveStreamId || '',
      isActive: temple.isActive !== false,
      teName: localNames.te || '',
      knName: localNames.kn || '',
      taName: localNames.ta || '',
      mlName: localNames.ml || '',
      hiName: localNames.hi || '',
    });
    setIsTempleModalOpen(true);
  };

  const handleOpenViewTemple = (temple: any) => {
    setViewingTempleItem(temple);
    setIsViewingTemple(true);
  };

  const handleSaveTemple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templeForm.name.trim()) {
      showToast(
        'Mandir Name Required',
        'Without adding a temple name and identity, you cannot configure About, Speciality, Time & Aarti, Media, Festivals, or Contact.',
        'warning'
      );
      return;
    }
    setIsSavingTemple(true);
    try {
      const payload = {
        name: templeForm.name,
        templeType: templeForm.templeType,
        alternateName: templeForm.alternateName,
        slug: templeForm.slug || undefined,
        deityId: templeForm.deityId,
        deityName: templeForm.deityName,
        primaryDeity: templeForm.deityName,
        city: templeForm.city,
        district: templeForm.district,
        state: templeForm.state,
        country: templeForm.country || 'India',
        address: templeForm.address,
        pincode: templeForm.pincode,
        shortDescription: templeForm.shortDescription,
        about: templeForm.about,
        history: templeForm.history,
        speciality: templeForm.speciality ? templeForm.speciality.split('\n').filter(Boolean) : [],
        officePhone: templeForm.officePhone || templeForm.phone,
        officialEmail: templeForm.officialEmail || templeForm.email,
        officialWebsite: templeForm.officialWebsite || templeForm.website,
        timings: {
          morning: templeForm.morningTimings,
          evening: templeForm.eveningTimings,
        },
        contact: {
          phone: templeForm.officePhone || templeForm.phone,
          email: templeForm.officialEmail || templeForm.email,
          website: templeForm.officialWebsite || templeForm.website,
        },
        heroImageUrl: templeForm.heroImageUrl,
        thumbnailUrl: templeForm.thumbnailUrl || templeForm.heroImageUrl,
        hasLiveDarshan: templeForm.hasLiveDarshan,
        liveStreamId: templeForm.liveStreamId,
        isActive: templeForm.isActive,
        localNames: {
          te: templeForm.teName,
          kn: templeForm.knName,
          ta: templeForm.taName,
          ml: templeForm.mlName,
          hi: templeForm.hiName,
        },
      };

      const url = editingTemple
        ? `${API_BASE_URL}/admin/temples/${editingTemple.id}`
        : `${API_BASE_URL}/admin/temples`;
      const method = editingTemple ? 'PUT' : 'POST';

      let res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const fallbackUrl = editingTemple
          ? `${API_BASE_URL}/temples/${editingTemple.id}`
          : `${API_BASE_URL}/temples`;
        res = await fetch(fallbackUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      if (resData.success) {
        showToast(
          'Temple Saved',
          editingTemple ? 'Sacred Temple updated successfully!' : 'Sacred Temple created successfully!',
          'success'
        );
        setIsTempleModalOpen(false);
        setEditingTemple(null);
        loadAdminTemples();
      } else {
        showToast('Save Failed', resData.message || 'Failed to save sacred temple', 'error');
      }
    } catch (err) {
      console.error('Error saving sacred temple:', err);
      showToast('Network Error', 'Error communicating with server.', 'error');
    } finally {
      setIsSavingTemple(false);
    }
  };

  const handleDeleteTemple = async (idOrSlug: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the sacred temple "${name}"?`)) return;
    try {
      let res = await fetch(`${API_BASE_URL}/admin/temples/${idOrSlug}`, { method: 'DELETE' });
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/temples/${idOrSlug}`, { method: 'DELETE' });
      }
      const data = await res.json();
      if (data.success) {
        setNotification(`Temple "${name}" deleted.`);
        setTimeout(() => setNotification(null), 3000);
        loadAdminTemples();
      } else {
        alert(data.message || 'Failed to delete temple');
      }
    } catch (err) {
      console.error('Error deleting temple:', err);
    }
  };

  const handleToggleTempleActive = async (temple: any) => {
    const newStatus = !temple.isActive;
    setTemplesList(prev => prev.map(t => (t.id === temple.id || t.slug === temple.id) ? { ...t, isActive: newStatus } : t));
    try {
      await fetch(`${API_BASE_URL}/admin/temples/${temple.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
    } catch (err) {
      console.error('Error toggling temple status:', err);
      loadAdminTemples();
    }
  };

  const handleTempleImageUpload = (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setTempleForm(prev => ({
          ...prev,
          heroImageUrl: base64Data,
          thumbnailUrl: base64Data,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Initial global stats and lookups on authentication mount (runs once)
  useEffect(() => {
    if (!isAuthenticated) return;
    loadStats();
    loadParentLookup(selectedLang);
    loadAllSubcategoriesList(selectedLang);
    loadLanguages();
    loadAppLogo();
    loadTicker();
    loadAdminTemples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 2. Active Tab specific data loading (runs only when activeTab or primary filters change)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'categories') {
      loadCategories(page, searchQuery, selectedLang, isAudioFilter);
    } else if (activeTab === 'subcategories') {
      loadSubcategories(1, searchQuery, selectedLang, selectedParentCategoryFilter);
    } else if (activeTab === 'devotional_services') {
      loadCategoryServices();
    } else if (activeTab === 'temples' || (activeTab === 'categories' && selectedCategorySubtitle === 'temples')) {
      loadAdminTemples();
    } else if (activeTab === 'content') {
      loadDevotionalContent(1, searchQuery);
      loadAllSubcategoriesList(selectedLang);
      loadParentLookup(selectedLang);
    } else if (activeTab === 'festivals') {
      loadFestivals(1, searchQuery);
    } else if (activeTab === 'panchangam') {
      loadPanchangam(panchangamCity, selectedLang);
      loadPanchangamEntries(panchangamCity, panchangamYear, panchangamMonth, selectedLang);
    } else if (activeTab === 'audio') {
      loadAudio();
    } else if (activeTab === 'cms') {
      loadCms();
    } else if (activeTab === 'users' || activeTab === 'soft_deleted_users') {
      loadUsers();
      loadDeletionRequests();
      loadSoftDeletedUsers();
      loadDharmaKarthas();
    } else if (activeTab === 'gods') {
      loadDeities();
    } else if (activeTab === 'temple_types') {
      loadTempleTypes();
    } else if (activeTab === 'tickets') {
      loadTickets(selectedTicketFilter, searchQuery);
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab, page, selectedLang, isAudioFilter]);

  // Debounced server search
  useEffect(() => {
    if (isAuthenticated) {
      const handler = setTimeout(() => {
        if (activeTab === 'categories') loadCategories(1, searchQuery, selectedLang, isAudioFilter);
        if (activeTab === 'subcategories') loadSubcategories(1, searchQuery, selectedLang);
        if (activeTab === 'content') loadDevotionalContent(1, searchQuery);
        if (activeTab === 'festivals') loadFestivals(1, searchQuery);
      }, 350);
      return () => clearTimeout(handler);
    }
  }, [searchQuery, selectedLang, isAudioFilter, activeTab, loadCategories, loadSubcategories, loadDevotionalContent, loadFestivals, isAuthenticated]);

  // CATEGORY ACTIONS (Full Page Mode)
  const handleOpenCreateCategory = () => {
    setEditingId(null);
    setFormTitle('');
    setFormSlug('');
    setFormIsAudio(false);
    setFormDescription('');
    setIsModalOpen(true);
    setPageMode('EDIT_CATEGORY');
  };

  const handleOpenEditCategory = (item: CategoryItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormIsAudio(item.isAudio);
    setFormDescription(item.description);
    setIsModalOpen(true);
    setPageMode('EDIT_CATEGORY');
  };

  const handleOpenViewCategory = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}?lang=${selectedLang}`);
      const data = await res.json();
      const payload = data.data || data;
      if (payload) {
        setViewDetail(payload);
        setIsViewModalOpen(true);
        setPageMode('VIEW_CATEGORY');
      }
    } catch {
      alert('Error loading category view details');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Language Switcher for View Detailed Page (Queries DB via API for specific language)
  const handleViewDetailChangeLang = async (langCode: string) => {
    if (!viewDetail) return;
    setSelectedLang(langCode);
    setLoading(true);
    try {
      if (viewDetail.isType) {
        // Devotional Subcategory Type / Sacred Verse
        const res = await fetch(`${API_BASE_URL}/admin/content/${viewDetail.id}?lang=${langCode}`);
        const json = await res.json();
        if (json && json.data) {
          const item = json.data;
          let parentDetails: any = null;
          if (item.categoryId) {
            try {
              const pRes = await fetch(`${API_BASE_URL}/admin/subcategories/${item.categoryId}?lang=${langCode}`);
              const pJson = await pRes.json();
              if (pJson && pJson.data) parentDetails = pJson.data;
            } catch { }
          }
          setViewDetail((prev: any) => ({
            ...prev,
            title: item.title,
            sacredText: item.sacredText || '',
            meaning: item.meaning || '',
            description: parentDetails?.description || item.meaning || '',
            parentTitle: parentDetails?.title || prev?.parentTitle,
            hasExactTranslation: item.hasExactTranslation,
            requestedLang: langCode,
            contents: parentDetails?.contents && parentDetails.contents.length > 0
              ? parentDetails.contents
              : [{
                id: item.id,
                title: item.title,
                slug: item.slug,
                sacredText: item.sacredText,
                meaning: item.meaning
              }]
          }));
        }
      } else if (viewDetail.isSubcategory || viewDetail.parentId) {
        // Devotional Subcategory
        const res = await fetch(`${API_BASE_URL}/admin/subcategories/${viewDetail.id}?lang=${langCode}`);
        const json = await res.json();
        if (json && json.data) {
          setViewDetail(json.data);
        }
      } else {
        // Master Category
        const res = await fetch(`${API_BASE_URL}/categories/${viewDetail.id}?lang=${langCode}`);
        const json = await res.json();
        const data = json.data || json;
        if (data) {
          setViewDetail(data);
        }
      }
    } catch (e) {
      console.error('Error fetching view details for language:', e);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Language Switcher for Edit Subcategory (Fetches translation from DB via API; no mock fallback)
  const handleEditSubcategoryChangeLang = async (langCode: string) => {
    setSelectedLang(langCode);
    if (!editingSubId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subcategories/${editingSubId}?lang=${langCode}`);
      const json = await res.json();
      if (json && json.data) {
        const data = json.data;
        setViewDetail(data);
        const exact = data.translations?.find((t: any) => t.code === langCode);
        if (exact) {
          setSubFormTitle(exact.title || '');
          setSubFormDescription(exact.description || '');
        } else if (data.hasExactTranslation) {
          setSubFormTitle(data.exactTitle || data.title || '');
          setSubFormDescription(data.exactDescription || data.description || '');
        } else {
          // No translation in DB for this language yet: leave blank so user can enter fresh translation
          setSubFormTitle('');
          setSubFormDescription('');
        }
      }
    } catch (e) {
      console.error('Error fetching subcategory translation for language:', e);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Language Switcher for Edit Subcategory Type (Fetches translation from DB via API; no mock fallback)
  const handleEditTypeChangeLang = async (langCode: string) => {
    setSelectedLang(langCode);
    if (!editingTypeId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/${editingTypeId}?lang=${langCode}`);
      const json = await res.json();
      if (json && json.data) {
        const data = json.data;
        if (data.hasExactTranslation) {
          setTypeFormTitle(data.exactTitle || data.title || '');
          setTypeFormSacredText(data.exactSacredText || data.sacredText || '');
          setTypeFormMeaning(data.exactMeaning || data.meaning || '');
        } else if (langCode === 'te' || langCode === 'en') {
          setTypeFormTitle(data.title || '');
          setTypeFormSacredText(data.sacredText || '');
          setTypeFormMeaning(data.meaning || '');
        } else {
          // No translation in DB for this language yet: clear fields for new entry
          setTypeFormTitle('');
          setTypeFormSacredText('');
          setTypeFormMeaning('');
        }
      }
    } catch (e) {
      console.error('Error fetching type translation for language:', e);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Language Switcher for Edit Category (Fetches translation from DB via API; no mock fallback)
  const handleEditCategoryChangeLang = async (langCode: string) => {
    setSelectedLang(langCode);
    if (!editingId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${editingId}?lang=${langCode}`);
      const json = await res.json();
      const data = json.data || json;
      if (data) {
        const exact = data.translations?.find((t: any) => (t.language?.code || t.code) === langCode);
        if (exact) {
          setFormTitle(exact.title || '');
          setFormDescription(exact.description || '');
        } else {
          setFormTitle('');
          setFormDescription('');
        }
      }
    } catch (e) {
      console.error('Error fetching category translation for language:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewSubcategory = async (id: string) => {
    setLoading(true);
    setActiveViewTypeTab('all');
    try {
      // 1. First fetch dynamically from DB via subcategories detail API
      const res = await fetch(`${API_BASE_URL}/admin/subcategories/${id}?lang=${selectedLang}`);
      const json = await res.json();
      if (json && json.data) {
        setViewDetail(json.data);
        setIsViewModalOpen(true);
        setPageMode('VIEW_CATEGORY');
        return;
      }
      // 2. Secondary fallback
      const resCat = await fetch(`${API_BASE_URL}/categories/${id}?lang=${selectedLang}`);
      const dataCat = await resCat.json();
      const payloadCat = dataCat.data || dataCat;
      if (payloadCat) {
        setViewDetail(payloadCat);
        setIsViewModalOpen(true);
        setPageMode('VIEW_CATEGORY');
      }
    } catch {
      alert('Error loading subcategory view details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewContent = async (id: number | string) => {
    setLoading(true);
    setActiveViewTypeTab('all');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/${id}`);
      const json = await res.json();
      if (json && json.data) {
        const item = json.data;

        // Fetch parent subcategory details if available so complete lyrics/composition and sister steps are loaded
        let parentDetails: any = null;
        if (item.categoryId) {
          try {
            const parentRes = await fetch(`${API_BASE_URL}/admin/subcategories/${item.categoryId}?lang=${selectedLang}`);
            const parentJson = await parentRes.json();
            if (parentJson && parentJson.data) {
              parentDetails = parentJson.data;
            }
          } catch { }
        }

        setViewDetail({
          id: String(item.id),
          slug: item.slug,
          title: item.title,
          description: parentDetails?.description || item.meaning || '',
          sacredText: item.sacredText || '',
          meaning: item.meaning || '',
          isType: true,
          isPublished: item.isPublished,
          displayOrder: item.displayOrder,
          parentId: item.categoryId,
          parentTitle: parentDetails?.title || item.category?.title || item.category?.translations?.[0]?.title || `Subcategory #${item.categoryId}`,
          parentSlug: parentDetails?.slug || item.category?.slug,
          imageUrl: parentDetails?.imageUrl || item.category?.imageUrl || '',
          translations: parentDetails?.translations || item.category?.translations || [],
          contents: parentDetails?.contents && parentDetails.contents.length > 0
            ? parentDetails.contents
            : (item.sacredText ? [{
              id: item.id,
              title: item.title,
              slug: item.slug,
              sacredText: item.sacredText,
              meaning: item.meaning
            }] : [])
        });
        setIsViewModalOpen(true);
        setPageMode('VIEW_CATEGORY');
      }
    } catch {
      alert('Error loading content view details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a category title');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim() || `category-${Date.now()}`,
      isAudio: formIsAudio,
      description: formDescription.trim(),
      lang: selectedLang
    };

    try {
      if (editingId) {
        await fetch(`${API_BASE_URL}/admin/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Category "${formTitle}" updated successfully.`);
      } else {
        await fetch(`${API_BASE_URL}/admin/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Category "${formTitle}" created successfully.`);
      }
      loadCategories(page, searchQuery, selectedLang, isAudioFilter);
      loadStats();
    } catch (e: any) {
      alert('Error saving category: ' + e.message);
    }

    setIsModalOpen(false);
    setPageMode('LIST');
  };

  const handleDeleteCategory = async (id: string, title: string) => {
    if (confirm(`Archive / Delete "${title}" (#${id})?\n\nThis will safely deactivate the category in MySQL without destroying sacred verses or offline audio.`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) {
          alert(`PROTECTED ACTION BLOCKED:\n\n${json.message}`);
          return;
        }
        setNotification(json.message);
        loadCategories(page, searchQuery, selectedLang, isAudioFilter);
        loadSubcategories(1, '', selectedLang);
        loadStats();
      } catch (e: any) {
        alert('Archival error: ' + e.message);
      }
    }
  };

  // SUBCATEGORY & CHAPTER ACTIONS (Full Page Mode)
  const handleOpenCreateSubcategory = (preselectedParentId?: any) => {
    setEditingSubId(null);
    setSubFormTitle('');
    setSubFormSlug('');
    let targetParent = preselectedParentId;
    if (!targetParent && selectedParentCategoryFilter !== 'all') {
      const match = parentLookupList.find(p => p.slug === selectedParentCategoryFilter || String(p.id) === String(selectedParentCategoryFilter));
      if (match) targetParent = match.id;
    }
    if (!targetParent && parentLookupList.length > 0) {
      targetParent = parentLookupList[0].id;
    }
    setSubFormParentId(targetParent || '');
    setSubFormDescription('');
    setSubFormImageUrl('');
    setIsSubModalOpen(true);
    setPageMode('EDIT_SUBCATEGORY');
  };

  const handleOpenEditSubcategory = async (item: SubcategoryItem) => {
    setEditingSubId(item.id);
    setSubFormTitle(item.title);
    setSubFormSlug(item.slug);
    setSubFormParentId(item.parentId);
    setSubFormDescription(item.description || '');
    setSubFormImageUrl(item.imageUrl || '');
    setIsSubModalOpen(true);
    setPageMode('EDIT_SUBCATEGORY');

    // Dynamically fetch translation for currently active language directly from DB
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subcategories/${item.id}?lang=${selectedLang}`);
      const json = await res.json();
      if (json && json.data) {
        const d = json.data;
        setViewDetail(d);
        setActiveViewTypeTab('all');
        const exact = d.translations?.find((t: any) => t.code === selectedLang);
        if (exact) {
          setSubFormTitle(exact.title || '');
          setSubFormDescription(exact.description || '');
        } else if (d.hasExactTranslation) {
          setSubFormTitle(d.exactTitle || d.title || '');
          setSubFormDescription(d.exactDescription || d.description || '');
        }
      }
    } catch { }
  };

  const handleSubcategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) setSubFormImageUrl(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickSubcategoryImageUpload = (subId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) return;
      try {
        const res = await fetch(`${API_BASE_URL}/admin/subcategories/${subId}/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data })
        });
        if (res.ok) {
          setNotification('Subcategory artwork updated successfully!');
          loadSubcategories(1, searchQuery, selectedLang, selectedParentCategoryFilter);
        } else {
          const errData = await res.json();
          alert('Upload failed: ' + (errData.message || res.statusText));
        }
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickServiceArtworkUpload = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) return;
      try {
        const res = await fetch(`${API_BASE_URL}/admin/category-services/${serviceId}/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data })
        });
        if (res.ok) {
          setNotification('Devotional service artwork updated successfully!');
          loadCategoryServices();
        } else {
          const errData = await res.json();
          alert('Upload failed: ' + (errData.message || res.statusText));
        }
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSubcategory = async () => {
    if (!subFormTitle.trim()) {
      alert('Please enter a subcategory / chapter title');
      return;
    }
    if (!subFormParentId) {
      alert('Please select a Parent Category or Vratham');
      return;
    }

    const payload = {
      title: subFormTitle.trim(),
      slug: subFormSlug.trim() || `sub-${Date.now()}`,
      parentId: Number(subFormParentId),
      isAudio: false,
      description: subFormDescription.trim(),
      lang: selectedLang,
      imageUrl: subFormImageUrl.trim()
    };

    try {
      if (editingSubId) {
        await fetch(`${API_BASE_URL}/admin/categories/${editingSubId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Subcategory "${subFormTitle}" updated successfully.`);
      } else {
        await fetch(`${API_BASE_URL}/admin/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Subcategory "${subFormTitle}" created successfully.`);
      }
      loadSubcategories(1, '', selectedLang);
      loadParentLookup(selectedLang);
      loadStats();
    } catch (e: any) {
      alert('Error saving subcategory: ' + e.message);
    }
    setIsSubModalOpen(false);
    setPageMode('LIST');
  };

  const handleDeleteSubcategory = async (id: string, title: string) => {
    if (confirm(`Archive subcategory "${title}" (#${id})?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) {
          alert(`ACTION BLOCKED: ${json.message}`);
          return;
        }
        setNotification(json.message);
        loadSubcategories(1, '', selectedLang);
        loadStats();
      } catch (e: any) {
        alert('Archival error: ' + e.message);
      }
    }
  };

  const handleBatchDeleteCategories = async () => {
    if (selectedCategoryIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCategoryIds.length} selected categories?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCategoryIds })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Categories Deleted', `${data.count || selectedCategoryIds.length} categories safely deleted.`, 'success');
        setSelectedCategoryIds([]);
        loadCategories(page, searchQuery, selectedLang, isAudioFilter);
      } else {
        alert(data.message || 'Failed to delete selected categories');
      }
    } catch {
      alert('Error deleting categories');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDeleteSubcategories = async () => {
    if (selectedSubcategoryIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedSubcategoryIds.length} selected subcategories?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubcategoryIds })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Subcategories Deleted', `${data.count || selectedSubcategoryIds.length} subcategories safely deleted.`, 'success');
        setSelectedSubcategoryIds([]);
        loadSubcategories(subPage, searchQuery, selectedLang, selectedParentCategoryFilter, subLimit);
      } else {
        alert(data.message || 'Failed to delete selected subcategories');
      }
    } catch {
      alert('Error deleting subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDeleteTypes = async () => {
    if (selectedTypeIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedTypeIds.length} selected subcategory types?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTypeIds })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Subcategory Types Deleted', `${data.count || selectedTypeIds.length} types deleted.`, 'success');
        setSelectedTypeIds([]);
        loadDevotionalContent(typePage, searchQuery, selectedSubcategoryForTypes, typeLimit);
      } else {
        alert(data.message || 'Failed to delete selected types');
      }
    } catch {
      alert('Error deleting types');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateType = (preselectedCatId?: any) => {
    setEditingTypeId(null);
    setTypeFormTitle('');
    setTypeFormSlug('');
    loadAllSubcategoriesList(selectedLang);
    loadParentLookup(selectedLang);

    const subPool = allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories;
    let targetCat = preselectedCatId;
    if (!targetCat && selectedSubcategoryForTypes !== 'all') {
      targetCat = Number(selectedSubcategoryForTypes);
    }
    if (!targetCat && subPool.length > 0) {
      targetCat = Number(subPool[0].id);
    }
    setTypeFormCategoryId(targetCat || '');
    if (targetCat) {
      const match = subPool.find(s => Number(s.id) === Number(targetCat));
      if (match && match.parentId) {
        setTypeFormParentId(match.parentId);
      } else {
        setTypeFormParentId('all');
      }
    } else {
      setTypeFormParentId('all');
    }
    setTypeFormSacredText('');
    setTypeFormMeaning('');
    setTypeFormDisplayOrder(devotionalContent.length + 1);
    setTypeFormIsPublished(true);
    setPageMode('EDIT_TYPE');
  };

  const handleOpenEditType = async (item: DevotionalContentItem) => {
    setEditingTypeId(item.id);
    setTypeFormTitle(item.title);
    setTypeFormSlug(item.slug);
    setTypeFormCategoryId(item.categoryId);
    loadAllSubcategoriesList(selectedLang);
    loadParentLookup(selectedLang);

    const subPool = allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories;
    const match = subPool.find(s => Number(s.id) === Number(item.categoryId));
    if (match && match.parentId) {
      setTypeFormParentId(match.parentId);
    } else {
      setTypeFormParentId('all');
    }

    setTypeFormSacredText(item.sacredText || '');
    setTypeFormMeaning(item.meaning || '');
    setTypeFormDisplayOrder(item.displayOrder || 1);
    setTypeFormIsPublished(item.isPublished !== false);
    setPageMode('EDIT_TYPE');

    // Dynamically fetch translation for currently active language directly from DB
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/${item.id}?lang=${selectedLang}`);
      const json = await res.json();
      if (json && json.data) {
        const d = json.data;
        if (d.hasExactTranslation) {
          setTypeFormTitle(d.exactTitle || d.title || '');
          setTypeFormSacredText(d.exactSacredText || d.sacredText || '');
          setTypeFormMeaning(d.exactMeaning || d.meaning || '');
        }
      }
    } catch { }

    if (item.categoryId) {
      try {
        const resSub = await fetch(`${API_BASE_URL}/admin/subcategories/${item.categoryId}?lang=${selectedLang}`);
        const jsonSub = await resSub.json();
        if (jsonSub && jsonSub.data) {
          setViewDetail(jsonSub.data);
          const idx = jsonSub.data.contents?.findIndex((c: any) => Number(c.id) === Number(item.id));
          setActiveViewTypeTab(idx !== -1 && idx !== undefined ? idx : 'all');
        }
      } catch { }
    }
  };

  const handleSaveType = async () => {
    if (!typeFormTitle.trim()) {
      alert('Please enter a type title');
      return;
    }
    if (!typeFormCategoryId) {
      alert('Please select a Subcategory');
      return;
    }

    const payload = {
      categoryId: Number(typeFormCategoryId),
      title: typeFormTitle.trim(),
      slug: typeFormSlug.trim() || `type-${Date.now()}`,
      sacredText: typeFormSacredText.trim(),
      meaning: typeFormMeaning.trim(),
      displayOrder: Number(typeFormDisplayOrder) || 1,
      isPublished: typeFormIsPublished,
      lang: selectedLang
    };

    setLoading(true);
    try {
      if (editingTypeId) {
        await fetch(`${API_BASE_URL}/admin/content/${editingTypeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Type Updated', `"${typeFormTitle}" updated successfully.`);
      } else {
        await fetch(`${API_BASE_URL}/admin/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Type Created', `"${typeFormTitle}" created successfully.`);
      }
      setPageMode('LIST');
      loadDevotionalContent(1, searchQuery, String(typeFormCategoryId), typeLimit);
    } catch (e: any) {
      alert('Error saving type: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async (id: number, title: string) => {
    if (!confirm(`Delete subcategory type "${title}" (#${id})?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Type Deleted', `"${title}" was removed.`);
        loadDevotionalContent(typePage, searchQuery, selectedSubcategoryForTypes, typeLimit);
      } else {
        alert('Failed to delete type');
      }
    } catch {
      alert('Error deleting type');
    } finally {
      setLoading(false);
    }
  };

  // LANGUAGE ACTIONS
  const handleOpenCreateLanguage = () => {
    setEditingLangId(null);
    setLangCode('');
    setLangName('');
    setLangNativeName('');
    setIsLangModalOpen(true);
  };

  const handleOpenEditLanguage = (l: LanguageItem) => {
    setEditingLangId(l.id);
    setLangCode(l.code);
    setLangName(l.name);
    setLangNativeName(l.nativeName || '');
    setIsLangModalOpen(true);
  };

  const NATIVE_LANGUAGE_MAP: Record<string, { native: string; code?: string }> = {
    te: { native: 'తెలుగు', code: 'te' },
    kn: { native: 'ಕನ್ನಡ', code: 'kn' },
    ta: { native: 'தமிழ்', code: 'ta' },
    ml: { native: 'മലയാളം', code: 'ml' },
    hi: { native: 'हिन्दी', code: 'hi' },
    sa: { native: 'संस्कृतम्', code: 'sa' },
    mr: { native: 'मराठी', code: 'mr' },
    gu: { native: 'ગુજરાતી', code: 'gu' },
    bn: { native: 'বাংলা', code: 'bn' },
    pa: { native: 'ਪੰਜਾਬੀ', code: 'pa' },
    or: { native: 'ଓଡ଼ିଆ', code: 'or' },
    as: { native: 'অসমীয়া', code: 'as' },
    ur: { native: 'اردو', code: 'ur' },
    en: { native: 'English', code: 'en' },
    es: { native: 'Español', code: 'es' },
    fr: { native: 'Français', code: 'fr' },
    de: { native: 'Deutsch', code: 'de' },
    telugu: { native: 'తెలుగు', code: 'te' },
    kannada: { native: 'ಕನ್ನಡ', code: 'kn' },
    tamil: { native: 'தமிழ்', code: 'ta' },
    malayalam: { native: 'മലയാളം', code: 'ml' },
    hindi: { native: 'हिन्दी', code: 'hi' },
    sanskrit: { native: 'संस्कृतम्', code: 'sa' },
    marathi: { native: 'मराठी', code: 'mr' },
    gujarati: { native: 'ગુજરાતી', code: 'gu' },
    bengali: { native: 'বাংলা', code: 'bn' },
    punjabi: { native: 'ਪੰਜਾਬੀ', code: 'pa' },
    odia: { native: 'ଓଡ଼ିଆ', code: 'or' },
    oriya: { native: 'ଓଡ଼ିଆ', code: 'or' },
    assamese: { native: 'অসমীয়া', code: 'as' },
    urdu: { native: 'اردو', code: 'ur' },
    english: { native: 'English', code: 'en' },
    spanish: { native: 'Español', code: 'es' },
    french: { native: 'Français', code: 'fr' },
    german: { native: 'Deutsch', code: 'de' },
  };

  const handleAutoTranslateNativeName = async () => {
    const rawName = langName.trim();
    const rawCode = langCode.trim().toLowerCase();
    const query = (rawName || rawCode).toLowerCase();

    if (!query) {
      alert('Please enter a Language Name or ISO Code first to auto-translate.');
      return;
    }

    setIsTranslatingNative(true);
    try {
      // 1. Direct authoritative match by name or code
      if (NATIVE_LANGUAGE_MAP[query]) {
        const item = NATIVE_LANGUAGE_MAP[query];
        setLangNativeName(item.native);
        if (!langCode.trim() && item.code) {
          setLangCode(item.code);
        }
        setNotification(`Auto-translated native script to "${item.native}".`);
        setIsTranslatingNative(false);
        return;
      }

      if (rawCode && NATIVE_LANGUAGE_MAP[rawCode]) {
        const item = NATIVE_LANGUAGE_MAP[rawCode];
        setLangNativeName(item.native);
        setNotification(`Auto-translated native script to "${item.native}".`);
        setIsTranslatingNative(false);
        return;
      }

      // 2. Query backend translation API
      const targetLang = rawCode || 'te';
      const res = await fetch(`${API_BASE_URL}/admin/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: 'en',
          targetLangs: [targetLang],
          fields: { name: rawName || rawCode }
        })
      });
      const data = await res.json();
      if (data?.results?.[targetLang]?.name) {
        const nativeResult = data.results[targetLang].name;
        setLangNativeName(nativeResult);
        setNotification(`Auto-translated native script to "${nativeResult}".`);
      } else {
        // Fallback: translate using Google endpoint
        const fallbackRes = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(rawName || rawCode)}`
        ).then(r => r.json()).catch(() => null);

        if (fallbackRes && fallbackRes[0]?.[0]?.[0]) {
          const nativeText = fallbackRes[0][0][0];
          setLangNativeName(nativeText);
          setNotification(`Auto-translated native script to "${nativeText}".`);
        } else {
          alert(`Could not automatically translate "${rawName}". Please enter the native script manually.`);
        }
      }
    } catch {
      try {
        const targetLang = rawCode || 'te';
        const fallbackRes = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(rawName || rawCode)}`
        ).then(r => r.json()).catch(() => null);

        if (fallbackRes && fallbackRes[0]?.[0]?.[0]) {
          const nativeText = fallbackRes[0][0][0];
          setLangNativeName(nativeText);
          setNotification(`Auto-translated native script to "${nativeText}".`);
        } else {
          alert('Could not auto-translate. Please enter the native script manually.');
        }
      } catch {
        alert('Translation service temporarily unavailable. Please enter the native script manually.');
      }
    } finally {
      setIsTranslatingNative(false);
    }
  };

  const handleSaveLanguage = async () => {
    if (!langName.trim() || !langCode.trim()) {
      alert('Please fill out all required language fields (Name, ISO Code)');
      return;
    }

    try {
      if (editingLangId) {
        await fetch(`${API_BASE_URL}/admin/languages/${editingLangId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: langName.trim(),
            code: langCode.toLowerCase().trim(),
            nativeName: langNativeName.trim()
          })
        });
        setNotification(`Language "${langName}" updated successfully.`);
      } else {
        const res = await fetch(`${API_BASE_URL}/admin/languages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: langCode.toLowerCase().trim(),
            name: langName.trim(),
            nativeName: langNativeName.trim()
          })
        });
        const json = await res.json();
        if (!res.ok) {
          alert(json.message || 'Error creating language');
          return;
        }
        setNotification(`Language "${langName}" created successfully.`);
      }
      loadLanguages();
      loadStats();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setIsLangModalOpen(false);
  };

  const handleDeleteLanguage = async (id: number, name: string) => {
    if (confirm(`Delete language "${name}" (#${id}) from database?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/languages/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) {
          alert(`PROTECTED ACTION BLOCKED:\n\n${json.message}`);
          return;
        }
        setNotification(json.message);
        loadLanguages();
        loadStats();
      } catch (e: any) {
        alert('Delete error: ' + e.message);
      }
    }
  };

  // =========================================================
  // DEVOTIONAL SERVICES ACTIONS (Create, Edit, Delete, View By ID)
  // =========================================================
  const handleOpenCreateService = () => {
    setEditingCategoryService({
      serviceId: '',
      title: '',
      sub: '',
      icon: 'Sparkles',
      url: '/',
      artwork: '',
      displayOrder: (devotionalServices.length + 1),
      isActive: true
    });
    setIsServiceEditModalOpen(true);
  };

  const handleOpenEditService = (service: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCategoryService({ ...service });
    setIsServiceEditModalOpen(true);
  };

  const handleOpenViewService = async (service: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedViewService(service);
    setIsViewServiceModalOpen(true);
    const targetId = service.id || service.serviceId;
    if (targetId) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/category-services/${targetId}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setSelectedViewService(json.data);
          }
        }
      } catch (err) {
        console.warn('View service by id lookup:', err);
      }
    }
  };

  const handleServiceArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data && editingCategoryService) {
        setEditingCategoryService({ ...editingCategoryService, artwork: base64Data });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategoryService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryService?.title?.trim()) {
      alert('Service Title is required.');
      return;
    }
    setIsSavingCategoryService(true);
    try {
      const isExisting = devotionalServices.some(s => (s.id === editingCategoryService.id || s.serviceId === editingCategoryService.serviceId));
      const targetId = editingCategoryService.id || editingCategoryService.serviceId;
      const url = isExisting
        ? `${API_BASE_URL}/admin/category-services/${targetId}`
        : `${API_BASE_URL}/admin/category-services`;
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategoryService),
      });

      if (res.ok) {
        setNotification(isExisting ? `Devotional service "${editingCategoryService.title}" updated successfully.` : `Devotional service "${editingCategoryService.title}" created successfully.`);
        setTimeout(() => setNotification(null), 3500);
        setIsServiceEditModalOpen(false);
        setEditingCategoryService(null);
        loadCategoryServices();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || 'Failed to save devotional service.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error saving devotional service.');
    } finally {
      setIsSavingCategoryService(false);
    }
  };

  const handleDeleteCategoryService = async (service: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = service.id || service.serviceId;
    if (!window.confirm(`Are you sure you want to permanently delete devotional service "${service.title}"?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/category-services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification(`Devotional service "${service.title}" deleted successfully.`);
        setTimeout(() => setNotification(null), 3500);
        if (isViewServiceModalOpen && (selectedViewService?.id === id || selectedViewService?.serviceId === id)) {
          setIsViewServiceModalOpen(false);
          setSelectedViewService(null);
        }
        loadCategoryServices();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || 'Failed to delete devotional service.');
      }
    } catch {
      alert('Failed to delete devotional service.');
    } finally {
      setLoading(false);
    }
  };

  // DEVOTIONAL CONTENT ACTIONS
  const handleOpenCreateContent = () => {
    setEditingContentId(null);
    setContentTitle('');
    setContentSlug('');
    setContentSacredText('');
    setContentMeaning('');
    setContentIsPublished(true);
    setIsContentModalOpen(true);
  };

  const handleOpenEditContent = (item: DevotionalContentItem) => {
    setEditingContentId(item.id);
    setContentTitle(item.title || '');
    setContentSlug(item.slug || '');
    setContentCategoryId(String(item.categoryId || 1));
    setContentSacredText(item.sacredText || '');
    setContentMeaning(item.meaning || '');
    setContentIsPublished(item.isPublished ?? true);
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async () => {
    if (!contentTitle.trim()) {
      alert('Please enter a content title');
      return;
    }
    try {
      if (editingContentId) {
        await fetch(`${API_BASE_URL}/admin/content/${editingContentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: Number(contentCategoryId),
            title: contentTitle.trim(),
            sacredText: contentSacredText,
            meaning: contentMeaning,
            isPublished: contentIsPublished
          })
        });
        setNotification(`Content "${contentTitle}" updated successfully.`);
      } else {
        await fetch(`${API_BASE_URL}/admin/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: Number(contentCategoryId),
            title: contentTitle.trim(),
            slug: contentSlug.trim() || `verse-${Date.now()}`,
            sacredText: contentSacredText,
            meaning: contentMeaning,
            isPublished: contentIsPublished
          })
        });
        setNotification(`Content "${contentTitle}" created successfully.`);
      }
      loadDevotionalContent();
      setIsContentModalOpen(false);
    } catch {
      alert('Error saving content');
    }
  };

  const handleDeleteContent = async (id: number, title: string) => {
    if (confirm(`Delete "${title}" (#${id})?`)) {
      await fetch(`${API_BASE_URL}/admin/content/${id}`, { method: 'DELETE' });
      setNotification(`Content "${title}" deleted successfully.`);
      loadDevotionalContent();
    }
  };

  // FESTIVAL ACTIONS (Create, Edit, Delete, View By ID - Yearly Based)
  const handleOpenCreateFestival = () => {
    if (!templesList || templesList.length === 0) {
      showToast(
        'Mandir Registration Required',
        'Without adding a sacred temple, you cannot create festivals or events. Please create a temple first.',
        'warning'
      );
      return;
    }
    setEditingFestivalId(null);
    setFestivalName('');
    setFestivalSlug('');
    const defaultDate = festivalYear && festivalYear !== 'all' ? `${festivalYear}-01-14` : new Date().toISOString().split('T')[0];
    setFestivalDate(defaultDate);
    setFestivalNote('');
    setFestivalIsPublished(true);
    setIsFestivalModalOpen(true);
  };

  const handleOpenEditFestival = (festival: FestivalItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingFestivalId(festival.id);
    const langMatch = festival.translations?.find((t: any) => t.language?.code === selectedLang)
      || festival.translations?.find((t: any) => t.language?.code === 'en')
      || festival.translations?.find((t: any) => t.language?.code === 'te')
      || festival.translations?.[0];
    setFestivalName(langMatch?.name || festival.slug || '');
    setFestivalSlug(festival.slug || '');
    const dateVal = festival.festivalDate ? new Date(festival.festivalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setFestivalDate(dateVal);
    setFestivalNote(festival.sourceNote || langMatch?.description || '');
    setFestivalIsPublished(festival.isPublished ?? true);
    setIsFestivalModalOpen(true);
  };

  const handleOpenViewFestival = async (festival: FestivalItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedViewFestival(festival);
    setIsViewFestivalModalOpen(true);
    if (festival.id) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/panchangam/festivals/${festival.id}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) setSelectedViewFestival(json.data);
        }
      } catch (err) {
        console.warn('View festival by id error:', err);
      }
    }
  };

  const handleSaveFestival = async () => {
    if (!templesList || templesList.length === 0) {
      showToast('Mandir Registration Required', 'Without adding a temple, you cannot save festivals. Please create a temple first.', 'warning');
      return;
    }
    if (!festivalName.trim()) {
      showToast('Validation Error', 'Please enter a valid festival name.', 'error');
      return;
    }
    setIsSavingFestival(true);
    try {
      const url = editingFestivalId
        ? `${API_BASE_URL}/admin/panchangam/festivals/${editingFestivalId}`
        : `${API_BASE_URL}/admin/panchangam/festivals`;
      const method = editingFestivalId ? 'PUT' : 'POST';

      const payload = {
        name: festivalName.trim(),
        slug: festivalSlug.trim() || undefined,
        date: festivalDate,
        festivalDate: festivalDate,
        sourceNote: festivalNote.trim(),
        isPublished: festivalIsPublished,
        lang: selectedLang
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(
          'Festival Saved',
          editingFestivalId
            ? `Festival "${festivalName}" updated successfully.`
            : `Festival "${festivalName}" created successfully.`,
          'success'
        );
        setIsFestivalModalOpen(false);
        setEditingFestivalId(null);
        loadFestivals(1, festivalSearch, festivalYear);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('Error', err.message || 'Error saving festival', 'error');
      }
    } catch {
      showToast('Network Error', 'Network error communicating with festivals server.', 'error');
    } finally {
      setIsSavingFestival(false);
    }
  };

  const handleDeleteFestival = async (id: number, name?: string) => {
    if (window.confirm(`Are you sure you want to delete festival "${name || '#' + id}"?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/panchangam/festivals/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setNotification(`Festival deleted successfully.`);
          setTimeout(() => setNotification(null), 3500);
          if (isViewFestivalModalOpen && selectedViewFestival?.id === id) {
            setIsViewFestivalModalOpen(false);
            setSelectedViewFestival(null);
          }
          loadFestivals(1, festivalSearch, festivalYear);
        } else {
          alert('Failed to delete festival');
        }
      } catch {
        alert('Network error deleting festival');
      }
    }
  };

  // SETTINGS MANAGEMENT (Logo, Colors, Title, Description)
  const handleSaveBrandingSettings = async () => {
    setIsSavingSettings(true);
    try {
      const payload = {
        app_logo: customLogoInput || appLogoUrl,
        app_title: appTitle,
        app_tagline: appTagline,
        app_description: appDescription,
        theme_primary_color: themePrimaryColor,
        theme_secondary_color: themeSecondaryColor,
        theme_background_color: themeBackgroundColor,
        theme_surface_color: themeSurfaceColor,
        app_play_store_url: playStoreUrl,
        app_app_store_url: appStoreUrl,
        social_youtube_url: socialYoutubeUrl,
        social_telegram_url: socialTelegramUrl,
        social_instagram_url: socialInstagramUrl,
        social_facebook_url: socialFacebookUrl,
        social_whatsapp_url: socialWhatsappUrl
      };

      const res = await fetch(`${API_BASE_URL}/admin/settings/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setNotification('General platform settings updated successfully.');
        loadAppLogo();
        loadAuditLogs();
      } else {
        alert(data.message || 'Failed to update settings');
      }
    } catch {
      alert('Error saving settings to backend');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // TICKET MANAGEMENT ACTIONS
  const handleUpdateTicketStatus = async (ticketId: number, status: string, priority?: string) => {
    setIsUpdatingTicket(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminResponse: ticketReplyText.trim() || undefined,
          priority
        })
      });
      if (res.ok) {
        setNotification(`Ticket #${ticketId} status updated to ${status}!`);
        loadTickets(selectedTicketFilter);
        loadAuditLogs();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, status: status as any, admin_response: ticketReplyText.trim() || prev.admin_response } : null);
        }
      } else {
        alert('Failed to update ticket');
      }
    } catch {
      alert('Error communicating with ticket API');
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!window.confirm(`Permanently remove ticket #${ticketId}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotification(`Ticket #${ticketId} deleted.`);
        setIsTicketModalOpen(false);
        setSelectedTicket(null);
        loadTickets(selectedTicketFilter);
        loadAuditLogs();
      } else {
        alert('Failed to delete ticket');
      }
    } catch {
      alert('Error deleting ticket');
    }
  };

  // TEMPLE TYPES MANAGEMENT ACTIONS
  const handleOpenCreateTempleType = () => {
    setEditingTempleType(null);
    setTempleTypeForm({ id: '', name: '', description: '' });
    setIsTempleTypeModalOpen(true);
  };

  const handleOpenEditTempleType = (type: { id: string; name: string; description?: string }) => {
    setEditingTempleType(type);
    setTempleTypeForm({ id: type.id, name: type.name, description: type.description || '' });
    setIsTempleTypeModalOpen(true);
  };

  const handleSaveTempleType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templeTypeForm.name.trim()) {
      alert('Temple type name is required.');
      return;
    }
    setIsSavingTempleType(true);
    try {
      if (editingTempleType) {
        // Update
        const res = await fetch(`${API_BASE_URL}/admin/temple-types/${editingTempleType.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templeTypeForm.name, description: templeTypeForm.description })
        });
        const data = await res.json();
        if (data.success) {
          setNotification(`Temple Type "${templeTypeForm.name}" updated successfully.`);
          setIsTempleTypeModalOpen(false);
          loadTempleTypes();
        } else {
          alert(data.message || 'Failed to update temple type.');
        }
      } else {
        // Create
        const res = await fetch(`${API_BASE_URL}/admin/temple-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: templeTypeForm.id, name: templeTypeForm.name, description: templeTypeForm.description })
        });
        const data = await res.json();
        if (data.success) {
          setNotification(`New Temple Type "${templeTypeForm.name}" created successfully.`);
          setIsTempleTypeModalOpen(false);
          loadTempleTypes();
        } else {
          alert(data.message || 'Failed to create temple type.');
        }
      }
    } catch {
      alert('Error communicating with server.');
    } finally {
      setIsSavingTempleType(false);
    }
  };

  const handleDeleteTempleType = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete temple type "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/temple-types/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Temple Type "${name}" deleted.`);
        loadTempleTypes();
      } else {
        alert(data.message || 'Failed to delete temple type.');
      }
    } catch {
      alert('Error deleting temple type.');
    }
  };

  // APP LOGO MANAGEMENT ACTIONS
  const handleSaveAppLogo = async (newUrl?: string) => {
    const targetUrl = (newUrl || customLogoInput).trim();
    if (!targetUrl) {
      alert('Please enter or select a valid image URL');
      return;
    }
    setIsUpdatingLogo(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: targetUrl })
      });
      const data = await res.json();
      if (res.ok) {
        const savedUrl = data.logoUrl || targetUrl;
        setAppLogoUrl(savedUrl);
        setCustomLogoInput(savedUrl);
        try {
          localStorage.setItem('ayyappa_admin_logo', savedUrl);
        } catch { }
        setNotification('Platform logo updated successfully.');
        loadAuditLogs();
      } else {
        alert(data.message || 'Failed to update logo');
      }
    } catch {
      alert('Network error while saving logo');
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        handleSaveAppLogo(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  // TICKER ACTION
  const handleSaveTicker = async () => {
    try {
      await fetch(`${API_BASE_URL}/admin/settings/ticker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerText })
      });
      setNotification('Devotional announcement ticker updated successfully.');
      loadAuditLogs();
    } catch {
      alert('Failed to update ticker');
    }
  };

  // Show a seamless devotional spinner while verifying local session
  // This completely eliminates the 2-second login screen flash on page refresh!
  if (isAuthChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#071914',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '180px',
            height: '180px',
            maxWidth: '180px',
            maxHeight: '180px',
            borderRadius: '24px',
            border: '2px solid #D4AF37',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.3)',
            marginBottom: '24px',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <img
            src={resolveLogoDisplayUrl(appLogoUrl)}
            alt="Saranam Ayyappa Logo"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
            onError={(e: any) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<span style="font-size: 54px;">🕉️</span>';
              }
            }}
          />
        </div>
        <h2
          style={{
            color: '#FFB300',
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '1px',
            textAlign: 'center',
            margin: 0,
            fontFamily: 'serif'
          }}
        >
          Thathwamasi Saranam Ayyappa
        </h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim());
    const isPasswordValid = loginPassword.length > 0;
    const canSubmit = isEmailValid && isPasswordValid && !isLoggingIn;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020B07] via-[#051A13] to-[#020906] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
        {/* Ambient Top Glow Effect */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] sm:w-[750px] h-[320px] bg-gradient-to-b from-[#D4AF37]/20 via-[#10B981]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-32 right-1/4 w-[400px] h-[250px] bg-gradient-to-t from-[#D4AF37]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Top Header Bar */}
        <header className="w-full max-w-5xl flex items-center justify-between py-2 px-1 text-xs z-10">
          <div className="flex items-center gap-2">
            <span className="text-base">🪔</span>
            <span className="font-serif font-bold text-[#FFB300] tracking-widest text-[11px] sm:text-xs uppercase">
              Thathwamasi
            </span>
          </div>
        </header>

        {/* Main Center Card (Glassmorphism + Divine Gold Sanctum Style) */}
        <div className="w-full max-w-md sm:max-w-lg my-auto z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-b from-[#09261C] via-[#071F17] to-[#051711] rounded-3xl border-2 border-[#D4AF37]/60 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.18)] p-6 sm:p-10 space-y-6 relative overflow-hidden backdrop-blur-xl">

            {/* Top Sacred Gold Arch Filigree Motif */}
            <div className="flex justify-center -mt-2">
              <svg className="w-16 h-7 text-[#FFB300] opacity-85" viewBox="0 0 100 40" fill="currentColor">
                <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
              </svg>
            </div>

            {/* Logo Emblem & Brand Header */}
            <div className="text-center space-y-2.5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-[#D4AF37] bg-[#030F0A] flex items-center justify-center p-2 mx-auto shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.25)] relative overflow-hidden group">
                <img
                  src={resolveLogoDisplayUrl(appLogoUrl)}
                  alt="Saranam Ayyappa Official Emblem"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,179,0,0.3)] transition transform group-hover:scale-105 duration-300"
                  onError={(e: any) => {
                    if (!e.currentTarget.src.includes('saranam-ayyappa-official-emblem.jpg')) {
                      e.currentTarget.src = '/images/saranam-ayyappa-official-emblem.jpg';
                    }
                  }}
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#FDE68A] tracking-[0.25em] uppercase font-serif">
                  śrī hariharasutāya namaḥ
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF59D] via-[#FFB300] to-[#FFA000] tracking-wide uppercase mt-1">
                  Saranam Ayyappa
                </h1>
                <p className="text-xs text-emerald-300/80 font-medium tracking-wider mt-0.5">
                  Enterprise Sanctum Super Admin Console
                </p>
              </div>
            </div>

            {/* Error Banner with Dynamic Feedback */}
            {authError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/70 text-xs text-rose-200 flex items-start gap-2.5 shadow-lg shadow-rose-950/40 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold block text-rose-300">Authentication Failed</span>
                  <span>{authError}</span>
                </div>
              </div>
            )}

            {/* Authentication Form with Inline Validation & Responsive Touch-Targets */}
            <form onSubmit={handleLogin} className="space-y-4 pt-1" noValidate>

              {/* Admin Email Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-200 uppercase tracking-wider text-[11px]">
                    Admin Email Address
                  </label>
                  {loginEmailTouched && !isEmailValid && loginEmail.length > 0 && (
                    <span className="text-[10px] text-rose-400 font-medium">Invalid email format</span>
                  )}
                </div>
                <div
                  className={`relative flex items-center rounded-xl bg-[#030E09] border transition shadow-inner ${loginEmailTouched && !isEmailValid && loginEmail.length > 0
                      ? 'border-rose-500/80 ring-1 ring-rose-500/30'
                      : 'border-[#1B573D] focus-within:border-[#FFB300] focus-within:ring-2 focus-within:ring-[#FFB300]/25'
                    }`}
                >
                  <Mail className="w-4 h-4 text-[#FFB300] ml-3.5 flex-shrink-0 opacity-80" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    onBlur={() => setLoginEmailTouched(true)}
                    placeholder="e.g. admin@ayyappa.org"
                    required
                    autoComplete="username"
                    disabled={isLoggingIn}
                    className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-gray-100 placeholder-emerald-700/60 focus:outline-none font-medium disabled:opacity-50"
                  />
                  {loginEmail && isEmailValid && (
                    <CheckCircle className="w-4 h-4 text-emerald-400 mr-3.5 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Master Password Input with Show/Hide Toggle */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-200 uppercase tracking-wider text-[11px]">
                    Master Authentication Password
                  </label>
                  {loginPasswordTouched && !isPasswordValid && (
                    <span className="text-[10px] text-rose-400 font-medium">Password required</span>
                  )}
                </div>
                <div
                  className={`relative flex items-center rounded-xl bg-[#030E09] border transition shadow-inner ${loginPasswordTouched && !isPasswordValid
                      ? 'border-rose-500/80 ring-1 ring-rose-500/30'
                      : 'border-[#1B573D] focus-within:border-[#FFB300] focus-within:ring-2 focus-within:ring-[#FFB300]/25'
                    }`}
                >
                  <Lock className="w-4 h-4 text-[#FFB300] ml-3.5 flex-shrink-0 opacity-80" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    onBlur={() => setLoginPasswordTouched(true)}
                    placeholder="Enter master password..."
                    required
                    autoComplete="current-password"
                    disabled={isLoggingIn}
                    className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-gray-100 placeholder-emerald-700/60 focus:outline-none font-medium disabled:opacity-50 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(p => !p)}
                    tabIndex={-1}
                    className="p-1.5 mr-2 text-emerald-400/80 hover:text-[#FFB300] transition focus:outline-none"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1 text-xs text-emerald-300/80">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberAdmin}
                    onChange={(e) => setRememberAdmin(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#030E09] border-[#1B573D] text-[#FFB300] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#FFB300]"
                  />
                  <span className="text-[11px] font-medium text-gray-300">Remember on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-xl flex items-center justify-center gap-2 relative ${canSubmit
                    ? 'bg-gradient-to-r from-[#FFB300] via-[#FFA000] to-[#FF8F00] hover:from-[#FFA000] hover:to-[#FF6F00] text-[#071C14] shadow-amber-500/25 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-[#0E2F23] border border-[#1A4E38] text-gray-400 cursor-not-allowed opacity-75'
                  }`}
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#071C14]" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Bottom Devotional Footer */}
        <footer className="w-full max-w-5xl py-3 text-center text-[11px] text-gray-400 z-10 flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-[#16422F]/40 mt-4">
          <p className="text-gray-400 font-medium">
            © 2026 Saranam Ayyappa Devotional Trust. All Rights Reserved.
          </p>
        </footer>
      </div>
    );
  }

  // Top 6 Ordered Primary Menu with Subtitles
  const primarySidebarMenu = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        setActiveTab('dashboard');
        setExpandedSection(null);
      },
      isActive: activeTab === 'dashboard',
    },
    {
      key: 'cms',
      label: 'Website/App CMS',
      icon: FileText,
      onClick: () => {
        setActiveTab('cms');
        setExpandedSection(prev => prev === 'cms' ? null : 'cms');
      },
      isActive: activeTab === 'cms',
      isExpanded: expandedSection === 'cms',
      subtitles: [
        {
          key: 'about_us',
          label: 'About Us',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('about_us'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'about_us',
        },
        {
          key: 'terms_conditions',
          label: 'Terms & Conditions',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('terms_conditions'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'terms_conditions',
        },
        {
          key: 'privacy_policy',
          label: 'Privacy Policy',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('privacy_policy'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'privacy_policy',
        },
        {
          key: 'refund_policy',
          label: 'Refund Policy',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('refund_policy'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'refund_policy',
        },
        {
          key: 'sabarimala_guidelines',
          label: 'Sabarimala Guidelines',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('sabarimala_guidelines'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'sabarimala_guidelines',
        },
        {
          key: 'contact_us',
          label: 'Contact Us & Help Center',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('contact_us'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'contact_us',
        },
      ],
    },
    {
      key: 'users',
      label: 'User Management',
      icon: Users,
      onClick: () => {
        setActiveTab('users');
        setExpandedSection(prev => prev === 'users' ? null : 'users');
      },
      isActive: activeTab === 'users',
      isExpanded: expandedSection === 'users',
      subtitles: [
        {
          key: 'devotees',
          label: 'Devotees',
          onClick: () => {
            setActiveTab('users');
            setSelectedUserSubtitle('devotees');
            setUserSubTab('all');
          },
          isActive: activeTab === 'users' && selectedUserSubtitle === 'devotees',
        },
        {
          key: 'dharma_karthas',
          label: 'Dharma Karthas',
          onClick: () => {
            setActiveTab('users');
            setSelectedUserSubtitle('dharma_karthas');
            setUserSubTab('all');
            loadDharmaKarthas();
          },
          isActive: activeTab === 'users' && selectedUserSubtitle === 'dharma_karthas',
        },
      ],
    },
    {
      key: 'categories',
      label: 'Categories',
      icon: FolderTree,
      onClick: () => {
        setActiveTab('devotional_services');
        setSelectedCategorySubtitle('devotional_services');
        setExpandedSection(prev => prev === 'categories' ? null : 'categories');
        loadCategoryServices();
      },
      isActive: activeTab === 'categories' || activeTab === 'devotional_services' || activeTab === 'subcategories' || activeTab === 'temples',
      isExpanded: expandedSection === 'categories',
      subtitles: [
        {
          key: 'devotional_services',
          label: 'Devotional Services (9)',
          onClick: () => {
            setActiveTab('devotional_services');
            setSelectedCategorySubtitle('devotional_services');
            loadCategoryServices();
          },
          isActive: activeTab === 'devotional_services',
        },
        {
          key: 'subcategories',
          label: `Subcategories (${stats?.activeSubcategories ?? (subTotalCount || subcategories.length || 134)})`,
          onClick: () => {
            setActiveTab('subcategories');
            setSelectedCategorySubtitle('subcategories');
            setPageMode('LIST');
            loadSubcategories(1, '', selectedLang, 'all');
          },
          isActive: activeTab === 'subcategories',
        },
        {
          key: 'subcategory_types',
          label: `Subcategory Types (${stats?.publishedDevotionalItems ?? (typeTotalCount || devotionalContent.length || 44)})`,
          onClick: () => {
            setActiveTab('content');
            setSelectedCategorySubtitle('subcategories');
            setPageMode('LIST');
            loadDevotionalContent(1, '', selectedSubcategoryForTypes);
          },
          isActive: activeTab === 'content',
        },
        {
          key: 'temples',
          label: `Temples (${templesList.length || 7})`,
          onClick: () => {
            setActiveTab('temples');
            setSelectedCategorySubtitle('temples');
            loadAdminTemples();
          },
          isActive: activeTab === 'temples' || (activeTab === 'categories' && selectedCategorySubtitle === 'temples'),
        },
        {
          key: 'poojas',
          label: 'Poojas',
          onClick: () => {
            setActiveTab('categories');
            setSelectedCategorySubtitle('poojas');
            setSearchQuery('pooja');
            loadCategories(1, 'pooja', selectedLang);
          },
          isActive: activeTab === 'categories' && selectedCategorySubtitle === 'poojas',
        },
        {
          key: 'events',
          label: 'Events',
          onClick: () => {
            setActiveTab('categories');
            setSelectedCategorySubtitle('events');
            setSearchQuery('event');
            loadCategories(1, 'event', selectedLang);
          },
          isActive: activeTab === 'categories' && selectedCategorySubtitle === 'events',
        },
      ],
    },
    {
      key: 'vidhanam',
      label: 'Spiritual Management Vidhanam',
      icon: BookOpen,
      onClick: () => {
        setActiveTab('subcategories');
        setExpandedSection(prev => prev === 'vidhanam' ? null : 'vidhanam');
      },
      isActive: activeTab === 'subcategories' || activeTab === 'content' || activeTab === 'gods',
      isExpanded: expandedSection === 'vidhanam',
      subtitles: [
        {
          key: 'gods',
          label: `Gods / Goddesses (${deities.length})`,
          onClick: () => {
            setActiveTab('gods');
            setSelectedVidhanamSubtitle('gods');
            loadDeities();
          },
          isActive: activeTab === 'gods',
        },
        {
          key: 'slokas',
          label: 'Slokas',
          onClick: () => {
            setActiveTab('content');
            setSelectedVidhanamSubtitle('slokas');
            loadDevotionalContent(1, 'sloka');
          },
          isActive: activeTab === 'content' && selectedVidhanamSubtitle === 'slokas',
        },
        {
          key: 'astothrams',
          label: 'Astothrams',
          onClick: () => {
            setActiveTab('content');
            setSelectedVidhanamSubtitle('astothrams');
            loadDevotionalContent(1, 'astothram');
          },
          isActive: activeTab === 'content' && selectedVidhanamSubtitle === 'astothrams',
        },
        {
          key: 'stotras',
          label: 'Stotras',
          onClick: () => {
            setActiveTab('content');
            setSelectedVidhanamSubtitle('stotras');
            loadDevotionalContent(1, 'stotra');
          },
          isActive: activeTab === 'content' && selectedVidhanamSubtitle === 'stotras',
        },
      ],
    },
    {
      key: 'audio',
      label: 'Spiritual Music',
      icon: Music,
      onClick: () => {
        setActiveTab('audio');
        setExpandedSection(prev => prev === 'audio' ? null : 'audio');
      },
      isActive: activeTab === 'audio',
      isExpanded: expandedSection === 'audio',
      subtitles: [
        {
          key: 'bhajans',
          label: 'Bhajans',
          onClick: () => {
            setActiveTab('audio');
            setSelectedMusicSubtitle('bhajans');
          },
          isActive: activeTab === 'audio' && selectedMusicSubtitle === 'bhajans',
        },
        {
          key: 'slogans',
          label: 'Slogans',
          onClick: () => {
            setActiveTab('audio');
            setSelectedMusicSubtitle('slogans');
          },
          isActive: activeTab === 'audio' && selectedMusicSubtitle === 'slogans',
        },
        {
          key: 'aarti',
          label: 'Aarti Songs',
          onClick: () => {
            setActiveTab('audio');
            setSelectedMusicSubtitle('aarti');
          },
          isActive: activeTab === 'audio' && selectedMusicSubtitle === 'aarti',
        },
      ],
    },
    {
      key: 'temple_types',
      label: `Temple Types (${templeTypes.length})`,
      icon: Landmark,
      onClick: () => {
        setActiveTab('temple_types');
        setExpandedSection(null);
        loadTempleTypes();
      },
      isActive: activeTab === 'temple_types',
    },
    {
      key: 'tickets',
      label: `Tickets (${ticketStats.open ? `${ticketStats.open} new` : ticketStats.total})`,
      icon: LifeBuoy,
      onClick: () => {
        setActiveTab('tickets');
        setExpandedSection(null);
        loadTickets();
      },
      isActive: activeTab === 'tickets',
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        setActiveTab('settings');
        setExpandedSection(null);
      },
      isActive: activeTab === 'settings',
    },
  ];

  // System & Secondary Administrative Tools
  const secondarySidebarMenu = [
    { key: 'soft_deleted_users', label: `Soft Deleted Users (${softDeletedUsers.length})`, icon: UserX, onClick: () => setActiveTab('soft_deleted_users'), isActive: activeTab === 'soft_deleted_users' },
    { key: 'panchangam', label: 'Vedic Panchangam', icon: Compass, onClick: () => { setActiveTab('panchangam'); loadPanchangam(panchangamCity, selectedLang); loadPanchangamEntries(panchangamCity, panchangamYear, panchangamMonth, selectedLang); }, isActive: activeTab === 'panchangam' },
    { key: 'festivals', label: `Festivals (${stats?.activeFestivals ?? festivals.length})`, icon: Calendar, onClick: () => { setActiveTab('festivals'); loadFestivals(1, ''); }, isActive: activeTab === 'festivals' },
    { key: 'splash', label: 'Splash Screen', icon: ImageIcon, onClick: () => setActiveTab('splash'), isActive: activeTab === 'splash' },
    { key: 'languages', label: `Languages (${stats?.totalLanguages ?? languages.length} in DB)`, icon: Globe, onClick: () => setActiveTab('languages'), isActive: activeTab === 'languages' },
    { key: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: Database, onClick: () => setActiveTab('audit'), isActive: activeTab === 'audit' },
  ];

  const currentHeaderTitle = (() => {
    if (activeTab === 'dashboard') return 'Dashboard';
    if (activeTab === 'cms') return 'Website / App CMS Management';
    if (activeTab === 'users') return `User Management — ${selectedUserSubtitle === 'dharma_karthas' ? 'Dharma Karthas' : 'Devotees'}`;
    if (activeTab === 'devotional_services') return 'Categories — Devotional Services (9)';
    if (activeTab === 'subcategories') return `Categories — Devotional Subcategories (${stats?.activeSubcategories ?? (subTotalCount || subcategories.length || 134)})`;
    if (activeTab === 'temples' || (activeTab === 'categories' && selectedCategorySubtitle === 'temples')) return `Categories — Sacred Temples (${templesList.length})`;
    if (activeTab === 'categories') return `Categories — ${selectedCategorySubtitle.toUpperCase()}`;
    if (activeTab === 'content') return `Spiritual Management Vidhanam — ${selectedVidhanamSubtitle === 'gods' ? 'Gods & Goddesses' : selectedVidhanamSubtitle === 'slokas' ? 'Slokas' : selectedVidhanamSubtitle === 'astothrams' ? 'Astothrams' : 'Stotras'}`;
    if (activeTab === 'audio') return `Spiritual Music — ${selectedMusicSubtitle.toUpperCase()}`;
    if (activeTab === 'soft_deleted_users') return 'Soft Deleted Users Archive';
    if (activeTab === 'panchangam') return 'Live Vedic Astronomical Panchangam';
    if (activeTab === 'festivals') return `Sabarimala & Temple Festivals Management (${festivals.length})`;
    if (activeTab === 'splash') return 'Splash Screen Manager';
    if (activeTab === 'languages') return 'Language Translations';
    if (activeTab === 'profile') return 'Admin Profile';
    if (activeTab === 'gods') return `Gods & Goddesses Sanctum Management (${deities.length} Deities)`;
    if (activeTab === 'temple_types') return `Temple Types & Sanctum Categories (${templeTypes.length} Types)`;
    if (activeTab === 'tickets') return `Devotee Support & Inquiries Helpdesk (${ticketStats.total} Tickets)`;
    if (activeTab === 'settings') return 'Settings — Branding, Colors, Logo & Identity';
    if (activeTab === 'audit') return 'Security Audit Trail';
    return 'Super Admin Console';
  })();

  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden text-gray-100">
      {/* Industry-Level Animated Toast Notification */}
      {adminToast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed top-6 right-6 z-[99999] flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border max-w-md w-full transition-all transform animate-in slide-in-from-top-4 duration-300 ${adminToast.type === 'warning'
              ? 'bg-[#211604]/95 border-amber-500/60 text-amber-200 shadow-amber-950/40'
              : adminToast.type === 'error'
                ? 'bg-[#260a0a]/95 border-rose-500/60 text-rose-200 shadow-rose-950/40'
                : adminToast.type === 'info'
                  ? 'bg-[#081e2b]/95 border-sky-500/60 text-sky-200 shadow-sky-950/40'
                  : 'bg-[#0c2419]/95 border-emerald-500/60 text-emerald-200 shadow-emerald-950/40'
            }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {adminToast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : adminToast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : adminToast.type === 'info' ? (
              <Info className="w-5 h-5 text-sky-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            {adminToast.title && (
              <h4 className="text-xs font-extrabold uppercase tracking-wider mb-0.5 text-white">
                {adminToast.title}
              </h4>
            )}
            <p className="text-xs text-gray-200 leading-relaxed break-words font-medium">
              {adminToast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdminToast(null)}
            className="text-gray-400 hover:text-white transition p-1 -mr-1 -mt-1 rounded-md hover:bg-white/10"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {notification && !adminToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E1E1E] border border-[#FFB300] text-[#FFB300] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-xs">{notification}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-[#181818] border-r border-[#2C2C2C] flex flex-col justify-between flex-shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-center">
            <img
              src={resolveLogoDisplayUrl(appLogoUrl)}
              alt="Saranam Ayyappa — Thathwamasi"
              className="w-full max-h-24 object-contain rounded-xl shadow-lg border border-[var(--admin-gold)]/40 hover:border-[var(--admin-gold)] transition"
              onError={(e: any) => { console.warn('Sidebar logo load error:', e.target.src); }}
            />
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {/* TOP 6 ORDERED MENU ITEMS */}
            {primarySidebarMenu.map(item => {
              const Icon = item.icon;
              const hasSubtitles = item.subtitles && item.subtitles.length > 0;

              if (hasSubtitles) {
                return (
                  <div key={item.key} className="space-y-1">
                    <button
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${item.isActive
                          ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                        }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-orange-400/80" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>

                    {item.isExpanded && (
                      <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-orange-500/40 ml-4 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.subtitles?.map(sub => (
                          <button
                            key={sub.key}
                            onClick={sub.onClick}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all text-left group ${sub.isActive
                                ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-[#FFB300] font-semibold border border-[#FFB300]/40 shadow-sm'
                                : 'text-gray-400 hover:text-gray-100 hover:bg-neutral-800/60'
                              }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125 ${sub.isActive ? 'bg-[#FFB300] shadow-[0_0_6px_#FFB300]' : 'bg-gray-600'}`} />
                              <span className="truncate">{sub.label}</span>
                            </div>
                            {sub.isActive && (
                              <span className="text-[10px] text-[#FFB300] font-bold">●</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${item.isActive
                      ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* SECONDARY SYSTEM & TOOLS SECTION */}
            <div className="pt-3 mt-2 border-t border-[#252525]">
              <p className="px-3 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                System & Archives
              </p>
              {secondarySidebarMenu.map(sec => {
                const SecIcon = sec.icon;
                return (
                  <button
                    key={sec.key}
                    onClick={sec.onClick}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sec.isActive
                        ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                      }`}
                  >
                    <SecIcon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                    <span className="truncate">{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Industry-Standard Admin User Profile Footer */}
          <div className="p-3 border-t border-[#2C2C2C] bg-[#141414]/90">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#1F1F1F] border border-[#2C2C2C] hover:border-[var(--admin-gold)]/40 transition group">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                title="View Admin Profile Settings"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 border border-[var(--admin-gold)] flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
                  {adminProfile.fullName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--admin-ivory)] truncate group-hover:text-[var(--admin-gold)] transition">
                    {adminProfile.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate capitalize font-medium">
                    {adminProfile.role?.toLowerCase().replace('_', ' ') || 'Super Admin'}
                  </p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                title="Log out securely"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition flex items-center justify-center flex-shrink-0 text-sm font-semibold"
              >
                <span className="text-base text-gray-400 hover:text-red-400 transition font-bold leading-none">→</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-[var(--admin-border-subtle)] px-8 flex items-center justify-between bg-[var(--admin-bg-surface)] sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm text-[var(--admin-ivory)] uppercase tracking-wide">
              {currentHeaderTitle}
            </span>
          </div>

          {/* Right-side corner Profile & Account Dropdown Widget (Click-triggered Dropdown) */}
          <div className="relative">
            {/* Click-outside backdrop overlay to close dropdown */}
            {isProfileDropdownOpen && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsProfileDropdownOpen(false)}
              />
            )}

            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(prev => !prev)}
              className="relative z-40 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[var(--admin-bg-card)] border border-[var(--admin-border-subtle)] hover:border-[var(--admin-gold)] transition group shadow-md cursor-pointer text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--admin-maroon-dark)] border-2 border-[var(--admin-gold)] flex items-center justify-center text-xs font-bold text-[var(--admin-gold)] shadow flex-shrink-0">
                {adminProfile?.fullName ? adminProfile.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="text-left hidden sm:block max-w-[150px]">
                <p className="text-xs font-bold text-[var(--admin-ivory)] truncate group-hover:text-[var(--admin-gold)] transition">
                  {adminProfile.fullName}
                </p>
                <p className="text-[10px] text-[var(--admin-gold)] font-medium leading-tight">My Account</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--admin-gold)] transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dynamic Click-Triggered Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-60 bg-[var(--admin-bg-card)] border border-[var(--admin-border-subtle)] rounded-xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-2 border-b border-[var(--admin-border-subtle)] mb-1">
                  <p className="text-xs font-bold text-[var(--admin-gold)] truncate">{adminProfile.fullName}</p>
                  <p className="text-[10px] text-[var(--admin-ivory)] opacity-60 truncate">{adminProfile.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--admin-ivory)] hover:bg-[var(--admin-maroon-mid)] hover:text-[var(--admin-gold)] transition-colors text-left"
                >
                  <User className="w-4 h-4 text-[var(--admin-gold)]" />
                  <span>View Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB: DYNAMIC SPLASH SCREEN MANAGEMENT */}
          {activeTab === 'splash' && <SplashScreenManager />}

          {/* TAB: DEVOTIONAL SERVICES (Fetched from DB /categories/services) */}
          {activeTab === 'devotional_services' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-orange-400" />
                      <span>Devotional Services Management (9 Sanctum Categories)</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                      Authoritative devotional services and sacred categories dynamically fetched from MySQL DB via API (<code className="text-amber-400">/api/v1/categories/services</code>). Devotees and Dharma Karthas access these services on the Saranam Ayyappa website and mobile app.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={loadCategoryServices}
                      disabled={loadingServices}
                      className="px-3 py-1.5 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold flex items-center gap-1.5 text-gray-300 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingServices ? 'animate-spin text-amber-400' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <span className="px-3 py-1 bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 rounded-lg text-xs font-bold">
                      {devotionalServices.length || 9} Active in Portal
                    </span>
                    <button
                      onClick={handleOpenCreateService}
                      className="px-3.5 py-1.5 bg-[#FFB300] hover:bg-[#FFA000] text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Devotional Service</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-5 pt-4 border-t border-[#2C2C2C]">
                  <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search devotional services by title, subtitle, or route..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>
              </div>

              {/* Devotional Services Grid Matching User Reference Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {devotionalServices
                  .filter((s) => {
                    if (!serviceSearch.trim()) return true;
                    const q = serviceSearch.toLowerCase();
                    const matchTitle = s.title?.toLowerCase().includes(q);
                    const matchSub = s.sub?.toLowerCase().includes(q);
                    const matchId = (s.serviceId || s.id)?.toLowerCase().includes(q);
                    return matchTitle || matchSub || matchId;
                  })
                  .map((service, index) => {
                    const sKey = service.serviceId || service.id;
                    const artworkSrc = service.artwork || categoryArtworkMap[sKey] || categoryArtworkMap[service.id];
                    return (
                      <div
                        key={service.id || service.serviceId || index}
                        onClick={() => handleOpenViewService(service)}
                        className="bg-[#1E1E1E] hover:bg-[#252525] rounded-2xl border border-[#2C2C2C] hover:border-[#FFB300]/50 p-4 transition-all duration-200 hover:shadow-2xl flex flex-col justify-between gap-3 group cursor-pointer relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* 1. Left Medallion Icon with Divine Glyph */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A2A2A] to-[#141414] border border-[#3A3A3A] group-hover:border-[#FFB300]/40 flex items-center justify-center flex-shrink-0 shadow-inner">
                            {renderServiceIcon(service.icon || service.id)}
                          </div>

                          {/* 2. Middle Information (Title + Subtitle) */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-gray-100 group-hover:text-[#FFB300] transition truncate">
                                {service.title}
                              </h3>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-gray-400 font-mono">
                                #{service.displayOrder || index + 1}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">
                              {service.sub || 'Step-by-step sacred rituals'}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-gray-500 font-mono bg-[#141414] px-1.5 py-0.5 rounded border border-[#2C2C2C]">
                                {service.url}
                              </span>
                              <span className={`text-[10px] font-medium flex items-center gap-1 ${service.isActive !== false ? 'text-emerald-400' : 'text-gray-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${service.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                                {service.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          {/* 3. Devotional Line Artwork & Arrow */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {artworkSrc ? (
                              <div className="relative group/art w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                                <img
                                  src={resolveArtworkUrl(artworkSrc)}
                                  alt={service.title}
                                  className="w-10 h-10 object-contain opacity-85 group-hover:opacity-100 transition transform group-hover:scale-105"
                                  onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <label
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute inset-0 bg-black/70 opacity-0 group-hover/art:opacity-100 flex items-center justify-center cursor-pointer transition rounded-xl"
                                  title="Upload / Change Category Image"
                                >
                                  <Upload className="w-4 h-4 text-amber-400" />
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={(e) => handleQuickServiceArtworkUpload(service.id || service.serviceId, e)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            ) : (
                              <label
                                onClick={(e) => e.stopPropagation()}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-900 border border-dashed border-neutral-700 hover:border-amber-400 text-gray-500 hover:text-amber-400 cursor-pointer transition"
                                title="Upload Category Image"
                              >
                                <Upload className="w-4 h-4" />
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/webp"
                                  onChange={(e) => handleQuickServiceArtworkUpload(service.id || service.serviceId, e)}
                                  className="hidden"
                                />
                              </label>
                            )}

                            <div className="w-7 h-7 rounded-full border border-[#3A3A3A] bg-[#141414] flex items-center justify-center text-gray-400 group-hover:text-[#FFB300] group-hover:border-[#FFB300]/50 transition">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Action Bar */}
                        <div className="pt-2.5 border-t border-[#2A2A2A] flex items-center justify-between text-xs">
                          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                            <span className="text-gray-500">ID:</span>
                            <span className="text-amber-400/90">{sKey}</span>
                          </span>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <label
                              title="Upload / Replace Category Image"
                              className="px-2 py-1 bg-[#141414] hover:bg-[#252525] text-gray-300 hover:text-emerald-400 rounded border border-[#2C2C2C] flex items-center gap-1 text-[11px] font-semibold transition cursor-pointer"
                            >
                              <Upload className="w-3 h-3 text-emerald-400" />
                              <span>Image</span>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={(e) => handleQuickServiceArtworkUpload(service.id || service.serviceId, e)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const sKey = service.serviceId || service.id;
                                setSelectedParentCategoryFilter(sKey);
                                loadSubcategories(1, '', selectedLang, sKey);
                                setActiveTab('subcategories');
                              }}
                              title="Manage Subcategories under this Category"
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 flex items-center gap-1 text-[11px] font-semibold transition"
                            >
                              <Layers className="w-3 h-3 text-amber-400" />
                              <span>Subcategories</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenViewService(service, e)}
                              title="View Details by ID"
                              className="px-2 py-1 bg-[#141414] hover:bg-[#252525] text-gray-300 hover:text-white rounded border border-[#2C2C2C] flex items-center gap-1 text-[11px] font-semibold transition"
                            >
                              <Eye className="w-3 h-3 text-sky-400" />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditService(service, e)}
                              title="Edit Devotional Service"
                              className="px-2 py-1 bg-[#141414] hover:bg-[#252525] text-gray-300 hover:text-amber-400 rounded border border-[#2C2C2C] flex items-center gap-1 text-[11px] font-semibold transition"
                            >
                              <Edit3 className="w-3 h-3 text-amber-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCategoryService(service, e)}
                              title="Delete Devotional Service"
                              className="px-2 py-1 bg-[#141414] hover:bg-rose-950/40 text-gray-300 hover:text-red-400 rounded border border-[#2C2C2C] hover:border-red-900/40 flex items-center gap-1 text-[11px] font-semibold transition"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Empty state if search has no matches */}
              {devotionalServices.length > 0 &&
                devotionalServices.filter((s) => {
                  if (!serviceSearch.trim()) return true;
                  const q = serviceSearch.toLowerCase();
                  return s.title?.toLowerCase().includes(q) || s.sub?.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="p-12 text-center text-xs text-gray-400 bg-[#1E1E1E] rounded-xl border border-[#2C2C2C]">
                    <Search className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    No devotional services found matching "{serviceSearch}".
                  </div>
                )}

              {/* MODAL: VIEW SERVICE BY ID */}
              {isViewServiceModalOpen && selectedViewService && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-[#1E1E1E] border border-[#FFB300]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FFB300]/10 border border-[#FFB300]/30 flex items-center justify-center text-[#FFB300]">
                          <FolderTree className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#FFB300]">
                            Devotional Service Details (ID: {selectedViewService.id || selectedViewService.serviceId})
                          </h3>
                          <p className="text-[11px] text-gray-400">Dynamic category configuration retrieved via API from MySQL</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setIsViewServiceModalOpen(false); setSelectedViewService(null); }}
                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#252525] transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Visual Card Banner */}
                    <div className="bg-gradient-to-r from-[#241F14] to-[#1A1A1A] border border-[#3A3220] rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-[#2A2A2A] border border-[#FFB300]/40 flex items-center justify-center flex-shrink-0 shadow-lg">
                          {renderServiceIcon(selectedViewService.icon || selectedViewService.id)}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-100">{selectedViewService.title}</h4>
                          <p className="text-xs text-amber-300 font-medium">{selectedViewService.sub || 'Step-by-step sacred rituals'}</p>
                          <span className="inline-block mt-1 text-[10px] text-gray-400 font-mono bg-black/40 px-2 py-0.5 rounded border border-[#333]">
                            {selectedViewService.url}
                          </span>
                        </div>
                      </div>
                      {(selectedViewService.artwork || categoryArtworkMap[selectedViewService.serviceId || selectedViewService.id]) && (
                        <img
                          src={resolveArtworkUrl(selectedViewService.artwork || categoryArtworkMap[selectedViewService.serviceId || selectedViewService.id])}
                          alt={selectedViewService.title}
                          className="w-14 h-14 object-contain opacity-90 drop-shadow"
                          onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold mb-1">Service Identifier</span>
                        <span className="text-amber-400 font-mono font-bold">{selectedViewService.serviceId || selectedViewService.id}</span>
                      </div>
                      <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold mb-1">Display Order</span>
                        <span className="text-gray-200 font-mono font-bold">#{selectedViewService.displayOrder || 1}</span>
                      </div>
                      <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold mb-1">Navigation Route</span>
                        <span className="text-sky-400 font-mono">{selectedViewService.url}</span>
                      </div>
                      <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold mb-1">Portal Status</span>
                        <span className={`inline-flex items-center gap-1 font-semibold ${selectedViewService.isActive !== false ? 'text-emerald-400' : 'text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedViewService.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                          {selectedViewService.isActive !== false ? 'Active & Published' : 'Draft / Inactive'}
                        </span>
                      </div>
                      <div className="col-span-2 bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold mb-1">Assigned Icon Glyph</span>
                        <span className="text-gray-300 font-mono">{selectedViewService.icon || 'Sparkles'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#2C2C2C]">
                      <button
                        onClick={() => handleDeleteCategoryService(selectedViewService)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Service</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const svc = { ...selectedViewService };
                            setIsViewServiceModalOpen(false);
                            handleOpenEditService(svc);
                          }}
                          className="px-3.5 py-1.5 bg-[#FFB300] hover:bg-[#FFA000] text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit This Service</span>
                        </button>
                        <button
                          onClick={() => { setIsViewServiceModalOpen(false); setSelectedViewService(null); }}
                          className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold text-gray-300 transition"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL: CREATE / EDIT DEVOTIONAL SERVICE */}
              {isServiceEditModalOpen && editingCategoryService && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-[#1E1E1E] border border-[#FFB300]/40 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FFB300]/10 border border-[#FFB300]/30 flex items-center justify-center text-[#FFB300]">
                          <FolderTree className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#FFB300]">
                            {devotionalServices.some(s => (s.id === editingCategoryService.id || s.serviceId === editingCategoryService.serviceId))
                              ? 'Edit Devotional Service'
                              : 'Create New Devotional Service'}
                          </h3>
                          <p className="text-[11px] text-gray-400">Configure sacred category title, subtitle, icon glyph & artwork</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setIsServiceEditModalOpen(false); setEditingCategoryService(null); }}
                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#252525] transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSaveCategoryService} className="space-y-4">
                      {/* Title & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Service Title <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Pooja Vidhanam"
                            value={editingCategoryService.title || ''}
                            onChange={(e) => setEditingCategoryService({ ...editingCategoryService, title: e.target.value })}
                            className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Subtitle / Description
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Step-by-step sacred rituals"
                            value={editingCategoryService.sub || ''}
                            onChange={(e) => setEditingCategoryService({ ...editingCategoryService, sub: e.target.value })}
                            className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                      </div>

                      {/* Service Slug ID & Route URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Service Identifier / Slug
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. pooja, stotras, darshan"
                            value={editingCategoryService.serviceId || editingCategoryService.id || ''}
                            onChange={(e) => {
                              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                              setEditingCategoryService({ ...editingCategoryService, serviceId: val, id: val });
                            }}
                            className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 font-mono placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Target Route URL
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. /subcategories, /festivals"
                            value={editingCategoryService.url || ''}
                            onChange={(e) => setEditingCategoryService({ ...editingCategoryService, url: e.target.value })}
                            className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 font-mono placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                      </div>

                      {/* Icon & Display Order */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Icon Glyph
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2C2C2C] flex items-center justify-center text-amber-400 flex-shrink-0">
                              {renderServiceIcon(editingCategoryService.icon || 'Sparkles')}
                            </div>
                            <select
                              value={editingCategoryService.icon || 'Sparkles'}
                              onChange={(e) => setEditingCategoryService({ ...editingCategoryService, icon: e.target.value })}
                              className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300]"
                            >
                              <option value="Flame">Flame (Pooja / Fire Rituals)</option>
                              <option value="BookOpen">BookOpen (Stotras / Sacred Books)</option>
                              <option value="Scroll">Scroll (Daily Slokas / Mantras)</option>
                              <option value="Music">Music (Bhajans & Songs)</option>
                              <option value="Tv">Tv (Live Darshan / Streaming)</option>
                              <option value="Calendar">Calendar (Panchangam / Timings)</option>
                              <option value="Sparkles">Sparkles (Festivals / Celebrations)</option>
                              <option value="Landmark">Landmark (Temples / Shrines)</option>
                              <option value="HeartHandshake">HeartHandshake (Annadanam / Seva)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={editingCategoryService.displayOrder || 1}
                            onChange={(e) => setEditingCategoryService({ ...editingCategoryService, displayOrder: parseInt(e.target.value, 10) || 1 })}
                            className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                      </div>

                      {/* Artwork Image Upload & URL */}
                      <div className="space-y-2 bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                        <label className="text-xs font-semibold text-gray-300 block">
                          Devotional Artwork Image
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {editingCategoryService.artwork ? (
                              <img
                                src={resolveArtworkUrl(editingCategoryService.artwork)}
                                alt="Preview"
                                className="w-full h-full object-contain p-1"
                                onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-600" />
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer px-3 py-1.5 bg-[#252525] hover:bg-[#333333] border border-[#3A3A3A] text-gray-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>Upload Image File</span>
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/webp"
                                  onChange={handleServiceArtworkUpload}
                                  className="hidden"
                                />
                              </label>
                              {editingCategoryService.artwork && (
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryService({ ...editingCategoryService, artwork: '' })}
                                  className="px-2 py-1 bg-red-950/40 text-red-400 hover:text-red-300 rounded text-[11px] border border-red-900/30"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Or paste artwork URL (e.g. /images/categories/art-pooja-trans.png)"
                              value={editingCategoryService.artwork || ''}
                              onChange={(e) => setEditingCategoryService({ ...editingCategoryService, artwork: e.target.value })}
                              className="w-full bg-[#1E1E1E] border border-[#2C2C2C] rounded-md px-2.5 py-1 text-[11px] text-gray-300 font-mono placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Active Status Checkbox */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="serviceActiveToggle"
                          checked={editingCategoryService.isActive !== false}
                          onChange={(e) => setEditingCategoryService({ ...editingCategoryService, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-[#333] text-amber-500 focus:ring-amber-400 focus:ring-offset-0 bg-[#141414]"
                        />
                        <label htmlFor="serviceActiveToggle" className="text-xs text-gray-200 font-medium cursor-pointer">
                          Publish this Devotional Service on Website & Mobile App
                        </label>
                      </div>

                      {/* Modal Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2C]">
                        <button
                          type="button"
                          onClick={() => { setIsServiceEditModalOpen(false); setEditingCategoryService(null); }}
                          className="px-4 py-2 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold text-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingCategoryService}
                          className="px-5 py-2 bg-[#FFB300] hover:bg-[#FFA000] text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                          {isSavingCategoryService && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>Save Devotional Service</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SACRED TEMPLES MANAGEMENT (Dynamically fetched from DB via API) */}
          {(activeTab === 'temples' || (activeTab === 'categories' && selectedCategorySubtitle === 'temples')) && (
            <div className="space-y-6">
              {/* Header Filter & Action Bar */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-5 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search temple, deity, city, state..."
                        value={templeSearch}
                        onChange={(e) => {
                          setTempleSearch(e.target.value);
                          loadAdminTemples(e.target.value, templeDeityFilter, templeStateFilter);
                        }}
                        className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>

                    {/* Deity Filter */}
                    <select
                      value={templeDeityFilter}
                      onChange={(e) => {
                        setTempleDeityFilter(e.target.value);
                        loadAdminTemples(templeSearch, e.target.value, templeStateFilter);
                      }}
                      className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                    >
                      <option value="ALL">All Deities</option>
                      <option value="ayyappa">Lord Ayyappa</option>
                      <option value="venkateswara">Lord Venkateswara</option>
                      <option value="shiva">Lord Shiva</option>
                      <option value="krishna">Lord Krishna</option>
                      <option value="meenakshi">Goddess Meenakshi</option>
                      <option value="durga">Goddess Durga</option>
                      <option value="ganesha">Lord Ganesha</option>
                      <option value="murugan">Lord Murugan</option>
                    </select>

                    {/* State Filter */}
                    <select
                      value={templeStateFilter}
                      onChange={(e) => {
                        setTempleStateFilter(e.target.value);
                        loadAdminTemples(templeSearch, templeDeityFilter, e.target.value);
                      }}
                      className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#FFB300]"
                    >
                      <option value="ALL">All States</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>

                    {/* Language Selector */}
                    <select
                      value={selectedLang}
                      onChange={(e) => {
                        setSelectedLang(e.target.value);
                      }}
                      className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-[#FFB300]"
                    >
                      <option value="en">English (English)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                      <option value="kn">Kannada (ಕನ್ನಡ)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="ml">Malayalam (മലയാളം)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      Total: <strong className="text-amber-400 font-bold">{templesList.length}</strong> Sacred Temples
                    </span>
                    <button
                      type="button"
                      onClick={() => loadAdminTemples()}
                      disabled={isTemplesLoading}
                      title="Refresh from DB"
                      className="p-2 rounded-lg bg-[#141414] border border-[#2C2C2C] hover:border-[#FFB300] text-gray-300 hover:text-amber-400 transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${isTemplesLoading ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCreateTemple}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950/40"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create Sacred Temple</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Temples List Table */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-lg">
                {isTemplesLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-8 h-8 text-[#FFB300] animate-spin mb-3" />
                    <p className="text-sm text-gray-300 font-medium">Fetching Sacred Temples from Database via API...</p>
                    <p className="text-xs text-gray-500 mt-1">Connecting to MySQL temples directory</p>
                  </div>
                ) : templesList.length === 0 ? (
                  <div className="py-16 text-center">
                    <Landmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-base text-gray-300 font-semibold">No Sacred Temples Found</p>
                    <p className="text-xs text-gray-500 mt-1">No temples match the search criteria or database table is empty.</p>
                    <button
                      type="button"
                      onClick={handleOpenCreateTemple}
                      className="mt-4 px-4 py-2 rounded-lg bg-[#FFB300] hover:bg-amber-400 text-black text-xs font-bold transition"
                    >
                      + Add First Sacred Temple
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#2C2C2C] bg-[#141414] text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                          <th className="py-3 px-4 w-12">#</th>
                          <th className="py-3 px-4 w-20">Banner</th>
                          <th className="py-3 px-4">Temple Name & Slug</th>
                          <th className="py-3 px-4">Deity</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Darshan Timings</th>
                          <th className="py-3 px-4">Live Darshan</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2C] text-xs">
                        {templesList.map((t, idx) => (
                          <tr key={t.id || t.slug || idx} className="hover:bg-[#252525]/60 transition">
                            <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                              #{t.dbId || idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-14 h-10 rounded-md overflow-hidden bg-neutral-900 border border-[#2C2C2C] relative">
                                <img
                                  src={resolveTempleImageUrl(t.thumbnailUrl || t.heroImageUrl)}
                                  alt={t.name}
                                  className="w-full h-full object-cover"
                                  onError={(e: any) => {
                                    e.currentTarget.src = 'https://saranamayyappa.in/images/temples/banner-sabarimala-hd.png';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-gray-100 flex items-center gap-1.5">
                                <span>{t.name}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono">
                                /{t.id || t.slug}
                              </div>
                              {t.originalName && t.originalName !== t.name && (
                                <div className="text-[10px] text-amber-400/80">
                                  EN: {t.originalName}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/40">
                                <span>🕉️</span>
                                <span>{t.deityName || t.deityId || 'Lord Ayyappa'}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                <span className="font-medium text-gray-200">{t.city || 'Sannidhanam'}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 pl-4.5">
                                {t.state}{t.district ? `, ${t.district}` : ''}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[11px] text-gray-300">
                              {t.timings ? (
                                <div className="space-y-0.5">
                                  {t.timings.morning && (
                                    <div className="flex items-center gap-1 text-gray-300">
                                      <Clock className="w-3 h-3 text-amber-400" />
                                      <span>{t.timings.morning}</span>
                                    </div>
                                  )}
                                  {t.timings.evening && (
                                    <div className="text-[10px] text-gray-400 pl-4">
                                      {t.timings.evening}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">Open Daily</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {t.hasLiveDarshan ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  <span>LIVE</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-500">No Stream</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleTempleActive(t)}
                                title={t.isActive ? 'Active in Portal (Click to Hide)' : 'Hidden (Click to Publish)'}
                                className={`px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1.5 transition ${t.isActive
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900'
                                    : 'bg-neutral-800 text-gray-400 border border-gray-700 hover:bg-neutral-700'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                                <span>{t.isActive ? 'Published' : 'Draft'}</span>
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenViewTemple(t)}
                                  title="View Temple Details"
                                  className="p-1.5 rounded bg-[#141414] hover:bg-neutral-800 text-gray-300 hover:text-cyan-400 border border-[#2C2C2C] transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTemple(t)}
                                  title="Edit Temple"
                                  className="p-1.5 rounded bg-[#141414] hover:bg-neutral-800 text-gray-300 hover:text-amber-400 border border-[#2C2C2C] transition"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemple(t.id || t.slug, t.name)}
                                  title="Delete Temple"
                                  className="p-1.5 rounded bg-[#141414] hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-[#2C2C2C] transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IN-PAGE NORMAL PAGE MODE: VIEW DETAILS (SANCTUM GREEN & GOLD SACRED PREVIEW) */}
          {pageMode === 'VIEW_CATEGORY' && viewDetail && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* In-page Header: Logo Colors Sanctum Green & Divine Gold */}
              <div className="bg-[#071C14] rounded-xl border border-[#1A4E38] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPageMode('LIST');
                      setViewDetail(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0D2E21] hover:bg-[#133F2E] text-gray-200 text-xs font-semibold transition flex items-center gap-1.5 border border-[#1E5C41] shadow"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#FFB300]" />
                    <span>Back to List</span>
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFB300]" />
                      <span>
                        {viewDetail.isType
                          ? 'Devotional Subcategory Type / Sacred Verse'
                          : viewDetail.isSubcategory || viewDetail.parentId
                            ? 'Devotional Subcategory Sanctum Details'
                            : 'Devotional Master Category'}
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-400/80">
                      {viewDetail.isType
                        ? `Type DB Record #${viewDetail.id} — Linked to Subcategory`
                        : viewDetail.isSubcategory || viewDetail.parentId
                          ? `Subcategory Record #${viewDetail.id} — Live Sanctum Worship Flow`
                          : `Master Category Record #${viewDetail.id}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Real-time Dynamic Language Switcher (Direct from DB via API) */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#061A13] border border-[#1E5C41] rounded-lg shadow-inner">
                    <Globe className="w-3.5 h-3.5 text-[#FFB300] ml-1.5" />
                    <span className="text-[11px] font-bold text-gray-300 uppercase px-1">DB Lang:</span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleViewDetailChangeLang(l.code)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${selectedLang === l.code
                              ? 'bg-[#FFB300] text-[#071C14] font-bold shadow'
                              : 'text-gray-300 hover:text-[#FFB300] hover:bg-[#0D2E21]'
                            }`}
                          title={`Switch to ${l.name} (${l.code}) — Dynamically fetched from MySQL via API`}
                        >
                          <span>{l.nativeName || l.name}</span>
                          <span className="text-[10px] opacity-70 uppercase font-mono">({l.code})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (viewDetail.isType) {
                        const match = devotionalContent.find(c => String(c.id) === String(viewDetail.id));
                        if (match) {
                          handleOpenEditType(match);
                        } else {
                          handleOpenEditType({
                            id: Number(viewDetail.id),
                            categoryId: Number(viewDetail.parentId),
                            title: viewDetail.title,
                            slug: viewDetail.slug,
                            sacredText: viewDetail.sacredText,
                            meaning: viewDetail.meaning,
                            isPublished: viewDetail.isPublished !== false
                          });
                        }
                      } else if (viewDetail.isSubcategory || viewDetail.parentId) {
                        handleOpenEditSubcategory({
                          id: String(viewDetail.id),
                          title: viewDetail.title,
                          slug: viewDetail.slug,
                          parentId: Number(viewDetail.parentId) || 1,
                          description: viewDetail.description || '',
                          displayOrder: viewDetail.displayOrder || 1,
                          imageUrl: viewDetail.imageUrl || '',
                          parentTitle: viewDetail.parentTitle || 'Pooja Vidhanam',
                        });
                      } else {
                        const matchingCat = categories.find(c => String(c.id) === String(viewDetail.id));
                        if (matchingCat) {
                          handleOpenEditCategory(matchingCat);
                        } else {
                          setEditingId(viewDetail.id);
                          setFormTitle(viewDetail.title);
                          setFormSlug(viewDetail.slug);
                          setFormIsAudio(viewDetail.isAudio);
                          setFormDescription(viewDetail.description || '');
                          setPageMode('EDIT_CATEGORY');
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] font-bold text-xs rounded-lg transition shadow-lg shadow-amber-500/20"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit This Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPageMode('LIST');
                      setViewDetail(null);
                    }}
                    className="px-4 py-2 bg-[#0D2E21] hover:bg-[#133F2E] border border-[#1E5C41] rounded-lg text-gray-200 font-semibold text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Main Detailed Grid: Devotional Scroll Reader (Left) & Admin Specs (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: Sacred Devotional Reader (Authentic Green & Gold Scroll) */}
                <div className="lg:col-span-7 flex flex-col items-center">

                  {/* TYPE TABS / SELECTOR: Allows toggling between All Sacred Types or viewing a specific Type */}
                  {viewDetail.contents && viewDetail.contents.length > 0 && (
                    <div className="w-full mb-4 bg-[#082218] border border-[#1A4E38] rounded-xl p-3 shadow-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FFB300] uppercase tracking-wider flex items-center gap-1.5">
                          <span>✨</span>
                          <span>{viewDetail.title} Types ({viewDetail.contents.length})</span>
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {activeViewTypeTab === 'all'
                            ? 'Showing: Complete Chanting Sequence'
                            : `Showing Type #${(typeof activeViewTypeTab === 'number' ? activeViewTypeTab : 0) + 1} of ${viewDetail.contents.length}`}
                        </span>
                      </div>

                      {/* Interactive Horizontal Scrollable Type Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {/* Option to view all steps combined */}
                        <button
                          type="button"
                          onClick={() => setActiveViewTypeTab('all')}
                          className={`p-2 rounded-lg text-left transition border flex flex-col justify-between gap-1 ${activeViewTypeTab === 'all'
                              ? 'bg-[#FFB300] text-[#071C14] border-[#FFB300] font-bold shadow-md'
                              : 'bg-[#061A13] text-gray-300 border-[#16422F] hover:border-[#FFB300]/50'
                            }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-mono uppercase">Full Flow</span>
                            <span className="text-[9px] px-1 rounded bg-black/20">All</span>
                          </div>
                          <span className="truncate text-xs font-semibold">All {viewDetail.contents.length} Types</span>
                        </button>

                        {/* Each Individual Type Tab */}
                        {viewDetail.contents.map((step, idx) => (
                          <button
                            key={step.id || idx}
                            type="button"
                            onClick={() => setActiveViewTypeTab(idx)}
                            className={`p-2 rounded-lg text-left transition border flex flex-col justify-between gap-1 ${activeViewTypeTab === idx
                                ? 'bg-[#FFB300] text-[#071C14] border-[#FFB300] font-bold shadow-md'
                                : 'bg-[#061A13] text-gray-300 border-[#16422F] hover:border-[#FFB300]/50'
                              }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-mono font-bold">#{idx + 1}</span>
                              <span className="text-[9px] px-1 rounded bg-black/20">Type</span>
                            </div>
                            <span className="truncate text-xs font-semibold">{step.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
                    <span className="font-bold text-[#FFB300] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📜</span>
                      <span>Devotional Reader View</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#061A13] border border-[#16422F] text-[#FEF08A] font-mono text-[10px]">
                        {languages.find(l => l.code === selectedLang)?.name || selectedLang.toUpperCase()}
                      </span>
                    </span>
                    <span className="text-[11px] text-emerald-400/90 font-mono">
                      {viewDetail.contents && viewDetail.contents.length > 0
                        ? activeViewTypeTab === 'all'
                          ? `${viewDetail.contents.length} Ordered Steps`
                          : `Type #${(typeof activeViewTypeTab === 'number' ? activeViewTypeTab : 0) + 1} / ${viewDetail.contents.length}`
                        : 'Single Sacred Composition'}
                    </span>
                  </div>

                  {/* Real-time Dynamic Language DB Status Banner */}
                  {viewDetail.hasExactTranslation === false && selectedLang !== 'te' && (
                    <div className="w-full max-w-lg mb-3 p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl flex items-center justify-between text-xs text-amber-200 shadow-md">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#FFB300] flex-shrink-0" />
                        <span>
                          No <strong>{languages.find(l => l.code === selectedLang)?.name || selectedLang.toUpperCase()}</strong> translation exists in MariaDB yet.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (viewDetail.isType) {
                            openTranslationModal('devotional_contents', viewDetail.id, [
                              { key: 'title', label: 'Title', value: viewDetail.title },
                              { key: 'sacredText', label: 'Sacred Chant', value: viewDetail.sacredText },
                              { key: 'meaning', label: 'Meaning', value: viewDetail.meaning }
                            ], () => {
                              handleViewDetailChangeLang(selectedLang);
                            });
                          } else {
                            openTranslationModal('categories', viewDetail.id, [
                              { key: 'title', label: 'Title', value: viewDetail.title },
                              { key: 'description', label: 'Sacred Notes', value: viewDetail.description, isHtml: true }
                            ], () => {
                              handleViewDetailChangeLang(selectedLang);
                            });
                          }
                        }}
                        className="px-2.5 py-1 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] font-bold rounded text-xs transition flex items-center gap-1 flex-shrink-0 ml-2"
                      >
                        <Sparkles className="w-3 h-3 text-[#071C14]" />
                        <span>Add in DB</span>
                      </button>
                    </div>
                  )}

                  {/* Sacred Scroll Outer Container */}
                  <div className="w-full max-w-lg rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_12px_45px_rgba(0,0,0,0.6),0_0_25px_rgba(212,175,55,0.15)] bg-[#071F17]">

                    {/* Top Sanctum Header mimicking mobile app with logo colors */}
                    <div className="bg-[#0A2A1E] text-[#FFB300] border-b border-[#1E5C41] px-5 py-3 flex items-center justify-between shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪔</span>
                        <span className="font-bold text-sm tracking-wide text-[#FFB300] truncate max-w-xs">
                          {activeViewTypeTab !== 'all' && typeof activeViewTypeTab === 'number' && viewDetail.contents?.[activeViewTypeTab]
                            ? viewDetail.contents[activeViewTypeTab].title
                            : viewDetail.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#071C14] border border-[#1E5C41] text-emerald-400">
                        /{activeViewTypeTab !== 'all' && typeof activeViewTypeTab === 'number' && (viewDetail.contents?.[activeViewTypeTab] as any)?.slug
                          ? (viewDetail.contents[activeViewTypeTab] as any).slug
                          : viewDetail.slug}
                      </span>
                    </div>

                    {/* Scroll Canvas with Sanctum Green & Divine Gold Typography */}
                    <div className="bg-gradient-to-b from-[#082218] via-[#0A291E] to-[#071D15] p-6 text-center text-xs leading-relaxed max-h-[760px] overflow-y-auto space-y-5">

                      {/* Top Sacred Arch Motif (Lotus Filigree) in Gold */}
                      <div className="flex justify-center pt-2">
                        <svg className="w-16 h-8 text-[#FFB300] opacity-80" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>

                      {/* Initial Sacred Invocations */}
                      <div className="space-y-1 text-sm font-semibold text-[#FDE68A]">
                        <p>śrī mahāgaṇādhipatayē namaḥ</p>
                        <p>śrī gurubhyō namaḥ</p>
                        <p className="font-bold text-[#FFB300]">hariḥ ōṁ</p>
                      </div>

                      <div className="border-b border-dotted border-[#D4AF37]/40 w-3/4 mx-auto my-3"></div>

                      {/* Case A: If Attached Devotional Types / Verses Exist in Contents */}
                      {viewDetail.contents && viewDetail.contents.length > 0 ? (
                        <div className="space-y-6">
                          {/* Top Subcategory Description (full song/procedure from DB) if present */}
                          {activeViewTypeTab === 'all' && viewDetail.description && (
                            <div className="p-3.5 bg-[#061A13]/90 rounded-xl border border-[#1B563D] text-left max-w-md mx-auto space-y-2">
                              <span className="text-[10px] font-bold uppercase text-[#FFB300] tracking-wider block text-center">
                                Devotional Composition / Procedure
                              </span>
                              <div
                                className="text-xs font-serif leading-relaxed text-[#FEF08A] whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: viewDetail.description }}
                              />
                            </div>
                          )}

                          {(activeViewTypeTab === 'all'
                            ? viewDetail.contents
                            : [viewDetail.contents[typeof activeViewTypeTab === 'number' ? activeViewTypeTab : 0]]
                          ).map((v, idx) => (
                            <div key={v.id || idx} className="space-y-2.5">
                              {/* Step Title / Deity in Radiant Gold */}
                              <h4 className="text-sm font-bold text-[#FFB300] tracking-wide uppercase flex items-center justify-center gap-1.5">
                                <span>{v.title}</span>
                              </h4>

                              {/* Sacred Chanting Verses */}
                              {v.sacredText && (
                                <div className="text-sm font-bold text-[#FEF08A] font-serif leading-relaxed whitespace-pre-wrap max-w-md mx-auto py-1">
                                  {v.sacredText}
                                </div>
                              )}

                              {/* Ritual Action / Instructions / Commentary in Sage Green Box */}
                              {v.meaning && (
                                <div className="text-xs italic text-[#A7F3D0] bg-[#061A13]/90 border border-[#1B563D] p-2.5 rounded-lg max-w-md mx-auto text-center leading-relaxed">
                                  {v.meaning}
                                </div>
                              )}

                              {/* Dotted Gold Divider between steps */}
                              {activeViewTypeTab === 'all' && idx < (viewDetail.contents?.length || 0) - 1 && (
                                <div className="border-b border-dotted border-[#D4AF37]/35 w-3/4 mx-auto pt-4"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Case B: Single Composition (Description / Sacred Text / Meaning) */
                        <div className="space-y-4">
                          <h4 className="text-base font-bold text-[#FFB300] tracking-wide">{viewDetail.title}</h4>

                          {viewDetail.sacredText && (
                            <div className="text-sm font-bold text-[#FEF08A] font-serif leading-relaxed whitespace-pre-wrap max-w-md mx-auto py-2 p-3 bg-[#061A13]/70 rounded-xl border border-[#1B563D]">
                              {viewDetail.sacredText}
                            </div>
                          )}

                          {viewDetail.meaning && viewDetail.meaning !== viewDetail.description && (
                            <div className="text-xs italic text-[#A7F3D0] bg-[#061A13]/90 border border-[#1B563D] p-3 rounded-lg max-w-md mx-auto text-center">
                              {viewDetail.meaning}
                            </div>
                          )}

                          {viewDetail.description && (
                            <div
                              className="text-sm font-serif leading-relaxed text-[#FEF08A] whitespace-pre-wrap max-w-md mx-auto font-medium"
                              dangerouslySetInnerHTML={{ __html: viewDetail.description }}
                            />
                          )}

                          {/* Quick action to add step verses to this subcategory */}
                          {(viewDetail.isSubcategory || viewDetail.parentId) && (
                            <div className="pt-3">
                              <button
                                type="button"
                                onClick={() => handleOpenCreateType(viewDetail.id)}
                                className="px-3.5 py-1.5 bg-[#FFB300]/10 hover:bg-[#FFB300]/20 text-[#FFB300] border border-[#FFB300]/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add First Chanting Step to this Subcategory</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Sacred Lotus Filigree Finish */}
                      <div className="flex justify-center pt-4">
                        <svg className="w-16 h-8 text-[#FFB300] opacity-80 transform rotate-180" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>

                    </div>
                  </div>
                </div>

                {/* RIGHT: Sanctum Specifications & Step Sequence Console (Green & Gold) */}
                <div className="lg:col-span-5 space-y-5">

                  {/* Specifications Card */}
                  <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#16422F]">
                      <h3 className="text-sm font-bold text-[#FFB300] flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#FFB300]" />
                        <span>Sanctum Specifications</span>
                      </h3>
                      <span className="text-xs text-[#FFB300] font-mono font-bold bg-[#061A13] px-2 py-0.5 rounded border border-[#16422F]">
                        ID: #{viewDetail.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                        <span className="text-[10px] text-gray-400 uppercase block font-semibold">Parent Category</span>
                        <span className="text-gray-100 font-medium">
                          {viewDetail.parentTitle || viewDetail.parentSlug || 'Pooja Vidhanam (#113)'}
                        </span>
                      </div>
                      <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                        <span className="text-[10px] text-gray-400 uppercase block font-semibold">Total Steps / Types</span>
                        <span className="text-[#FFB300] font-bold">
                          {viewDetail.contents?.length || 0} Sacred Steps
                        </span>
                      </div>
                      <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                        <span className="text-[10px] text-gray-400 uppercase block font-semibold">URL Identifier</span>
                        <span className="text-[#FFB300] font-mono">/{viewDetail.slug}</span>
                      </div>
                      <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                        <span className="text-[10px] text-gray-400 uppercase block font-semibold">Content Format</span>
                        <span className="text-emerald-400 font-medium">
                          {viewDetail.isAudio ? '🎵 Audio Chanting' : '📜 Vidhanam Text'}
                        </span>
                      </div>
                    </div>

                    {/* Subcategory Artwork Image Preview */}
                    {viewDetail.imageUrl && (
                      <div className="bg-[#061A13] border border-[#16422F] rounded-lg p-3 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#D4AF37]/50 flex-shrink-0 bg-neutral-900 flex items-center justify-center">
                          <img
                            src={viewDetail.imageUrl.startsWith('http') || viewDetail.imageUrl.startsWith('data:')
                              ? viewDetail.imageUrl
                              : `${API_ORIGIN}${viewDetail.imageUrl.startsWith('/') ? '' : '/'}${viewDetail.imageUrl}`}
                            alt={viewDetail.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sanctum Artwork</span>
                          <p className="text-xs font-semibold text-gray-200 truncate">{viewDetail.title}</p>
                          <p className="text-[10px] text-gray-400 font-mono truncate">{viewDetail.imageUrl}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Language Database Translations */}
                  {viewDetail.translations && viewDetail.translations.length > 0 && (
                    <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-3">
                      <span className="text-xs font-bold text-[#FFB300] uppercase tracking-wide block">
                        Database Multi-Language Translations ({viewDetail.translations.length})
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {viewDetail.translations.map((tr) => (
                          <div key={tr.code} className="p-2.5 rounded-lg bg-[#061A13] border border-[#16422F] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#FFB300] uppercase text-[10px]">{tr.name || tr.code}</span>
                              <span className="font-mono text-gray-500 text-[9px]">{tr.code}</span>
                            </div>
                            <div className="font-semibold text-gray-200 text-xs truncate">{tr.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subcategory Types & Stotras Cards (Matches website layout with 4 types) */}
                  {viewDetail.contents && viewDetail.contents.length > 0 && (
                    <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                        <span className="text-xs font-bold text-[#FFB300] uppercase tracking-wide flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                          <span>{viewDetail.title} Types &amp; Stotras ({viewDetail.contents.length})</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">Select card to view detail</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {viewDetail.contents.map((typeItem, tIdx) => {
                          const isSelected = activeViewTypeTab === tIdx;
                          return (
                            <div
                              key={typeItem.id || tIdx}
                              onClick={() => setActiveViewTypeTab(tIdx)}
                              className={`rounded-xl border p-3.5 cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-md flex flex-col justify-between gap-3 ${isSelected
                                  ? 'bg-[#0A3324] border-[#FFB300] shadow-[0_0_15px_rgba(255,179,0,0.2)]'
                                  : 'bg-[#061A13] border-[#16422F] hover:border-[#FFB300]/60'
                                }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="px-1.5 py-0.5 rounded bg-[#FFB300] text-[#071C14] text-[10px] font-black font-mono">
                                    #{tIdx + 1}
                                  </span>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0E2F23] border border-[#16422F] text-amber-300 font-medium">
                                    Devotional Type
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-gray-100 line-clamp-1">
                                  {typeItem.title}
                                </h4>
                                <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                                  {typeItem.meaning || typeItem.sacredText || 'Sacred devotional recitation.'}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-[#16422F]/60 flex items-center justify-between text-[11px]">
                                <span className={`font-semibold ${isSelected ? 'text-[#FFB300]' : 'text-emerald-400'}`}>
                                  {isSelected ? '✓ Viewing' : 'View Detail'}
                                </span>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#FFB300] text-[#071C14]' : 'bg-[#0E2F23] text-gray-300'
                                  }`}>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Chanting Steps Sequence (Ordered) */}
                  <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">
                        Chanting Sequence &amp; Steps
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenCreateType(viewDetail.id)}
                        className="px-2.5 py-1 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Step</span>
                      </button>
                    </div>

                    {viewDetail.contents && viewDetail.contents.length > 0 ? (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
                        {viewDetail.contents.map((step, idx) => (
                          <div
                            key={step.id || idx}
                            className="bg-[#061A13] p-3 rounded-lg border border-[#16422F] hover:border-[#FFB300]/40 transition flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[#FFB300] font-bold text-[10px]">#{idx + 1}</span>
                                <span className="font-semibold text-gray-100 truncate">{step.title}</span>
                              </div>
                              {step.sacredText && (
                                <p className="text-gray-400 text-[11px] truncate mt-0.5">{step.sacredText}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditType(step as any)}
                                className="p-1.5 hover:bg-[#0E2F23] rounded text-[#FFB300] transition"
                                title="Edit this Step / Verse"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400 bg-[#061A13] rounded-lg border border-[#16422F]">
                        <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#FFB300] opacity-60" />
                        <p className="font-semibold text-gray-300">No subcategory types / verses attached yet.</p>
                        <p className="text-[11px] text-gray-400 mt-1">Click &quot;+ Add Step&quot; above to create worship steps and recitations under this subcategory.</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* IN-PAGE NORMAL PAGE MODE: CREATE / EDIT CATEGORY (SANCTUM GREEN & GOLD LAYOUT MATCHING VIEW DETAILED) */}
          {pageMode === 'EDIT_CATEGORY' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header: Sanctum Green & Divine Gold */}
              <div className="bg-[#071C14] rounded-xl border border-[#1A4E38] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPageMode('LIST')}
                    className="px-3 py-1.5 rounded-lg bg-[#0D2E21] hover:bg-[#133F2E] text-gray-200 text-xs font-semibold transition flex items-center gap-1.5 border border-[#1E5C41] shadow"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#FFB300]" />
                    <span>Back to Categories</span>
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFB300]" />
                      <span>{editingId ? 'Edit Devotional Category' : 'Create New Devotional Category'}</span>
                    </h3>
                    <p className="text-xs text-emerald-400/80">
                      {editingId ? `Master Category Record #${editingId} — Sanctum Pillar` : 'New Master Category Record'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Language Selector in Edit Category Mode */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#061A13] border border-[#1E5C41] rounded-lg shadow-inner">
                    <Globe className="w-3.5 h-3.5 text-[#FFB300] ml-1.5" />
                    <span className="text-[11px] font-bold text-gray-300 uppercase px-1">Lang:</span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleEditCategoryChangeLang(l.code)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${selectedLang === l.code
                              ? 'bg-[#FFB300] text-[#071C14] font-bold shadow'
                              : 'text-gray-300 hover:text-[#FFB300] hover:bg-[#0D2E21]'
                            }`}
                          title={`Edit ${l.name} (${l.code}) — Dynamically fetched from MySQL via API`}
                        >
                          <span>{l.nativeName || l.name}</span>
                          <span className="text-[10px] opacity-70 uppercase font-mono">({l.code})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPageMode('LIST')}
                    className="px-4 py-2 bg-[#0D2E21] hover:bg-[#133F2E] border border-[#1E5C41] rounded-lg text-gray-200 font-semibold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCategory}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] font-bold text-xs rounded-lg transition shadow-lg shadow-amber-500/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Category to MySQL</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Grid: Left Edit Form & Right Live Devotional Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: Category Input Form */}
                <div className="lg:col-span-7 bg-[#082218] rounded-xl border border-[#1A4E38] p-6 shadow-xl space-y-5 text-xs">
                  {/* Language Status Notice */}
                  {editingId && !formTitle && (
                    <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl flex items-center gap-2 text-xs text-amber-200">
                      <AlertCircle className="w-4 h-4 text-[#FFB300] flex-shrink-0" />
                      <span>
                        No <strong>{languages.find(l => l.code === selectedLang)?.name || selectedLang.toUpperCase()}</strong> translation exists in MariaDB yet. Enter title &amp; description below to create it directly in MySQL.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-300 uppercase mb-1">
                        Category Title ({selectedLang.toUpperCase()}) *
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. శ్రీ అయ్యప్ప శరణు ఘోష"
                        className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 uppercase mb-1">
                        URL Identifier (Slug) *
                      </label>
                      <input
                        type="text"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="e.g. daily-pooja"
                        className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg px-3 py-2 text-[#FFB300] font-mono focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-300 uppercase mb-1">Content Type</label>
                    <select
                      value={formIsAudio ? 'true' : 'false'}
                      onChange={(e) => setFormIsAudio(e.target.value === 'true')}
                      className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg px-3 py-2 text-[#FEF08A] font-medium focus:outline-none focus:border-[#FFB300]"
                    >
                      <option value="false">Text &amp; Devotional Slokas (Readable)</option>
                      <option value="true">Audio Track (Sing-along &amp; Chant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-300 uppercase mb-1 flex items-center justify-between">
                      <span>Description (Rich Text &amp; Formatted Notes)</span>
                      <span className="text-[#FFB300] font-mono text-[10px]">Rich Text Mode</span>
                    </label>
                    <RichTextEditor
                      value={formDescription}
                      onChange={(val) => setFormDescription(val)}
                      placeholder="Brief spiritual summary of this sacred section..."
                      minHeight="180px"
                      hideTemplateBtn={true}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1E5C41]">
                    <button
                      type="button"
                      onClick={() => openTranslationModal('categories', editingId || undefined, [
                        { key: 'title', label: 'Category Title', value: formTitle },
                        { key: 'description', label: 'Description', value: formDescription, isHtml: true }
                      ], (trans, lang) => {
                        if (trans.title) setFormTitle(trans.title);
                        if (trans.description) setFormDescription(trans.description);
                        if (lang) setSelectedLang(lang);
                      })}
                      className="bg-[#FFB300]/15 hover:bg-[#FFB300]/25 text-[#FFB300] border border-[#FFB300]/40 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                      <span>✨ Translate (v3)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPageMode('LIST')}
                        className="px-4 py-2 bg-[#0D2E21] hover:bg-[#133F2E] border border-[#1E5C41] rounded-lg text-gray-200 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCategory}
                        className="bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] px-5 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-amber-500/20"
                      >
                        Save Category to MySQL
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Live Category Devotional Card Preview */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="font-bold text-[#FFB300] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📜</span>
                      <span>Category Card Preview</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">Real-time Portal Card</span>
                  </div>

                  <div className="w-full rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_12px_45px_rgba(0,0,0,0.6),0_0_25px_rgba(212,175,55,0.15)] bg-[#071F17]">
                    <div className="bg-[#0A2A1E] text-[#FFB300] border-b border-[#1E5C41] px-4 py-2.5 flex items-center justify-between shadow">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">🪔</span>
                        <span className="font-bold text-xs tracking-wide text-[#FFB300] truncate">
                          {formTitle || 'Category Title'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#071C14] border border-[#1E5C41] text-emerald-400">
                        /{formSlug || 'slug'}
                      </span>
                    </div>

                    <div className="bg-gradient-to-b from-[#082218] via-[#0A291E] to-[#071D15] p-5 text-center text-xs leading-relaxed max-h-[500px] overflow-y-auto space-y-4">
                      <div className="flex justify-center pt-1">
                        <svg className="w-12 h-6 text-[#FFB300] opacity-80" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>

                      <div className="space-y-0.5 text-xs font-semibold text-[#FDE68A]">
                        <p>śrī mahāgaṇādhipatayē namaḥ</p>
                        <p>śrī gurubhyō namaḥ</p>
                        <p className="font-bold text-[#FFB300]">hariḥ ōṁ</p>
                      </div>

                      <div className="border-b border-dotted border-[#D4AF37]/40 w-3/4 mx-auto my-2"></div>

                      <h4 className="text-base font-bold text-[#FFB300] tracking-wide">
                        {formTitle || 'Master Devotional Category'}
                      </h4>

                      {formDescription ? (
                        <div
                          className="p-3 bg-[#061A13]/90 rounded-xl border border-[#1B563D] text-left text-xs font-serif leading-relaxed text-[#FEF08A] whitespace-pre-wrap max-h-60 overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: formDescription }}
                        />
                      ) : (
                        <p className="text-[11px] italic text-emerald-400/60 p-3 bg-[#061A13]/50 rounded-xl border border-dashed border-[#1B563D]">
                          Enter Category Description on the left to preview...
                        </p>
                      )}

                      <div className="flex justify-center pt-2">
                        <svg className="w-12 h-6 text-[#FFB300] opacity-80 transform rotate-180" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-4 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                      <h4 className="text-xs font-bold text-[#FFB300] flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#FFB300]" />
                        <span>Category Specifications</span>
                      </h4>
                      <span className="text-[10px] text-[#FFB300] font-mono font-bold bg-[#061A13] px-2 py-0.5 rounded border border-[#16422F]">
                        {editingId ? `Editing #${editingId}` : 'New Category'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-[#061A13] p-2.5 rounded-lg border border-[#16422F]">
                        <span className="text-[9px] text-gray-400 uppercase block font-semibold">Content Format</span>
                        <span className="text-emerald-400 font-medium">{formIsAudio ? '🎵 Audio Track' : '📜 Sacred Text'}</span>
                      </div>
                      <div className="bg-[#061A13] p-2.5 rounded-lg border border-[#16422F]">
                        <span className="text-[9px] text-gray-400 uppercase block font-semibold">URL Identifier</span>
                        <span className="text-[#FFB300] font-mono truncate block">/{formSlug || 'slug'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IN-PAGE NORMAL PAGE MODE: CREATE / EDIT SUBCATEGORY (SANCTUM GREEN & GOLD LAYOUT MATCHING VIEW DETAILED) */}
          {pageMode === 'EDIT_SUBCATEGORY' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header: Sanctum Green & Divine Gold */}
              <div className="bg-[#071C14] rounded-xl border border-[#1A4E38] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPageMode('LIST');
                      setViewDetail(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0D2E21] hover:bg-[#133F2E] text-gray-200 text-xs font-semibold transition flex items-center gap-1.5 border border-[#1E5C41] shadow"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#FFB300]" />
                    <span>Back to List</span>
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFB300]" />
                      <span>{editingSubId ? 'Edit Devotional Subcategory Sanctum Details' : 'Create Devotional Subcategory'}</span>
                    </h3>
                    <p className="text-xs text-emerald-400/80">
                      {editingSubId ? `Subcategory Record #${editingSubId} — Live Sanctum Worship Flow` : 'New Sacred Subcategory Record'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Language Selector in Edit Subcategory Mode */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#061A13] border border-[#1E5C41] rounded-lg shadow-inner">
                    <Globe className="w-3.5 h-3.5 text-[#FFB300] ml-1.5" />
                    <span className="text-[11px] font-bold text-gray-300 uppercase px-1">DB Lang:</span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleEditSubcategoryChangeLang(l.code)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${selectedLang === l.code
                              ? 'bg-[#FFB300] text-[#071C14] font-bold shadow'
                              : 'text-gray-300 hover:text-[#FFB300] hover:bg-[#0D2E21]'
                            }`}
                          title={`Edit ${l.name} (${l.code}) — Dynamically fetched from MySQL via API`}
                        >
                          <span>{l.nativeName || l.name}</span>
                          <span className="text-[10px] opacity-70 uppercase font-mono">({l.code})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPageMode('LIST');
                      setViewDetail(null);
                    }}
                    className="px-4 py-2 bg-[#0D2E21] hover:bg-[#133F2E] border border-[#1E5C41] rounded-lg text-gray-200 font-semibold text-xs transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSubcategory}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] font-bold text-xs rounded-lg transition shadow-lg shadow-amber-500/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Subcategory to MySQL</span>
                  </button>
                </div>
              </div>

              {/* Exact View Detailed 2-Column Grid: Left Sacred Scroll Reader & Right Sanctum Console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: Sacred Devotional Reader (Authentic Green & Gold Scroll) */}
                <div className="lg:col-span-7 flex flex-col items-center">

                  {/* TYPE TABS / SELECTOR: Allows toggling between All Sacred Types or viewing a specific Type */}
                  {viewDetail?.contents && viewDetail.contents.length > 0 && (
                    <div className="w-full mb-4 bg-[#082218] border border-[#1A4E38] rounded-xl p-3 shadow-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FFB300] uppercase tracking-wider flex items-center gap-1.5">
                          <span>✨</span>
                          <span>{subFormTitle || viewDetail.title} Types ({viewDetail.contents.length})</span>
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {activeViewTypeTab === 'all'
                            ? 'Showing: Complete Chanting Sequence'
                            : `Showing Type #${(typeof activeViewTypeTab === 'number' ? activeViewTypeTab : 0) + 1} of ${viewDetail.contents.length}`}
                        </span>
                      </div>

                      {/* Interactive Horizontal Scrollable Type Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveViewTypeTab('all')}
                          className={`p-2 rounded-lg text-left transition border flex flex-col justify-between gap-1 ${activeViewTypeTab === 'all'
                              ? 'bg-[#FFB300] text-[#071C14] border-[#FFB300] font-bold shadow-md'
                              : 'bg-[#061A13] text-gray-300 border-[#16422F] hover:border-[#FFB300]/50'
                            }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-mono uppercase">Full Flow</span>
                            <span className="text-[9px] px-1 rounded bg-black/20">All</span>
                          </div>
                          <span className="truncate text-xs font-semibold">All {viewDetail.contents.length} Types</span>
                        </button>

                        {viewDetail.contents.map((step, idx) => (
                          <button
                            key={step.id || idx}
                            type="button"
                            onClick={() => setActiveViewTypeTab(idx)}
                            className={`p-2 rounded-lg text-left transition border flex flex-col justify-between gap-1 ${activeViewTypeTab === idx
                                ? 'bg-[#FFB300] text-[#071C14] border-[#FFB300] font-bold shadow-md'
                                : 'bg-[#061A13] text-gray-300 border-[#16422F] hover:border-[#FFB300]/50'
                              }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-mono font-bold">#{idx + 1}</span>
                              <span className="text-[9px] px-1 rounded bg-black/20">Type</span>
                            </div>
                            <span className="truncate text-xs font-semibold">{step.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
                    <span className="font-bold text-[#FFB300] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📜</span>
                      <span>Devotional Reader View</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#061A13] border border-[#16422F] text-[#FEF08A] font-mono text-[10px]">
                        {languages.find(l => l.code === selectedLang)?.name || selectedLang.toUpperCase()}
                      </span>
                    </span>
                    <span className="text-[11px] text-emerald-400/90 font-mono">
                      {viewDetail?.contents && viewDetail.contents.length > 0
                        ? activeViewTypeTab === 'all'
                          ? `${viewDetail.contents.length} Ordered Steps`
                          : `Type #${(typeof activeViewTypeTab === 'number' ? activeViewTypeTab : 0) + 1} / ${viewDetail.contents.length}`
                        : 'Single Sacred Composition'}
                    </span>
                  </div>

                  {/* Sacred Scroll Outer Container */}
                  <div className="w-full max-w-lg rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_12px_45px_rgba(0,0,0,0.6),0_0_25px_rgba(212,175,55,0.15)] bg-[#071F17]">

                    {/* Top Sanctum Header */}
                    <div className="bg-[#0A2A1E] text-[#FFB300] border-b border-[#1E5C41] px-5 py-3 flex items-center justify-between shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪔</span>
                        <span className="font-bold text-sm tracking-wide text-[#FFB300] truncate max-w-xs">
                          {activeViewTypeTab !== 'all' && typeof activeViewTypeTab === 'number' && viewDetail?.contents?.[activeViewTypeTab]
                            ? viewDetail.contents[activeViewTypeTab].title
                            : (subFormTitle || viewDetail?.title || 'Subcategory')}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#071C14] border border-[#1E5C41] text-emerald-400">
                        /{activeViewTypeTab !== 'all' && typeof activeViewTypeTab === 'number' && (viewDetail?.contents?.[activeViewTypeTab] as any)?.slug
                          ? (viewDetail?.contents?.[activeViewTypeTab] as any).slug
                          : (subFormSlug || viewDetail?.slug || 'slug')}
                      </span>
                    </div>

                    {/* Scroll Canvas with Sanctum Green & Divine Gold Typography */}
                    <div className="bg-gradient-to-b from-[#082218] via-[#0A291E] to-[#071D15] p-6 text-center text-xs leading-relaxed max-h-[760px] overflow-y-auto space-y-5">

                      {/* Top Sacred Arch Motif in Gold */}
                      <div className="flex justify-center pt-2">
                        <svg className="w-16 h-8 text-[#FFB300] opacity-80" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>

                      {/* Invocations */}
                      <div className="space-y-1 text-sm font-semibold text-[#FDE68A]">
                        <p>śrī mahāgaṇādhipatayē namaḥ</p>
                        <p>śrī gurubhyō namaḥ</p>
                        <p className="font-bold text-[#FFB300]">hariḥ ōṁ</p>
                      </div>

                      <div className="border-b border-dotted border-[#D4AF37]/40 w-3/4 mx-auto my-3"></div>

                      {/* Editable Sacred Notes & Full Lyrics Area */}
                      <div className="p-3.5 bg-[#061A13]/90 rounded-xl border border-[#1B563D] text-left max-w-md mx-auto space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-[#FFB300] tracking-wider block">
                            Sacred Notes / Procedure Description / Full Lyrics
                          </span>
                          <span className="text-[9px] text-emerald-400 font-mono">Editable</span>
                        </div>
                        <RichTextEditor
                          value={subFormDescription}
                          onChange={(val) => setSubFormDescription(val)}
                          placeholder="Enter full step-by-step procedure, sankalpam, or chapter text..."
                          minHeight="140px"
                          hideTemplateBtn={true}
                        />
                      </div>

                      {/* Attached Devotional Types / Verses (Full Flow Chanting Sequence) */}
                      {viewDetail?.contents && viewDetail.contents.length > 0 && (
                        <div className="space-y-6 pt-2">
                          {(activeViewTypeTab === 'all'
                            ? viewDetail.contents
                            : [viewDetail.contents[typeof activeViewTypeTab === 'number' ? activeViewTypeTab : 0]]
                          ).map((v, idx) => (
                            <div key={v.id || idx} className="space-y-2.5">
                              <h4 className="text-sm font-bold text-[#FFB300] tracking-wide uppercase flex items-center justify-center gap-1.5">
                                <span>{v.title}</span>
                              </h4>

                              {v.sacredText && (
                                <div className="text-sm font-bold text-[#FEF08A] font-serif leading-relaxed whitespace-pre-wrap max-w-md mx-auto py-1">
                                  {v.sacredText}
                                </div>
                              )}

                              {v.meaning && (
                                <div className="text-xs italic text-[#A7F3D0] bg-[#061A13]/90 border border-[#1B563D] p-2.5 rounded-lg max-w-md mx-auto text-center leading-relaxed">
                                  {v.meaning}
                                </div>
                              )}

                              {activeViewTypeTab === 'all' && idx < (viewDetail?.contents?.length || 0) - 1 && (
                                <div className="border-b border-dotted border-[#D4AF37]/35 w-3/4 mx-auto pt-4"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bottom Sacred Lotus Filigree Finish */}
                      <div className="flex justify-center pt-4">
                        <svg className="w-16 h-8 text-[#FFB300] opacity-80 transform rotate-180" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>

                    </div>
                  </div>
                </div>

                {/* RIGHT: Sanctum Specifications & 4-Cards Console */}
                <div className="lg:col-span-5 space-y-5">

                  {/* Card 1: Sanctum Specifications */}
                  <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#16422F]">
                      <h3 className="text-sm font-bold text-[#FFB300] flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#FFB300]" />
                        <span>Sanctum Specifications</span>
                      </h3>
                      <span className="text-xs text-[#FFB300] font-mono font-bold bg-[#061A13] px-2 py-0.5 rounded border border-[#16422F]">
                        ID: #{editingSubId || 'New'}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Parent Category & Total Steps */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                          <label className="text-[10px] text-gray-400 uppercase block font-semibold mb-1">Parent Category *</label>
                          <select
                            value={subFormParentId}
                            onChange={(e) => setSubFormParentId(Number(e.target.value))}
                            className="w-full bg-[#071C14] border border-[#1E5C41] rounded px-2.5 py-1.5 text-xs text-[#FEF08A] font-medium focus:outline-none focus:border-[#FFB300]"
                          >
                            <option value="">-- Choose Parent --</option>
                            {parentLookupList.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.parentId ? `└── ${p.title}` : p.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                          <span className="text-[10px] text-gray-400 uppercase block font-semibold mb-1">Total Steps / Types</span>
                          <span className="text-[#FFB300] font-bold text-xs block pt-1.5">
                            {viewDetail?.contents?.length || 0} Sacred Steps
                          </span>
                        </div>
                      </div>

                      {/* Subcategory Title & URL Identifier */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                          <label className="text-[10px] text-gray-400 uppercase block font-semibold mb-1">
                            Title ({selectedLang.toUpperCase()}) *
                          </label>
                          <input
                            type="text"
                            value={subFormTitle}
                            onChange={(e) => setSubFormTitle(e.target.value)}
                            placeholder="e.g. Ayyappa Pooja Vidhanam"
                            className="w-full bg-[#071C14] border border-[#1E5C41] rounded px-2.5 py-1.5 text-xs text-gray-100 font-semibold focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                        <div className="bg-[#061A13] p-3 rounded-lg border border-[#16422F]">
                          <label className="text-[10px] text-gray-400 uppercase block font-semibold mb-1">
                            URL Identifier *
                          </label>
                          <input
                            type="text"
                            value={subFormSlug}
                            onChange={(e) => setSubFormSlug(e.target.value)}
                            placeholder="ayyappa-padi-pooja"
                            className="w-full bg-[#071C14] border border-[#1E5C41] rounded px-2.5 py-1.5 text-xs text-[#FFB300] font-mono focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                      </div>

                      {/* Sanctum Artwork */}
                      <div className="bg-[#061A13] border border-[#16422F] rounded-lg p-3 flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#D4AF37]/50 flex-shrink-0 bg-neutral-900 flex items-center justify-center">
                          {subFormImageUrl ? (
                            <img
                              src={subFormImageUrl.startsWith('http') || subFormImageUrl.startsWith('data:')
                                ? subFormImageUrl
                                : `${API_ORIGIN}${subFormImageUrl.startsWith('/') ? '' : '/'}${subFormImageUrl}`}
                              alt={subFormTitle}
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-xl">🪔</span>
                          )}
                        </div>
                        <div className="flex-1 w-full space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sanctum Artwork</span>
                            <div className="flex items-center gap-1.5">
                              <label className="px-2 py-0.5 bg-[#0D2E21] hover:bg-[#133F2E] text-[#FFB300] rounded cursor-pointer border border-[#1E5C41] text-[10px] font-semibold flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                <span>Upload</span>
                                <input type="file" accept="image/*" onChange={handleSubcategoryImageUpload} className="hidden" />
                              </label>
                              {subFormImageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setSubFormImageUrl('')}
                                  className="px-1.5 py-0.5 bg-red-950/40 text-red-400 hover:text-red-300 rounded text-[10px] border border-red-900/30"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="Artwork URL"
                            value={subFormImageUrl}
                            onChange={(e) => setSubFormImageUrl(e.target.value)}
                            className="w-full bg-[#071C14] border border-[#1E5C41] rounded px-2 py-1 text-[11px] text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#16422F]">
                        <button
                          type="button"
                          onClick={() => {
                            setPageMode('LIST');
                            setViewDetail(null);
                          }}
                          className="px-3.5 py-1.5 bg-[#0D2E21] hover:bg-[#133F2E] border border-[#1E5C41] rounded-lg text-gray-200 text-xs font-semibold transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveSubcategory}
                          className="px-4 py-1.5 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] rounded-lg text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Subcategory to MySQL</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Database Multi-Language Translations */}
                  <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                      <span className="text-xs font-bold text-[#FFB300] uppercase tracking-wide">
                        Database Multi-Language Translations ({viewDetail?.translations?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => openTranslationModal('categories', editingSubId || undefined, [
                          { key: 'title', label: 'Subcategory Title', value: subFormTitle },
                          { key: 'description', label: 'Sacred Notes', value: subFormDescription, isHtml: true }
                        ], (trans, lang) => {
                          if (trans.title) setSubFormTitle(trans.title);
                          if (trans.description) setSubFormDescription(trans.description);
                          if (lang) setSelectedLang(lang);
                        })}
                        className="bg-[#FFB300]/15 hover:bg-[#FFB300]/25 text-[#FFB300] border border-[#FFB300]/40 px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-[#FFB300]" />
                        <span>✨ Translate (v3)</span>
                      </button>
                    </div>

                    {viewDetail?.translations && viewDetail.translations.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {viewDetail.translations.map((tr) => (
                          <div
                            key={tr.code}
                            onClick={() => handleEditSubcategoryChangeLang(tr.code)}
                            className={`p-2.5 rounded-lg border space-y-0.5 cursor-pointer transition ${selectedLang === tr.code
                                ? 'bg-[#0A3324] border-[#FFB300]'
                                : 'bg-[#061A13] border-[#16422F] hover:border-[#FFB300]/50'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#FFB300] uppercase text-[10px]">{tr.name || tr.code}</span>
                              <span className="font-mono text-gray-500 text-[9px]">{tr.code}</span>
                            </div>
                            <div className="font-semibold text-gray-200 text-xs truncate">{tr.title}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-[#061A13] rounded-lg border border-[#16422F] text-center text-xs text-gray-400">
                        No translations in DB yet. Click &quot;✨ Translate (v3)&quot; above to translate.
                      </div>
                    )}
                  </div>

                  {/* Card 3: Subcategory Types & Stotras 4-Card Grid (Exact match with View Detailed) */}
                  {viewDetail?.contents && viewDetail.contents.length > 0 && (
                    <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                        <span className="text-xs font-bold text-[#FFB300] uppercase tracking-wide flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                          <span>{subFormTitle || viewDetail.title} Types &amp; Stotras ({viewDetail.contents.length})</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">Select card to view detail</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {viewDetail.contents.map((typeItem, tIdx) => {
                          const isSelected = activeViewTypeTab === tIdx;
                          return (
                            <div
                              key={typeItem.id || tIdx}
                              onClick={() => setActiveViewTypeTab(tIdx)}
                              className={`rounded-xl border p-3.5 cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-md flex flex-col justify-between gap-3 ${isSelected
                                  ? 'bg-[#0A3324] border-[#FFB300] shadow-[0_0_15px_rgba(255,179,0,0.2)]'
                                  : 'bg-[#061A13] border-[#16422F] hover:border-[#FFB300]/60'
                                }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="px-1.5 py-0.5 rounded bg-[#FFB300] text-[#071C14] text-[10px] font-black font-mono">
                                    #{tIdx + 1}
                                  </span>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0E2F23] border border-[#16422F] text-amber-300 font-medium">
                                    Devotional Type
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-gray-100 line-clamp-1">
                                  {typeItem.title}
                                </h4>
                                <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                                  {typeItem.meaning || typeItem.sacredText || 'Sacred devotional recitation.'}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-[#16422F]/60 flex items-center justify-between text-[11px]">
                                <span className={`font-semibold ${isSelected ? 'text-[#FFB300]' : 'text-emerald-400'}`}>
                                  {isSelected ? '✓ Viewing' : 'View Detail'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditType(typeItem as any);
                                  }}
                                  className="px-2 py-0.5 bg-[#0E2F23] hover:bg-[#154634] text-[#FFB300] rounded text-[10px] font-bold border border-[#1E5C41] flex items-center gap-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Card 4: Chanting Sequence & Steps (Ordered) */}
                  <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">
                        Chanting Sequence &amp; Steps
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenCreateType(editingSubId || viewDetail?.id)}
                        className="px-2.5 py-1 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Step</span>
                      </button>
                    </div>

                    {viewDetail?.contents && viewDetail.contents.length > 0 ? (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
                        {viewDetail.contents.map((step, idx) => (
                          <div
                            key={step.id || idx}
                            className="bg-[#061A13] p-3 rounded-lg border border-[#16422F] hover:border-[#FFB300]/40 transition flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[#FFB300] font-bold text-[10px]">#{idx + 1}</span>
                                <span className="font-semibold text-gray-100 truncate">{step.title}</span>
                              </div>
                              {step.sacredText && (
                                <p className="text-gray-400 text-[11px] truncate mt-0.5">{step.sacredText}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditType(step as any)}
                                className="p-1.5 hover:bg-[#0E2F23] rounded text-[#FFB300] transition"
                                title="Edit this Step / Verse"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400 bg-[#061A13] rounded-lg border border-[#16422F]">
                        <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#FFB300] opacity-60" />
                        <p className="font-semibold text-gray-300">No subcategory types / verses attached yet.</p>
                        <p className="text-[11px] text-gray-400 mt-1">Click &quot;+ Add Step&quot; above to create worship steps and recitations under this subcategory.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* IN-PAGE NORMAL PAGE MODE: CREATE / EDIT SUBCATEGORY TYPE (SANCTUM GREEN & GOLD LAYOUT MATCHING VIEW DETAILED) */}
          {pageMode === 'EDIT_TYPE' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header: Sanctum Green & Divine Gold */}
              <div className="bg-[#071C14] rounded-xl border border-[#1A4E38] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPageMode('LIST')}
                    className="px-3 py-1.5 rounded-lg bg-[#0D2E21] hover:bg-[#133F2E] text-gray-200 text-xs font-semibold transition flex items-center gap-1.5 border border-[#1E5C41] shadow"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#FFB300]" />
                    <span>Back to Types</span>
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#FFB300]" />
                      <span>{editingTypeId ? 'Edit Subcategory Type / Sacred Verse' : 'Create Subcategory Type / Sacred Verse'}</span>
                    </h3>
                    <p className="text-xs text-emerald-400/80">
                      {editingTypeId ? `Type DB Record #${editingTypeId} — Chanting Verse &amp; Spiritual Meaning` : 'New Sacred Chanting Verse Record'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Language Selector in Edit Type Mode */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#061A13] border border-[#1E5C41] rounded-lg shadow-inner">
                    <Globe className="w-3.5 h-3.5 text-[#FFB300] ml-1.5" />
                    <span className="text-[11px] font-bold text-gray-300 uppercase px-1">Lang:</span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleEditTypeChangeLang(l.code)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${selectedLang === l.code
                              ? 'bg-[#FFB300] text-[#071C14] font-bold shadow'
                              : 'text-gray-300 hover:text-[#FFB300] hover:bg-[#0D2E21]'
                            }`}
                          title={`Edit ${l.name} (${l.code}) — Dynamically fetched from MySQL via API`}
                        >
                          <span>{l.nativeName || l.name}</span>
                          <span className="text-[10px] opacity-70 uppercase font-mono">({l.code})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPageMode('LIST')}
                    className="px-4 py-2 bg-[#0D2E21] hover:bg-[#133F2E] border border-[#1E5C41] rounded-lg text-gray-200 font-semibold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveType}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] font-bold text-xs rounded-lg transition shadow-lg shadow-amber-500/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Type to MySQL</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Grid: Left Edit Form & Right Live Devotional Verse Reader Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: Sacred Input Form */}
                <div className="lg:col-span-7 bg-[#082218] rounded-xl border border-[#1A4E38] p-6 shadow-xl space-y-5 text-xs">
                  {/* Language Status Notice */}
                  {editingTypeId && !typeFormTitle && (
                    <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl flex items-center gap-2 text-xs text-amber-200">
                      <AlertCircle className="w-4 h-4 text-[#FFB300] flex-shrink-0" />
                      <span>
                        No <strong>{languages.find(l => l.code === selectedLang)?.name || selectedLang.toUpperCase()}</strong> translation exists in MariaDB yet. Enter chanting verse &amp; meaning below to create it directly in MySQL.
                      </span>
                    </div>
                  )}

                  {/* Cascading Category & Subcategory Assignment */}
                  <div className="bg-[#061A13] p-4 rounded-xl border border-[#1E5C41] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                      <span className="text-[11px] font-bold text-[#FFB300] uppercase tracking-wider flex items-center gap-1.5">
                        <span>📁</span>
                        <span>Assign Category &amp; Target Subcategory</span>
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        Step 1: Parent Category &rarr; Step 2: Subcategory
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary Parent Category Selector */}
                      <div>
                        <label className="block font-bold text-gray-300 uppercase mb-1 flex items-center justify-between">
                          <span>1. Parent Category</span>
                          <span className="text-[10px] text-[#FFB300] font-normal">
                            ({parentLookupList.length > 0 ? parentLookupList.length : 9} categories)
                          </span>
                        </label>
                        <select
                          value={typeFormParentId}
                          onChange={(e) => {
                            const newParent = e.target.value;
                            setTypeFormParentId(newParent);
                            const subPool = allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories;
                            const filtered = newParent === 'all'
                              ? subPool
                              : subPool.filter(s => String(s.parentId) === String(newParent) || String(s.parentSlug) === String(newParent));
                            if (filtered.length > 0) {
                              if (!filtered.some(s => Number(s.id) === Number(typeFormCategoryId))) {
                                setTypeFormCategoryId(Number(filtered[0].id));
                              }
                            } else {
                              setTypeFormCategoryId('');
                            }
                          }}
                          className="w-full bg-[#071C14] border border-[#1E5C41] rounded-lg px-3 py-2 text-[#FEF08A] font-medium focus:outline-none focus:border-[#FFB300]"
                        >
                          <option value="all">-- All Parent Categories ({parentLookupList.length > 0 ? parentLookupList.length : 9}) --</option>
                          {parentLookupList.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.subcategoriesCount ?? 0} subcategories)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Target Subcategory Selector */}
                      <div>
                        <label className="block font-bold text-gray-300 uppercase mb-1 flex items-center justify-between">
                          <span>2. Target Subcategory *</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {(() => {
                              const subPool = allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories;
                              const count = typeFormParentId === 'all'
                                ? subPool.length
                                : subPool.filter(s => String(s.parentId) === String(typeFormParentId) || String(s.parentSlug) === String(typeFormParentId)).length;
                              return `(${count} available)`;
                            })()}
                          </span>
                        </label>
                        <select
                          value={typeFormCategoryId}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setTypeFormCategoryId(val || '');
                            if (val) {
                              const subPool = allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories;
                              const match = subPool.find(s => Number(s.id) === val);
                              if (match && match.parentId) {
                                setTypeFormParentId(match.parentId);
                              }
                            }
                          }}
                          className="w-full bg-[#071C14] border border-[#1E5C41] rounded-lg px-3 py-2 text-[#FEF08A] font-medium focus:outline-none focus:border-[#FFB300]"
                        >
                          <option value="">-- Choose Subcategory (e.g. Ayyappa Pooja, Ganapati Pooja) --</option>
                          {(() => {
                            const subPool = allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories;
                            const filtered = typeFormParentId === 'all'
                              ? subPool
                              : subPool.filter(s => String(s.parentId) === String(typeFormParentId) || String(s.parentSlug) === String(typeFormParentId));
                            return filtered.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.parentTitle ? `${s.parentTitle} ➔ ` : ''}{s.title} (#{s.id})
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-300 uppercase mb-1">
                        Type / Verse Title *
                      </label>
                      <input
                        type="text"
                        value={typeFormTitle}
                        onChange={(e) => setTypeFormTitle(e.target.value)}
                        placeholder="e.g. ధ్యానం / Dhyanam / Sri Rudram"
                        className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 uppercase mb-1">
                        URL Identifier (Slug) *
                      </label>
                      <input
                        type="text"
                        value={typeFormSlug}
                        onChange={(e) => setTypeFormSlug(e.target.value)}
                        placeholder="e.g. dhyanam-mantra"
                        className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg px-3 py-2 text-[#FFB300] font-mono focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#FFB300] uppercase mb-1">
                      Sacred Chanting / Sanskrit / Telugu Mantras (Recitation Text)
                    </label>
                    <textarea
                      rows={4}
                      value={typeFormSacredText}
                      onChange={(e) => setTypeFormSacredText(e.target.value)}
                      placeholder="ఓం శ్రీ స్వామియే శరణం అయ్యప్ప..."
                      className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg p-3 text-[#FEF08A] font-serif leading-relaxed text-xs focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-400 uppercase mb-1">
                      Spiritual Meaning / Ritual Commentary / Benefits
                    </label>
                    <textarea
                      rows={3}
                      value={typeFormMeaning}
                      onChange={(e) => setTypeFormMeaning(e.target.value)}
                      placeholder="Enter the spiritual meaning and significance of this ritual step..."
                      className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg p-3 text-emerald-200 text-xs focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-300 uppercase mb-1">Display Order</label>
                      <input
                        type="number"
                        value={typeFormDisplayOrder}
                        onChange={(e) => setTypeFormDisplayOrder(Number(e.target.value))}
                        className="w-full bg-[#061A13] border border-[#1E5C41] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="typeFormPublished"
                        checked={typeFormIsPublished}
                        onChange={(e) => setTypeFormIsPublished(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#061A13] border-[#1E5C41] text-[#FFB300] focus:ring-[#FFB300]"
                      />
                      <label htmlFor="typeFormPublished" className="text-gray-300 font-semibold cursor-pointer">
                        Published and Active in Devotional App
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1E5C41]">
                    <button
                      type="button"
                      onClick={() => openTranslationModal('devotional_contents', editingTypeId || undefined, [
                        { key: 'title', label: 'Type Title', value: typeFormTitle },
                        { key: 'sacredText', label: 'Sacred Chant', value: typeFormSacredText },
                        { key: 'meaning', label: 'Meaning', value: typeFormMeaning }
                      ], (trans) => {
                        if (trans.title) setTypeFormTitle(trans.title);
                        if (trans.sacredText) setTypeFormSacredText(trans.sacredText);
                        if (trans.meaning) setTypeFormMeaning(trans.meaning);
                      })}
                      className="bg-[#FFB300]/15 hover:bg-[#FFB300]/25 text-[#FFB300] border border-[#FFB300]/40 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                      <span>✨ Translate (v3)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPageMode('LIST')}
                        className="px-4 py-2 bg-[#0D2E21] hover:bg-[#133F2E] border border-[#1E5C41] rounded-lg text-gray-200 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveType}
                        className="bg-[#FFB300] hover:bg-[#FFA000] text-[#071C14] px-5 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-amber-500/20"
                      >
                        Save Type to MySQL
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Live Devotional Verse Reader Preview */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="font-bold text-[#FFB300] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📜</span>
                      <span>Devotional Verse Preview</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">Live Worship Card</span>
                  </div>

                  {/* Sacred Scroll Outer Container */}
                  <div className="w-full rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_12px_45px_rgba(0,0,0,0.6),0_0_25px_rgba(212,175,55,0.15)] bg-[#071F17]">

                    {/* Header */}
                    <div className="bg-[#0A2A1E] text-[#FFB300] border-b border-[#1E5C41] px-4 py-2.5 flex items-center justify-between shadow">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">🪔</span>
                        <span className="font-bold text-xs tracking-wide text-[#FFB300] truncate">
                          {typeFormTitle || 'Verse / Step Title'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#071C14] border border-[#1E5C41] text-emerald-400">
                        /{typeFormSlug || 'slug'}
                      </span>
                    </div>

                    {/* Scroll Canvas with Sacred Text & Meaning */}
                    <div className="bg-gradient-to-b from-[#082218] via-[#0A291E] to-[#071D15] p-5 text-center text-xs leading-relaxed max-h-[500px] overflow-y-auto space-y-4">

                      {/* Top Sacred Arch */}
                      <div className="flex justify-center pt-1">
                        <svg className="w-12 h-6 text-[#FFB300] opacity-80" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>

                      <div className="space-y-0.5 text-xs font-semibold text-[#FDE68A]">
                        <p>śrī mahāgaṇādhipatayē namaḥ</p>
                        <p>śrī gurubhyō namaḥ</p>
                        <p className="font-bold text-[#FFB300]">hariḥ ōṁ</p>
                      </div>

                      <div className="border-b border-dotted border-[#D4AF37]/40 w-3/4 mx-auto my-2"></div>

                      {/* Step Title in Radiant Gold */}
                      <h4 className="text-sm font-bold text-[#FFB300] tracking-wide uppercase">
                        {typeFormTitle || 'Type / Verse Title'}
                      </h4>

                      {/* Sacred Chanting Verses */}
                      {typeFormSacredText ? (
                        <div className="text-sm font-bold text-[#FEF08A] font-serif leading-relaxed whitespace-pre-wrap max-w-md mx-auto py-2 p-3 bg-[#061A13]/70 rounded-xl border border-[#1B563D]">
                          {typeFormSacredText}
                        </div>
                      ) : (
                        <p className="text-[11px] italic text-emerald-400/60 p-3 bg-[#061A13]/50 rounded-xl border border-dashed border-[#1B563D]">
                          Enter Sacred Sanskrit / Telugu Chant on the left to see live chanting preview...
                        </p>
                      )}

                      {/* Ritual Meaning in Sage Green Box */}
                      {typeFormMeaning ? (
                        <div className="text-xs italic text-[#A7F3D0] bg-[#061A13]/90 border border-[#1B563D] p-3 rounded-lg max-w-md mx-auto text-center leading-relaxed">
                          {typeFormMeaning}
                        </div>
                      ) : null}

                      {/* Bottom Sacred Lotus */}
                      <div className="flex justify-center pt-2">
                        <svg className="w-12 h-6 text-[#FFB300] opacity-80 transform rotate-180" viewBox="0 0 100 40" fill="currentColor">
                          <path d="M50 0 C40 15, 20 20, 0 20 C20 25, 45 35, 50 40 C55 35, 80 25, 100 20 C80 20, 60 15, 50 0 Z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Card */}
                  <div className="bg-[#082219] border border-[#1A4E38] rounded-xl p-4 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#16422F]">
                      <h4 className="text-xs font-bold text-[#FFB300] flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#FFB300]" />
                        <span>Type Attributes</span>
                      </h4>
                      <span className="text-[10px] text-[#FFB300] font-mono font-bold bg-[#061A13] px-2 py-0.5 rounded border border-[#16422F]">
                        {editingTypeId ? `Editing #${editingTypeId}` : 'New Record'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-[#061A13] p-2.5 rounded-lg border border-[#16422F]">
                        <span className="text-[9px] text-gray-400 uppercase block font-semibold">Target Subcategory</span>
                        <span className="text-[#FEF08A] font-medium truncate block">
                          {(() => {
                            const subPool = allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories;
                            const match = subPool.find(s => Number(s.id) === Number(typeFormCategoryId));
                            return match ? match.title : 'Not Assigned';
                          })()}
                        </span>
                      </div>
                      <div className="bg-[#061A13] p-2.5 rounded-lg border border-[#16422F]">
                        <span className="text-[9px] text-gray-400 uppercase block font-semibold">Display Order</span>
                        <span className="text-[#FFB300] font-bold block">Step #{typeFormDisplayOrder || 1}</span>
                      </div>
                      <div className="bg-[#061A13] p-2.5 rounded-lg border border-[#16422F]">
                        <span className="text-[9px] text-gray-400 uppercase block font-semibold">URL Identifier</span>
                        <span className="text-[#FFB300] font-mono truncate block">/{typeFormSlug || 'slug'}</span>
                      </div>
                      <div className="bg-[#061A13] p-2.5 rounded-lg border border-[#16422F]">
                        <span className="text-[9px] text-gray-400 uppercase block font-semibold">Status</span>
                        <span className={`font-semibold block ${typeFormIsPublished ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {typeFormIsPublished ? '✓ Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NORMAL LIST MODE: CATEGORIES, SUBCATEGORIES, TYPES TABLES */}
          {pageMode === 'LIST' && (
            <>
              {/* TAB 1: CATEGORIES */}
              {activeTab === 'categories' && selectedCategorySubtitle !== 'temples' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden space-y-0">
                  <div className="p-5 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Server Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                        />
                      </div>

                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                      >
                        <option value="en">English (English)</option>
                        <option value="te">Telugu (తెలుగు)</option>
                        <option value="kn">Kannada (ಕನ್ನಡ)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                      </select>

                      <select
                        value={isAudioFilter}
                        onChange={(e) => setIsAudioFilter(e.target.value)}
                        className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#FFB300]"
                      >
                        <option value="">All Types</option>
                        <option value="true">Audio Only</option>
                        <option value="false">Text / Slokas Only</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className="text-xs text-gray-400">
                        Total: <strong className="text-gray-200">{totalCount}</strong> categories
                      </span>
                      <button
                        onClick={handleOpenCreateCategory}
                        className="flex items-center justify-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Category</span>
                      </button>
                    </div>
                  </div>

                  {/* Batch Actions Bar for Categories */}
                  {selectedCategoryIds.length > 0 && (
                    <div className="p-3 px-5 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                        <span><strong>{selectedCategoryIds.length}</strong> categories selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryIds([])}
                          className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs transition"
                        >
                          Deselect All
                        </button>
                        <button
                          type="button"
                          onClick={handleBatchDeleteCategories}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1 shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Selected ({selectedCategoryIds.length})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                      <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#FFB300]" />
                        <span>Querying MySQL via Prisma server-side...</span>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#181818] uppercase tracking-wider text-gray-400 border-b border-[#2C2C2C]">
                          <tr>
                            <th className="px-4 py-3.5 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={categories.length > 0 && categories.every(c => selectedCategoryIds.includes(String(c.id)))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategoryIds(Array.from(new Set([...selectedCategoryIds, ...categories.map(c => String(c.id))])));
                                  } else {
                                    const pageIds = new Set(categories.map(c => String(c.id)));
                                    setSelectedCategoryIds(selectedCategoryIds.filter(id => !pageIds.has(id)));
                                  }
                                }}
                                className="rounded bg-[#121212] border-[#3A3A3A] text-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-3 py-3.5 w-12 text-center">Artwork</th>
                            <th className="px-4 py-3.5">ID</th>
                            <th className="px-6 py-3.5">Category Title &amp; Subtitle ({selectedLang.toUpperCase()})</th>
                            <th className="px-6 py-3.5">Slug</th>
                            <th className="px-6 py-3.5">Subcategories</th>
                            <th className="px-6 py-3.5">Content Type</th>
                            <th className="px-6 py-3.5 text-center font-bold text-amber-400">Options / Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2C2C]">
                          {categories.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                <BookOpen className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                                <p className="text-sm font-semibold">No categories found in database</p>
                                <p className="text-xs text-gray-500 mt-1">Click &quot;Create Category&quot; above to add a new devotional category.</p>
                              </td>
                            </tr>
                          ) : (
                            categories.map((item) => {
                              const catImg = item.imageUrl || item.artwork || '';
                              return (
                                <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                                  <td className="px-4 py-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedCategoryIds.includes(String(item.id))}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedCategoryIds(prev => [...prev, String(item.id)]);
                                        } else {
                                          setSelectedCategoryIds(prev => prev.filter(id => id !== String(item.id)));
                                        }
                                      }}
                                      className="rounded bg-[#121212] border-[#3A3A3A] text-amber-500 focus:ring-amber-500 cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-3 py-4 text-center">
                                    <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#2C2C2C] overflow-hidden flex items-center justify-center mx-auto">
                                      {catImg ? (
                                        <img
                                          src={catImg.startsWith('http') ? catImg : `${API_ORIGIN}${catImg.startsWith('/') ? '' : '/'}${catImg}`}
                                          alt={item.title}
                                          className="w-full h-full object-contain p-1"
                                          onError={(e: any) => {
                                            e.currentTarget.style.display = 'none';
                                            if (e.currentTarget.parentElement) {
                                              e.currentTarget.parentElement.innerHTML = '<span class="text-xs">🪔</span>';
                                            }
                                          }}
                                        />
                                      ) : (
                                        <span className="text-xs">🪔</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 font-mono text-gray-500">#{item.id}</td>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-100 flex items-center gap-2">
                                      <span className="text-orange-400">🪔</span>
                                      <span>{item.title}</span>
                                    </div>
                                    <div className="font-mono text-[11px] text-amber-400/90 mt-0.5">/{item.slug}</div>
                                    {(item.subtitle || item.description) && (
                                      <div className="text-[11px] text-gray-400 truncate max-w-sm mt-0.5" title={item.subtitle || item.description}>
                                        {item.subtitle || item.description}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 font-mono text-amber-400/90">{item.slug}</td>
                                  <td className="px-6 py-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedParentCategoryFilter(String(item.id));
                                        setActiveTab('subcategories');
                                        setPageMode('LIST');
                                        loadSubcategories(1, '', selectedLang, String(item.id));
                                      }}
                                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                                      title="View subcategories under this category"
                                    >
                                      <Layers className="w-3.5 h-3.5" />
                                      <span>{item.subcategoriesCount || 0} subcategories</span>
                                    </button>
                                  </td>
                                  <td className="px-6 py-4">
                                    {item.isAudio ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                        <Music className="w-3 h-3" /> Audio Track
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                        <BookOpen className="w-3 h-3" /> Slokas & Mantras
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                                    <button
                                      onClick={() => handleOpenViewCategory(item.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-sky-400 text-xs font-semibold transition"
                                      title="View Category Details"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>View</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditCategory(item)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400 text-xs font-semibold transition"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(item.id, item.title)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded text-red-400 text-xs font-semibold transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            }))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Categories Pagination Bar */}
                  <div className="p-4 border-t border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151515]">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        Showing page <strong className="text-gray-200">{page}</strong> of <strong className="text-gray-200">{totalPages}</strong> (Total <strong className="text-gray-200">{totalCount}</strong>)
                      </span>
                      <span className="text-neutral-600">|</span>
                      <div className="flex items-center gap-1.5">
                        <span>Rows per page:</span>
                        <select
                          value={15}
                          onChange={(e) => {
                            const newLim = Number(e.target.value);
                            loadCategories(1, searchQuery, selectedLang, isAudioFilter, newLim);
                          }}
                          className="bg-[#121212] border border-[#2C2C2C] rounded px-2 py-1 text-xs text-gray-200"
                        >
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => loadCategories(page - 1, searchQuery, selectedLang, isAudioFilter)}
                        className="px-3 py-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 text-xs text-gray-300 transition flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>
                      <span className="text-xs font-semibold px-2 text-amber-400">{page} / {totalPages}</span>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => loadCategories(page + 1, searchQuery, selectedLang, isAudioFilter)}
                        className="px-3 py-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 text-xs text-gray-300 transition flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SUBCATEGORIES */}
              {activeTab === 'subcategories' && (
                <div className="space-y-6">
                  {/* Category Filter & Subcategory Header */}
                  <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-5 shadow-xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#2C2C2C] pb-4">
                      <div>
                        <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                          <Layers className="w-5 h-5 text-orange-400" />
                          <span>Category-Based Subcategories Management</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Organize and manage sanctum rituals, stotras, prayers, bhajans, darshan, and seva under their respective parent categories.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                          value={selectedLang}
                          onChange={(e) => {
                            setSelectedLang(e.target.value);
                            loadSubcategories(1, searchQuery, e.target.value, selectedParentCategoryFilter);
                            loadParentLookup(e.target.value);
                          }}
                          className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                        >
                          <option value="en">English (English)</option>
                          <option value="te">Telugu (తెలుగు)</option>
                          <option value="kn">Kannada (ಕನ್ನಡ)</option>
                          <option value="ta">Tamil (தமிழ்)</option>
                          <option value="hi">Hindi (हिन्दी)</option>
                        </select>
                        <button
                          onClick={() => handleOpenCreateSubcategory(selectedParentCategoryFilter !== 'all' ? selectedParentCategoryFilter : undefined)}
                          className="flex items-center justify-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950 flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Subcategory</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills with Bulletproof Category Matching */}
                    <div className="pt-4">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
                        Filter by Parent Category ({parentLookupList.length > 0 ? parentLookupList.length : 9} Categories):
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* All Categories Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParentCategoryFilter('all');
                            loadSubcategories(1, searchQuery, selectedLang, 'all');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${selectedParentCategoryFilter === 'all'
                              ? 'bg-[#FFB300] text-black shadow-lg shadow-amber-500/20 font-bold'
                              : 'bg-[#141414] text-gray-300 hover:text-white border border-[#2C2C2C]'
                            }`}
                        >
                          <span>All Categories</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedParentCategoryFilter === 'all' ? 'bg-black/30 text-black' : 'bg-neutral-800 text-gray-400'}`}>
                            {selectedParentCategoryFilter === 'all' ? subTotalCount || subcategories.length : (parentLookupList.reduce((acc, p) => acc + (p.subcategoriesCount || 0), 0) || subcategories.length)}
                          </span>
                        </button>

                        {/* Standard Sanctum Categories with Exact Target Matching */}
                        {[
                          { key: 'pooja', name: 'Pooja Vidhanam', icon: '🪔', targetSlugs: ['pooja-vidhanam', 'poojalu-vrathaalu', 'pooja'], exactId: '113' },
                          { key: 'stotras', name: 'Divine Stotras', icon: '📜', targetSlugs: ['stotras', 'divine-stotras', 'stotramulu', 'slogans-of-sri-ayyappa-swami'], exactId: '114' },
                          { key: 'slokas', name: 'Daily Slokas', icon: '📿', targetSlugs: ['slokas', 'daily-slokas'], exactId: '115' },
                          { key: 'songs', name: 'Bhajans & Songs', icon: '🎵', targetSlugs: ['songs', 'bhajans', 'bhajana-keerthanalu'], exactId: '116' },
                          { key: 'live-streams', name: 'Live Darshan', icon: '📺', targetSlugs: ['live-streams', 'live-darshan'], exactId: '117' },
                          { key: 'panchangam', name: 'Panchangam', icon: '🧭', targetSlugs: ['panchangam'] },
                          { key: 'festivals', name: 'Temple Festivals', icon: '📅', targetSlugs: ['festivals'] },
                          { key: 'temples', name: 'Sacred Temples', icon: '🏛️', targetSlugs: ['temples'] },
                          { key: 'donations', name: 'Annadanam Seva', icon: '🍲', targetSlugs: ['donations', 'annadanam'] },
                        ].map(cat => {
                          const exactMatch = parentLookupList.find(p => cat.exactId && String(p.id) === String(cat.exactId));
                          let matchedParent = exactMatch;
                          if (!matchedParent || (matchedParent.subcategoriesCount || 0) === 0) {
                            const candidates = parentLookupList.filter(p =>
                              (cat.targetSlugs && cat.targetSlugs.includes(p.slug)) ||
                              p.slug === cat.key ||
                              p.slug?.startsWith(cat.key) ||
                              p.title?.toLowerCase().includes(cat.name.toLowerCase()) ||
                              (cat.exactId && String(p.id) === String(cat.exactId))
                            );
                            if (candidates.length > 0) {
                              const active = candidates.find(p => (p.subcategoriesCount || 0) > 0);
                              matchedParent = active || matchedParent || candidates.sort((a, b) => (b.subcategoriesCount || 0) - (a.subcategoriesCount || 0))[0];
                            }
                          }

                          const targetId = matchedParent ? String(matchedParent.id) : (cat.exactId ? String(cat.exactId) : cat.key);
                          const count = matchedParent?.subcategoriesCount ?? 0;
                          const isSelected = selectedParentCategoryFilter === targetId || selectedParentCategoryFilter === cat.key || (matchedParent && (selectedParentCategoryFilter === matchedParent.slug || String(selectedParentCategoryFilter) === String(matchedParent.id)));

                          return (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() => {
                                setSelectedParentCategoryFilter(targetId);
                                loadSubcategories(1, searchQuery, selectedLang, targetId);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${isSelected
                                  ? 'bg-[#FFB300] text-black shadow-lg shadow-amber-500/20 font-bold'
                                  : 'bg-[#141414] text-gray-300 hover:text-white border border-[#2C2C2C]'
                                }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-black/30 text-black' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Subcategories Table Container */}
                  <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-between bg-[#181818]">
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-orange-400" />
                        <span>
                          {selectedParentCategoryFilter === 'all'
                            ? `All Subcategories in System (${subTotalCount || subcategories.length})`
                            : (() => {
                              const foundParent = parentLookupList.find(p => String(p.id) === String(selectedParentCategoryFilter) || p.slug === selectedParentCategoryFilter);
                              const title = foundParent?.title || (selectedParentCategoryFilter === '113' || selectedParentCategoryFilter === 'pooja' ? 'Pooja Vidhanam' : selectedParentCategoryFilter);
                              return `Subcategories under "${title.toUpperCase()}" (${subTotalCount || subcategories.length})`;
                            })()}
                        </span>
                      </span>
                      <button
                        onClick={() => loadSubcategories(subPage, searchQuery, selectedLang, resolveParentId(selectedParentCategoryFilter))}
                        className="text-xs text-gray-400 hover:text-amber-400 flex items-center gap-1 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh List</span>
                      </button>
                    </div>

                    {/* Batch Actions Bar for Subcategories */}
                    {selectedSubcategoryIds.length > 0 && (
                      <div className="p-3 px-5 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                          <span><strong>{selectedSubcategoryIds.length}</strong> subcategories selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSubcategoryIds([])}
                            className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs transition"
                          >
                            Deselect All
                          </button>
                          <button
                            type="button"
                            onClick={handleBatchDeleteSubcategories}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1 shadow"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Selected ({selectedSubcategoryIds.length})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto min-h-[300px]">
                      {(() => {
                        const displayed = subcategories.filter(sub => {
                          if (!searchQuery || searchQuery.trim() === '') return true;
                          const q = searchQuery.toLowerCase().trim();
                          const title = (sub.title || '').toLowerCase();
                          const slug = (sub.slug || '').toLowerCase();
                          const desc = (sub.description || '').toLowerCase();
                          return title.includes(q) || slug.includes(q) || desc.includes(q);
                        });

                        if (displayed.length === 0) {
                          return (
                            <div className="p-12 text-center text-xs text-gray-400">
                              <Layers className="w-8 h-8 mx-auto mb-2 text-gray-600 opacity-60" />
                              <p className="font-semibold text-gray-300">
                                No subcategories found {selectedParentCategoryFilter !== 'all' ? `under "${selectedParentCategoryFilter}"` : ''}.
                              </p>
                              <button
                                onClick={() => handleOpenCreateSubcategory(selectedParentCategoryFilter !== 'all' ? selectedParentCategoryFilter : undefined)}
                                className="mt-3 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded text-xs font-semibold transition"
                              >
                                + Add Subcategory under this Category
                              </button>
                            </div>
                          );
                        }

                        return (
                          <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-[#151515] uppercase text-[11px] text-gray-400 border-b border-[#2C2C2C]">
                              <tr>
                                <th className="px-4 py-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    checked={displayed.length > 0 && displayed.every((s: any) => selectedSubcategoryIds.includes(String(s.id)))}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSubcategoryIds(Array.from(new Set([...selectedSubcategoryIds, ...displayed.map((s: any) => String(s.id))])));
                                      } else {
                                        const pageIds = new Set(displayed.map((s: any) => String(s.id)));
                                        setSelectedSubcategoryIds(selectedSubcategoryIds.filter(id => !pageIds.has(id)));
                                      }
                                    }}
                                    className="rounded bg-[#121212] border-[#3A3A3A] text-amber-500 focus:ring-amber-500 cursor-pointer"
                                  />
                                </th>
                                <th className="px-4 py-3">Image</th>
                                <th className="px-5 py-3">Subcategory Title &amp; Slug</th>
                                <th className="px-5 py-3">Parent Category</th>
                                <th className="px-5 py-3">Type / Format</th>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2C2C2C]">
                              {displayed.map((sub: any) => {
                                const pSlug = sub.parentSlug || sub.parentKey || 'pooja';
                                const rawImg = sub.imageUrl || sub.image || '';
                                const cleanImg = rawImg && !rawImg.includes('.webp') ? rawImg : '';
                                return (
                                  <tr key={sub.id} className="hover:bg-neutral-800/40 transition">
                                    <td className="px-4 py-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedSubcategoryIds.includes(String(sub.id))}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedSubcategoryIds(prev => [...prev, String(sub.id)]);
                                          } else {
                                            setSelectedSubcategoryIds(prev => prev.filter(id => id !== String(sub.id)));
                                          }
                                        }}
                                        className="rounded bg-[#121212] border-[#3A3A3A] text-amber-500 focus:ring-amber-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="relative group/subthumb w-10 h-10 rounded-lg bg-[#141414] border border-[#2C2C2C] overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {cleanImg ? (
                                          <img
                                            src={cleanImg.startsWith('http') || cleanImg.startsWith('data:') ? cleanImg : `${API_ORIGIN}${cleanImg.startsWith('/') ? '' : '/'}${cleanImg}`}
                                            alt={sub.title}
                                            className="w-full h-full object-cover"
                                            onError={(e: any) => {
                                              e.currentTarget.style.display = 'none';
                                              if (e.currentTarget.parentElement) {
                                                e.currentTarget.parentElement.innerHTML = '<span class="text-xs">🪔</span>';
                                              }
                                            }}
                                          />
                                        ) : (
                                          <span className="text-xs">🪔</span>
                                        )}
                                        <label
                                          className="absolute inset-0 bg-black/75 opacity-0 group-hover/subthumb:opacity-100 flex items-center justify-center cursor-pointer transition rounded-lg"
                                          title="Upload / Change Image"
                                        >
                                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                                          <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={(e) => handleQuickSubcategoryImageUpload(sub.id, e)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    </td>

                                    <td className="px-5 py-3">
                                      <p className="font-bold text-gray-100 flex items-center gap-1.5">
                                        <span>{sub.title && sub.title !== sub.slug ? sub.title : sub.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                                      </p>
                                      <p className="font-mono text-[11px] text-amber-400/90 mt-0.5">/{sub.slug}</p>
                                      {sub.description && (
                                        <p className="text-gray-400 text-[11px] truncate max-w-xs mt-0.5" title={sub.description}>
                                          {sub.description}
                                        </p>
                                      )}
                                    </td>

                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-950/50 text-orange-300 border border-orange-800/40">
                                        <span>📁</span>
                                        <span>{sub.parentTitle || pSlug}</span>
                                      </span>
                                    </td>

                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.isAudio
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                                        }`}>
                                        {sub.isAudio ? '🎵 Audio Track' : '📜 Vidhanam / Stotra'}
                                      </span>
                                    </td>

                                    <td className="px-5 py-3 whitespace-nowrap font-mono text-gray-400">
                                      #{sub.displayOrder ?? sub.id}
                                    </td>

                                    <td className="px-5 py-3 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedSubcategoryForTypes(String(sub.id));
                                            setActiveTab('content');
                                            setPageMode('LIST');
                                            loadDevotionalContent(1, '', String(sub.id));
                                          }}
                                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded text-amber-300 transition flex items-center gap-1"
                                          title="Manage Types & Verses under this Subcategory"
                                        >
                                          <BookOpen className="w-3.5 h-3.5" />
                                          <span className="text-[11px] font-semibold">Types</span>
                                        </button>
                                        <button
                                          onClick={() => handleOpenViewSubcategory(sub.id)}
                                          className="p-1.5 bg-[#252525] hover:bg-[#303030] border border-[#3A3A3A] rounded text-sky-400 transition"
                                          title="View Subcategory Details"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenEditSubcategory(sub)}
                                          className="p-1.5 bg-[#252525] hover:bg-[#303030] border border-[#3A3A3A] rounded text-amber-400 transition"
                                          title="Edit Subcategory"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSubcategory(sub.id, sub.title)}
                                          className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded text-red-400 transition"
                                          title="Delete Subcategory"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>

                    {/* Subcategories Pagination Bar */}
                    <div className="p-4 border-t border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151515]">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>
                          Showing page <strong className="text-gray-200">{subPage}</strong> of <strong className="text-gray-200">{subTotalPages}</strong> (Total <strong className="text-gray-200">{subTotalCount || subcategories.length}</strong> subcategories)
                        </span>
                        <span className="text-neutral-600">|</span>
                        <div className="flex items-center gap-1.5">
                          <span>Rows per page:</span>
                          <select
                            value={subLimit}
                            onChange={(e) => {
                              const newLim = Number(e.target.value);
                              setSubLimit(newLim);
                              loadSubcategories(1, searchQuery, selectedLang, selectedParentCategoryFilter, newLim);
                            }}
                            className="bg-[#121212] border border-[#2C2C2C] rounded px-2 py-1 text-xs text-gray-200"
                          >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={subPage <= 1}
                          onClick={() => loadSubcategories(subPage - 1, searchQuery, selectedLang, selectedParentCategoryFilter, subLimit)}
                          className="px-3 py-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 text-xs text-gray-300 transition flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Prev</span>
                        </button>
                        <span className="text-xs font-semibold px-2 text-amber-400">{subPage} / {subTotalPages}</span>
                        <button
                          disabled={subPage >= subTotalPages}
                          onClick={() => loadSubcategories(subPage + 1, searchQuery, selectedLang, selectedParentCategoryFilter, subLimit)}
                          className="px-3 py-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 text-xs text-gray-300 transition flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUBCATEGORY TYPES & SACRED VERSES */}
              {activeTab === 'content' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden space-y-0">
                  <div className="p-5 border-b border-[#2C2C2C] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                        <span>Categories</span>
                        <span>&gt;</span>
                        <span>Subcategories</span>
                        <span>&gt;</span>
                        <span className="text-gray-200">Subcategory Types</span>
                      </div>
                      <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-orange-400" />
                        <span>Subcategory Types &amp; Sacred Verses Management</span>
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Manage worship steps, sacred mantras, chants, and procedures under each subcategory dynamically.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Subcategory:</span>
                        <select
                          value={selectedSubcategoryForTypes}
                          onChange={(e) => {
                            setSelectedSubcategoryForTypes(e.target.value);
                            loadDevotionalContent(1, searchQuery, e.target.value);
                          }}
                          className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300] max-w-xs truncate"
                        >
                          <option value="all">All Subcategories ({stats?.activeSubcategories ?? (allSubcategoriesList.length || subTotalCount || 134)})</option>
                          {(allSubcategoriesList.length > 0 ? allSubcategoriesList : subcategories).map(s => (
                            <option key={s.id} value={s.id}>
                              {s.parentTitle ? `${s.parentTitle} ➔ ` : ''}{s.title} (/{s.slug})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleOpenCreateType(selectedSubcategoryForTypes !== 'all' ? selectedSubcategoryForTypes : undefined)}
                        className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950 flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Subcategory Type</span>
                      </button>
                    </div>
                  </div>

                  {/* Batch Actions Bar for Types */}
                  {selectedTypeIds.length > 0 && (
                    <div className="p-3 px-5 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                        <span><strong>{selectedTypeIds.length}</strong> types selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTypeIds([])}
                          className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs transition"
                        >
                          Deselect All
                        </button>
                        <button
                          type="button"
                          onClick={handleBatchDeleteTypes}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1 shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Selected ({selectedTypeIds.length})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto min-h-[300px]">
                    {devotionalContent.length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-600 opacity-60" />
                        <p className="font-semibold text-gray-300">No subcategory types or verses found in database.</p>
                        <p className="text-gray-500 mt-1">Click &quot;+ Add Subcategory Type&quot; above to create worship steps and recitations under this subcategory.</p>
                        <button
                          onClick={() => handleOpenCreateType(selectedSubcategoryForTypes !== 'all' ? selectedSubcategoryForTypes : undefined)}
                          className="mt-3 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded text-xs font-semibold transition"
                        >
                          + Add First Subcategory Type
                        </button>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                          <tr>
                            <th className="px-4 py-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={devotionalContent.length > 0 && devotionalContent.every(t => selectedTypeIds.includes(t.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTypeIds(Array.from(new Set([...selectedTypeIds, ...devotionalContent.map(t => t.id)])));
                                  } else {
                                    const pageIds = new Set(devotionalContent.map(t => t.id));
                                    setSelectedTypeIds(selectedTypeIds.filter(id => !pageIds.has(id)));
                                  }
                                }}
                                className="rounded bg-[#121212] border-[#3A3A3A] text-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-6 py-3">Type Title &amp; Slug</th>
                            <th className="px-6 py-3">Subcategory</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Sacred Verse</th>
                            <th className="px-6 py-3">Spiritual Meaning</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2C2C]">
                          {devotionalContent.map(item => (
                            <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedTypeIds.includes(item.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTypeIds(prev => [...prev, item.id]);
                                    } else {
                                      setSelectedTypeIds(prev => prev.filter(id => id !== item.id));
                                    }
                                  }}
                                  className="rounded bg-[#121212] border-[#3A3A3A] text-amber-500 focus:ring-amber-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-4 font-mono text-gray-500">#{item.id}</td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-100">{item.title}</div>
                                <div className="font-mono text-[11px] text-amber-400/90">/{item.slug}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-[11px]">
                                  <span>📁</span>
                                  <span>{item.category?.title || item.category?.slug || `Subcategory #${item.categoryId}`}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.isPublished !== false ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50' : 'bg-amber-950/70 text-amber-300 border border-amber-800/50'}`}>
                                  {item.isPublished !== false ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-amber-300 max-w-xs truncate">{item.sacredText || '—'}</td>
                              <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{item.meaning || '—'}</td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenViewContent(item.id)}
                                    title="View Subcategory Type Details"
                                    className="p-1.5 hover:bg-neutral-700 rounded text-sky-400 transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditType(item)}
                                    title="Edit Subcategory Type"
                                    className="p-1.5 hover:bg-neutral-700 rounded text-amber-400 transition"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteType(item.id, item.title)}
                                    title="Delete Subcategory Type"
                                    className="p-1.5 hover:bg-neutral-700 rounded text-red-400 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Types Pagination Bar */}
                  <div className="p-4 border-t border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151515]">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        Showing page <strong className="text-gray-200">{typePage}</strong> of <strong className="text-gray-200">{typeTotalPages}</strong> (Total <strong className="text-gray-200">{typeTotalCount || devotionalContent.length}</strong> types)
                      </span>
                      <span className="text-neutral-600">|</span>
                      <div className="flex items-center gap-1.5">
                        <span>Rows per page:</span>
                        <select
                          value={typeLimit}
                          onChange={(e) => {
                            const newLim = Number(e.target.value);
                            setTypeLimit(newLim);
                            loadDevotionalContent(1, searchQuery, selectedSubcategoryForTypes, newLim);
                          }}
                          className="bg-[#121212] border border-[#2C2C2C] rounded px-2 py-1 text-xs text-gray-200"
                        >
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={typePage <= 1}
                        onClick={() => loadDevotionalContent(typePage - 1, searchQuery, selectedSubcategoryForTypes, typeLimit)}
                        className="px-3 py-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 text-xs text-gray-300 transition flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>
                      <span className="text-xs font-semibold px-2 text-amber-400">{typePage} / {typeTotalPages}</span>
                      <button
                        disabled={typePage >= typeTotalPages}
                        onClick={() => loadDevotionalContent(typePage + 1, searchQuery, selectedSubcategoryForTypes, typeLimit)}
                        className="px-3 py-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 text-xs text-gray-300 transition flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 4: PANCHANGAM & FESTIVALS */}
          {activeTab === 'panchangam' && (
            <div className="space-y-6">
              {/* Top Controls Bar */}
              <div className="bg-[#1C1C1C] rounded-xl border border-[#FFB300]/30 p-5 shadow-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#2C2C2C] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#FFB300] tracking-wide flex items-center gap-2">
                        <span>Vedic Astronomical Panchangam Directory</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          {panchangamEntries.length} Days in {new Date(panchangamYear, panchangamMonth - 1).toLocaleString('default', { month: 'long' })} {panchangamYear}
                        </span>
                      </h2>
                      <p className="text-xs text-gray-400">
                        High-precision ephemeris engine (Jean Meeus VSOP87 & Lahiri Chitra Paksha) with live MySQL daily override controls.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* City Selector */}
                    <div className="flex items-center gap-1.5 bg-[#141414] border border-[#2C2C2C] rounded-lg px-2.5 py-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <select
                        value={panchangamCity}
                        onChange={(e) => {
                          const c = e.target.value;
                          setPanchangamCity(c);
                          loadPanchangam(c, selectedLang);
                          loadPanchangamEntries(c, panchangamYear, panchangamMonth, selectedLang);
                        }}
                        className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Hyderabad" className="bg-[#181818]">Hyderabad (హైదరాబాద్)</option>
                        <option value="Vijayawada" className="bg-[#181818]">Vijayawada (విజయవాడ)</option>
                        <option value="Visakhapatnam" className="bg-[#181818]">Visakhapatnam (విశాఖపట్నం)</option>
                        <option value="Tirupati" className="bg-[#181818]">Tirupati (తిరుపతి)</option>
                        <option value="Bengaluru" className="bg-[#181818]">Bengaluru (ಬೆಂಗಳೂರು)</option>
                        <option value="Chennai" className="bg-[#181818]">Chennai (சென்னை)</option>
                        <option value="Sabarimala" className="bg-[#181818]">Sabarimala (ശബരിമല)</option>
                      </select>
                    </div>

                    {/* Year Selector */}
                    <select
                      value={panchangamYear}
                      onChange={(e) => {
                        const y = parseInt(e.target.value, 10);
                        setPanchangamYear(y);
                        loadPanchangamEntries(panchangamCity, y, panchangamMonth, selectedLang);
                      }}
                      className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300] cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                        <option key={y} value={y} className="bg-[#181818]">{y}</option>
                      ))}
                    </select>

                    {/* Month Selector */}
                    <select
                      value={panchangamMonth}
                      onChange={(e) => {
                        const m = parseInt(e.target.value, 10);
                        setPanchangamMonth(m);
                        loadPanchangamEntries(panchangamCity, panchangamYear, m, selectedLang);
                      }}
                      className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300] cursor-pointer"
                    >
                      {[
                        { num: 1, name: 'January' },
                        { num: 2, name: 'February' },
                        { num: 3, name: 'March' },
                        { num: 4, name: 'April' },
                        { num: 5, name: 'May' },
                        { num: 6, name: 'June' },
                        { num: 7, name: 'July' },
                        { num: 8, name: 'August' },
                        { num: 9, name: 'September' },
                        { num: 10, name: 'October' },
                        { num: 11, name: 'November' },
                        { num: 12, name: 'December' },
                      ].map(m => (
                        <option key={m.num} value={m.num} className="bg-[#181818]">{m.name}</option>
                      ))}
                    </select>

                    {/* Refresh Button */}
                    <button
                      onClick={() => {
                        loadPanchangam(panchangamCity, selectedLang);
                        loadPanchangamEntries(panchangamCity, panchangamYear, panchangamMonth, selectedLang);
                      }}
                      className="p-2 bg-[#141414] hover:bg-neutral-800 border border-[#2C2C2C] rounded-lg text-gray-400 hover:text-amber-400 transition"
                      title="Reload Ephemeris & Overrides"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Add Override Button */}
                    <button
                      onClick={() => handleOpenCreatePanchangamOverride()}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Override / Add Day</span>
                    </button>
                  </div>
                </div>

                {/* Today's Live Highlight Strip */}
                {livePanchangam && (
                  <div className="mt-4 pt-4 border-t border-[#2C2C2C] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-[#141414] p-2.5 rounded-lg border border-[#2C2C2C]">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Today's Date & Vaaram</span>
                      <strong className="text-gray-100 font-bold block mt-0.5">{livePanchangam.isoDate}</strong>
                      <span className="text-amber-400 font-semibold">{livePanchangam.vaaram}</span>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-lg border border-[#2C2C2C]">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Tithi & End Time</span>
                      <strong className="text-emerald-400 font-bold block mt-0.5">{livePanchangam.tithi}</strong>
                      <span className="text-gray-400 text-[11px]">ends {livePanchangam.tithiEndTime}</span>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-lg border border-[#2C2C2C]">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Nakshatram</span>
                      <strong className="text-sky-400 font-bold block mt-0.5">{livePanchangam.nakshatram}</strong>
                      <span className="text-gray-400 text-[11px] truncate block">{livePanchangam.samvatsaram}</span>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-lg border border-[#2C2C2C]">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Sun & Rahu Timings</span>
                      <strong className="text-amber-300 font-bold block mt-0.5">☀️ {livePanchangam.sunrise} — 🌙 {livePanchangam.sunset}</strong>
                      <span className="text-rose-400 text-[11px]">Rahu: {livePanchangam.rahuKalam}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Month Panchangam Directory Table (View All) */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-between bg-[#181818]">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Daily Vedic Panchangam Schedule — {new Date(panchangamYear, panchangamMonth - 1).toLocaleString('default', { month: 'long' })} {panchangamYear} ({panchangamCity})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Custom DB Override
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-neutral-500" /> Astronomical Engine
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[350px]">
                  {isLoadingPanchangamEntries ? (
                    <div className="p-12 text-center text-xs text-gray-400">
                      <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
                      <p>Calculating planetary positions & loading daily Panchangam...</p>
                    </div>
                  ) : panchangamEntries.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-400">
                      <p className="font-semibold text-gray-300">No entries loaded for this month.</p>
                      <button
                        onClick={() => loadPanchangamEntries(panchangamCity, panchangamYear, panchangamMonth, selectedLang)}
                        className="mt-2 px-3 py-1.5 bg-neutral-800 text-amber-400 rounded text-xs font-semibold"
                      >
                        Click to Reload
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#151515] uppercase text-[11px] text-gray-400 border-b border-[#2C2C2C]">
                        <tr>
                          <th className="px-5 py-3">Date & Day</th>
                          <th className="px-5 py-3">Tithi</th>
                          <th className="px-5 py-3">Nakshatram</th>
                          <th className="px-5 py-3">Paksham</th>
                          <th className="px-5 py-3">Sun Times</th>
                          <th className="px-5 py-3">Rahu Kalam</th>
                          <th className="px-5 py-3">Source Status</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2C]">
                        {panchangamEntries.map((day) => (
                          <tr
                            key={day.date}
                            className={`hover:bg-neutral-800/40 transition ${day.isOverride ? 'bg-amber-950/10' : ''
                              }`}
                          >
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <p className="font-bold text-gray-100">{day.date}</p>
                              <p className="text-[11px] text-amber-400 font-semibold">{day.vaaram}</p>
                            </td>

                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-emerald-400">{day.tithi}</p>
                              {day.tithiEndTime && (
                                <p className="text-[10px] text-gray-400">ends {day.tithiEndTime}</p>
                              )}
                            </td>

                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-sky-400">{day.nakshatram}</p>
                              {day.nakshatraEndTime && (
                                <p className="text-[10px] text-gray-400">ends {day.nakshatraEndTime}</p>
                              )}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="text-gray-300 font-medium">{day.paksham}</span>
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <p className="text-gray-200">☀️ {day.sunrise}</p>
                              <p className="text-gray-400 text-[11px]">🌙 {day.sunset}</p>
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="text-rose-400 font-mono text-[11px]">{day.rahuKalam}</span>
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {day.isOverride ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  MySQL Override #{day.id}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-800 text-gray-400 border border-neutral-700">
                                  Astronomical VSOP87
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View by ID */}
                                <button
                                  onClick={() => {
                                    setSelectedViewPanchangam(day);
                                    setIsViewPanchangamModalOpen(true);
                                  }}
                                  className="p-1.5 bg-[#252525] hover:bg-[#303030] text-sky-400 rounded-lg transition"
                                  title="View Full Panchangam Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit / Override */}
                                <button
                                  onClick={() => handleOpenCreatePanchangamOverride(day)}
                                  className="p-1.5 bg-[#252525] hover:bg-[#303030] text-amber-400 rounded-lg transition"
                                  title="Customize or Override this Day"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete / Reset */}
                                {day.isOverride && (
                                  <button
                                    onClick={() => handleDeletePanchangamOverride(day.id, day.date)}
                                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-rose-400 border border-red-800/40 rounded-lg transition"
                                    title="Delete Override (Revert to Astronomical Calculation)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FESTIVALS (Dedicated Festivals & Observances Directory Page) */}
          {activeTab === 'festivals' && (
            <div className="space-y-6">
              {/* Sabarimala Festival Dates & Management (View All, View By ID, Create, Edit, Delete) */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-[#2C2C2C] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <span>Sabarimala & Temple Festivals Directory</span>
                      </h2>
                      <span className="bg-[#D84315]/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                        {festivals.length} Festivals
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Dynamic sanctum festival schedule from MySQL database with 5-language localization.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={festivalSearch}
                        onChange={(e) => {
                          setFestivalSearch(e.target.value);
                          loadFestivals(1, e.target.value, festivalYear);
                        }}
                        placeholder="Search festivals by name or date..."
                        className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                      />
                      {festivalSearch && (
                        <button
                          onClick={() => { setFestivalSearch(''); loadFestivals(1, '', festivalYear); }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => loadFestivals(1, festivalSearch, festivalYear)}
                      className="p-2 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-gray-300 hover:text-amber-400 transition"
                      title="Refresh Festivals Catalog"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleOpenCreateFestival}
                      className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Festival</span>
                    </button>
                  </div>
                </div>

                {/* Year-Based Filter Navigation Bar */}
                <div className="bg-[#161616] px-5 py-3 border-b border-[#2C2C2C] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Year:
                    </span>
                    <div className="flex items-center gap-1 bg-[#101010] p-1 rounded-lg border border-[#2C2C2C]">
                      {['2024', '2025', '2026', '2027', '2028', 'all'].map((yr) => (
                        <button
                          key={yr}
                          onClick={() => {
                            setFestivalYear(yr);
                            loadFestivals(1, festivalSearch, yr);
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${festivalYear === yr
                              ? 'bg-[#D84315] text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-100 hover:bg-neutral-800'
                            }`}
                        >
                          {yr === 'all' ? 'All Years' : yr === '2026' ? '2026 (Active)' : yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="bg-neutral-800/80 px-2.5 py-1 rounded border border-[#2C2C2C]">
                      Showing <span className="font-bold text-amber-400">{festivals.length}</span> festivals in {festivalYear === 'all' ? 'All Years' : `Year ${festivalYear}`}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[250px]">
                  {festivals.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-400">
                      <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-gray-300">No festival entries found.</p>
                      <p className="text-gray-500 mt-1">Click "+ Create Festival" to add verified Sabarimala Mandala Kalam or Makara Jyothi dates.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Festival Name</th>
                          <th className="px-6 py-3">Observance Date</th>
                          <th className="px-6 py-3">Slug</th>
                          <th className="px-6 py-3">Source & Observance Note</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2C]">
                        {festivals.map(f => {
                          const langMatch = f.translations?.find(t => (t as any).language?.code === selectedLang)
                            || f.translations?.find(t => (t as any).language?.code === 'en')
                            || f.translations?.find(t => (t as any).language?.code === 'te')
                            || f.translations?.[0];
                          const enMatch = f.translations?.find(t => (t as any).language?.code === 'en');
                          const dateObj = new Date(f.festivalDate);
                          const formattedDate = isNaN(dateObj.getTime())
                            ? f.festivalDate
                            : dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                          return (
                            <tr key={f.id} className="hover:bg-neutral-800/40 transition">
                              <td className="px-6 py-4 font-mono text-gray-400">#{f.id}</td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-100 text-sm">
                                  {langMatch?.name || f.slug}
                                </div>
                                {enMatch && enMatch.name !== langMatch?.name && (
                                  <div className="text-[11px] text-gray-400">
                                    {enMatch.name}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 font-mono text-amber-400 font-semibold whitespace-nowrap">
                                📅 {formattedDate}
                              </td>
                              <td className="px-6 py-4 font-mono text-gray-400 text-[11px]">
                                {f.slug}
                              </td>
                              <td className="px-6 py-4 text-gray-300 max-w-xs truncate" title={f.sourceNote || langMatch?.description || ''}>
                                {f.sourceNote || langMatch?.description || '—'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${f.isPublished !== false
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-neutral-700 text-gray-400'
                                  }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${f.isPublished !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></span>
                                  {f.isPublished !== false ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={(e) => handleOpenViewFestival(f, e)}
                                    className="p-1.5 hover:bg-neutral-700/80 rounded text-sky-400 hover:text-sky-300 transition"
                                    title="View Festival Details (View by ID)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleOpenEditFestival(f, e)}
                                    className="p-1.5 hover:bg-neutral-700/80 rounded text-amber-400 hover:text-amber-300 transition"
                                    title="Edit Festival Record"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFestival(f.id, langMatch?.name || f.slug)}
                                    className="p-1.5 hover:bg-neutral-700/80 rounded text-red-400 hover:text-red-300 transition"
                                    title="Delete Festival Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIO LIBRARY */}
          {activeTab === 'audio' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Devotional Audio Library</h2>
                  <p className="text-xs text-gray-400">Offline persistent chants (Suprabatham, Harivarasanam, etc.).</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[#FFB300] rounded-full text-xs font-semibold">
                  {audioList.length} Tracks in Database
                </span>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Audio Title</th>
                      <th className="px-6 py-3">Slug Identifier</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Offline Download Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]">
                    {audioList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          <Music className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                          <p className="text-sm font-semibold">No devotional audio tracks found in database</p>
                          <p className="text-xs text-gray-500 mt-1">Audio items registered with audio enabled will appear here.</p>
                        </td>
                      </tr>
                    ) : (
                      audioList.map(a => (
                        <tr key={a.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono">#{a.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100 flex items-center gap-2">
                            <Music className="w-3.5 h-3.5 text-amber-400" />
                            <span>{a.title}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-amber-400">{a.slug}</td>
                          <td className="px-6 py-4 font-mono">{a.duration}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              OFFLINE_ENABLED
                            </span>
                          </td>
                        </tr>
                      )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CMS PAGES (WITH SUBTITLE TABS & DYNAMIC REAL-TIME EDITOR) */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              {/* Sub-Title Selector Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { key: 'about_us', label: 'About Us', icon: BookOpen, desc: 'Mission & History' },
                  { key: 'terms_conditions', label: 'Terms & Conditions', icon: ShieldCheck, desc: 'Devotee Agreement' },
                  { key: 'privacy_policy', label: 'Privacy Policy', icon: Lock, desc: 'Data & Privacy' },
                  { key: 'refund_policy', label: 'Refund Policy', icon: CheckCircle2, desc: 'Donation & Offerings' },
                  { key: 'sabarimala_guidelines', label: 'Sabarimala Guidelines', icon: FileText, desc: 'Pilgrim Rules' },
                ].map(item => {
                  const isSelected = selectedCmsKey === item.key;
                  const SubIcon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedCmsKey(item.key)}
                      className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3.5 ${isSelected
                          ? 'bg-[#1C1C1C] border-[#FFB300] shadow-lg shadow-amber-950/30'
                          : 'bg-[#181818] border-[#2C2C2C] hover:border-neutral-600 hover:bg-[#1E1E1E]'
                        }`}
                    >
                      <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-orange-500/20 text-[#FFB300] border border-orange-500/40' : 'bg-neutral-800 text-gray-400'}`}>
                        <SubIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold uppercase tracking-wide truncate ${isSelected ? 'text-[#FFB300]' : 'text-gray-200'}`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.desc}</p>
                        <span className="inline-block mt-2 font-mono text-[9px] px-2 py-0.5 rounded bg-black/40 text-amber-300/80 border border-neutral-700">
                          {item.key}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic CMS Page Editor */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-xl">
                <div className="p-5 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <h2 className="text-base font-bold text-gray-100">
                        Editing CMS Page: <span className="text-[#FFB300]">{cmsEditTitle || selectedCmsKey}</span>
                      </h2>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Updates are stored live in MySQL table <code className="text-amber-400">app_settings</code> and served dynamically to mobile apps via API.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openTranslationModal('cms', selectedCmsKey, [
                        { key: 'title', label: 'Page Title', value: cmsEditTitle },
                        { key: 'content', label: 'Page Content Body', value: cmsEditContent, isHtml: true }
                      ], (trans) => {
                        if (trans.title) setCmsEditTitle(trans.title);
                        if (trans.content) setCmsEditContent(trans.content);
                      })}
                      className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-lg text-xs font-bold transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>✨ Translate Page (v3)</span>
                    </button>

                    <button
                      onClick={handleSaveCmsPage}
                      disabled={isSavingCms}
                      className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md shadow-orange-950"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSavingCms ? 'Saving to MySQL...' : 'Save to Database'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                        Database Key (Read Only Identifier)
                      </label>
                      <input
                        type="text"
                        value={selectedCmsKey}
                        disabled
                        className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3.5 py-2 text-xs font-mono text-amber-300 cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                        Page Title & Sub-Heading
                      </label>
                      <input
                        type="text"
                        value={cmsEditTitle}
                        onChange={(e) => setCmsEditTitle(e.target.value)}
                        placeholder="e.g. About Saranam Ayyappa Devotional Platform"
                        className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5 flex items-center justify-between">
                      <span>Page Content Body (Rich Text WYSIWYG & HTML Editor)</span>
                      <span className="text-amber-400 font-normal">CKEditor 5 Mode</span>
                    </label>
                    <RichTextEditor
                      value={cmsEditContent}
                      onChange={(newVal) => setCmsEditContent(newVal)}
                      placeholder="Write or edit full CMS page text..."
                    />
                  </div>
                </div>

                {/* Table of all active CMS records */}
                <div className="border-t border-[#2C2C2C]">
                  <div className="px-6 py-3 bg-[#181818] border-b border-[#2C2C2C] flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300 uppercase">
                      MySQL Database Status (<code className="text-amber-400">app_settings</code>)
                    </span>
                    <button
                      onClick={loadCms}
                      className="text-xs text-gray-400 hover:text-amber-400 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reload from DB</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#151515] uppercase text-[11px] text-gray-400 border-b border-[#2C2C2C]">
                        <tr>
                          <th className="px-6 py-2.5">Key</th>
                          <th className="px-6 py-2.5">Title / Description</th>
                          <th className="px-6 py-2.5">Content Preview</th>
                          <th className="px-6 py-2.5">Last Synchronized</th>
                          <th className="px-6 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2C]">
                        {cmsPages.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                              <FileText className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                              <p className="text-sm font-semibold">No CMS pages stored in database</p>
                              <p className="text-xs text-gray-500 mt-1">Select any page key above to write and publish content to MySQL.</p>
                            </td>
                          </tr>
                        ) : (
                          cmsPages.map(p => (
                            <tr
                              key={p.id}
                              className={`hover:bg-neutral-800/40 cursor-pointer ${selectedCmsKey === p.key ? 'bg-orange-500/10' : ''
                                }`}
                              onClick={() => setSelectedCmsKey(p.key)}
                            >
                              <td className="px-6 py-3 font-mono text-amber-400 font-semibold">{p.key}</td>
                              <td className="px-6 py-3 text-gray-200 font-medium">{p.description || p.key}</td>
                              <td className="px-6 py-3 text-gray-400 max-w-xs truncate">{p.value || '—'}</td>
                              <td className="px-6 py-3 text-gray-400">{new Date(p.updatedAt).toLocaleString()}</td>
                              <td className="px-6 py-3 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCmsKey(p.key);
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#D84315]/20 hover:bg-[#D84315]/40 text-[#FFB300] font-semibold text-[11px] transition"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          )))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Languages in Database ({languages.length})</h2>
                  <p className="text-xs text-gray-400">Create, edit, or manage supported devotional languages.</p>
                </div>
                <button
                  onClick={handleOpenCreateLanguage}
                  className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Language</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                    <tr>
                      <th className="px-6 py-3">Language ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Native</th>
                      <th className="px-6 py-3">ISO Code</th>
                      <th className="px-6 py-3">Translations in DB</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-center font-bold text-amber-400">Options / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]">
                    {languages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                          <Globe className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                          <p className="text-sm font-semibold">No languages found in database</p>
                          <p className="text-xs text-gray-500 mt-1">Click &quot;Create Language&quot; to configure a new language.</p>
                        </td>
                      </tr>
                    ) : (
                      languages.map(l => (
                        <tr key={l.code} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono text-gray-500">#{l.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100">{l.name}</td>
                          <td className="px-6 py-4 text-orange-400 font-semibold text-sm">{l.nativeName}</td>
                          <td className="px-6 py-4 font-mono text-amber-400">{l.code}</td>
                          <td className="px-6 py-4 font-semibold text-emerald-400">{l.translationCount || 0} records</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditLanguage(l)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400 text-xs font-semibold transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLanguage(l.id, l.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded text-red-400 text-xs font-semibold transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: USER MANAGEMENT & DELETION REQUESTS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-3 bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C]">
                <button
                  onClick={() => { setUserSubTab('all'); setSelectedUserSubtitle('devotees'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${userSubTab === 'all' && selectedUserSubtitle === 'devotees'
                      ? 'bg-[#FFB300] text-black shadow-lg shadow-amber-950/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Devotees ({users.filter(u => !u.isDeleted).length})</span>
                </button>
                <button
                  onClick={() => { setUserSubTab('all'); setSelectedUserSubtitle('dharma_karthas'); loadDharmaKarthas(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${userSubTab === 'all' && selectedUserSubtitle === 'dharma_karthas'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
                    }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dharma Karthas ({dharmaKarthas.length})</span>
                </button>
                <button
                  onClick={() => setUserSubTab('requests')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all relative ${userSubTab === 'requests'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
                    }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Deletion Requests ({deletionRequests.length})</span>
                  {deletionRequests.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-red-500 text-white font-bold rounded-full animate-pulse">
                      {deletionRequests.length}
                    </span>
                  )}
                </button>
              </div>

              {/* View 1: Pending Deletion Requests */}
              {userSubTab === 'requests' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                  <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h2 className="text-base font-bold text-gray-100">Devotee Account Deletion Requests</h2>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Devotees who verified their mobile OTP and submitted an account deletion request. Choose to soft-delete (deactivate) or permanently purge.
                      </p>
                    </div>
                    <button
                      onClick={() => { loadDeletionRequests(); loadUsers(); }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#2F2F2F] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {deletionRequests.length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-gray-200">No Pending Account Deletion Requests</p>
                        <p className="text-gray-500">All registered devotee accounts are in good standing.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                          <tr>
                            <th className="px-6 py-3">User ID</th>
                            <th className="px-6 py-3">Devotee / Identifier</th>
                            <th className="px-6 py-3">Request Date</th>
                            <th className="px-6 py-3">Deletion Reason</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2C2C]">
                          {deletionRequests.map(u => (
                            <tr key={u.id} className="hover:bg-neutral-800/40">
                              <td className="px-6 py-4 font-mono text-gray-500">#{u.id}</td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-100">{u.fullName || 'Devotee'}</p>
                                <p className="text-[11px] font-mono text-gray-400">{u.phoneNumber || u.deviceUuid || 'No phone'}</p>
                              </td>
                              <td className="px-6 py-4 text-gray-300">
                                {u.deletionRequestedAt ? new Date(u.deletionRequestedAt).toLocaleString() : 'Recent'}
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <span className="bg-[#2A2421] text-amber-300 border border-amber-900/40 px-2.5 py-1 rounded text-[11px] block truncate" title={u.deletionReason || 'No reason provided'}>
                                  {u.deletionReason || 'No reason provided by devotee'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {u.isDeleted ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    SOFT DELETED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                                    PENDING ACTION
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!u.isDeleted && (
                                    <button
                                      onClick={() => handleSoftDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                      disabled={actionLoadingId === u.id}
                                      className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                      title="Deactivate account & move to Soft-Deleted archive"
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                      <span>Soft Delete</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handlePermanentDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                    title="Permanently erase from MySQL database"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Permanent Delete</span>
                                  </button>
                                  <button
                                    onClick={() => handleDismissDeletionRequest(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-3 py-1.5 bg-neutral-700/40 hover:bg-neutral-700/60 text-gray-300 border border-neutral-600/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                    title="Dismiss deletion request and keep account active"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Dismiss</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* View 2A: Dedicated Dynamic Dharma Karthas Records View */}
              {userSubTab === 'all' && selectedUserSubtitle === 'dharma_karthas' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                  <div className="p-5 border-b border-[#2C2C2C] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        <h2 className="text-base font-bold text-gray-100">
                          Dharma Kartha Records ({dharmaKarthas.length})
                        </h2>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                        Authoritative trustee & temple management records dynamically queried from database via <code className="text-amber-400">/api/v1/admin/dharma-karthas</code>.
                        Every record provides complete visibility into governed temples, scheduled events, festivals, administrative contacts, timings & aarthi, media gallery, speciality, and about details.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search Dharma Karthas or temples..."
                          value={dkSearch}
                          onChange={(e) => {
                            setDkSearch(e.target.value);
                            loadDharmaKarthas(e.target.value);
                          }}
                          className="pl-8 pr-3 py-1.5 bg-[#121212] border border-[#3C3C3C] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 w-64"
                        />
                      </div>
                      <button
                        onClick={() => loadDharmaKarthas(dkSearch)}
                        disabled={dkLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#2F2F2F] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition disabled:opacity-50"
                        title="Refresh live Dharma Kartha records from database"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${dkLoading ? 'animate-spin text-amber-400' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {dkLoading ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                        <p className="font-semibold text-gray-300">Fetching live Dharma Kartha records from database...</p>
                      </div>
                    ) : dharmaKarthas.length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <ShieldCheck className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="font-semibold text-gray-300">No Dharma Kartha records found.</p>
                        <p className="text-gray-500">No trustees match the search criteria or have been approved yet.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                          <tr>
                            <th className="px-5 py-3">Trustee / Dharma Kartha</th>
                            <th className="px-5 py-3">Governed Mandir(s)</th>
                            <th className="px-5 py-3">Sacred Modules & Assets</th>
                            <th className="px-5 py-3">Mandir Contact & Speciality</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2C2C]">
                          {dharmaKarthas.map((dk) => (
                            <tr key={dk.id} className="hover:bg-neutral-800/40 transition">
                              {/* 1. Trustee Identity */}
                              <td className="px-5 py-4 align-top">
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-900/30 border border-amber-600/40 text-amber-300 font-bold flex items-center justify-center shrink-0">
                                    {dk.fullName ? dk.fullName.charAt(0).toUpperCase() : 'D'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-100 flex items-center gap-1.5">
                                      <span>{dk.fullName || 'Dharma Kartha'}</span>
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        {dk.membershipRole || 'OWNER'}
                                      </span>
                                    </p>
                                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{dk.phoneNumber || 'No phone'}</p>
                                    {dk.email && <p className="text-[11px] text-gray-500">{dk.email}</p>}
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      📍 {dk.city}, {dk.state}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Governed Temples */}
                              <td className="px-5 py-4 align-top">
                                {(!dk.temples || dk.temples.length === 0) ? (
                                  <span className="text-gray-500 italic text-[11px]">No Temple assigned yet</span>
                                ) : (
                                  <div className="space-y-2">
                                    {dk.temples.map((t: any) => (
                                      <div key={t.id} className="bg-[#141414] border border-[#2C2C2C] p-2.5 rounded-lg">
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="font-bold text-amber-300 text-xs flex items-center gap-1">
                                            <span>🛕</span>
                                            <span>{t.name}</span>
                                          </p>
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {t.status || 'PUBLISHED'}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                          Deity: <span className="text-gray-200 font-semibold">{t.primaryDeity}</span> • 📍 {t.city}, {t.state}
                                        </p>
                                        {t.alternateName && (
                                          <p className="text-[10px] text-gray-500 italic">Local name: {t.alternateName}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>

                              {/* 3. Sacred Modules Summary Badges */}
                              <td className="px-5 py-4 align-top">
                                {(!dk.temples || dk.temples.length === 0) ? (
                                  <span className="text-gray-500 italic text-[11px]">—</span>
                                ) : (
                                  <div className="space-y-2">
                                    {dk.temples.map((t: any) => (
                                      <div key={t.id} className="grid grid-cols-2 gap-1.5 text-[11px]">
                                        <span className="bg-[#242424] border border-[#333] px-2 py-1 rounded flex items-center gap-1 text-gray-300">
                                          <span>📅</span>
                                          <span><b>{t.events?.length || 0}</b> Events</span>
                                        </span>
                                        <span className="bg-[#242424] border border-[#333] px-2 py-1 rounded flex items-center gap-1 text-gray-300">
                                          <span>🪔</span>
                                          <span><b>{t.festivals?.length || 0}</b> Festivals</span>
                                        </span>
                                        <span className="bg-[#242424] border border-[#333] px-2 py-1 rounded flex items-center gap-1 text-gray-300">
                                          <span>⏰</span>
                                          <span><b>{t.timings?.length || 0}</b> Timings</span>
                                        </span>
                                        <span className="bg-[#242424] border border-[#333] px-2 py-1 rounded flex items-center gap-1 text-gray-300">
                                          <span>🖼️</span>
                                          <span><b>{t.gallery?.length || 0}</b> Media</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>

                              {/* 4. Mandir Contact & Speciality */}
                              <td className="px-5 py-4 align-top max-w-xs">
                                {(!dk.temples || dk.temples.length === 0) ? (
                                  <span className="text-gray-500 italic text-[11px]">—</span>
                                ) : (
                                  <div className="space-y-1.5 text-[11px]">
                                    {dk.temples[0].officePhone && (
                                      <p className="text-gray-300 flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                        <span>{dk.temples[0].officePhone}</span>
                                      </p>
                                    )}
                                    {dk.temples[0].officialEmail && (
                                      <p className="text-gray-400 flex items-center gap-1 truncate" title={dk.temples[0].officialEmail}>
                                        <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                                        <span className="truncate">{dk.temples[0].officialEmail}</span>
                                      </p>
                                    )}
                                    {dk.temples[0].speciality && (
                                      <p className="text-gray-400 line-clamp-2 mt-1 italic text-[10px] leading-relaxed border-t border-[#2C2C2C] pt-1">
                                        ✨ {dk.temples[0].speciality}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* 5. Actions */}
                              <td className="px-5 py-4 align-top text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedDkRecord(dk);
                                      setSelectedDkTempleIndex(0);
                                      setActiveDkDetailTab('about');
                                    }}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                                    title="View full sacred details (Events, Festivals, Contact, Timings, Gallery, Speciality, About)"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View Record</span>
                                  </button>

                                  <button
                                    onClick={() => handleSoftDeleteUser(dk.id, dk.fullName || dk.phoneNumber)}
                                    disabled={actionLoadingId === dk.id}
                                    className="px-2.5 py-1 bg-[#252525] hover:bg-neutral-800 text-gray-400 hover:text-amber-400 border border-[#333] rounded text-[11px] font-semibold flex items-center gap-1 transition"
                                    title="Deactivate trustee account"
                                  >
                                    <Archive className="w-3 h-3" />
                                    <span>Deactivate</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* View 2B: Devotees View */}
              {userSubTab === 'all' && selectedUserSubtitle === 'devotees' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                  <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-100">Registered Devotees (MySQL `app_users`)</h2>
                      <p className="text-xs text-gray-400">Active devotee profiles queried directly from MySQL via Prisma.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {users.filter(u => !u.isDeleted).length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <p className="font-semibold text-gray-300">No active registered mobile devotee profiles yet.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                          <tr>
                            <th className="px-6 py-3">User ID</th>
                            <th className="px-6 py-3">Phone / Identifier</th>
                            <th className="px-6 py-3">Language</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Registered At</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2C2C]">
                          {users.filter(u => !u.isDeleted).map(u => (
                            <tr key={u.id} className="hover:bg-neutral-800/40">
                              <td className="px-6 py-4 font-mono text-gray-500">#{u.id}</td>
                              <td className="px-6 py-4 font-semibold text-gray-100">
                                {u.fullName ? `${u.fullName} (${u.phoneNumber || u.deviceUuid})` : u.phoneNumber || u.deviceUuid || 'Anonymous Client'}
                              </td>
                              <td className="px-6 py-4 uppercase font-mono text-amber-400">{u.preferredLang}</td>
                              <td className="px-6 py-4">
                                {u.deletionRequested ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    DELETION REQUESTED
                                  </span>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isSuspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleSoftDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                                  >
                                    <Archive className="w-3 h-3" />
                                    <span>Soft Delete</span>
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* MODAL DIALOG: COMPLETE DYNAMIC DHARMA KARTHA & MANDIR RECORD DETAILS */}
              {selectedDkRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="bg-[#1C1C1C] border border-[#333] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Modal Top Bar */}
                    <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between bg-[#171717]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-600/30 border border-amber-600/50 flex items-center justify-center text-amber-300 font-bold text-base shrink-0">
                          {selectedDkRecord.fullName ? selectedDkRecord.fullName.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-gray-100">{selectedDkRecord.fullName}</h2>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {selectedDkRecord.membershipRole || 'OWNER'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            📞 {selectedDkRecord.phoneNumber || 'N/A'} • ✉️ {selectedDkRecord.email || 'N/A'} • 📍 {selectedDkRecord.city}, {selectedDkRecord.state}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDkRecord(null)}
                        className="w-8 h-8 rounded-lg bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Temple Selector (if multiple temples) */}
                    {selectedDkRecord.temples && selectedDkRecord.temples.length > 1 && (
                      <div className="px-5 py-2.5 bg-[#141414] border-b border-[#2C2C2C] flex items-center gap-2 overflow-x-auto">
                        <span className="text-xs font-semibold text-gray-400">Managing Temple:</span>
                        {selectedDkRecord.temples.map((temple: any, idx: number) => (
                          <button
                            key={temple.id}
                            onClick={() => setSelectedDkTempleIndex(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${selectedDkTempleIndex === idx
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-[#222] text-gray-300 hover:bg-[#2C2C2C]'
                              }`}
                          >
                            🛕 {temple.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Modal Content Body */}
                    {(!selectedDkRecord.temples || selectedDkRecord.temples.length === 0) ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <Landmark className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="font-semibold text-gray-200">No Holy Temple Associated With This Trustee Yet</p>
                        <p className="text-gray-500">This Dharma Kartha has registered their account but has not yet linked or registered a mandir.</p>
                      </div>
                    ) : (
                      (() => {
                        const temple = selectedDkRecord.temples[selectedDkTempleIndex] || selectedDkRecord.temples[0];
                        return (
                          <div className="flex-1 flex flex-col overflow-hidden">
                            {/* 7 Modules Navigation Tabs */}
                            <div className="flex items-center gap-1.5 px-5 pt-3 border-b border-[#2C2C2C] bg-[#141414] overflow-x-auto text-xs">
                              <button
                                onClick={() => setActiveDkDetailTab('about')}
                                className={`px-3.5 py-2 rounded-t-lg font-semibold transition flex items-center gap-1.5 border-b-2 ${activeDkDetailTab === 'about'
                                    ? 'border-amber-500 text-amber-400 bg-[#1E1E1E]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <Landmark className="w-3.5 h-3.5" />
                                <span>1. About & History</span>
                              </button>
                              <button
                                onClick={() => setActiveDkDetailTab('speciality')}
                                className={`px-3.5 py-2 rounded-t-lg font-semibold transition flex items-center gap-1.5 border-b-2 ${activeDkDetailTab === 'speciality'
                                    ? 'border-amber-500 text-amber-400 bg-[#1E1E1E]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>2. Speciality</span>
                              </button>
                              <button
                                onClick={() => setActiveDkDetailTab('contact')}
                                className={`px-3.5 py-2 rounded-t-lg font-semibold transition flex items-center gap-1.5 border-b-2 ${activeDkDetailTab === 'contact'
                                    ? 'border-amber-500 text-amber-400 bg-[#1E1E1E]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>3. Contact</span>
                              </button>
                              <button
                                onClick={() => setActiveDkDetailTab('timings')}
                                className={`px-3.5 py-2 rounded-t-lg font-semibold transition flex items-center gap-1.5 border-b-2 ${activeDkDetailTab === 'timings'
                                    ? 'border-amber-500 text-amber-400 bg-[#1E1E1E]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>4. Timings & Aarthi ({temple.timings?.length || 0})</span>
                              </button>
                              <button
                                onClick={() => setActiveDkDetailTab('events')}
                                className={`px-3.5 py-2 rounded-t-lg font-semibold transition flex items-center gap-1.5 border-b-2 ${activeDkDetailTab === 'events'
                                    ? 'border-amber-500 text-amber-400 bg-[#1E1E1E]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>5. Events ({temple.events?.length || 0})</span>
                              </button>
                              <button
                                onClick={() => setActiveDkDetailTab('festivals')}
                                className={`px-3.5 py-2 rounded-t-lg font-semibold transition flex items-center gap-1.5 border-b-2 ${activeDkDetailTab === 'festivals'
                                    ? 'border-amber-500 text-amber-400 bg-[#1E1E1E]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>6. Festivals ({temple.festivals?.length || 0})</span>
                              </button>
                              <button
                                onClick={() => setActiveDkDetailTab('gallery')}
                                className={`px-3.5 py-2 rounded-t-lg font-semibold transition flex items-center gap-1.5 border-b-2 ${activeDkDetailTab === 'gallery'
                                    ? 'border-amber-500 text-amber-400 bg-[#1E1E1E]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>7. Gallery ({temple.gallery?.length || 0})</span>
                              </button>
                            </div>

                            {/* Tab Panels */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-300">
                              {/* TAB 1: ABOUT & HISTORY */}
                              {activeDkDetailTab === 'about' && (
                                <div className="space-y-5">
                                  <div className="flex flex-col md:flex-row gap-5 items-start">
                                    {temple.heroImageUrl && (
                                      <img
                                        src={temple.heroImageUrl}
                                        alt={temple.name}
                                        className="w-full md:w-56 h-36 object-cover rounded-xl border border-[#333] shrink-0"
                                      />
                                    )}
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-gray-100">{temple.name}</h3>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                          {temple.status || 'PUBLISHED'}
                                        </span>
                                      </div>
                                      {temple.alternateName && (
                                        <p className="text-gray-400"><b>Alternate Name:</b> {temple.alternateName}</p>
                                      )}
                                      <p className="text-gray-300">
                                        <b>Primary Deity:</b> <span className="text-amber-400 font-semibold">{temple.primaryDeity}</span> • 📍 {temple.city}, {temple.district ? `${temple.district}, ` : ''}{temple.state}
                                      </p>
                                      {temple.shortDescription && (
                                        <p className="text-gray-400 italic bg-[#151515] p-3 rounded-lg border border-[#282828] leading-relaxed">
                                          "{temple.shortDescription}"
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-4 pt-2">
                                    <div className="bg-[#161616] border border-[#282828] p-4 rounded-xl space-y-2">
                                      <h4 className="font-bold text-amber-300 text-xs uppercase flex items-center gap-1.5">
                                        <Landmark className="w-4 h-4 text-amber-400" />
                                        <span>About the Holy Temple</span>
                                      </h4>
                                      <p className="text-gray-300 leading-relaxed text-xs">
                                        {temple.about || 'No detailed description recorded in database.'}
                                      </p>
                                    </div>

                                    <div className="bg-[#161616] border border-[#282828] p-4 rounded-xl space-y-2">
                                      <h4 className="font-bold text-amber-300 text-xs uppercase flex items-center gap-1.5">
                                        <Scroll className="w-4 h-4 text-amber-400" />
                                        <span>Sacred History & Divine Origins</span>
                                      </h4>
                                      <p className="text-gray-300 leading-relaxed text-xs">
                                        {temple.history || 'No sacred history recorded in database.'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* TAB 2: SPECIALITY */}
                              {activeDkDetailTab === 'speciality' && (
                                <div className="space-y-4">
                                  <div className="bg-[#161616] border border-[#282828] p-5 rounded-xl space-y-3">
                                    <h4 className="font-bold text-amber-300 text-sm uppercase flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-amber-400" />
                                      <span>Spiritual Speciality & Architectural Highlights</span>
                                    </h4>
                                    <p className="text-gray-200 leading-relaxed text-xs">
                                      {temple.speciality || 'No speciality or architectural highlights recorded in database.'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* TAB 3: CONTACT INFORMATION */}
                              {activeDkDetailTab === 'contact' && (
                                <div className="space-y-4">
                                  <div className="bg-[#161616] border border-[#282828] p-5 rounded-xl space-y-4">
                                    <h4 className="font-bold text-amber-300 text-xs uppercase flex items-center gap-1.5">
                                      <Phone className="w-4 h-4 text-amber-400" />
                                      <span>Official Administrative Contact Details</span>
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-[#1A1A1A] p-3.5 rounded-lg border border-[#2C2C2C]">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold block">Office Phone / Helpline</span>
                                        <p className="text-gray-200 font-semibold text-xs mt-1">{temple.officePhone || 'N/A'}</p>
                                      </div>
                                      <div className="bg-[#1A1A1A] p-3.5 rounded-lg border border-[#2C2C2C]">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold block">Official Trust Email</span>
                                        <p className="text-gray-200 font-semibold text-xs mt-1">{temple.officialEmail || 'N/A'}</p>
                                      </div>
                                      <div className="bg-[#1A1A1A] p-3.5 rounded-lg border border-[#2C2C2C]">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold block">Official Website</span>
                                        {temple.officialWebsite ? (
                                          <a href={temple.officialWebsite} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline flex items-center gap-1 text-xs mt-1">
                                            <span>{temple.officialWebsite}</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        ) : (
                                          <p className="text-gray-500 text-xs mt-1">N/A</p>
                                        )}
                                      </div>
                                      <div className="bg-[#1A1A1A] p-3.5 rounded-lg border border-[#2C2C2C]">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold block">Google Maps Coordinates</span>
                                        {temple.mapsUrl ? (
                                          <a href={temple.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 text-xs mt-1">
                                            <span>Open Location in Google Maps</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        ) : (
                                          <p className="text-gray-500 text-xs mt-1">Lat: {temple.latitude || 'N/A'} • Long: {temple.longitude || 'N/A'}</p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2C2C2C] space-y-1">
                                      <span className="text-[10px] uppercase text-gray-500 font-bold block">Full Temple Address</span>
                                      <p className="text-gray-200 leading-relaxed">
                                        {temple.address || `${temple.city}, ${temple.state}`}, Pin: {temple.pincode || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* TAB 4: TIMINGS & AARTHI */}
                              {activeDkDetailTab === 'timings' && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-amber-300 text-xs uppercase flex items-center gap-1.5">
                                      <Clock className="w-4 h-4 text-amber-400" />
                                      <span>Sacred Daily Timings & Aarthi Schedule ({temple.timings?.length || 0})</span>
                                    </h4>
                                  </div>

                                  {(!temple.timings || temple.timings.length === 0) ? (
                                    <div className="bg-[#161616] border border-[#282828] p-8 text-center rounded-xl text-gray-500">
                                      <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                                      <p>No daily timings or aarthi schedule configured in database for this temple.</p>
                                    </div>
                                  ) : (
                                    <div className="divide-y divide-[#282828] border border-[#282828] rounded-xl overflow-hidden bg-[#161616]">
                                      {temple.timings.map((tm: any, i: number) => (
                                        <div key={tm.id || i} className="p-3.5 flex items-start justify-between gap-4 hover:bg-[#1A1A1A] transition">
                                          <div className="space-y-1">
                                            <p className="font-bold text-gray-100 flex items-center gap-2">
                                              <span>{tm.title}</span>
                                              <span className="text-amber-400 font-mono text-[11px] font-semibold">({tm.timeWindow})</span>
                                            </p>
                                            {tm.description && (
                                              <p className="text-gray-400 text-[11px]">{tm.description}</p>
                                            )}
                                          </div>
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                            ACTIVE
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 5: TEMPLE EVENTS */}
                              {activeDkDetailTab === 'events' && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-amber-300 text-xs uppercase flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4 text-amber-400" />
                                      <span>Temple Events & Seva Programmes ({temple.events?.length || 0})</span>
                                    </h4>
                                  </div>

                                  {(!temple.events || temple.events.length === 0) ? (
                                    <div className="bg-[#161616] border border-[#282828] p-8 text-center rounded-xl text-gray-500">
                                      <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                                      <p>No events registered in database for this temple.</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {temple.events.map((evt: any) => (
                                        <div key={evt.id} className="bg-[#161616] border border-[#282828] p-4 rounded-xl space-y-2">
                                          <div className="flex items-start justify-between gap-2">
                                            <h5 className="font-bold text-gray-100 text-xs">{evt.title}</h5>
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                              {evt.category || 'PROGRAMME'}
                                            </span>
                                          </div>
                                          <p className="text-gray-400 text-[11px]">
                                            📅 {evt.startDate ? new Date(evt.startDate).toLocaleDateString() : 'Active Date'}
                                            {evt.timeWindow && ` • ⏰ ${evt.timeWindow}`}
                                          </p>
                                          {evt.description && (
                                            <p className="text-gray-300 text-[11px] leading-relaxed">{evt.description}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 6: FESTIVALS */}
                              {activeDkDetailTab === 'festivals' && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-amber-300 text-xs uppercase flex items-center gap-1.5">
                                      <Flame className="w-4 h-4 text-amber-400" />
                                      <span>Sacred Festivals & Mahotsavams ({temple.festivals?.length || 0})</span>
                                    </h4>
                                  </div>

                                  {(!temple.festivals || temple.festivals.length === 0) ? (
                                    <div className="bg-[#161616] border border-[#282828] p-8 text-center rounded-xl text-gray-500">
                                      <Flame className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                                      <p>No festivals registered in database for this temple.</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {temple.festivals.map((fest: any) => (
                                        <div key={fest.id} className="bg-[#161616] border border-[#282828] p-4 rounded-xl space-y-2">
                                          <div className="flex items-start justify-between gap-2">
                                            <h5 className="font-bold text-gray-100 text-xs">{fest.name}</h5>
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                              {fest.category || 'FESTIVAL'}
                                            </span>
                                          </div>
                                          <p className="text-gray-400 text-[11px]">
                                            🪔 {fest.period || (fest.startDate ? new Date(fest.startDate).toLocaleDateString() : 'Annual')}
                                          </p>
                                          {fest.description && (
                                            <p className="text-gray-300 text-[11px] leading-relaxed">{fest.description}</p>
                                          )}
                                          {fest.specialPoojaInfo && (
                                            <p className="text-amber-400/90 text-[10px] italic border-t border-[#252525] pt-1">
                                              ✦ Special Ritual: {fest.specialPoojaInfo}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 7: GALLERY */}
                              {activeDkDetailTab === 'gallery' && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-amber-300 text-xs uppercase flex items-center gap-1.5">
                                      <ImageIcon className="w-4 h-4 text-amber-400" />
                                      <span>Sanctum Media & Sacred Gallery ({temple.gallery?.length || 0})</span>
                                    </h4>
                                  </div>

                                  {(!temple.gallery || temple.gallery.length === 0) ? (
                                    <div className="bg-[#161616] border border-[#282828] p-8 text-center rounded-xl text-gray-500">
                                      <ImageIcon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                                      <p>No sanctum gallery photos or media uploaded in database for this temple.</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {temple.gallery.map((media: any) => (
                                        <div key={media.id} className="bg-[#161616] border border-[#282828] rounded-xl overflow-hidden group">
                                          <div className="aspect-video bg-[#111] overflow-hidden">
                                            <img
                                              src={media.mediaUrl}
                                              alt={media.title || 'Sanctum photo'}
                                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                              onError={(e: any) => { e.target.src = '/images/temple-hero.jpg'; }}
                                            />
                                          </div>
                                          <div className="p-2.5 space-y-1">
                                            <p className="font-bold text-gray-200 text-xs truncate">{media.title || 'Sanctum Photo'}</p>
                                            {media.caption && (
                                              <p className="text-gray-400 text-[10px] truncate">{media.caption}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Modal Bottom Footer */}
                    <div className="p-4 border-t border-[#2C2C2C] bg-[#171717] flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Saranam Ayyappa Master Trustee Records • Pure Dynamic Database Synchronization</span>
                      </span>
                      <button
                        onClick={() => setSelectedDkRecord(null)}
                        className="px-4 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-200 text-xs font-semibold rounded-lg transition"
                      >
                        Close Record
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEDICATED SEPARATE PAGE: SOFT DELETED USERS */}
          {activeTab === 'soft_deleted_users' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserX className="w-5 h-5 text-rose-400" />
                    <h2 className="text-base font-bold text-gray-100">Soft-Deleted Devotee Accounts (`is_deleted = true`)</h2>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Archived accounts prevented from accessing the app. Devotee data is retained in MySQL for audit and compliance. You can restore access or permanently purge anytime.
                  </p>
                </div>
                <button
                  onClick={() => { loadSoftDeletedUsers(); loadUsers(); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#2F2F2F] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh List</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                {softDeletedUsers.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 text-gray-400 flex items-center justify-center mx-auto mb-2">
                      <UserX className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-gray-200">No Soft-Deleted User Accounts</p>
                    <p className="text-gray-500">There are currently no accounts in the soft-deleted archive.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3">User ID</th>
                        <th className="px-6 py-3">Devotee / Identifier</th>
                        <th className="px-6 py-3">Language</th>
                        <th className="px-6 py-3">Deactivated Date</th>
                        <th className="px-6 py-3">Deletion Reason</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {softDeletedUsers.map(u => (
                        <tr key={u.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono text-gray-500">#{u.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-100">{u.fullName || 'Devotee'}</p>
                            <p className="text-[11px] font-mono text-gray-400">{u.phoneNumber || u.deviceUuid || 'No phone'}</p>
                          </td>
                          <td className="px-6 py-4 uppercase font-mono text-amber-400">{u.preferredLang}</td>
                          <td className="px-6 py-4 text-gray-300">
                            {u.deletedAt ? new Date(u.deletedAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <span className="text-gray-400 italic block truncate" title={u.deletionReason || 'Direct admin soft-delete'}>
                              {u.deletionReason || 'Direct admin soft-delete'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              SOFT DELETED
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRestoreUser(u.id, u.fullName || u.phoneNumber)}
                                disabled={actionLoadingId === u.id}
                                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                title="Reactivate devotee account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Restore Account</span>
                              </button>
                              <button
                                onClick={() => handlePermanentDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                disabled={actionLoadingId === u.id}
                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                title="Permanently erase from MySQL database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Permanent Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Registered App Users</p>
                  <p className="text-2xl font-bold text-gray-100 mt-1">{users.length}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Real MySQL app_users</span>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Active Categories</p>
                  <p className="text-2xl font-bold text-[#FFB300] mt-1">{stats?.activeCategories ?? categories.length ?? 0}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Strict server-side paginated</span>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Languages in DB</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.totalLanguages ?? languages.length ?? 0}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Active configured languages</span>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Recorded Audit Logs</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">{auditLogs.length}</p>
                  <span className="text-[10px] text-orange-400 font-semibold">Tamper-evident log trail</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-400" />
                  <span>Master Administrator Profile</span>
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-400 uppercase mb-1">Email (Identity)</label>
                    <input
                      type="text"
                      value={adminProfile.email}
                      disabled
                      className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-400" />
                  <span>Rotate Password (Bcrypt Salt 12)</span>
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Rotate Password Securely
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: TICKETS MANAGEMENT */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                  onClick={() => { setSelectedTicketFilter('ALL'); loadTickets('ALL'); }}
                  className={`cursor-pointer bg-[#1E1E1E] p-4 rounded-xl border transition ${selectedTicketFilter === 'ALL' ? 'border-[#FFB300] bg-orange-950/20' : 'border-[#2C2C2C] hover:border-neutral-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-medium">All Tickets</p>
                    <LifeBuoy className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-100 mt-1">{ticketStats.total}</p>
                  <span className="text-[10px] text-gray-500 font-mono">Total inquiries</span>
                </div>

                <div
                  onClick={() => { setSelectedTicketFilter('OPEN'); loadTickets('OPEN'); }}
                  className={`cursor-pointer bg-[#1E1E1E] p-4 rounded-xl border transition ${selectedTicketFilter === 'OPEN' ? 'border-amber-500 bg-amber-950/20' : 'border-[#2C2C2C] hover:border-neutral-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-amber-400 font-medium">Open Tickets</p>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{ticketStats.open}</p>
                  <span className="text-[10px] text-amber-500 font-semibold">Awaiting reply</span>
                </div>

                <div
                  onClick={() => { setSelectedTicketFilter('IN_PROGRESS'); loadTickets('IN_PROGRESS'); }}
                  className={`cursor-pointer bg-[#1E1E1E] p-4 rounded-xl border transition ${selectedTicketFilter === 'IN_PROGRESS' ? 'border-sky-500 bg-sky-950/20' : 'border-[#2C2C2C] hover:border-neutral-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-sky-400 font-medium">In Progress</p>
                    <RefreshCw className="w-4 h-4 text-sky-400" />
                  </div>
                  <p className="text-2xl font-bold text-sky-400 mt-1">{ticketStats.inProgress}</p>
                  <span className="text-[10px] text-sky-400 font-mono">Under investigation</span>
                </div>

                <div
                  onClick={() => { setSelectedTicketFilter('RESOLVED'); loadTickets('RESOLVED'); }}
                  className={`cursor-pointer bg-[#1E1E1E] p-4 rounded-xl border transition ${selectedTicketFilter === 'RESOLVED' ? 'border-emerald-500 bg-emerald-950/20' : 'border-[#2C2C2C] hover:border-neutral-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-emerald-400 font-medium">Resolved</p>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{ticketStats.resolved}</p>
                  <span className="text-[10px] text-emerald-400 font-mono">Addressed by team</span>
                </div>

                <div
                  onClick={() => { setSelectedTicketFilter('CLOSED'); loadTickets('CLOSED'); }}
                  className={`cursor-pointer bg-[#1E1E1E] p-4 rounded-xl border transition ${selectedTicketFilter === 'CLOSED' ? 'border-gray-500 bg-neutral-900' : 'border-[#2C2C2C] hover:border-neutral-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-medium">Closed</p>
                    <Archive className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-400 mt-1">{ticketStats.closed}</p>
                  <span className="text-[10px] text-gray-500 font-mono">Archived tickets</span>
                </div>
              </div>

              {/* Tickets Table / List */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                <div className="p-4 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                      <LifeBuoy className="w-4 h-4 text-orange-400" />
                      <span>Devotee Support Inquiries & Tickets</span>
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      Dynamically fetched from MySQL <code className="text-amber-400 font-mono">support_tickets</code> table via API.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadTickets(selectedTicketFilter)}
                      className="px-3 py-1.5 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold flex items-center gap-1.5 text-gray-300 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-5 py-3">Ticket ID</th>
                        <th className="px-5 py-3">Devotee / Raised By</th>
                        <th className="px-5 py-3">Subject & Category</th>
                        <th className="px-5 py-3">Priority</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Created</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            <LifeBuoy className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                            <p className="text-sm font-semibold">No tickets found</p>
                            <p className="text-xs text-gray-500 mt-1">There are no inquiries matching the selected filter.</p>
                          </td>
                        </tr>
                      ) : (
                        tickets.map(t => {
                          const statusBg =
                            t.status === 'OPEN' ? 'bg-amber-950/60 text-amber-300 border-amber-800/40' :
                              t.status === 'IN_PROGRESS' ? 'bg-sky-950/60 text-sky-300 border-sky-800/40' :
                                t.status === 'RESOLVED' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' :
                                  'bg-neutral-800 text-gray-400 border-neutral-700';

                          const priorityBg =
                            t.priority === 'URGENT' ? 'text-rose-400 font-bold' :
                              t.priority === 'HIGH' ? 'text-orange-400 font-semibold' :
                                'text-gray-400';

                          return (
                            <tr key={t.id} className="hover:bg-neutral-800/40 transition">
                              <td className="px-5 py-3.5 font-mono text-orange-400 font-bold whitespace-nowrap">
                                {t.ticket_number}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="font-semibold text-gray-100">{t.user_name}</div>
                                <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                  <span>{t.user_phone || 'No phone'}</span>
                                  {t.user_email && <span>• {t.user_email}</span>}
                                </div>
                                <span className="inline-block mt-1 text-[9px] uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-gray-400 border border-neutral-700 font-mono">
                                  {t.user_role || 'DEVOTEE'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 max-w-md">
                                <div className="font-semibold text-gray-200 line-clamp-1">{t.subject}</div>
                                <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{t.message}</div>
                                <span className="inline-block mt-1 text-[10px] text-amber-400 font-mono">
                                  Category: {t.category || 'GENERAL'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px]">
                                <span className={priorityBg}>{t.priority || 'MEDIUM'}</span>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBg}`}>
                                  {t.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap text-[11px]">
                                {new Date(t.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedTicket(t);
                                      setTicketReplyText(t.admin_response || '');
                                      setIsTicketModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 bg-[#FFB300]/15 hover:bg-[#FFB300]/25 text-[#FFB300] border border-[#FFB300]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View & Reply</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTicket(t.id)}
                                    className="p-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-lg transition"
                                    title="Delete Ticket"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GODS & GODDESSES (DEITIES) MANAGEMENT */}
          {activeTab === 'gods' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#FFB300] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>Gods & Goddesses Sanctum Management</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Manage holy Deities, Avatars, Moola Mantras, Vahanas, and sacred shrines displayed in Saranam Ayyappa Web & Mobile apps.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={loadDeities}
                      className="px-3.5 py-2 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold flex items-center gap-1.5 text-gray-300 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={handleOpenCreateDeity}
                      className="px-4 py-2 bg-gradient-to-r from-[#D84315] to-[#BF360C] hover:from-[#BF360C] hover:to-[#A32F09] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-950 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Deity</span>
                    </button>
                  </div>
                </div>

                {/* Quick Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="bg-[#141414] border border-[#2C2C2C] rounded-lg p-3">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-medium">Total Deities</span>
                    <strong className="text-xl font-bold text-amber-400">{deities.length}</strong>
                  </div>
                  <div className="bg-[#141414] border border-[#2C2C2C] rounded-lg p-3">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-medium">Gods</span>
                    <strong className="text-xl font-bold text-orange-400">
                      {deities.filter(d => d.category === 'God').length}
                    </strong>
                  </div>
                  <div className="bg-[#141414] border border-[#2C2C2C] rounded-lg p-3">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-medium">Goddesses</span>
                    <strong className="text-xl font-bold text-rose-400">
                      {deities.filter(d => d.category === 'Goddess').length}
                    </strong>
                  </div>
                  <div className="bg-[#141414] border border-[#2C2C2C] rounded-lg p-3">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-medium">Active in Portal</span>
                    <strong className="text-xl font-bold text-emerald-400">
                      {deities.filter(d => d.isActive).length}
                    </strong>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-[#2C2C2C]">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    {['ALL', 'God', 'Goddess', 'Avatar', 'Cosmic Form'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setDeityCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${deityCategoryFilter === cat
                            ? 'bg-[#FFB300] text-black shadow-md'
                            : 'bg-[#141414] text-gray-400 hover:text-white border border-[#2C2C2C]'
                          }`}
                      >
                        {cat === 'ALL' ? 'All Deities' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search deity, mantra, temple..."
                      value={deitySearch}
                      onChange={(e) => setDeitySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>
              </div>

              {/* Deity Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {deities
                  .filter(deity => {
                    if (deityCategoryFilter !== 'ALL' && deity.category !== deityCategoryFilter) return false;
                    if (deitySearch.trim()) {
                      const q = deitySearch.toLowerCase();
                      const matchName = deity.name?.toLowerCase().includes(q);
                      const matchAlt = deity.alternateName?.toLowerCase().includes(q);
                      const matchMantra = deity.moolaMantra?.toLowerCase().includes(q);
                      const matchTemple = deity.primaryTemple?.toLowerCase().includes(q);
                      return matchName || matchAlt || matchMantra || matchTemple;
                    }
                    return true;
                  })
                  .map((deity) => (
                    <div
                      key={deity.id}
                      className={`bg-[#1E1E1E] rounded-xl border transition-all duration-200 hover:shadow-2xl flex flex-col justify-between overflow-hidden ${deity.isActive
                          ? 'border-[#2C2C2C] hover:border-[#FFB300]/60'
                          : 'border-red-900/30 opacity-75'
                        }`}
                    >
                      {/* Card Banner Image or Header */}
                      <div className="relative h-32 bg-gradient-to-br from-[#121212] to-[#252525] border-b border-[#2C2C2C] overflow-hidden">
                        {deity.imageUrl ? (
                          <img
                            src={resolveDeityImageUrl(deity.imageUrl)}
                            alt={deity.name}
                            className="w-full h-full object-cover opacity-85 hover:opacity-100 transition duration-300"
                            onError={(e: any) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('saranamayyappa.in') && !target.src.startsWith('data:')) {
                                target.src = `https://saranamayyappa.in${deity.imageUrl?.startsWith('/') ? '' : '/'}${deity.imageUrl}`;
                              } else {
                                target.src = 'https://saranamayyappa.in/images/temples/banner-sabarimala-hd.png';
                              }
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${deity.category === 'Goddess'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                                : deity.category === 'Avatar'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                              }`}
                          >
                            {deity.category}
                          </span>

                          <button
                            onClick={() => handleToggleDeityStatus(deity)}
                            title={deity.isActive ? 'Active in Portal' : 'Inactive'}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition ${deity.isActive
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${deity.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                            {deity.isActive ? 'Active' : 'Hidden'}
                          </button>
                        </div>

                        {/* Title Overlay */}
                        <div className="absolute bottom-2 left-3 right-3">
                          <h3 className="text-base font-bold text-gray-100 drop-shadow flex items-center gap-1.5">
                            <span>{(deity as any).translations?.[selectedLang]?.name || deity.name}</span>
                          </h3>
                          {((deity as any).translations?.[selectedLang]?.alternateName || deity.alternateName) && (
                            <p className="text-[11px] text-amber-300/90 font-medium truncate">
                              {(deity as any).translations?.[selectedLang]?.alternateName || deity.alternateName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          {/* Moola Mantra Box */}
                          {((deity as any).translations?.[selectedLang]?.moolaMantra || deity.moolaMantra) && (
                            <div className="bg-[#141414] border border-amber-900/30 rounded-lg p-2.5">
                              <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">
                                Sacred Moola Mantra
                              </span>
                              <p className="text-xs text-amber-100/90 font-serif italic mt-0.5">
                                "{(deity as any).translations?.[selectedLang]?.moolaMantra || deity.moolaMantra}"
                              </p>
                            </div>
                          )}

                          {/* Vahana and Kshetram */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {((deity as any).translations?.[selectedLang]?.vahana || deity.vahana) && (
                              <div className="bg-[#161616] border border-[#2C2C2C] rounded p-2">
                                <span className="text-[10px] text-gray-400 block font-medium">Sacred Vahana</span>
                                <span className="text-gray-200 font-semibold truncate block mt-0.5">
                                  {(deity as any).translations?.[selectedLang]?.vahana || deity.vahana}
                                </span>
                              </div>
                            )}
                            {((deity as any).translations?.[selectedLang]?.primaryTemple || deity.primaryTemple) && (
                              <div className="bg-[#161616] border border-[#2C2C2C] rounded p-2">
                                <span className="text-[10px] text-gray-400 block font-medium">Primary Kshetram</span>
                                <span className="text-gray-200 font-semibold truncate block mt-0.5" title={(deity as any).translations?.[selectedLang]?.primaryTemple || deity.primaryTemple}>
                                  {(deity as any).translations?.[selectedLang]?.primaryTemple || deity.primaryTemple}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {((deity as any).translations?.[selectedLang]?.description || deity.description) && (
                            <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                              {(deity as any).translations?.[selectedLang]?.description || deity.description}
                            </p>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-[#2C2C2C] flex items-center justify-between">
                          <span className="text-[11px] text-gray-500 font-mono">
                            Order #{deity.displayOrder || 1}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditDeity(deity)}
                              className="px-2.5 py-1 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] hover:border-amber-500/50 rounded text-xs font-semibold text-gray-300 hover:text-amber-400 flex items-center gap-1 transition"
                            >
                              <Edit className="w-3 h-3 text-amber-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDeity(deity.id)}
                              className="p-1 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 rounded text-gray-400 hover:text-red-400 transition"
                              title="Delete Deity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Empty State */}
              {deities.length === 0 && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-12 text-center">
                  <Sparkles className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-200">No Deities Found</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    Click "Add New Deity" above to register and consecrate a holy shrine deity entry.
                  </p>
                </div>
              )}

              {/* CREATE / EDIT DEITY MODAL */}
              {isDeityModalOpen && editingDeity && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-[#1E1E1E] border border-[#FFB300]/40 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
                    <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
                      <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{editingDeity.id ? 'Edit Deity Details' : 'Register New Deity'}</span>
                      </h3>
                      <button
                        onClick={() => { setIsDeityModalOpen(false); setEditingDeity(null); }}
                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#252525] transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveDeity} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Deity Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Lord Ayyappa"
                            value={editingDeity.name || ''}
                            onChange={(e) => setEditingDeity({ ...editingDeity, name: e.target.value })}
                            className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Alternate Name / Titles
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Dharma Sastha / Manikanta Swamy"
                            value={editingDeity.alternateName || ''}
                            onChange={(e) => setEditingDeity({ ...editingDeity, alternateName: e.target.value })}
                            className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Category / Form
                          </label>
                          <select
                            value={editingDeity.category || 'God'}
                            onChange={(e) => setEditingDeity({ ...editingDeity, category: e.target.value })}
                            className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                          >
                            <option value="God">God (Deva)</option>
                            <option value="Goddess">Goddess (Devi / Shakthi)</option>
                            <option value="Avatar">Avatar</option>
                            <option value="Cosmic Form">Cosmic Form</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Sacred Vahana (Vehicle)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Tiger, Mouse, Garuda, Nandi"
                            value={editingDeity.vahana || ''}
                            onChange={(e) => setEditingDeity({ ...editingDeity, vahana: e.target.value })}
                            className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editingDeity.displayOrder || 1}
                            onChange={(e) => setEditingDeity({ ...editingDeity, displayOrder: parseInt(e.target.value, 10) || 1 })}
                            className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300 block mb-1">
                          Primary Moola Mantra
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Om Swamiye Saranam Ayyappa"
                          value={editingDeity.moolaMantra || ''}
                          onChange={(e) => setEditingDeity({ ...editingDeity, moolaMantra: e.target.value })}
                          className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-amber-300 font-serif focus:outline-none focus:border-[#FFB300]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300 block mb-1">
                          Primary Kshetram / Temple
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sabarimala Sri Ayyappa Temple"
                          value={editingDeity.primaryTemple || ''}
                          onChange={(e) => setEditingDeity({ ...editingDeity, primaryTemple: e.target.value })}
                          className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                        />
                      </div>

                      {/* Deity Banner / Image File Upload with Preview */}
                      <div>
                        <label className="text-xs font-semibold text-gray-300 block mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                            <span>Banner / Deity Image</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">Supports PNG, JPG, WebP file upload</span>
                        </label>

                        <div className="bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 flex flex-col sm:flex-row items-center gap-4">
                          {/* Image Preview Box */}
                          <div className="w-24 h-24 rounded-lg bg-[#1E1E1E] border border-[#333] overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-inner">
                            {editingDeity.imageUrl ? (
                              <img
                                src={resolveDeityImageUrl(editingDeity.imageUrl)}
                                alt="Deity Preview"
                                className="w-full h-full object-cover"
                                onError={(e: any) => {
                                  const target = e.currentTarget;
                                  if (!target.src.includes('saranamayyappa.in') && !target.src.startsWith('data:')) {
                                    target.src = `https://saranamayyappa.in${editingDeity.imageUrl?.startsWith('/') ? '' : '/'}${editingDeity.imageUrl}`;
                                  } else {
                                    target.src = 'https://saranamayyappa.in/images/temples/banner-sabarimala-hd.png';
                                  }
                                }}
                              />
                            ) : (
                              <div className="text-center text-gray-500 p-2">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                                <span className="text-[10px] block">No Image</span>
                              </div>
                            )}
                          </div>

                          {/* Upload Actions */}
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="cursor-pointer px-3.5 py-1.5 bg-[#D84315] hover:bg-[#BF360C] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-orange-950/40 transition">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Image File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleDeityImageFileUpload}
                                  className="hidden"
                                />
                              </label>

                              {editingDeity.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setEditingDeity({ ...editingDeity, imageUrl: '' })}
                                  className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/40 text-red-300 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>

                            {/* Direct URL / Path field fallback */}
                            <div className="pt-1">
                              <span className="text-[10px] text-gray-400 block mb-0.5">Or Direct URL / Path:</span>
                              <input
                                type="text"
                                placeholder="https://... or /images/..."
                                value={editingDeity.imageUrl?.startsWith('data:') ? '[New Uploaded Image File Selected]' : (editingDeity.imageUrl || '')}
                                onChange={(e) => setEditingDeity({ ...editingDeity, imageUrl: e.target.value })}
                                className="w-full px-2.5 py-1 bg-[#1A1A1A] border border-[#2C2C2C] rounded text-[11px] text-gray-200 focus:outline-none focus:border-[#FFB300]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300 block mb-1">
                          Description & Spiritual Mahatyam
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Spiritual significance, lore, and divine attributes..."
                          value={editingDeity.description || ''}
                          onChange={(e) => setEditingDeity({ ...editingDeity, description: e.target.value })}
                          className="w-full px-3 py-2 bg-[#141414] border border-[#2C2C2C] rounded-lg text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="deityIsActive"
                          checked={editingDeity.isActive !== false}
                          onChange={(e) => setEditingDeity({ ...editingDeity, isActive: e.target.checked })}
                          className="rounded border-[#2C2C2C] text-[#FFB300] focus:ring-0 bg-[#141414]"
                        />
                        <label htmlFor="deityIsActive" className="text-xs font-medium text-gray-300">
                          Publish & Display Deity in Saranam Ayyappa Apps
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2C]">
                        <button
                          type="button"
                          onClick={() => { setIsDeityModalOpen(false); setEditingDeity(null); }}
                          className="px-4 py-2 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold text-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-gradient-to-r from-[#D84315] to-[#BF360C] hover:from-[#BF360C] hover:to-[#A32F09] text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-950 transition"
                        >
                          Save Deity Entry
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: TEMPLE TYPES MANAGEMENT (Create, Update, Delete, View) */}
          {activeTab === 'temple_types' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-orange-400" />
                      <span>Temple Types & Sanctum Classification</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Manage dynamic temple classifications (Main Temple, Sub Temple, Multi Temple complex, etc.). Devotees & Dharma Karthas select from these types when registering shrines. Stored dynamically in MySQL <code className="text-amber-400">app_settings</code>.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={loadTempleTypes}
                      className="px-3 py-1.5 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold flex items-center gap-1.5 text-gray-300 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={handleOpenCreateTempleType}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition shadow-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Temple Type</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Temple Types Grid / Table Card */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3.5">Type Identifier (Code)</th>
                        <th className="px-6 py-3.5">Display Name</th>
                        <th className="px-6 py-3.5">Description & Purpose</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {templeTypes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                            <Landmark className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                            <p className="text-sm font-semibold">No temple types configured</p>
                            <p className="text-xs text-gray-500 mt-1">Click "Add Temple Type" above to create your first category.</p>
                          </td>
                        </tr>
                      ) : (
                        templeTypes.map(t => (
                          <tr key={t.id} className="hover:bg-neutral-800/40 transition">
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded">
                                {t.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-sm text-gray-100 flex items-center gap-2">
                                <span className="text-orange-400">🛕</span>
                                {t.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 max-w-md">
                              {t.description || '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditTempleType(t)}
                                  className="px-3 py-1.5 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] hover:border-amber-400 text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                                >
                                  <Edit className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTempleType(t.id, t.name)}
                                  className="p-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-lg transition"
                                  title="Delete Temple Type"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS (ONLY MANAGE LOGO, COLORS, TEXT TITLE, DESCRIPTION) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-400" />
                      <span>Platform Settings: Logo, Colors, Title & Description</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Configure your official sacred emblem, platform name, spiritual motto tagline, meta description, and primary devotional palette. All values are stored directly in MySQL <code className="text-amber-400">app_settings</code>.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveBrandingSettings}
                    disabled={isSavingSettings}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-lg flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSettings ? 'Saving Settings...' : 'Save All Settings to MySQL'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Official Sacred Logo & Emblem Management */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C2C2C] pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-orange-400" />
                      <span>1. Official Sacred Emblem & Logo</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Syncs dynamically with Website header, Role Selection screen, Admin portal, and Mobile Application.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
                    ● MySQL Synced
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Current Active Logo Preview */}
                  <div className="lg:col-span-4 bg-[#141414] border border-[#2C2C2C] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Active Portal Emblem
                    </span>
                    <div className="relative group w-44 h-44 rounded-2xl bg-black/60 border-2 border-[var(--admin-gold)]/60 flex items-center justify-center p-3 shadow-2xl overflow-hidden">
                      <img
                        src={resolveLogoDisplayUrl(appLogoUrl)}
                        alt="Active Saranam Ayyappa Logo"
                        className="max-w-full max-h-full object-contain drop-shadow-[0_4px_12px_rgba(255,179,0,0.25)] transition duration-300 group-hover:scale-105"
                        onError={(e: any) => { console.warn('Active emblem load error:', e.target.src); }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono mt-3 truncate max-w-full">
                      {appLogoUrl.startsWith('data:') ? 'Base64 Encoded Image Data' : appLogoUrl}
                    </p>
                  </div>

                  {/* Upload & Direct URL Controls */}
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                        Upload New Sacred Emblem / Logo File
                      </label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#3A3A3A] hover:border-orange-500/80 rounded-xl p-6 bg-[#161616] cursor-pointer transition group">
                        <Upload className="w-8 h-8 text-orange-400 group-hover:scale-110 transition mb-2" />
                        <span className="text-xs font-semibold text-gray-200">
                          Click to browse and upload image
                        </span>
                        <span className="text-[11px] text-gray-500 mt-1">
                          PNG, JPG, or WEBP (Max 5MB) • Instantly stores to database
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-[#2C2C2C] w-full" />
                      <span className="bg-[#1E1E1E] px-3 text-[11px] text-gray-500 font-semibold uppercase">Or Set Direct Path</span>
                      <div className="border-t border-[#2C2C2C] w-full" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                        Direct Static Image Path / External CDN URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customLogoInput}
                          onChange={(e) => setCustomLogoInput(e.target.value)}
                          placeholder="/images/saranam-ayyappa-official-emblem.jpg"
                          className="flex-1 bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                        />
                        <button
                          onClick={() => handleSaveAppLogo()}
                          disabled={isUpdatingLogo}
                          className="bg-[#D84315] hover:bg-[#BF360C] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 flex-shrink-0"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isUpdatingLogo ? 'Saving...' : 'Sync Logo'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Platform Text Title & Description Management */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>2. Platform Title, Tagline & Meta Description</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => openTranslationModal('branding', 'branding_settings', [
                      { key: 'title', label: 'Platform Name / Title', value: appTitle },
                      { key: 'tagline', label: 'Sacred Motto / Tagline', value: appTagline },
                      { key: 'description', label: 'Platform Devotional Description', value: appDescription }
                    ], (trans) => {
                      if (trans.title) setAppTitle(trans.title);
                      if (trans.tagline) setAppTagline(trans.tagline);
                      if (trans.description) setAppDescription(trans.description);
                    })}
                    className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>✨ Translate (v3)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Platform Name / Header Title
                    </label>
                    <input
                      type="text"
                      value={appTitle}
                      onChange={(e) => setAppTitle(e.target.value)}
                      placeholder="e.g. Saranam Ayyappa"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Sacred Motto / Tagline
                    </label>
                    <input
                      type="text"
                      value={appTagline}
                      onChange={(e) => setAppTagline(e.target.value)}
                      placeholder="e.g. Connect.. Pray.. Serve.."
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Platform Devotional Description & Meta Summary
                  </label>
                  <textarea
                    rows={3}
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    placeholder="Enter platform devotional description..."
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* 3. Devotional Theme Colors Management */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 border-b border-[#2C2C2C] pb-3">
                  <Palette className="w-4 h-4 text-orange-400" />
                  <span>3. Platform Devotional Color Palette</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Primary Color */}
                  <div className="bg-[#141414] border border-[#2C2C2C] p-3.5 rounded-lg space-y-2">
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase">
                      Primary Sacred Green
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themePrimaryColor}
                        onChange={(e) => setThemePrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-[#2C2C2C] bg-transparent"
                      />
                      <input
                        type="text"
                        value={themePrimaryColor}
                        onChange={(e) => setThemePrimaryColor(e.target.value)}
                        className="flex-1 bg-[#1E1E1E] border border-[#2C2C2C] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="bg-[#141414] border border-[#2C2C2C] p-3.5 rounded-lg space-y-2">
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase">
                      Accent Devotional Gold
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeSecondaryColor}
                        onChange={(e) => setThemeSecondaryColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-[#2C2C2C] bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeSecondaryColor}
                        onChange={(e) => setThemeSecondaryColor(e.target.value)}
                        className="flex-1 bg-[#1E1E1E] border border-[#2C2C2C] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="bg-[#141414] border border-[#2C2C2C] p-3.5 rounded-lg space-y-2">
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase">
                      Background Ivory Tone
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeBackgroundColor}
                        onChange={(e) => setThemeBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-[#2C2C2C] bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeBackgroundColor}
                        onChange={(e) => setThemeBackgroundColor(e.target.value)}
                        className="flex-1 bg-[#1E1E1E] border border-[#2C2C2C] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200"
                      />
                    </div>
                  </div>

                  {/* Surface / Dark Base Color */}
                  <div className="bg-[#141414] border border-[#2C2C2C] p-3.5 rounded-lg space-y-2">
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase">
                      Dark Surface / Console Base
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeSurfaceColor}
                        onChange={(e) => setThemeSurfaceColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-[#2C2C2C] bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeSurfaceColor}
                        onChange={(e) => setThemeSurfaceColor(e.target.value)}
                        className="flex-1 bg-[#1E1E1E] border border-[#2C2C2C] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Mobile Application Download Links */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 border-b border-[#2C2C2C] pb-3">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <span>4. Mobile Application Store Links</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Google Play Store */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5 flex items-center justify-between">
                      <span>Google Play Store URL (Android)</span>
                      <a href={playStoreUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-normal lowercase">
                        <span>test link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </label>
                    <input
                      type="url"
                      value={playStoreUrl}
                      onChange={(e) => setPlayStoreUrl(e.target.value)}
                      placeholder="https://play.google.com/store/apps/details?id=com.saranamayyappa.app"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Targeted by the footer &quot;Get it on Google Play&quot; download badge.
                    </p>
                  </div>

                  {/* Apple App Store */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5 flex items-center justify-between">
                      <span>Apple App Store URL (iOS)</span>
                      <a href={appStoreUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-normal lowercase">
                        <span>test link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </label>
                    <input
                      type="url"
                      value={appStoreUrl}
                      onChange={(e) => setAppStoreUrl(e.target.value)}
                      placeholder="https://apps.apple.com/app/saranam-ayyappa/id123456789"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Targeted by the footer &quot;Download on the App Store&quot; badge.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Official Social Media & Community Handles */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 border-b border-[#2C2C2C] pb-3">
                  <Share2 className="w-4 h-4 text-orange-400" />
                  <span>5. Official Devotional Social Media & Channel Links</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* YouTube */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      YouTube Devotional Channel
                    </label>
                    <input
                      type="url"
                      value={socialYoutubeUrl}
                      onChange={(e) => setSocialYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/@SaranamAyyappaOfficial"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                    />
                  </div>

                  {/* Telegram */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Telegram Devotee Satsang Group
                    </label>
                    <input
                      type="url"
                      value={socialTelegramUrl}
                      onChange={(e) => setSocialTelegramUrl(e.target.value)}
                      placeholder="https://t.me/saranam_ayyappa_satsang"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                    />
                  </div>

                  {/* WhatsApp Channel */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      WhatsApp Updates Channel
                    </label>
                    <input
                      type="url"
                      value={socialWhatsappUrl}
                      onChange={(e) => setSocialWhatsappUrl(e.target.value)}
                      placeholder="https://whatsapp.com/channel/saranamayyappa"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Instagram Devotional Profile
                    </label>
                    <input
                      type="url"
                      value={socialInstagramUrl}
                      onChange={(e) => setSocialInstagramUrl(e.target.value)}
                      placeholder="https://www.instagram.com/saranamayyappa_official"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Facebook Community Page
                    </label>
                    <input
                      type="url"
                      value={socialFacebookUrl}
                      onChange={(e) => setSocialFacebookUrl(e.target.value)}
                      placeholder="https://www.facebook.com/saranamayyappaportal"
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Devotional Announcement Ticker */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-orange-400" />
                    <span>6. Devotional Announcement Ticker</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => openTranslationModal('ticker', 'announcement_ticker', [
                      { key: 'ticker', label: 'Announcement Ticker Text', value: tickerText }
                    ], (trans) => {
                      if (trans.ticker) setTickerText(trans.ticker);
                    })}
                    className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>✨ Translate (v3)</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Live Scrolling Announcement Text (Devotee Apps &amp; Web Header)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tickerText}
                      onChange={(e) => setTickerText(e.target.value)}
                      placeholder="e.g. స్వామియే శరణం అయ్యప్ప! శబరిమల మండల పూజ దర్శన సమయాలు ప్రారంభమైనవి..."
                      className="flex-1 bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTicker}
                      className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 flex-shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Ticker</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Save Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveBrandingSettings}
                  disabled={isSavingSettings}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-8 py-3 rounded-lg text-xs font-bold transition shadow-xl flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving Settings...' : 'Save Settings to MySQL Database'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 12: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Tamper-Evident Admin Audit Trail</h2>
                  <p className="text-xs text-gray-400">All administrative operations recorded in MySQL `admin_audit_logs`.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Admin</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Target</th>
                      <th className="px-6 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          <Database className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                          <p className="text-sm font-semibold">No audit logs recorded in database yet</p>
                          <p className="text-xs text-gray-500 mt-1">Actions performed by administrators will appear here in chronological order.</p>
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 font-semibold text-gray-200">{log.admin?.fullName || 'System Master'}</td>
                          <td className="px-6 py-4 font-mono text-orange-400">{log.action}</td>
                          <td className="px-6 py-4">{log.targetType} {log.targetId ? `#${log.targetId}` : ''}</td>
                          <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{log.detailsJson || '—'}</td>
                        </tr>
                      )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* In-page views active: floating modals replaced with in-page pageMode views */}

      {/* Modal Dialog for Language Create / Edit */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-400" />
              <span>{editingLangId ? 'Edit Language' : 'Create New Language'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Language Name</label>
                <input
                  type="text"
                  value={langName}
                  onChange={(e) => setLangName(e.target.value)}
                  placeholder="e.g. Telugu"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-300 uppercase">Native Name (Native Script)</label>
                  <button
                    type="button"
                    onClick={handleAutoTranslateNativeName}
                    disabled={isTranslatingNative || (!langName.trim() && !langCode.trim())}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-semibold transition disabled:opacity-40"
                    title="Automatically convert Language Name into its authentic Native Script"
                  >
                    {isTranslatingNative ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Auto-Translate Native Script</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={langNativeName}
                  onChange={(e) => setLangNativeName(e.target.value)}
                  placeholder="e.g. తెలుగు or click Auto-Translate"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-orange-400 font-semibold focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">ISO Code (e.g. te, kn, en, ta, hi)</label>
                <input
                  type="text"
                  value={langCode}
                  onChange={(e) => setLangCode(e.target.value)}
                  placeholder="e.g. te"
                  maxLength={10}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLanguage}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
              >
                Save Language
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Devotional Content Create / Edit */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              <span>{editingContentId ? 'Edit Devotional Content / Sacred Verse' : 'Add Sacred Verse / Devotional Detail'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Category Association</label>
                <select
                  value={contentCategoryId}
                  onChange={(e) => setContentCategoryId(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Verse / Stotra Title</label>
                <input
                  type="text"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  placeholder="e.g. హరివరాసనం ప్రథమ శ్లోకం"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1 flex items-center justify-between">
                  <span>Sacred Verse Text (Rich WYSIWYG & HTML)</span>
                  <span className="text-amber-400 font-mono text-[10px]">CKEditor Mode</span>
                </label>
                <RichTextEditor
                  value={contentSacredText}
                  onChange={(val) => setContentSacredText(val)}
                  placeholder="Enter or paste sacred slokas, lines, and mantras..."
                  minHeight="180px"
                  hideTemplateBtn={true}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1 flex items-center justify-between">
                  <span>Spiritual Meaning / Devotional Explanation</span>
                  <span className="text-amber-400 font-mono text-[10px]">CKEditor Mode</span>
                </label>
                <RichTextEditor
                  value={contentMeaning}
                  onChange={(val) => setContentMeaning(val)}
                  placeholder="Enter detailed spiritual translation and explanation..."
                  minHeight="180px"
                  hideTemplateBtn={true}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#2C2C2C]">
              <button
                type="button"
                onClick={() => openTranslationModal('devotional', editingContentId || undefined, [
                  { key: 'title', label: 'Verse / Stotra Title', value: contentTitle },
                  { key: 'sacredText', label: 'Sacred Verse Text', value: contentSacredText, isHtml: true },
                  { key: 'meaning', label: 'Spiritual Meaning', value: contentMeaning, isHtml: true }
                ], (trans, lang) => {
                  if (trans.title) setContentTitle(trans.title);
                  if (trans.sacredText) setContentSacredText(trans.sacredText);
                  if (trans.meaning) setContentMeaning(trans.meaning);
                  if (lang) setSelectedLang(lang);
                })}
                className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>✨ Translate (v3)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsContentModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContent}
                  className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
                >
                  {editingContentId ? 'Update Sacred Verse' : 'Save Sacred Verse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Festival Create & Edit */}
      {isFestivalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2C]">
              <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                <span>{editingFestivalId ? `Edit Festival (#${editingFestivalId})` : 'Create Sabarimala Festival / Observance'}</span>
              </h3>
              <button
                onClick={() => setIsFestivalModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">
                  Festival Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  placeholder="e.g. మండల పూజ (Mandala Pooja)"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 font-semibold focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 uppercase mb-1">
                    Annual / Observance Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={festivalDate}
                    onChange={(e) => setFestivalDate(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 uppercase mb-1">
                    Slug / URL Identifier
                  </label>
                  <input
                    type="text"
                    value={festivalSlug}
                    onChange={(e) => setFestivalSlug(e.target.value)}
                    placeholder="e.g. mandala-pooja-finale"
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 font-mono focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">
                  Source & Observance Note
                </label>
                <textarea
                  rows={3}
                  value={festivalNote}
                  onChange={(e) => setFestivalNote(e.target.value)}
                  placeholder="Sabarimala Devaswom verified calendar, sacred rituals, or temple tradition note..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="festivalPublishToggle"
                  checked={festivalIsPublished}
                  onChange={(e) => setFestivalIsPublished(e.target.checked)}
                  className="rounded bg-[#121212] border-[#2C2C2C] text-orange-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="festivalPublishToggle" className="text-gray-300 font-semibold cursor-pointer">
                  Publish to mobile app & devotee calendar
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#2C2C2C]">
              <button
                type="button"
                onClick={() => openTranslationModal('festivals', editingFestivalId ?? undefined, [
                  { key: 'name', label: 'Festival Name', value: festivalName },
                  { key: 'description', label: 'Source & Observance Note', value: festivalNote }
                ], (trans) => {
                  if (trans.name) setFestivalName(trans.name);
                  if (trans.description) setFestivalNote(trans.description);
                })}
                className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>✨ Auto-Translate</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFestivalModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFestival}
                  disabled={isSavingFestival}
                  className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {isSavingFestival ? 'Saving...' : editingFestivalId ? 'Update Festival' : 'Create Festival'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for View Festival By ID */}
      {isViewFestivalModalOpen && selectedViewFestival && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2C]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100">
                    {selectedViewFestival.translations?.find((t: any) => t.language?.code === selectedLang)?.name || selectedViewFestival.name || selectedViewFestival.slug}
                  </h3>
                  <p className="text-[11px] font-mono text-amber-400">Festival ID: #{selectedViewFestival.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewFestivalModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Annual Observance Date</span>
                  <span className="font-mono text-amber-300 font-semibold text-sm">
                    📅 {new Date(selectedViewFestival.festivalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Publish Status</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${selectedViewFestival.isPublished !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-neutral-700 text-gray-300'
                    }`}>
                    {selectedViewFestival.isPublished !== false ? 'Published & Active' : 'Draft / Archived'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">URL Identifier (Slug)</span>
                <span className="font-mono text-gray-200 bg-[#141414] px-2.5 py-1 rounded border border-[#2C2C2C] inline-block">
                  {selectedViewFestival.slug}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Source & Observance Note</span>
                <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C] text-gray-300 leading-relaxed">
                  {selectedViewFestival.sourceNote || 'No specific observance notes provided.'}
                </div>
              </div>

              {selectedViewFestival.translations && selectedViewFestival.translations.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">
                    Multilingual Translations ({selectedViewFestival.translations.length})
                  </span>
                  <div className="bg-[#141414] rounded-lg border border-[#2C2C2C] divide-y divide-[#2C2C2C] max-h-40 overflow-y-auto">
                    {selectedViewFestival.translations.map((t: any, idx: number) => (
                      <div key={idx} className="p-2.5 flex items-start justify-between gap-3 text-[11px]">
                        <div>
                          <div className="font-semibold text-gray-100">{t.name}</div>
                          {t.description && <div className="text-gray-400 text-[10px] mt-0.5">{t.description}</div>}
                        </div>
                        <span className="px-2 py-0.5 bg-neutral-800 text-amber-300 rounded font-mono text-[10px] uppercase shrink-0">
                          {t.language?.code || t.language?.name || 'Local'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2C2C2C]">
              <button
                onClick={() => {
                  const target = selectedViewFestival;
                  setIsViewFestivalModalOpen(false);
                  handleOpenEditFestival(target);
                }}
                className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-4 py-2 rounded-lg text-xs font-semibold transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Festival</span>
              </button>

              <button
                onClick={() => setIsViewFestivalModalOpen(false)}
                className="bg-[#2C2C2C] hover:bg-[#383838] text-gray-200 px-5 py-2 rounded-lg text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for View & Reply Ticket */}
      {isTicketModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#2C2C2C] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#FFB300]">{selectedTicket.ticket_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedTicket.status === 'OPEN' ? 'bg-amber-950/60 text-amber-300 border-amber-800/40' :
                      selectedTicket.status === 'IN_PROGRESS' ? 'bg-sky-950/60 text-sky-300 border-sky-800/40' :
                        selectedTicket.status === 'RESOLVED' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' :
                          'bg-neutral-800 text-gray-400 border-neutral-700'
                    }`}>
                    {selectedTicket.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Priority: {selectedTicket.priority || 'MEDIUM'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-100 mt-1">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Devotee Information Card */}
            <div className="bg-[#141414] border border-[#2C2C2C] rounded-xl p-4 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252525] pb-2">
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-semibold block">Devotee Name</span>
                  <span className="font-bold text-gray-100 text-sm">{selectedTicket.user_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-semibold block">Role</span>
                  <span className="font-mono text-amber-400 font-semibold">{selectedTicket.user_role || 'DEVOTEE'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-semibold block">Phone</span>
                  <span className="font-mono text-gray-200">{selectedTicket.user_phone || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-semibold block">Email</span>
                  <span className="font-mono text-gray-200">{selectedTicket.user_email || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 uppercase text-[10px] font-semibold block mb-1">Inquiry / Issue Description</span>
                <div className="p-3 bg-[#1A1A1A] border border-[#2C2C2C] rounded-lg text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>
            </div>

            {/* Administrative Resolution & Response */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300 uppercase">
                Official Administrative Response / Action Taken
              </label>
              <textarea
                rows={4}
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                placeholder="Type resolution message or notes sent to devotee..."
                className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
              />
            </div>

            {/* Quick Status Changers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2C2C2C]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-semibold uppercase">Set Status:</span>
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                  disabled={isUpdatingTicket}
                  className="px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/40 rounded-lg text-xs font-semibold transition"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'RESOLVED')}
                  disabled={isUpdatingTicket}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'CLOSED')}
                  disabled={isUpdatingTicket}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-300 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
                >
                  Close Dialog
                </button>
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, selectedTicket.status)}
                  disabled={isUpdatingTicket}
                  className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUpdatingTicket ? 'Saving...' : 'Save Resolution'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SACRED TEMPLE VIEW DETAILS MODAL */}
      {isViewingTemple && viewingTempleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1E1E1E] rounded-2xl border border-[#FFB300]/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Hero Banner */}
            <div className="relative h-48 bg-neutral-900 border-b border-[#2C2C2C] overflow-hidden">
              <img
                src={resolveTempleImageUrl(viewingTempleItem.heroImageUrl || viewingTempleItem.thumbnailUrl)}
                alt={viewingTempleItem.name}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  e.currentTarget.src = 'https://saranamayyappa.in/images/temples/banner-sabarimala-hd.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-black/40" />
              <button
                type="button"
                onClick={() => {
                  setIsViewingTemple(false);
                  setViewingTempleItem(null);
                }}
                className="absolute top-3 right-3 text-white bg-black/60 hover:bg-black p-1.5 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-800/60 mb-1">
                  🕉️ {viewingTempleItem.deityName || viewingTempleItem.deityId || 'Lord Ayyappa'}
                </span>
                <h2 className="text-xl font-extrabold text-white drop-shadow">
                  {viewingTempleItem.name}
                </h2>
                {viewingTempleItem.originalName && viewingTempleItem.originalName !== viewingTempleItem.name && (
                  <p className="text-xs text-amber-300/90 font-medium">
                    English: {viewingTempleItem.originalName}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-gray-300">
              {/* Location & Timings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141414] p-4 rounded-xl border border-[#2C2C2C]">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span>Sacred Location</span>
                  </h4>
                  <p className="font-semibold text-gray-200">{viewingTempleItem.city}, {viewingTempleItem.state}</p>
                  {viewingTempleItem.district && <p className="text-gray-400">District: {viewingTempleItem.district}</p>}
                  {viewingTempleItem.address && <p className="text-gray-400 mt-1 leading-relaxed">{viewingTempleItem.address}</p>}
                  {viewingTempleItem.pincode && <p className="text-gray-500">Pincode: {viewingTempleItem.pincode}</p>}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Darshan Timings</span>
                  </h4>
                  {viewingTempleItem.timings ? (
                    <div className="space-y-1">
                      {viewingTempleItem.timings.morning && (
                        <p><strong className="text-gray-200">Morning:</strong> {viewingTempleItem.timings.morning}</p>
                      )}
                      {viewingTempleItem.timings.evening && (
                        <p><strong className="text-gray-200">Evening:</strong> {viewingTempleItem.timings.evening}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Open Daily for Pilgrims</p>
                  )}
                  {viewingTempleItem.hasLiveDarshan && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-800/40 text-rose-300 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span>Live Darshan Broadcast Available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About & History */}
              {viewingTempleItem.about && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">About the Temple</h4>
                  <p className="text-gray-300 leading-relaxed bg-[#141414] p-3.5 rounded-lg border border-[#2C2C2C]">
                    {viewingTempleItem.about}
                  </p>
                </div>
              )}

              {viewingTempleItem.history && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">Sacred History & Puranic Context</h4>
                  <p className="text-gray-300 leading-relaxed bg-[#141414] p-3.5 rounded-lg border border-[#2C2C2C]">
                    {viewingTempleItem.history}
                  </p>
                </div>
              )}

              {/* Specialities */}
              {Array.isArray(viewingTempleItem.speciality) && viewingTempleItem.speciality.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">Sacred Specialities & Pilgrimage Features</h4>
                  <ul className="space-y-1.5 bg-[#141414] p-3.5 rounded-lg border border-[#2C2C2C]">
                    {viewingTempleItem.speciality.map((s: string, sIdx: number) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Info */}
              {viewingTempleItem.contact && (viewingTempleItem.contact.phone || viewingTempleItem.contact.email || viewingTempleItem.contact.website) && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">Official Devasthanam Contact</h4>
                  <div className="flex flex-wrap gap-3 bg-[#141414] p-3.5 rounded-lg border border-[#2C2C2C]">
                    {viewingTempleItem.contact.phone && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-gray-200 font-medium">{viewingTempleItem.contact.phone}</span>
                      </div>
                    )}
                    {viewingTempleItem.contact.email && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-gray-200 font-medium">{viewingTempleItem.contact.email}</span>
                      </div>
                    )}
                    {viewingTempleItem.contact.website && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Website:</span>
                        <a href={viewingTempleItem.contact.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">
                          {viewingTempleItem.contact.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewingTemple(false);
                    setViewingTempleItem(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = viewingTempleItem;
                    setIsViewingTemple(false);
                    setViewingTempleItem(null);
                    handleOpenEditTemple(t);
                  }}
                  className="flex items-center gap-1.5 bg-[#FFB300] hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition shadow-md"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Temple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SACRED TEMPLE CREATE / EDIT MODAL */}
      {isTempleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1E1E1E] rounded-2xl border border-[#2C2C2C] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#2C2C2C] bg-[#171717] sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label="mandir">🛕</span>
                <div>
                  <h3 className="font-bold text-gray-100 text-base">
                    {editingTemple ? `Edit Sacred Mandir: ${editingTemple.name}` : 'Register a Holy Mandir'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Submit temple details, sanctum heritage, and contact information for Super Admin verification and inclusion in the Saranam Ayyappa sacred directory.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTempleModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTemple} className="p-6 space-y-6">

              {/* SECTION 1: TEMPLE IDENTITY & CLASSIFICATION */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#FFB300] border-b border-[#2C2C2C] pb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span>1. Temple Identity &amp; Classification</span>
                </h4>

                {/* TEMPLE CLASSIFICATION CARDS */}
                <div className="bg-[#141414] p-4 rounded-xl border border-[#2C2C2C] space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-400">
                      Select Temple Classification / Type <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Indicate whether this is an independent Main Temple, a Sub Temple (branch/subsidiary shrine), or part of a multi temple trust complex.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'MAIN_TEMPLE',
                        name: 'Main Temple',
                        desc: 'Primary institutional sanctum with full sanctum and daily scheduled poojas.',
                      },
                      {
                        id: 'SUB_TEMPLE',
                        name: 'Sub Temple',
                        desc: 'Branch temple or subsidiary shrine affiliated to a central trust.',
                      },
                      {
                        id: 'MULTI_TEMPLE',
                        name: 'Multi-Deity Temple Complex',
                        desc: 'Grand religious complex housing multiple sanctums and deities.',
                      },
                      {
                        id: 'COMMUNITY_TEMPLE',
                        name: 'Community Temple',
                        desc: 'Locally organized bhajana mandiram or residential colony shrine.',
                      },
                      {
                        id: 'HERITAGE_SHRINE',
                        name: 'Heritage Shrine',
                        desc: 'Ancient historic pilgrimage site or forest shrine.',
                      },
                    ].map((type) => {
                      const isSelected = templeForm.templeType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setTempleForm({ ...templeForm, templeType: type.id })}
                          className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${isSelected
                              ? 'bg-amber-950/40 border-[#FFB300] shadow-md ring-1 ring-[#FFB300]/50'
                              : 'bg-[#1C1C1C] border-[#2C2C2C] hover:border-neutral-600'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-gray-100 flex items-center gap-1.5">
                              <Landmark className="w-3.5 h-3.5 text-amber-400" />
                              <span>{type.name}</span>
                            </span>
                            {isSelected && (
                              <span className="text-amber-400 font-extrabold text-sm">✓</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 leading-snug">{type.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Identity Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Temple Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sri Ayyappa Swamy Temple"
                      value={templeForm.name}
                      onChange={(e) => setTempleForm({ ...templeForm, name: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Alternate / Local Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hill Shrine Mandir"
                      value={templeForm.alternateName}
                      onChange={(e) => setTempleForm({ ...templeForm, alternateName: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Primary Presiding Deity <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={templeForm.deityName}
                      onChange={(e) => setTempleForm({ ...templeForm, deityName: e.target.value, deityId: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                    >
                      {[
                        'Lord Ayyappa', 'Lord Venkateswara', 'Lord Shiva', 'Goddess Meenakshi',
                        'Goddess Kanaka Durga', 'Lord Murugan', 'Lord Ganesha', 'Lord Rama',
                        'Lord Hanuman', 'Lord Krishna', 'Other Holy Deity'
                      ].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={templeForm.state}
                      onChange={(e) => setTempleForm({ ...templeForm, state: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    >
                      {[
                        'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Karnataka',
                        'Maharashtra', 'Uttar Pradesh', 'Uttarakhand', 'Odisha', 'Gujarat',
                        'Madhya Pradesh', 'West Bengal', 'Rajasthan', 'Delhi', 'Other'
                      ].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      City / Town <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad"
                      value={templeForm.city}
                      onChange={(e) => setTempleForm({ ...templeForm, city: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      District
                    </label>
                    <input
                      type="text"
                      placeholder="District name"
                      value={templeForm.district}
                      onChange={(e) => setTempleForm({ ...templeForm, district: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Full Temple Address &amp; Landmarks
                  </label>
                  <input
                    type="text"
                    placeholder="Door number, Street, Near landmark, Pincode"
                    value={templeForm.address}
                    onChange={(e) => setTempleForm({ ...templeForm, address: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* TEMPLE GOPURAM / BANNER IMAGE VIA FILE UPLOAD */}
              <div className="bg-[#141414] p-4 rounded-xl border border-[#2C2C2C] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-400" />
                    <span>Temple Gopuram / Banner Image (File Upload)</span>
                  </label>
                  <span className="text-[11px] text-gray-500">Supports JPG, PNG, WebP (Max 5MB)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-36 h-24 rounded-lg overflow-hidden bg-neutral-900 border border-[#2C2C2C] relative flex-shrink-0 flex items-center justify-center shadow-inner">
                    {templeForm.heroImageUrl ? (
                      <img
                        src={resolveTempleImageUrl(templeForm.heroImageUrl)}
                        alt="Temple Preview"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.currentTarget.src = 'https://saranamayyappa.in/images/temples/banner-sabarimala-hd.png';
                        }}
                      />
                    ) : (
                      <div className="text-center p-2 text-gray-500">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">No Image Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="cursor-pointer bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>Choose Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleTempleImageUpload(file);
                          }}
                        />
                      </label>

                      {templeForm.heroImageUrl && (
                        <button
                          type="button"
                          onClick={() => setTempleForm({ ...templeForm, heroImageUrl: '', thumbnailUrl: '' })}
                          className="text-xs text-rose-400 hover:text-rose-300 underline font-medium px-2 py-1"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Or paste image URL (e.g. /images/temples/banner-sabarimala-hd.png)"
                      value={templeForm.heroImageUrl}
                      onChange={(e) => setTempleForm({ ...templeForm, heroImageUrl: e.target.value, thumbnailUrl: e.target.value })}
                      className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SACRED HERITAGE & DETAILS */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#FFB300] border-b border-[#2C2C2C] pb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>2. Sacred Heritage &amp; Details</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    One-line Devotional Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ancient hill shrine venerated for 41-day Mandala vratham and divine tranquility."
                    value={templeForm.shortDescription}
                    onChange={(e) => setTempleForm({ ...templeForm, shortDescription: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    About the Temple <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Comprehensive description of the temple sanctum, atmosphere, and traditions..."
                    value={templeForm.about}
                    onChange={(e) => setTempleForm({ ...templeForm, about: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Sacred History &amp; Origins
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ancient historical roots, royal patronage, puranic accounts..."
                    value={templeForm.history}
                    onChange={(e) => setTempleForm({ ...templeForm, history: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Spiritual Speciality &amp; Architectural Highlights
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Distinctive features, Neyyabhishekam, holy steps, sacred theertham..."
                    value={templeForm.speciality}
                    onChange={(e) => setTempleForm({ ...templeForm, speciality: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* SECTION 3: OFFICIAL ADMINISTRATIVE CONTACT */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#FFB300] border-b border-[#2C2C2C] pb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>3. Official Administrative Contact</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Office Phone / Helpline
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 0800 000000"
                      value={templeForm.officePhone || templeForm.phone}
                      onChange={(e) => setTempleForm({ ...templeForm, officePhone: e.target.value, phone: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Official Email
                    </label>
                    <input
                      type="email"
                      placeholder="contact@mandirtrust.org"
                      value={templeForm.officialEmail || templeForm.email}
                      onChange={(e) => setTempleForm({ ...templeForm, officialEmail: e.target.value, email: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Official Trust Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://mandirtrust.org"
                      value={templeForm.officialWebsite || templeForm.website}
                      onChange={(e) => setTempleForm({ ...templeForm, officialWebsite: e.target.value, website: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>
              </div>

              {/* TIMINGS & REGIONAL NAMES (ADMIN COMPREHENSIVE SETTINGS) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-[#FFB300] border-b border-[#2C2C2C] pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Sanctum Timings &amp; Portal Visibility</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Morning Darshan Timings</label>
                    <input
                      type="text"
                      placeholder="e.g. 03:00 AM – 01:00 PM"
                      value={templeForm.morningTimings}
                      onChange={(e) => setTempleForm({ ...templeForm, morningTimings: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Evening Darshan Timings</label>
                    <input
                      type="text"
                      placeholder="e.g. 03:00 PM – 11:00 PM"
                      value={templeForm.eveningTimings}
                      onChange={(e) => setTempleForm({ ...templeForm, eveningTimings: e.target.value })}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>

                {/* Multilingual Names Grid */}
                <div className="bg-[#141414] p-4 rounded-xl border border-[#2C2C2C] space-y-3">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Regional Local Names</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Telugu (తెలుగు)</label>
                      <input
                        type="text"
                        placeholder="శబరిమల శ్రీ ధర్మశాస్త దేవాలయం"
                        value={templeForm.teName}
                        onChange={(e) => setTempleForm({ ...templeForm, teName: e.target.value })}
                        className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Kannada (ಕನ್ನಡ)</label>
                      <input
                        type="text"
                        placeholder="ಶಬರಿಮಲೆ ಶ್ರೀ ಧರ್ಮಶಾಸ್ತಾ ದೇವಾಲಯ"
                        value={templeForm.knName}
                        onChange={(e) => setTempleForm({ ...templeForm, knName: e.target.value })}
                        className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Tamil (தமிழ்)</label>
                      <input
                        type="text"
                        placeholder="சபரிமலை ஸ்ரீ தர்மசாஸ்தா திருக்கோயில்"
                        value={templeForm.taName}
                        onChange={(e) => setTempleForm({ ...templeForm, taName: e.target.value })}
                        className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Malayalam (മലയാളം)</label>
                      <input
                        type="text"
                        placeholder="ശബരിമല ശ്രീ ധർമ്മശാസ്താ ക്ഷേത്രം"
                        value={templeForm.mlName}
                        onChange={(e) => setTempleForm({ ...templeForm, mlName: e.target.value })}
                        className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Hindi (हिन्दी)</label>
                      <input
                        type="text"
                        placeholder="सबरीमाला श्री धर्मशास्ता मंदिर"
                        value={templeForm.hiName}
                        onChange={(e) => setTempleForm({ ...templeForm, hiName: e.target.value })}
                        className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={templeForm.isActive}
                        onChange={(e) => setTempleForm({ ...templeForm, isActive: e.target.checked })}
                        className="rounded bg-[#141414] border-[#2C2C2C] text-[#FFB300] focus:ring-0"
                      />
                      <span className="text-xs text-gray-200 font-semibold">Published &amp; Active in Sacred Directory</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={templeForm.hasLiveDarshan}
                        onChange={(e) => setTempleForm({ ...templeForm, hasLiveDarshan: e.target.checked })}
                        className="rounded bg-[#141414] border-[#2C2C2C] text-rose-500 focus:ring-0"
                      />
                      <span className="text-xs text-rose-300 font-semibold">Live Darshan Stream Available</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => setIsTempleModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-gray-200 transition bg-neutral-900 border border-[#2C2C2C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTemple}
                  className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-lg shadow-orange-950/50 flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSavingTemple ? 'Saving to Database...' : editingTemple ? 'Update Sacred Temple' : 'Submit for Verification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLE TYPE CREATE / EDIT MODAL */}
      {isTempleTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#2C2C2C]">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-gray-100 text-sm">
                  {editingTempleType ? `Edit Temple Type: ${editingTempleType.name}` : 'Create New Temple Type'}
                </h3>
              </div>
              <button
                onClick={() => setIsTempleTypeModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTempleType} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Temple Type Identifier (Code Key)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingTempleType}
                  placeholder="e.g. MAIN_TEMPLE, SUB_TEMPLE, MULTI_TEMPLE"
                  value={templeTypeForm.id}
                  onChange={(e) => setTempleTypeForm({ ...templeTypeForm, id: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2C2C2C] disabled:opacity-50 disabled:bg-neutral-900 rounded-lg px-3.5 py-2.5 text-xs text-gray-100 font-mono focus:outline-none focus:border-[#FFB300]"
                />
                <p className="text-[11px] text-gray-500 mt-1">Unique alphanumeric key used by system APIs (e.g. MULTI_TEMPLE).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Temple, Sub Temple, Multi Temple..."
                  value={templeTypeForm.name}
                  onChange={(e) => setTempleTypeForm({ ...templeTypeForm, name: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Description &amp; Sanctum Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain when a devotee or Dharma Kartha selects this temple type..."
                  value={templeTypeForm.description}
                  onChange={(e) => setTempleTypeForm({ ...templeTypeForm, description: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div className="flex justify-between items-center gap-3 pt-3 border-t border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => openTranslationModal('temple_types', templeTypeForm.id || undefined, [
                    { key: 'name', label: 'Display Name', value: templeTypeForm.name },
                    { key: 'description', label: 'Description', value: templeTypeForm.description }
                  ], (trans) => {
                    setTempleTypeForm(prev => ({
                      ...prev,
                      name: trans.name || prev.name,
                      description: trans.description || prev.description
                    }));
                  })}
                  className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>✨ Translate (v3)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTempleTypeModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTempleType}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingTempleType ? 'Saving...' : editingTempleType ? 'Update Temple Type' : 'Create Temple Type'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Cloud Translation Advanced v3 Modal */}
      {/* Modal Dialog for View Panchangam Day Details (View by ID) */}
      {isViewPanchangamModalOpen && selectedViewPanchangam && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between bg-[#171717]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FFB300]">Vedic Panchangam Day Details</h3>
                  <p className="text-xs text-gray-400">{selectedViewPanchangam.date} • {selectedViewPanchangam.city || panchangamCity}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewPanchangamModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-300">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#252525] border border-[#3A3A3A] font-mono text-gray-300">
                  {selectedViewPanchangam.date}
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 font-semibold text-amber-300">
                  {selectedViewPanchangam.vaaram}
                </span>
                <span className="px-2.5 py-1 rounded bg-[#252525] border border-[#3A3A3A] text-gray-300">
                  {selectedViewPanchangam.paksham}
                </span>
                {selectedViewPanchangam.isOverride ? (
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 font-bold text-emerald-400">
                    MySQL Override #{selectedViewPanchangam.id}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-gray-400">
                    VSOP87 Ephemeris
                  </span>
                )}
              </div>

              {/* Samvatsara & Ritu */}
              <div className="bg-[#141414] border border-[#2C2C2C] rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Samvatsaram</span>
                  <p className="text-sm font-bold text-gray-100 mt-0.5">{selectedViewPanchangam.samvatsaram || 'Sri Krodhi Naama Samvatsara'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Ayana & Ritu</span>
                  <p className="text-sm font-bold text-gray-100 mt-0.5">{selectedViewPanchangam.ayanaRitu || 'Uttarayanam / Shishira Ritu'}</p>
                </div>
              </div>

              {/* The Primary Limbs */}
              <div className="bg-[#141414] border border-[#2C2C2C] rounded-xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Tithi</span>
                  <p className="text-base font-bold text-gray-100 mt-0.5">{selectedViewPanchangam.tithi}</p>
                  {selectedViewPanchangam.tithiEndTime && (
                    <p className="text-gray-400 text-[11px] mt-0.5">Ends at: {selectedViewPanchangam.tithiEndTime}</p>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">Nakshatram</span>
                  <p className="text-base font-bold text-gray-100 mt-0.5">{selectedViewPanchangam.nakshatram}</p>
                  {selectedViewPanchangam.nakshatraEndTime && (
                    <p className="text-gray-400 text-[11px] mt-0.5">Ends at: {selectedViewPanchangam.nakshatraEndTime}</p>
                  )}
                </div>
              </div>

              {/* Sun & Moon Times */}
              <div className="bg-[#141414] border border-[#2C2C2C] rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Surya Udayam (Sunrise)</span>
                  <p className="text-sm font-semibold text-gray-200 mt-0.5">☀️ {selectedViewPanchangam.sunrise}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">Surya Astamayam (Sunset)</span>
                  <p className="text-sm font-semibold text-gray-200 mt-0.5">🌙 {selectedViewPanchangam.sunset}</p>
                </div>
              </div>

              {/* Auspicious Timings */}
              <div className="bg-[#141414] border border-emerald-900/30 rounded-xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Auspicious Timings (శుభ సమయాలు)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Abhijit Muhurtham:</span>
                    <strong className="text-emerald-300">{selectedViewPanchangam.abhijit || '11:45 AM - 12:35 PM'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Amrita Kalam:</span>
                    <strong className="text-emerald-300">{selectedViewPanchangam.amritakalam || '02:15 PM - 03:50 PM'}</strong>
                  </div>
                </div>
              </div>

              {/* Inauspicious Timings */}
              <div className="bg-[#141414] border border-rose-900/30 rounded-xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                  Inauspicious Timings (వర్జ్యం / దుర్ముహూర్తం)
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Rahu Kalam:</span>
                    <strong className="text-rose-400 font-mono text-[11px]">{selectedViewPanchangam.rahuKalam}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Yamagandam:</span>
                    <strong className="text-rose-400 font-mono text-[11px]">{selectedViewPanchangam.yamagandam || '01:30 PM - 03:00 PM'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Varjyam:</span>
                    <strong className="text-rose-400 font-mono text-[11px]">{selectedViewPanchangam.varjyam || '08:30 AM - 10:05 AM'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2C2C2C] bg-[#171717] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsViewPanchangamModalOpen(false);
                  handleOpenCreatePanchangamOverride(selectedViewPanchangam);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 font-semibold text-xs transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Customize / Override This Day</span>
              </button>
              <button
                type="button"
                onClick={() => setIsViewPanchangamModalOpen(false)}
                className="px-5 py-2 bg-[#252525] hover:bg-[#303030] border border-[#3A3A3A] rounded-lg text-gray-200 font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Create / Edit Panchangam Daily Override */}
      {isPanchangamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/50 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between bg-[#171717]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FFB300]">
                    {panchangamForm.id ? 'Edit Panchangam Daily Override' : 'Create / Override Panchangam Day'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Saves directly to MySQL `panchangam_entries` and `panchangam_translations`.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPanchangamModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSavePanchangamOverride} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Calendar Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={panchangamForm.date}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, date: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Location / City Name
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.city}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Vaaram (Weekday)
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.vaaram}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, vaaram: e.target.value })}
                    placeholder="e.g. Guruvaaram / Thursday"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Paksham
                  </label>
                  <select
                    value={panchangamForm.paksham}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, paksham: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  >
                    <option value="Shukla Paksha">Shukla Paksha (శుక్ల పక్షం)</option>
                    <option value="Krishna Paksha">Krishna Paksha (కృష్ణ పక్షం)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Samvatsaram
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.samvatsaram}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, samvatsaram: e.target.value })}
                    placeholder="e.g. Sri Krodhi Naama Samvatsara"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* Tithi & Nakshatra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#141414] border border-[#2C2C2C] rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Tithi Configuration
                  </span>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Tithi Name</label>
                    <input
                      type="text"
                      required
                      value={panchangamForm.tithi}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, tithi: e.target.value })}
                      placeholder="e.g. Ekadashi, Purnima, Amavasya..."
                      className="w-full bg-[#1B1B1B] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Tithi End Time</label>
                    <input
                      type="text"
                      value={panchangamForm.tithiEndTime}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, tithiEndTime: e.target.value })}
                      placeholder="e.g. 04:15 PM"
                      className="w-full bg-[#1B1B1B] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#141414] border border-[#2C2C2C] rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                    Nakshatram Configuration
                  </span>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Nakshatra Name</label>
                    <input
                      type="text"
                      required
                      value={panchangamForm.nakshatram}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, nakshatram: e.target.value })}
                      placeholder="e.g. Rohini, Ashwini, Uttara..."
                      className="w-full bg-[#1B1B1B] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Nakshatra End Time</label>
                    <input
                      type="text"
                      value={panchangamForm.nakshatraEndTime}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, nakshatraEndTime: e.target.value })}
                      placeholder="e.g. 06:30 PM"
                      className="w-full bg-[#1B1B1B] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sun Times & Rahu Kalam */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Sunrise (సూర్యోదయం)
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.sunrise}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, sunrise: e.target.value })}
                    placeholder="06:15 AM"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Sunset (సూర్యాస్తమయం)
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.sunset}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, sunset: e.target.value })}
                    placeholder="06:05 PM"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Rahu Kalam (రాహుకాలం)
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.rahuKalam}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, rahuKalam: e.target.value })}
                    placeholder="04:30 PM - 06:00 PM"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Additional Auspicious / Inauspicious Kala */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Abhijit Muhurtham
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.abhijit}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, abhijit: e.target.value })}
                    placeholder="11:45 AM - 12:35 PM"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Varjyam
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.varjyam}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, varjyam: e.target.value })}
                    placeholder="08:30 AM - 10:05 AM"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Yamagandam
                  </label>
                  <input
                    type="text"
                    value={panchangamForm.yamagandam}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, yamagandam: e.target.value })}
                    placeholder="01:30 PM - 03:00 PM"
                    className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Ayana & Ritu
                </label>
                <input
                  type="text"
                  value={panchangamForm.ayanaRitu}
                  onChange={(e) => setPanchangamForm({ ...panchangamForm, ayanaRitu: e.target.value })}
                  placeholder="e.g. Uttarayanam / Shishira Ritu"
                  className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              {/* Form Footer */}
              <div className="flex justify-between items-center gap-3 pt-4 border-t border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => openTranslationModal('panchangam', panchangamForm.id || undefined, [
                    { key: 'tithi', label: 'Tithi Name', value: panchangamForm.tithi },
                    { key: 'nakshatram', label: 'Nakshatram', value: panchangamForm.nakshatram },
                    { key: 'vaaram', label: 'Vaaram (Weekday)', value: panchangamForm.vaaram },
                    { key: 'samvatsaram', label: 'Samvatsaram', value: panchangamForm.samvatsaram },
                  ], (trans) => {
                    setPanchangamForm((prev: any) => ({
                      ...prev,
                      tithi: trans.tithi || prev.tithi,
                      nakshatram: trans.nakshatram || prev.nakshatram,
                      vaaram: trans.vaaram || prev.vaaram,
                      samvatsaram: trans.samvatsaram || prev.samvatsaram,
                    }));
                  })}
                  className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>✨ Translate (v3)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPanchangamModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPanchangam}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingPanchangam ? 'Saving...' : panchangamForm.id ? 'Update Panchangam' : 'Save Override'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <TranslationModal
        isOpen={translationModalOpen}
        onClose={() => setTranslationModalOpen(false)}
        module={translationTargetModule}
        recordId={translationRecordId}
        fields={translationFields}
        apiBaseUrl={API_BASE_URL}
        currentLang={selectedLang}
        onApplyToEditor={translationApplyHandler}
      />
    </div>
  );
}
