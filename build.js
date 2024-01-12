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

try {
    await fs.stat(DIST);
} catch(e) {
    if (e.code === 'ENOENT') {
        fs.mkdir(DIST);
    } else {
        console.error(e);
    }
}

const files = {
    html: [],
    css: [],
    js: [],
    json: [],
    img: [],
    others: [],
};

const parseFile = async (srcPath, distPath, parseFunction = fs.readFile) => {
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

Array.from(await fs.readdir(SRC)).forEach((file) => {
    const fileType = file.substring(file.lastIndexOf('.') + 1);

    switch (fileType) {
        case 'html':
            files.html.push(file);
            break;

        case 'css':
            files.css.push(file);
            break;

        case 'js':
            files.js.push(file);
            break;

        case 'json':
        case 'webmanifest':
            files.json.push(file);
            break;

        case 'png':
        case 'jpg':
        case 'jpeg':
            files.img.push(file);
            break;

        default:
            files.others.push(file);
            break;
    }
});

files.img.forEach(async (file) => {
    // build map for html and css?
    const srcFilePath = path.join(SRC, file);
    const srcFileName = file.substring(0, file.lastIndexOf('.'));

    IMAGE_WIDTHS.forEach(async (width) => {
        await parseFile(
            srcFilePath,
            path.join(DIST, `${srcFileName}-${width}.webp`),
            async (srcPath) => await sharp(srcPath).resize(width).webp().toBuffer(),
        );
        await parseFile(
            srcFilePath,
            path.join(DIST, `${srcFileName}-${width}.avif`),
            async (srcPath) => await sharp(srcPath).resize(width).avif().toBuffer(),
        );
        await parseFile(
            srcFilePath,
            path.join(DIST, `${srcFileName}-${width}.jpeg`),
            async (srcPath) => await sharp(srcPath).resize(width).jpeg().toBuffer(),
        );
    });
});

files.html.forEach(async (file) => {
    // replace imgs with responsive
    // prepopulate labels
    // set defaults to styling
    await parseFile(
        path.join(SRC, file),
        path.join(DIST, file),
        async (srcPath) => await minify(srcPath, MINIFY_OPTIONS),
    );
});

files.css.forEach(async (file) => {
    // replace imgs with responsive
    await parseFile(
        path.join(SRC, file),
        path.join(DIST, file),
        async (srcPath) => await minify(srcPath, MINIFY_OPTIONS),
    );
});

files.js.forEach(async (file) => {
    await parseFile(
        path.join(SRC, file),
        path.join(DIST, file),
        async (srcPath) => await minify(srcPath, MINIFY_OPTIONS),
    );
});

files.json.forEach(async (file) => {
    await parseFile(
        path.join(SRC, file),
        path.join(DIST, file),
        async (srcPath) => {
            const fileContent = await fs.readFile(srcPath);
            return JSON.stringify(JSON.parse(fileContent));
        },
    );
});

files.others.forEach(async (file) => {
    await parseFile(path.join(SRC, file), path.join(DIST, file));
});
