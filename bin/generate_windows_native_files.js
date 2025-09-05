#!/usr/bin/env node

// Windows-based React Native Native Module Generator
// Equivalent to generate_native_files.rb but for Windows platform
// Automates steps 3 & 4 from Microsoft's native module creation process

const fs = require('fs');
const path = require('path');

// Color constants for output (matching Ruby script exactly)
const colors = process.env.NO_COLOR ? {
  R: "", RB: "", G: "", GB: "", BB: "", Y: "", YB: "", D: "", DD: "", DB: "", DDB: "", S: "", X: "\x1b[0m"
} : process.env.PREFERS_CONTRAST === 'more' ? {
  R: "\x1b[91m", RB: "\x1b[91m", G: "\x1b[92m", GB: "\x1b[92m", BB: "\x1b[94m", Y: "\x1b[93m", YB: "\x1b[93m",
  D: "\x1b[37m", DD: "\x1b[37m", DB: "\x1b[37m", DDB: "\x1b[37m", S: "\x1b[9m", X: "\x1b[0m"
} : {
  R: "\x1b[31m", RB: "\x1b[31;1m", G: "\x1b[32m", GB: "\x1b[32;1m", BB: "\x1b[34;1m", Y: "\x1b[33m", YB: "\x1b[33;1m",
  D: "\x1b[90m", DD: "\x1b[90;2m", DB: "\x1b[90;1m", DDB: "\x1b[90;1;2m", S: "\x1b[9m", X: "\x1b[0m"
};

let changesMade = false;

console.log(`${colors.X}`);

// Main function - equivalent to generate_native_files_for_pod
function generateWindowsNativeFiles(options = {}) {
  console.log(`🪟 ${colors.BB}React Native Windows Native Module Generator${colors.X}`);
  console.log('');
  console.log(`${colors.D}Running ./bin/generate_windows_native_files.js from ${__filename}${colors.X}`);
  console.log('');

  verifyOptions(options);

  const appPath = options.appPath;
  const projectRoot = options.projectRoot || process.cwd();
  const clean = options.clean || false;
  
  const relativeAppPath = path.relative(projectRoot, appPath);
  const windowsDir = path.join(projectRoot, 'windows', 'reactotron');
  
  console.log(`${colors.D}  App Path: ${colors.BB}${relativeAppPath}${colors.X}`);
  console.log(`${colors.D}  Project Root: ${colors.G}${projectRoot}${colors.X}`);
  if (clean) console.log(`${colors.D}  clean: ${colors.G}${clean}${colors.X}`);
  console.log('');

  if (!checkAppPath(appPath)) return;

  if (clean) {
    cleanGeneratedFiles(windowsDir, projectRoot);
    return;
  }

  // Ensure the windows directory exists
  if (!fs.existsSync(windowsDir)) {
    fs.mkdirSync(windowsDir, { recursive: true });
  }

  // Find all Windows native modules
  const windowsModules = findWindowsNativeFiles(appPath, projectRoot);
  
  console.log(`${colors.D}Processing ${windowsModules.length} Windows native modules${colors.X}`);
  console.log('');

  if (windowsModules.length > 0) {
    // Generate consolidated header
    generateConsolidatedFiles(windowsModules, windowsDir, projectRoot);
  }

  if (changesMade) {
    console.log('');
    console.log(`${colors.GB}✓ Windows native files generated${colors.X}`);
    console.log(`${colors.D}  Build the Windows project to use the updated modules${colors.X}`);
    console.log('');
  } else {
    console.log('');
    console.log(`${colors.D}No changes needed.${colors.X}`);
    console.log('');
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const clean = args.includes('--clean') || args.includes('clean');
  
  generateWindowsNativeFiles({
    appPath: path.join(process.cwd(), 'app'),
    projectRoot: process.cwd(),
    clean: clean
  });
}

// Helper functions
function verifyOptions(options) {
  if (!options.appPath) {
    throw new Error(`${colors.RB}generate_windows_native_files - You must specify an appPath${colors.X}`);
  }
}

function checkAppPath(appPath) {
  if (fs.existsSync(appPath)) return true;
  
  console.log(`${colors.RB}React Native Windows Generator error:${colors.X}`);
  console.log('');
  console.log(`${colors.Y}  No files found in ${colors.BB}${appPath}${colors.X}${colors.Y}.${colors.X}`);
  console.log(`${colors.Y}  Please check your appPath.${colors.X}`);
  console.log('');
  return false;
}

function findWindowsNativeFiles(appPath, projectRoot) {
  const modules = [];
  
  // Find all .windows.h and .windows.cpp files
  const windowsFiles = findFilesRecursive(appPath, /\.windows\.(h|cpp)$/);
  
  // Group by module name (extract from file basename)
  const moduleMap = new Map();
  
  windowsFiles.forEach(file => {
    const basename = path.basename(file, path.extname(file)); // Remove .windows.h/.windows.cpp
    const moduleName = basename.replace(/\.windows$/, ''); // Remove .windows
    const ext = path.extname(file).substring(1); // h or cpp
    
    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, { name: moduleName, files: {}, type: null });
    }
    
    moduleMap.get(moduleName).files[ext] = file;
  });
  
  // Analyze each module to determine if it's a TurboModule or Fabric component
  moduleMap.forEach((module, name) => {
    if (module.files.h && module.files.cpp) {
      // Detect module type by examining the header file
      const headerContent = fs.readFileSync(module.files.h, 'utf8');
      
      if (headerContent.includes('REACT_MODULE')) {
        module.type = 'turbo';
      } else if (headerContent.includes('RegisterIRTabNativeComponent') || 
                 headerContent.includes('ComponentView') ||
                 headerContent.includes('Register') && headerContent.includes('NativeComponent')) {
        module.type = 'fabric';
      } else {
        module.type = 'unknown';
      }
      
      modules.push(module);
      const relativeDir = path.relative(projectRoot, path.dirname(module.files.h));
      const typeIndicator = module.type === 'turbo' ? '🔧' : module.type === 'fabric' ? '🎨' : '❓';
      console.log(`${colors.BB} ✓ Found     ${colors.X} ${colors.BB}${name}${colors.X} ${colors.DD}${relativeDir}${colors.X} ${typeIndicator} ${module.type}`);
    } else {
      console.log(`${colors.YB} ⚠ Warning   ${colors.X}${colors.D}${name} missing ${module.files.h ? '.cpp' : '.h'} file${colors.X}`);
    }
  });
  
  return modules;
}

