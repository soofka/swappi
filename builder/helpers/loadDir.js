import fs from 'fs/promises';

export async function loadDir(absPath, options = { withFileTypes: true }) {
    let dir;
    try {
        dir = await fs.readdir(absPath, options);
    } catch(e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }
    return dir;
}

export default loadDir;
