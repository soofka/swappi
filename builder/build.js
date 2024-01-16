import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';
import { minify as minifyHtml } from 'html-minifier';
import css from 'css';
import CleanCSS from 'clean-css';
import { minify as minifyJs } from 'terser';

export const build = (config) => builder.init(config);

const OTHER = 'other';
const CURRENT = 'CURRENT';
const FILES_GROUP_MAP = {
    html: ['.html'],
    css: ['.css'],
    js: ['.js'],
    json: ['.json', '.webmanifest'],
    img: ['.avif', '.webp', '.gif', '.png', '.jpg', '.jpeg', '.svg'],
};

const builder = {
    
    config: {},
    srcFiles: {},
    distFiles: {},
    partialFiles: {},
    templateFiles: {},

    init: function(config) {
        // include config validation/default
        this.config = config;
        this.build();
    },

    build: async function() {
        await this.initPartials();
        await this.initTemplates();
        await this.initSrcFiles();
        await this.initDistDir();
        await this.initDistFiles();

        await this.parseImgFiles();
        await this.parseCssFiles();
        await this.parseJsFiles();
        await this.parseJsonFiles();
        await this.parseHtmlFiles();
        await this.parseOtherFiles();
    },

    initDistDir: async function() {
        try {
            await fs.rm(this.config.dist, { recursive: true });
        } catch(e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }
        await fs.mkdir(this.config.dist, { recursive: true });
    },

    initTemplates: async function() {
        const dir = await readDirRec(this.config.templates);
        this.templateFiles = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER, 2);

        for (let group of Object.keys(FILES_GROUP_MAP)) {
            for (let template of this.templateFiles[group]) {
                // is is cross-env?
                const module = await loadModule(template.full);
                if (typeof module === 'function') {
                    const resultContent = module(this.config.data);
                    const resultPath = path.join(this.config.templatesOutput, template.rel, template.name);
                    await writeFile(resultPath, resultContent);
                } else if (typeof module === 'object') {
                    for (let key of Object.keys(module)) {
                        const resultContent = module[key](this.config.data);
                        const dotIndex = template.name.lastIndexOf('.');
                        const resultName = `${template.name.substring(0, dotIndex)}${key}${template.name.substring(dotIndex)}`;
                        const resultPath = path.join(this.config.templatesOutput, template.rel, resultName);
                        await writeFile(resultPath, resultContent);
                    }
                }
            }
        }
    },

    initPartials: async function() {
        const dir = await readDirRec(this.config.partials);
        this.partialFiles = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER, 2);

        for (let group of Object.keys(FILES_GROUP_MAP)) {
            for (let partial of this.partialFiles[group]) {
                if (!partial.module) {
                    partial.module = await loadModule(partial.full);
                }
            }
        }
    },

    initSrcFiles: async function() {
        const dir = await readDirRec(this.config.src);
        this.srcFiles = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER);
    },

    initDistFiles: function() {
        this.distFiles = {};
        for (let group of Object.keys(FILES_GROUP_MAP)) {
            this.distFiles[group] = [];
        }
    },

    parseImgFiles: async function() {
        for (let file of this.srcFiles.img) {
            for (let width of [CURRENT, ...this.config.options.optimize.img.widths]) {
                const isCurrentWidth = width === CURRENT;
                const distFileName = isCurrentWidth ? file.name : `${file.name}-${width}`;

                for (let type of [CURRENT, ...this.config.options.optimize.img.types]) {
                    const isCurrentType = type === CURRENT;
                    file.name = isCurrentType ? `${distFileName}${file.ext}` : `${distFileName}.${type}`;
                    file.base = `${file.name}${file.ext}`;

                    let fileContent = '';
                    if (isCurrentWidth && isCurrentType) {
                        continue;
                    } else if (isCurrentWidth && !isCurrentType) {
                        fileContent = await sharp(file.full)[type]().toBuffer();
                    } else if (!isCurrentWidth && isCurrentType) {
                        fileContent = await sharp(file.full).resize(width).toBuffer();
                    } else if (!isCurrentWidth && !isCurrentType) {
                        fileContent = await sharp(file.full).resize(width)[type]().toBuffer();
                    }

                    await this.saveFile(file, fileContent);
                }
            }
        }
    },

    parseHtmlFiles: async function () {
        for (let file of this.srcFiles.html) {
            const html = await readFile(file.full);
            const qs = cheerio.load(html);

            for (let partial of this.partialFiles.html) {
                const partialName = partial.name.substring(0, partial.name.lastIndexOf('.'));

                for (let partialObject of qs('[partial]')) {
                    if (partialObject.attribs['partial'] === partialName) {
                        const partialElement = qs(partialObject);
                        partialElement.replaceWith(
                            partial.module(partialElement, partialObject.attribs, this.config, this.distFiles),
                        );
                    }
                }
            }

            await this.saveFile(file, minifyHtml(qs.html(), this.config.options.optimize.html));
        }
    },
    
    parseCssFiles: async function() {
        const cssMinifier = new CleanCSS(this.config.options.optimize.css);
        for (let file of this.srcFiles.css) {
            const fileContent = await readFile(file.full);
            const fileContentParsed = css.parse(fileContent);

            for (let partial of this.partialFiles.css) {
                const partialName = partial.name.substring(0, partial.name.lastIndexOf('.'));

                for (let rule of fileContentParsed.stylesheet.rules) {
                    if (rule.type === 'rule') {
                        for (let declaration of rule.declarations) {
                            if (declaration.type === 'declaration') {
                                const declarationName = declaration.value.substring(1).split(':')[0];

                                if (declaration.property === 'partial' && declarationName === partialName) {
                                    declaration = partial.module(declaration, this.config, this.distFiles);
                                }
                            }
                        }
                    }
                }
            }

            await this.saveFile(file, cssMinifier.minify(css.stringify(fileContentParsed)).styles);
        }
    },
    
    parseJsFiles: async function() {
        for (let file of this.srcFiles.js) {
            const fileContent = await readFile(file.full);
            const fileContentParsed = await minifyJs(fileContent, this.config.options.optimize.js);
            await this.saveFile(file, fileContentParsed.code);
        }
    },
    
    parseJsonFiles: async function() {
        for (let file of this.srcFiles.json) {
            const fileContent = await readFile(file.full);
            await this.saveFile(file, JSON.stringify(JSON.parse(fileContent)));
        }
    },
    
    parseOtherFiles: async function() {
        for (let file of this.srcFiles[OTHER]) {
            const fileContent = await readFile(file.full);
            await this.saveFile(file, fileContent);
        }
    },

    saveFile: async function(file, content) {
        const absPath = path.join(this.config.dist, file.rel, file.base);
        const fileGroup = Object.keys(FILES_GROUP_MAP).find((key) => FILES_GROUP_MAP[key].includes(file.ext)) || OTHER;
        this.distFiles[fileGroup].push(createFileObject(absPath, file.rel));
        await writeFile(absPath, content);
    },

}

