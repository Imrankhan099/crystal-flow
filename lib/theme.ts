import { Platform } from 'react-native';

export const Colors = {
  background: '#F2F6FF',
  backgroundAlt: '#EAF1FF',
  surface: '#FFFFFF',
  glass: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.85)',
  glassShadow: 'rgba(99,120,170,0.18)',

  textPrimary: '#1A2240',
  textSecondary: '#5A6A8A',
  textTertiary: '#9AA6C2',
  textOnAccent: '#FFFFFF',

  blue: {
    50: '#E8F1FF', 100: '#D0E2FF', 200: '#A8C8FF', 300: '#7BA9FF', 400: '#5A8DFF',
    500: '#3D72F5', 600: '#2A5AE0', 700: '#1F44B8', 800: '#16338A',
  },
  cyan: {
    50: '#E4FBFF', 100: '#C2F3FF', 200: '#8FE8FF', 300: '#5BDCFF', 400: '#34C9F0',
    500: '#1FB4DC', 600: '#1293B8', 700: '#0C7290',
  },
  purple: {
    50: '#F3ECFF', 100: '#E4D4FF', 200: '#CDB2FF', 300: '#B68EFF', 400: '#9C72F0',
    500: '#8256E0', 600: '#6839C8', 700: '#4E22A0',
  },
  success: { 400: '#4FD8B5', 500: '#2FC09A', 600: '#1F9C7E' },
  warning: { 400: '#FFC56E', 500: '#FFA940', 600: '#E08800' },
  error: { 400: '#FF8E8E', 500: '#F56C6C', 600: '#D84848' },

  crystalBlue: '#5BDCFF',
  crystalCyan: '#34E0F0',
  crystalPurple: '#B68EFF',
  energy: '#5BDCFF',
  energyGlow: '#A8E8FF',
};

export type Gradient = readonly [string, string, ...string[]];

export const Gradients = {
  primary: ['#7BA9FF', '#9C72F0'] as const,
  primarySoft: ['#A8C8FF', '#CDB2FF'] as const,
  cyanBlue: ['#5BDCFF', '#3D72F5'] as const,
  purpleCyan: ['#B68EFF', '#5BDCFF'] as const,
  background: ['#F2F6FF', '#EAF1FF'] as const,
  backgroundHero: ['#E8F1FF', '#F3ECFF'] as const,
  crystal: ['#A8E8FF', '#9C72F0'] as const,
  energy: ['#8FE8FF', '#5A8DFF'] as const,
  success: ['#4FD8B5', '#34C9F0'] as const,
  warm: ['#FFC56E', '#FF8EB4'] as const,
} satisfies Record<string, Gradient>;

export const Radius = { xs: 8, sm: 12, md: 18, lg: 24, xl: 32, pill: 999 };
export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const Shadows = {
  card: Platform.select({
    ios: { shadowColor: Colors.glassShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24 },
    android: { elevation: 6 },
    default: {},
  }),
  soft: Platform.select({
    ios: { shadowColor: Colors.glassShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
    android: { elevation: 3 },
    default: {},
  }),
  glow: Platform.select({
    ios: { shadowColor: Colors.crystalCyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 18 },
    android: { elevation: 0 },
    default: {},
  }),
};

export const Typography = {
  hero: { fontFamily: 'Inter-Bold', fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontFamily: 'Inter-Bold', fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontFamily: 'Inter-Bold', fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: 'Inter-SemiBold', fontSize: 17, lineHeight: 22 },
  body: { fontFamily: 'Inter-Regular', fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: 'Inter-Regular', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'Inter-Medium', fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  tab: { fontFamily: 'Inter-SemiBold', fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
  number: { fontFamily: 'Inter-Bold', fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
};
