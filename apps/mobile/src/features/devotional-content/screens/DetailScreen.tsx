const BANNER_TITLES: Record<SupportedLanguage, { title: string; subtitle: string }> = {
  te: { title: 'స్వామియే శరణం అయ్యప్ప', subtitle: 'శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం' },
  kn: { title: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ', subtitle: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ನಿತ್ಯ ಪೂಜಾ ವಿಧಾನ' },
  en: { title: 'Swamiye Saranam Ayyappa', subtitle: 'Sri Ayyappa Swami Daily Pooja & Stotras' },
  ta: { title: 'சுவாமியே சரணம் ஐயப்பா', subtitle: 'ஸ்ரீ ஐயப்ப சுவாமி நித்ய பூஜை முறைகள்' },
  hi: { title: 'स्वामीये शरणम् अय्यप्पा', subtitle: 'श्री अय्यप्पा स्वामी नित्य पूजा विधान' },
};
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
} from 'react-native';
import { DevotionalBackground } from '../../../components/common/DevotionalBackground';
import { AyyappaMedallion } from '../../../components/common/AyyappaMedallion';
import { SupportedLanguage } from '../../../types';
import { ApiService } from '../../../services/api';

interface Props {
  title: string;
  itemId: string;
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

export const DetailScreen: React.FC<Props> = ({
  title,
  itemId,
  currentLanguage,
  onBack,
}) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Array<{ id: string; title: string }>>([]);

  const currentItemId = history.length > 0 ? history[history.length - 1].id : itemId;
  const currentTitle = history.length > 0 ? history[history.length - 1].title : title;

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getCategoryDetail(currentItemId, currentLanguage);
        if (isMounted) setDetailData(data);
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

  const handleSelectSubcategory = (subId: string, subTitle: string) => {
    setHistory([...history, { id: subId, title: subTitle }]);
  };

  const displayTitle = detailData?.title || currentTitle;
  const description = detailData?.description || '';
  const contents = detailData?.contents || [];
  const subcategories = detailData?.subcategories || [];

  const renderFormattedDescription = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    // Check for Markdown table blocks and group them together
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
              {/* Table Header */}
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

              {/* Table Data Rows */}
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

