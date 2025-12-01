export const colors = {
  primary: "#2563eb",
  primaryLight: "#3b82f6",
  primaryDark: "#1e40af",

  secondary: "#6b7280",
  secondaryLight: "#9ca3af",
  secondaryDark: "#4b5563",

  danger: "#dc2626",
  warning: "#f59e0b",
  success: "#10b981",

  white: "#ffffff",
  black: "#000000",

  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 26,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 22,
    fontWeight: "600" as const,
  },

  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },

  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
};

export const shadows = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  strong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
};

export default theme;
