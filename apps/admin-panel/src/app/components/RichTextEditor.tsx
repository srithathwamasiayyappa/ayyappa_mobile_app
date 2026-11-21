'use client';

import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Quote, 
  Code, 
  Eye, 
  FileCode, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  hideTemplateBtn?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = '380px', hideTemplateBtn = false }: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const executeCommand = (cmd: string, val: string = '') => {
    if (typeof window !== 'undefined') {
      document.execCommand(cmd, false, val);
      const editor = document.getElementById('ck-rich-content-editable');
      if (editor) {
        onChange(editor.innerHTML);
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL (e.g. mailto:support@saranamayyappa.org or https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertTemplate = () => {
    const templateHtml = `<div class="contact-help-center">
  <div class="contact-badge" style="color:#d84315;font-weight:700;letter-spacing:1.5px;font-size:12px;margin-bottom:8px;">CONTACT</div>
  <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:600;color:#1a1a1a;margin-bottom:12px;">Get in touch</h1>
  <p style="font-size:16px;color:#555;line-height:1.6;margin-bottom:28px;">Questions, corrections to a temple listing, or partnership enquiries — we'd love to hear from you.</p>

  <div style="margin-bottom:24px;">
    <h3 style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#222;margin-bottom:6px;">Email</h3>
    <p style="font-size:15px;color:#444;"><a href="mailto:support@saranamayyappa.org" style="color:#b71c1c;font-weight:600;text-decoration:none;">support@saranamayyappa.org</a> — for general queries and listing corrections.</p>
  </div>

  <div style="margin-bottom:24px;">
    <h3 style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#222;margin-bottom:6px;">For temple trusts</h3>
    <p style="font-size:15px;color:#444;">Run a temple? <a href="#list-mandir" style="color:#b71c1c;font-weight:600;text-decoration:none;">List your mandir free</a> and manage timings, sevas and donations from your Trust Console.</p>
  </div>

  <div style="margin-bottom:28px;">
    <h3 style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#222;margin-bottom:6px;">Report an issue</h3>
    <p style="font-size:15px;color:#444;">Found a wrong timing or detail? Open the temple page and use “Suggest an edit”, or email us with the temple name — our verification team reviews every report.</p>
  </div>

  <div style="background:#faf8f5;border:1px solid #ebd9cc;border-radius:14px;padding:24px;margin-top:32px;">
    <div style="text-align:center;margin-bottom:18px;">
      <span style="font-size:28px;">🛕</span>
      <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:#2c1810;margin:6px 0;">Add a mandir</h2>
      <p style="font-size:14px;color:#6d584f;">Know a temple that isn't listed yet? Submit it for our team to verify. You'll be credited as its author and can keep it updated from your dashboard.</p>
    </div>

    <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:20px;text-align:center;max-width:420px;margin:0 auto 24px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
      <div style="font-size:20px;color:#777;margin-bottom:4px;">👤</div>
      <h4 style="font-size:16px;font-weight:600;color:#333;margin-bottom:4px;">Please sign in first</h4>
      <p style="font-size:12px;color:#777;margin-bottom:14px;">To submit a mandir and manage it later, you need a free Saranam Ayyappa account. It only takes a minute.</p>
      <a href="/login" style="display:inline-block;background:#8b181b;color:#fff;font-size:13px;font-weight:600;padding:8px 20px;border-radius:999px;text-decoration:none;">Sign in or create an account</a>
    </div>

    <div style="border-top:1px solid #ebd9cc;padding-top:20px;">
      <h3 style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#333;margin-bottom:12px;">How a listing gets published</h3>
      <ol style="padding-left:20px;font-size:14px;color:#444;line-height:1.7;">
        <li><strong>You submit the mandir.</strong> Name, deity, city and location are enough to start. Timings, photographs, the temple phone number and a short history help it get approved faster.</li>
        <li><strong>We verify it.</strong> Every submission is checked by hand against public records, the temple's own website or trust, and map data. We confirm the mandir exists, that the location is right, and that any photographs genuinely show that temple.</li>
        <li><strong>It goes live.</strong> Once approved the page is published with you credited as its author, and it becomes searchable on Saranam Ayyappa.</li>
        <li><strong>You keep it accurate.</strong> Aarti timings change, festivals move, renovations close a sanctum. You can edit your listing at any time from your dashboard, and edits to a live listing are reviewed before they appear.</li>
      </ol>
    </div>

    <div style="margin-top:20px;">
      <h3 style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#333;margin-bottom:8px;">What we ask for</h3>
      <p style="font-size:14px;color:#555;line-height:1.6;">Listings are free, for every mandir, of every size — a famous jyotirlinga and a village shrine are treated the same way. We only ask that the information be accurate and that any photograph you upload is one you have the right to share. We do not accept paid placement, and no temple can pay to rank higher in search results.</p>
    </div>

    <div style="margin-top:20px;">
      <h3 style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#333;margin-bottom:8px;">Are you the temple trust?</h3>
      <p style="font-size:14px;color:#555;line-height:1.6;">If you manage the mandir officially, submit it here and mention the trust's name in the description. We will get in touch to verify your role, after which you can manage the listing's timings, sevas and festival calendar directly. If the temple is already listed, open its page and use <strong>Suggest an edit</strong> instead — that routes the correction straight to our verification team.</p>
    </div>
  </div>
</div>`;
    onChange(templateHtml);
  };

  return (
    <div className="w-full bg-[#141414] border border-[#2C2C2C] rounded-xl overflow-hidden shadow-lg">
      {/* CKEditor Toolbar */}
      <div className="bg-[#1C1C1C] border-b border-[#2C2C2C] px-3 py-2 flex flex-wrap items-center justify-between gap-1.5 text-gray-300">
        <div className="flex items-center flex-wrap gap-1">
          {/* Headings */}
          <button
            type="button"
            title="Heading 1"
            onClick={() => executeCommand('formatBlock', '<h1>')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 2"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Formats */}
          <button
            type="button"
            title="Bold"
            onClick={() => executeCommand('bold')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic"
            onClick={() => executeCommand('italic')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Underline"
            onClick={() => executeCommand('underline')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Lists */}
          <button
            type="button"
            title="Bulleted List"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Blockquote"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Links */}
          <button
            type="button"
            title="Insert Link"
            onClick={handleInsertLink}
            className="p-1.5 hover:bg-[#2A2A2A] rounded transition hover:text-[#FFB300]"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Template Insert */}
          {!hideTemplateBtn && (
            <button
              type="button"
              title="Load Reference Template (Get in touch & Add mandir)"
              onClick={handleInsertTemplate}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold ml-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Reference Layout</span>
            </button>
          )}
        </div>

        {/* View Modes */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition ${
              activeTab === 'preview' 
                ? 'bg-[#FFB300] text-black font-bold' 
                : 'bg-[#262626] text-gray-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{activeTab === 'preview' ? 'Exit Preview' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition ${
              isHtmlMode 
                ? 'bg-orange-600 text-white font-bold' 
                : 'bg-[#262626] text-gray-300 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{isHtmlMode ? 'WYSIWYG' : 'HTML Source'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'preview' ? (
        <div 
          style={{ minHeight }}
          className="p-6 bg-[#FAF8F5] text-neutral-900 max-h-[500px] overflow-y-auto rounded-b-xl"
        >
          <div 
            className="prose max-w-none font-sans"
            dangerouslySetInnerHTML={{ __html: value || '<p style="color:#888;">(No content yet)</p>' }}
          />
        </div>
      ) : isHtmlMode ? (
        <textarea
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Edit raw HTML code..."
          style={{ minHeight }}
          className="w-full bg-[#101010] p-4 text-xs font-mono text-emerald-400 focus:outline-none resize-y"
        />
      ) : (
        <div
          id="ck-rich-content-editable"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder || 'Start typing or paste content...'}
          style={{ minHeight }}
          className="p-4 bg-[#121212] text-gray-100 max-h-[480px] overflow-y-auto focus:outline-none leading-relaxed text-sm prose prose-invert max-w-none"
        />
      )}

      {/* Footer Info */}
      <div className="bg-[#181818] border-t border-[#2C2C2C] px-4 py-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <span>CKEditor 5 Enterprise Mode • WYSIWYG & HTML</span>
        <span>{value ? `${value.length} characters` : '0 characters'}</span>
      </div>
    </div>
  );
}
