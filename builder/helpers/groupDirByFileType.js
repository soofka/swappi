import Directory from '../files/Directory.js';

export async function groupDirByFileType(absPath, fileTypeGroups, other = false, extLevel = 1) {
    const directory = new Directory(absPath);
    await directory.load();
    return groupDirByFileTypeRec(directory, fileTypeGroups, other, extLevel);
}

function groupDirByFileTypeRec(directory, fileTypeGroups, other = false, extLevel = 1, fileGroups = {}) {
    for (let group of Object.keys(fileTypeGroups)) {
        if (!fileGroups.hasOwnProperty(group)) {
            fileGroups[group] = [];
        }
    }

    if (other && !fileGroups.hasOwnProperty(other)) {
        fileGroups[other] = [];
    }

    for (let item of directory.dirents) {
        if (item.isDir()) {
            fileGroups = groupDirByFileTypeRec(item, fileTypeGroups, other, extLevel, fileGroups);
        } else {
            let matched = false;
            const baseSections = item.base.split('.');

            if (extLevel <= baseSections.length) {
                const ext = `.${baseSections[baseSections.length - extLevel]}`;
                for (let group of Object.keys(fileTypeGroups)) {
                    if (fileTypeGroups[group].includes(ext)) {
                        fileGroups[group].push(item);
                        matched = true;
                        break;
                    }
                }
            }
            if (!matched && other) {
                fileGroups[other].push(item);
            }
        }
    }

    return fileGroups;
}

export default groupDirByFileType;
