import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0EA5E9',
                    hover: '#0284C7',
                    active: '#0369A1'
                },
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                background: '#0F172A',
                surface: '#1E293B',
                border: '#334155'
            }
        }
    },
    plugins: []
}
export default config
