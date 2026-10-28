export const brandConfig = {
  name: 'CronoAgenda',
  shortName: 'CronoAgenda',
  tagline: 'Organiza hoy, brilla mañana',
  description: 'Organiza tus actividades académicas, consulta tus calificaciones y sigue tu progreso escolar con CronoAgenda.',
  domain: 'cronoagenda.net',
  logo: {
    main: '/Logo circular de Cronoagenda.png',
    favicon: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png',
  },
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  },
  colors: {
    primaryRed: '#C62828',
    darkRed: '#8E1616',
    primaryOrange: '#FF6D00',
    secondaryOrange: '#FF8F00',
    cream: '#FFF8F2',
    white: '#FFFFFF',
    darkBlue: '#14263D',
    gray: '#64748B',
    green: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    success: '#16A34A',
  },
  fonts: {
    heading: "'Manrope', sans-serif",
    body: "'DM Sans', sans-serif",
  },
} as const;

export type BrandConfig = typeof brandConfig;