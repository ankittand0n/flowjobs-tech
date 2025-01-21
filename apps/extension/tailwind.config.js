const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const sharedConfig = require('../../libs/ui/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    join(__dirname, 'src/**/*.{js,jsx,ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
}; 