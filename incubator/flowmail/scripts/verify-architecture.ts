#!/usr/bin/env tsx

/**
 * Architecture Verification Script
 * 
 * This script verifies that the FlowMail application follows the modular
 * architecture pattern with proper feature isolation and structure.
 */

import { glob } from 'glob';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';
import { z } from 'zod';

// ============================================================================
// Types and Schemas
// ============================================================================

const RouteConfigSchema = z.object({
  path: z.string(),
  component: z.string(),
  exact: z.boolean().optional(),
});

const NavigationItemSchema = z.object({
  path: z.string(),
  label: z.string(),
  icon: z.string(),
  order: z.number(),
});

const FeatureConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  standalone: z.boolean().optional(),
  routes: z.array(RouteConfigSchema),
  navigation: z.array(NavigationItemSchema),
  api: z.object({
    endpoints: z.array(z.string()),
  }).optional(),
  storage: z.object({
    type: z.enum(['localStorage', 'database']),
    key: z.string().optional(),
  }).optional(),
  capabilities: z.array(z.string()).optional(),
  dependencies: z.array(z.string()),
});

type FeatureConfig = z.infer<typeof FeatureConfigSchema>;

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string[];
}

interface VerificationReport {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  results: CheckResult[];
}

// ============================================================================
// Configuration
// ============================================================================

const FEATURES_DIR = 'client/src/features';
const ROOT_DIR = process.cwd();

// ============================================================================
// Utility Functions
// ============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m',
  };

  const symbols = {
    info: 'ℹ',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  };

  console.log(`${colors[type]}${symbols[type]} ${message}${colors.reset}`);
}

function getFeatureDirectories(): string[] {
  const featuresPath = join(ROOT_DIR, FEATURES_DIR);
  if (!existsSync(featuresPath)) {
    return [];
  }

  const pattern = join(featuresPath, '*');
  const matches = glob.sync(pattern, { ignore: ['**/node_modules/**'] });
  
  return matches.filter(path => {
    const stat = statSync(path);
    return stat.isDirectory();
  });
}

// ============================================================================
// Check Functions
// ============================================================================

/**
 * Check 1: Feature Structure Validation
 * Verifies each feature has required files and follows naming conventions
 */
function checkFeatureStructure(): CheckResult {
  const features = getFeatureDirectories();
  const issues: string[] = [];

  if (features.length === 0) {
    return {
      name: 'Feature Structure',
      passed: false,
      message: `No features found in ${FEATURES_DIR}`,
      details: [],
    };
  }

  for (const featurePath of features) {
    const featureName = relative(join(ROOT_DIR, FEATURES_DIR), featurePath);
    
    // Check for index.ts
    const indexPath = join(featurePath, 'index.ts');
    if (!existsSync(indexPath)) {
      issues.push(`Feature '${featureName}' is missing required file: index.ts`);
    }

    // Check naming convention (kebab-case)
    if (!/^[a-z]+(-[a-z]+)*$/.test(featureName)) {
      issues.push(`Feature '${featureName}' does not follow kebab-case naming convention`);
    }
  }

  return {
    name: 'Feature Structure',
    passed: issues.length === 0,
    message: issues.length === 0 
      ? `All ${features.length} features have proper structure`
      : `Found ${issues.length} structure issue(s)`,
    details: issues,
  };
}

/**
 * Check 2: Import Pattern Analysis
 * Detects cross-feature internal imports that bypass feature index
 */
