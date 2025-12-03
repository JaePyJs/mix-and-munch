#!/usr/bin/env node

/**
 * Recipe Quality Validation Script
 * 
 * Automated testing for recipe formatting quality and validation.
 * This script can be run as part of CI/CD or manually to ensure
 * recipe data meets formatting standards.
 */

const fs = require('fs');
const path = require('path');
const { formatIngredientList, formatRecipeSteps, validateIngredientFormat } = require('../lib/utils/ingredient-formatter.js');

// Configuration
const CONFIG = {
  dataDir: path.join(__dirname, '..', 'data'),
  crawledDir: path.join(__dirname, '..', 'data', 'crawled-recipes'),
  outputFile: path.join(__dirname, '..', 'test-results', 'recipe-quality-report.json'),
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  failFast: process.argv.includes('--fail-fast'),
  fixIssues: process.argv.includes('--fix'),
  generateReport: !process.argv.includes('--no-report')
};

// Quality validation rules
const QUALITY_RULES = {
  // Ingredient validation
  ingredients: {
    noHtmlEntities: {
      name: 'No HTML entities in ingredients',
      test: (ingredient) => !/&[a-zA-Z]+;|&#\d+;/.test(ingredient),
      severity: 'error'
    },
    properMeasurementSpacing: {
      name: 'Proper spacing between numbers and units',
      test: (ingredient) => !/\d+[a-zA-Z]+(?![a-zA-Z])/.test(ingredient),
      severity: 'error'
    },
    noSquareBrackets: {
      name: 'No square brackets in ingredients',
      test: (ingredient) => !/[\[\]]/.test(ingredient),
      severity: 'warning'
    },
    standardMeasurements: {
      name: 'Standard measurement abbreviations',
      test: (ingredient) => {
        const badMeasurements = /\b(ounces|pounds|tablespoons|teaspoons|gallons|quarts|pints|milliliters|liters|grams|kilograms|milligrams)\b/i;
        return !badMeasurements.test(ingredient);
      },
      severity: 'warning'
    }
  },
  
  // Instruction validation
  instructions: {
    noHtmlEntities: {
      name: 'No HTML entities in instructions',
      test: (instruction) => !/&[a-zA-Z]+;|&#\d+;/.test(instruction),
      severity: 'error'
    },
    noHtmlTags: {
      name: 'No HTML tags in instructions',
      test: (instruction) => !/<[^>]+>/.test(instruction),
      severity: 'error'
    },
    properCapitalization: {
      name: 'Proper sentence capitalization',
      test: (instruction) => {
        const trimmed = instruction.trim();
        return trimmed.length === 0 || /^[A-Z0-9]/.test(trimmed);
      },
      severity: 'warning'
    }
  },
  
  // Source attribution validation
  source: {
    hasSourceUrl: {
      name: 'Has source URL',
      test: (recipe) => !!(recipe.source_url || recipe.sourceUrl),
      severity: 'error'
    },
    hasSourceSite: {
      name: 'Has source site',
      test: (recipe) => !!(recipe.source_site || recipe.sourceSite),
      severity: 'warning'
    },
    validSourceUrl: {
      name: 'Valid source URL format',
      test: (recipe) => {
        const url = recipe.source_url || recipe.sourceUrl;
        if (!url) return false;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      severity: 'error'
    }
  },
  
  // General recipe validation
  general: {
    hasTitle: {
      name: 'Has title',
      test: (recipe) => !!(recipe.title || recipe.name),
      severity: 'error'
    },
    hasIngredients: {
      name: 'Has ingredients',
      test: (recipe) => Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0,
      severity: 'error'
    },
    hasInstructions: {
      name: 'Has instructions',
      test: (recipe) => Array.isArray(recipe.instructions) && recipe.instructions.length > 0,
      severity: 'error'
    }
  }
};

// Results tracking
const results = {
  totalRecipes: 0,
  totalIssues: 0,
  errorCount: 0,
  warningCount: 0,
  fixedCount: 0,
  files: {},
  summary: {},
  startTime: Date.now()
};

/**
 * Log message with optional verbosity control
 */
function log(message, level = 'info') {
  if (level === 'verbose' && !CONFIG.verbose) return;
  
  const prefix = {
    error: '❌',
    warning: '⚠️ ',
    success: '✅',
    info: '📋',
    verbose: '🔍'
  }[level] || '📋';
  
  console.log(`${prefix} ${message}`);
}

/**
 * Validate a single ingredient against quality rules
 */
function validateIngredient(ingredient, recipeTitle) {
  const issues = [];
  const ingredientText = typeof ingredient === 'string' ? ingredient : 
                        ingredient.name || `${ingredient.amount || ''} ${ingredient.name || ''}`.trim();
  
  for (const [ruleKey, rule] of Object.entries(QUALITY_RULES.ingredients)) {
    if (!rule.test(ingredientText)) {
      issues.push({
        type: 'ingredient',
        rule: ruleKey,
        message: rule.name,
        severity: rule.severity,
        value: ingredientText,
        recipe: recipeTitle
      });
    }
  }
  
  return issues;
}

/**
 * Validate a single instruction against quality rules
 */
function validateInstruction(instruction, recipeTitle) {
  const issues = [];
  const instructionText = typeof instruction === 'string' ? instruction : instruction.step || instruction.text || '';
  
  for (const [ruleKey, rule] of Object.entries(QUALITY_RULES.instructions)) {
    if (!rule.test(instructionText)) {
      issues.push({
        type: 'instruction',
        rule: ruleKey,
        message: rule.name,
        severity: rule.severity,
        value: instructionText,
        recipe: recipeTitle
      });
    }
  }
  
  return issues;
}

/**
 * Validate recipe source attribution
 */
function validateSource(recipe) {
  const issues = [];
  
  for (const [ruleKey, rule] of Object.entries(QUALITY_RULES.source)) {
    if (!rule.test(recipe)) {
      issues.push({
        type: 'source',
        rule: ruleKey,
        message: rule.name,
        severity: rule.severity,
        value: recipe.source_url || recipe.sourceUrl || 'missing',
        recipe: recipe.title || recipe.name || 'Unknown'
      });
    }
  }
  
  return issues;
}

/**
 * Validate general recipe structure
 */
function validateGeneral(recipe) {
  const issues = [];
  
  for (const [ruleKey, rule] of Object.entries(QUALITY_RULES.general)) {
    if (!rule.test(recipe)) {
      issues.push({
        type: 'general',
        rule: ruleKey,
        message: rule.name,
        severity: rule.severity,
        value: 'missing or invalid',
        recipe: recipe.title || recipe.name || 'Unknown'
      });
    }
  }
  
  return issues;
}

/**
 * Validate a single recipe
 */
function validateRecipe(recipe, filename) {
  const issues = [];
  const recipeTitle = recipe.title || recipe.name || 'Unknown Recipe';
  
  // Validate general structure
  issues.push(...validateGeneral(recipe));
  
  // Validate source attribution
  issues.push(...validateSource(recipe));
  
  // Validate ingredients
  if (Array.isArray(recipe.ingredients)) {
    for (const ingredient of recipe.ingredients) {
      issues.push(...validateIngredient(ingredient, recipeTitle));
    }
  }
  
  // Validate instructions
  if (Array.isArray(recipe.instructions)) {
    for (const instruction of recipe.instructions) {
      issues.push(...validateInstruction(instruction, recipeTitle));
    }
  }
  
  return issues;
}

/**
 * Fix issues in a recipe (if --fix flag is used)
 */
function fixRecipeIssues(recipe) {
  let fixed = false;
  
  // Fix ingredients
  if (Array.isArray(recipe.ingredients)) {
    const originalIngredients = JSON.stringify(recipe.ingredients);
    recipe.ingredients = formatIngredientList(recipe.ingredients);
    if (JSON.stringify(recipe.ingredients) !== originalIngredients) {
      fixed = true;
    }
  }
  
  // Fix instructions
  if (Array.isArray(recipe.instructions)) {
    const originalInstructions = JSON.stringify(recipe.instructions);
    recipe.instructions = formatRecipeSteps(recipe.instructions);
    if (JSON.stringify(recipe.instructions) !== originalInstructions) {
      fixed = true;
    }
  }
  
  // Fix source attribution
  if (recipe.sourceUrl && !recipe.source_url) {
    recipe.source_url = recipe.sourceUrl;
    delete recipe.sourceUrl;
    fixed = true;
  }
  
  if (recipe.source_url && !recipe.source_site) {
    try {
      const url = new URL(recipe.source_url);
      if (url.hostname === 'mixandmunch.app') {
        recipe.source_site = 'Mix and Munch';
      } else if (url.hostname === 'panlasangpinoy.com') {
        recipe.source_site = 'Panlasang Pinoy';
      } else if (url.hostname === 'kawalingpinoy.com' || url.hostname === 'www.kawalingpinoy.com') {
        recipe.source_site = 'Kawaling Pinoy';
      } else {
        recipe.source_site = url.hostname;
      }
      fixed = true;
    } catch (error) {
      // Invalid URL, can't fix automatically
    }
  }
  
  return fixed;
}

/**
 * Process a single recipe file
 */
function processRecipeFile(filePath) {
  const filename = path.basename(filePath);
  log(`Processing ${filename}...`, 'verbose');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let recipes = Array.isArray(data) ? data : [data];
    let fileIssues = [];
    let fileFixed = false;
    
    for (const recipe of recipes) {
      results.totalRecipes++;
      
      // Fix issues if requested
      if (CONFIG.fixIssues) {
        const wasFixed = fixRecipeIssues(recipe);
        if (wasFixed) {
          results.fixedCount++;
          fileFixed = true;
        }
      }
      
      // Validate recipe
      const recipeIssues = validateRecipe(recipe, filename);
      fileIssues.push(...recipeIssues);
    }
    
    // Write back fixed file
    if (CONFIG.fixIssues && fileFixed) {
      const fixedContent = JSON.stringify(Array.isArray(data) ? recipes : recipes[0], null, 2);
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      log(`Fixed issues in ${filename}`, 'success');
    }
    
    // Track results
    results.files[filename] = {
      recipeCount: recipes.length,
      issues: fileIssues,
      errorCount: fileIssues.filter(i => i.severity === 'error').length,
      warningCount: fileIssues.filter(i => i.severity === 'warning').length
    };
    
    results.totalIssues += fileIssues.length;
    results.errorCount += results.files[filename].errorCount;
    results.warningCount += results.files[filename].warningCount;
    
    // Log issues
    if (fileIssues.length > 0) {
      log(`Found ${fileIssues.length} issues in ${filename}`, 'warning');
      
      if (CONFIG.verbose) {
        for (const issue of fileIssues) {
          const level = issue.severity === 'error' ? 'error' : 'warning';
          log(`  ${issue.recipe}: ${issue.message} - "${issue.value}"`, level);
        }
      }
      
      if (CONFIG.failFast && results.files[filename].errorCount > 0) {
        log('Stopping due to --fail-fast flag', 'error');
        process.exit(1);
      }
    } else {
      log(`✅ No issues found in ${filename}`, 'success');
    }
    
  } catch (error) {
    log(`Error processing ${filename}: ${error.message}`, 'error');
    results.files[filename] = {
      error: error.message,
      recipeCount: 0,
      issues: [],
      errorCount: 1,
      warningCount: 0
    };
    results.errorCount++;
  }
}

