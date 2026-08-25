import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText, Avatar, Logo } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useUnreadCount } from '@/features/notifications/hooks';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, layout, radius, spacing } from '@/lib/theme';
import { NOTIFICATIONS_ITEM, type NavItem } from './nav-items';

interface SidebarProps {
  items: NavItem[];
  activeSegment: string;
}

/** Navegação lateral do desktop (≥ 1200px). Compacta: ícone + texto, nada mais. */
export function Sidebar({ items, activeSegment }: SidebarProps) {
  const router = useRouter();
  const { user, profile, role, signOut } = useSession();
  const unread = useUnreadCount(user?.id);

  const displayName = profile?.fullName ?? 'Minha conta';

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Logo size="sm" />
      </View>

      <View accessibilityRole="menu" style={styles.nav}>
        {items.map((item) => (
          <SidebarItem
            key={item.segment}
            item={item}
            active={item.segment === activeSegment}
            onPress={() => router.push(item.href as never)}
          />
        ))}
        <SidebarItem
          item={NOTIFICATIONS_ITEM}
          active={activeSegment === NOTIFICATIONS_ITEM.segment}
          badge={unread}
          onPress={() => router.push('/notificacoes')}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.account}>
          <Avatar name={displayName} size="sm" shape={role === 'EMPLOYER' ? 'rounded' : 'circle'} />
          <View style={styles.accountText}>
            <AppText variant="caption" numberOfLines={1}>
              {displayName}
            </AppText>
            <AppText variant="caption" subtle numberOfLines={1}>
              {role === 'EMPLOYER' ? 'Empregador' : 'Trabalhador'}
            </AppText>
          </View>
        </View>
        <SidebarItem
          item={{
            segment: 'sair',
            href: '#',
            label: 'Sair',
            icon: 'log-out-outline',
            iconActive: 'log-out',
          }}
          active={false}
          onPress={() => void signOut()}
        />
      </View>
    </View>
  );
}

function SidebarItem({
  item,
  active,
  badge = 0,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const { hovered, focused, handlers } = useInteractionState();
  const tint = active ? colors.primaryText : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityLabel={badge > 0 ? `${item.label}, ${badge} não lidas` : item.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      {...handlers}
      style={[
        styles.item,
        hovered && !active && styles.itemHovered,
        active && styles.itemActive,
        focused && styles.itemFocused,
      ]}
    >
      <Ionicons name={active ? item.iconActive : item.icon} size={19} color={tint} />
      <AppText variant={active ? 'smallStrong' : 'small'} color={tint} numberOfLines={1} style={styles.itemLabel}>
        {item.label}
      </AppText>
      {badge > 0 ? (
        <View style={styles.badge}>
          <AppText variant="caption" color={colors.textInverse}>
            {badge > 9 ? '9+' : badge}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: layout.sidebarWidth,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  brand: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xl },
  nav: { flex: 1, gap: spacing.xxs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemLabel: { flex: 1 },
  itemHovered: { backgroundColor: colors.surfaceAlt },
  itemActive: { backgroundColor: colors.primarySoft },
  itemFocused: { borderColor: colors.focus },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  accountText: { flex: 1 },
});
