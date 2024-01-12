import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { minify } from 'minify';
import { resolveTxt } from 'dns';

const SRC = path.resolve('src');
const DIST = path.resolve('dist');

const IMAGE_RESOLUTIONS = [
    [256, 144],
    [320, 240],
    [640, 480],
    [1280, 720],
    [1920, 1080],
    [2560, 1440],
];
const MINIFY_OPTIONS = {
    js: {
        mangle: true,
        mangleClassNames: true,
        removeUnusedVariables: true,
        removeConsole: false,
        removeUselessSpread: true,
    },
    img: {
        maxSize: 4096,
    },
    html: {
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeCDATASectionsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeEmptyElements: false,
        removeOptionalTags: true,
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

const files = await fs.readdir(SRC);
files.forEach(async (file) => {
    const srcFilePath = path.join(SRC, file);
    const distFilePath = path.join(DIST, file);
    const fileType = srcFilePath.substring(srcFilePath.lastIndexOf('.') + 1);

    try {
        if (['jpg', 'jpeg', 'png'].includes(fileType)) {
            IMAGE_RESOLUTIONS.forEach(async (resolution, index) => {
                await sharp(srcFilePath).resize(resolution[0]).toFile(`${distFilePath}-${index}`);
            });
        } else if (['json', 'webmanifest'].includes(fileType)) {
            const srcFileContent = await fs.readFile(srcFilePath);
            fs.writeFile(distFilePath, JSON.stringify(JSON.parse(srcFileContent)));
        } else if (['html', 'css', 'js'].includes(fileType)) {
            fs.writeFile(distFilePath, await minify(srcFilePath, MINIFY_OPTIONS));
        }
    } catch(e) {
        await fs.copyFile(srcFilePath, distFilePath);
    }
});