      // Check if line is a table row (| col1 | col2 | ...)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const rawCols = trimmed.slice(1, -1).split('|').map((c) => c.trim());
        // Skip markdown delimiter line like |--|--|
        const isDelimiter = rawCols.every((c) => /^[-:]+$/.test(c));
        if (!isDelimiter) {
          tableRows.push(rawCols);
          inTable = true;
        }
        return;
      } else if (inTable) {
        flushTable(`table-${idx}`);
      }

      // Empty separator lines
      if (!trimmed) {
        elements.push(<View key={`space-${idx}`} style={{ height: 8 }} />);
        return;
      }

      // Section Headers like [ శ్రీ మహాగణపతి ] or [ Sri mahaganapathi ]
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

      // Bullet points (Ayyappa Deeksha Swamy titles)
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

      // Call-and-response slogans with "–" or "-"
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

      // Ritual instructions in parentheses, e.g. (Water - 3 times), (Akshatas), (Flowers)
      if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        elements.push(
          <View key={`instruction-${idx}`} style={styles.instructionBadge}>
            <Text style={styles.instructionText}>✦ {trimmed.slice(1, -1)} ✦</Text>
          </View>
        );
        return;
      }

      // Namas starting with Om / ōṁ / ఓం / ಓಂ
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

      // Default sacred sloka stanza
      elements.push(
        <Text key={`line-${idx}`} style={styles.slokaText}>
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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />

      {/* Devotional Orange Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backText}>&lt; Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Devotional Background */}
      <DevotionalBackground>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Detailed Content / Subcategory Container fetched from DB */}
          {subcategories && subcategories.length > 0 ? (
            <View style={styles.subCategoryListWrapper}>
              {subcategories.map((sub: any, idx: number) => (
                <TouchableOpacity
                  key={sub.id || idx}
                  style={styles.subCategoryRow}
                  activeOpacity={0.7}
                  onPress={() => handleSelectSubcategory(sub.id, sub.title)}
                >
                  <View style={styles.subCategoryLeft}>
                    <AyyappaMedallion size={44} />
                    <Text style={styles.subCategoryTitle}>{sub.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <>
              {/* Top Devotional Banner Dynamic per selected language */}
              <View style={styles.cardHeader}>
                <AyyappaMedallion size={54} />
                <Text style={styles.bannerTitle}>{BANNER_TITLES[currentLanguage]?.title || BANNER_TITLES.te.title}</Text>
                <Text style={styles.bannerSubtitle}>
                  {BANNER_TITLES[currentLanguage]?.subtitle || BANNER_TITLES.te.subtitle}
                </Text>
              </View>

              <View style={styles.contentCard}>
                <View style={styles.titleContainer}>
                  <View style={styles.cornerDecorLeft} />
                  <Text style={styles.cardTitle}>{displayTitle}</Text>
                  <View style={styles.cornerDecorRight} />
                </View>
                <View style={styles.divider} />

                {loading ? (
                  <View style={styles.centerBox}>
                    <ActivityIndicator size="small" color="#D84315" />
                    <Text style={styles.loadingText}>Loading record from DB...</Text>
                  </View>
                ) : (
                  <>
                    {description ? renderFormattedDescription(description) : null}

                    {contents && contents.length > 0 ? (
                      contents.map((item: any, idx: number) => (
                        <View key={item.id || idx} style={styles.itemBlock}>
                          {item.title ? (
                            <Text style={styles.itemTitle}>{item.title}</Text>
                          ) : null}
                          <Text style={styles.itemText}>{item.content || item.text || item.description}</Text>
                        </View>
                      ))
                    ) : !description ? (
                      <Text style={styles.bodyText}>
                        Devotional content will be displayed here directly from the database.
                      </Text>
                    ) : null}
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </DevotionalBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D84315',
    width: '100%',
    height: '100%',
  },
  safeArea: {
    backgroundColor: '#D84315',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#D84315',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  container: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  bannerTitle: {
    color: '#8D1B00',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bannerSubtitle: {
    color: '#5D4037',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  contentCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: '#E65100',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 18px rgba(230, 81, 0, 0.2)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cornerDecorLeft: {
    width: 18,
    height: 2,
    backgroundColor: '#E65100',
    marginRight: 8,
  },
  cornerDecorRight: {
    width: 18,
    height: 2,
    backgroundColor: '#E65100',
    marginLeft: 8,
  },
  cardTitle: {
    color: '#BF360C',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: '#FFE0B2',
    marginVertical: 12,
  },
  centerBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8D1B00',
    fontSize: 13,
    marginTop: 8,
  },
  sectionHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
    borderRightWidth: 4,
    borderRightColor: '#E65100',
    marginVertical: 12,
  },
  goldLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFB74D',
    marginHorizontal: 8,
  },
  sectionHeaderText: {
    color: '#B71C1C',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB300',
  },
  omCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E65100',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  omCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bulletTextContainer: {
    flex: 1,
  },
  bulletBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  bulletTitleBold: {
    fontWeight: 'bold',
    color: '#BF360C',
  },
  bulletTitleValue: {
    color: '#3E2723',
    fontWeight: '600',
  },
  sloganRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
    backgroundColor: '#FFFDE7',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFF176',
  },
  sloganCallBadge: {
    flex: 1,
    paddingRight: 4,
  },
  sloganCallText: {
    color: '#BF360C',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sloganArrow: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  sloganResponseBadge: {
    flex: 1,
    paddingLeft: 4,
    alignItems: 'flex-end',
  },
  sloganResponseText: {
    color: '#1B5E20',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'right',
  },
  instructionBadge: {
    alignSelf: 'center',
    backgroundColor: '#EFEBE9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  instructionText: {
    color: '#5D4037',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  chantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FFE0B2',
  },
  chantOmSymbol: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  chantText: {
    color: '#263238',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },
  slokaText: {
    color: '#3E2723',
    fontSize: 14.5,
    lineHeight: 23,
    textAlign: 'center',
    paddingVertical: 3,
  },
  bodyText: {
    color: '#3E2723',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
  },
  itemBlock: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  itemTitle: {
    color: '#BF360C',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemText: {
    color: '#3E2723',
    fontSize: 14,
    lineHeight: 22,
  },
  // Table Styling (Matches user screenshots with border lines and clean columns)
  tableCardContainer: {
    width: '100%',
    marginVertical: 14,
  },
  tableScroll: {
    width: '100%',
  },
  tableCard: {
    minWidth: '100%',
    borderWidth: 1.5,
    borderColor: '#4A3B2C',
    borderRadius: 4,
    backgroundColor: '#FFF8E1',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#FFE082',
    borderBottomWidth: 1.5,
    borderBottomColor: '#4A3B2C',
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#BCAAA4',
    minHeight: 38,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#FFFDE7',
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#BCAAA4',
    justifyContent: 'center',
  },
  tableHeaderCell: {
    borderRightColor: '#4A3B2C',
    paddingVertical: 10,
  },
  colNo: {
    width: 75,
    minWidth: 70,
  },
  colDate: {
    width: 105,
    minWidth: 100,
  },
  colDay: {
    width: 115,
    minWidth: 110,
  },
  colNakshatram: {
    width: 110,
    minWidth: 105,
    borderRightWidth: 0,
  },
  tableHeaderText: {
    color: '#212121',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCellText: {
    color: '#212121',
    fontSize: 13.5,
    textAlign: 'center',
  },
  tableCellCenter: {
    textAlign: 'center',
    fontWeight: '600',
  },
  tableCellBold: {
    fontWeight: '600',
    color: '#BF360C',
    textAlign: 'center',
  },
  tableCellNakshatram: {
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  subCategoryListWrapper: {
    width: '100%',
    paddingTop: 8,
  },
  subCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1.2,
    borderBottomColor: '#D78216',
  },
  subCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 16,
    flex: 1,
    lineHeight: 26,
  },
});

