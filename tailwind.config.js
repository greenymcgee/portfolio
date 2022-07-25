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
      fontSize: {
        h1: ['60px', '68px'],
        'h1-sm': ['64px', '72px'],
        'h1-md': ['76px', '76px'],
        'h1-lg': ['88px', '88px'],
        'h1-xl': ['96px', '96px'],
        '2xl': ['24px', '36px'],
        '3xl': ['28px', '40px'],
        '4xl': ['36px', '48px'],
      },
      spacing: { 30: '7.5rem', 60: '15rem' },
    },
    container: { center: true, padding: { DEFAULT: '1rem', lg: '2rem' } },
  },
  plugins: [],
};
