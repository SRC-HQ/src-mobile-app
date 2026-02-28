export const theme = {
  colors: {
    primary: '#b6b0ff',
    secondary: '#5b5880',
    background: '#100E12',
    panel: '#1a1a2e',
    card: '#252540',
    accent: '#b6b0ff',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4444',
    white: '#ffffff',
    text: {
      primary: '#ffffff',
      secondary: '#b6b0ff',
      muted: '#8b8b8b',
    },
  },
  fonts: {
    regular: 'SpaceMono-Regular',
    bold: 'SpaceMono-Bold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
} as const

export type Theme = typeof theme
