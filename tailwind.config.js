/** 
 * @type {import('tailwindcss').Config} 
 * Tailwind CSS configuration file for customizing styling options.
 */

module.exports = {
  /**
   * Defines the files Tailwind should scan for class usage.
   * This ensures unused styles are purged in production for optimized performance.
   */
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    /**
     * Extend the default theme with custom styles.
     * If you need to customize colors, spacing, typography, etc., 
     * add them inside the `extend` object.
     */
    extend: {},
  },

  plugins: [
    require('@tailwindcss/forms'), // Provides better default styling for form elements
    require('@tailwindcss/typography'), // Adds beautiful typography utilities (useful for blog posts)
    require('@tailwindcss/aspect-ratio') // Enables easy aspect ratio management for images and videos
  ],
};



