'use client';

import React, { useState } from 'react';
import { Sparkles, Globe2, Check, Copy, CheckCircle2, AlertCircle, Loader2, Save, ArrowRight } from 'lucide-react';

export interface FieldDefinition {
  key: string;
  label: string;
  value: string;
  isHtml?: boolean;
}

export interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: string; // 'categories' | 'devotional' | 'festivals' | 'temples' | 'cms' | 'ticker'
  recordId?: number | string;
  fields: FieldDefinition[];
  apiBaseUrl: string;
  currentLang?: string;
  onApplyToEditor?: (translatedFields: { [key: string]: string }, targetLang: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'te', label: 'Telugu (తెలుగు)', isDefault: true, flag: '🚩' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)', isDefault: true, flag: '🕉️' },
  { code: 'ta', label: 'Tamil (தமிழ்)', isDefault: true, flag: '🪔' },
  { code: 'hi', label: 'Hindi (हिन्दी)', isDefault: true, flag: '🇮🇳' },
];

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  onClose,
  module,
  recordId,
  fields,
  apiBaseUrl,
  currentLang = 'en',
  onApplyToEditor
}) => {
  const [sourceLang, setSourceLang] = useState('en');
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['te', 'kn', 'ta', 'hi']);
  const [activeTab, setActiveTab] = useState<string>('te');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Draft translations state: { [langCode]: { [fieldKey]: string } }
  const [translations, setTranslations] = useState<{ [langCode: string]: { [fieldKey: string]: string } }>({});
  const [providerBadge, setProviderBadge] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTarget = (code: string) => {
    setSelectedTargets(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleGenerate = async () => {
    if (selectedTargets.length === 0) {
      setErrorMsg('Please select at least one target language.');
      return;
    }

    const fieldsPayload: { [key: string]: string } = {};
    const htmlFieldsList: string[] = [];
    fields.forEach(f => {
      fieldsPayload[f.key] = f.value || '';
      if (f.isHtml) htmlFieldsList.push(f.key);
    });

    const hasAnyText = Object.values(fieldsPayload).some(v => v && v.trim().length > 0);
    if (!hasAnyText) {
      setErrorMsg('All source fields are empty. Please enter text in the source fields first.');
      return;
    }

    setIsTranslating(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch(`${apiBaseUrl}/admin/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          recordId,
          sourceLang,
          targetLangs: selectedTargets,
          fields: fieldsPayload,
          htmlFields: htmlFieldsList
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (data.results) {
        setTranslations(data.results);
        if (!selectedTargets.includes(activeTab) && selectedTargets.length > 0) {
          setActiveTab(selectedTargets[0]);
        }
        setProviderBadge(
          data.provider === 'google_cloud_v3' 
            ? 'Google Cloud Translation Advanced (v3) + Sacred Glossary' 
            : data.provider === 'google_translator'
            ? 'Google Translator Engine (Real-Time) + Sacred Glossary'
            : 'Saranam Ayyappa Devotional Sacred Engine'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Translation generation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (Object.keys(translations).length === 0) {
      setErrorMsg('No translations to save yet. Click "Generate Translation" first.');
      return;
    }

    setIsSavingDb(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch(`${apiBaseUrl}/admin/translate/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          recordId,
          translations
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Save failed with status ${res.status}`);
      }

      const data = await res.json();
      setSaveSuccessMsg(data.message || 'Translations successfully stored in MariaDB!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save translations to database');
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleApplyCurrentTabToEditor = () => {
    const targetFields = translations[activeTab];
    if (!targetFields || Object.keys(targetFields).length === 0) {
      setErrorMsg(`No translation available for ${activeTab.toUpperCase()} to apply.`);
      return;
    }

    if (onApplyToEditor) {
      onApplyToEditor(targetFields, activeTab);
      setSaveSuccessMsg(`Applied ${activeTab.toUpperCase()} translation to current editor!`);
    }
  };

  const handleFieldChange = (langCode: string, fieldKey: string, newValue: string) => {
    setTranslations(prev => ({
      ...prev,
      [langCode]: {
        ...(prev[langCode] || {}),
        [fieldKey]: newValue
      }
    }));
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#181818] border border-[#FFB300]/50 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/40 text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2C2C2C] bg-[#1F1F1F]/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-950">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google Translator & Devotional Localization</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">Google Translate Engine</span>
              </h3>
              <p className="text-xs text-gray-400">
                Generate high-fidelity Telugu, Kannada, Tamil, Hindi, & English translations with devotional glossary preservation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Translation Config Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121212] p-4 rounded-xl border border-[#2A2A2A]">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">
                Source Language
              </label>
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
              >
                <option value="en">English (Original source)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिन्दी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">
                Target Languages (Select one or more)
              </label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_LANGUAGES.map(lang => {
                  const isChecked = selectedTargets.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleTarget(lang.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
                        isChecked 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm' 
                          : 'bg-[#1C1C1C] border-[#333] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label.split(' ')[0]}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleGenerate}
              disabled={isTranslating}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-orange-950 flex items-center gap-2 transition"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Translating via Google Cloud v3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate Translations Now</span>
                </>
              )}
            </button>

            {providerBadge && (
              <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{providerBadge}</span>
              </div>
            )}
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Source vs Translated Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left: Source Text */}
            <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-4 flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                  Source Content ({sourceLang.toUpperCase()})
                </span>
                <span className="text-[10px] text-gray-500">Read-Only Reference</span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
                {fields.map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-[11px] font-medium text-amber-400/90">{f.label}</label>
                    <div className="bg-[#1A1A1A] p-2.5 rounded-lg border border-[#2E2E2E] text-xs text-gray-300 break-words whitespace-pre-wrap">
                      {f.value || <span className="text-gray-600 italic">Empty</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Translated Draft Review & Edit */}
            <div className="bg-[#141414] border border-[#FFB300]/30 rounded-xl p-4 flex flex-col space-y-3">
              {/* Target Language Tabs */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {SUPPORTED_LANGUAGES.map(lang => {
                    const hasData = !!translations[lang.code];
                    const isActive = activeTab === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveTab(lang.code)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          isActive
                            ? 'bg-amber-500 text-black shadow-md'
                            : hasData
                            ? 'bg-[#222] text-amber-300 hover:bg-[#2A2A2A]'
                            : 'bg-transparent text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label.split(' ')[0]}</span>
                        {hasData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1"></span>}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-amber-400 font-mono">Editable Draft</span>
              </div>

              {/* Translation Field Inputs for Active Tab */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
                {fields.map(f => {
                  const translatedVal = translations[activeTab]?.[f.key] || '';
                  return (
                    <div key={f.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-amber-300">
                          {f.label} ({activeTab.toUpperCase()})
                        </label>
                        {translatedVal && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(translatedVal, `${activeTab}_${f.key}`)}
                            className="text-[10px] text-gray-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            {copiedKey === `${activeTab}_${f.key}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {f.isHtml || f.value.length > 80 ? (
                        <textarea
                          rows={4}
                          value={translatedVal}
                          onChange={(e) => handleFieldChange(activeTab, f.key, e.target.value)}
                          placeholder={`Translated ${f.label} draft will appear here...`}
                          className="w-full bg-[#181818] border border-[#333] focus:border-amber-400 rounded-lg p-2.5 text-xs text-gray-100 focus:outline-none resize-y"
                        />
                      ) : (
                        <input
                          type="text"
                          value={translatedVal}
                          onChange={(e) => handleFieldChange(activeTab, f.key, e.target.value)}
                          placeholder={`Translated ${f.label} draft will appear here...`}
                          className="w-full bg-[#181818] border border-[#333] focus:border-amber-400 rounded-lg p-2 text-xs text-gray-100 focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tab Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                {onApplyToEditor && (
                  <button
                    type="button"
                    onClick={handleApplyCurrentTabToEditor}
                    disabled={!translations[activeTab]}
                    className="text-xs bg-[#222] hover:bg-[#333] disabled:opacity-40 text-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-amber-500/20"
                  >
                    <span>Apply {activeTab.toUpperCase()} to Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                
                <span className="text-[10px] text-gray-500 italic">
                  Review & edit text before saving
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-[#2C2C2C] bg-[#1C1C1C] rounded-b-2xl">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Target MariaDB: <strong className="text-gray-200">content_translations / app_settings</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSavingDb || Object.keys(translations).length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 transition"
            >
              {isSavingDb ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to MariaDB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Translations to Database</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
