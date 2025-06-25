/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',  // Breakpoint personalizado
      },
      // colors: {
      //   'circulos': '#C1FD35',
      //    'circuloshover': '#A0E529',
      // },
      // animation: {
      //   fadeIn: 'fadeIn 0.3s ease-out forwards',
      //   fadeInUp: 'fadeInUp 0.3s ease-out',
      // },
      // keyframes: {
      //   fadeIn: {
      //     '0%': { opacity: '0', transform: 'scale(0.95)' },
      //     '100%': { opacity: '1', transform: 'scale(1)' },
      //   },
      //   fadeInUp: {
      //     '0%': { opacity: '0', transform: 'translateY(10px)' },
      //     '100%': { opacity: '1', transform: 'translateY(0)' },
      //   },
      // },
    },
  },
  plugins: [],
}
