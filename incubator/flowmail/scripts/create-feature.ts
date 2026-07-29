#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utility functions for name transformations
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toTitleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function validateFeatureName(name: string): boolean {
  // Check if name is in kebab-case format
  const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  return kebabCaseRegex.test(name);
}

function copyDirectory(src: string, dest: string, replacements: Record<string, string>): void {
  // Create destination directory
  mkdirSync(dest, { recursive: true });

  // Read all files and directories in source
  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy directories
      copyDirectory(srcPath, destPath, replacements);
    } else {
      // Copy and process files
      let content = readFileSync(srcPath, 'utf-8');
      
      // Replace all placeholders
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }

      writeFileSync(destPath, content, 'utf-8');
    }
  }
}

function main() {
  // Get feature name from command line arguments
  const featureName = process.argv[2];

  if (!featureName) {
    console.error('❌ Error: Feature name is required');
    console.log('\nUsage: npm run create-feature <feature-name>');
    console.log('Example: npm run create-feature my-new-feature');
    process.exit(1);
  }

  // Validate feature name (must be kebab-case)
  if (!validateFeatureName(featureName)) {
    console.error('❌ Error: Feature name must be in kebab-case format');
    console.log('Examples: my-feature, user-profile, data-export');
    console.log(`Invalid: ${featureName}`);
    process.exit(1);
  }

  // Define paths
  const templateDir = join(__dirname, 'templates', 'feature-template');
  const featuresDir = join(__dirname, '..', 'client', 'src', 'features');
  const targetDir = join(featuresDir, featureName);

  // Check if feature already exists
  try {
    statSync(targetDir);
    console.error(`❌ Error: Feature '${featureName}' already exists`);
    process.exit(1);
  } catch {
    // Feature doesn't exist, continue
  }

  // Prepare replacements
  const replacements = {
    '{{FEATURE_ID}}': featureName,
    '{{FEATURE_NAME}}': toTitleCase(featureName),
    '{{FEATURE_NAME_PASCAL}}': toPascalCase(featureName),
    '{{FEATURE_NAME_CAMEL}}': toCamelCase(featureName),
  };

  console.log('🚀 Creating new feature...');
  console.log(`   Name: ${toTitleCase(featureName)}`);
  console.log(`   ID: ${featureName}`);
  console.log(`   Location: client/src/features/${featureName}`);
  console.log('');

  // Copy template to features directory
  copyDirectory(templateDir, targetDir, replacements);

  console.log('✅ Feature created successfully!');
  console.log('');
  console.log('Next steps:');
  console.log(`1. Add feature to App.tsx:`);
  console.log(`   import { ${toPascalCase(featureName)}Page, ${toCamelCase(featureName)}Feature } from './features/${featureName}';`);
  console.log('');
  console.log('2. Add route to your router:');
  console.log(`   <Route path="/${featureName}" component={${toPascalCase(featureName)}Page} />`);
  console.log('');
  console.log('3. Start building your feature in:');
  console.log(`   client/src/features/${featureName}/`);
}

main();
