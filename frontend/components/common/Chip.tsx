import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/radius';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface ChipProps { label: string; selected?: boolean; onPress?: () => void; }

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    minHeight: Spacing.minTouchSize,
    justifyContent: 'center',
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  label: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, color: Colors.textSecondary },
  labelSelected: { color: Colors.primary, fontWeight: Typography.weight.semiBold },
});
