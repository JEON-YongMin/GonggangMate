import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, RefreshControl, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { Card } from '@/components/common/Card';
import { Chip } from '@/components/common/Chip';
import { EmptyState } from '@/components/common/EmptyState';
import { useUserStore } from '@/store/userStore';
import { GapSummary, RecommendationItem } from '@/types/user.types';
import { timetableService } from '@/services/timetable.service';
import { recommendationService } from '@/services/recommendation.service';

const WEEKDAY = ['일','월','화','수','목','금','토'];
const WEATHER_LIST = [
  { key: 'SUNNY',  label: '☀️ 맑음', phrase: '산책하기 좋은 날이에요!', color: '#FEF3C7' },
  { key: 'CLOUDY', label: '☁️ 흐림', phrase: '실내 활동이 어울려요.',   color: '#F3F4F6' },
  { key: 'RAINY',  label: '🌧️ 비',   phrase: '아늑한 카페 어때요?',    color: '#EFF6FF' },
];
const CATEGORIES = ['전체','카페','식사','공부','운동','휴식','친구 만남'];

function formatMin(m: number) { return m < 60 ? `${m}분` : `${Math.floor(m/60)}시간${m%60>0?` ${m%60}분`:''}`; }
function fmtTime(t: string) { return t?.slice(0,5) ?? ''; }
function gapBg(type: string) {
  switch(type) {
    case 'SHORT':   return { backgroundColor: Colors.gapShort };
    case 'VALID':   return { backgroundColor: Colors.gapValid };
    case 'RELAXED': return { backgroundColor: Colors.gapRelaxed };
    default:        return { backgroundColor: Colors.gapFreeDay };
  }
}
function gapTxt(type: string) {
  switch(type) {
    case 'SHORT':   return Colors.gapShortText;
    case 'VALID':   return Colors.gapValidText;
    case 'RELAXED': return Colors.gapRelaxedText;
    default:        return Colors.gapFreeDayText;
  }
}

