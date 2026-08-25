import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, spacing, TOUCH_TARGET } from '@/lib/theme';
import type { NavItem } from './nav-items';

interface BottomBarProps {
  items: NavItem[];
  activeSegment: string;
}

/** Navegação inferior do celular e do tablet (< 1200px). */
export function BottomBar({ items, activeSegment }: BottomBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      {items.map((item) => (
        <BottomBarItem
          key={item.segment}
          item={item}
          active={item.segment === activeSegment}
          onPress={() => router.push(item.href as never)}
        />
      ))}
    </View>
  );
}

function BottomBarItem({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  const { focused, handlers } = useInteractionState();
  const tint = active ? colors.primary : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      {...handlers}
      style={[styles.item, focused && styles.focused]}
    >
      <Ionicons name={active ? item.iconActive : item.icon} size={22} color={tint} />
      <AppText variant="caption" color={tint} numberOfLines={1}>
        {item.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  item: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focused: { borderColor: colors.focus },
});
