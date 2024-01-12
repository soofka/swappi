import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { minify } from 'minify';

const SRC = path.resolve('src');
const DIST = path.resolve('dist');

const IMAGE_WIDTHS = [256, 320, 640, 1280, 1920, 2560];
const MINIFY_OPTIONS = {
    js: {
        mangle: true,
        mangleClassNames: true,
        removeUnusedVariables: true,
        removeConsole: true,
        removeUselessSpread: true,
    },
    img: {
        maxSize: 4096,
    },
    html: {
        removeComments: false,
        removeCommentsFromCDATA: true,
        removeCDATASectionsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeEmptyElements: false,
        removeOptionalTags: false,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true,
    },
    css: {
        compatibility: '*',
    },
};

async function build() {
    await resetDistDir();
    const files = sortDir(await readDir(SRC));
    console.log(files);
    const imgMap = await parseImgFiles(files.img);
    console.log(imgMap);
    // await parseHtmlFiles(files.html);
    // await parseCssFiles(files.css);
    // await parseJsFiles(files.js);
    // await parseJsonFiles(files.json);
    // await parseOtherFiles(files.other);
}

async function resetDistDir() {
    // make it remove dist
    try {
        await fs.stat(DIST);
    } catch(e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
        fs.mkdir(DIST);
    }
}

function sortDir(dir, files = undefined) {
    if (!files) {
        files = {
            html: [],
            css: [],
            js: [],
            json: [],
            img: [],
            other: [],
        };
    }

    for (let item of dir.content) {
        if (item.isDir) {
            sortDir(item, files);
        } else if (item.type === '.html') {
            files.html.push(item);
        } else if (item.type === '.css') {
            files.css.push(item);
        } else if (item.type === '.js') {
            files.js.push(item);
        } else if (['.json', '.webmanifest'].includes(item.type)) {
            files.json.push(item);
        } else if (['.png', '.jpg', '.jpeg'].includes(item.type)) {
            files.img.push(item);
        } else {
            files.other.push(item);
        }
    }

    return files;
}

async function readDir(rootDirAbsPath, currentDirRelPath = '') {
    const dirPath = path.join(rootDirAbsPath, currentDirRelPath);
    const dir = await fs.readdir(dirPath, { withFileTypes: true });
    const dirMap = {
        isDir: true,
        name: path.basename(dirPath),
        absPath: path.dirname(dirPath),
        relPath: currentDirRelPath,
        content: [],
    };

    for (let item of dir) {
        if (item.isFile()) {
            const ext = path.extname(item.name);
            dirMap.content.push({
                absPath: dirPath,
                relPath: currentDirRelPath,
                name: path.basename(item.name, ext),
                type: ext,
            });
        } else if (item.isDirectory()) {
            dirMap.content.push(await readDir(rootDirAbsPath, path.join(currentDirRelPath, item.name)));
        }
    }

    return dirMap;
}

async function parseImgFiles(imgFiles) {
    const imgMap = {};

    for (let file of imgFiles) {
        const srcFileAbsPath = path.join(file.absPath, `${file.name}${file.type}`);
        const srcFileRelPath = path.join(file.relPath, `${file.name}${file.type}`);
        const imgWidthVersions = [];
    
        for (let width of IMAGE_WIDTHS) {
            const imgTypeVersions = {};
            const distFileName = `${file.name}-${width}`;

            const webpDistRelPath = path.join(file.relPath, `${distFileName}.webp`);
            await parseFile(
                srcFileAbsPath,
                path.join(DIST, webpDistRelPath),
                async (srcPath) => await sharp(srcPath).resize(width).webp().toBuffer(),
            );
            imgTypeVersions.webp = webpDistRelPath;

            const avifDistRelPath = path.join(file.relPath, `${distFileName}.avif`);
            await parseFile(
                srcFileAbsPath,
                path.join(DIST, avifDistRelPath),
                async (srcPath) => await sharp(srcPath).resize(width).avif().toBuffer(),
            );
            imgTypeVersions.avif = avifDistRelPath;

            const jpegDistRelPath = path.join(file.relPath, `${distFileName}.jpeg`);            
            await parseFile(
                srcFileAbsPath,
                path.join(DIST, jpegDistRelPath),
                async (srcPath) => await sharp(srcPath).resize(width).jpeg().toBuffer(),
            );
            imgTypeVersions.jpeg = jpegDistRelPath;

            imgWidthVersions.push(imgTypeVersions);
        }

        imgMap[srcFileRelPath] = imgWidthVersions;
    }

    return imgMap;
}

async function parseHtmlFiles(htmlFiles) {
    for (let file of htmlFiles) {
        // substitute variables from config
        // replace imgs with responsive
        // prepopulate labels
        // set defaults to styling
        await minifyFile(file);
    }
}

async function parseCssFiles(cssFiles) {
    for (let file of cssFiles) {
        // substitute variables from config
        // replace imgs with responsive
        await minifyFile(file);
    }
}

async function parseJsFiles(jsFiles) {
    for (let file of jsFiles) {
        await minifyFile(file);
    }
}

async function parseJsonFiles(jsonFiles) {
    for (let file of jsonFiles) {
        await parseFile(
            path.join(SRC, file),
            path.join(DIST, file),
            async (srcPath) => {
                const fileContent = await fs.readFile(srcPath);
                return JSON.stringify(JSON.parse(fileContent));
            },
        );
    }
}

async function parseOtherFiles(otherFiles) {
    for (let file of otherFiles) {
        await parseFile(path.join(SRC, file), path.join(DIST, file));
    }
}

async function minifyFile(file) {
    await parseFile(
        path.join(SRC, file),
        path.join(DIST, file),
        async (srcPath) => await minify(srcPath, MINIFY_OPTIONS),
    );
}

async function parseFile(srcPath, distPath, parseFunction = fs.readFile) {
    console.log(`Trying to parse file ${srcPath} to ${distPath}`);
    try {
        await fs.writeFile(distPath, await parseFunction(srcPath));
        console.log(`Successfully parsed file ${srcPath} to ${distPath}`);
    } catch(e) {
        console.warn(`Failed to parse file ${srcPath}: ${e}`);
        await fs.copyFile(srcPath, distPath);
        console.log(`Successfully copied file ${srcPath} to ${distPath}`);
    }
}

build();
