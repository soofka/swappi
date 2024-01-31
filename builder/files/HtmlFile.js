import * as cheerio from 'cheerio';
import { minify } from 'html-minifier';
import FileWithPartials from './FileWithPartials.js';
import { isObject } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class HtmlFile extends FileWithPartials {

    #htmlParser;

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async prepare(isConfigModified, distPath, reportDirectory = undefined, additionalDirectories = undefined) {
        getLogger().log(7, `Preparing html file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`);
        super.prepare(isConfigModified, distPath, reportDirectory, additionalDirectories);

        if (isObject(additionalDirectories) && additionalDirectories.hasOwnProperty('partials')) {
            this.#htmlParser = cheerio.load(this.content);
            await this.preparePartials(
                additionalDirectories.partials,
                this.#htmlParser(`[${getConfig().constants.htmlPartialAttribute}]`),
                (partialElement) => partialElement.attribs[getConfig().constants.htmlPartialAttribute],
            );
        }

        getLogger().log(7, `Html file ${this.src.rel} prepared (modified: ${this.modified}, dist length: ${this.dist.length})`);
        return this;
    }

    async execute(dist, index, rootDirectory) {
        let content = this.content;

        if (this.#htmlParser) {
            content = await this.executePartials(
                (element, content) => this.#htmlParser(element).replaceWith(content),
                () => this.#htmlParser.html(),
                rootDirectory,
            );
        }

        return minify(content, getConfig().options.optimize.html);
    }
}

export default HtmlFile;