/**
 * Find all recipe files to process
 */
function findRecipeFiles() {
  const files = [];
  
  // Main recipe files
  if (fs.existsSync(CONFIG.dataDir)) {
    const dataFiles = fs.readdirSync(CONFIG.dataDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(CONFIG.dataDir, file));
    files.push(...dataFiles);
  }
  
  // Crawled recipe files
  if (fs.existsSync(CONFIG.crawledDir)) {
    const crawledFiles = fs.readdirSync(CONFIG.crawledDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(CONFIG.crawledDir, file));
    files.push(...crawledFiles);
  }
  
  return files;
}

/**
 * Generate summary report
 */
function generateSummary() {
  const duration = Date.now() - results.startTime;
  
  results.summary = {
    totalRecipes: results.totalRecipes,
    totalFiles: Object.keys(results.files).length,
    totalIssues: results.totalIssues,
    errorCount: results.errorCount,
    warningCount: results.warningCount,
    fixedCount: results.fixedCount,
    duration: duration,
    timestamp: new Date().toISOString(),
    passed: results.errorCount === 0
  };
  
  // Group issues by type and rule
  const issuesByType = {};
  const issuesByRule = {};
  
  for (const fileResult of Object.values(results.files)) {
    if (fileResult.issues) {
      for (const issue of fileResult.issues) {
        // By type
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = { count: 0, errors: 0, warnings: 0 };
        }
        issuesByType[issue.type].count++;
        if (issue.severity === 'error') issuesByType[issue.type].errors++;
        else issuesByType[issue.type].warnings++;
        
        // By rule
        const ruleKey = `${issue.type}.${issue.rule}`;
        if (!issuesByRule[ruleKey]) {
          issuesByRule[ruleKey] = { 
            message: issue.message, 
            count: 0, 
            severity: issue.severity 
          };
        }
        issuesByRule[ruleKey].count++;
      }
    }
  }
  
  results.summary.issuesByType = issuesByType;
  results.summary.issuesByRule = issuesByRule;
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RECIPE QUALITY VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`📋 Processed: ${results.totalRecipes} recipes in ${Object.keys(results.files).length} files`);
  console.log(`⏱️  Duration: ${Math.round(results.summary.duration / 1000)}s`);
  
  if (results.fixedCount > 0) {
    console.log(`🔧 Fixed: ${results.fixedCount} recipes`);
  }
  
  if (results.totalIssues === 0) {
    console.log('✅ All recipes passed quality validation!');
  } else {
    console.log(`\n🚨 Found ${results.totalIssues} total issues:`);
    console.log(`   ❌ ${results.errorCount} errors`);
    console.log(`   ⚠️  ${results.warningCount} warnings`);
    
    if (Object.keys(results.summary.issuesByRule).length > 0) {
      console.log('\n📋 Issues by rule:');
      const sortedRules = Object.entries(results.summary.issuesByRule)
        .sort(([,a], [,b]) => b.count - a.count);
      
      for (const [rule, data] of sortedRules.slice(0, 10)) {
        const icon = data.severity === 'error' ? '❌' : '⚠️ ';
        console.log(`   ${icon} ${data.message}: ${data.count}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.errorCount > 0) {
    console.log('❌ Validation FAILED - Fix errors before proceeding');
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED - All critical checks passed');
  }
}

/**
 * Save detailed report to file
 */
function saveReport() {
  if (!CONFIG.generateReport) return;
  
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write report
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2), 'utf8');
    log(`Report saved to ${CONFIG.outputFile}`, 'success');
  } catch (error) {
    log(`Failed to save report: ${error.message}`, 'error');
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Recipe Quality Validation...\n');
  
  // Show configuration
  if (CONFIG.verbose) {
    console.log('Configuration:');
    console.log(`  Data directory: ${CONFIG.dataDir}`);
    console.log(`  Crawled directory: ${CONFIG.crawledDir}`);
    console.log(`  Fix issues: ${CONFIG.fixIssues}`);
    console.log(`  Fail fast: ${CONFIG.failFast}`);
    console.log(`  Generate report: ${CONFIG.generateReport}`);
    console.log('');
  }
  
  // Find and process files
  const recipeFiles = findRecipeFiles();
  
  if (recipeFiles.length === 0) {
    log('No recipe files found to validate', 'warning');
    return;
  }
  
  log(`Found ${recipeFiles.length} recipe files to validate`);
  
  for (const file of recipeFiles) {
    processRecipeFile(file);
  }
  
  // Generate and display results
  generateSummary();
  printSummary();
  saveReport();
}

// Handle command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Recipe Quality Validation Script

Usage: node scripts/validate-recipe-quality.js [options]

Options:
  --verbose, -v     Show detailed validation output
  --fix             Automatically fix issues where possible
  --fail-fast       Stop on first error encountered
  --no-report       Don't generate JSON report file
  --help, -h        Show this help message

Examples:
  node scripts/validate-recipe-quality.js
  node scripts/validate-recipe-quality.js --verbose --fix
  node scripts/validate-recipe-quality.js --fail-fast
`);
  process.exit(0);
}

// Run the validation
main();