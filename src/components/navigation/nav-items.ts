import type { Ionicons } from '@expo/vector-icons';
import type { Role } from '@/types/domain';

export interface NavItem {
  /** Segmento da rota, usado para marcar o item ativo. */
  segment: string;
  href: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  /** Fica só na sidebar do desktop; no celular vira o sino do cabeçalho. */
  desktopOnly?: boolean;
}

const WORKER: NavItem[] = [
  { segment: 'inicio', href: '/trabalhador/inicio', label: 'Início', icon: 'home-outline', iconActive: 'home' },
  {
    segment: 'oportunidades',
    href: '/trabalhador/oportunidades',
    label: 'Oportunidades',
    icon: 'search-outline',
    iconActive: 'search',
  },
  {
    segment: 'interesses',
    href: '/trabalhador/interesses',
    label: 'Interesses',
    icon: 'heart-outline',
    iconActive: 'heart',
  },
  { segment: 'perfil', href: '/trabalhador/perfil', label: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];

const EMPLOYER: NavItem[] = [
  { segment: 'inicio', href: '/empregador/inicio', label: 'Início', icon: 'home-outline', iconActive: 'home' },
  {
    segment: 'vagas',
    href: '/empregador/vagas',
    label: 'Minhas vagas',
    icon: 'briefcase-outline',
    iconActive: 'briefcase',
  },
  {
    segment: 'candidatos',
    href: '/empregador/candidatos',
    label: 'Candidatos',
    icon: 'people-outline',
    iconActive: 'people',
  },
  { segment: 'perfil', href: '/empregador/perfil', label: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];

/** Notificações: item de menu no desktop, sino no cabeçalho do celular. */
export const NOTIFICATIONS_ITEM: NavItem = {
  segment: 'notificacoes',
  href: '/notificacoes',
  label: 'Notificações',
  icon: 'notifications-outline',
  iconActive: 'notifications',
  desktopOnly: true,
};

export function navItemsFor(role: Role | null): NavItem[] {
  return role === 'EMPLOYER' ? EMPLOYER : WORKER;
}
