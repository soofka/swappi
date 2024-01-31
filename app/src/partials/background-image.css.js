import { findInArray, getDirentObject } from '../../../builder/helpers/index.js'; //fix this

const backgroundImage = (cssDeclaration, data, rootDirectory) => {
    const valueArray = [];
    console.log('HUH', cssDeclaration);
    const { name, ext } = getDirentObject(cssDeclaration.value.split(':')[1]);
    const imgFile = findInArray(rootDirectory.allFiles, (element) => element.src.name === name && element.src.ext === ext);

    if (imgFile) {
        for (let distIndex in file.dist) {
            const dist = file.dist[distIndex];
            // figure out values for x
            valueArray.push(`url("${dist.full}") type("image/${dist.ext.substring(1)}") ${(parseInt(distIndex) + 1)}x`);
        }
    }

    cssDeclaration.property = 'background-image';
    cssDeclaration.value = `image-set(${valueArray.join(',')})`;
    return cssDeclaration;
};

export default backgroundImage;
