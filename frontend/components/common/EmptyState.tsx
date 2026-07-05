import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Radius } from '@/constants/radius';
import { Spacing } from '@/constants/spacing';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ emoji, title, subtitle, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <TouchableOpacity style={styles.cta} onPress={onCta} activeOpacity={0.8}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.screenHorizontal, gap: Spacing.sm },
  emoji: { fontSize: 52, marginBottom: 4 },
  title: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: Typography.size.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  cta: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: 14, backgroundColor: Colors.primary, borderRadius: Radius.md },
  ctaText: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.white },
});
