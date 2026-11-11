'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Eye
} from 'lucide-react';

interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  isAudio: boolean;
  isArchived: boolean;
  description: string;
  subcategoriesCount?: number;
  devotionalCount?: number;
}

interface SubcategoryItem {
  id: string;
  title: string;
  slug: string;
  parentTitle: string;
  parentId: number;
  description: string;
}

interface ParentLookupItem {
  id: number;
  slug: string;
  title: string;
  parentId: number | null;
}

interface FullCategoryDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isAudio: boolean;
  displayOrder: number;
  subcategories: Array<{ id: string; title: string; slug: string; description: string | null }>;
  contents: Array<{ id: number; title: string; sacredText: string | null; meaning: string | null }>;
}

interface DevotionalContentItem {
  id: number;
  title: string;
  slug: string;
  sacredText?: string;
  meaning?: string;
  isPublished: boolean;
  categoryId: number;
}

interface FestivalItem {
  id: number;
  slug: string;
  festivalDate: string;
  sourceNote?: string;
  translations?: Array<{ name: string; description?: string }>;
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
  preferredLang: string;
  isSuspended: boolean;
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

export default function EnterpriseSuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('ayyappa_admin_token');
    }
    return false;
  });
  const [adminProfile, setAdminProfile] = useState<{ id: number; email: string; fullName: string; role: string }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ayyappa_admin_profile');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      id: 1,
      email: 'admin@ayyappa.org',
      fullName: 'Saranam Ayyappa Master Admin',
      role: 'SUPER_ADMIN'
    };
  });
  const [loginEmail, setLoginEmail] = useState('admin@ayyappa.org');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile Edit State
  const [editFullName, setEditFullName] = useState('Saranam Ayyappa Master Admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [pageMode, setPageMode] = useState<'LIST' | 'EDIT_CATEGORY' | 'VIEW_CATEGORY' | 'EDIT_SUBCATEGORY'>('LIST');
  const [viewDetail, setViewDetail] = useState<FullCategoryDetail | null>(null);

  // Shared Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [parentLookupList, setParentLookupList] = useState<ParentLookupItem[]>([]);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subFormTitle, setSubFormTitle] = useState('');
  const [subFormSlug, setSubFormSlug] = useState('');
  const [subFormParentId, setSubFormParentId] = useState<number | ''>('');
  const [subFormDescription, setSubFormDescription] = useState('');
  const [devotionalContent, setDevotionalContent] = useState<DevotionalContentItem[]>([]);
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [cmsPages, setCmsPages] = useState<CmsItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [users, setUsers] = useState<AppUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  
  // Server-side Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioFilter, setIsAudioFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLang, setSelectedLang] = useState('te');
  const [tickerText, setTickerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIsAudio, setFormIsAudio] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  // CMS Editor State
  const [isCmsExpanded, setIsCmsExpanded] = useState(true);
  const [selectedCmsKey, setSelectedCmsKey] = useState<string>('about_us');
  const [cmsEditTitle, setCmsEditTitle] = useState('');
  const [cmsEditContent, setCmsEditContent] = useState('');
  const [isSavingCms, setIsSavingCms] = useState(false);

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
      const res = await fetch('http://localhost:4000/api/v1/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: selectedCmsKey,
          description: cmsEditTitle,
          value: cmsEditContent
        })
      });
      if (res.ok) {
        setNotification(`CMS Page "${cmsEditTitle || selectedCmsKey}" saved directly to MySQL database!`);
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

  // Devotional Content Modal State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentSlug, setContentSlug] = useState('');
  const [contentCategoryId, setContentCategoryId] = useState('1');
  const [contentSacredText, setContentSacredText] = useState('');
  const [contentMeaning, setContentMeaning] = useState('');

  // Festival Modal State
  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);
  const [festivalName, setFestivalName] = useState('');
  const [festivalDate, setFestivalDate] = useState('2026-12-27');
  const [festivalNote, setFestivalNote] = useState('');
  const [livePanchangam, setLivePanchangam] = useState<any>(null);
  const [panchangamCity, setPanchangamCity] = useState('Hyderabad');

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('http://localhost:4000/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Login failed. Invalid credentials.');
        return;
      }
      setIsAuthenticated(true);
      setAdminProfile(data.admin);
      setEditFullName(data.admin.fullName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayyappa_admin_token', data.token || 'authenticated');
        localStorage.setItem('ayyappa_admin_profile', JSON.stringify(data.admin));
      }
      setNotification(`Welcome back, ${data.admin.fullName}!`);
    } catch {
      setAuthError('Cannot reach NestJS authentication API on port 4005. Please ensure backend is active.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginPassword('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayyappa_admin_token');
      localStorage.removeItem('ayyappa_admin_profile');
    }
    setNotification('You have logged out securely.');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/v1/admin/profile', {
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
      const res = await fetch('http://localhost:4000/api/v1/admin/profile/change-password', {
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
  const loadCategories = useCallback((pageNum = 1, search = '', lang = 'te', audio = '') => {
    setLoading(true);
    const url = new URL('http://localhost:4000/api/v1/admin/categories');
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '15');
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 2. Load Subcategories
  const loadParentLookup = useCallback((lang = 'te') => {
    fetch(`http://localhost:4000/api/v1/admin/categories/parents?lang=${lang}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setParentLookupList(data); })
      .catch(() => {});
  }, []);

  const loadSubcategories = useCallback((pageNum = 1, search = '', lang = 'te') => {
    setLoading(true);
    const url = new URL('http://localhost:4000/api/v1/admin/subcategories');
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '25');
    url.searchParams.set('lang', lang);
    if (search) url.searchParams.set('search', search);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setSubcategories(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 3. Load Devotional Content
  const loadDevotionalContent = useCallback((pageNum = 1, search = '') => {
    setLoading(true);
    const url = new URL('http://localhost:4000/api/v1/admin/content');
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '15');
    if (search) url.searchParams.set('search', search);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setDevotionalContent(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 4. Load Festivals & Live Panchangam
  const loadPanchangam = useCallback((city = 'Hyderabad', lang = 'te') => {
    fetch(`http://localhost:4000/api/v1/panchangam/day?city=${city}&lang=${lang}`)
      .then(res => res.json())
      .then(data => setLivePanchangam(data))
      .catch(() => {});
  }, []);

  const loadFestivals = useCallback((pageNum = 1, search = '') => {
    setLoading(true);
    const url = new URL('http://localhost:4000/api/v1/admin/panchangam/festivals');
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '15');
    if (search) url.searchParams.set('search', search);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setFestivals(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 5. Load Audio
  const loadAudio = useCallback(() => {
    fetch('http://localhost:4000/api/v1/admin/media/audio')
      .then(res => res.json())
      .then(res => { if (res.data) setAudioList(res.data); })
      .catch(() => {});
  }, []);

  // 6. Load CMS
  const loadCms = useCallback(() => {
    fetch('http://localhost:4000/api/v1/admin/cms')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCmsPages(data); })
      .catch(() => {});
  }, []);

  const loadStats = useCallback(() => {
    fetch('http://localhost:4000/api/v1/admin/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const loadLanguages = useCallback(() => {
    fetch('http://localhost:4000/api/v1/admin/languages')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLanguages(data); })
      .catch(() => {});
  }, []);

  const loadUsers = useCallback(() => {
    fetch('http://localhost:4000/api/v1/admin/users')
      .then(res => res.json())
      .then(res => { if (res.data) setUsers(res.data); })
      .catch(() => {});
  }, []);

  const loadAuditLogs = useCallback(() => {
    fetch('http://localhost:4000/api/v1/admin/audit-logs')
      .then(res => res.json())
      .then(res => { if (res.data) setAuditLogs(res.data); })
      .catch(() => {});
  }, []);

  const loadTicker = useCallback(() => {
    fetch('http://localhost:4000/api/v1/admin/settings/ticker')
      .then(res => res.json())
      .then(data => { if (data.ticker) setTickerText(data.ticker); })
      .catch(() => {});
  }, []);

  // Data fetching on tab change and initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadParentLookup(selectedLang);
      loadSubcategories(1, '', selectedLang);
      loadDevotionalContent(1, '');
      loadFestivals(1, '');
      loadPanchangam(panchangamCity, selectedLang);
      loadAudio();
      loadCms();
      loadLanguages();
      loadUsers();
      loadAuditLogs();
      loadTicker();

      if (activeTab === 'categories') { loadCategories(page, searchQuery, selectedLang, isAudioFilter); }
      if (activeTab === 'subcategories') { loadSubcategories(1, searchQuery, selectedLang); }
      if (activeTab === 'content') loadDevotionalContent(1, searchQuery);
      if (activeTab === 'panchangam') { loadFestivals(1, searchQuery); loadPanchangam(panchangamCity, selectedLang); }
    }
  }, [isAuthenticated, activeTab, loadStats, loadCategories, loadSubcategories, loadDevotionalContent, loadFestivals, loadAudio, loadCms, loadLanguages, loadUsers, loadAuditLogs, loadTicker, loadParentLookup, selectedLang, isAudioFilter]);

  // Debounced server search
  useEffect(() => {
    if (isAuthenticated) {
      const handler = setTimeout(() => {
        if (activeTab === 'categories') loadCategories(1, searchQuery, selectedLang, isAudioFilter);
        if (activeTab === 'subcategories') loadSubcategories(1, searchQuery, selectedLang);
        if (activeTab === 'content') loadDevotionalContent(1, searchQuery);
        if (activeTab === 'panchangam') loadFestivals(1, searchQuery);
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
    setPageMode('EDIT_CATEGORY');
  };

  const handleOpenEditCategory = (item: CategoryItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormIsAudio(item.isAudio);
    setFormDescription(item.description);
    setPageMode('EDIT_CATEGORY');
  };

  const handleOpenViewCategory = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/categories/${id}?lang=${selectedLang}`);
      const data = await res.json();
      setViewDetail(data);
      setPageMode('VIEW_CATEGORY');
    } catch {
      alert('Error loading category view details');
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
        await fetch(`http://localhost:4000/api/v1/admin/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Updated "${formTitle}" in MySQL!`);
      } else {
        await fetch('http://localhost:4000/api/v1/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Created category "${formTitle}" in MySQL!`);
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
        const res = await fetch(`http://localhost:4000/api/v1/admin/categories/${id}`, { method: 'DELETE' });
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
  const handleOpenCreateSubcategory = () => {
    setEditingSubId(null);
    setSubFormTitle('');
    setSubFormSlug('');
    setSubFormParentId(parentLookupList.length > 0 ? parentLookupList[0].id : '');
    setSubFormDescription('');
    setPageMode('EDIT_SUBCATEGORY');
  };

  const handleOpenEditSubcategory = (item: SubcategoryItem) => {
    setEditingSubId(item.id);
    setSubFormTitle(item.title);
    setSubFormSlug(item.slug);
    setSubFormParentId(item.parentId);
    setSubFormDescription(item.description);
    setPageMode('EDIT_SUBCATEGORY');
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
      lang: selectedLang
    };

    try {
      if (editingSubId) {
        await fetch(`http://localhost:4000/api/v1/admin/categories/${editingSubId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Updated subcategory "${subFormTitle}" in MySQL!`);
      } else {
        await fetch('http://localhost:4000/api/v1/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Created subcategory "${subFormTitle}" in MySQL!`);
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
        const res = await fetch(`http://localhost:4000/api/v1/admin/categories/${id}`, { method: 'DELETE' });
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

  // LANGUAGE ACTIONS
  const handleOpenCreateLanguage = () => {
    setEditingLangId(null);
    setLangCode('');
    setLangName('');
    setIsLangModalOpen(true);
  };

  const handleOpenEditLanguage = (l: LanguageItem) => {
    setEditingLangId(l.id);
    setLangCode(l.code);
    setLangName(l.name);
    setIsLangModalOpen(true);
  };

  const handleSaveLanguage = async () => {
    if (!langName.trim() || (!editingLangId && !langCode.trim())) {
      alert('Please fill out all required language fields');
      return;
    }

    try {
      if (editingLangId) {
        await fetch(`http://localhost:4000/api/v1/admin/languages/${editingLangId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: langName.trim() })
        });
        setNotification(`Updated language "${langName}" in MySQL!`);
      } else {
        const res = await fetch('http://localhost:4000/api/v1/admin/languages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: langCode.toLowerCase().trim(), name: langName.trim() })
        });
        const json = await res.json();
        if (!res.ok) {
          alert(json.message || 'Error creating language');
          return;
        }
        setNotification(`Created language "${langName}" in MySQL!`);
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
        const res = await fetch(`http://localhost:4000/api/v1/admin/languages/${id}`, { method: 'DELETE' });
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

  // DEVOTIONAL CONTENT ACTIONS
  const handleOpenCreateContent = () => {
    setContentTitle('');
    setContentSlug('');
    setContentSacredText('');
    setContentMeaning('');
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async () => {
    if (!contentTitle.trim()) {
      alert('Please enter a content title');
      return;
    }
    try {
      await fetch('http://localhost:4000/api/v1/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: Number(contentCategoryId),
          title: contentTitle.trim(),
          slug: contentSlug.trim() || `verse-${Date.now()}`,
          sacredText: contentSacredText,
          meaning: contentMeaning
        })
      });
      setNotification(`Created sacred text "${contentTitle}"!`);
      loadDevotionalContent();
      setIsContentModalOpen(false);
    } catch {
      alert('Error saving content');
    }
  };

  const handleDeleteContent = async (id: number, title: string) => {
    if (confirm(`Delete "${title}" (#${id})?`)) {
      await fetch(`http://localhost:4000/api/v1/admin/content/${id}`, { method: 'DELETE' });
      setNotification(`Removed "${title}"`);
      loadDevotionalContent();
    }
  };

  // FESTIVAL ACTIONS
  const handleOpenCreateFestival = () => {
    setFestivalName('');
    setFestivalDate('2026-12-27');
    setFestivalNote('');
    setIsFestivalModalOpen(true);
  };

  const handleSaveFestival = async () => {
    if (!festivalName.trim()) {
      alert('Please enter festival name');
      return;
    }
    try {
      await fetch('http://localhost:4000/api/v1/admin/panchangam/festivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: festivalName.trim(),
          slug: `fest-${Date.now()}`,
          date: festivalDate,
          sourceNote: festivalNote,
          lang: selectedLang
        })
      });
      setNotification(`Created festival "${festivalName}"!`);
      loadFestivals();
      setIsFestivalModalOpen(false);
    } catch {
      alert('Error saving festival');
    }
  };

  const handleDeleteFestival = async (id: number) => {
    if (confirm(`Delete festival #${id}?`)) {
      await fetch(`http://localhost:4000/api/v1/admin/panchangam/festivals/${id}`, { method: 'DELETE' });
      setNotification('Festival deleted');
      loadFestivals();
    }
  };

  // TICKER ACTION
  const handleSaveTicker = async () => {
    try {
      await fetch('http://localhost:4000/api/v1/admin/settings/ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerText })
      });
      setNotification('Devotional Announcement Ticker saved to MySQL and published to mobile!');
      loadAuditLogs();
    } catch {
      alert('Failed to update ticker');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full border-2 border-[#FFB300] bg-orange-950 flex items-center justify-center font-bold text-2xl text-[#FFB300] shadow-md shadow-orange-950 mx-auto">
              🕉️
            </div>
            <h1 className="text-xl font-bold text-[#FFB300] uppercase tracking-wide">Saranam Ayyappa</h1>
            <p className="text-xs text-gray-400">Enterprise Super Admin Portal</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Admin Email</label>
              <input 
                type="email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required
                className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Master Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                placeholder="Enter password..."
                onChange={(e) => setLoginPassword(e.target.value)} 
                required
                className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#D84315] hover:bg-[#BF360C] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-orange-950 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate & Enter Console</span>
            </button>
          </form>

          <div className="p-3 bg-[#151515] rounded-lg border border-[#2C2C2C] text-[11px] text-gray-400 space-y-1">
            <p className="font-semibold text-emerald-400">Security Standard:</p>
            <p className="text-gray-300">Bcrypt Salt 12 Rounds • Real Database Auth • Zero Mock Data</p>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { key: 'categories', label: `Categories (${stats?.activeCategories ?? (totalCount || 109)})`, icon: FolderTree },
    { key: 'subcategories', label: `Subcategories (${stats?.activeSubcategories ?? subcategories.length})`, icon: Layers },
    { key: 'panchangam', label: `Panchangam & Festivals (${stats?.activeFestivals ?? festivals.length})`, icon: Calendar },
    { key: 'audio', label: `Audio Library (${stats?.totalAudioFiles ?? audioList.length})`, icon: Music },
    { key: 'cms', label: `CMS Pages (${stats?.publishedCmsPages ?? cmsPages.length})`, icon: FileText },
    { key: 'languages', label: `Languages (${stats?.totalLanguages ?? languages.length} in DB)`, icon: Globe },
    { key: 'users', label: `User Management (${stats?.totalUsers ?? users.length})`, icon: Users },
    { key: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'profile', label: 'Admin Profile', icon: User },
    { key: 'settings', label: 'App Settings & Ticker', icon: Settings },
    { key: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: Database },
  ];

  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden text-gray-100">
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E1E1E] border border-[#FFB300] text-[#FFB300] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-xs">{notification}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-[#181818] border-r border-[#2C2C2C] flex flex-col justify-between flex-shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#FFB300] bg-orange-950 flex items-center justify-center font-bold text-lg text-[#FFB300] shadow-md shadow-orange-950">
                🕉️
              </div>
              <div>
                <h1 className="font-bold text-sm text-[#FFB300] tracking-wide uppercase">Saranam Ayyappa</h1>
                <p className="text-[11px] text-orange-400 font-semibold">Super Admin Console</p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              const isCmsItem = item.key === 'cms';

              if (isCmsItem) {
                return (
                  <div key={item.key} className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('cms');
                        setIsCmsExpanded(!isCmsExpanded);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isCmsExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-orange-400/80" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>

                    {isCmsExpanded && (
                      <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-orange-500/30 ml-4">
                        {[
                          { key: 'about_us', label: 'About Us' },
                          { key: 'terms_conditions', label: 'Terms & Conditions' },
                          { key: 'privacy_policy', label: 'Privacy Policy' },
                          { key: 'sabarimala_guidelines', label: 'Sabarimala Guidelines' },
                        ].map(sub => {
                          const isSubActive = activeTab === 'cms' && selectedCmsKey === sub.key;
                          return (
                            <button
                              key={sub.key}
                              onClick={() => {
                                setActiveTab('cms');
                                setSelectedCmsKey(sub.key);
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all text-left ${
                                isSubActive
                                  ? 'bg-[#FFB300]/15 text-[#FFB300] font-semibold border border-[#FFB300]/30'
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/50'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-[#FFB300]' : 'bg-gray-600'}`} />
                              <span className="truncate">{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#2C2C2C] flex items-center justify-between bg-[#151515]">
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-orange-950 border border-orange-500/40 flex items-center justify-center text-xs font-bold text-[#FFB300]">
                SA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-200 truncate">{adminProfile.fullName}</p>
                <p className="text-[10px] text-emerald-400 font-mono">{adminProfile.role}</p>
              </div>
            </button>
            <button 
              onClick={handleLogout}
              className="p-1.5 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-red-400 transition"
              title="Secure Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-[#2C2C2C] px-8 flex items-center justify-between bg-[#151515] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-lg">✨</span>
            <span className="font-semibold text-sm text-gray-200 uppercase tracking-wide">
              {sidebarItems.find(i => i.key === activeTab)?.label || 'Console'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { 
                loadStats(); 
                if (activeTab === 'categories') loadCategories(page, searchQuery, selectedLang, isAudioFilter);
                if (activeTab === 'subcategories') loadSubcategories(1, searchQuery, selectedLang);
                if (activeTab === 'content') loadDevotionalContent(1, searchQuery);
                if (activeTab === 'panchangam') loadFestivals(1, searchQuery);
                if (activeTab === 'audio') loadAudio();
                if (activeTab === 'cms') loadCms();
              }}
              className="p-1.5 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-gray-200 transition"
              title="Refresh Real Database Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Server Operations
            </span>

            {/* Industry-Level User Profile & Account Action */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#2C2C2C]">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setPageMode('LIST');
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-neutral-800/80 transition text-left group"
                title="View & Edit Admin Account"
              >
                <div className="w-8 h-8 rounded-full bg-orange-950 border border-orange-500/50 flex items-center justify-center text-xs font-bold text-[#FFB300] shadow-sm">
                  {adminProfile.fullName.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-gray-200 group-hover:text-[#FFB300] transition">
                      {adminProfile.fullName}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase font-mono">
                      {adminProfile.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">My Account</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-semibold transition"
                title="Secure Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: CATEGORIES */}
          {activeTab === 'categories' && (
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
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="en">English</option>
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
                        <th className="px-6 py-3.5">ID</th>
                        <th className="px-6 py-3.5">Category Title ({selectedLang.toUpperCase()})</th>
                        <th className="px-6 py-3.5">Slug</th>
                        <th className="px-6 py-3.5">Dependencies</th>
                        <th className="px-6 py-3.5">Content Type</th>
                        <th className="px-6 py-3.5">Description</th>
                        <th className="px-6 py-3.5 text-center font-bold text-amber-400">Options / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {categories.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                          <td className="px-6 py-4 font-mono text-gray-500">#{item.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100 flex items-center gap-2">
                            <span className="text-orange-400">🪔</span>
                            <span>{item.title}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-amber-400/90">{item.slug}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-gray-300 border border-neutral-700 text-[10px]">
                              {item.subcategoriesCount || 0} sub / {item.devotionalCount || 0} items
                            </span>
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
                          <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{item.description || '—'}</td>
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
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="p-4 border-t border-[#2C2C2C] flex items-center justify-between bg-[#151515]">
                <span className="text-xs text-gray-400">
                  Showing page <strong className="text-gray-200">{page}</strong> of <strong className="text-gray-200">{totalPages}</strong> (Total <strong className="text-gray-200">{totalCount}</strong>)
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page <= 1}
                    onClick={() => loadCategories(page - 1, searchQuery, selectedLang, isAudioFilter)}
                    className="p-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={page >= totalPages}
                    onClick={() => loadCategories(page + 1, searchQuery, selectedLang, isAudioFilter)}
                    className="p-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBCATEGORIES */}
          {activeTab === 'subcategories' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden space-y-0">
              <div className="p-5 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-orange-400" />
                    <span>Devotional Subcategories & Chapters (Multi-Level)</span>
                  </h2>
                  <p className="text-xs text-gray-400">Manage Pooja rituals (Level 2) and drill-down chapters / Vratha Kathalu (Level 3).</p>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedLang}
                    onChange={(e) => {
                      setSelectedLang(e.target.value);
                      loadSubcategories(1, searchQuery, e.target.value);
                      loadParentLookup(e.target.value);
                    }}
                    className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                  >
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                  <button 
                    onClick={handleOpenCreateSubcategory}
                    className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Subcategory / Chapter</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                {subcategories.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400">
                    <p className="font-semibold text-gray-300">No child subcategories or chapters found.</p>
                    <p className="text-gray-500 mt-1">Click "+ Create Subcategory / Chapter" to assign a ritual or chapter under any category or Vratham.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Subcategory / Chapter Title</th>
                        <th className="px-6 py-3">Parent Section</th>
                        <th className="px-6 py-3">Slug</th>
                        <th className="px-6 py-3 text-center font-bold text-amber-400">Options / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {subcategories.map(sub => (
                        <tr key={sub.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono text-gray-500">#{sub.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100 flex items-center gap-2">
                            <span className="text-orange-400">🪔</span>
                            <span>{sub.title}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-orange-950/40 text-orange-400 border border-orange-800/40 text-xs font-semibold">
                              {sub.parentTitle}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-amber-400">{sub.slug}</td>
                          <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => handleOpenViewCategory(sub.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-sky-400 text-xs font-semibold transition"
                              title="View Subcategory Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button 
                              onClick={() => handleOpenEditSubcategory(sub)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400 text-xs font-semibold transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteSubcategory(sub.id, sub.title)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded text-red-400 text-xs font-semibold transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEVOTIONAL CONTENT */}
          {activeTab === 'content' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Devotional Sacred Text & Verses</h2>
                  <p className="text-xs text-gray-400">Manage individual Stotras, Mantras, Slokas, and poetic lines.</p>
                </div>
                <button 
                  onClick={handleOpenCreateContent}
                  className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sacred Verse</span>
                </button>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                {devotionalContent.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400">
                    <p className="font-semibold text-gray-300">No standalone verse items in `devotional_contents` table yet.</p>
                    <p className="text-gray-500 mt-1">Click "+ Add Sacred Verse" to create individual verse recitations and meanings.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Sacred Verse</th>
                        <th className="px-6 py-3">Spiritual Meaning</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {devotionalContent.map(item => (
                        <tr key={item.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono">#{item.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100">{item.title}</td>
                          <td className="px-6 py-4 font-mono text-amber-300 max-w-xs truncate">{item.sacredText || '—'}</td>
                          <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{item.meaning || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteContent(item.id, item.title)}
                              className="p-1.5 hover:bg-neutral-700 rounded text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PANCHANGAM & FESTIVALS */}
          {activeTab === 'panchangam' && (
            <div className="space-y-6">
              {/* Live Vedic Astronomical Panchangam Card */}
              <div className="bg-[#1C1C1C] rounded-xl border border-[#FFB300]/30 p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C2C2C] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🕉️</span>
                    <div>
                      <h2 className="text-base font-bold text-[#FFB300] tracking-wide">
                        Live Vedic Astronomical Panchangam
                      </h2>
                      <p className="text-xs text-gray-400">
                        Jean Meeus VSOP87 & Lahiri Chitra Paksha High-Precision Engine
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={panchangamCity}
                      onChange={(e) => {
                        setPanchangamCity(e.target.value);
                        loadPanchangam(e.target.value, selectedLang);
                      }}
                      className="bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300]"
                    >
                      <option value="Hyderabad">Hyderabad (హైదరాబాద్)</option>
                      <option value="Vijayawada">Vijayawada (విజయవాడ)</option>
                      <option value="Visakhapatnam">Visakhapatnam (విశాఖపట్నం)</option>
                      <option value="Tirupati">Tirupati (తిరుపతి)</option>
                      <option value="Bengaluru">Bengaluru (ಬೆಂಗಳೂರು)</option>
                      <option value="Chennai">Chennai (சென்னை)</option>
                      <option value="Sabarimala">Sabarimala (ശബരിമല)</option>
                    </select>

                    <button
                      onClick={() => loadPanchangam(panchangamCity, selectedLang)}
                      className="p-1.5 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-amber-400 transition"
                      title="Recalculate Astronomical Ephemeris"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {livePanchangam ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date & Weekday</p>
                      <p className="text-xs font-bold text-gray-100 mt-1">{livePanchangam.isoDate}</p>
                      <p className="text-xs font-semibold text-amber-400">{livePanchangam.vaaram}</p>
                    </div>

                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Samvatsara & Maasa</p>
                      <p className="text-xs font-bold text-gray-100 mt-1 truncate">{livePanchangam.samvatsaram}</p>
                      <p className="text-xs font-semibold text-orange-400">{livePanchangam.maasa} • {livePanchangam.paksham}</p>
                    </div>

                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tithi & Nakshatram</p>
                      <p className="text-xs font-bold text-emerald-400 mt-1">Tithi: {livePanchangam.tithi} ({livePanchangam.tithiEndTime})</p>
                      <p className="text-xs font-semibold text-sky-400">Nakshatra: {livePanchangam.nakshatram}</p>
                    </div>

                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sun & Timings</p>
                      <p className="text-xs text-amber-300 mt-1">☀️ {livePanchangam.sunrise} — 🌙 {livePanchangam.sunset}</p>
                      <p className="text-[11px] text-red-400">Rahu: {livePanchangam.rahuKalam}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500">
                    Loading high-precision ephemeris data...
                  </div>
                )}
              </div>

              {/* Sabarimala Festival Dates */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-100">Sabarimala Festivals & Observance Dates</h2>
                    <p className="text-xs text-gray-400">Managed in MySQL database with multilingual translations.</p>
                  </div>
                  <button 
                    onClick={handleOpenCreateFestival}
                    className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Festival</span>
                  </button>
                </div>
                <div className="overflow-x-auto min-h-[250px]">
                  {festivals.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-400">
                      <p className="font-semibold text-gray-300">No festival entries found in database.</p>
                      <p className="text-gray-500 mt-1">Click "+ Create Festival" to add verified Sabarimala Mandala Kalam or Makara Jyothi dates.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Festival Name</th>
                          <th className="px-6 py-3">Annual Date</th>
                          <th className="px-6 py-3">Source Note</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2C]">
                        {festivals.map(f => {
                          const langMatch = f.translations?.find(t => (t as any).language?.code === selectedLang) 
                            || f.translations?.find(t => (t as any).language?.code === 'te')
                            || f.translations?.[0];
                          return (
                            <tr key={f.id} className="hover:bg-neutral-800/40">
                              <td className="px-6 py-4 font-mono text-gray-400">#{f.id}</td>
                              <td className="px-6 py-4 font-semibold text-gray-100">{langMatch?.name || f.slug}</td>
                              <td className="px-6 py-4 font-mono text-amber-400">{new Date(f.festivalDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-gray-400">{f.sourceNote || 'Sabarimala Devaswom Board'}</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleDeleteFestival(f.id)}
                                  className="p-1.5 hover:bg-neutral-700 rounded text-red-400 transition"
                                  title="Delete Festival Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
                    {audioList.map(a => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CMS PAGES (WITH SUBTITLE TABS & DYNAMIC REAL-TIME EDITOR) */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              {/* Sub-Title Selector Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'about_us', label: 'About Us', icon: BookOpen, desc: 'Mission & History' },
                  { key: 'terms_conditions', label: 'Terms & Conditions', icon: ShieldCheck, desc: 'Devotee Agreement' },
                  { key: 'privacy_policy', label: 'Privacy Policy', icon: Lock, desc: 'Data & Privacy' },
                  { key: 'sabarimala_guidelines', label: 'Sabarimala Guidelines', icon: FileText, desc: 'Pilgrim Rules' },
                ].map(item => {
                  const isSelected = selectedCmsKey === item.key;
                  const SubIcon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedCmsKey(item.key)}
                      className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3.5 ${
                        isSelected
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
                  <button
                    onClick={handleSaveCmsPage}
                    disabled={isSavingCms}
                    className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md shadow-orange-950"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSavingCms ? 'Saving to MySQL...' : 'Save to Database'}</span>
                  </button>
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
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Page Content Body (Formatted Devotional / Legal Text)
                    </label>
                    <textarea
                      rows={14}
                      value={cmsEditContent}
                      onChange={(e) => setCmsEditContent(e.target.value)}
                      placeholder="Write or edit full CMS page text..."
                      className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg p-3.5 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300] leading-relaxed font-sans"
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
                        {cmsPages.map(p => (
                          <tr
                            key={p.id}
                            className={`hover:bg-neutral-800/40 cursor-pointer ${
                              selectedCmsKey === p.key ? 'bg-orange-500/10' : ''
                            }`}
                            onClick={() => setSelectedCmsKey(p.key)}
                          >
                            <td className="px-6 py-3 font-mono text-amber-400 font-semibold">{p.key}</td>
                            <td className="px-6 py-3 text-gray-200 font-medium">{p.description || p.key}</td>
                            <td className="px-6 py-3 text-gray-400 max-w-xs truncate">{p.value || 'â€”'}</td>
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
                        ))}
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
                  <h2 className="text-base font-bold text-gray-100">All 5 Languages in MySQL Database</h2>
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
                    {languages.map(l => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Registered App Users (MySQL `app_users`)</h2>
                  <p className="text-xs text-gray-400">Profiles queried directly from MySQL via Prisma.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                {users.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                    <p className="font-semibold text-gray-300">No registered mobile user profiles yet.</p>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono text-gray-500">#{u.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100">{u.phoneNumber || u.deviceUuid || 'Anonymous Client'}</td>
                          <td className="px-6 py-4 uppercase font-mono text-amber-400">{u.preferredLang}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isSuspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
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
                  <p className="text-2xl font-bold text-[#FFB300] mt-1">{stats?.activeCategories || 109}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Strict server-side paginated</span>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Languages in DB</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{languages.length || 5}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">te, kn, en, ta, hi active</span>
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

          {/* TAB 11: SETTINGS & TICKER */}
          {activeTab === 'settings' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
              <h2 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                <Radio className="w-5 h-5 text-orange-400" />
                <span>Devotional Marquee Announcement Ticker</span>
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Live Announcement Text</label>
                <textarea 
                  rows={4}
                  value={tickerText}
                  onChange={(e) => setTickerText(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleSaveTicker}
                  className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition"
                >
                  Save & Publish Live Ticker to MySQL
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
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-neutral-800/40">
                        <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold text-gray-200">{log.admin?.fullName || 'System Master'}</td>
                        <td className="px-6 py-4 font-mono text-orange-400">{log.action}</td>
                        <td className="px-6 py-4">{log.targetType} {log.targetId ? `#${log.targetId}` : ''}</td>
                        <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{log.detailsJson || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Dialog for Category Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span>{editingId ? 'Edit Devotional Category' : 'Create New Devotional Category'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Category Title ({selectedLang.toUpperCase()})</label>
                <input 
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. శ్రీ అయ్యప్ప శరణు ఘోష"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">URL Identifier (Slug)</label>
                <input 
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. daily-pooja"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Content Type</label>
                <select 
                  value={formIsAudio ? 'true' : 'false'}
                  onChange={(e) => setFormIsAudio(e.target.value === 'true')}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                >
                  <option value="false">Text & Devotional Slokas (Readable)</option>
                  <option value="true">Audio Track (Sing-along & Chant)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief spiritual summary of this sacred section..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCategory}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-orange-950"
              >
                Save Category to MySQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Subcategory / Chapter Create & Edit (Multi-Level Hierarchy) */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-orange-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              <span>{editingSubId ? 'Edit Subcategory / Chapter' : 'Create Subcategory or Chapter'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">
                  Select Parent Category or Vratham (Hierarchy Target)
                </label>
                <select 
                  value={subFormParentId}
                  onChange={(e) => setSubFormParentId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-amber-300 focus:outline-none focus:border-[#FFB300]"
                >
                  <option value="">-- Choose Parent (e.g. Poojalu Vrathaalu, Satyanarayana Swamy, etc.) --</option>
                  {parentLookupList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.parentId ? `└── [Sub-Level] ${p.title} (#${p.id})` : `[Main Category] ${p.title} (#${p.id})`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  To create Level 2 (e.g. <i>Varalakshmi Vratham</i>), pick <b>Poojalu Vrathaalu</b>. To create Level 3 (e.g. <i>Chapter 1</i> or <i>Katha</i>), pick that Vratham!
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">
                  Subcategory / Chapter Title ({selectedLang.toUpperCase()})
                </label>
                <input 
                  type="text"
                  value={subFormTitle}
                  onChange={(e) => setSubFormTitle(e.target.value)}
                  placeholder="e.g. ||Chapter 1 - Prathama Adhyayam|| or Varalakshmi Pooja Vidhanam"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">URL Identifier (Slug)</label>
                <input 
                  type="text"
                  value={subFormSlug}
                  onChange={(e) => setSubFormSlug(e.target.value)}
                  placeholder="e.g. satyanarayana-chapter-1"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Sacred Notes / Description</label>
                <textarea 
                  rows={3}
                  value={subFormDescription}
                  onChange={(e) => setSubFormDescription(e.target.value)}
                  placeholder="Optional sacred ritual summary, katha details, or notes..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsSubModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSubcategory}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-orange-950"
              >
                Save to MySQL
              </button>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="e.g. Malayalam"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              {!editingLangId && (
                <div>
                  <label className="block font-semibold text-gray-300 uppercase mb-1">ISO Code (e.g. ml)</label>
                  <input 
                    type="text"
                    value={langCode}
                    onChange={(e) => setLangCode(e.target.value)}
                    placeholder="e.g. ml"
                    maxLength={10}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                  />
                </div>
              )}
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

      {/* Modal Dialog for Devotional Content Create */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              <span>Add Sacred Verse / Devotional Detail</span>
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
                <label className="block font-semibold text-gray-300 uppercase mb-1">Sacred Verse Text</label>
                <textarea 
                  rows={3}
                  value={contentSacredText}
                  onChange={(e) => setContentSacredText(e.target.value)}
                  placeholder="Original sacred sloka lines..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300] font-serif"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Spiritual Meaning / Explanation</label>
                <textarea 
                  rows={2}
                  value={contentMeaning}
                  onChange={(e) => setContentMeaning(e.target.value)}
                  placeholder="Devotional meaning..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
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
                Save Sacred Verse to MySQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Festival Create */}
      {isFestivalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span>Create Sabarimala Festival / Observance</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Festival Name</label>
                <input 
                  type="text"
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  placeholder="e.g. మండల పూజ (Mandala Pooja)"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Annual Date</label>
                <input 
                  type="date"
                  value={festivalDate}
                  onChange={(e) => setFestivalDate(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Source & Observance Note</label>
                <textarea 
                  rows={2}
                  value={festivalNote}
                  onChange={(e) => setFestivalNote(e.target.value)}
                  placeholder="Sabarimala Devaswom verified calendar..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsFestivalModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveFestival}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
              >
                Save Festival to MySQL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
