export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#a78bfa',
                    DEFAULT: '#7c3aed',
                    dark: '#6d28d9',
                },
                dark: {
                    bg: '#0f172a',
                    card: '#1e293b',
                }
            },
            borderRadius: {
                'xl': '0.75rem',
            }
        },
    },
    plugins: [],
}
