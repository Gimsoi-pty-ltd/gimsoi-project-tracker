/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gimsoi-navy': '#002D62',
                'gimsoi-blue': '#1A75FF',
            }
        },
    },
    plugins: [],
}
