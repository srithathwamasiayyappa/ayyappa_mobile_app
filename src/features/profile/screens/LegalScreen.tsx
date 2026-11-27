import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  BackHandler,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { SupportedLanguage } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  initialTab?: 'terms' | 'privacy' | 'refund';
  onBack: () => void;
}

interface LegalSection {
  id: string;
  number: number;
  title: string;
  paragraphs: string[];
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.8}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Back Arrow Icon
const BackArrowIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#FFFDF8"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Search Icon
const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke="#173D32" strokeWidth={2} />
    <Path d="m21 21-4.35-4.35" stroke="#173D32" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Clear Icon (X)
const ClearIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6 6 18M6 6l12 12" stroke="#888" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Golden Lotus Ornament Divider
const GoldenLotusDivider = () => (
  <View style={styles.lotusDividerContainer}>
    <View style={styles.lotusLine} />
    <Svg width={28} height={18} viewBox="0 0 28 18" fill="none">
      <Path
        d="M14 2 C11 7 10 10 10 13 C10 15.5 11.8 17 14 17 C16.2 17 18 15.5 18 13 C18 10 17 7 14 2 Z"
        fill="#DFA62E"
      />
      <Path
        d="M6 9 C6 13 9 15 11 15 C10 13 9 10 9 8 C7 8 6 8.5 6 9 Z"
        fill="#DFA62E"
      />
      <Path
        d="M22 9 C22 13 19 15 17 15 C18 13 19 10 19 8 C21 8 22 8.5 22 9 Z"
        fill="#DFA62E"
      />
      <Circle cx="14" cy="13" r="1.5" fill="#FFFDF8" />
    </Svg>
    <View style={styles.lotusLine} />
  </View>
);

// Numbered Circle Badge (1, 2, 3...)
const NumberBadge = ({ num }: { num: number }) => (
  <View style={styles.numberBadgeWrapper}>
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Circle cx="13" cy="13" r="12" stroke="#DFA62E" strokeWidth={1.8} fill="#FFF9F0" />
    </Svg>
    <Text style={styles.numberBadgeText}>{num}</Text>
  </View>
);

// Helper: Clean HTML tags and decode entities
function cleanHtmlText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Helper: Parse raw DB content (CKEditor HTML or plain text) into structured sections
function parseLegalContent(raw: string): LegalSection[] {
  if (!raw || !raw.trim()) return [];

  const isHtml = /<[a-z][\s\S]*>/i.test(raw);

  if (isHtml) {
    const headingMatches = Array.from(raw.matchAll(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi));
    if (headingMatches.length > 0) {
      const sections: LegalSection[] = [];
      const parts = raw.split(/<h[1-4][^>]*>.*?<\/h[1-4]>/gi);

      const introText = cleanHtmlText(parts[0] || '');
      if (introText && introText.length > 20) {
        sections.push({
          id: 'sec-intro',
          number: 0,
          title: 'Introduction & Devotional Code',
          paragraphs: introText.split('\n\n').map((p) => p.trim()).filter(Boolean),
        });
      }

      let secCounter = 1;
      headingMatches.forEach((match, idx) => {
        const rawTitle = cleanHtmlText(match[1]);
        if (!rawTitle.trim()) return;

        const bodyContent = cleanHtmlText(parts[idx + 1] || '');

        const numMatch = rawTitle.match(/^(\d+)[\.\s]+(.*)/);
        let num = secCounter;
        let title = rawTitle;
        if (numMatch) {
          num = parseInt(numMatch[1], 10);
          title = numMatch[2].trim();
        } else {
          secCounter++;
        }

        const paragraphs = bodyContent
          .split('\n\n')
          .map((p) => p.trim())
          .filter(Boolean);

        sections.push({
          id: `sec-${num}`,
          number: num,
          title: title || `Clause ${num}`,
          paragraphs: paragraphs.length > 0 ? paragraphs : [bodyContent],
        });
      });

      return sections;
    }
  }

  // Fallback for plain text formatted documents
  const rawSections = raw.split(/\n\n(?=\d+\.\s+)/);
  if (rawSections.length > 1) {
    return rawSections.map((sec, idx) => {
      const lines = sec.trim().split('\n');
      const head = lines[0].replace(/^\d+\.\s*/, '').trim();
      const body = lines.slice(1).join('\n\n').trim();
      return {
        id: `sec-${idx + 1}`,
        number: idx + 1,
        title: head || `Clause ${idx + 1}`,
        paragraphs: body.split('\n\n').map((p) => p.trim()).filter(Boolean),
      };
    });
  }

  const cleaned = cleanHtmlText(raw);
  return [
    {
      id: 'sec-1',
      number: 1,
      title: 'Official Devotional Terms',
      paragraphs: cleaned.split('\n\n').map((p) => p.trim()).filter(Boolean),
    },
  ];
}

