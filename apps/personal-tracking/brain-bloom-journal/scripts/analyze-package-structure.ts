#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface FileInfo {
  relativePath: string;
  fullPath: string;
  size: number;
  hash: string;
}

interface PackageAnalysis {
  name: string;
  packagePath: string;
  srcPath: string | null;
  files: FileInfo[];
  hasNodeModules: boolean;
  hasPackageJson: boolean;
  isEmpty: boolean;
}

interface ConflictInfo {
  fileName: string;
  packagePath: string;
  srcPath: string;
  conflictType: 'identical' | 'different';
  packageHash: string;
  srcHash: string;
}

interface AnalysisReport {
  uniquePackages: PackageAnalysis[];
  conflictingPackages: PackageAnalysis[];
  conflicts: ConflictInfo[];
  emptyPackages: string[];
  summary: {
    totalPackages: number;
    totalFiles: number;
    totalConflicts: number;
    identicalConflicts: number;
    differentConflicts: number;
  };
}

function getFileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return '';
  }
}

function getAllFiles(dir: string, baseDir: string = dir): FileInfo[] {
  const files: FileInfo[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules directories
      if (entry.name === 'node_modules') {
        continue;
      }
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        relativePath,
        fullPath,
        size: fs.statSync(fullPath).size,
        hash: getFileHash(fullPath)
      });
    }
  }
  
  return files;
}

function analyzePackage(packageName: string): PackageAnalysis {
  const packagePath = path.join('packages', packageName);
  const packageSrcPath = path.join(packagePath, 'src');
  
  // Determine corresponding src path
  let srcPath: string | null = null;
  if (packageName === 'ui') {
    srcPath = path.join('src', 'components', 'ui');
  } else if (['hooks', 'services', 'styles', 'types', 'utils'].includes(packageName)) {
    srcPath = path.join('src', packageName);
  } else if (['design-tokens', 'features'].includes(packageName)) {
    srcPath = path.join('src', packageName);
  }
  
  const files = getAllFiles(packageSrcPath, packageSrcPath);
  const hasNodeModules = fs.existsSync(path.join(packagePath, 'node_modules'));
  const hasPackageJson = fs.existsSync(path.join(packagePath, 'package.json'));
  const isEmpty = files.length === 0;
  
  return {
    name: packageName,
    packagePath: packageSrcPath,
    srcPath,
    files,
    hasNodeModules,
    hasPackageJson,
    isEmpty
  };
}

function detectConflicts(packageAnalysis: PackageAnalysis): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  
  if (!packageAnalysis.srcPath || !fs.existsSync(packageAnalysis.srcPath)) {
    return conflicts;
  }
  
  const srcFiles = getAllFiles(packageAnalysis.srcPath, packageAnalysis.srcPath);
  const srcFileMap = new Map(srcFiles.map(f => [f.relativePath, f]));
  
  for (const packageFile of packageAnalysis.files) {
    const srcFile = srcFileMap.get(packageFile.relativePath);
    
    if (srcFile) {
      const conflictType = packageFile.hash === srcFile.hash ? 'identical' : 'different';
      conflicts.push({
        fileName: packageFile.relativePath,
        packagePath: packageFile.fullPath,
        srcPath: srcFile.fullPath,
        conflictType,
        packageHash: packageFile.hash,
        srcHash: srcFile.hash
      });
    }
  }
  
  return conflicts;
}

function generateReport(): AnalysisReport {
  const packagesDir = 'packages';
  
  if (!fs.existsSync(packagesDir)) {
    throw new Error('packages directory not found');
  }
  
  const packageNames = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  
  const allAnalyses = packageNames.map(analyzePackage);
  
  const uniquePackages: PackageAnalysis[] = [];
  const conflictingPackages: PackageAnalysis[] = [];
  const emptyPackages: string[] = [];
  const allConflicts: ConflictInfo[] = [];
  
  for (const analysis of allAnalyses) {
    if (analysis.isEmpty) {
      emptyPackages.push(analysis.name);
      continue;
    }
    
    const conflicts = detectConflicts(analysis);
    
    if (conflicts.length > 0) {
      conflictingPackages.push(analysis);
      allConflicts.push(...conflicts);
    } else if (analysis.srcPath && fs.existsSync(analysis.srcPath)) {
      // Has corresponding src directory but no conflicts
      conflictingPackages.push(analysis);
    } else {
      // Unique package with no src equivalent
      uniquePackages.push(analysis);
    }
  }
  
  const totalFiles = allAnalyses.reduce((sum, a) => sum + a.files.length, 0);
  const identicalConflicts = allConflicts.filter(c => c.conflictType === 'identical').length;
  const differentConflicts = allConflicts.filter(c => c.conflictType === 'different').length;
  
  return {
    uniquePackages,
    conflictingPackages,
    conflicts: allConflicts,
    emptyPackages,
    summary: {
      totalPackages: packageNames.length,
      totalFiles,
      totalConflicts: allConflicts.length,
      identicalConflicts,
      differentConflicts
    }
  };
}

