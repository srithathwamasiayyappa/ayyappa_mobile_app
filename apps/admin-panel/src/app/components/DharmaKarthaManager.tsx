'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  AlertTriangle,
  X,
  User,
  Sparkles,
} from 'lucide-react';

export interface DharmaKarthaTempleItem {
  id: number;
  name: string;
  alternateName?: string;
  slug: string;
  primaryDeity: string;
  shortDescription?: string;
  about?: string;
  history?: string;
  speciality?: string;
  country: string;
  state: string;
  district?: string;
  city: string;
  address?: string;
  pincode?: string;
  officePhone?: string;
  officialEmail?: string;
  officialWebsite?: string;
  heroImageUrl?: string;
  status: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED' | string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    fullName?: string;
    phoneNumber?: string;
    membershipRole?: string;
    membershipStatus?: string;
  } | null;
}

interface DharmaKarthaManagerProps {
  apiBaseUrl?: string;
  onNotification?: (msg: string) => void;
}

export const DharmaKarthaManager: React.FC<DharmaKarthaManagerProps> = ({
  apiBaseUrl,
  onNotification,
}) => {
  const baseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || 'https://backendapis.saranamayyappa.in/api/v1';

  const [temples, setTemples] = useState<DharmaKarthaTempleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'>('ALL');

  // Modals
  const [detailTemple, setDetailTemple] = useState<DharmaKarthaTempleItem | null>(null);
  const [rejectTemple, setRejectTemple] = useState<DharmaKarthaTempleItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Local notification message
  const [localNotice, setLocalNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setLocalNotice({ text, type });
    if (onNotification && type === 'success') {
      onNotification(text);
    }
    setTimeout(() => setLocalNotice(null), 5000);
  };

  const loadTemples = useCallback(async () => {
    setLoading(true);
    try {
      // Try primary endpoint under /dharma-kartha/admin/temples, fallback to /admin/dharma-kartha/temples
      let res = await fetch(`${baseUrl}/dharma-kartha/admin/temples`);
      if (!res.ok) {
        res = await fetch(`${baseUrl}/admin/dharma-kartha/temples`);
      }
      const data = await res.json();
      if (data && Array.isArray(data.temples)) {
        setTemples(data.temples);
      } else if (Array.isArray(data)) {
        setTemples(data);
      } else {
        setTemples([]);
      }
    } catch (err: any) {
      console.error('Failed to load Dharma Kartha temples:', err);
      notify('Failed to connect to backend for Dharma Kartha temples.', 'error');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadTemples();
  }, [loadTemples]);

  // Review Temple (Approve or Reject)
  const handleReview = async (
    templeId: number,
    approve: boolean,
    reason?: string
  ) => {
    setActionLoadingId(templeId);
    try {
      const payload = {
        status: approve ? 'PUBLISHED' : 'REJECTED',
        approve,
        isVerified: approve,
        rejectionReason: reason || undefined,
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('ayyappa_admin_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await fetch(`${baseUrl}/dharma-kartha/admin/temples/${templeId}/review`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback to /admin/dharma-kartha/temples/:id/review
        res = await fetch(`${baseUrl}/admin/dharma-kartha/temples/${templeId}/review`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();

      if (res.ok && result.success !== false) {
        notify(
          approve
            ? `Temple #${templeId} approved and PUBLISHED successfully! It is now live in the mobile app and website directory.`
            : `Temple #${templeId} marked as REJECTED.`
        );

        // Update local state immediately
        setTemples((prev) =>
          prev.map((t) =>
            t.id === templeId
              ? {
                  ...t,
                  status: approve ? 'PUBLISHED' : 'REJECTED',
                  isVerified: approve,
                  shortDescription: !approve && reason ? `[Rejection Reason: ${reason}]` : t.shortDescription,
                }
              : t
          )
        );

        // Update detail modal if open
        if (detailTemple && detailTemple.id === templeId) {
          setDetailTemple((prev) =>
            prev
              ? {
                  ...prev,
                  status: approve ? 'PUBLISHED' : 'REJECTED',
                  isVerified: approve,
                }
              : null
          );
        }

        // Close reject modal if open
        setRejectTemple(null);
        setRejectionReason('');
      } else {
        notify(result.message || 'Action failed on backend.', 'error');
      }
    } catch (err: any) {
      console.error('Failed to submit temple review:', err);
      notify('Network error when updating temple status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered List
  const filteredTemples = temples.filter((t) => {
    // Status filter
    if (statusFilter !== 'ALL' && t.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = t.name?.toLowerCase().includes(q);
      const matchCity = t.city?.toLowerCase().includes(q);
      const matchState = t.state?.toLowerCase().includes(q);
      const matchDeity = t.primaryDeity?.toLowerCase().includes(q);
      const matchOwner = t.owner?.fullName?.toLowerCase().includes(q) || t.owner?.phoneNumber?.includes(q);
      return matchName || matchCity || matchState || matchDeity || matchOwner;
    }
    return true;
  });

  // Dynamic Counts
  const totalCount = temples.length;
  const pendingCount = temples.filter((t) => t.status === 'PENDING_APPROVAL').length;
  const publishedCount = temples.filter((t) => t.status === 'PUBLISHED').length;
  const rejectedCount = temples.filter((t) => t.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert Notice */}
      {localNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-lg transition-all ${
            localNotice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300'
              : 'bg-rose-950/80 border-rose-600/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {localNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{localNotice.text}</span>
          </div>
          <button
            onClick={() => setLocalNotice(null)}
            className="text-gray-400 hover:text-white ml-4 p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Stats Overview */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#2C2C2C]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-100">
                  Dharma Kartha Temple Submissions & Approvals
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Verify newly registered temples submitted by Dharma Karthas. When approved, temples go live across the mobile app and website directory.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadTemples}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#252525] hover:bg-[#2C2C2C] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh List</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Total */}
          <div className="bg-[#181818] p-4 rounded-xl border border-[#282828]">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Submissions</p>
            <p className="text-2xl font-black text-gray-100 mt-1">{totalCount}</p>
            <span className="text-[11px] text-gray-500 mt-1 block">Registered in database</span>
          </div>

          {/* Pending Approval (Active Glow) */}
          <div
            onClick={() => setStatusFilter('PENDING_APPROVAL')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === 'PENDING_APPROVAL'
                ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/20'
                : 'bg-[#181818] border-amber-900/30 hover:border-amber-700/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending Verification</p>
              {pendingCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
            <span className="text-[11px] text-amber-500/80 mt-1 block">Awaiting admin review</span>
          </div>

          {/* Published / Live */}
          <div
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === 'PUBLISHED'
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                : 'bg-[#181818] border-emerald-900/30 hover:border-emerald-700/50'
            }`}
          >
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Approved & Live</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{publishedCount}</p>
            <span className="text-[11px] text-emerald-500/80 mt-1 block">Visible in public directory</span>
          </div>

          {/* Rejected */}
          <div
            onClick={() => setStatusFilter('REJECTED')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/20'
                : 'bg-[#181818] border-rose-900/30 hover:border-rose-700/50'
            }`}
          >
            <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{rejectedCount}</p>
            <span className="text-[11px] text-rose-500/80 mt-1 block">Declined submissions</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-[#FFB300] text-black shadow-md shadow-amber-950/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
            }`}
          >
            All Submissions ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING_APPROVAL')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'PENDING_APPROVAL'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'PUBLISHED'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published ({publishedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected ({rejectedCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search temple, deity, city, owner..."
            className="w-full bg-[#181818] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Temples Table */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-xs text-gray-400">Loading Dharma Kartha temple records from MySQL database...</p>
            </div>
          ) : filteredTemples.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No temple submissions found</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No records matched your search query or status filter.'
                  : 'No Dharma Kartha temple submissions recorded yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                <tr>
                  <th className="px-5 py-3.5">Temple</th>
                  <th className="px-4 py-3.5">Primary Deity</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Dharma Kartha / Owner</th>
                  <th className="px-4 py-3.5">Submitted Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C2C]">
                {filteredTemples.map((temple) => {
                  const isPending = temple.status === 'PENDING_APPROVAL';
                  const isPublished = temple.status === 'PUBLISHED';
                  const isRejected = temple.status === 'REJECTED';
                  const isOperating = actionLoadingId === temple.id;

                  return (
                    <tr key={temple.id} className="hover:bg-neutral-800/40 transition">
                      {/* Temple Name & Image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-[#282828] border border-[#3C3C3C] overflow-hidden shrink-0 flex items-center justify-center">
                            {temple.heroImageUrl ? (
                              <img
                                src={temple.heroImageUrl}
                                alt={temple.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-100 text-sm">{temple.name}</span>
                              <span className="text-[10px] font-mono text-gray-500">#{temple.id}</span>
                            </div>
                            {temple.alternateName && (
                              <p className="text-[11px] text-gray-400">{temple.alternateName}</p>
                            )}
                            {temple.shortDescription && (
                              <p className="text-[11px] text-gray-500 line-clamp-1 max-w-xs mt-0.5">
                                {temple.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Primary Deity */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{temple.primaryDeity || 'Lord Ayyappa'}</span>
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-1.5 text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">{temple.city || 'City'}</p>
                            <p className="text-[11px] text-gray-500">{temple.state || 'State'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dharma Kartha Owner Info */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-200 font-semibold">
                            <User className="w-3 h-3 text-amber-400" />
                            <span>{temple.owner?.fullName || 'Dharma Kartha'}</span>
                          </div>
                          {temple.owner?.phoneNumber && (
                            <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <span>{temple.owner.phoneNumber}</span>
                            </p>
                          )}
                          {temple.officePhone && !temple.owner?.phoneNumber && (
                            <p className="text-[11px] text-gray-400 font-mono">
                              {temple.officePhone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-4 py-4 text-gray-400 font-mono text-[11px]">
                        {temple.createdAt ? new Date(temple.createdAt).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>PENDING APPROVAL</span>
                          </span>
                        )}
                        {isPublished && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PUBLISHED / LIVE</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                            <XCircle className="w-3 h-3" />
                            <span>REJECTED</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Full Details Button */}
                          <button
                            onClick={() => setDetailTemple(temple)}
                            className="p-1.5 bg-[#262626] hover:bg-[#333] text-gray-300 rounded-lg border border-[#3C3C3C] transition"
                            title="View Full Temple Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Approve Button */}
                          <button
                            onClick={() => handleReview(temple.id, true)}
                            disabled={isOperating || isPublished}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40 ${
                              isPublished
                                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-600 cursor-default'
                                : 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-600/40 text-emerald-400'
                            }`}
                            title="Approve Temple & Publish to Public Directory"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isPublished ? 'Approved' : 'Approve'}</span>
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => {
                              setRejectTemple(temple);
                              setRejectionReason('');
                            }}
                            disabled={isOperating || isRejected}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40 ${
                              isRejected
                                ? 'bg-rose-950/20 border-rose-900/30 text-rose-600 cursor-default'
                                : 'bg-rose-600/20 hover:bg-rose-600/30 border-rose-600/40 text-rose-400'
                            }`}
                            title="Reject Temple Submission"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{isRejected ? 'Rejected' : 'Reject'}</span>
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

      {/* DETAIL MODAL */}
      {detailTemple && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#2C2C2C]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-100">{detailTemple.name}</span>
                  <span className="text-xs font-mono text-gray-500">#{detailTemple.id}</span>
                </div>
                {detailTemple.alternateName && (
                  <p className="text-xs text-amber-400 mt-0.5">{detailTemple.alternateName}</p>
                )}
              </div>
              <button
                onClick={() => setDetailTemple(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#282828]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pill in Modal */}
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-xl border border-[#282828]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Current Verification Status:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    detailTemple.status === 'PUBLISHED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : detailTemple.status === 'REJECTED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                  }`}
                >
                  {detailTemple.status}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                Submitted: {detailTemple.createdAt ? new Date(detailTemple.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>

            {/* Temple Hero Image Banner */}
            {detailTemple.heroImageUrl && (
              <div className="w-full h-48 rounded-xl overflow-hidden border border-[#3C3C3C] bg-[#181818] relative">
                <img
                  src={detailTemple.heroImageUrl}
                  alt={detailTemple.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1">
                <p className="text-gray-400 font-semibold">Primary Deity</p>
                <p className="text-amber-400 font-bold">{detailTemple.primaryDeity || 'Lord Ayyappa'}</p>
              </div>

              <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1">
                <p className="text-gray-400 font-semibold">Dharma Kartha / Owner</p>
                <p className="text-gray-200 font-bold">{detailTemple.owner?.fullName || 'Registered Devotee'}</p>
                {detailTemple.owner?.phoneNumber && (
                  <p className="text-gray-400 font-mono">{detailTemple.owner.phoneNumber}</p>
                )}
              </div>

              <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1 sm:col-span-2">
                <p className="text-gray-400 font-semibold">Full Address & Location</p>
                <p className="text-gray-200">
                  {detailTemple.address || 'Address not provided'}, {detailTemple.city}, {detailTemple.district ? `${detailTemple.district}, ` : ''}{detailTemple.state} - {detailTemple.pincode || ''}
                </p>
              </div>

              {detailTemple.officePhone && (
                <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1">
                  <p className="text-gray-400 font-semibold">Office Contact Phone</p>
                  <p className="text-gray-200 font-mono">{detailTemple.officePhone}</p>
                </div>
              )}

              {detailTemple.officialEmail && (
                <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1">
                  <p className="text-gray-400 font-semibold">Official Email</p>
                  <p className="text-gray-200">{detailTemple.officialEmail}</p>
                </div>
              )}

              {detailTemple.officialWebsite && (
                <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1 sm:col-span-2">
                  <p className="text-gray-400 font-semibold">Website</p>
                  <a
                    href={detailTemple.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline truncate block"
                  >
                    {detailTemple.officialWebsite}
                  </a>
                </div>
              )}

              {detailTemple.speciality && (
                <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1 sm:col-span-2">
                  <p className="text-gray-400 font-semibold">Temple Speciality / Mahatyam</p>
                  <p className="text-gray-300 leading-relaxed">{detailTemple.speciality}</p>
                </div>
              )}

              {detailTemple.about && (
                <div className="bg-[#181818] p-3 rounded-xl border border-[#282828] space-y-1 sm:col-span-2">
                  <p className="text-gray-400 font-semibold">About Temple</p>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{detailTemple.about}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button
                onClick={() => setDetailTemple(null)}
                className="px-4 py-2 bg-[#252525] hover:bg-[#2C2C2C] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  setRejectTemple(detailTemple);
                  setRejectionReason('');
                }}
                disabled={detailTemple.status === 'REJECTED'}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/40 text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => handleReview(detailTemple.id, true)}
                disabled={detailTemple.status === 'PUBLISHED'}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Publish Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectTemple && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-rose-900/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-100">Reject Temple Submission</h3>
                <p className="text-xs text-gray-400">Temple #{rejectTemple.id}: {rejectTemple.name}</p>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              Are you sure you want to decline this temple? The Dharma Kartha will see the updated &ldquo;REJECTED&rdquo; status on their dashboard and mobile profile.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Rejection Reason (Optional):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Duplicate temple entry, invalid trust document, incomplete address..."
                rows={3}
                className="w-full bg-[#181818] border border-[#333] rounded-lg p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectTemple(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-[#252525] hover:bg-[#2C2C2C] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(rejectTemple.id, false, rejectionReason)}
                disabled={actionLoadingId === rejectTemple.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
