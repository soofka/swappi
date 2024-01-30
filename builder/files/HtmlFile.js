import * as cheerio from 'cheerio';
import { minify } from 'html-minifier';
import FileWithPartials from './FileWithPartials.js';
import { isObject } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class HtmlFile extends FileWithPartials {

    #html;

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async prepare(isConfigModified, distPath, reportDirectory = undefined, additionalDirectories = undefined) {
        getLogger().log(7, `Preparing html file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`);
        super.prepare(isConfigModified, distPath, reportDirectory, additionalDirectories);

        if (isObject(additionalDirectories) && additionalDirectories.hasOwnProperty('partials')) {
            this.#html = cheerio.load(this.content);
            this.preparePartials(
                additionalDirectories.partials,
                this.#html(`[${getConfig().constants.htmlPartialAttribute}]`),
                (partialElement) => partialElement.attribs[getConfig().constants.htmlPartialAttribute],
            );
        }

        getLogger().log(7, `Html file ${this.src.rel} prepared (modified: ${this.modified}, dist length: ${this.dist.length})`);
        return this;
    }

    async execute(dist, index) {
        let content = this.content;

        if (this.#html) {
            content = this.executePartials(
                (element, content) => this.#html(element).replaceWith(content),
                () => this.#html.html(),
            );
        }

        // if (this.#html) {
        //     for (let key of Object.keys(this.partials)) {
        //         for (let element of this.partials[key].elements) {
        //             this.#html(element).replaceWith(
        //                 partial.module(element, getConfig().data), // FILES???
        //             );
        //         }
        //     }
        //     content = this.#html.html();
        // }

        return minify(content, getConfig().options.optimize.html);
    }

    

    // parseHtmlFiles: async function () {
    //     for (let file of this.srcFiles.html) {
    //         const srcFileUnchanged = this.checkIfFileUnchanged('html', file);
    //         const qs = cheerio.load(file.content);

    //         for (let partial of this.files.src.partials.html) {
    //             const partialName = partial.name.substring(0, partial.name.lastIndexOf('.'));

    //             for (let partialObject of qs(`[${HTML_PARTIAL_ATTRIBUTE}]`)) {
    //                 if (partialObject.attribs[HTML_PARTIAL_ATTRIBUTE] === partialName) {
    //                     const partialElement = qs(partialObject);
    //                     partialElement.replaceWith(
    //                         partial.module(partialElement, partialObject.attribs, this.config, this.distFiles),
    //                     );
    //                 }
    //             }
    //         }

    //         await this.saveFile(file, minifyHtml(qs.html(), this.config.options.optimize.html));
    //     }
    // },

}

export default HtmlFile;
