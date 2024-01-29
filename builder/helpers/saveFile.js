import fs from 'fs/promises';

export async function saveFile(absPath, content) {
    await fs.writeFile(absPath, content);
}

export default saveFile;