// Multilingual Dictionary
const LEGAL_I18N: Record<string, Record<string, string>> = {
  headerTitle: {
    en: 'Legal & Policies',
    te: 'చట్టపరమైన నిబంధనలు',
    kn: 'ಕಾನೂನು ಮತ್ತು ನೀತಿಗಳು',
    ta: 'சட்ட விதிமுறைகள்',
    hi: 'कानूनी नियम एवं नीतियां',
    ml: 'നിയമ നിബന്ധനകൾ',
  },
  termsTab: {
    en: 'Terms & Conditions',
    te: 'నిబంధనలు & షరతులు',
    kn: 'ನಿಯಮಗಳು & ಷರತ್ತುಗಳು',
    ta: 'விதிமுறைகள் & நிபந்தனைகள்',
    hi: 'नियम एवं शर्तें',
    ml: 'നിബന്ധനകളും വ്യവസ്ഥകളും',
  },
  privacyTab: {
    en: 'Privacy Policy',
    te: 'గోప్యతా విధానం',
    kn: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    ta: 'தனியுரிமைக் கொள்கை',
    hi: 'गोपनीयता नीति',
    ml: 'സ്വകാര്യതാ നയം',
  },
  refundTab: {
    en: 'Refund & Sevas',
    te: 'రీఫండ్ విధానం',
    kn: 'ಮರುಪಾವತಿ ನೀತಿ',
    ta: 'ரீஃபண்ட் கொள்கை',
    hi: 'वापसी नीति',
    ml: 'റീഫണ്ട് നയം',
  },
  searchPlaceholder: {
    en: 'Search clauses, terms, or keywords...',
    te: 'నిబంధనలు లేదా పదాలను శోధించండి...',
    kn: 'ಷರತ್ತುಗಳನ್ನು ಹುಡುಕಿ...',
    ta: 'விதிமுறைகளைத் தேடுங்கள்...',
    hi: 'नियम या शब्द खोजें...',
    ml: 'നിബന്ധനകൾ തിരയുക...',
  },
  lastUpdated: {
    en: 'Last updated: 25 Nov 2026',
    te: 'చివరిగా నవీకరించబడింది: 25 నవంబర్ 2026',
    kn: 'ಕೊನೆಯದಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ: 25 ನವೆಂಬರ್ 2026',
    ta: 'கடைசியாக புதுப்பிக்கப்பட்டது: 25 நவம்பர் 2026',
    hi: 'अंतिम अद्यतन: 25 नवंबर 2026',
    ml: 'അവസാനം പുതുക്കിയത്: 25 നവംബർ 2026',
  },
  termsTitle: {
    en: 'Devotee Terms of Use',
    te: 'భక్తుల వినియోగ నిబంధనలు',
    kn: 'ಭಕ್ತರ ಬಳಕೆಯ ನಿಯಮಗಳು',
    ta: 'பக்தர் பயன்பாட்டு விதிமுறைகள்',
    hi: 'भक्त उपयोग नियम एवं शर्तें',
    ml: 'ഭക്തരുടെ ഉപയോഗ നിബന്ധനകൾ',
  },
  privacyTitle: {
    en: 'Privacy & Data Protection',
    te: 'గోప్యత మరియు డేటా రక్షణ',
    kn: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಮಾಹಿತಿ ರಕ್ಷಣೆ',
    ta: 'தனியுரிமை மற்றும் தரவு பாதுகாப்பு',
    hi: 'गोपनीयता एवं डेटा सुरक्षा',
    ml: 'സ്വകാര്യതയും ഡാറ്റ സംരക്ഷണവും',
  },
  refundTitle: {
    en: 'Offerings & Refund Policy',
    te: 'కానుకలు & రీఫండ్ విధానం',
    kn: 'ದೇಣಿಗೆಗಳು & ಮರುಪಾವತಿ ನೀತಿ',
    ta: 'நன்கொடைகள் & ரீஃபண்ட் கொள்கை',
    hi: 'दान एवं वापसी नीति',
    ml: 'സംഭാവനകളും റീഫണ്ട് നയവും',
  },
};

