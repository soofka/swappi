import File from './File.js';
import { findInArray, isInArray } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class FileWithPartials extends File {

    #partials = {};

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    preparePartials(partialsDirectory, partialElements, getPartialNameFunction) {
        getLogger().log(7, `Preparing partials for file ${this.src.rel} [partialsDirectory=${partialsDirectory}, partialElements=${partialElements}, getPartialNameFunction=${getPartialNameFunction}]`);

        for (let partialElement of partialElements) {
            const partialName = getPartialNameFunction(partialElement);

            if (Object.keys(this.#partials).includes(partialName)) {
                this.#partials[partialName].elements.push(partialElement);
            } else {
                const partialFile = findInArray(
                    partialsDirectory.allFiles,
                    (fileElement) => isInArray(
                        fileElement.dist,
                        (distElement) => distElement.ext === this.src.ext && distElement.name === partialName,
                    ),
                );

                this.#partials[partialName] = {
                    elements: [partialElement],
                    file: partialFile,
                };

                if (partialFile && partialFile.modified) {
                    this.modified = true;
                }
            }
        }

        getLogger().log(7, `Preparing partials for file ${this.src.rel} finished`);
        return this;
    }

    executePartials(replaceFunction, stringifyFunction) {
        let content = this.content;

        for (let key of Object.keys(this.#partials)) {
            for (let element of this.#partials[key].elements) {
                // what about multi export partials?
                content = replaceFunction(
                    element,
                    this.#partials[key].file.module(element, getConfig().data), // FILES???
                );
            }
        }
        
        return stringifyFunction(content);
    }

}

export default FileWithPartials;
