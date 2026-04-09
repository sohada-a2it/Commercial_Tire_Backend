#!/usr/bin/env node

/**
 * Automated cPanel Deployment Script
 * Rebuilds frontend and uploads to cPanel via SFTP
 * 
 * Usage: npm run deploy
 * 
 * Required .env variables:
 * - CPANEL_HOST
 * - CPANEL_USER
 * - CPANEL_PASSWORD
 * - CPANEL_DEPLOY_PATH (e.g., /home/username/public_html or public_html for root)
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import Client from "ssh2-sftp-client";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}━━ ${msg} ━━${colors.reset}`),
};

// Check environment variables
function validateEnv() {
  const required = ["CPANEL_HOST", "CPANEL_USER", "CPANEL_PASSWORD", "CPANEL_DEPLOY_PATH"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    log.error(`Missing environment variables: ${missing.join(", ")}`);
    log.info("Create a .env file with:");
    missing.forEach((key) => console.log(`  ${key}=your_value`));
    process.exit(1);
  }
}

// Step 1: Build the project
async function buildProject() {
  log.section("BUILD: Building Next.js project");

  try {
    log.info("Running: npm run build");
    const { stdout, stderr } = await execAsync("npm run build", { cwd: projectRoot, maxBuffer: 10 * 1024 * 1024 });
    
    if (stderr) {
      log.warn(stderr);
    }
    
    if (!fs.existsSync(path.join(projectRoot, "out"))) {
      throw new Error("out folder not created after build");
    }

    log.success("Build completed successfully");
    return true;
  } catch (error) {
    log.error(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Step 2: Connect to cPanel via SFTP and upload
async function uploadToCPanel() {
  log.section("UPLOAD: Connecting to cPanel");

  const sftp = new Client();
  let totalFiles = 0;
  let uploadedFiles = 0;

  try {
    const sftpConfig = {
      host: process.env.CPANEL_HOST,
      username: process.env.CPANEL_USER,
      password: process.env.CPANEL_PASSWORD,
      port: 22,
      readyTimeout: 30000,
    };

    log.info(`Connecting to ${process.env.CPANEL_HOST}...`);
    await sftp.connect(sftpConfig);
    log.success("Connected to cPanel");

    // Get the deploy path
    const deployPath = process.env.CPANEL_DEPLOY_PATH;
    log.info(`Target path: ${deployPath}`);

    // Get local out folder
    const localOutPath = path.join(projectRoot, "out");
    const files = getAllFiles(localOutPath);
    totalFiles = files.length;

    log.info(`Found ${totalFiles} files to upload`);

    // Create remote directories and upload files
    for (const file of files) {
      const relativePath = path.relative(localOutPath, file);
      const remoteFile = path.posix.join(deployPath, relativePath).replace(/\\/g, "/");
      const remoteDir = path.posix.dirname(remoteFile);

      try {
        // Ensure directory exists
        try {
          await sftp.stat(remoteDir);
        } catch {
          // Directory doesn't exist, create it
          await sftp.mkdir(remoteDir, true);
        }

        // Upload file
        await sftp.fastPut(file, remoteFile);
        uploadedFiles++;

        // Show progress every 10 files
        if (uploadedFiles % 10 === 0) {
          const percent = Math.round((uploadedFiles / totalFiles) * 100);
          process.stdout.write(`\r${colors.blue}ℹ${colors.reset} Upload progress: ${percent}% (${uploadedFiles}/${totalFiles})`);
        }
      } catch (error) {
        log.warn(`Failed to upload ${relativePath}: ${error.message}`);
      }
    }

    console.log(); // New line after progress
    log.success(`Upload completed: ${uploadedFiles}/${totalFiles} files`);

    // Upload .htaccess separately (special handling)
    const htaccessPath = path.join(localOutPath, ".htaccess");
    if (fs.existsSync(htaccessPath)) {
      try {
        const remoteHtaccess = path.posix.join(deployPath, ".htaccess");
        await sftp.fastPut(htaccessPath, remoteHtaccess);
        log.success(".htaccess uploaded");
      } catch (error) {
        log.warn(`.htaccess upload failed: ${error.message}`);
      }
    }

    await sftp.end();
    log.success("Disconnected from cPanel");
  } catch (error) {
    log.error(`Upload failed: ${error.message}`);
    try {
      await sftp.end();
    } catch {}
    process.exit(1);
  }
}

// Helper: Get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Main execution
async function main() {
  log.section("cPanel Deployment Script");

  // Validate environment
  validateEnv();

  // Build
  await buildProject();

  // Upload
  await uploadToCPanel();

  log.section("Deployment Complete");
  log.success("Your site has been deployed to cPanel!");
  log.info("Check https://asianimportexport.com to verify");
}

main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
