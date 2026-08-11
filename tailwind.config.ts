import type { Config } from 'tailwindcss';

// design_handoff_ai_travel_planner/README.md의 Design Tokens 섹션을 그대로 반영
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF6F1',
        canvas: '#EFE7DC',
        surface: '#FFFFFF',
        ink: '#2B2420',
        'ink-soft': '#7A6F65',
        'ink-faint': '#9A8E80',
        'ink-disabled': '#B9AC9C',
        border: '#E8DFD4',
        section: '#F3EEE5',
        accent: '#C1502E',
        'accent-soft': '#F3E2D8',
        sightseeing: '#5F7A55',
        healing: '#1F7A6C',
        shopping: '#5B4B8A',
        warn: '#8A3B22',
        'warn-bg': '#FBECE6',
      },
      fontFamily: {
        heading: ['var(--font-bitter)', 'serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
