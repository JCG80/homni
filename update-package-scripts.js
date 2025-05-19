
const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add or update scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "seed:users": "ts-node scripts/seedTestUsers.ts",
  "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
  "lint:fix": "eslint --ext .js,.jsx,.ts,.tsx src --fix",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css}\"",
  "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css}\"",
  "test:e2e": "playwright test",
  "deps:check": "npm ls",
  "deps:check:eslint": "npm ls @typescript-eslint/eslint-plugin @typescript-eslint/parser"
};

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Package.json scripts updated successfully!');
