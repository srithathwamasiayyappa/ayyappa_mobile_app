'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';

export interface DeityAdminItem {
  id: number;
  slug: string;
  name: string;
  teluguName?: string;
  tamilName?: string;
  kannadaName?: string;
  hindiName?: string;
  description?: string;
  category: string;
  imageUrl?: string;
  imageName?: string;
  aliases?: string;
  isFeatured: boolean;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'popular', label: 'Popular / Featured' },
  { value: 'shiva', label: 'Shiva Family' },
  { value: 'vishnu', label: 'Vishnu Family' },
  { value: 'devi', label: 'Devi (Goddesses)' },
  { value: 'others', label: 'Others' },
];

const API_BASE = 'http://localhost:4000/api/v1';

export const DeityManager: React.FC = () => {
  const [deities, setDeities] = useState<DeityAdminItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters & Server Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTelugu, setFormTelugu] = useState('');
  const [formTamil, setFormTamil] = useState('');
  const [formKannada, setFormKannada] = useState('');
  const [formHindi, setFormHindi] = useState('');
  const [formCategory, setFormCategory] = useState('popular');
  const [formImageName, setFormImageName] = useState('lord_ayyappa.png');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAliases, setFormAliases] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formOrderIndex, setFormOrderIndex] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadDeities = useCallback(async () => {
    setLoading(true);
    try {
      const qParts: string[] = [`page=${page}`, `limit=50`];
      if (searchQuery.trim()) qParts.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      if (categoryFilter !== 'all') qParts.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (featuredFilter === 'featured') qParts.push('featured=true');
      if (featuredFilter === 'standard') qParts.push('featured=false');

      const res = await fetch(`${API_BASE}/admin/deities?${qParts.join('&')}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDeities(json.data);
        setTotalCount(json.total || json.data.length);
        setTotalPages(json.totalPages || 1);
      } else {
        setDeities([]);
      }
    } catch (err: any) {
      showNotification('Failed to connect to backend API: ' + err.message, 'error');
      setDeities([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryFilter, featuredFilter]);

  useEffect(() => {
    loadDeities();
  }, [loadDeities]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormTelugu('');
    setFormTamil('');
    setFormKannada('');
    setFormHindi('');
    setFormCategory('popular');
    setFormImageName('lord_ayyappa.png');
    setFormImageUrl('');
    setFormAliases('');
    setFormDescription('');
    setFormIsFeatured(false);
    setFormOrderIndex(deities.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DeityAdminItem) => {
    setEditingId(item.id);
    setFormName(item.name || '');
    setFormSlug(item.slug || '');
    setFormTelugu(item.teluguName || '');
    setFormTamil(item.tamilName || '');
    setFormKannada(item.kannadaName || '');
    setFormHindi(item.hindiName || '');
    setFormCategory(item.category || 'popular');
    setFormImageName(item.imageName || '');
    setFormImageUrl(item.imageUrl || '');
    setFormAliases(item.aliases || '');
    setFormDescription(item.description || '');
    setFormIsFeatured(Boolean(item.isFeatured));
    setFormOrderIndex(item.orderIndex || 0);
    setFormIsActive(Boolean(item.isActive));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please provide deity English name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        teluguName: formTelugu.trim() || undefined,
        tamilName: formTamil.trim() || undefined,
        kannadaName: formKannada.trim() || undefined,
        hindiName: formHindi.trim() || undefined,
        category: formCategory,
        imageName: formImageName.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        aliases: formAliases.trim() || undefined,
        description: formDescription.trim() || undefined,
        isFeatured: formIsFeatured,
        orderIndex: Number(formOrderIndex) || 0,
        isActive: formIsActive,
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`${API_BASE}/admin/deities/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/admin/deities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Operation failed');
      }

      showNotification(json.message || 'Deity saved successfully in MySQL database!');
      setIsModalOpen(false);
      loadDeities();
    } catch (err: any) {
      alert('Error saving deity: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: DeityAdminItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}" from database?\n\nThis will remove it from the mobile app's God Selection screen.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/deities/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Delete failed');
      }
      showNotification(`Deity "${item.name}" deleted from database.`);
      loadDeities();
    } catch (err: any) {
      alert('Delete error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-xl ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <p className="text-sm font-semibold">{message.text}</p>
          </div>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#181818] border border-[var(--admin-border-subtle)] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[var(--admin-gold)]" />
            <h2 className="text-xl font-bold text-[var(--admin-ivory)]">
              5. Spiritual Management Vidhanam — Gods & Goddesses
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Manage all Gods and Goddesses fetched dynamically by the mobile app's God Selection Screen.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--admin-gold)] to-[var(--admin-gold-hover)] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>Add New God / Goddess</span>
        </button>
      </div>

      {/* Filter & Server Search Bar */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Server Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by deity name, slug, aliases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[var(--admin-gold)]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[var(--admin-gold)]"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Dropdown */}
          <div className="relative w-full sm:w-40">
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[var(--admin-gold)]"
            >
              <option value="all">All Deities</option>
              <option value="featured">Featured Top 6</option>
              <option value="standard">Standard Catalog</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadDeities}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2A2A2A] text-gray-300 hover:text-white text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#141414] text-[var(--admin-gold)] uppercase font-bold text-[11px] border-b border-[#2C2C2C]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">God / Goddess</th>
                <th className="py-3.5 px-4">Code / Slug</th>
                <th className="py-3.5 px-4">Regional Translations</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]">
              {loading && deities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--admin-gold)]" />
                    Fetching deities from MySQL database...
                  </td>
                </tr>
              ) : deities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <p className="text-base font-semibold text-gray-300">No deities found</p>
                    <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or add a new deity.</p>
                  </td>
                </tr>
              ) : (
                deities.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#252525] transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-gray-500 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2A2421] border border-[#3A302A] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-base">🕉️</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-100 text-sm">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{item.imageName || 'default asset'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#141414] border border-[#333] px-2 py-0.5 rounded text-[11px] font-mono text-amber-200">
                        {item.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.teluguName && (
                          <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.5 rounded text-[10px]">
                            TE: {item.teluguName}
                          </span>
                        )}
                        {item.tamilName && (
                          <span className="bg-amber-950/60 text-amber-300 border border-amber-800/40 px-1.5 py-0.5 rounded text-[10px]">
                            TA: {item.tamilName}
                          </span>
                        )}
                        {item.kannadaName && (
                          <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded text-[10px]">
                            KN: {item.kannadaName}
                          </span>
                        )}
                        {item.hindiName && (
                          <span className="bg-purple-950/60 text-purple-300 border border-purple-800/40 px-1.5 py-0.5 rounded text-[10px]">
                            HI: {item.hindiName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize bg-[#2C2C2C] text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-300" /> Featured
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-gray-400 text-xs">
                      {item.orderIndex}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Deity"
                          className="p-1.5 rounded-lg bg-[#2C2C2C] text-gray-300 hover:text-[var(--admin-gold)] hover:bg-[#383838] transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Delete Deity from Database"
                          className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-400 hover:bg-rose-900/60 hover:text-white transition"
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

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--admin-gold)]" />
                <h3 className="font-bold text-base text-[var(--admin-ivory)]">
                  {editingId ? 'Edit God / Goddess' : 'Add New God / Goddess to Database'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2C2C2C] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: English Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lord Ayyappa"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!editingId && !formSlug) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
                      }
                    }}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Code / Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ayyappa"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, ''))}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)] font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Regional Names (Telugu, Tamil) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">
                    Telugu Name (తెలుగు)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. అయ్యప్ప స్వామి"
                    value={formTelugu}
                    onChange={(e) => setFormTelugu(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                    Tamil Name (தமிழ்)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ஐயப்பன்"
                    value={formTamil}
                    onChange={(e) => setFormTamil(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 3: Regional Names (Kannada, Hindi) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">
                    Kannada Name (ಕನ್ನಡ)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ"
                    value={formKannada}
                    onChange={(e) => setFormKannada(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-400 uppercase mb-1">
                    Hindi Name (हिन्दी)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. अय्यप्पा स्वामी"
                    value={formHindi}
                    onChange={(e) => setFormHindi(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Row 4: Category & Image Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)]"
                  >
                    <option value="popular">Popular / Featured</option>
                    <option value="shiva">Shiva Family</option>
                    <option value="vishnu">Vishnu Family</option>
                    <option value="devi">Devi (Goddesses)</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Image File Name (Bundled Asset)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. lord_ayyappa.png or venkateswara.jpg"
                    value={formImageName}
                    onChange={(e) => setFormImageName(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)] font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Remote Image URL */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Remote / Uploaded Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://backendapis.saranamayyappa.in/uploads/deities/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)]"
                />
              </div>

              {/* Row 6: Aliases for Search */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Aliases for Search (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ayyappa, manikanta, shabarimala, shasta"
                  value={formAliases}
                  onChange={(e) => setFormAliases(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)]"
                />
              </div>

              {/* Row 7: Description */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Devotional Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short devotional significance of this deity..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)]"
                />
              </div>

              {/* Row 8: Toggles (Featured, Active, Order) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#2C2C2C]">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={formOrderIndex}
                    onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[var(--admin-gold)] font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="deityFeaturedCheck"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <label htmlFor="deityFeaturedCheck" className="text-xs font-bold text-amber-300 cursor-pointer">
                    Featured (Top 6 on Screen)
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="deityActiveCheck"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <label htmlFor="deityActiveCheck" className="text-xs font-bold text-emerald-300 cursor-pointer">
                    Active in Mobile App
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#2C2C2C] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#2A2A2A] text-gray-300 text-xs font-semibold hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--admin-gold)] to-[var(--admin-gold-hover)] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Create Deity in DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
