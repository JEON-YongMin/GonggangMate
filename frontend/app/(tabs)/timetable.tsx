import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput, Modal, FlatList } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { useUserStore } from '@/store/userStore';
import { Course, Gap } from '@/types/user.types';
import { timetableService } from '@/services/timetable.service';
import { api } from '@/services/api';

const DAYS = ['MON','TUE','WED','THU','FRI'] as const;
const DAY_LABELS: Record<string, string> = { MON:'월', TUE:'화', WED:'수', THU:'목', FRI:'금' };
const HOUR_START = 8, HOUR_END = 21, HOUR_H = 60, COL_W = 64, TIME_W = 40;
const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];
const TIMES: string[] = [];
for (let h = HOUR_START; h <= HOUR_END; h++) { TIMES.push(`${String(h).padStart(2,'0')}:00`); if (h < HOUR_END) TIMES.push(`${String(h).padStart(2,'0')}:30`); }

function toMin(t: string) { const [h,m] = t.split(':').map(Number); return h*60+m; }
function topPx(t: string) { return ((toMin(t) - HOUR_START*60) / 60) * HOUR_H; }
function hPx(s: string, e: string) { return Math.max(((toMin(e) - toMin(s)) / 60) * HOUR_H - 2, 20); }
function fmtT(t: string) { return t?.slice(0,5) ?? ''; }
function gapBg(type: string) { switch(type) { case 'SHORT': return Colors.gapShort; case 'VALID': return Colors.gapValid; case 'RELAXED': return Colors.gapRelaxed; default: return Colors.gapFreeDay; } }
function gapTx(type: string) { switch(type) { case 'SHORT': return Colors.gapShortText; case 'VALID': return Colors.gapValidText; case 'RELAXED': return Colors.gapRelaxedText; default: return Colors.gapFreeDayText; } }

const EMPTY_FORM = { name:'', dayOfWeek:'MON', startTime:'09:00', endTime:'10:30', classroom:'', colorCode:'#3B82F6' };

