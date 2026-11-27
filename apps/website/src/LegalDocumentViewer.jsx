import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './legalPages.css';

const Icon = ({ name = 'Sparkles', size = 18, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={2} {...props} />;
};

const DOC_CONFIG = {
  terms_conditions: {
    badge: 'Legal & Devotional Policy',
    title: 'Terms & Conditions',
    desc: 'Devotee code of conduct, platform usage guidelines, temple seva terms, and digital pilgrimage conditions.',
    route: '/terms'
  },
  privacy_policy: {
    badge: 'Privacy & Data Protection',
    title: 'Privacy Policy',
    desc: 'How the Saranam Ayyappa platform safeguards devotee identity, authentication, personal data, and payment confidentiality.',
    route: '/privacy'
  },
  refund_policy: {
    badge: 'Donation & Offerings Policy',
    title: 'Refund & Cancellation Policy',
    desc: 'Official guidelines regarding voluntary temple hundi offerings, e-seva bookings, duplicate deductions, and scheduling.',
    route: '/refund'
  },
  sabarimala_guidelines: {
    badge: 'Sacred Pilgrimage Rules',
    title: 'Sabarimala Pilgrimage Guidelines',
    desc: 'Authentic 41-day Mandala Vrata deeksha code, Irumudi Kattu rules, 18 sacred steps (Pathinettampadi), and holy route etiquette.',
    route: '/guidelines'
  }
};

const DEFAULT_DOC_CONTENT = {
  refund_policy: `<h2>1. VOLUNTARY DEVOTIONAL OFFERINGS AND E-HUNDI CONTRIBUTIONS</h2>
<p>All voluntary offerings, e-hundi kanikkai, and donations made towards Lord Ayyappa temples, sanctum maintenance, and nitya poojas are treated as irrevocable sacred contributions. Once successfully remitted, voluntary donations cannot be refunded or transferred under standard circumstances, as funds are allocated directly to temple trusts and religious observances.</p>

<h2>2. TEMPLE SEVA & SPECIAL POOJA BOOKINGS</h2>
<p>Seva bookings, special archana tokens, and abhishekam registrations are scheduled in accordance with sanctum timings and priests' availability. If an e-seva cannot be performed due to sanctum closures, official temple restrictions, or force majeure events, the temple administration will reschedule the seva to an alternate auspicious date or perform the sankalpam in absentia with sacred prasad dispatched where applicable.</p>

<h2>3. DUPLICATE TRANSACTIONS & PAYMENT FAILURES</h2>
<p>In the event of technical network disruptions, server timeouts, or banking gateway drops where a devotee account is debited multiple times for a single seva booking, the excess duplicate amount will be verified and refunded back to the original payment source within 5 to 7 working banking days.</p>

<h2>4. ANNADANAM & CHARITABLE INITIATIVES</h2>
<p>Contributions made specifically for free devotee feeding (Annadanam), pilgrim water distribution, and medical seva are dispatched in real time to feed pilgrims. Hence, Annadanam contributions cannot be cancelled once processed.</p>

<h2>5. PRASAD DISPATCH & LOGISTICS CANCELLATIONS</h2>
<p>Sacred prasad dispatches prepared after temple poojas involve sacred packaging and postal tracking. Cancellations requested after prasad preparation or courier dispatch cannot be entertained.</p>

<h2>6. REFUND TIMELINES & REVERSAL PROCESS</h2>
<p>Approved refunds for duplicate debits or unfulfilled seva requests are processed strictly through the original payment gateway (UPI, Net Banking, Credit/Debit Card) in accordance with Reserve Bank of India (RBI) guidelines.</p>

<h2>7. GRIEVANCE REDRESSAL & SEVA HELPDESK CONTACT</h2>
<p>For any billing queries, duplicate transaction reconciliations, or seva scheduling assistance, devotees may contact our dedicated finance and seva desk at support@saranamayyappa.in with the Transaction ID, Devotee Name, and Mobile Number.</p>`,
};

export default function LegalDocumentViewer({ activeKey = 'terms_conditions' }) {
  const { currentLanguage } = useLanguage();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const tocListRef = useRef(null);

  const currentConfig = DOC_CONFIG[activeKey] || DOC_CONFIG.terms_conditions;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);

    fetch(`${API_BASE_URL}/home/cms/${activeKey}?lang=${currentLanguage}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text || !text.trim()) return null;
        return JSON.parse(text);
      })
      .then((json) => {
        setDocData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to fetch CMS document:', err);
        setLoading(false);
      });
  }, [activeKey, currentLanguage]);

  // Clean, sanitize, and normalize headings across h1, h2, h3 from DB/CKEditor
  const { processedHtml, tableOfContents } = useMemo(() => {
    let html = docData?.value || DEFAULT_DOC_CONTENT[activeKey] || '';
    if (!html) return { processedHtml: '', tableOfContents: [] };

    const isHtml = /<[a-z][\s\S]*>/i.test(html);
    if (!isHtml) {
      // Plain text formatted string -> convert into clean HTML structure
      html = html
        .split(/\n\n+/)
        .map((p) => {
          const trimmed = p.trim();
          if (/^\d+\.\s+/.test(trimmed)) {
            const firstLine = trimmed.split('\n')[0];
            const rest = trimmed.split('\n').slice(1).join('<br/>');
            return `<h2>${firstLine}</h2><p>${rest}</p>`;
          }
          return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');
    }

    // Remove empty headings like <h1><br></h1> or <h2>&nbsp;</h2>
    html = html.replace(/<h[1-6][^>]*>(\s*|<br\s*\/?>|&nbsp;)*<\/h[1-6]>/gi, '');

    // Strip intrusive inline styling that causes dark/black text or double numbering
    html = html.replace(/style="[^"]*background-color:[^"]*"/gi, '');
    html = html.replace(/style="[^"]*color:\s*rgb\([^)]+\)[^"]*"/gi, '');

    const toc = [];
    let fallbackCounter = 0;

    // Process all headings h1, h2, h3, h4
    html = html.replace(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi, (match, rawInner) => {
      // Clean plain text without any inner tags
      const textOnly = rawInner.replace(/<[^>]+>/g, '').trim();
      if (!textOnly) return '';

      // 1. Check subsection first e.g. "3.1 Account Registration" or "3. 2. Purpose"
      const subMatch = textOnly.match(/^(\d+)\s*\.\s*(\d+)\.?\s*(.*)$/);
      // 2. Check primary section e.g. "3. ELIGIBILITY AND AGE REQUIREMENTS"
      const primaryMatch = textOnly.match(/^(\d+)[\.\)](?!\d)\s*(.*)$/);

      if (subMatch) {
        const subNum = `${subMatch[1]}.${subMatch[2]}`;
        const cleanTitle = subMatch[3].trim().replace(/^(\d+)[\.\)]\s*/, '').trim();
        const id = `sub-${subMatch[1]}-${subMatch[2]}`;
        return `<h3 id="${id}" class="legal-subheading-section"><span class="sec-subnum-badge">${subNum}</span> ${cleanTitle}</h3>`;
      } else if (primaryMatch) {
        const num = primaryMatch[1];
        let cleanTitle = primaryMatch[2].trim();
        // Strip any accidental duplicate numbering in title (e.g. preventing "3. 2. PURPOSE...")
        cleanTitle = cleanTitle.replace(/^(\d+)[\.\)]\s*/, '').trim();
        const id = `section-${num}`;
        toc.push({
          id,
          num: parseInt(num, 10),
          label: `${num}. ${cleanTitle}`,
          isSub: false
        });
        return `<h2 id="${id}" class="legal-heading-section"><span class="sec-num-badge">${num}.</span> ${cleanTitle}</h2>`;
      } else {
        fallbackCounter++;
        const id = `section-lead-${fallbackCounter}`;
        // Only include major lead headings (like CLOSING STATEMENT) in TOC if significant
        if (textOnly.length < 50 && !/^\s*$/.test(textOnly)) {
          toc.push({
            id,
            num: 900 + fallbackCounter,
            label: textOnly,
            isSub: false
          });
        }
        return `<h2 id="${id}" class="sec-lead-title">${textOnly}</h2>`;
      }
    });

    return { processedHtml: html, tableOfContents: toc };
  }, [docData, activeKey]);

  // Filtered TOC when user searches in sidebar
  const filteredToc = useMemo(() => {
    if (!searchTerm.trim()) return tableOfContents;
    const q = searchTerm.toLowerCase();
    return tableOfContents.filter(item => item.label.toLowerCase().includes(q));
  }, [tableOfContents, searchTerm]);

  // Smooth scroll to section on window/documentElement with header offset
  const handleScrollTo = (e, id) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    const el = document.getElementById(id);
    if (el) {
      // 1. Primary: Native scrollIntoView with CSS scroll-margin-top
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {}

      // 2. Secondary fallback: exact scroll position calculation
      try {
        const headerOffset = 90;
        const rect = el.getBoundingClientRect();
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const targetScroll = Math.max(0, currentScroll + rect.top - headerOffset);

        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        if (document.documentElement && document.documentElement.scrollTo) {
          document.documentElement.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      } catch (_) {}

      setActiveSectionId(id);
      setMobileTocOpen(false);
    } else {
      console.warn('[LegalDocumentViewer] Target element not found for id:', id);
    }
  };

  // True Window ScrollSpy to keep active section in Table of Contents highlighted
  useEffect(() => {
    if (!tableOfContents.length) return;

    const handleScroll = () => {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollPos = currentScroll + 140;

      for (let i = tableOfContents.length - 1; i >= 0; i--) {
        const item = tableOfContents[i];
        const el = document.getElementById(item.id);
        if (el) {
          const elTop = el.getBoundingClientRect().top + currentScroll;
          if (scrollPos >= elTop) {
            setActiveSectionId(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  // Keep active TOC link centered in the scrollable sidebar list
  useEffect(() => {
    if (!activeSectionId || !tocListRef.current) return;
    const activeItem = tocListRef.current.querySelector(`[data-toc-id="${activeSectionId}"]`);
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeSectionId]);

  const formattedDate = docData?.updatedAt
    ? new Date(docData.updatedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    : '25 November 2026';

  return (
    <div className="container legal-page-wrap">
      {/* 1. Sacred Header Banner */}
      <header className="legal-header-banner">
        <span className="legal-banner-badge">
          <Icon name="ShieldCheck" size={14} /> {currentConfig.badge}
        </span>
        <h1 className="legal-banner-title">{currentConfig.title}</h1>
        <p className="legal-banner-desc">{currentConfig.desc}</p>

        {/* Top Tab Bar Switcher */}
        <nav className="legal-tabs-row" aria-label="Legal documents">
          <Link
            to="/terms"
            className={`legal-tab-btn ${activeKey === 'terms_conditions' ? 'active' : ''}`}
          >
            <Icon name="FileText" size={16} /> Terms & Conditions
          </Link>
          <Link
            to="/privacy"
            className={`legal-tab-btn ${activeKey === 'privacy_policy' ? 'active' : ''}`}
          >
            <Icon name="Lock" size={16} /> Privacy Policy
          </Link>
          <Link
            to="/refund"
            className={`legal-tab-btn ${activeKey === 'refund_policy' ? 'active' : ''}`}
          >
            <Icon name="CreditCard" size={16} /> Refund & Offerings
          </Link>
        </nav>
      </header>

      {/* Mobile Sticky Table of Contents Quick-Jump Bar (< 980px) */}
      <div className="legal-mobile-toc-bar">
        <button
          type="button"
          className="legal-mobile-toc-toggle-btn"
          onClick={() => setMobileTocOpen(!mobileTocOpen)}
          aria-expanded={mobileTocOpen}
        >
          <Icon name="List" size={16} />
          <span>Table of Contents ({tableOfContents.length} Sections)</span>
          <Icon name={mobileTocOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </button>
        {mobileTocOpen && (
          <div className="legal-mobile-toc-dropdown">
            <ul className="legal-mobile-toc-list">
              {tableOfContents.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={(e) => handleScrollTo(e, item.id)}
                    className={`legal-mobile-toc-link ${activeSectionId === item.id ? 'active' : ''}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Main Two-Column Grid Layout */}
      <div className="legal-grid-layout">
        {/* Left Truly Fixed Sticky Sidebar */}
        <aside className="legal-sidebar">
          <div className="legal-sidebar-card">
            <div className="legal-sidebar-header">
              <h3 className="legal-sidebar-title">
                <Icon name="List" size={16} /> Table of Contents
              </h3>
              <span className="legal-toc-count-pill">{tableOfContents.length}</span>
            </div>

            {/* Quick in-document search */}
            <div className="legal-search-box">
              <span className="legal-search-icon">
                <Icon name="Search" size={15} />
              </span>
              <input
                type="text"
                className="legal-search-input"
                placeholder="Search clauses, terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* TOC Anchors - Fixed within viewport, scrollable inside */}
            {filteredToc.length > 0 ? (
              <ul className="legal-toc-list" ref={tocListRef}>
                {filteredToc.map((item) => (
                  <li key={item.id} className="legal-toc-item" data-toc-id={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleScrollTo(e, item.id)}
                      className={`legal-toc-link ${activeSectionId === item.id ? 'active' : ''}`}
                      title={item.label}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: '#888', margin: 0, padding: '12px 0' }}>
                {searchTerm ? 'No matching sections found.' : 'All sections listed below.'}
              </p>
            )}

            {/* Document Metadata Details */}
            <div className="legal-meta-row">
              <div className="legal-meta-item">
                <span>Version</span>
                <strong>v2.6 Enterprise</strong>
              </div>
              <div className="legal-meta-item">
                <span>Status</span>
                <strong style={{ color: '#27ae60' }}>Active & Enforced</strong>
              </div>
              <div className="legal-meta-item">
                <span>Last Updated</span>
                <strong>{formattedDate}</strong>
              </div>
              <div className="legal-meta-item">
                <span>Platform</span>
                <strong>Web, Android & iOS</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content Reader (Natural Window Scroll) */}
        <main className="legal-main-card">
          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#173D32', fontWeight: 600 }}>Loading official document from database...</p>
            </div>
          ) : processedHtml ? (
            <article
              className="legal-prose"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#c0392b' }}>
              <Icon name="AlertCircle" size={32} />
              <p style={{ marginTop: 12, fontWeight: 600 }}>Document content is currently unavailable.</p>
            </div>
          )}

          {/* Devotional Closing Banner */}
          <footer className="legal-footer-note">
            <Icon name="ShieldCheck" size={24} style={{ color: '#173D32', flexShrink: 0 }} />
            <div>
              <strong>Swamiye Saranam Ayyappa!</strong> Dedicated to sacred transparency, authentic temple seva, devotee privacy, and digital pilgrim safety.
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
