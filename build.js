import path from 'path';
import fs from 'fs/promises';
import { minify } from 'minify';

const SRC = path.resolve('src');
const DIST = path.resolve('dist');
const MINIFY_OPTIONS = {
    html: {
        removeAttributeQuotes: false,
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
    try {
        await fs.writeFile(distFilePath, await minify(srcFilePath, MINIFY_OPTIONS));
    } catch(e) {
        await fs.copyFile(srcFilePath, distFilePath);
    }
});

// // const a = async () => {
// //     const res = await minify('src/index.html');
// //     console.log('res', res);
// // };

// // await a();