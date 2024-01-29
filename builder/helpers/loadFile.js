import fs from 'fs/promises';

export async function loadFile(absPath, options = { encoding: 'utf8' }) {
    let content;
    try {
        content = await fs.readFile(absPath, options);
    } catch(e) {
        if (!e.code === 'ENOENT') {
            throw e;
        }
    }
    return content;
}

export default loadFile;
