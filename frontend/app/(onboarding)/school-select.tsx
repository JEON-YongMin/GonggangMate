import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { schoolService } from '@/services/school.service';
import { userService } from '@/services/user.service';
import { useUserStore } from '@/store/userStore';
import { School } from '@/types/user.types';

export default function SchoolSelectScreen() {
  const [schools, setSchools] = useState<School[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { setUserId, setUser, setSelectedSchool } = useUserStore();

  useEffect(() => { loadSchools(''); }, []);
  useEffect(() => {
    const timer = setTimeout(() => loadSchools(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const loadSchools = async (keyword: string) => {
    setIsLoading(true);
    try {
      const data = await schoolService.search(keyword);
      setSchools(data);
    } catch { setSchools([]); }
    finally { setIsLoading(false); }
  };

  const handleNext = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      const user = await userService.create('학생', selected.id);
      await setUserId(user.id);
      setUser(user);
      setSelectedSchool(selected);
      router.push('/(onboarding)/timetable-setup');
    } catch {
      Alert.alert('오류', '학교 선택에 실패했어요. 다시 시도해주세요.');
    } finally { setIsSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.step}>1 / 3</Text>
        <Text style={styles.title}>학교를 선택해주세요</Text>
        <Text style={styles.subtitle}>내 학교를 찾아볼게요 🔍</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="학교 이름을 검색하세요"
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : schools.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏫</Text>
          <Text style={styles.emptyTitle}>학교를 찾을 수 없어요</Text>
          <Text style={styles.emptySub}>다른 이름으로 검색해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={schools}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, selected?.id === item.id && styles.itemSelected]}
              onPress={() => setSelected(item)}
              activeOpacity={0.7}
            >
              <View>
                <Text style={[styles.itemName, selected?.id === item.id && styles.itemNameSelected]}>
                  {item.name}
                </Text>
                <Text style={styles.itemSub}>{item.campusName} · {item.region}</Text>
              </View>
              {selected?.id === item.id && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selected || isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.nextBtnText}>다음</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing.screenHorizontal, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  step: { fontSize: Typography.size.sm, color: Colors.textTertiary, marginBottom: 8 },
  title: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: Typography.size.base, color: Colors.textSecondary },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.screenHorizontal, marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md, height: 48,
    borderRadius: Radius.md, backgroundColor: Colors.backgroundGray,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: Typography.size.base, color: Colors.textPrimary },
  list: { paddingHorizontal: Spacing.screenHorizontal },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.cardPadding, marginBottom: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    backgroundColor: Colors.white, minHeight: Spacing.minTouchSize,
  },
  itemSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  itemName: { fontSize: Typography.size.md, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  itemNameSelected: { color: Colors.primary },
  itemSub: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  check: { fontSize: 18, color: Colors.primary, fontWeight: Typography.weight.bold },
  loader: { marginTop: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.size.base, color: Colors.textSecondary },
  footer: { paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  nextBtn: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: Colors.textDisabled },
  nextBtnText: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.white },
});
