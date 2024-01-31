import fs from 'fs/promises';
import tryCatch from './tryCatch.js';
import { getLogger } from '../utils/index.js';

export async function loadFile(absPath, options = { encoding: 'utf8' }) {
    return tryCatch(
        async () => await fs.readFile(absPath, options),
        (e) => getLogger().warn(8, `Failed to load file ${absPath}`, e),
        (e) => e.code !== 'ENOENT',
    );
}

export default loadFile;
