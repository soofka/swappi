import fs from 'fs/promises';

export async function loadFile(absPath, options = { encoding: 'utf8' }) {
    let file;
    try {
        file = await fs.readFile(absPath, options);
    } catch(e) {
        if (!e.code === 'ENOENT') {
            throw e;
        }
    }
    return file;
}

export default loadFile;