export default function HomeScreen() {
  const { userId, user, selectedSchool } = useUserStore();
  const [summary, setSummary] = useState<GapSummary | null>(null);
  const [previews, setPreviews] = useState<RecommendationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const dateStr = `${today.getMonth()+1}월 ${today.getDate()}일 (${WEEKDAY[today.getDay()]})`;
  const weather = WEATHER_LIST[today.getDay() % 3];

  const load = useCallback(async (uid: number) => {
    try {
      const data = await timetableService.getGapSummary(uid);
      setSummary(data);
      if (data.hasTimetable && data.hasGapToday && data.todayGaps.length > 0) {
        const recs = await recommendationService.getRecommendations({ userId: uid, gapId: data.todayGaps[0].id, weather: weather.key });
        setPreviews(recs.slice(0, 3));
      }
    } catch { setSummary(null); }
  }, [weather.key]);

  useEffect(() => {
    if (!userId) { setIsLoading(false); return; }
    setIsLoading(true);
    load(userId).finally(() => setIsLoading(false));
  }, [userId]);

  const onRefresh = async () => { if (!userId) return; setRefreshing(true); await load(userId); setRefreshing(false); };
  const schoolName = selectedSchool?.name ?? user?.schoolName ?? '공강메이트';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>{schoolName}</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <View style={[styles.weatherBadge, { backgroundColor: weather.color }]}>
            <Text style={styles.weatherLabel}>{weather.label}</Text>
          </View>
        </View>
        <View style={[styles.weatherBanner, { backgroundColor: weather.color }]}>
          <Text style={styles.weatherPhrase}>💬 {weather.phrase}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} size="large" />
        ) : !summary?.hasTimetable ? (
          <Card style={styles.stateCard}><EmptyState emoji="📅" title="아직 시간표가 없어요" subtitle="시간표를 등록하면 공강 시간을 분석해드려요!" ctaLabel="시간표 등록하기" onCta={() => router.push('/(tabs)/timetable')} /></Card>
        ) : !summary?.hasGapToday ? (
          <Card style={styles.stateCard}><EmptyState emoji="😊" title="오늘은 공강이 없어요" subtitle="열심히 수업 들어요! 내일을 기대해봐요 ✨" /></Card>
        ) : (
          <>
            <View style={styles.section}>
              <Card>
                <Text style={styles.cardLabel}>오늘 공강 요약</Text>
                <View style={styles.summaryRow}>
                  <SummaryItem emoji="📊" value={`${summary.totalGapCount}개`} label="공강 개수" />
                  <View style={styles.divV} />
                  <SummaryItem emoji="⏰" value={summary.nextGapDisplay} label="다음 공강" />
                  <View style={styles.divV} />
                  <SummaryItem emoji="⏱️" value={formatMin(summary.totalGapMinutes)} label="총 공강" />
                </View>
                <View style={styles.timeline}>
                  {summary.todayGaps.map(g => (
                    <TouchableOpacity key={g.id} style={[styles.timelineItem, gapBg(g.gapType)]} onPress={() => router.push('/(tabs)/recommendation')} activeOpacity={0.8}>
                      <Text style={[styles.timelineTime, { color: gapTxt(g.gapType) }]}>{fmtTime(g.startTime)} ~ {fmtTime(g.endTime)}</Text>
                      <View style={styles.timelineBadge}><Text style={styles.timelineBadgeTxt}>{g.gapTypeDisplay}</Text></View>
                      <Text style={[styles.timelineDur, { color: gapTxt(g.gapType) }]}>{formatMin(g.durationMinutes)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>카테고리</Text>
              <FlatList horizontal showsHorizontalScrollIndicator={false} data={CATEGORIES} keyExtractor={i => i}
                contentContainerStyle={{ gap: 8, paddingRight: Spacing.screenHorizontal }}
                renderItem={({ item }) => <Chip label={item} selected={selectedCategory === item} onPress={() => setSelectedCategory(item)} />}
              />
            </View>
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>지금 추천해요 ✨</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/recommendation')}><Text style={styles.seeAll}>전체보기</Text></TouchableOpacity>
              </View>
              {previews.map(item => (
                <TouchableOpacity key={item.id} style={styles.previewCard} activeOpacity={0.8}>
                  <View style={[styles.catIconBox, { backgroundColor: item.categoryColor + '20' }]}>
                    <Text style={styles.catIcon}>{item.categoryIcon}</Text>
                  </View>
                  <View style={styles.previewBody}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.previewCat}>{item.categoryName}</Text>
                      <Text style={styles.previewTime}>⏱ {item.estimatedMinutes}분</Text>
                    </View>
                    <Text style={styles.previewTitle}>{item.title}</Text>
                    <Text style={styles.previewDesc} numberOfLines={1}>{item.description}</Text>
                    {item.reasonText && <Text style={styles.previewReason}>💡 {item.reasonText}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryEmoji}>{emoji}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundGray },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.screenHorizontal, paddingTop: Spacing.xl, paddingBottom: Spacing.md, backgroundColor: Colors.white },
  schoolName: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  dateText: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  weatherBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  weatherLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, color: Colors.textPrimary },
  weatherBanner: { paddingHorizontal: Spacing.screenHorizontal, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  weatherPhrase: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  stateCard: { margin: Spacing.screenHorizontal, marginTop: Spacing.lg },
  section: { paddingHorizontal: Spacing.screenHorizontal, marginTop: Spacing.lg, gap: Spacing.md },
  cardLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  summaryItem: { alignItems: 'center', flex: 1, gap: 4 },
  summaryEmoji: { fontSize: 22 },
  summaryValue: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  summaryLabel: { fontSize: Typography.size.xs, color: Colors.textSecondary },
  divV: { width: 1, height: 36, backgroundColor: Colors.divider },
  timeline: { marginTop: Spacing.md, gap: Spacing.sm },
  timelineItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.sm, gap: Spacing.sm },
  timelineTime: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, flex: 1 },
  timelineBadge: { backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  timelineBadgeTxt: { fontSize: Typography.size.xs, color: Colors.textSecondary },
  timelineDur: { fontSize: Typography.size.xs },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: Typography.size.sm, color: Colors.primary, fontWeight: Typography.weight.medium },
  previewCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.cardPadding, gap: Spacing.md, alignItems: 'flex-start' },
  catIconBox: { width: 48, height: 48, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  catIcon: { fontSize: 24 },
  previewBody: { flex: 1, gap: 4 },
  previewCat: { fontSize: Typography.size.xs, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  previewTime: { fontSize: Typography.size.xs, color: Colors.textTertiary },
  previewTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  previewDesc: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  previewReason: { fontSize: Typography.size.xs, color: Colors.primary, fontWeight: Typography.weight.medium },
});