function printReport(report: AnalysisReport): void {
  console.log('='.repeat(80));
  console.log('PACKAGE CONSOLIDATION ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log();
  
  console.log('SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Packages: ${report.summary.totalPackages}`);
  console.log(`Total Files to Migrate: ${report.summary.totalFiles}`);
  console.log(`Total Conflicts: ${report.summary.totalConflicts}`);
  console.log(`  - Identical Files: ${report.summary.identicalConflicts}`);
  console.log(`  - Different Files: ${report.summary.differentConflicts}`);
  console.log();
  
  if (report.emptyPackages.length > 0) {
    console.log('EMPTY PACKAGES (will be skipped)');
    console.log('-'.repeat(80));
    report.emptyPackages.forEach(pkg => {
      console.log(`  - ${pkg}`);
    });
    console.log();
  }
  
  if (report.uniquePackages.length > 0) {
    console.log('UNIQUE PACKAGES (no conflicts, will be moved)');
    console.log('-'.repeat(80));
    report.uniquePackages.forEach(pkg => {
      console.log(`\n${pkg.name}:`);
      console.log(`  Source: ${pkg.packagePath}`);
      console.log(`  Destination: ${pkg.srcPath || 'TBD'}`);
      console.log(`  Files: ${pkg.files.length}`);
      console.log(`  Has node_modules: ${pkg.hasNodeModules ? 'Yes' : 'No'}`);
      console.log(`  Has package.json: ${pkg.hasPackageJson ? 'Yes' : 'No'}`);
    });
    console.log();
  }
  
  if (report.conflictingPackages.length > 0) {
    console.log('CONFLICTING PACKAGES (will be merged)');
    console.log('-'.repeat(80));
    report.conflictingPackages.forEach(pkg => {
      const pkgConflicts = report.conflicts.filter(c => 
        c.packagePath.startsWith(pkg.packagePath)
      );
      
      console.log(`\n${pkg.name}:`);
      console.log(`  Source: ${pkg.packagePath}`);
      console.log(`  Destination: ${pkg.srcPath || 'TBD'}`);
      console.log(`  Total Files: ${pkg.files.length}`);
      console.log(`  Conflicts: ${pkgConflicts.length}`);
      console.log(`  Has node_modules: ${pkg.hasNodeModules ? 'Yes' : 'No'}`);
      console.log(`  Has package.json: ${pkg.hasPackageJson ? 'Yes' : 'No'}`);
    });
    console.log();
  }
  
  if (report.conflicts.length > 0) {
    console.log('DETAILED CONFLICT LIST');
    console.log('-'.repeat(80));
    
    const identicalConflicts = report.conflicts.filter(c => c.conflictType === 'identical');
    const differentConflicts = report.conflicts.filter(c => c.conflictType === 'different');
    
    if (identicalConflicts.length > 0) {
      console.log('\nIDENTICAL FILES (can be safely skipped):');
      identicalConflicts.forEach(conflict => {
        console.log(`  ✓ ${conflict.fileName}`);
        console.log(`    Package: ${conflict.packagePath}`);
        console.log(`    Src: ${conflict.srcPath}`);
      });
    }
    
    if (differentConflicts.length > 0) {
      console.log('\nDIFFERENT FILES (require manual review):');
      differentConflicts.forEach(conflict => {
        console.log(`  ⚠ ${conflict.fileName}`);
        console.log(`    Package: ${conflict.packagePath}`);
        console.log(`    Src: ${conflict.srcPath}`);
        console.log(`    Package Hash: ${conflict.packageHash}`);
        console.log(`    Src Hash: ${conflict.srcHash}`);
      });
    }
    console.log();
  }
  
  console.log('MIGRATION PLAN');
  console.log('-'.repeat(80));
  console.log('1. Move unique packages:');
  report.uniquePackages.forEach(pkg => {
    console.log(`   - ${pkg.name}: ${pkg.files.length} files`);
  });
  console.log();
  console.log('2. Merge conflicting packages:');
  report.conflictingPackages.forEach(pkg => {
    const pkgConflicts = report.conflicts.filter(c => 
      c.packagePath.startsWith(pkg.packagePath)
    );
    const filesToMove = pkg.files.length - pkgConflicts.filter(c => c.conflictType === 'identical').length;
    console.log(`   - ${pkg.name}: ${filesToMove} files to move, ${pkgConflicts.length} conflicts`);
  });
  console.log();
  console.log('3. Update import paths across codebase');
  console.log('4. Clean up packages directory');
  console.log();
  console.log('='.repeat(80));
}

function saveReportToFile(report: AnalysisReport): void {
  const outputPath = 'migration-analysis.json';
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report saved to: ${outputPath}`);
}

// Main execution
try {
  const report = generateReport();
  printReport(report);
  saveReportToFile(report);
} catch (error) {
  console.error('Error during analysis:', error);
  process.exit(1);
}
