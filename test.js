import fs from 'fs/promises';
import path from 'path';

(async () => {
    for (let dirent of await fs.readdir(path.resolve('app/dist'), { withFileTypes: true })) {
        console.log(dirent);
    }
})();