import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, SafeAreaView, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { userService } from '@/services/user.service';
import { useUserStore } from '@/store/userStore';
import { InterestTag } from '@/types/user.types';
import { api } from '@/services/api';

export default function InterestSelectScreen() {
  const [tags, setTags] = useState<InterestTag[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { userId, setSelectedTags, completeOnboarding } = useUserStore();

  useEffect(() => { loadTags(); }, []);

  const loadTags = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await api.get<InterestTag[]>('/interest-tags');
      const data = res.data.data;
      if (!data || data.length === 0) { setLoadError(true); }
      else { setTags(data); }
    } catch { setLoadError(true); }
    finally { setIsLoading(false); }
  };

  const toggleTag = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const handleStart = async () => {
    if (selectedIds.length === 0 || !userId) return;
    setIsSaving(true);
    try {
      const saved = await userService.saveInterestTags(userId, selectedIds);
      setSelectedTags(saved);
      await userService.completeOnboarding(userId);
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.step}>3 / 3</Text>
        <Text style={styles.title}>관심 활동을 골라주세요</Text>
        <Text style={styles.subtitle}>공강 시간에 딱 맞는 추천을 드려요 ✨</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : loadError ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😅</Text>
          <Text style={styles.errorTitle}>태그를 불러오지 못했어요</Text>
          <Text style={styles.errorSub}>네트워크 연결을 확인해주세요</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadTags}>
            <Text style={styles.retryBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.tagGrid}>
          {tags.map(tag => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                onPress={() => toggleTag(tag.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagEmoji}>{tag.iconEmoji}</Text>
                <Text style={[styles.tagName, isSelected && styles.tagNameSelected]}>{tag.tagName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {!loadError && (
        <View style={styles.footer}>
          <Text style={styles.count}>{selectedIds.length > 0 ? `${selectedIds.length}개 선택됨` : '1개 이상 선택해주세요'}</Text>
          <TouchableOpacity
            style={[styles.startBtn, (selectedIds.length === 0 || isSaving) && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={selectedIds.length === 0 || isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.startBtnText}>시작하기 🎉</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing.screenHorizontal, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  step: { fontSize: Typography.size.sm, color: Colors.textTertiary, marginBottom: 8 },
  title: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: Typography.size.base, color: Colors.textSecondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, padding: Spacing.screenHorizontal },
  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  errorSub: { fontSize: Typography.size.base, color: Colors.textSecondary },
  retryBtn: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: Radius.md },
  retryBtnText: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.white },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.screenHorizontal, gap: Spacing.sm, paddingBottom: Spacing.xl },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.cardBorder, backgroundColor: Colors.white, minHeight: Spacing.minTouchSize },
  tagChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  tagEmoji: { fontSize: 18 },
  tagName: { fontSize: Typography.size.base, fontWeight: Typography.weight.medium, color: Colors.textSecondary },
  tagNameSelected: { color: Colors.primary, fontWeight: Typography.weight.semiBold },
  footer: { paddingHorizontal: Spacing.screenHorizontal, paddingVertical: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.cardBorder, gap: Spacing.sm },
  count: { fontSize: Typography.size.sm, color: Colors.textSecondary, textAlign: 'center' },
  startBtn: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  startBtnDisabled: { backgroundColor: Colors.textDisabled },
  startBtnText: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.white },
});
