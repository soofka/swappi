import File from './File.js';
import { findInArray, isFunction, isInArray, isObject, tryCatch } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class FileWithPartials extends File {

    #partials = {};

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async preparePartials(partialsDirectory, partialElements, getPartialNameFunction) {
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

    async executePartials(replaceFunction, stringifyFunction, files) {
        let content = this.content;

        for (let key of Object.keys(this.#partials)) {
            for (let element of this.#partials[key].elements) {
                let elementContent;

                if (isFunction(this.#partials[key].file.module)) {
                    elementContent = this.#partials[key].file.module(element, getConfig().data, files);
                } else if (
                    isObject(this.#partials[key].file.module)
                    && this.#partials[key].file.module.hasOwnProperty('render')
                ) {
                    elementContent = this.#partials[key].file.module.render(element, getConfig().data, files);
                }
                
                if (elementContent) {
                    content = await tryCatch(
                        () => replaceFunction(element, elementContent),
                        (e) => getLogger().warn(8, `Failed to substitute partial in file ${this.src.rel} (key: ${key}, element: ${element}, elementContent: ${elementContent})`, `(${e.name}: ${e.message})`),
                        (e) => e.name !== 'TypeError',
                    );
                }
            }
        }
        
        content = await tryCatch(
            () => stringifyFunction(content),
            (e) => getLogger().warn(8, `Failed to stringify file ${this.src.rel} content after substituting partials`, `(${e.name}: ${e.message})`),
            (e) => e.name !== 'TypeError',
        );
        
        return content || this.content;
    }

}

export default FileWithPartials;