function groupDirByFileTypeRec(dir, fileTypeGroups, other = false, extLevel = 1, fileGroups = {}) {
    for (let group of Object.keys(fileTypeGroups)) {
        if (!fileGroups.hasOwnProperty(group)) {
            fileGroups[group] = [];
        }
    }

    if (other) {
        fileGroups[other] = [];
    }

    for (let item of dir.content) {
        if (item.isDir) {
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

async function readDirRec(rootDirAbsPath, currentDirRelPath = '') {
    const dirPath = path.join(rootDirAbsPath, currentDirRelPath);
    const dir = await fs.readdir(dirPath, { withFileTypes: true });
    const dirMap = createFileObject(dirPath, currentDirRelPath, true);

    for (let item of dir) {
        if (item.isFile()) {
            dirMap.content.push(createFileObject(path.join(item.path, item.name), currentDirRelPath));
        } else if (item.isDirectory()) {
            dirMap.content.push(await readDirRec(rootDirAbsPath, path.join(currentDirRelPath, item.name)));
        }
    }

    return dirMap;
}


function createFileObject (fullPath, relPath, isDir = false) {
    const fileObject = {
        ...path.parse(fullPath),
        full: fullPath,
        rel: relPath,
    };

    if (isDir) {
        fileObject.isDir = true;
        fileObject.content = [];
    }

    return fileObject;
}

async function readFile(srcPath, options = { encoding: 'utf8' }) {
    const fileContent = await fs.readFile(srcPath, options);
    return fileContent;
}

async function writeFile(distPath, content) {
    try {
        await fs.stat(distPath);
    } catch(e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
        fs.mkdir(path.dirname(distPath), { recursive: true });
    }
    const result = await fs.writeFile(distPath, content);
    return result;
}

async function loadModule(absPath) {
    const module = await import(path.join('file:///', absPath));
    return module.default;
}