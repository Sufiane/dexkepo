import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,svelte,ts}'],
  // `class` strategy: the user-controlled theme store toggles a `dark` class on
  // <html>, which lets us opt routes into dark variants explicitly without
  // having to fight the user's OS preference.
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
