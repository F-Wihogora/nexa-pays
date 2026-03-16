/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins_400Regular'],
        'light': ['Poppins_300Light'],
        'medium': ['Poppins_500Medium'],
        'semibold': ['Poppins_600SemiBold'],
        'bold': ['Poppins_700Bold'],
        'extrabold': ['Poppins_800ExtraBold'],
        'black': ['Poppins_900Black'],
      },
    },
  },
  plugins: [],
};
