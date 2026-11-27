import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  BackHandler,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { SupportedLanguage } from '../../../types';
import { ApiService, resolveMediaUrl } from '../../../services/api';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH_FULL, height: SCREEN_HEIGHT_FULL } = Dimensions.get('screen');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, SCREEN_WIDTH_FULL);
const SCREEN_HEIGHT = Math.max(WINDOW_HEIGHT, SCREEN_HEIGHT_FULL);
const isLargeOrTallScreen = SCREEN_HEIGHT >= 800 || (SCREEN_HEIGHT / SCREEN_WIDTH) >= 1.95;

// Dynamic status bar height for Android
const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android'
  ? Math.max(StatusBar.currentHeight || 0, isLargeOrTallScreen ? 44 : 36)
  : 0;

// Pre-bundled deity artworks matching sacred card medallions
const DEITY_IMAGES: Record<string, any> = {
  ayyappa: require('../../../../assets/deities/ayyappa.jpg'),
  ganesha: require('../../../../assets/deities/ganesha.jpg'),
  venkateswara: require('../../../../assets/deities/venkateswara.jpg'),
  devi: require('../../../../assets/deities/durga.jpg'),
  durga: require('../../../../assets/deities/durga.jpg'),
  shiva: require('../../../../assets/deities/shiva.jpg'),
  hanuman: require('../../../../assets/deities/hanuman.jpg'),
  murugan: require('../../../../assets/deities/card_murugan.jpg'),
  krishna: require('../../../../assets/deities/krishna.jpg'),
  rama: require('../../../../assets/deities/rama.jpg'),
};

interface Props {
  title: string;
  itemId: string;
  rawId?: string;
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

// Golden Corner Filigree Motif for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.75}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Solid Maroon Play Triangle Icon
const CardPlayTriangleIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Polygon points="2,1 13,8 2,15" fill="#173D32" />
  </Svg>
);

// Helper to resolve deity medallion avatar from item id, deity id, or title
const resolveMedallion = (item: any, defaultDeity: string = 'ayyappa') => {
  if (item?.imageUrl || item?.image) {
    const uri = resolveMediaUrl(item.imageUrl || item.image);
    if (uri) return { uri };
  }
  const key = String(item?.deityId || defaultDeity || '').toLowerCase();
  if (DEITY_IMAGES[key]) return DEITY_IMAGES[key];

  const t = String(item?.title || item?.id || '').toLowerCase();
  if (t.includes('ganesha') || t.includes('ganapathi') || t.includes('vinayaka') || t.includes('గణపతి') || t.includes('వినాయక')) return DEITY_IMAGES.ganesha;
  if (t.includes('shiva') || t.includes('rudra') || t.includes('శివ') || t.includes('రుద్ర')) return DEITY_IMAGES.shiva;
  if (t.includes('venkateswara') || t.includes('balaji') || t.includes('శ్రీనివాస') || t.includes('వెంకటేశ్వర')) return DEITY_IMAGES.venkateswara;
  if (t.includes('devi') || t.includes('durga') || t.includes('లక్ష్మి') || t.includes('దుర్గ') || t.includes('అమ్మవారు')) return DEITY_IMAGES.durga;
  if (t.includes('murugan') || t.includes('subramanya') || t.includes('సుబ్రహ్మణ్య')) return DEITY_IMAGES.murugan;
  if (t.includes('hanuman') || t.includes('ఆంజనేయ') || t.includes('హనుమాన్')) return DEITY_IMAGES.hanuman;
  if (t.includes('krishna') || t.includes('కృష్ణ')) return DEITY_IMAGES.krishna;
  if (t.includes('rama') || t.includes('రామ')) return DEITY_IMAGES.rama;

  return DEITY_IMAGES.ayyappa;
};

