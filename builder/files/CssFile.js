import css from 'css';
import CleanCSS from 'clean-css';
import FileWithPartials from './FileWithPartials.js';
import { isObject } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class CssFile extends FileWithPartials {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async load() {
        await super.load();
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

    async execute(dist, index) {
        const content = await this.executePartials(
            (element, content) => element = content,
            (content) => content ? css.stringify(content) : content,
        );
        return new CleanCSS(getConfig().options.optimize.css).minify(content).styles;
    }

}

export default CssFile;


// parseCssFiles: async function() {
//     const cssMinifier = new CleanCSS(this.config.options.optimize.css);
//     for (let file of this.files.src.public.css) {
//         const fileContent = await readFile(file.full);
//         const fileContentParsed = css.parse(fileContent);

//         for (let partial of this.partialFiles.css) {
//             const partialName = partial.name.substring(0, partial.name.lastIndexOf('.'));

//             for (let rule of fileContentParsed.stylesheet.rules) {
//                 if (rule.type === 'rule') {
//                     for (let declaration of rule.declarations) {
//                         if (declaration.type === 'declaration') {
//                             const declarationName = declaration.value.substring(1).split(':')[0];

//                             if (declaration.property === CSS_PARTIAL_DECLARATION && declarationName === partialName) {
//                                 declaration = partial.module(declaration, this.config, this.distFiles);
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         await this.saveFile(file, cssMinifier.minify(css.stringify(fileContentParsed)).styles);
//     }
// },