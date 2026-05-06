// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        // Colores principales (unificados con globals.css)
        bg:     '#E5E7EB', // Slightly darker light gray background
        panel:  '#3E2723', // Dark brown panels
        border: '#E5E7EB', // Light borders
        'border-light': '#D1D5DB',

        // Colores de acción (Naranja Industrial)
        primary:      '#F97316', // Orange-500
        'primary-dark': '#EA580C', // Orange-600
        success:      '#10B981', // Emerald-500 (Safe)
        warning:      '#EAB308', // Yellow-500 (Caution)
        danger:       '#EF4444', // Red-500 (Emergency)
        info:         '#3B82F6', // Blue-500 (Mandatory)
        purple:       '#8B5CF6',

        // Colores de texto
        text:         '#111827', // Dark gray text
        'text-secondary': '#4B5563',
        muted:        '#9CA3AF',
        dim:          '#F9FAFB', // Very light for dim areas
      },
    },
  },
  plugins: [],
}

export default config
