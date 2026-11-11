'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  RotateCcw,
  Smartphone,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  FileImage,
  Calendar,
} from 'lucide-react';

interface SplashAsset {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  storageKey: string;
  mimeType: string;
  fileSize?: number;
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: string;
  platform: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  scheduledStart?: string;
  scheduledEnd?: string;
  version: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export const SplashScreenManager: React.FC = () => {
  const [assets, setAssets] = useState<SplashAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<SplashAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(8);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');

  // Device Mockup Toggle
  const [previewDevice, setPreviewDevice] = useState<'android' | 'iphone'>('android');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [inspectModalAsset, setInspectModalAsset] = useState<SplashAsset | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    action: () => void;
    title: string;
    description: string;
  } | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadPlatform, setUploadPlatform] = useState<string>('ALL');
  const [uploadPublishDirectly, setUploadPublishDirectly] = useState<boolean>(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadBase64, setUploadBase64] = useState<string>('');
  const [uploadPreview, setUploadPreview] = useState<string>('');

  // 1. Load active published splash and history from MariaDB API
  const loadSplashData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch active published splash for showcase
      const activeRes = await fetch('http://localhost:4000/api/v1/mobile/splash/active');
      if (activeRes.ok) {
        const activeJson = await activeRes.json();
        setActiveAsset(activeJson.data || null);
      }

      // Fetch paginated admin assets
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (platformFilter !== 'ALL') params.append('platform', platformFilter);

      const listRes = await fetch(`http://localhost:4000/api/v1/admin/splash?${params.toString()}`);
      if (listRes.ok) {
        const listJson = await listRes.json();
        setAssets(listJson.data || []);
        if (listJson.pagination) {
          setTotalCount(listJson.pagination.total);
          setTotalPages(listJson.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load splash assets:', err);
      setMessage({ text: 'Could not connect to API server. Ensure backend is running.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, platformFilter]);

  useEffect(() => {
    loadSplashData();
  }, [loadSplashData]);

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit.');
        return;
      }
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadPreview(result);
        setUploadBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please enter a title for the splash asset.');
      return;
    }
    if (!uploadBase64) {
      alert('Please select an image file to upload.');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || undefined,
        imageBase64: uploadBase64,
        platform: uploadPlatform,
        status: uploadPublishDirectly ? 'PUBLISHED' : 'DRAFT',
        adminEmail: 'SUPER_ADMIN',
      };

      const res = await fetch('http://localhost:4000/api/v1/admin/splash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to upload splash asset');
      }

      setMessage({ text: json.message || 'Splash image uploaded successfully!', type: 'success' });
      setIsUploadModalOpen(false);
      // Reset form
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      setUploadPreview('');
      setUploadBase64('');
      loadSplashData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Upload failed', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Publish Asset Action
  const handlePublish = async (asset: SplashAsset) => {
    setConfirmDialog({
      title: `Publish Version ${asset.version}?`,
      description: `This will make "${asset.title}" the active in-app splash image for all mobile devotees immediately. Any existing published splash will become DRAFT.`,
      action: async () => {
        try {
          setActionLoading(true);
          const res = await fetch(`http://localhost:4000/api/v1/admin/splash/${asset.id}/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminEmail: 'SUPER_ADMIN' }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message);
          setMessage({ text: json.message, type: 'success' });
          loadSplashData();
        } catch (err: any) {
          setMessage({ text: err.message, type: 'error' });
        } finally {
          setActionLoading(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  // Unpublish Asset Action
  const handleUnpublish = async (asset: SplashAsset) => {
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:4000/api/v1/admin/splash/${asset.id}/unpublish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'SUPER_ADMIN' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setMessage({ text: json.message, type: 'success' });
      loadSplashData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Archive Asset Action
  const handleArchive = async (asset: SplashAsset) => {
    setConfirmDialog({
      title: `Archive "${asset.title}"?`,
      description: 'Archived splash assets will be safely removed from active visibility, but retained in immutable history.',
      action: async () => {
        try {
          setActionLoading(true);
          const res = await fetch(`http://localhost:4000/api/v1/admin/splash/${asset.id}/archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminEmail: 'SUPER_ADMIN' }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message);
          setMessage({ text: json.message, type: 'success' });
          loadSplashData();
        } catch (err: any) {
          setMessage({ text: err.message, type: 'error' });
        } finally {
          setActionLoading(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  // Restore Asset Action
  const handleRestore = async (asset: SplashAsset) => {
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:4000/api/v1/admin/splash/${asset.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'SUPER_ADMIN' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setMessage({ text: json.message, type: 'success' });
      loadSplashData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border shadow-lg ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-semibold">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-950/70 via-[#1E1E1E] to-[#181818] p-6 rounded-2xl border border-orange-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/25 border border-orange-500/50 flex items-center justify-center text-[#FFB300] font-bold text-xl shadow-inner">
              🕉️
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#FFB300] tracking-wide">
                Dynamic Splash Screen Management
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage the devotional artwork displayed when devotees launch the Saranam Ayyappa mobile app.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadSplashData()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs font-semibold border border-neutral-700 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFB300]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-950/60 transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Splash Image</span>
          </button>
        </div>
      </div>

      {/* Published Splash Showcase + Live Phone Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Active Asset Metadata & Publishing Status (7 cols) */}
        <div className="lg:col-span-7 bg-[#1E1E1E] p-6 rounded-2xl border border-[#2C2C2C] flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                  Currently Active on Mobile
                </span>
              </div>

              {activeAsset && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-orange-600/20 text-[#FFB300] border border-orange-500/40">
                  Version {activeAsset.version}
                </span>
              )}
            </div>

            {activeAsset ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {activeAsset.title}
                  </h3>
                  {activeAsset.description && (
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {activeAsset.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#141414] border border-[#2C2C2C]">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase block">Dimensions</span>
                    <span className="text-xs font-bold text-gray-200 mt-0.5 block">
                      {activeAsset.imageWidth || 1080} × {activeAsset.imageHeight || 1920}
                    </span>
                    <span className="text-[10px] text-orange-400 font-medium">9:16 Portrait</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141414] border border-[#2C2C2C]">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase block">File Format</span>
                    <span className="text-xs font-bold text-gray-200 mt-0.5 block uppercase">
                      {activeAsset.mimeType.replace('image/', '')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {activeAsset.fileSize ? `${Math.round(activeAsset.fileSize / 1024)} KB` : '403 KB'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141414] border border-[#2C2C2C]">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase block">Platforms</span>
                    <span className="text-xs font-bold text-[#FFB300] mt-0.5 block">
                      {activeAsset.platform === 'ALL' ? 'Android & iOS' : activeAsset.platform}
                    </span>
                    <span className="text-[10px] text-emerald-400">Live Production</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs text-orange-300/90 leading-relaxed flex items-start gap-2.5">
                  <span className="text-base">✨</span>
                  <span>
                    When mobile devotees open the app, this artwork is retrieved from MariaDB and cached locally.
                    Devotees with no internet connection view this image from offline cache seamlessly.
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 text-xs space-y-2">
                <FileImage className="w-10 h-10 mx-auto text-gray-600" />
                <p>No active splash screen published currently.</p>
                <p className="text-gray-600">The mobile app is currently displaying the bundled offline fallback artwork.</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#2C2C2C] flex items-center justify-between text-xs text-gray-500">
            <span>Last Published: {activeAsset?.updatedAt ? new Date(activeAsset.updatedAt).toLocaleString() : 'N/A'}</span>
            <span>Uploaded by: <strong className="text-gray-300">{activeAsset?.createdBy || 'SUPER_ADMIN'}</strong></span>
          </div>
        </div>

        {/* Right Side: Interactive Device Mockup (5 cols) */}
        <div className="lg:col-span-5 bg-[#1E1E1E] p-6 rounded-2xl border border-[#2C2C2C] flex flex-col items-center shadow-md">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#FFB300]" />
              Live In-App Preview
            </span>

            {/* Device Switcher */}
            <div className="flex bg-[#121212] p-1 rounded-xl border border-[#2C2C2C]">
              <button
                onClick={() => setPreviewDevice('android')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  previewDevice === 'android'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Android
              </button>
              <button
                onClick={() => setPreviewDevice('iphone')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  previewDevice === 'iphone'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                iPhone
              </button>
            </div>
          </div>

          {/* Phone Mockup Frame */}
          <div
            className={`relative bg-black rounded-[40px] border-[10px] ${
              previewDevice === 'android' ? 'border-[#333333]' : 'border-[#262626]'
            } shadow-2xl overflow-hidden flex flex-col items-center justify-between`}
            style={{ width: '260px', height: '520px' }}
          >
            {/* Top Speaker / Camera Notch */}
            <div className="absolute top-2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-700" />
            </div>

            {/* Mobile In-App Splash Display */}
            {activeAsset?.imageUrl ? (
              <img
                src={activeAsset.imageUrl}
                alt={activeAsset.title}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4 text-center">
                <div className="text-3xl mb-2">🕉️</div>
                <span className="text-xs font-bold text-[#FFB300]">Saranam Ayyappa</span>
                <span className="text-[10px] text-gray-500 mt-1">Bundled Fallback</span>
              </div>
            )}

            {/* Floating Top-Right Skip Pill */}
            <div className="absolute top-4 right-3 px-2 py-0.5 rounded-full bg-black/60 border border-amber-400/40 text-[9px] font-bold text-amber-300 z-10">
              Skip &gt;
            </div>

            {/* Bottom Floating Golden Spinner simulating native launch */}
            <div className="absolute bottom-6 self-center z-10 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            </div>
          </div>

          <span className="text-[11px] text-gray-500 mt-3 text-center">
            Exact 100% uncropped portrait presentation rendered on mobile devices.
          </span>
        </div>
      </div>

      {/* Database History Table */}
      <div className="bg-[#1E1E1E] rounded-2xl border border-[#2C2C2C] overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Splash Screen Version History ({totalCount})
            </h3>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search versions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-[#333333] rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#121212] border border-[#333333] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-[#121212] border border-[#333333] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Platforms</option>
              <option value="ANDROID">Android Only</option>
              <option value="IOS">iOS Only</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#181818] border-b border-[#2C2C2C] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Uploaded Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2C2C] text-xs">
              {assets.length > 0 ? (
                assets.map((item) => {
                  const isPublished = item.status === 'PUBLISHED';
                  const isArchived = item.status === 'ARCHIVED';

                  return (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FFB300]">
                        v{item.version}
                      </td>

                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setInspectModalAsset(item)}
                          className="w-12 h-20 bg-black rounded-lg border border-[#333333] overflow-hidden cursor-pointer hover:border-orange-500 transition shadow-sm"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-bold text-gray-200 block truncate">{item.title}</span>
                        {item.description && (
                          <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                            {item.description}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 block mt-1 font-mono">
                          {item.imageWidth || 1080}×{item.imageHeight || 1920} • {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : '403 KB'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-300">
                        {item.platform === 'ALL' ? 'Android + iOS' : item.platform}
                      </td>

                      <td className="py-3.5 px-4">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            PUBLISHED
                          </span>
                        ) : isArchived ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-800 text-gray-400 border border-neutral-700">
                            ARCHIVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            DRAFT
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectModalAsset(item)}
                            className="p-1.5 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-white transition"
                            title="Preview Full Screen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isPublished && !isArchived && (
                            <button
                              onClick={() => handlePublish(item)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-sm"
                            >
                              Publish
                            </button>
                          )}

                          {isPublished && (
                            <button
                              onClick={() => handleUnpublish(item)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-[11px] font-bold transition border border-amber-500/30"
                            >
                              Unpublish
                            </button>
                          )}

                          {!isArchived ? (
                            <button
                              onClick={() => handleArchive(item)}
                              disabled={actionLoading}
                              className="p-1.5 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-red-400 transition"
                              title="Archive Version"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(item)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-[11px] font-bold transition border border-emerald-500/30 flex items-center gap-1"
                              title="Restore to Draft"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                    No splash screen records found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="p-4 border-t border-[#2C2C2C] flex items-center justify-between text-xs text-gray-400">
          <span>
            Showing page {page} of {totalPages} ({totalCount} total assets)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-[#333333] hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-gray-200 px-2">{page}</span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-[#333333] hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Splash Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E1E1E] rounded-2xl border border-orange-500/40 w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload New Devotional Splash Artwork
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {/* File Drop Area */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-2">
                  Select Splash Image (Recommended: 9:16 Portrait, up to 15MB)
                </label>
                <div className="border-2 border-dashed border-[#3C3C3C] hover:border-orange-500 rounded-xl p-5 text-center cursor-pointer transition bg-[#141414] relative">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploadPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="w-24 h-40 object-contain rounded-lg border border-orange-500/50 bg-black"
                      />
                      <span className="text-xs font-bold text-[#FFB300]">
                        {uploadFile?.name} ({(uploadFile?.size || 0) / 1024 > 1024 ? `${((uploadFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB` : `${Math.round((uploadFile?.size || 0) / 1024)} KB`})
                      </span>
                      <span className="text-[10px] text-gray-400">Click or drag another image to replace</span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <FileImage className="w-10 h-10 mx-auto text-orange-400/80" />
                      <p className="text-xs font-semibold text-gray-200">
                        Drop your high-resolution devotional splash artwork here
                      </p>
                      <p className="text-[11px] text-gray-500">Supports JPEG, PNG, and WebP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Internal Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saranam Ayyappa Mandala Pooja 2026"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Target Platform
                  </label>
                  <select
                    value={uploadPlatform}
                    onChange={(e) => setUploadPlatform(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="ALL">All Platforms (Android + iOS)</option>
                    <option value="ANDROID">Android Only</option>
                    <option value="IOS">iOS Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Description / Devotional Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes about festivals, special deeksha period, or design reference..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Immediate Publishing Toggle */}
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Publish Immediately</span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Activate this artwork immediately on all mobile devices upon uploading.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={uploadPublishDirectly}
                  onChange={(e) => setUploadPublishDirectly(e.target.checked)}
                  className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-950/60 disabled:opacity-50"
                >
                  {actionLoading ? 'Uploading & Processing...' : 'Save & Upload Splash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {inspectModalAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] rounded-2xl border border-[#333333] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{inspectModalAsset.title}</h4>
                <span className="text-[11px] text-[#FFB300] font-mono">v{inspectModalAsset.version} • {inspectModalAsset.status}</span>
              </div>
              <button
                onClick={() => setInspectModalAsset(null)}
                className="p-1 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={inspectModalAsset.imageUrl}
                alt={inspectModalAsset.title}
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>

            <div className="p-4 border-t border-[#2C2C2C] flex items-center justify-between text-xs text-gray-400">
              <span>{inspectModalAsset.imageWidth}×{inspectModalAsset.imageHeight} px</span>
              {inspectModalAsset.status !== 'PUBLISHED' && inspectModalAsset.status !== 'ARCHIVED' && (
                <button
                  onClick={() => {
                    const target = inspectModalAsset;
                    setInspectModalAsset(null);
                    handlePublish(target);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Publish Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] rounded-2xl border border-orange-500/50 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-600/20 text-[#FFB300] flex items-center justify-center font-bold">
                ⚠️
              </div>
              <h4 className="text-base font-bold text-white">{confirmDialog.title}</h4>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2C]">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.action}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

