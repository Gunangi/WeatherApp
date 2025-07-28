/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                'inter': ['Inter', 'sans-serif'],
            },
            animation: {
                'gradient-shift': 'gradientShift 15s ease infinite',
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-in-right': 'slideInRight 0.6s ease-out forwards',
                'slide-in-up': 'slideInUp 0.6s ease-out forwards',
                'shimmer': 'shimmer 1.5s infinite',
            },
            keyframes: {
                gradientShift: {
                    '0%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                    '100%': { 'background-position': '0% 50%' },
                },
                fadeIn: {
                    'from': {
                        opacity: '0',
                        transform: 'translateY(20px) scale(0.95)',
                    },
                    'to': {
                        opacity: '1',
                        transform: 'translateY(0) scale(1)',
                    },
                },
                slideInRight: {
                    'from': {
                        opacity: '0',
                        transform: 'translateX(30px)',
                    },
                    'to': {
                        opacity: '1',
                        transform: 'translateX(0)',
                    },
                },
                slideInUp: {
                    'from': {
                        opacity: '0',
                        transform: 'translateY(30px)',
                    },
                    'to': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                shimmer: {
                    '0%': { 'background-position': '-200% 0' },
                    '100%': { 'background-position': '200% 0' },
                },
            },
            backdropBlur: {
                'xs': '2px',
                'sm': '4px',
                'md': '12px',
                'lg': '16px',
                'xl': '24px',
            },
        },
    },
    plugins: [],
}