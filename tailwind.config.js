module.exports = {
  mode: 'JIT',
  content: ['./src/**/*.ts', './src/**/*.tsx', './src/**/*.css'],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#212121',
          800: '#373737',
          700: '#4D4D4D',
          600: '#646464',
          500: '#909090',
          400: '#A6A6A6',
          300: '#BCBCBC',
          200: '#D3D3D3',
          100: '#e9e9e9',
        },
      },
      fontFamily: {
        'cormorant-garamond': 'Cormorant Garamond, serif',
      },
    },
    container: { center: true, padding: { DEFAULT: '1rem' } },
  },
  plugins: [],
};
