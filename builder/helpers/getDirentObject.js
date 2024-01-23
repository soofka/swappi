import path from 'path';

export function getDirentObject(absPath) {
    return path.parse(absPath);
}

export default getDirentObject;