function checkImportPatterns(): CheckResult {
  const issues: string[] = [];
  const dependencyGraph = new Map<string, Set<string>>();
  
  // Find all TypeScript files in features
  const pattern = join(ROOT_DIR, FEATURES_DIR, '**/*.{ts,tsx}');
  const files = glob.sync(pattern, { 
    ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.test.tsx'] 
  });

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(ROOT_DIR, file);
    
    // Determine which feature this file belongs to
    const featureMatch = relativePath.match(/features\/([^/]+)/);
    const currentFeature = featureMatch ? featureMatch[1] : null;

    lines.forEach((line, index) => {
      // Match import statements
      const importMatch = line.match(/import\s+.*\s+from\s+['"](.+)['"]/);
      if (!importMatch) return;

      const importPath = importMatch[1];
      
      // Check for imports from other features' internals
      // Pattern 1: ../../features/other-feature/components/X
      const absoluteFeatureMatch = importPath.match(/\.\.\/\.\.\/features\/([^/]+)\/(.+)/);
      if (absoluteFeatureMatch) {
        const [, targetFeature, subPath] = absoluteFeatureMatch;
        
        // If importing from another feature's internals (not just the feature folder)
        if (targetFeature !== currentFeature && subPath && !subPath.startsWith('index')) {
          issues.push(
            `${relativePath}:${index + 1} - Cross-feature internal import: ${importPath}`
          );
          
          // Track dependency for graph
          if (currentFeature) {
            if (!dependencyGraph.has(currentFeature)) {
              dependencyGraph.set(currentFeature, new Set());
            }
            dependencyGraph.get(currentFeature)!.add(targetFeature);
          }
        }
      }
      
      // Pattern 2: ../other-feature/components/X (from within features directory)
      const relativeFeatureMatch = importPath.match(/^\.\.\/([^/.]+)\/(.+)/);
      if (relativeFeatureMatch && currentFeature) {
        const [, targetFeature, subPath] = relativeFeatureMatch;
        
        // Skip if targetFeature is not a valid directory name (e.g., '..')
        if (targetFeature === '..' || targetFeature === '.') {
          return;
        }
        
        // Check if target is actually a feature directory (not a shared directory)
        const targetPath = join(ROOT_DIR, FEATURES_DIR, targetFeature);
        const isFeatureDir = existsSync(targetPath) && statSync(targetPath).isDirectory();
        
        // Only flag if it's a feature directory and not the same feature
        if (isFeatureDir && targetFeature !== currentFeature && subPath && !subPath.startsWith('index')) {
          issues.push(
            `${relativePath}:${index + 1} - Cross-feature internal import: ${importPath}`
          );
          
          // Track dependency for graph
          if (!dependencyGraph.has(currentFeature)) {
            dependencyGraph.set(currentFeature, new Set());
          }
          dependencyGraph.get(currentFeature)!.add(targetFeature);
        }
      }
    });
  }

  // Add dependency graph to details if there are dependencies
  const graphDetails: string[] = [];
  if (dependencyGraph.size > 0) {
    graphDetails.push('');
    graphDetails.push('Feature Dependency Graph:');
    for (const [feature, deps] of dependencyGraph.entries()) {
      if (deps.size > 0) {
        graphDetails.push(`  ${feature} → ${Array.from(deps).join(', ')}`);
      }
    }
  }

  return {
    name: 'Import Patterns',
    passed: issues.length === 0,
    message: issues.length === 0
      ? 'No cross-feature internal imports detected'
      : `Found ${issues.length} cross-feature import(s)`,
    details: [...issues, ...graphDetails],
  };
}

/**
 * Check 3: Configuration Validation
 * Validates feature configurations against schema
 */
function checkConfiguration(): CheckResult {
  const features = getFeatureDirectories();
  const issues: string[] = [];
  const featureIds = new Set<string>();
  const routePaths = new Map<string, string>();

  for (const featurePath of features) {
    const featureName = relative(join(ROOT_DIR, FEATURES_DIR), featurePath);
    const indexPath = join(featurePath, 'index.ts');

    if (!existsSync(indexPath)) {
      continue; // Already reported in structure check
    }

    try {
      const content = readFileSync(indexPath, 'utf-8');
      
      // Try to extract feature config (basic pattern matching)
      const configMatch = content.match(/export\s+const\s+\w+Feature\s*[:=]\s*{[\s\S]*?};/);
      
      if (!configMatch) {
        issues.push(`Feature '${featureName}' does not export a feature configuration object`);
        continue;
      }

      const configText = configMatch[0];
      
      // Check for required fields
      const requiredFields = ['id:', 'name:', 'version:', 'description:', 'routes:', 'navigation:', 'dependencies:'];
      const missingFields = requiredFields.filter(field => !configText.includes(field));
      
      if (missingFields.length > 0) {
        issues.push(
          `Feature '${featureName}' configuration missing fields: ${missingFields.join(', ')}`
        );
      }

      // Extract ID for duplicate check
      const idMatch = configText.match(/id:\s*['"]([^'"]+)['"]/);
      if (idMatch) {
        const id = idMatch[1];
        if (featureIds.has(id)) {
          issues.push(`Duplicate feature ID: '${id}'`);
        }
        featureIds.add(id);

        // Validate ID follows kebab-case
        if (!/^[a-z]+(-[a-z]+)*$/.test(id)) {
          issues.push(`Feature '${featureName}' ID '${id}' does not follow kebab-case convention`);
        }
      }

      // Extract routes array and check for unique paths across features
      const routesMatch = configText.match(/routes:\s*\[([\s\S]*?)\]/);
      if (routesMatch) {
        const routesText = routesMatch[1];
        const pathMatches = routesText.matchAll(/path:\s*['"]([^'"]+)['"]/g);
        
        for (const match of pathMatches) {
          const path = match[1];
          if (routePaths.has(path)) {
            const existingFeature = routePaths.get(path);
            if (existingFeature !== featureName) {
              issues.push(
                `Duplicate route path '${path}' in features '${existingFeature}' and '${featureName}'`
              );
            }
          } else {
            routePaths.set(path, featureName);
          }
        }
      }

      // Validate version format (basic semver check)
      const versionMatch = configText.match(/version:\s*['"]([^'"]+)['"]/);
      if (versionMatch) {
        const version = versionMatch[1];
        if (!/^\d+\.\d+\.\d+$/.test(version)) {
          issues.push(`Feature '${featureName}' version '${version}' is not valid semver (expected X.Y.Z)`);
        }
      }
    } catch (error) {
      issues.push(`Feature '${featureName}' configuration could not be parsed: ${error}`);
    }
  }

  return {
    name: 'Configuration Validation',
    passed: issues.length === 0,
    message: issues.length === 0
      ? `All ${features.length} feature configurations are valid`
      : `Found ${issues.length} configuration issue(s)`,
    details: issues,
  };
}

/**
 * Check 4: Export Completeness
 * Verifies that all components used in App.tsx are exported from feature index
 */
function checkExportCompleteness(): CheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Read App.tsx
  const appPath = join(ROOT_DIR, 'client/src/App.tsx');
  if (!existsSync(appPath)) {
    return {
      name: 'Export Completeness',
      passed: false,
      message: 'App.tsx not found',
      details: ['Cannot verify export completeness without App.tsx'],
    };
  }

  const appContent = readFileSync(appPath, 'utf-8');
  
  // Extract imports from features
  const featureImportPattern = /import\s+{([^}]+)}\s+from\s+['"]\.\/features\/([^'"]+)['"]/g;
  const featureImports = new Map<string, Set<string>>();
  
  let match;
  while ((match = featureImportPattern.exec(appContent)) !== null) {
    const imports = match[1].split(',').map(i => i.trim());
    const featurePath = match[2];
    
    if (!featureImports.has(featurePath)) {
      featureImports.set(featurePath, new Set());
    }
    
    imports.forEach(imp => featureImports.get(featurePath)!.add(imp));
  }

  // Check each feature's exports
  for (const [featurePath, importedNames] of featureImports.entries()) {
    const indexPath = join(ROOT_DIR, 'client/src/features', featurePath, 'index.ts');
    
    if (!existsSync(indexPath)) {
      issues.push(`Feature '${featurePath}' index.ts not found, but imports are used in App.tsx`);
      continue;
    }

    const indexContent = readFileSync(indexPath, 'utf-8');
    
    // Check each imported name is exported
    for (const importedName of importedNames) {
      // Check for export patterns
      const exportPatterns = [
        new RegExp(`export\\s+{[^}]*\\b${importedName}\\b[^}]*}`),
        new RegExp(`export\\s+\\*\\s+from`),
        new RegExp(`export\\s+{[^}]*default\\s+as\\s+${importedName}[^}]*}`),
        new RegExp(`export\\s+const\\s+${importedName}\\s*[=:]`),
      ];
      
      const isExported = exportPatterns.some(pattern => pattern.test(indexContent));
      
      if (!isExported) {
        issues.push(
          `Component '${importedName}' imported from '${featurePath}' in App.tsx but not exported from feature index`
        );
      }
    }

    // Check for unused exports (warning only)
    const exportMatches = indexContent.matchAll(/export\s+(?:default\s+)?(?:const\s+)?(\w+)|export\s+{\s*([^}]+)\s*}/g);
    const exportedNames = new Set<string>();
    
    for (const match of exportMatches) {
      if (match[1]) {
        exportedNames.add(match[1]);
      }
      if (match[2]) {
        match[2].split(',').forEach(name => {
          const cleaned = name.trim().split(/\s+as\s+/)[0].trim();
          if (cleaned && cleaned !== 'default') {
            exportedNames.add(cleaned);
          }
        });
      }
    }

    // Find exports not used in App.tsx (this is just informational)
    const unusedExports = Array.from(exportedNames).filter(
      name => !importedNames.has(name) && !name.endsWith('Feature') && name !== 'default'
    );
    
    if (unusedExports.length > 0 && unusedExports.length < 10) {
      warnings.push(
        `Feature '${featurePath}' exports ${unusedExports.length} component(s) not used in App.tsx: ${unusedExports.slice(0, 5).join(', ')}${unusedExports.length > 5 ? '...' : ''}`
      );
    }
  }

  return {
    name: 'Export Completeness',
    passed: issues.length === 0,
    message: issues.length === 0
      ? `All imports from features are properly exported`
      : `Found ${issues.length} export issue(s)`,
    details: [...issues, ...warnings.map(w => `⚠️  ${w}`)],
  };
}

