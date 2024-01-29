import fs from 'fs/promises';

export async function loadDir(absPath) {
    const dir = await fs.readdir(absPath, { withFileTypes: true });
    return dir;
}

export default loadDir;
