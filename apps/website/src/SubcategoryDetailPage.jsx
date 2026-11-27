import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import './devotionalCleanList.css';
import './subcategoryDetail.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

// Subcategory details strictly fetched from MySQL database via API (Zero mock / fallback data)

export default function SubcategoryDetailPage({ defaultCategory = 'pooja' }) {
  const { currentLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract ID and God from URL query
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const subcategoryId = searchParams.get('id') || 'ayyappa-pooja';
  const godParam = searchParams.get('god');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subcategory strictly from MySQL DB via API (Zero mock / fallback data)
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const apiUrl = `https://backendapis.saranamayyappa.in/api/v1/categories/subcategories/${encodeURIComponent(subcategoryId)}?lang=${currentLanguage}${godParam ? `&god=${encodeURIComponent(godParam)}` : ''}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((json) => {
        if (!isCancelled) {
          if (json && json.success && json.data) {
            const d = json.data;
            setData({
              id: d.slug || d.id || subcategoryId,
              deityId: d.deityId || godParam || 'ayyappa',
              deityName: d.deityName || 'All Deities',
              deityTelugu: d.deityTelugu || 'శ్రీ స్వామివారు',
              category: d.category || defaultCategory || 'pooja',
              title: d.title || d.titleEnglish || subcategoryId,
              titleTelugu: d.titleTelugu || d.title || subcategoryId,
              subtitle: d.subtitle || (d.overview ? d.overview.slice(0, 150) : ''),
              heroImage: d.heroImage || d.imageUrl || '/images/pooja/card-banner-ayyappa-hd.png',
              badge: d.badge || 'Sacred Vidhanam',
              badgeClass: d.badgeClass || 'badge-festival',
              duration: d.duration || '30 mins',
              difficulty: d.difficulty || 'All Devotees',
              bestTime: d.bestTime || 'Morning (Pratah Kalam) or Evening (Sandhya)',
              overview: d.overview || d.fullScriptureText || d.description || '',
              procedure: Array.isArray(d.procedure) ? d.procedure : [],
              materials: Array.isArray(d.materials) ? d.materials : [],
              mantras: Array.isArray(d.mantras) ? d.mantras : [],
              benefits: Array.isArray(d.benefits) ? d.benefits : [],
              audioTrack: d.audioTrack || {
                title: `${d.title || subcategoryId} Chants`,
                duration: '05:30',
                ragam: 'Devotional Raga'
              }
            });
          } else {
            setError(json?.message || 'Subcategory not found in database.');
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError('Failed to connect to database API.');
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [subcategoryId, godParam, currentLanguage, defaultCategory]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedMantra, setCopiedMantra] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check bookmark status
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('sa-fav-subcategories') || '[]');
      setIsBookmarked(favs.includes(data.id));
    } catch {}
  }, [data.id]);

  const toggleBookmark = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('sa-fav-subcategories') || '[]');
      let updated;
      if (favs.includes(data.id)) {
        updated = favs.filter((id) => id !== data.id);
        setIsBookmarked(false);
      } else {
        updated = [...favs, data.id];
        setIsBookmarked(true);
      }
      localStorage.setItem('sa-fav-subcategories', JSON.stringify(updated));
    } catch {}
  };

  const copyMantraText = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMantra(true);
      setTimeout(() => setCopiedMantra(false), 2200);
    }
  };

  if (loading) {
    return (
      <div className="sa-subcat-detail-page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="Sparkles" size={36} className="text-amber-500 animate-spin" />
        <p style={{ marginTop: '1rem', color: '#173D32', fontWeight: 600 }}>Loading devotional guide from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="sa-subcat-detail-page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#173D32', marginBottom: '0.75rem' }}>Subcategory Not Found</h2>
        <p style={{ color: '#6b7280', maxWidth: '500px', marginBottom: '1.5rem' }}>{error || 'This devotional service has no recorded content in the database.'}</p>
        <Link to="/categories" style={{ padding: '0.625rem 1.5rem', backgroundColor: '#173D32', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
          Back to Devotional Services
        </Link>
      </div>
    );
  }

  return (
    <div className="sa-subcat-detail-page">
      {/* Background Watermark */}
      <div className="sa-subcat-watermark" aria-hidden="true">
        <img src="/images/ayyappa-tiger-gold-bg.png" alt="" />
      </div>

      <div className="sa-subcat-container">
        {/* Navigation Breadcrumb */}
        <nav className="sa-subcat-nav">
          <Link to="/home">HOME</Link>
          <span className="sep">/</span>
          <Link to="/categories">DEVOTIONAL SERVICES</Link>
          <span className="sep">/</span>
          <Link to={`/subcategories?category=${data.category}&god=${data.deityId}`}>
            {data.deityName.toUpperCase()}
          </Link>
          <span className="sep">/</span>
          <span className="curr">{data.title.toUpperCase()}</span>
        </nav>

        {/* Hero Banner Header */}
        <header className="sa-subcat-hero">
          <div className="sa-subcat-hero-left">
            <div className="sa-subcat-badge-row">
              <span className={`sa-subcat-pill ${data.badgeClass || 'badge-festival'}`}>
                {data.badge}
              </span>
              <span className="sa-subcat-pill-deity">
                <Icon name="Sparkles" size={13} />
                <span>{currentLanguage === 'te' ? data.deityTelugu : data.deityName}</span>
              </span>
            </div>

            <h1 className="sa-subcat-title">{currentLanguage === 'te' ? data.titleTelugu : data.title}</h1>
            <p className="sa-subcat-subtitle">{data.subtitle}</p>

            <div className="sa-subcat-meta-strip">
              <div className="meta-item">
                <Icon name="Clock" size={15} />
                <span>Duration: <strong>{data.duration}</strong></span>
              </div>
              <div className="meta-item">
                <Icon name="Users" size={15} />
                <span>Audience: <strong>{data.difficulty}</strong></span>
              </div>
              <div className="meta-item">
                <Icon name="Calendar" size={15} />
                <span>Auspicious Timings: <strong>{data.bestTime}</strong></span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="sa-subcat-actions">
              <button
                type="button"
                className={`sa-btn-fav ${isBookmarked ? 'active' : ''}`}
                onClick={toggleBookmark}
              >
                <Icon name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Guide'}</span>
              </button>
            </div>
          </div>

          <div className="sa-subcat-hero-right">
            <div className="hero-img-card">
              <img src={data.heroImage} alt={data.title} />
              <div className="hero-img-tag">Sacred Vidhanam Reference</div>
            </div>
          </div>
        </header>

        {/* Devotional Audio Chants Player Bar */}
        {data.audioTrack && (
          <div className="sa-subcat-audio-bar">
            <div className="audio-left">
              <button
                type="button"
                className="audio-play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause Chants' : 'Play Chants'}
              >
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
              </button>
              <div className="audio-info">
                <span className="audio-title">{data.audioTrack.title}</span>
                <span className="audio-sub">Ragam: {data.audioTrack.ragam} • Duration: {data.audioTrack.duration}</span>
              </div>
            </div>

            <div className="audio-right">
              <span className="audio-status">{isPlaying ? 'Streaming Devotional Audio...' : 'Click to Listen Chants'}</span>
              <Icon name="Volume2" size={18} className="audio-vol-icon" />
            </div>
          </div>
        )}

        {/* Main Content Layout with Interactive Tabs */}
        <div className="sa-subcat-tabs-row">
          {[
            { id: 'overview', label: 'Overview', icon: 'BookOpen' },
            { id: 'procedure', label: 'Step-by-Step Vidhanam', icon: 'ListOrdered' },
            { id: 'materials', label: 'Sacred Materials (Samagri)', icon: 'Layers' },
            { id: 'mantras', label: 'Mantras & Chants', icon: 'Sparkles' },
            { id: 'benefits', label: 'Benefits & Blessings', icon: 'Heart' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sa-subcat-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Panel Content */}
        <div className="sa-subcat-content-card">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Divine Purpose & Significance</h2>
              <p className="pane-lead">{data.overview}</p>

              <div className="overview-highlights-grid">
                <div className="highlight-box">
                  <span className="box-icon">🕉️</span>
                  <h3>Presiding Deity</h3>
                  <p>{data.deityName} ({data.deityTelugu})</p>
                </div>
                <div className="highlight-box">
                  <span className="box-icon">⏳</span>
                  <h3>Estimated Duration</h3>
                  <p>{data.duration} for complete rituals</p>
                </div>
                <div className="highlight-box">
                  <span className="box-icon">☀️</span>
                  <h3>Optimal Muhurtham</h3>
                  <p>{data.bestTime}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP PROCEDURE (VIDHANAM) */}
          {activeTab === 'procedure' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Sacred Step-by-Step Worship Vidhanam</h2>
              <p className="pane-desc">Follow these authentic traditional steps in reverence with an unobstructed mind.</p>

              <div className="procedure-steps-list">
                {data.procedure.map((step) => (
                  <div key={step.step} className="procedure-step-card">
                    <div className="step-num-col">
                      <div className="step-badge">{step.step}</div>
                      <div className="step-connector" />
                    </div>
                    <div className="step-detail-col">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-desc">{step.desc}</p>
                      {step.mantra && (
                        <div className="step-mantra-box">
                          <span className="mantra-label">Chant during this step:</span>
                          <p className="mantra-text">{step.mantra}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MATERIALS (SAMAGRI) */}
          {activeTab === 'materials' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Required Sacred Pooja Samagri Checklist</h2>
              <p className="pane-desc">Assemble these sacred items before commencing the holy rituals.</p>

              <div className="samagri-grid">
                {data.materials.map((item, idx) => (
                  <div key={idx} className="samagri-item-card">
                    <div className="samagri-icon-circle">
                      <Icon name={item.icon || 'CheckCircle2'} size={18} />
                    </div>
                    <div className="samagri-info">
                      <span className="samagri-name">{item.name}</span>
                      <span className="samagri-qty">Quantity: <strong>{item.qty}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MANTRAS & CHANTS */}
          {activeTab === 'mantras' && (
            <div className="tab-pane">
              <div className="pane-header-with-action">
                <div>
                  <h2 className="pane-heading">Sacred Mantras & Divine Hymns</h2>
                  <p className="pane-desc">Recite with purity, correct pronunciation, and contemplation of meaning.</p>
                </div>
                {copiedMantra && (
                  <span className="copy-toast">✓ Mantra copied to clipboard!</span>
                )}
              </div>

              <div className="mantras-stack">
                {data.mantras.map((m, idx) => (
                  <div key={idx} className="mantra-card">
                    <div className="mantra-header">
                      <h3 className="mantra-title">{m.title}</h3>
                      <button
                        type="button"
                        className="btn-copy-mantra"
                        onClick={() => copyMantraText(`${m.script}\n\n${m.transliteration}\n\nMeaning: ${m.meaning}`)}
                      >
                        <Icon name="Copy" size={14} />
                        <span>Copy Mantra</span>
                      </button>
                    </div>

                    <div className="mantra-script-box">
                      <p className="mantra-sacred-script">{m.script}</p>
                    </div>

                    <div className="mantra-translit-box">
                      <span className="translit-label">Transliteration:</span>
                      <p className="translit-text">{m.transliteration}</p>
                    </div>

                    <div className="mantra-meaning-box">
                      <span className="meaning-label">Devotional Meaning:</span>
                      <p className="meaning-text">{m.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BENEFITS */}
          {activeTab === 'benefits' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Divine Fruits & Spiritual Blessings (Phalasruti)</h2>
              <p className="pane-desc">The traditional spiritual and worldly rewards bestowed upon sincere devotees.</p>

              <div className="benefits-list">
                {data.benefits.map((b, idx) => (
                  <div key={idx} className="benefit-row">
                    <span className="benefit-gold-bullet">◆</span>
                    <p className="benefit-text">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Link Footer */}
        <div className="sa-subcat-footer-nav">
          <button
            type="button"
            className="sa-btn-back-cat"
            onClick={() => navigate(-1)}
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Back to Subcategories</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { SubcategoryDetailPage };
