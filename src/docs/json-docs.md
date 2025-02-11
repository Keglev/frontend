# JSON Configuration Documentation

This document provides an overview of the JSON configuration files used in this project. Since JSON does not support native comments, this file serves as documentation for the structure and purpose of each JSON file.

---

## **1. tsconfig.app.json**
### **Purpose:**
Defines the TypeScript compiler settings specifically for the application.

### **Key Settings:**
- **`tsBuildInfoFile`**: Stores incremental build information to speed up future builds.
- **`target`**: Specifies ECMAScript version compatibility (`ES2020`).
- **`lib`**: Includes DOM-related APIs for web development.
- **`module`**: Uses `ESNext` module resolution for modern JavaScript.
- **`moduleResolution`**: `bundler` ensures compatibility with module bundlers like Vite.
- **`allowImportingTsExtensions`**: Allows importing TypeScript files with explicit extensions.
- **`isolatedModules`**: Enables module isolation to improve performance and prevent errors.
- **`noEmit`**: Prevents outputting `.js` files, ensuring TypeScript is only used for type checking.
- **`jsx`**: Uses React JSX transformation (`react-jsx`).
- **Linting Options:** Enforces strict type checking, prevents unused variables, and ensures safer code practices.
- **`include`**: Includes all TypeScript files inside the `src` directory.

---

## **2. tsconfig.json**
### **Purpose:**
Acts as the root TypeScript configuration file, referencing other configuration files.

### **Key Settings:**
- **`files`**: Empty, meaning it does not compile any files directly.
- **`references`**: References `tsconfig.app.json` (application configuration) and `tsconfig.node.json` (Node.js configuration).
  - Ensures modular compilation and improves performance.
  - Supports project-wide type checking without compiling unnecessary files.

---

## **3. tsconfig.node.json**
### **Purpose:**
Defines TypeScript compiler settings for Node.js-related files, such as build scripts or Vite configurations.

### **Key Settings:**
- **`tsBuildInfoFile`**: Stores incremental build information for Node.js scripts.
- **`target`**: Uses `ES2022` to support modern JavaScript features.
- **`lib`**: Includes `ES2023` features for the latest ECMAScript functionality.
- **`module`**: Uses `ESNext` module resolution for improved module compatibility.
- **`moduleResolution`**: Uses `bundler` for module management with Vite.
- **`allowImportingTsExtensions`**: Allows importing `.ts` files with explicit extensions.
- **`isolatedModules`**: Ensures each module is compiled separately, reducing build errors.
- **`noEmit`**: Prevents output files from being generated.
- **Linting Options:** Similar to `tsconfig.app.json`, enforces strict type safety and prevents common TypeScript pitfalls.
- **`include`**: Only includes `vite.config.ts`, as this configuration is specific to the build system.

---

### **Conclusion:**
These JSON configuration files ensure that TypeScript is properly configured for both frontend application development and backend build processes. The project structure follows best practices for modular and scalable TypeScript development.

