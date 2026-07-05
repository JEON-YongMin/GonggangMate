import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { Card } from '@/components/common/Card';

const FRIENDS = [
  { id:1, name:'이서윤', school:'한국대학교', matchMin:90, status:'ACCEPTED' },
  { id:2, name:'박지호', school:'서울과기대',  matchMin:60, status:'ACCEPTED' },
  { id:3, name:'최수아', school:'서울과기대',  matchMin:0,  status:'PENDING' },
];

export default function FriendScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>친구 공강 👥</Text>
        <View style={styles.badge}><Text style={styles.badgeTxt}>v1.1</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Text style={{ fontSize:28 }}>🚧</Text>
          <View><Text style={styles.infoTitle}>친구 매칭 기능 준비 중</Text><Text style={styles.infoSub}>다음 버전에서 만나요! (Mock UI)</Text></View>
        </View>
        <Card style={styles.summaryCard}>
          <Text style={styles.cardLabel}>이번 주 겹치는 공강</Text>
          <View style={styles.statsRow}>
            {[['👥','2명','매칭 친구'],['⏰','2시간 30분','총 겹치는 시간'],['📅','3회','이번 주 기회']].map(([e,v,l]) => (
              <View key={l} style={styles.stat}><Text style={{ fontSize:22 }}>{e}</Text><Text style={styles.statVal}>{v}</Text><Text style={styles.statLabel}>{l}</Text></View>
            ))}
          </View>
        </Card>
        <Text style={styles.sectionTitle}>친구 목록</Text>
        {FRIENDS.map(f => (
          <Card key={f.id} style={styles.friendCard}>
            <View style={styles.friendRow}>
              <View style={styles.avatar}><Text style={styles.avatarTxt}>{f.name[0]}</Text></View>
              <View style={{ flex:1 }}><Text style={styles.friendName}>{f.name}</Text><Text style={styles.friendSchool}>{f.school}</Text></View>
              {f.status==='PENDING' ? <View style={styles.pendingBadge}><Text style={styles.pendingTxt}>수락 대기</Text></View>
                : f.matchMin>0 ? <View style={styles.matchBadge}><Text style={styles.matchTxt}>{f.matchMin>=60?`${Math.floor(f.matchMin/60)}시간 `:''}{f.matchMin%60>0?`${f.matchMin%60}분`:''} 겹침</Text></View>
                : null}
            </View>
            {f.matchMin>0 && <TouchableOpacity style={styles.proposeBtn} activeOpacity={0.8}><Text style={styles.proposeBtnTxt}>☕ 만남 제안하기</Text></TouchableOpacity>}
          </Card>
        ))}
        <TouchableOpacity style={styles.addFriendBtn} activeOpacity={0.8}><Text style={styles.addFriendTxt}>+ 친구 추가하기</Text></TouchableOpacity>
        <View style={{ height:32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: Colors.backgroundGray },
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth:1, borderBottomColor: Colors.cardBorder, gap: Spacing.sm },
  title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  badge: { backgroundColor: Colors.pointLight, paddingHorizontal:8, paddingVertical:3, borderRadius: Radius.full },
  badgeTxt: { fontSize: Typography.size.xs, color: Colors.point, fontWeight: Typography.weight.bold },
  content: { padding: Spacing.screenHorizontal, gap: Spacing.md },
  infoBanner: { flexDirection:'row', alignItems:'center', gap: Spacing.md, backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: Spacing.cardPadding, borderWidth:1, borderColor: Colors.warning+'40' },
  infoTitle: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  infoSub: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  summaryCard: { padding: Spacing.cardPadding },
  cardLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, marginBottom: Spacing.md },
  statsRow: { flexDirection:'row', justifyContent:'space-around' },
  stat: { alignItems:'center', gap:4 },
  statVal: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.size.xs, color: Colors.textSecondary },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  friendCard: { padding: Spacing.cardPadding, gap: Spacing.md },
  friendRow: { flexDirection:'row', alignItems:'center', gap: Spacing.md },
  avatar: { width:44, height:44, borderRadius:22, backgroundColor: Colors.primaryLight, justifyContent:'center', alignItems:'center' },
  avatarTxt: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.primary },
  friendName: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  friendSchool: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  matchBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal:8, paddingVertical:4, borderRadius: Radius.full },
  matchTxt: { fontSize: Typography.size.xs, color: Colors.primary, fontWeight: Typography.weight.semiBold },
  pendingBadge: { backgroundColor: Colors.warningLight, paddingHorizontal:8, paddingVertical:4, borderRadius: Radius.full },
  pendingTxt: { fontSize: Typography.size.xs, color: Colors.warning, fontWeight: Typography.weight.semiBold },
  proposeBtn: { paddingVertical:10, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems:'center' },
  proposeBtnTxt: { fontSize: Typography.size.base, color: Colors.primary, fontWeight: Typography.weight.semiBold },
  addFriendBtn: { height:52, borderRadius: Radius.md, borderWidth:1.5, borderColor: Colors.primary, justifyContent:'center', alignItems:'center' },
  addFriendTxt: { fontSize: Typography.size.base, color: Colors.primary, fontWeight: Typography.weight.semiBold },
});
