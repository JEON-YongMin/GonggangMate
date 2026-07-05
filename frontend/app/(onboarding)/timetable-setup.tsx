import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Modal, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { useUserStore } from '@/store/userStore';
import { api } from '@/services/api';

const DAYS = [{ key: 'MON', label: '월' }, { key: 'TUE', label: '화' }, { key: 'WED', label: '수' }, { key: 'THU', label: '목' }, { key: 'FRI', label: '금' }];
const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];
const TIMES: string[] = [];
for (let h = 8; h <= 21; h++) {
  TIMES.push(`${String(h).padStart(2,'0')}:00`);
  if (h < 21) TIMES.push(`${String(h).padStart(2,'0')}:30`);
}

interface CourseItem { id: number; name: string; dayOfWeek: string; startTime: string; endTime: string; classroom?: string; colorCode: string; }

const EMPTY_FORM = { name: '', dayOfWeek: 'MON', startTime: '09:00', endTime: '10:30', classroom: '', colorCode: '#3B82F6' };

function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.timePicker} onPress={() => setOpen(true)}>
        <Text style={styles.timePickerTxt}>{value}</Text>
        <Text style={{ color: Colors.textTertiary }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.timeBox}>
            <FlatList data={TIMES} keyExtractor={t => t} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.timeOpt, value === item && styles.timeOptOn]}
                  onPress={() => { onChange(item); setOpen(false); }}>
                  <Text style={[styles.timeOptTxt, value === item && { color: Colors.primary, fontWeight: Typography.weight.bold }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function TimetableSetupScreen() {
  const { userId } = useUserStore();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  const ensureSemester = useCallback(async (): Promise<number> => {
    if (semesterId) return semesterId;
    if (!userId) throw new Error('userId 없음');
    try {
      const res = await api.get<{ id: number }>(`/users/${userId}/semesters/active`);
      setSemesterId(res.data.data.id);
      return res.data.data.id;
    } catch {
      const year = new Date().getFullYear();
      const semesterName = new Date().getMonth() + 1 <= 6 ? '1학기' : '2학기';
      const res = await api.post<{ id: number }>(`/users/${userId}/semesters`, { year, semesterName });
      setSemesterId(res.data.data.id);
      return res.data.data.id;
    }
  }, [userId, semesterId]);

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('알림', '과목명을 입력해주세요.'); return; }
    if (form.startTime >= form.endTime) { Alert.alert('알림', '종료 시간은 시작 시간보다 늦어야 해요.'); return; }
    setIsSaving(true);
    try {
      const sid = await ensureSemester();
      const res = await api.post<CourseItem>(`/semesters/${sid}/courses`, {
        name: form.name.trim(), dayOfWeek: form.dayOfWeek,
        startTime: form.startTime, endTime: form.endTime,
        classroom: form.classroom.trim() || null, colorCode: form.colorCode,
      });
      setCourses(prev => [...prev, res.data.data]);
      setIsModalOpen(false);
      setForm({ ...EMPTY_FORM });
    } catch (e: any) {
      Alert.alert('시간 중복', e?.response?.data?.message ?? '저장에 실패했어요.');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/courses/${id}`); setCourses(prev => prev.filter(c => c.id !== id)); }
    catch { Alert.alert('오류', '삭제에 실패했어요.'); }
  };

  const dayLabel = (key: string) => DAYS.find(d => d.key === key)?.label ?? key;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.step}>2 / 3</Text>
        <Text style={styles.title}>시간표를 등록해주세요</Text>
        <Text style={styles.subtitle}>공강 계산의 기준이 돼요 📅</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {courses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>아직 등록된 과목이 없어요</Text>
            <Text style={styles.emptySubText}>+ 과목 추가 버튼을 눌러 시작해봐요</Text>
          </View>
        ) : courses.map(c => (
          <View key={c.id} style={styles.courseCard}>
            <View style={[styles.courseBar, { backgroundColor: c.colorCode }]} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{c.name}</Text>
              <Text style={styles.courseMeta}>{dayLabel(c.dayOfWeek)}요일  {c.startTime?.slice(0,5)}~{c.endTime?.slice(0,5)}{c.classroom ? `  ${c.classroom}` : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(c.id)} style={styles.delBtn}>
              <Text style={styles.delBtnTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)} activeOpacity={0.7}>
          <Text style={styles.addBtnText}>+ 과목 추가하기</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        {courses.length === 0 && (
          <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/(onboarding)/interest-select')}>
            <Text style={styles.skipText}>나중에 등록할게요</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, courses.length === 0 && styles.nextBtnSecondary]}
          onPress={() => router.push('/(onboarding)/interest-select')}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextBtnText, courses.length === 0 && styles.nextBtnTextSecondary]}>
            {courses.length > 0 ? `${courses.length}개 등록 완료 → 다음` : '다음'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
              <Text style={styles.modalCancel}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>과목 추가</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={styles.modalSave}>저장</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.fieldLabel}>과목명 *</Text>
            <TextInput style={styles.input} placeholder="예) 운영체제" placeholderTextColor={Colors.textTertiary} value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} />

            <Text style={styles.fieldLabel}>요일 *</Text>
            <View style={styles.dayRow}>
              {DAYS.map(d => (
                <TouchableOpacity key={d.key} style={[styles.dayBtn, form.dayOfWeek === d.key && styles.dayBtnOn]} onPress={() => setForm(f => ({ ...f, dayOfWeek: d.key }))}>
                  <Text style={[styles.dayBtnTxt, form.dayOfWeek === d.key && styles.dayBtnTxtOn]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>시간 *</Text>
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}><TimePicker value={form.startTime} onChange={t => setForm(f => ({ ...f, startTime: t }))} /></View>
              <Text style={styles.timeSep}>~</Text>
              <View style={{ flex: 1 }}><TimePicker value={form.endTime} onChange={t => setForm(f => ({ ...f, endTime: t }))} /></View>
            </View>

            <Text style={styles.fieldLabel}>강의실 (선택)</Text>
            <TextInput style={styles.input} placeholder="예) 공학관 301" placeholderTextColor={Colors.textTertiary} value={form.classroom} onChangeText={t => setForm(f => ({ ...f, classroom: t }))} />

            <Text style={styles.fieldLabel}>과목 색상</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, form.colorCode === c && styles.colorDotOn]} onPress={() => setForm(f => ({ ...f, colorCode: c }))}>
                  {form.colorCode === c && <Text style={{ color: Colors.white, fontWeight: Typography.weight.bold, fontSize: 16 }}>✓</Text>}
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
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing.screenHorizontal, paddingTop: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  step: { fontSize: Typography.size.sm, color: Colors.textTertiary, marginBottom: 6 },
  title: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: Typography.size.base, color: Colors.textSecondary },
  body: { padding: Spacing.screenHorizontal, gap: Spacing.md, paddingBottom: 32 },
  emptyBox: { paddingVertical: Spacing.xxxl, alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  emptySubText: { fontSize: Typography.size.base, color: Colors.textSecondary },
  courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden', minHeight: Spacing.minTouchSize },
  courseBar: { width: 6, alignSelf: 'stretch' },
  courseInfo: { flex: 1, padding: Spacing.md },
  courseName: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  courseMeta: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  delBtn: { paddingHorizontal: Spacing.md, minWidth: Spacing.minTouchSize, minHeight: Spacing.minTouchSize, justifyContent: 'center', alignItems: 'center' },
  delBtnTxt: { fontSize: Typography.size.base, color: Colors.textTertiary },
  addBtn: { height: 52, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: Typography.size.base, color: Colors.primary, fontWeight: Typography.weight.semiBold },
  footer: { paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.cardBorder, gap: Spacing.sm },
  skipBtn: { height: 44, justifyContent: 'center', alignItems: 'center' },
  skipText: { fontSize: Typography.size.base, color: Colors.textSecondary },
  nextBtn: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  nextBtnSecondary: { backgroundColor: Colors.backgroundGray, borderWidth: 1, borderColor: Colors.cardBorder },
  nextBtnText: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.white },
  nextBtnTextSecondary: { color: Colors.textSecondary },
  modalSafe: { flex: 1, backgroundColor: Colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  modalTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  modalCancel: { fontSize: Typography.size.base, color: Colors.textSecondary, minWidth: 44, lineHeight: 44 },
  modalSave: { fontSize: Typography.size.base, color: Colors.primary, fontWeight: Typography.weight.semiBold, minWidth: 44, textAlign: 'right', lineHeight: 44 },
  modalBody: { padding: Spacing.screenHorizontal, gap: Spacing.lg, paddingBottom: 40 },
  fieldLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, marginBottom: 4 },
  input: { height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, paddingHorizontal: Spacing.md, fontSize: Typography.size.base, color: Colors.textPrimary, backgroundColor: Colors.backgroundGray },
  dayRow: { flexDirection: 'row', gap: 8 },
  dayBtn: { flex: 1, height: 44, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundGray },
  dayBtnOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayBtnTxt: { fontSize: Typography.size.base, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  dayBtnTxtOn: { color: Colors.primary, fontWeight: Typography.weight.bold },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeSep: { fontSize: Typography.size.lg, color: Colors.textSecondary },
  timePicker: { height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.backgroundGray },
  timePickerTxt: { fontSize: Typography.size.base, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  timeBox: { width: 160, maxHeight: 300, backgroundColor: Colors.white, borderRadius: Radius.lg, overflow: 'hidden' },
  timeOpt: { paddingVertical: 12, paddingHorizontal: Spacing.md, minHeight: Spacing.minTouchSize, justifyContent: 'center' },
  timeOptOn: { backgroundColor: Colors.primaryLight },
  timeOptTxt: { fontSize: Typography.size.base, color: Colors.textPrimary, textAlign: 'center' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  colorDotOn: { borderWidth: 3, borderColor: Colors.white, elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
});
