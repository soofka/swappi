import css from 'css';
import CleanCSS from 'clean-css';
import FileWithPartials from './FileWithPartials.js';
import { isObject } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class CssFile extends FileWithPartials {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async prepare(isConfigModified, distPath, reportDirectory = undefined, additionalDirectories = undefined) {
        getLogger().log(7, `Preparing css file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`);
        super.prepare(isConfigModified, distPath, reportDirectory, additionalDirectories);

        if (isObject(additionalDirectories) && additionalDirectories.hasOwnProperty('partials')) {
            const contentParsed = css.parse(this.content);
            const partialElements = [];
            for (let rule of contentParsed.stylesheet.rules.filter((rule) => rule.type === 'rule')) {
                for (let declaration of rule.declarations.filter(
                    (declaration) => declaration.type === 'declaration'
                    && declaration.property === getConfig().constants.cssPartialDeclaration
                )) {
                    partialElements.push(declaration);
                }
            }

            await this.preparePartials(
                additionalDirectories.partials,
                partialElements,
                (partialElement) => partialElement.value.substring(1).split(':')[0],
            );
        }

        getLogger().log(7, `Css file ${this.src.rel} prepared (modified: ${this.modified}, dist length: ${this.dist.length})`);
        return this;
    }

    async execute(dist, index, rootDirectory) {
        const content = await this.executePartials(
            (element, content) => element = content,
            (content) => content ? css.stringify(content) : content,
            rootDirectory,
        );
        return new CleanCSS(getConfig().options.optimize.css).minify(content).styles;
    }

}

export default CssFile;