function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.tpBtn} onPress={() => setOpen(true)}>
        <Text style={styles.tpTxt}>{value}</Text><Text style={{ color: Colors.textTertiary }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.timeBox}>
            <FlatList data={TIMES} keyExtractor={t => t} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.tOpt, value===item && styles.tOptOn]} onPress={() => { onChange(item); setOpen(false); }}>
                  <Text style={[styles.tOptTxt, value===item && { color: Colors.primary, fontWeight: Typography.weight.bold }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function TimetableScreen() {
  const { userId } = useUserStore();
  const [semesterId, setSemesterId] = useState<number|null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course|null>(null);
  const [detailCourse, setDetailCourse] = useState<Course|null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const todayDay = ['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date().getDay()];

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const sem = await timetableService.getActiveSemester(userId);
      setSemesterId(sem.id);
      const [cs, gs] = await Promise.all([
        timetableService.getCourses(sem.id),
        timetableService.getWeeklyGaps(userId),
      ]);
      setCourses(cs);
      setGaps(gs.filter(g => g.gapType !== 'FREE_DAY'));
    } catch { setSemesterId(null); setCourses([]); setGaps([]); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('알림','과목명을 입력해주세요.'); return; }
    if (form.startTime >= form.endTime) { Alert.alert('알림','종료 시간은 시작 시간보다 늦어야 해요.'); return; }
    setSaving(true);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, { name: form.name.trim(), dayOfWeek: form.dayOfWeek, startTime: form.startTime, endTime: form.endTime, classroom: form.classroom.trim()||null, colorCode: form.colorCode });
      } else {
        let sid = semesterId;
        if (!sid && userId) {
          const year = new Date().getFullYear();
          const sn = new Date().getMonth()+1 <= 6 ? '1학기' : '2학기';
          const sem = await timetableService.createSemester(userId, year, sn);
          setSemesterId(sem.id); sid = sem.id;
        }
        if (sid) await api.post(`/semesters/${sid}/courses`, { name: form.name.trim(), dayOfWeek: form.dayOfWeek, startTime: form.startTime, endTime: form.endTime, classroom: form.classroom.trim()||null, colorCode: form.colorCode });
      }
      setFormVisible(false); setEditingCourse(null);
      await load();
    } catch (e: any) { Alert.alert('저장 실패', e?.response?.data?.message ?? '저장에 실패했어요.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('과목 삭제','정말 삭제할까요?',[
      { text:'취소', style:'cancel' },
      { text:'삭제', style:'destructive', onPress: async () => { try { await timetableService.deleteCourse(id); setDetailCourse(null); await load(); } catch { Alert.alert('오류','삭제에 실패했어요.'); } } }
    ]);
  };

  const openAdd = () => { setEditingCourse(null); setForm({ ...EMPTY_FORM }); setFormVisible(true); };
  const openEdit = (c: Course) => { setDetailCourse(null); setEditingCourse(c); setForm({ name:c.name, dayOfWeek:c.dayOfWeek, startTime:fmtT(c.startTime), endTime:fmtT(c.endTime), classroom:c.classroom??'', colorCode:c.colorCode }); setFormVisible(true); };

  const totalGapMin = gaps.reduce((s,g) => s + g.durationMinutes, 0);

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator style={{ flex:1 }} color={Colors.primary} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>시간표 📅</Text>
        <TouchableOpacity style={styles.addFab} onPress={openAdd}><Text style={styles.addFabTxt}>+ 과목 추가</Text></TouchableOpacity>
      </View>

      {gaps.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryTxt}>이번 주 공강 <Text style={styles.summaryHL}>{gaps.length}개</Text>  총 <Text style={styles.summaryHL}>{Math.floor(totalGapMin/60)}시간{totalGapMin%60>0?` ${totalGapMin%60}분`:''}</Text></Text>
        </View>
      )}

      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 52 }}>📭</Text>
          <Text style={styles.emptyTitle}>시간표가 비어있어요</Text>
          <Text style={styles.emptySub}>+ 과목 추가 버튼을 눌러보세요!</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}><Text style={styles.emptyAddBtnTxt}>+ 과목 추가하기</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              <View style={styles.gridHeader}>
                <View style={{ width: TIME_W }} />
                {DAYS.map(day => (
                  <View key={day} style={[styles.dayHeader, todayDay===day && styles.dayHeaderToday]}>
                    <Text style={[styles.dayHeaderTxt, todayDay===day && styles.dayHeaderTxtToday]}>{DAY_LABELS[day]}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection:'row', backgroundColor: Colors.white }}>
                <View style={{ width: TIME_W }}>
                  {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_,i) => (
                    <View key={i} style={{ height: HOUR_H }}>
                      <Text style={styles.timeLabel}>{String(HOUR_START+i).padStart(2,'0')}</Text>
                    </View>
                  ))}
                </View>
                {DAYS.map(day => (
                  <View key={day} style={[styles.dayCol, { height: (HOUR_END-HOUR_START+1)*HOUR_H }]}>
                    {Array.from({ length: HOUR_END-HOUR_START+1 }, (_,i) => (
                      <View key={i} style={[styles.hourLine, { top: i*HOUR_H }]} />
                    ))}
                    {gaps.filter(g => g.dayOfWeek===day).map(g => (
                      <View key={`g${g.id}`} style={[styles.gapBlock, { top: topPx(g.startTime), height: hPx(g.startTime,g.endTime), backgroundColor: gapBg(g.gapType) }]}>
                        <Text style={[styles.gapBlockType, { color: gapTx(g.gapType) }]}>{g.gapTypeDisplay}</Text>
                        <Text style={[styles.gapBlockDur, { color: gapTx(g.gapType) }]}>{g.durationMinutes}분</Text>
                      </View>
                    ))}
                    {courses.filter(c => c.dayOfWeek===day).map(c => (
                      <TouchableOpacity key={`c${c.id}`} style={[styles.courseBlock, { top: topPx(c.startTime), height: hPx(c.startTime,c.endTime), backgroundColor: c.colorCode }]} onPress={() => setDetailCourse(c)} activeOpacity={0.85}>
                        <Text style={styles.courseBlockName} numberOfLines={2}>{c.name}</Text>
                        {c.classroom && <Text style={styles.courseBlockRoom} numberOfLines={1}>{c.classroom}</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {/* 상세 바텀시트 */}
      <Modal visible={!!detailCourse} transparent animationType="slide" onRequestClose={() => setDetailCourse(null)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setDetailCourse(null)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            {detailCourse && <>
              <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:4 }}>
                <View style={[styles.colorDot, { backgroundColor: detailCourse.colorCode }]} />
                <Text style={styles.sheetTitle}>{detailCourse.name}</Text>
              </View>
              <View style={styles.sheetRow}><Text style={styles.sheetLabel}>요일</Text><Text style={styles.sheetVal}>{DAY_LABELS[detailCourse.dayOfWeek]}요일</Text></View>
              <View style={styles.sheetRow}><Text style={styles.sheetLabel}>시간</Text><Text style={styles.sheetVal}>{fmtT(detailCourse.startTime)} ~ {fmtT(detailCourse.endTime)}</Text></View>
              {detailCourse.classroom && <View style={styles.sheetRow}><Text style={styles.sheetLabel}>강의실</Text><Text style={styles.sheetVal}>{detailCourse.classroom}</Text></View>}
              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(detailCourse)}><Text style={styles.editBtnTxt}>✏️ 수정</Text></TouchableOpacity>
                <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(detailCourse.id)}><Text style={styles.delBtnTxt}>🗑️ 삭제</Text></TouchableOpacity>
              </View>
            </>}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 등록/수정 폼 */}
      <Modal visible={formVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFormVisible(false)}>
        <SafeAreaView style={styles.formSafe}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setFormVisible(false)}><Text style={styles.formCancel}>취소</Text></TouchableOpacity>
            <Text style={styles.formTitle}>{editingCourse ? '과목 수정' : '과목 추가'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={styles.formSave}>저장</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.formBody}>
            <Text style={styles.fieldLabel}>과목명 *</Text>
            <TextInput style={styles.input} placeholder="예) 운영체제" placeholderTextColor={Colors.textTertiary} value={form.name} onChangeText={t => setForm(f => ({ ...f, name:t }))} />
            <Text style={styles.fieldLabel}>요일 *</Text>
            <View style={styles.dayRow}>
              {DAYS.map(d => (
                <TouchableOpacity key={d} style={[styles.dayBtn, form.dayOfWeek===d && styles.dayBtnOn]} onPress={() => setForm(f => ({ ...f, dayOfWeek:d }))}>
                  <Text style={[styles.dayBtnTxt, form.dayOfWeek===d && styles.dayBtnTxtOn]}>{DAY_LABELS[d]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>시간 *</Text>
            <View style={styles.timeRow}>
              <View style={{ flex:1 }}><TimePicker value={form.startTime} onChange={t => setForm(f => ({ ...f, startTime:t }))} /></View>
              <Text style={styles.timeSep}>~</Text>
              <View style={{ flex:1 }}><TimePicker value={form.endTime} onChange={t => setForm(f => ({ ...f, endTime:t }))} /></View>
            </View>
            <Text style={styles.fieldLabel}>강의실 (선택)</Text>
            <TextInput style={styles.input} placeholder="예) 공학관 301" placeholderTextColor={Colors.textTertiary} value={form.classroom} onChangeText={t => setForm(f => ({ ...f, classroom:t }))} />
            <Text style={styles.fieldLabel}>과목 색상</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor:c }, form.colorCode===c && styles.colorCircleOn]} onPress={() => setForm(f => ({ ...f, colorCode:c }))}>
                  {form.colorCode===c && <Text style={{ color:Colors.white, fontWeight:Typography.weight.bold, fontSize:16 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: Colors.backgroundGray },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth:1, borderBottomColor: Colors.cardBorder },
  headerTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  addFab: { paddingHorizontal:14, paddingVertical:8, backgroundColor: Colors.primary, borderRadius: Radius.full, minHeight: Spacing.minTouchSize, justifyContent:'center' },
  addFabTxt: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.white },
  summaryBar: { paddingHorizontal: Spacing.screenHorizontal, paddingVertical:10, backgroundColor: Colors.primaryLight, borderBottomWidth:1, borderBottomColor: Colors.primary+'30' },
  summaryTxt: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  summaryHL: { color: Colors.primary, fontWeight: Typography.weight.bold },
  emptyContainer: { flex:1, justifyContent:'center', alignItems:'center', gap: Spacing.sm, padding: Spacing.screenHorizontal },
  emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.size.base, color: Colors.textSecondary },
  emptyAddBtn: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical:14, backgroundColor: Colors.primary, borderRadius: Radius.md },
  emptyAddBtnTxt: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.white },
  gridHeader: { flexDirection:'row', backgroundColor: Colors.white, borderBottomWidth:1, borderBottomColor: Colors.cardBorder },
  dayHeader: { width: COL_W, paddingVertical:10, alignItems:'center', justifyContent:'center' },
  dayHeaderToday: { backgroundColor: Colors.primaryLight },
  dayHeaderTxt: { fontSize: Typography.size.base, fontWeight: Typography.weight.medium, color: Colors.textSecondary },
  dayHeaderTxtToday: { color: Colors.primary, fontWeight: Typography.weight.bold },
  timeLabel: { fontSize: Typography.size.xs, color: Colors.textTertiary, paddingTop:4, paddingLeft:4, width: TIME_W },
  dayCol: { width: COL_W, borderLeftWidth:1, borderLeftColor: Colors.divider, position:'relative' },
  hourLine: { position:'absolute', left:0, right:0, height:1, backgroundColor: Colors.divider },
  courseBlock: { position:'absolute', left:2, right:2, borderRadius:6, padding:4, overflow:'hidden', zIndex:5 },
  courseBlockName: { fontSize:10, fontWeight: Typography.weight.semiBold, color: Colors.white, lineHeight:13 },
  courseBlockRoom: { fontSize:9, color:'rgba(255,255,255,0.8)', marginTop:1 },
  gapBlock: { position:'absolute', left:2, right:2, borderRadius:6, padding:4, overflow:'hidden', zIndex:3, borderWidth:1, borderColor:'rgba(0,0,0,0.06)', alignItems:'center', justifyContent:'center' },
  gapBlockType: { fontSize:9, fontWeight: Typography.weight.semiBold },
  gapBlockDur: { fontSize:9, marginTop:1 },
  sheetOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.screenHorizontal, paddingBottom:40, gap: Spacing.md },
  sheetHandle: { width:40, height:4, borderRadius:2, backgroundColor: Colors.cardBorder, alignSelf:'center', marginBottom:4 },
  sheetTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  colorDot: { width:16, height:16, borderRadius:8 },
  sheetRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor: Colors.divider },
  sheetLabel: { fontSize: Typography.size.base, color: Colors.textSecondary },
  sheetVal: { fontSize: Typography.size.base, fontWeight: Typography.weight.medium, color: Colors.textPrimary },
  sheetActions: { flexDirection:'row', gap: Spacing.md, marginTop: Spacing.sm },
  editBtn: { flex:1, height:52, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, justifyContent:'center', alignItems:'center' },
  editBtnTxt: { fontSize: Typography.size.base, color: Colors.primary, fontWeight: Typography.weight.semiBold },
  delBtn: { flex:1, height:52, borderRadius: Radius.md, backgroundColor: Colors.errorLight, justifyContent:'center', alignItems:'center' },
  delBtnTxt: { fontSize: Typography.size.base, color: Colors.error, fontWeight: Typography.weight.semiBold },
  formSafe: { flex:1, backgroundColor: Colors.white },
  formHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.md, borderBottomWidth:1, borderBottomColor: Colors.cardBorder },
  formTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  formCancel: { fontSize: Typography.size.base, color: Colors.textSecondary, minWidth:44, lineHeight:44 },
  formSave: { fontSize: Typography.size.base, color: Colors.primary, fontWeight: Typography.weight.semiBold, minWidth:44, textAlign:'right', lineHeight:44 },
  formBody: { padding: Spacing.screenHorizontal, gap: Spacing.lg, paddingBottom:40 },
  fieldLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, marginBottom:4 },
  input: { height:48, borderRadius: Radius.md, borderWidth:1, borderColor: Colors.cardBorder, paddingHorizontal: Spacing.md, fontSize: Typography.size.base, color: Colors.textPrimary, backgroundColor: Colors.backgroundGray },
  dayRow: { flexDirection:'row', gap:8 },
  dayBtn: { flex:1, height:44, borderRadius: Radius.md, borderWidth:1, borderColor: Colors.cardBorder, justifyContent:'center', alignItems:'center', backgroundColor: Colors.backgroundGray },
  dayBtnOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayBtnTxt: { fontSize: Typography.size.base, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  dayBtnTxtOn: { color: Colors.primary, fontWeight: Typography.weight.bold },
  timeRow: { flexDirection:'row', alignItems:'center', gap:8 },
  timeSep: { fontSize: Typography.size.lg, color: Colors.textSecondary },
  tpBtn: { height:48, borderRadius: Radius.md, borderWidth:1, borderColor: Colors.cardBorder, paddingHorizontal: Spacing.md, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor: Colors.backgroundGray },
  tpTxt: { fontSize: Typography.size.base, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' },
  timeBox: { width:160, maxHeight:300, backgroundColor: Colors.white, borderRadius: Radius.lg, overflow:'hidden' },
  tOpt: { paddingVertical:12, paddingHorizontal: Spacing.md, minHeight: Spacing.minTouchSize, justifyContent:'center' },
  tOptOn: { backgroundColor: Colors.primaryLight },
  tOptTxt: { fontSize: Typography.size.base, color: Colors.textPrimary, textAlign:'center' },
  colorRow: { flexDirection:'row', flexWrap:'wrap', gap:12 },
  colorCircle: { width:36, height:36, borderRadius:18, justifyContent:'center', alignItems:'center' },
  colorCircleOn: { borderWidth:3, borderColor: Colors.white, elevation:4, shadowColor:'#000', shadowOpacity:0.3, shadowRadius:4, shadowOffset:{ width:0, height:2 } },
});
