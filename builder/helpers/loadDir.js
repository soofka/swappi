import fs from 'fs/promises';
import tryCatch from './tryCatch.js';
import { getLogger } from '../utils/index.js';

export async function loadDir(absPath, options = { withFileTypes: true }) {
    return tryCatch(
        async () => await fs.readdir(absPath, options),
        (e) => getLogger().warn(8, `Failed to load dir ${absPath}`, e),
        (e) => e.code !== 'ENOENT',
    );
}

export default loadDir;
