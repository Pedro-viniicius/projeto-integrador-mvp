import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, typography } from '@/lib/theme';
import { AppText } from './Text';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  /** Empregadores usam quadrado arredondado; pessoas, círculo. */
  shape?: 'circle' | 'rounded';
}

/** Iniciais em bloco colorido. Sem upload de foto no MVP. */
export function Avatar({ name, size = 'md', shape = 'circle' }: AvatarProps) {
  const dimension = SIZES[size];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        {
          width: dimension.box,
          height: dimension.box,
          borderRadius: shape === 'circle' ? radius.pill : radius.md,
        },
      ]}
    >
      <AppText color={colors.primaryText} style={{ fontSize: dimension.font, fontWeight: '700' }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

const SIZES = {
  sm: { box: 32, font: typography.caption.fontSize },
  md: { box: 44, font: typography.small.fontSize },
  lg: { box: 64, font: typography.section.fontSize },
} as const;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
});
