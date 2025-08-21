const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SidecarBuilder {
  constructor() {
    this.binDir = path.join(__dirname, 'bin');
    this.srcDir = path.join(__dirname, 'src');
    this.mainFile = path.join(this.srcDir, 'main.js');
    
    // Tauri sidecar binary naming convention
    this.targets = {
      'macos-x64': {
        pkgTarget: 'node18-macos-x64',
        outputName: 'crawler-sidecar-x86_64-apple-darwin'
      },
      'macos-arm64': {
        pkgTarget: 'node18-macos-arm64',
        outputName: 'crawler-sidecar-aarch64-apple-darwin'
      },
      'windows-x64': {
        pkgTarget: 'node18-win-x64',
        outputName: 'crawler-sidecar-x86_64-pc-windows-msvc.exe'
      },
      'linux-x64': {
        pkgTarget: 'node18-linux-x64',
        outputName: 'crawler-sidecar-x86_64-unknown-linux-gnu'
      }
    };
  }

  log(message) {
    console.log(`[SidecarBuilder] ${message}`);
  }

  error(message) {
    console.error(`[SidecarBuilder] ERROR: ${message}`);
  }

  ensureBinDirectory() {
    if (!fs.existsSync(this.binDir)) {
      fs.mkdirSync(this.binDir, { recursive: true });
      this.log('Created bin directory');
    }
  }

  checkDependencies() {
    try {
      execSync('pkg --version', { stdio: 'ignore' });
      this.log('pkg is available');
    } catch (error) {
      this.error('pkg is not installed. Please run: npm install -g pkg');
      process.exit(1);
    }
  }

  buildTarget(targetName, config) {
    const { pkgTarget, outputName } = config;
    const outputPath = path.join(this.binDir, outputName);
    
    this.log(`Building ${targetName}...`);
    
    try {
      const command = [
        'pkg',
        this.mainFile,
        `--targets ${pkgTarget}`,
        `--output "${outputPath}"`,
        '--compress GZip'
      ].join(' ');
      
      this.log(`Executing: ${command}`);
      execSync(command, { stdio: 'inherit' });
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        this.log(`✅ ${targetName} built successfully (${sizeInMB} MB)`);
        return true;
      } else {
        this.error(`❌ ${targetName} build failed - output file not found`);
        return false;
      }
    } catch (error) {
      this.error(`❌ ${targetName} build failed: ${error.message}`);
      return false;
    }
  }

  buildAll() {
    this.log('Starting build process for all targets...');
    
    const results = {};
    let successCount = 0;
    
    for (const [targetName, config] of Object.entries(this.targets)) {
      const success = this.buildTarget(targetName, config);
      results[targetName] = success;
      if (success) successCount++;
    }
    
    this.log(`\nBuild Summary:`);
    this.log(`✅ Successful: ${successCount}/${Object.keys(this.targets).length}`);
    
    for (const [targetName, success] of Object.entries(results)) {
      const status = success ? '✅' : '❌';
      this.log(`  ${status} ${targetName}`);
    }
    
    if (successCount === Object.keys(this.targets).length) {
      this.log('\n🎉 All targets built successfully!');
      this.listBinaries();
    } else {
      this.error('\n⚠️  Some targets failed to build');
      process.exit(1);
    }
  }

  buildSpecific(targetNames) {
    this.log(`Building specific targets: ${targetNames.join(', ')}`);
    
    const results = {};
    let successCount = 0;
    
    for (const targetName of targetNames) {
      if (!this.targets[targetName]) {
        this.error(`Unknown target: ${targetName}`);
        this.log(`Available targets: ${Object.keys(this.targets).join(', ')}`);
        continue;
      }
      
      const success = this.buildTarget(targetName, this.targets[targetName]);
      results[targetName] = success;
      if (success) successCount++;
    }
    
    this.log(`\nBuild Summary:`);
    this.log(`✅ Successful: ${successCount}/${targetNames.length}`);
    
    for (const [targetName, success] of Object.entries(results)) {
      const status = success ? '✅' : '❌';
      this.log(`  ${status} ${targetName}`);
    }
  }

  listBinaries() {
    this.log('\nBuilt binaries:');
    
    if (!fs.existsSync(this.binDir)) {
      this.log('  No binaries found (bin directory does not exist)');
      return;
    }
    
    const files = fs.readdirSync(this.binDir);
    if (files.length === 0) {
      this.log('  No binaries found');
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(this.binDir, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      this.log(`  📦 ${file} (${sizeInMB} MB)`);
    });
  }

  clean() {
    this.log('Cleaning bin directory...');
    
    if (fs.existsSync(this.binDir)) {
      const files = fs.readdirSync(this.binDir);
      files.forEach(file => {
        const filePath = path.join(this.binDir, file);
        fs.unlinkSync(filePath);
        this.log(`Removed: ${file}`);
      });
      this.log('✅ Bin directory cleaned');
    } else {
      this.log('Bin directory does not exist, nothing to clean');
    }
  }

  showHelp() {
    console.log(`
Sidecar Builder Usage:
`);
    console.log(`  node build.js [command] [targets...]\n`);
    console.log(`Commands:`);
    console.log(`  build, all     Build all targets (default)`);
    console.log(`  clean          Clean bin directory`);
    console.log(`  list           List built binaries`);
    console.log(`  help           Show this help\n`);
    console.log(`Available targets:`);
    Object.keys(this.targets).forEach(target => {
      console.log(`  - ${target}`);
    });
    console.log(`\nExamples:`);
    console.log(`  node build.js                    # Build all targets`);
    console.log(`  node build.js macos-x64          # Build specific target`);
    console.log(`  node build.js macos-x64 linux-x64 # Build multiple targets`);
    console.log(`  node build.js clean              # Clean bin directory`);
    console.log(`  node build.js list               # List built binaries\n`);
  }
}

// Main execution
if (require.main === module) {
  const builder = new SidecarBuilder();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'build' || args[0] === 'all') {
    builder.ensureBinDirectory();
    builder.checkDependencies();
    builder.buildAll();
  } else if (args[0] === 'clean') {
    builder.clean();
  } else if (args[0] === 'list') {
    builder.listBinaries();
  } else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    builder.showHelp();
  } else {
    // Build specific targets
    const targets = args.filter(arg => builder.targets[arg]);
    if (targets.length > 0) {
      builder.ensureBinDirectory();
      builder.checkDependencies();
      builder.buildSpecific(targets);
    } else {
      builder.error('No valid targets specified');
      builder.showHelp();
      process.exit(1);
    }
  }
}

module.exports = SidecarBuilder;