function generateConsolidatedFiles(modules, windowsDir, projectRoot) {
  const headerPath = path.join(windowsDir, 'IRNativeModules.g.h');
  const cppPath = path.join(windowsDir, 'IRNativeModules.g.cpp');
  
  // Generate header content
  const headerContent = generateHeaderTemplate(modules, windowsDir);
  
  // Generate cpp content (only if there are Fabric components)
  const fabricComponents = modules.filter(m => m.type === 'fabric');
  const cppContent = fabricComponents.length > 0 ? generateCppTemplate(modules) : null;
  
  // Check if header needs updating
  let headerNeedsUpdate = !fs.existsSync(headerPath) || fs.readFileSync(headerPath, 'utf8') !== headerContent;
  
  if (headerNeedsUpdate) {
    fs.writeFileSync(headerPath, headerContent);
    const relativePath = path.relative(projectRoot, headerPath);
    console.log(`${colors.BB} ➕ Generated ${colors.X} ${colors.BB}IRNativeModules.g.h${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
    changesMade = true;
  } else {
    const relativePath = path.relative(projectRoot, headerPath);
    console.log(`${colors.DB} ✔️ Exists     ${colors.X}${colors.DB}IRNativeModules.g.h${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
  }
  
  // Handle cpp file for Fabric components
  if (cppContent) {
    let cppNeedsUpdate = !fs.existsSync(cppPath) || fs.readFileSync(cppPath, 'utf8') !== cppContent;
    
    if (cppNeedsUpdate) {
      fs.writeFileSync(cppPath, cppContent);
      const relativePath = path.relative(projectRoot, cppPath);
      console.log(`${colors.BB} ➕ Generated ${colors.X} ${colors.BB}IRNativeModules.g.cpp${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
      changesMade = true;
    } else {
      const relativePath = path.relative(projectRoot, cppPath);
      console.log(`${colors.DB} ✔️ Exists     ${colors.X}${colors.DB}IRNativeModules.g.cpp${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
    }
  } else if (fs.existsSync(cppPath)) {
    // Remove cpp file if no Fabric components
    fs.unlinkSync(cppPath);
    const relativePath = path.relative(projectRoot, cppPath);
    console.log(`${colors.YB} ➖ Removed    ${colors.X}${colors.S}${colors.D}${relativePath}${colors.X}${colors.D} (no Fabric components)${colors.X}`);
    changesMade = true;
  }
}

function generateHeaderTemplate(modules, windowsDir) {
  // Separate TurboModules and Fabric components
  const turboModules = modules.filter(m => m.type === 'turbo');
  const fabricComponents = modules.filter(m => m.type === 'fabric');
  const unknownModules = modules.filter(m => m.type === 'unknown');
  
  // Generate includes for all modules
  const allIncludes = modules.map(module => {
    const relativePath = path.relative(windowsDir, module.files.h).replace(/\\/g, '/');
    return `#include "${relativePath}"`;
  }).join('\n');
  
  // Generate Fabric component registration function declarations
  const fabricRegistrations = fabricComponents.map(module => {
    // Extract registration function name from header content
    const headerContent = fs.readFileSync(module.files.h, 'utf8');
    const registerMatch = headerContent.match(/void\s+(Register\w*NativeComponent)\s*\(/);
    const functionName = registerMatch ? registerMatch[1] : `Register${module.name}NativeComponent`;
    return `    void ${functionName}(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept;`;
  }).join('\n');
  
  return `#pragma once
// Generated by bin/generate_windows_native_files.js
// DO NOT EDIT - This file is auto-generated
//
// TurboModules (${turboModules.length}) will be auto-registered by AddAttributedModules()
// Fabric Components (${fabricComponents.length}) require manual registration calls
${unknownModules.length > 0 ? `// Unknown modules (${unknownModules.length}) - please check their implementation` : ''}

${allIncludes}

namespace winrt::reactotron::implementation {
    // Fabric component registration functions
${fabricRegistrations}
    
    // Helper function to register all Fabric components
    void RegisterAllFabricComponents(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept;
}
`;
}

function generateCppTemplate(modules) {
  const fabricComponents = modules.filter(m => m.type === 'fabric');
  
  const fabricRegistrationCalls = fabricComponents.map(module => {
    // Extract registration function name from header content
    const headerContent = fs.readFileSync(module.files.h, 'utf8');
    const registerMatch = headerContent.match(/void\s+(Register\w*NativeComponent)\s*\(/);
    const functionName = registerMatch ? registerMatch[1] : `Register${module.name}NativeComponent`;
    return `        ${functionName}(packageBuilder);`;
  }).join('\n');
  
  return `#include "pch.h"
#include "IRNativeModules.g.h"

namespace winrt::reactotron::implementation {
    void RegisterAllFabricComponents(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept {
        // Auto-generated Fabric component registrations
${fabricRegistrationCalls}
    }
}
`;
}



function cleanGeneratedFiles(windowsDir, projectRoot) {
  const filesToClean = [
    'IRNativeModules.g.h',
    'IRNativeModules.g.cpp'
  ];
  
  filesToClean.forEach(file => {
    const filePath = path.join(windowsDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      const relativePath = path.relative(projectRoot, filePath);
      console.log(`${colors.YB} ➖ Removed    ${colors.X}${colors.S}${colors.D}${relativePath}${colors.X}`);
      changesMade = true;
    }
  });
  
  if (changesMade) {
    console.log('');
    console.log(`${colors.GB}✓ Generated Windows files cleaned${colors.X}`);
    console.log('');
  }
}

// Utility function to find files recursively
function findFilesRecursive(dir, pattern) {
  const files = [];
  
  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (pattern.test(item)) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Export for programmatic use
module.exports = { generateWindowsNativeFiles };