#!/usr/bin/env node

// React Native Windows Native Module Generator
// Feature parity with generate_native_files.rb but for Windows platform
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  console.log(`${colors.D}  Windows Dir: ${colors.G}${path.relative(projectRoot, windowsDir)}${colors.X}`);
  if (clean) console.log(`${colors.D}  clean: ${colors.G}${clean}${colors.X}`);
  console.log('');

  if (!checkAppPath(appPath)) return;

  if (clean) {
    cleanWindowsGeneratedFiles(windowsDir, projectRoot);
    return;
  }

  // Ensure the windows directory exists
  fs.mkdirSync(windowsDir, { recursive: true });

  // Generate embedded TurboModules (Windows equivalent)
  generateTurboModules(projectRoot);

  // Discover Windows native modules
  const windowsModules = discoverWindowsModules(appPath, projectRoot);
  
  if (windowsModules.length === 0) {
    console.log(`${colors.D}No Windows native modules found.${colors.X}`);
    console.log('');
  } else {
    console.log(`${colors.D}Processing ${windowsModules.length} Windows native modules${colors.X}`);
    console.log('');

    // Generate ReactPackageProvider
    generateReactPackageProvider(windowsModules, windowsDir, projectRoot);
  }

  if (changesMade) {
    console.log('');
    console.log(`${colors.GB}✓ Windows native modules linked${colors.X}`);
    console.log(`${colors.D}  Build the Windows project to use the updated modules${colors.X}`);
    console.log('');
  } else {
    console.log('');
    console.log(`${colors.D}No changes needed.${colors.X}`);
    console.log('');
  }
}

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

function generateTurboModules(projectRoot) {
  console.log(`${colors.D}Generating embedded TurboModules (Windows)${colors.X}`);
  console.log('');
  
  try {
    const result = execSync(`node ${path.join(projectRoot, 'bin', 'generateTurboModule.js')} generate`, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(result);
    console.log('');
    
    if (result.includes('Generated') || result.includes('processed')) {
      changesMade = true;
    }
  } catch (error) {
    console.log(`${colors.Y}Note: TurboModule generation skipped (generateTurboModule.js not found or error)${colors.X}`);
    console.log('');
  }
}

function discoverWindowsModules(appPath, projectRoot) {
  console.log(`${colors.D}Discovering Windows native modules in ${appPath}${colors.X}`);
  
  // Find all windows directories containing .cpp/.h files
  const windowsFiles = findFilesRecursive(appPath, /\.cpp$/)
    .filter(file => file.includes(path.sep + 'windows' + path.sep));
  
  const modules = new Map();
  
  windowsFiles.forEach(file => {
    const relativePath = path.relative(projectRoot, file);
    const parts = relativePath.split(path.sep);
    
    // Extract module name from path like app/native/IRClipboard/windows/IRClipboard.cpp
    let moduleName = null;
    const windowsIndex = parts.indexOf('windows');
    
    if (windowsIndex > 0) {
      // Look for module name in parent directories
      for (let i = windowsIndex - 1; i >= 0; i--) {
        if (parts[i].startsWith('IR') || parts[i].startsWith('Native')) {
          moduleName = parts[i];
          break;
        }
      }
    }
    
    if (moduleName) {
      const headerFile = file.replace(/\.cpp$/, '.h');
      
      if (fs.existsSync(headerFile)) {
        modules.set(moduleName, {
          name: moduleName,
          cppFile: file,
          headerFile: headerFile,
          directory: path.dirname(file)
        });
        
        const relativeDir = path.relative(projectRoot, path.dirname(file));
        console.log(`${colors.BB} ✓ Found     ${colors.X} ${colors.BB}${moduleName}${colors.X} ${colors.DD}${relativeDir}${colors.X}`);
      }
    }
  });
  
  return Array.from(modules.values());
}

function generateReactPackageProvider(modules, windowsDir, projectRoot) {
  const headerTemplate = reactPackageProviderHeaderTemplate(modules, windowsDir, projectRoot);
  const cppTemplate = reactPackageProviderCppTemplate(modules, windowsDir, projectRoot);
  
  const headerPath = path.join(windowsDir, 'ReactPackageProvider.h');
  const cppPath = path.join(windowsDir, 'ReactPackageProvider.cpp');
  
  // Check if files need updating
  const headerExists = fs.existsSync(headerPath);
  const cppExists = fs.existsSync(cppPath);
  
  let headerNeedsUpdate = !headerExists;
  let cppNeedsUpdate = !cppExists;
  
  if (headerExists) {
    const existingHeader = fs.readFileSync(headerPath, 'utf8');
    headerNeedsUpdate = existingHeader !== headerTemplate;
  }
  
  if (cppExists) {
    const existingCpp = fs.readFileSync(cppPath, 'utf8');
    cppNeedsUpdate = existingCpp !== cppTemplate;
  }

  if (headerNeedsUpdate) {
    fs.writeFileSync(headerPath, headerTemplate);
    const relativePath = path.relative(projectRoot, headerPath);
    console.log(`${colors.BB} ➕ Generated ${colors.X} ${colors.BB}ReactPackageProvider.h${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
    changesMade = true;
  } else {
    const relativePath = path.relative(projectRoot, headerPath);
    console.log(`${colors.DB} ✔️ Exists     ${colors.X}${colors.DB}ReactPackageProvider.h${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
  }

  if (cppNeedsUpdate) {
    fs.writeFileSync(cppPath, cppTemplate);
    const relativePath = path.relative(projectRoot, cppPath);
    console.log(`${colors.BB} ➕ Generated ${colors.X} ${colors.BB}ReactPackageProvider.cpp${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
    changesMade = true;
  } else {
    const relativePath = path.relative(projectRoot, cppPath);
    console.log(`${colors.DB} ✔️ Exists     ${colors.X}${colors.DB}ReactPackageProvider.cpp${colors.X} ${colors.DD}${path.dirname(relativePath)}${colors.X}`);
  }
}

function reactPackageProviderHeaderTemplate(modules, windowsDir, projectRoot) {
  const includePaths = modules.map(m => {
    const relativePath = path.relative(windowsDir, m.headerFile).replace(/\\/g, '/');
    return `#include "${relativePath}"`;
  }).join('\n');

  return `#pragma once
#include "NativeModules.h"
#include "winrt/Microsoft.ReactNative.h"

${includePaths}

namespace winrt::reactotron::implementation
{
    struct ReactPackageProvider : winrt::implements<ReactPackageProvider, winrt::Microsoft::ReactNative::IReactPackageProvider>
    {
        void CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept;
    };
}`;
}

function reactPackageProviderCppTemplate(modules, windowsDir, projectRoot) {
  const includePaths = modules.map(m => {
    const relativePath = path.relative(windowsDir, m.headerFile).replace(/\\/g, '/');
    return `#include "${relativePath}"`;
  }).join('\n');

  const moduleRegistrations = modules.map(m => 
    `        packageBuilder.AddModule(L"${m.name}", []() { return winrt::make<winrt::reactotron::implementation::${m.name}>(); });`
  ).join('\n');

  return `#include "pch.h"
#include "ReactPackageProvider.h"

${includePaths}

namespace winrt::reactotron::implementation
{
    void ReactPackageProvider::CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept
    {
${moduleRegistrations}
    }
}`;
}

function cleanWindowsGeneratedFiles(windowsDir, projectRoot) {
  const filesToClean = [
    'ReactPackageProvider.h',
    'ReactPackageProvider.cpp'
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
  
  if (fs.existsSync(dir)) {
    traverse(dir);
  }
  
  return files;
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

// Export for programmatic use
module.exports = { generateWindowsNativeFiles };