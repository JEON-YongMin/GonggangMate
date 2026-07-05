import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { Card } from '@/components/common/Card';
import { useUserStore } from '@/store/userStore';

const MOCK_ACTIVITY = [
  { emoji:'☕', title:'학교 카페 아메리카노', date:'오늘 10:30', category:'카페' },
  { emoji:'📚', title:'도서관에서 과제하기',  date:'어제 14:00', category:'공부' },
  { emoji:'🍱', title:'학식 먹으러 가기',      date:'어제 12:00', category:'식사' },
];
const SETTINGS = [
  { icon:'🔔', label:'알림 설정' },
  { icon:'📅', label:'시간표 관리' },
  { icon:'❤️', label:'관심 카테고리 설정' },
  { icon:'📊', label:'활동 통계 (v1.2)' },
  { icon:'❓', label:'도움말' },
  { icon:'🚪', label:'로그아웃' },
];

export default function MyPageScreen() {
  const { user, selectedSchool, selectedTags } = useUserStore();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>마이페이지</Text>
        <View style={styles.badge}><Text style={styles.badgeTxt}>v1.2</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}><Text style={styles.avatarTxt}>{user?.nickname?.[0] ?? '나'}</Text></View>
            <View style={{ flex:1 }}>
              <Text style={styles.profileName}>{user?.nickname ?? '학생'}</Text>
              <Text style={styles.profileSchool}>{selectedSchool?.name ?? user?.schoolName ?? '학교 미설정'}</Text>
              {user?.department && <Text style={styles.profileDept}>{user.department}</Text>}
            </View>
            <TouchableOpacity style={styles.editBtn}><Text style={styles.editBtnTxt}>수정</Text></TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.tagsCard}>
          <Text style={styles.cardLabel}>관심 활동</Text>
          <View style={styles.tagRow}>
            {selectedTags.length > 0 ? selectedTags.map(t => (
              <View key={t.id} style={styles.tagChip}>
                <Text style={{ fontSize:14 }}>{t.iconEmoji}</Text>
                <Text style={styles.tagName}>{t.tagName}</Text>
              </View>
            )) : <Text style={styles.noTags}>관심 활동을 설정해보세요</Text>}
          </View>
        </Card>

        <View>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>최근 활동 기록</Text>
            <View style={styles.mockBadge}><Text style={styles.mockBadgeTxt}>v1.2 Mock</Text></View>
          </View>
          <Card style={{ padding:0, overflow:'hidden' }}>
            {MOCK_ACTIVITY.map((item, idx) => (
              <View key={idx} style={[styles.activityItem, idx < MOCK_ACTIVITY.length-1 && styles.activityItemBorder]}>
                <Text style={{ fontSize:24 }}>{item.emoji}</Text>
                <View style={{ flex:1 }}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDate}>{item.date} · {item.category}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        <Text style={styles.sectionTitle}>설정</Text>
        <Card style={{ padding:0, overflow:'hidden' }}>
          {SETTINGS.map((s, idx) => (
            <TouchableOpacity key={idx} style={[styles.settingItem, idx < SETTINGS.length-1 && styles.settingItemBorder]} activeOpacity={0.7}>
              <Text style={styles.settingIcon}>{s.icon}</Text>
              <Text style={styles.settingLabel}>{s.label}</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>
        <View style={{ height:32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: Colors.backgroundGray },
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth:1, borderBottomColor: Colors.cardBorder, gap: Spacing.sm },
  title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  badge: { backgroundColor: Colors.gapFreeDay, paddingHorizontal:8, paddingVertical:3, borderRadius: Radius.full },
  badgeTxt: { fontSize: Typography.size.xs, color: Colors.gapFreeDayText, fontWeight: Typography.weight.bold },
  content: { padding: Spacing.screenHorizontal, gap: Spacing.md },
  profileCard: { padding: Spacing.cardPadding },
  profileRow: { flexDirection:'row', alignItems:'center', gap: Spacing.md },
  avatar: { width:56, height:56, borderRadius:28, backgroundColor: Colors.primaryLight, justifyContent:'center', alignItems:'center' },
  avatarTxt: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: Colors.primary },
  profileName: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  profileSchool: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop:2 },
  profileDept: { fontSize: Typography.size.xs, color: Colors.textTertiary, marginTop:1 },
  editBtn: { paddingHorizontal:14, paddingVertical:6, borderRadius: Radius.full, borderWidth:1, borderColor: Colors.cardBorder },
  editBtnTxt: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  tagsCard: { padding: Spacing.cardPadding },
  cardLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, marginBottom: Spacing.md },
  tagRow: { flexDirection:'row', flexWrap:'wrap', gap:8 },
  tagChip: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:12, paddingVertical:6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, borderWidth:1, borderColor: Colors.primary+'40' },
  tagName: { fontSize: Typography.size.sm, color: Colors.primary, fontWeight: Typography.weight.medium },
  noTags: { fontSize: Typography.size.sm, color: Colors.textTertiary },
  sectionRow: { flexDirection:'row', alignItems:'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  mockBadge: { backgroundColor: Colors.gapFreeDay, paddingHorizontal:6, paddingVertical:2, borderRadius: Radius.full },
  mockBadgeTxt: { fontSize:10, color: Colors.gapFreeDayText, fontWeight: Typography.weight.bold },
  activityItem: { flexDirection:'row', alignItems:'center', paddingHorizontal: Spacing.cardPadding, paddingVertical:14, gap: Spacing.md, minHeight: Spacing.minTouchSize },
  activityItemBorder: { borderBottomWidth:1, borderBottomColor: Colors.divider },
  activityTitle: { fontSize: Typography.size.base, fontWeight: Typography.weight.medium, color: Colors.textPrimary },
  activityDate: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop:2 },
  settingItem: { flexDirection:'row', alignItems:'center', paddingHorizontal: Spacing.cardPadding, paddingVertical:16, gap: Spacing.md, minHeight: Spacing.minTouchSize },
  settingItemBorder: { borderBottomWidth:1, borderBottomColor: Colors.divider },
  settingIcon: { fontSize:20, width:28, textAlign:'center' },
  settingLabel: { flex:1, fontSize: Typography.size.base, color: Colors.textPrimary },
  settingArrow: { fontSize:20, color: Colors.textTertiary },
});
