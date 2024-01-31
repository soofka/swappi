import { findInArray, getDirentObject } from '../../../builder/helpers/index.js'; //fix this

const img = (htmlElement, data, rootDirectory) => {
    let picture = '<picture';
    for (let key of Object.keys(htmlElement.attribs)) {
        if (key !== 'name' && key !== 'src') {
            picture += ` ${key}="${htmlElement.attribs[key]}"`;
        }
    }
    picture += '>';

    const valueArray = [];
    const { name, ext } = getDirentObject(htmlElement.attribs.src);
    const imgFile = findInArray(rootDirectory.allFiles, (element) => element.src.name === name && element.src.ext === ext);

    if (imgFile) {
        for (let dist of file.dist) {
            // figure out values for w
            // figure out types???
            valueArray.push(`${dist.full} 400w`);
        }
        picture += `<source srcet="${valueArray.join(',')}" type="image/dupa">`;
    }

    return picture + '</picture>';
}

export default img;
