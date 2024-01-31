import fs from 'fs/promises';
import createDir from './createDir.js';
import getDirentObject from './getDirentObject.js';
import tryCatch from './tryCatch.js';
import { getLogger } from '../utils/index.js';

export async function saveFile(absPath, content) {
    const saveFileFunction = async () => await fs.writeFile(absPath, content);
    return tryCatch(
        saveFileFunction,
        async (e) => {
            getLogger().warn(8, `Failed to save file ${absPath}, attempting to create missing directories and save again`, `(${e.name}: ${e.message})`),
            await createDir(getDirentObject(absPath).dir);
            await saveFileFunction();
        },
        (e) => e.code !== 'ENOENT',
    );
}

export default saveFile;
