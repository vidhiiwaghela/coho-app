import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Unified Navy + Light Beige (#EFE4CC) Design System
        bg: "var(--bg)",
        card: "var(--card)",
        surface: "var(--surface)",
        border: "var(--border)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "on-accent": "var(--on-accent)",
        "tier-gold": "var(--tier-gold)",
        "tier-silver": "var(--tier-silver)",
        "tier-bronze": "var(--tier-bronze)",
        success: "var(--success)",
        info: "var(--info)",
        pending: "var(--pending)",
        urgent: "var(--urgent)",

        // Compatibility aliases
        appBackground: "var(--bg)",
        cardSurface: "var(--card)",
        elevatedSurface: "var(--surface)",
        borderDivider: "var(--border)",
        borderSubtle: "var(--border)",
        primaryText: "var(--text)",
        secondaryText: "var(--text-secondary)",
        primaryButton: "var(--accent)",
        primaryAccent: "var(--accent)",
        primaryAccentHover: "var(--accent-hover)",
        accentButton: "var(--accent)",
        secondaryButton: "var(--accent-hover)",
        statusSuccess: "var(--success)",
        statusWarning: "var(--info)",
        statusFailure: "var(--urgent)",

        "app-background": "var(--bg)",
        "card-surface": "var(--card)",
        "elevated-surface": "var(--surface)",
        "border-divider": "var(--border)",
        "primary-text": "var(--text)",
        "secondary-text": "var(--text-secondary)",
        "primary-button": "var(--accent)",
        "accent-button": "var(--accent)",
        "secondary-button": "var(--accent-hover)",
        "status-success": "var(--success)",
        "status-warning": "var(--info)",
        "status-failure": "var(--urgent)",

        bgBase: "var(--bg)",
        surfaceDark: "var(--card)",
        surfaceDark2: "var(--surface)",
        surfaceDark3: "var(--border)",
        accentLime: "var(--accent)",
        accentLimeHover: "var(--accent-hover)",
        textPrimary: "var(--text)",
        textInverse: "var(--on-accent)",
        textMuted: "var(--text-secondary)",
        statusPending: "var(--pending)",
        statusDanger: "var(--urgent)",
      },
      borderRadius: {
        card: "16px",
        "card-lg": "24px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        floating: "none",
        "card-soft": "none",
      },
    },
  },
  plugins: [],
};
export default config;

