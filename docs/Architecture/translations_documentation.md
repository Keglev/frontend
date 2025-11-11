# JSON Translations Documentation

## Overview
This document provides an overview of the translation files used in the StockEase project. The translation files are located in the `src/locales/` directory and contain the language-specific text used throughout the application.

## File Locations
- `src/locales/en.json` - English translations
- `src/locales/de.json` - German translations
- `src/locales/help_en.json` - Help translations (English)
- `src/locales/help_de.json` - Help translations (German)

## Structure of Translation Files
Each JSON file contains structured key-value pairs that correspond to the various UI components and messages in the application. Below is an explanation of the main sections of each translation file.

---

## `src/locales/en.json`
### Sections:
- **home**: Landing page text and introduction
- **loading**: Loading text displayed during data retrieval
- **error**: General error messages
- **login**: Login page text, including form labels and errors
- **userDashboard**: User dashboard content
- **errorBoundary**: Error handling messages
- **header**: Navigation bar elements
- **adminDashboard**: Admin dashboard content
- **buttons**: Button labels used throughout the app
- **footer**: Footer text
- **addProduct**: Product addition workflow messages
- **changeProduct**: Product modification messages
- **deleteProduct**: Product deletion messages and confirmation prompts
- **listStock**: Stock listing page content
- **productDetails**: Detailed product view text
- **searchProduct**: Product search functionality messages

---

## `src/locales/de.json`
### Sections:
- **home**: German translations for the landing page
- **loading**: Loading message in German
- **error**: General error messages in German
- **login**: German translations for the login page
- **userDashboard**: Translations for user dashboard
- **errorBoundary**: Error messages in German
- **header**: Navigation bar elements in German
- **adminDashboard**: Admin dashboard content in German
- **buttons**: German button labels
- **footer**: Footer text in German
- **addProduct**: Messages for adding products
- **changeProduct**: Messages for modifying products
- **deleteProduct**: Confirmation prompts and messages for deleting products
- **listStock**: German stock listing page content
- **productDetails**: Product details messages in German
- **searchProduct**: Product search messages in German

---

## `src/locales/help_en.json`
### Sections:
- **login**: Instructions on how to log in and test the system
- **adminDashboard**: Help information for the admin dashboard
- **userDashboard**: Help information for the user dashboard
- **addProduct**: Step-by-step guide to adding a product
- **deleteProduct**: Instructions for deleting products
- **changeProduct**: Instructions for modifying product details
- **searchProduct**: Guide on how to search for products
- **listStock**: Explanation of the stock listing page
- **button**: Label for the help button
- **helpModal**: Closing button label for the help modal

---

## `src/locales/help_de.json`
### Sections:
- **login**: German instructions for logging in
- **adminDashboard**: German help content for admin dashboard
- **userDashboard**: German help content for user dashboard
- **addProduct**: Guide in German for adding a product
- **deleteProduct**: Instructions in German for deleting products
- **changeProduct**: Instructions in German for modifying products
- **searchProduct**: Guide in German on searching for products
- **listStock**: Explanation of the stock listing page in German
- **button**: Label for the help button in German
- **helpModal**: Closing button label for the help modal in German

---

## How to Use This Documentation
1. **Understanding the structure**: Each section within the translation files corresponds to a specific page or feature in the application.
2. **Modifying translations**: To change translations, locate the appropriate key in the corresponding JSON file and modify its value.
3. **Adding new translations**: Follow the existing structure and add new keys as needed, ensuring consistency across all languages.
4. **Using translations in the application**: The translations are managed using `i18next`. Each key is accessed within React components using the `t()` function.

---

## Best Practices
- **Keep JSON structure consistent** across languages to prevent missing translations.
- **Use clear and concise text** in all translations to improve usability.
- **Regularly review translations** for accuracy and completeness, especially when adding new features.
- **Ensure placeholders are correctly formatted** (e.g., `{{name}}` for dynamic content).

This documentation serves as a reference guide for managing and maintaining translations within the StockEase project.


