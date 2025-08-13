import fs from 'fs';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { glob } from 'glob';
import { replaceInFile } from 'replace-in-file';

async function generateHTML() {
    const buildDir = process.argv[2];
    if (!buildDir) {
        console.error('Usage: node scripts/build-html.js <build-directory>');
        process.exit(1);
    }

    // 1. Detect and connect files from build directory
    async function detectFiles() {
        const buildDir = process.argv[2];
        if (!buildDir) {
            console.error('Usage: node scripts/build-html.js <build-directory>');
            process.exit(1);
        }

        // Find all CSS files
        const cssFiles = glob.sync(`${buildDir}/css/*.css`);
        // Find all JS files
        const jsFiles = glob.sync(`${buildDir}/script/*.js`);
        // Find all image files
        const imageFiles = glob.sync(`${buildDir}/img/*.{png,jpg,jpeg,svg,gif,webp}`);

        // Generate HTML structure based on detected files
        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                ${cssFiles.map(file => `
                <link rel="stylesheet" href="${path.relative(buildDir, file)}" />
                `).join('')}
                ${jsFiles.map(file => `
                <script defer src="${path.relative(buildDir, file)}"></script>
                `).join('')}
                <!-- Protection Scripts -->
                <script>
                    window.__obfuscator = {
                        check: function() {
                            if (window.__obfuscator.__check) {
                                return;
                            }
                            window.__obfuscator.__check = true;
                            const check = setInterval(() => {
                                if (document.readyState === 'complete') {
                                    clearInterval(check);
                                    if (!window.__obfuscator.__initialized) {
                                        window.location.reload();
                                    }
                                }
                            }, 100);
                        }
                    };
                </script>
            </head>
            <body>
                ${imageFiles.map(file => `
                <img
                    src="${path.relative(buildDir, file)}"
                    alt="${path.basename(file, path.extname(file))}"
                    class="logo"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                />
                <span class="logo-emoji" style="display: none; font-size: 50px">🎲</span>
                `).join('')}
                <h1 class="logo-title">Dice Roller</h1>

                <div class="controls">
                    <button id="themeToggle" class="btn btn-sm">🌙</button>
                    <select id="diceCount" class="form-select">
                        <option value="2">2 кубика</option>
                        <option value="3">3 кубика</option>
                        <option value="4">4 кубика</option>
                        <option value="5">5 кубика</option>
                    </select>
                    <button class="roll btn btn-outline-light">Бросить кости</button>
                </div>
                <div class="dice-container"></div>
            </body>
        </html>`;
    }

    // Get HTML content by detecting files
    const htmlContent = await detectFiles();

    // 2. Write to build directory
    const htmlPath = path.join(buildDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ Generated base HTML structure');

    // 3. Obfuscate inline scripts
    const html = fs.readFileSync(htmlPath, 'utf8');
    const obfuscatedHtml = JavaScriptObfuscator.obfuscate(
        html,
        {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            debugProtection: true,
            debugProtectionInterval: true,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            renameGlobals: true,
            rotateStringArray: true,
            selfDefending: true,
            stringArray: true,
            stringArrayEncoding: 'base64',
            stringArrayThreshold: 1,
            transformObjectKeys: true
        }
    ).getObfuscatedCode();

    fs.writeFileSync(htmlPath, obfuscatedHtml);
    console.log('✅ Obfuscated inline scripts');

    // 4. Update asset references
    const assetFiles = glob.sync(`${buildDir}/**/*.{js,css,png,jpg,jpeg,svg,gif,webp}`);
    const manifest = {};

    // Create manifest of hashed assets
    assetFiles.forEach((file) => {
        const fileExt = path.extname(file);
        if (fileExt === '.html') return;

        const fileBuffer = fs.readFileSync(file);
        const hash = crypto.createHash('sha1').update(fileBuffer).digest('hex').slice(0, 8);
        const originalName = path.basename(file);
        const newName = `${path.basename(file, fileExt)}.${hash}${fileExt}`;
        manifest[originalName] = newName;
    });

    // Update HTML with hashed asset references
    const htmlContentUpdated = obfuscatedHtml;
    for (const [originalName, newName] of Object.entries(manifest)) {
        const regex = new RegExp(originalName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        const updatedHtml = htmlContentUpdated.replace(regex, newName);
        fs.writeFileSync(htmlPath, updatedHtml);
    }
    console.log('✅ Updated asset references');

    console.log('✅ HTML generation and protection complete');
}

generateHTML().catch(console.error);
