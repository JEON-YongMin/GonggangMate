import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { Chip } from '@/components/common/Chip';
import { EmptyState } from '@/components/common/EmptyState';
import { useUserStore } from '@/store/userStore';
import { Gap, RecommendationItem } from '@/types/user.types';
import { timetableService } from '@/services/timetable.service';
import { recommendationService } from '@/services/recommendation.service';

const CATEGORIES = ['전체','카페','식사','공부','운동','휴식','친구 만남'];
const SORT_OPTIONS = [{ key: 'recommended', label: '추천순' }, { key: 'popular', label: '인기순' }, { key: 'distance', label: '거리순' }];
const WEATHER_LIST = ['SUNNY','CLOUDY','RAINY'];

function fmtTime(t: string) { return t?.slice(0,5) ?? ''; }
function fmtMin(m: number) { return m < 60 ? `${m}분` : `${Math.floor(m/60)}시간${m%60>0?` ${m%60}분`:''}`; }
function gapBorder(type: string) {
  switch(type) { case 'SHORT': return Colors.gapShortText; case 'VALID': return Colors.gapValidText; case 'RELAXED': return Colors.gapRelaxedText; default: return Colors.cardBorder; }
}

export default function RecommendationScreen() {
  const { userId } = useUserStore();
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [selectedGap, setSelectedGap] = useState<Gap | null>(null);
  const [recs, setRecs] = useState<RecommendationItem[]>([]);
  const [selectedCat, setSelectedCat] = useState('전체');
  const [sortKey, setSortKey] = useState('recommended');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loadingGaps, setLoadingGaps] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [hasTimetable, setHasTimetable] = useState(true);

  const weather = WEATHER_LIST[new Date().getDay() % 3];

  const loadGaps = useCallback(async () => {
    if (!userId) return;
    setLoadingGaps(true);
    try {
      const data = await timetableService.getTodayGaps(userId);
      const valid = data.filter(g => g.gapType !== 'FREE_DAY');
      setGaps(valid);
      setHasTimetable(true);
      if (valid.length > 0) setSelectedGap(valid[0]);
    } catch { setHasTimetable(false); }
    finally { setLoadingGaps(false); }
  }, [userId]);

  const loadRecs = useCallback(async () => {
    if (!userId || !selectedGap) return;
    setLoadingRecs(true);
    try {
      let data = await recommendationService.getRecommendations({ userId, gapId: selectedGap.id, category: selectedCat, weather });
      if (sortKey === 'popular') data = [...data].sort((a, b) => b.popularity - a.popularity);
      setRecs(data);
    } catch { setRecs([]); }
    finally { setLoadingRecs(false); }
  }, [userId, selectedGap, selectedCat, sortKey, weather]);

  useEffect(() => { loadGaps(); }, [loadGaps]);
  useEffect(() => { loadRecs(); }, [loadRecs]);

  const toggleFav = (id: number) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loadingGaps) return <SafeAreaView style={styles.safe}><ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" /></SafeAreaView>;
  if (!hasTimetable) return <SafeAreaView style={styles.safe}><View style={styles.header}><Text style={styles.headerTitle}>공강 추천 ✨</Text></View><EmptyState emoji="📅" title="시간표를 먼저 등록해주세요" subtitle="시간표가 있어야 맞춤 추천이 가능해요!" ctaLabel="시간표 등록하기" onCta={() => router.push('/(tabs)/timetable')} /></SafeAreaView>;
  if (gaps.length === 0) return <SafeAreaView style={styles.safe}><View style={styles.header}><Text style={styles.headerTitle}>공강 추천 ✨</Text></View><EmptyState emoji="😊" title="오늘 공강이 없어요" subtitle="내일 시간표를 확인해보세요!" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>공강 추천 ✨</Text>
        {selectedGap && <View style={styles.gapBadge}><Text style={styles.gapBadgeTxt}>{fmtTime(selectedGap.startTime)}~{fmtTime(selectedGap.endTime)}  {fmtMin(selectedGap.durationMinutes)}</Text></View>}
      </View>

      <View style={styles.gapTabRow}>
        <FlatList horizontal showsHorizontalScrollIndicator={false} data={gaps} keyExtractor={g => String(g.id)}
          contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.screenHorizontal }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.gapTab, selectedGap?.id === item.id && styles.gapTabOn, { borderColor: gapBorder(item.gapType) }]} onPress={() => setSelectedGap(item)} activeOpacity={0.7}>
              <Text style={[styles.gapTabTime, selectedGap?.id === item.id && { color: Colors.primary }]}>{fmtTime(item.startTime)}~{fmtTime(item.endTime)}</Text>
              <Text style={styles.gapTabType}>{item.gapTypeDisplay}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.filterRow}>
        <FlatList horizontal showsHorizontalScrollIndicator={false} data={CATEGORIES} keyExtractor={i => i}
          contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.screenHorizontal }}
          renderItem={({ item }) => <Chip label={item} selected={selectedCat === item} onPress={() => setSelectedCat(item)} />}
        />
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity key={opt.key} style={[styles.sortBtn, sortKey === opt.key && styles.sortBtnOn]} onPress={() => setSortKey(opt.key)}>
            <Text style={[styles.sortBtnTxt, sortKey === opt.key && styles.sortBtnTxtOn]}>{opt.label}{opt.key === 'distance' ? ' 🚧' : ''}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countTxt}>{recs.length}개</Text>
      </View>

      {loadingRecs ? <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} /> :
        recs.length === 0 ? <EmptyState emoji="🔍" title="조건에 맞는 추천이 없어요" subtitle="다른 카테고리를 선택해보세요" /> :
        <FlatList data={recs} keyExtractor={r => String(r.id)} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.catBadge, { backgroundColor: item.categoryColor + '22' }]}><Text style={styles.catBadgeTxt}>{item.categoryIcon} {item.categoryName}</Text></View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.estTime}>⏱ {item.estimatedMinutes}분</Text>
                  <TouchableOpacity onPress={() => toggleFav(item.id)} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ fontSize: 18 }}>{favorites.has(item.id) ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              {item.reasonText && <View style={styles.reasonRow}><Text style={styles.reasonTxt}>💡 {item.reasonText}</Text></View>}
            </View>
          )}
        />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundGray },
  header: { paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder, gap: 4 },
  headerTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  gapBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  gapBadgeTxt: { fontSize: Typography.size.xs, color: Colors.primary, fontWeight: Typography.weight.semiBold },
  gapTabRow: { paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  gapTab: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.cardBorder, backgroundColor: Colors.white, alignItems: 'center', minWidth: 96, minHeight: Spacing.minTouchSize, justifyContent: 'center' },
  gapTabOn: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  gapTabTime: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary },
  gapTabType: { fontSize: Typography.size.xs, color: Colors.textTertiary, marginTop: 2 },
  filterRow: { paddingVertical: Spacing.sm, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.screenHorizontal, paddingVertical: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder, gap: Spacing.sm },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.cardBorder },
  sortBtnOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  sortBtnTxt: { fontSize: Typography.size.xs, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  sortBtnTxtOn: { color: Colors.primary, fontWeight: Typography.weight.semiBold },
  countTxt: { marginLeft: 'auto', fontSize: Typography.size.xs, color: Colors.textTertiary },
  listContent: { padding: Spacing.screenHorizontal, gap: Spacing.md, paddingBottom: 32 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.cardPadding, gap: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  catBadgeTxt: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  estTime: { fontSize: Typography.size.xs, color: Colors.textSecondary },
  favBtn: { width: Spacing.minTouchSize, height: Spacing.minTouchSize, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  cardDesc: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: 20 },
  reasonRow: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm },
  reasonTxt: { fontSize: Typography.size.xs, color: Colors.primary, fontWeight: Typography.weight.medium },
});