export const DetailScreen: React.FC<Props> = ({
  title,
  itemId,
  rawId,
  currentLanguage,
  onBack,
}) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Array<{ id: string; title: string }>>([]);

  const currentItemId = history.length > 0 ? history[history.length - 1].id : (rawId || itemId);
  const currentTitle = history.length > 0 ? history[history.length - 1].title : title;

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getCategoryDetail(currentItemId, currentLanguage);
        if (isMounted && data) {
          if (currentLanguage !== 'te' && (!data.description || data.description.length < 150) && !data.lyrics) {
            try {
              const teData = await ApiService.getCategoryDetail(currentItemId, 'te');
              if (isMounted && teData && (teData.description || teData.fullScriptureText)) {
                data.lyrics = teData.fullScriptureText || teData.description;
                data.descriptionTelugu = teData.fullScriptureText || teData.description;
                if (!data.titleTelugu) data.titleTelugu = teData.title;
              }
            } catch (_) {}
          }
          setDetailData(data);
        }
      } catch (err) {
        console.log('Error loading record detail from DB API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [currentItemId, currentLanguage]);

  const handleBack = () => {
    if (history.length > 0) {
      setHistory(history.slice(0, -1));
    } else {
      onBack();
    }
  };

  // Android Mobile Hardware / Gesture Back Button handling
  useEffect(() => {
    const onHardwareBack = () => {
      handleBack();
      return true;
    };
    const backSub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => backSub.remove();
  }, [history, onBack]);

  const handleSelectSubcategory = (subId: string, subTitle: string) => {
    setHistory([...history, { id: subId, title: subTitle }]);
  };

  const displayTitle = detailData?.title || currentTitle;
  let description = detailData?.lyrics || detailData?.descriptionTelugu || detailData?.fullScriptureText || detailData?.description || detailData?.overview || detailData?.content || '';
  if ((!description || description.length < 150) && (detailData?.lyrics || detailData?.descriptionTelugu)) {
    description = detailData.lyrics || detailData.descriptionTelugu;
  }
  const instructionNote = detailData?.instructionNote || '';
  const contents = Array.isArray(detailData?.contents) && detailData.contents.length > 0
    ? detailData.contents
    : (Array.isArray(detailData?.devotionalContents) ? detailData.devotionalContents : []);
  const subcategories = detailData?.subcategories || detailData?.children || [];
  // Only render mantras if they are NOT already present in the description
  const mantras = (Array.isArray(detailData?.mantras) ? detailData.mantras : []).filter((m: any) => {
    const txt = (m.script || m.mantra || m.text || '').trim();
    if (!txt) return false;
    if (description && description.includes(txt.slice(0, 25))) return false;
    return true;
  });
  const procedure = (Array.isArray(detailData?.procedure) ? detailData.procedure : []).filter((p: any) => {
    const txt = (p.mantra || p.desc || '').trim();
    if (!txt) return false;
    if (description && description.includes(txt.slice(0, 25))) return false;
    return true;
  });
  const materials = (Array.isArray(detailData?.materials) ? detailData.materials : []).filter((m: any) => {
    const name = (m?.name || m?.title || '').toLowerCase();
    return !name.includes('cow ghee') && !name.includes('cotton wicks') && !name.includes('vibhuti') && !name.includes('camphor') && !name.includes('betel leaves');
  });
  const benefits = (Array.isArray(detailData?.benefits) ? detailData.benefits : []).filter((b: any) => {
    const str = (typeof b === 'string' ? b : (b.title || b.description || '')).toLowerCase();
    return !str.includes('profound peace') && !str.includes('spiritual strength') && !str.includes('planetary doshams') && !str.includes('divine protection of the presiding deity');
  });

  const isAyyappa =
    String(currentItemId).toLowerCase().includes('ayyappa') ||
    String(displayTitle).toLowerCase().includes('ayyappa') ||
    String(displayTitle).includes('అయ్యప్ప');

  const medallionSource = resolveMedallion(detailData || { title: displayTitle, id: currentItemId }, isAyyappa ? 'ayyappa' : 'ganesha');

  const renderFormattedDescription = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    const elements: React.ReactNode[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    const flushTable = (tableKey: string) => {
      if (tableRows.length === 0) return;
      const headers = tableRows[0];
      const dataRows = tableRows.slice(1);

      elements.push(
        <View key={tableKey} style={styles.tableCardContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                {headers.map((col, colIdx) => (
                  <View
                    key={`th-${colIdx}`}
                    style={[
                      styles.tableCell,
                      styles.tableHeaderCell,
                      colIdx === 0 && styles.colNo,
                      colIdx === 1 && styles.colDate,
                      colIdx === 2 && styles.colDay,
                      colIdx === 3 && styles.colNakshatram,
                    ]}
                  >
                    <Text style={styles.tableHeaderText}>{col}</Text>
                  </View>
                ))}
              </View>

              {dataRows.map((row, rIdx) => (
                <View
                  key={`tr-${rIdx}`}
                  style={[
                    styles.tableDataRow,
                    rIdx % 2 === 1 && styles.tableRowAlt,
                  ]}
                >
                  {row.map((val, cIdx) => (
                    <View
                      key={`td-${rIdx}-${cIdx}`}
                      style={[
                        styles.tableCell,
                        cIdx === 0 && styles.colNo,
                        cIdx === 1 && styles.colDate,
                        cIdx === 2 && styles.colDay,
                        cIdx === 3 && styles.colNakshatram,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tableCellText,
                          cIdx === 0 && styles.tableCellCenter,
                          cIdx === 1 && styles.tableCellBold,
                          cIdx === 3 && styles.tableCellNakshatram,
                        ]}
                      >
                        {val}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      );
      tableRows = [];
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const rawCols = trimmed.slice(1, -1).split('|').map((c) => c.trim());
        const isDelimiter = rawCols.every((c) => /^[-:]+$/.test(c));
        if (!isDelimiter) {
          tableRows.push(rawCols);
          inTable = true;
        }
        return;
      } else if (inTable) {
        flushTable(`table-${idx}`);
      }

      if (!trimmed) {
        elements.push(<View key={`space-${idx}`} style={{ height: 10 }} />);
        return;
      }

      // Section Headers [ శ్రీ మహాగణపతి ]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const headerText = trimmed.slice(1, -1).trim();
        elements.push(
          <View key={`sec-${idx}`} style={styles.sectionHeaderCard}>
            <View style={styles.goldLine} />
            <Text style={styles.sectionHeaderText}>❖ {headerText} ❖</Text>
            <View style={styles.goldLine} />
          </View>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const bulletText = trimmed.replace(/^[•*]\s*/, '');
        const colonIdx = bulletText.indexOf(':');
        elements.push(
          <View key={`bullet-${idx}`} style={styles.bulletRow}>
            <View style={styles.omCircle}>
              <Text style={styles.omCircleText}>ॐ</Text>
            </View>
            <View style={styles.bulletTextContainer}>
              {colonIdx !== -1 ? (
                <Text style={styles.bulletBody}>
                  <Text style={styles.bulletTitleBold}>{bulletText.substring(0, colonIdx + 1)}</Text>
                  <Text style={styles.bulletTitleValue}>{bulletText.substring(colonIdx + 1)}</Text>
                </Text>
              ) : (
                <Text style={styles.bulletBody}>{bulletText}</Text>
              )}
            </View>
          </View>
        );
        return;
      }

      // Slogans
      if (trimmed.includes(' – ') || trimmed.includes(' - ')) {
        const parts = trimmed.includes(' – ') ? trimmed.split(' – ') : trimmed.split(' - ');
        elements.push(
          <View key={`slogan-${idx}`} style={styles.sloganRow}>
            <View style={styles.sloganCallBadge}>
              <Text style={styles.sloganCallText}>{parts[0].trim()}</Text>
            </View>
            <Text style={styles.sloganArrow}>⇄</Text>
            <View style={styles.sloganResponseBadge}>
              <Text style={styles.sloganResponseText}>{parts[1]?.trim()}</Text>
            </View>
          </View>
        );
        return;
      }

      // Instructions in parentheses
      if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        elements.push(
          <View key={`instruction-${idx}`} style={styles.instructionBadge}>
            <Text style={styles.instructionText}>✦ {trimmed.slice(1, -1)} ✦</Text>
          </View>
        );
        return;
      }

      // Chants starting with Om / శ్రీ
      const isOmChant =
        trimmed.startsWith('ఓం') ||
        trimmed.startsWith('ಓಂ') ||
        trimmed.toLowerCase().startsWith('om') ||
        trimmed.startsWith('ōṁ') ||
        trimmed.startsWith('śrī') ||
        trimmed.startsWith('శ్రీ') ||
        trimmed.startsWith('ಶ್ರೀ');

      if (isOmChant) {
        elements.push(
          <View key={`chant-${idx}`} style={styles.chantRow}>
            <Text style={styles.chantOmSymbol}>ॐ</Text>
            <Text style={styles.chantText}>{trimmed}</Text>
          </View>
        );
        return;
      }

      elements.push(
        <Text key={`line-${idx}`} style={styles.readingBodyText}>
          {trimmed}
        </Text>
      );
    });

    if (inTable) {
      flushTable('table-end');
    }

    return elements;
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent />

      {/* ── 1. SACRED DARK GREEN HEADER WITH BACK ARROW & CORNER FILIGREE ── */}
      <LinearGradient
        colors={['#173D32', '#173D32', '#0C251E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>

        <View style={styles.headerFiligreeWrapper}>
          <HeaderCornerFiligree flipped />
        </View>
      </LinearGradient>

      {/* ── 2. SERENE DEITY WATERMARK BACKGROUND ── */}
      <Image
        source={require('../../../../assets/ayyappa_watermark.png')}
        style={styles.watermarkImage}
        resizeMode="contain"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {subcategories && subcategories.length > 0 ? (
          /* Subcategory / Child Items Listing */
          <View style={styles.subListCardsContainer}>
            {subcategories.map((sub: any, idx: number) => {
              const subMedallion = resolveMedallion(sub, isAyyappa ? 'ayyappa' : 'ganesha');
              return (
                <TouchableOpacity
                  key={sub.id || idx}
                  style={styles.subItemCard}
                  activeOpacity={0.82}
                  onPress={() => handleSelectSubcategory(sub.id, sub.title)}
                  accessibilityRole="button"
                  accessibilityLabel={sub.title}
                >
                  <View style={styles.subItemMedallionWrapper}>
                    <Image source={subMedallion} style={styles.subItemMedallionImage} resizeMode="cover" />
                  </View>
                  <View style={styles.subItemTextContainer}>
                    <Text style={styles.subItemTitle} numberOfLines={1}>
                      {sub.title}
                    </Text>
                    {sub.description ? (
                      <Text style={styles.subItemSubtitle} numberOfLines={2}>
                        {sub.description}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.playIconContainer}>
                    <CardPlayTriangleIcon />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* ── 3. SACRED WHITE READING CARD (EXACT STYLE MATCHING REFERENCE) ── */
          <View style={styles.readingCard}>
            {/* Card Header with Circular Medallion */}
            <View style={styles.readingCardHeader}>
              <View style={styles.readingMedallionWrapper}>
                <Image
                  source={medallionSource}
                  style={styles.readingMedallionImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.readingTitleContainer}>
                <Text style={styles.readingTitle}>{displayTitle}</Text>
                <Text style={styles.readingSubtitle}>
                  {isAyyappa ? 'ఓం స్వామియే శరణమయ్యప్ప 🙏' : '|| శుభం భూయాత్ ||'}
                </Text>
              </View>
            </View>

            {/* Subtle Golden Divider */}
            <View style={styles.readingDivider} />

            {/* Devotional Content Body */}
            {loading ? (
              <View style={styles.readingLoadingBox}>
                <ActivityIndicator size="large" color="#173D32" />
                <Text style={styles.readingLoadingText}>
                  {currentLanguage === 'te' ? 'భక్తిపూర్వక వివరములు లోడ్ అవుతున్నాయి...' : 'Loading sacred details...'}
                </Text>
              </View>
            ) : (
              <View style={styles.cardBody}>
                {/* Sacred Instruction Note from DB */}
                {instructionNote ? (
                  <View style={styles.instructionBadge}>
                    <Text style={styles.instructionText}>✦ {instructionNote} ✦</Text>
                  </View>
                ) : null}

                {/* Formatted Description / Overview */}
                {description ? renderFormattedDescription(description) : null}

                {/* Sacred Mantras from DB */}
                {mantras && mantras.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionTitle, { color: '#173D32' }]}>
                      ❖ {currentLanguage === 'te' ? 'దివ్య మంత్రములు & స్తోత్రములు' : 'Sacred Mantras & Invocations'}:
                    </Text>
                    {mantras.map((m: any, mIdx: number) => (
                      <View key={m.id || mIdx} style={styles.mantraBox}>
                        {m.title ? (
                          <Text style={[styles.stepTitle, { color: '#8B4513', marginBottom: 6 }]}>
                            ✦ {m.title} ✦
                          </Text>
                        ) : null}
                        <Text style={styles.mantraText}>{m.script || m.mantra || m.text}</Text>
                        {m.transliteration ? (
                          <Text style={[styles.readingBodyText, { fontStyle: 'italic', marginTop: 4 }]}>
                            {m.transliteration}
                          </Text>
                        ) : null}
                        {m.meaning ? (
                          <Text style={[styles.readingBodyText, { marginTop: 6, color: '#333' }]}>
                            <Text style={{ fontWeight: '700', color: '#173D32' }}>
                              {currentLanguage === 'te' ? 'భావము: ' : 'Meaning: '}
                            </Text>
                            {m.meaning}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Procedure Steps from DB */}
                {procedure && procedure.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionTitle, { color: '#173D32' }]}>
                      ❖ {currentLanguage === 'te' ? 'పూజా క్రమము / విధానము (Procedure Steps)' : 'Procedure Steps'}:
                    </Text>
                    {procedure.map((pr: any, prIdx: number) => (
                      <View key={pr.step || prIdx} style={styles.stepCardItem}>
                        <View style={styles.stepBadge}>
                          <Text style={styles.stepBadgeText}>{pr.step || (prIdx + 1)}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.stepTitle}>{pr.title || (`Step ${prIdx + 1}`)}</Text>
                          {pr.mantra ? (
                            <View style={[styles.mantraBox, { marginVertical: 6 }]}>
                              <Text style={styles.mantraText}>{pr.mantra}</Text>
                            </View>
                          ) : null}
                          {pr.desc || pr.description ? (
                            <Text style={styles.readingBodyText}>{pr.desc || pr.description}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Devotional Contents from DB */}
                {contents && contents.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    {contents.map((item: any, idx: number) => (
                      <View key={item.id || idx} style={styles.itemBlock}>
                        {item.title ? <Text style={styles.itemTitle}>✦ {item.title} ✦</Text> : null}
                        {item.sacredText ? (
                          <View style={[styles.mantraBox, { marginVertical: 6 }]}>
                            <Text style={styles.mantraText}>{item.sacredText}</Text>
                          </View>
                        ) : null}
                        <Text style={styles.readingBodyText}>
                          {item.content || item.text || item.meaning || item.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Benefits from DB */}
                {benefits && benefits.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionTitle, { color: '#173D32' }]}>
                      ✨ {currentLanguage === 'te' ? 'పూజా ఫలము (Sacred Benefits)' : 'Divine Blessings & Benefits'}:
                    </Text>
                    {benefits.map((b: any, bIdx: number) => (
                      <View key={bIdx} style={{ marginBottom: 6 }}>
                        <Text style={[styles.stepTitle, { fontSize: 14 }]}>
                          ❖ {typeof b === 'string' ? b : (b.title || `Benefit ${bIdx + 1}`)}
                        </Text>
                        {b.description && b.description !== b.title ? (
                          <Text style={styles.readingBodyText}>{b.description}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Empty State when zero content */}
                {!description && mantras.length === 0 && procedure.length === 0 && contents.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {currentLanguage === 'te'
                      ? 'ఈ వివరాలు త్వరలో అందుబాటులోకి వస్తాయి.'
                      : 'Sacred devotional content will be displayed here directly from the database.'}
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  headerBar: {
    minHeight: 56 + ANDROID_STATUS_BAR_HEIGHT,
    paddingTop: ANDROID_STATUS_BAR_HEIGHT + 6,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(223, 166, 46, 0.4)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  backBtn: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backArrowText: {
    color: '#FFFDF8',
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    color: '#E6B800',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'serif' }),
  },
  headerFiligreeWrapper: {
    marginLeft: 8,
  },
  watermarkImage: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: '85%',
    height: '65%',
    opacity: 0.08,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ── READING CARD (EXACT USER SPECIFICATION) ──
  readingCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    elevation: 3,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: '100%',
  },
  readingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  readingMedallionWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#DFA62E',
    overflow: 'hidden',
    backgroundColor: '#173D32',
    elevation: 2,
  },
  readingMedallionImage: {
    width: '100%',
    height: '100%',
  },
  readingTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  readingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 3,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'serif' }),
  },
  readingSubtitle: {
    fontSize: 12.5,
    color: '#8A5A0A',
    fontWeight: '600',
  },
  readingDivider: {
    height: 1.2,
    backgroundColor: '#E6C898',
    marginVertical: 12,
  },
  readingLoadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  readingLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#173D32',
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 4,
  },
  readingBodyText: {
    fontSize: 15,
    lineHeight: 25,
    color: '#2C1D11',
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },

  // Sub-items List Styles
  subListCardsContainer: {
    width: '100%',
    gap: 12,
  },
  subItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6C898',
    elevation: 2,
  },
  subItemMedallionWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    overflow: 'hidden',
  },
  subItemMedallionImage: {
    width: '100%',
    height: '100%',
  },
  subItemTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  subItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 2,
  },
  subItemSubtitle: {
    fontSize: 12,
    color: '#6B4B3D',
  },
  playIconContainer: {
    padding: 6,
  },

  // Formatted elements
  sectionHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#DFA62E',
    borderRightWidth: 3,
    borderRightColor: '#DFA62E',
    marginVertical: 12,
  },
  goldLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFE0B2',
    marginHorizontal: 8,
  },
  sectionHeaderText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#8B4513',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  omCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFE8CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  omCircleText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '700',
  },
  bulletTextContainer: {
    flex: 1,
  },
  bulletBody: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#2C1D11',
  },
  bulletTitleBold: {
    fontWeight: '700',
    color: '#173D32',
  },
  bulletTitleValue: {
    color: '#2C1D11',
  },
  sloganRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(223, 166, 46, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  sloganCallBadge: {
    flex: 1,
  },
  sloganCallText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#173D32',
  },
  sloganArrow: {
    paddingHorizontal: 6,
    color: '#DFA62E',
    fontWeight: '700',
  },
  sloganResponseBadge: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sloganResponseText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8A5A0A',
  },
  instructionBadge: {
    alignSelf: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 6,
  },
  instructionText: {
    fontSize: 12.5,
    color: '#6A1B9A',
    fontWeight: '600',
  },
  chantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 61, 50, 0.05)',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  chantOmSymbol: {
    fontSize: 15,
    color: '#DFA62E',
    fontWeight: '700',
    marginRight: 8,
  },
  chantText: {
    flex: 1,
    fontSize: 14.5,
    color: '#173D32',
    fontWeight: '600',
  },
  itemBlock: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0E6D8',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },

  // Table styling
  tableCardContainer: {
    marginVertical: 12,
  },
  tableScroll: {
    borderRadius: 8,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6C898',
    borderRadius: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#173D32',
  },
  tableCell: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tableHeaderCell: {
    alignItems: 'center',
  },
  tableHeaderText: {
    color: '#FFD700',
    fontSize: 12.5,
    fontWeight: '700',
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  tableRowAlt: {
    backgroundColor: '#FFFDF8',
  },
  tableCellText: {
    fontSize: 12.5,
    color: '#2C1D11',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellBold: {
    fontWeight: '700',
  },
  tableCellNakshatram: {
    color: '#8B4513',
  },
  colNo: { width: 50 },
  colDate: { width: 110 },
  colDay: { width: 90 },
  colNakshatram: { width: 130 },
  mantraBox: {
    backgroundColor: 'rgba(223, 166, 46, 0.12)',
    borderLeftWidth: 4,
    borderLeftColor: '#DFA62E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  mantraText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#8B4513',
    fontWeight: '700',
  },
  stepCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFDF8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6C898',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#173D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
});