const DEFAULT_LEGAL_DOCS: Record<string, string> = {
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

export const LegalScreen: React.FC<Props> = ({
  currentLanguage,
  initialTab = 'terms',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund'>(initialTab);
  const [cmsContent, setCmsContent] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadingCms, setLoadingCms] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');

  const scrollViewRef = useRef<ScrollView>(null);

  const t = (key: string): string => {
    const dict = LEGAL_I18N[key];
    if (dict && dict[currentLanguage]) return dict[currentLanguage];
    if (dict && dict['en']) return dict['en'];
    return key;
  };

  // Fetch dynamic CMS document strictly from DB via API response
  useEffect(() => {
    let isMounted = true;
    const slug =
      activeTab === 'terms'
        ? 'terms_conditions'
        : activeTab === 'privacy'
        ? 'privacy_policy'
        : 'refund_policy';

    setLoadingCms(true);
    setSearchQuery('');
    setSelectedSectionId('all');

    ApiService.getCmsDocument(slug, currentLanguage)
      .then((doc) => {
        if (isMounted) {
          if (doc && doc.content) {
            setCmsContent(doc.content);
            setUpdatedAt(doc.updatedAt || null);
          } else {
            setCmsContent(null);
          }
        }
      })
      .catch(() => {
        if (isMounted) setCmsContent(null);
      })
      .finally(() => {
        if (isMounted) setLoadingCms(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentLanguage]);

  // Hardware Back Handler
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // Parse structured clauses dynamically from DB content with sacred fallback
  const parsedSections = useMemo(() => {
    const raw =
      cmsContent ||
      DEFAULT_LEGAL_DOCS[
        activeTab === 'terms'
          ? 'terms_conditions'
          : activeTab === 'privacy'
          ? 'privacy_policy'
          : 'refund_policy'
      ];
    if (!raw) return [];
    return parseLegalContent(raw);
  }, [cmsContent, activeTab]);

  // Real-time search and filter
  const filteredSections = useMemo(() => {
    if (!parsedSections.length) return [];
    let list = parsedSections;

    if (selectedSectionId !== 'all') {
      list = list.filter((sec) => sec.id === selectedSectionId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (sec) =>
          sec.title.toLowerCase().includes(q) ||
          sec.paragraphs.some((p) => p.toLowerCase().includes(q))
      );
    }

    return list;
  }, [parsedSections, selectedSectionId, searchQuery]);

  const activeDocTitle =
    activeTab === 'terms'
      ? t('termsTitle')
      : activeTab === 'privacy'
      ? t('privacyTitle')
      : t('refundTitle');

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : t('lastUpdated');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />

      {/* Devotional Header */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#215344']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerOrnamentLeft}>
          <HeaderCornerFiligree />
        </View>
        <View style={styles.headerOrnamentRight}>
          <HeaderCornerFiligree flipped />
        </View>

        <View style={styles.headerContentRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>{t('headerTitle')}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Golden Bottom Separator Line */}
        <LinearGradient
          colors={['transparent', '#F5CF78', '#DFA62E', '#F5CF78', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goldSeparator}
        />
      </LinearGradient>

      {/* Body */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented Legal Tabs (Terms | Privacy | Refund) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'terms' && styles.tabButtonActive]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'terms' && styles.tabButtonTextActive]}>
              {t('termsTab')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'privacy' && styles.tabButtonActive]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('privacy')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'privacy' && styles.tabButtonTextActive,
              ]}
            >
              {t('privacyTab')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'refund' && styles.tabButtonActive]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('refund')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'refund' && styles.tabButtonTextActive,
              ]}
            >
              {t('refundTab')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar & Document Summary Bar */}
        <View style={styles.searchBoxContainer}>
          <View style={styles.searchIconWrap}>
            <SearchIcon />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor="#8C9B95"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ClearIcon />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Horizontal Jump Chips */}
        {parsedSections.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <TouchableOpacity
              style={[
                styles.chipBtn,
                selectedSectionId === 'all' && styles.chipBtnActive,
              ]}
              onPress={() => {
                setSelectedSectionId('all');
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSectionId === 'all' && styles.chipTextActive,
                ]}
              >
                All ({parsedSections.length})
              </Text>
            </TouchableOpacity>

            {parsedSections.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                style={[
                  styles.chipBtn,
                  selectedSectionId === sec.id && styles.chipBtnActive,
                ]}
                onPress={() => {
                  setSelectedSectionId(sec.id);
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSectionId === sec.id && styles.chipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {sec.number > 0 ? `${sec.number}. ` : ''}
                  {sec.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Main Document Header Card */}
        <View style={styles.legalMainCard}>
          <View style={styles.badgeRow}>
            <View style={styles.enforcedBadge}>
              <Text style={styles.enforcedBadgeText}>Active & Enforced • v2.6</Text>
            </View>
          </View>
          <Text style={styles.cardHeading}>{activeDocTitle}</Text>
          <Text style={styles.cardSubtitle}>
            {`Official Guidelines • ${formattedDate}`}
          </Text>

          <GoldenLotusDivider />

          {loadingCms ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#DFA62E" />
              <Text style={styles.loadingText}>Fetching official document from database...</Text>
            </View>
          ) : filteredSections.length > 0 ? (
            <View style={styles.clausesList}>
              {filteredSections.map((sec) => (
                <View key={sec.id} style={styles.sectionCard}>
                  {/* Clause Header */}
                  <View style={styles.sectionHeaderRow}>
                    <NumberBadge num={sec.number > 0 ? sec.number : 1} />
                    <Text style={styles.sectionTitle}>{sec.title}</Text>
                  </View>

                  {/* Clause Body Paragraphs */}
                  <View style={styles.sectionBody}>
                    {sec.paragraphs.map((p, pIdx) => {
                      const isBullet = p.startsWith('•');
                      return (
                        <View
                          key={pIdx}
                          style={isBullet ? styles.bulletRow : styles.paragraphRow}
                        >
                          {isBullet ? (
                            <>
                              <Text style={styles.bulletDot}>✦</Text>
                              <Text style={styles.bulletText}>{p.replace(/^•\s*/, '')}</Text>
                            </>
                          ) : (
                            <Text style={styles.paragraphText}>{p}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No clauses match "${searchQuery}". Tap 'X' to reset search.`
                  : 'No legal records found in database.'}
              </Text>
            </View>
          )}
        </View>

        {/* Devotional Support & Grievance Footer Card */}
        <View style={styles.supportCard}>
          <Text style={styles.supportHeading}>Official Grievance & Devotee Care</Text>
          <Text style={styles.supportText}>
            For questions regarding our terms, sanctum sevas, or privacy rights:
          </Text>
          <View style={styles.supportContactRow}>
            <Text style={styles.supportLabel}>Email:</Text>
            <Text style={styles.supportValue}>support@saranamayyappa.in</Text>
          </View>
          <View style={styles.supportContactRow}>
            <Text style={styles.supportLabel}>Web Portal:</Text>
            <Text style={styles.supportValue}>https://saranamayyappa.in</Text>
          </View>
          <Text style={styles.supportBlessing}>
            Swamiye Saranam Ayyappa! Dedicated to authentic dharma and devotee safety.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0C251E',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 12 : 12,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOrnamentLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  headerOrnamentRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  goldSeparator: {
    height: 2.5,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5EFE0',
  },
  scrollContent: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingBottom: 36,
  },

  // Segmented Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2D4B9',
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#173D32',
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#173D32',
  },
  tabButtonTextActive: {
    color: '#FFFDF8',
    fontWeight: '700',
  },

  // Search Bar
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2D4B9',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchIconWrap: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#173D32',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },

  // Quick Jump Chips
  chipRow: {
    paddingBottom: 10,
    gap: 8,
  },
  chipBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2D4B9',
  },
  chipBtnActive: {
    backgroundColor: '#DFA62E',
    borderColor: '#B58117',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#345147',
  },
  chipTextActive: {
    color: '#0C251E',
    fontWeight: '700',
  },

  // Main Card
  legalMainCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2D4B9',
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
    elevation: 2,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  enforcedBadge: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#A8DAB5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  enforcedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B6A38',
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6E7D77',
    textAlign: 'center',
    marginBottom: 6,
  },

  // Lotus Divider
  lotusDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  lotusLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2D4B9',
    marginHorizontal: 8,
  },

  // Clauses / Sections
  clausesList: {
    marginTop: 8,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EADFC7',
    padding: 14,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE0',
  },
  numberBadgeWrapper: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  numberBadgeText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '700',
    color: '#8A5805',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
    lineHeight: 20,
  },
  sectionBody: {
    gap: 8,
  },
  paragraphRow: {
    marginBottom: 4,
  },
  paragraphText: {
    fontSize: 13.5,
    color: '#2A3631',
    lineHeight: 21,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 10,
    color: '#DFA62E',
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    color: '#2A3631',
    lineHeight: 21,
  },

  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6E7D77',
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8C5E1B',
    textAlign: 'center',
  },

  // Devotional Support Card
  supportCard: {
    backgroundColor: '#173D32',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFA62E',
  },
  supportHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFDF8',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 12.5,
    color: '#D4E2DC',
    lineHeight: 18,
    marginBottom: 10,
  },
  supportContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  supportLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F5CF78',
    width: 85,
  },
  supportValue: {
    fontSize: 12.5,
    color: '#FFFDF8',
  },
  supportBlessing: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    fontSize: 12,
    fontStyle: 'italic',
    color: '#F5CF78',
    textAlign: 'center',
  },
});