/**
 * Check 5: TypeScript Compilation
 * Runs tsc --noEmit to verify type safety
 */
function checkTypeScriptCompilation(): CheckResult {
  try {
    execSync('npx tsc --noEmit', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    return {
      name: 'TypeScript Compilation',
      passed: true,
      message: 'TypeScript compilation successful',
      details: [],
    };
  } catch (error: any) {
    const output = error.stdout || error.stderr || '';
    const errors = output.split('\n').filter((line: string) => line.trim());

    return {
      name: 'TypeScript Compilation',
      passed: false,
      message: 'TypeScript compilation failed',
      details: errors.slice(0, 10), // Limit to first 10 errors
    };
  }
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(results: CheckResult[]): VerificationReport {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return {
    totalChecks: results.length,
    passed,
    failed,
    warnings: 0, // Can be extended for warnings
    results,
  };
}

function printReport(report: VerificationReport): void {
  console.log('\n' + '='.repeat(70));
  console.log('  ARCHITECTURE VERIFICATION REPORT');
  console.log('='.repeat(70) + '\n');

  // Print summary
  console.log(`Total Checks: ${report.totalChecks}`);
  log(`Passed: ${report.passed}`, 'success');
  if (report.failed > 0) {
    log(`Failed: ${report.failed}`, 'error');
  }
  console.log();

  // Print detailed results
  for (const result of report.results) {
    if (result.passed) {
      log(`${result.name}: ${result.message}`, 'success');
    } else {
      log(`${result.name}: ${result.message}`, 'error');
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`  - ${detail}`);
        });
      }
    }
    console.log();
  }

  // Print final status
  console.log('='.repeat(70));
  if (report.failed === 0) {
    log('✨ All checks passed! Architecture is valid.', 'success');
  } else {
    log(`❌ ${report.failed} check(s) failed. Please fix the issues above.`, 'error');
  }
  console.log('='.repeat(70) + '\n');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('\n🔍 Starting architecture verification...\n');

  const results: CheckResult[] = [
    checkFeatureStructure(),
    checkImportPatterns(),
    checkConfiguration(),
    checkExportCompleteness(),
    checkTypeScriptCompilation(),
  ];

  const report = generateReport(results);
  printReport(report);

  // Exit with appropriate code
  process.exit(report.failed > 0 ? 1 : 0);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
