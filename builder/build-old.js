import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

import TemplateFile from './files/TemplateFile';
import groupDirByFileType from './helpers/groupDirByFileType';

import sharp from 'sharp';
import * as cheerio from 'cheerio';
import { minify as minifyHtml } from 'html-minifier';
import css from 'css';
import CleanCSS from 'clean-css';
import { minify as minifyJs } from 'terser';

export const build = (config) => builder.init(config).build();

const OTHER = 'other';
const HASH_ALGORITHM = 'sha256';
const HASH_SEPARATOR = '+';
const HTML_PARTIAL_ATTRIBUTE = 'data-swapp-partial';
const CSS_PARTIAL_DECLARATION = '-swapp-partial';
const FILES_GROUP_MAP = {
    html: ['.html'],
    css: ['.css'],
    js: ['.js'],
    json: ['.json', '.webmanifest'],
    img: ['.avif', '.webp', '.gif', '.png', '.jpg', '.jpeg', '.svg'],
};

const builder = {
    
    config: {
        paths: {
            dist: path.resolve('dist'),
            public: path.resolve(path.join('src','public')),
            partials: path.resolve(path.join('src','partials')),
            templates: path.resolve(path.join('src','templates')),
            generated: path.resolve(path.join('src','generated')),
        },
    
        options: {
            hash: true,
            force: false,

            optimize: {
                js: {},
                img: {
                    widths: [256, 320, 640, 1280, 1920, 2560],
                    types: ['webp', 'avif', 'jpeg'],
                },
                html: {
                    removeComments: false,
                    removeCommentsFromCDATA: true,
                    removeCDATASectionsFromCDATA: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeEmptyElements: false,
                    removeOptionalTags: false,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    minifyJS: true,
                    minifyCSS: true,
                },
                css: {
                    compatibility: '*',
                },
            },
        },
    },

    files: {
        src: {
            public: {},
            partials: {},
            templates: {},
            generated: {},
        },
        dist: {
            old: {},
            new: {},
        },
    },

    init: async function(config) {
        this.initConfig(config);
        await this.initSrc();
        await this.initDist();
        return this;
    },

    build: async function() {
        await this.parseImgFiles();
        await this.parseCssFiles();
        await this.parseJsFiles();
        await this.parseJsonFiles();
        await this.parseHtmlFiles();
        await this.parseOtherFiles();
    },

    initConfig: function(config) {
        this.config = deepMerge(this.config, config);
    },

    initPreviousBuildData: function() {

    },

    initSrc: async function() {
        await this.initTemplates();
        await this.initPartials();
        await this.initPublic();
    },

    initTemplates: async function() {
        this.files.src.templates = await groupDirByFileType(this.config.paths.templates, FILES_GROUP_MAP, OTHER, 2, true);

        for (let group of Object.keys(this.files.src.templates)) {
            for (let file of this.files.src.templates[group]) {
                // is is cross-env?
                if (typeof moduleDefault === 'function') {
                    const resultContent = moduleDefault(this.config.data);
                    const resultPath = path.join(this.config.paths.generated, file.rel, file.name);
                    await writeFile(resultPath, resultContent);
                } else if (typeof moduleDefault === 'object') {
                    for (let key of Object.keys(module)) {
                        const resultContent = moduleDefault[key](this.config.data);
                        const dotIndex = file.name.lastIndexOf('.');
                        const resultName = `${file.name.substring(0, dotIndex)}${key}${file.name.substring(dotIndex)}`;
                        const resultPath = path.join(this.config.paths.generated, file.rel, resultName);
                        await writeFile(resultPath, resultContent);
                    }
                }
            }
        }
    },

    initPartials: async function() {
        const dir = await readDirRec(this.config.paths.partials);
        this.files.src.partials = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER, 2);

        for (let group of Object.keys(this.files.src.partials)) {
            for (let file of this.files.src.partials[group]) {
                if (!file.module) {
                    const module = await loadModule(file.full);
                    file.module = module.default;
                    file.hash = getFileHash(file, HASH_ALGORITHM);
                }
            }
        }
    },

    initPublic: async function() {
        const dir = await readDirRec(this.config.paths.public);
        this.files.src.public = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER);

        for (let group of Object.keys(this.files.src.public)) {
            for (let file of this.files.src.public[group]) {
                file.content = await readFile(file.full);
                file.hash = getFileHash(file.content, HASH_ALGORITHM);
            }
        }
    },

    initDist: async function() {
        await this.initOldDist();
        this.initNewDist();
    },

    initOldDist: async function() {
        const dir = await readDirRec(this.config.paths.dist);
        this.files.dist.old = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER);
    },

    initNewDist: function() {
        this.files.dist.new = {};
        for (let group of [...Object.keys(FILES_GROUP_MAP), OTHER]) {
            this.files.dist.new[group] = [];
        }
    },

    parseImgFiles: async function() {
        const CURRENT = 'CURRENT';
        for (let file of this.files.src.public.img) {
            const srcFileUnchanged = this.checkIfFileUnchanged('img', file);

            for (let width of [CURRENT, ...this.config.options.optimize.img.widths]) {
                const isCurrentWidth = width === CURRENT;
                const distFileName = isCurrentWidth ? file.name : `${file.name}-${width}`;

                for (let type of [CURRENT, ...this.config.options.optimize.img.types]) {
                    const isCurrentType = type === CURRENT;

                    const newFile = {...file, name: distFileName};
                    if (!isCurrentType) {
                        newFile.ext = `.${type}`;
                    }

                    const distFileExists = this.files.dist.old.img.some(
                        (oldFile) => oldFile.name === newFile.name && oldFile.ext === newFile.ext
                    );

                    if (this.config.options.force || !srcFileUnchanged || !distFileExists) {
                        if (isCurrentWidth && !isCurrentType) {
                            newFile.content = await sharp(newFile.content)[type]().toBuffer();
                        } else if (!isCurrentWidth && isCurrentType) {
                            newFile.content = await sharp(newFile.content).resize(width).toBuffer();
                        } else if (!isCurrentWidth && !isCurrentType) {
                            newFile.content = await sharp(newFile.content).resize(width)[type]().toBuffer();
                        }

                        newFile.changed = true;
                    } else {
                        newFile.changed = false;
                    }

                    this.moveFileToDist(newFile);
                }
            }
        }
    },

    parseHtmlFiles: async function () {
        for (let file of this.srcFiles.html) {
            const srcFileUnchanged = this.checkIfFileUnchanged('html', file);
            const qs = cheerio.load(file.content);

            for (let partial of this.files.src.partials.html) {
                const partialName = partial.name.substring(0, partial.name.lastIndexOf('.'));

                for (let partialObject of qs(`[${HTML_PARTIAL_ATTRIBUTE}]`)) {
                    if (partialObject.attribs[HTML_PARTIAL_ATTRIBUTE] === partialName) {
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
        for (let file of this.files.src.public.css) {
            const fileContent = await readFile(file.full);
            const fileContentParsed = css.parse(fileContent);

            for (let partial of this.partialFiles.css) {
                const partialName = partial.name.substring(0, partial.name.lastIndexOf('.'));

                for (let rule of fileContentParsed.stylesheet.rules) {
                    if (rule.type === 'rule') {
                        for (let declaration of rule.declarations) {
                            if (declaration.type === 'declaration') {
                                const declarationName = declaration.value.substring(1).split(':')[0];

                                if (declaration.property === CSS_PARTIAL_DECLARATION && declarationName === partialName) {
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

    checkIfFileUnchanged: function(group, file) {
        return this.files.dist.old[group].some((oldFile) => oldFile.name === file.name && oldFile.ext === file.ext && oldFile.hash === file.hash);
    },

    moveFileToDist: function(file) {
        const absPath = path.join(this.config.dist, file.rel, file.base);
        const fileGroup = Object.keys(FILES_GROUP_MAP).find((key) => FILES_GROUP_MAP[key].includes(file.ext)) || OTHER;
        this.files.dist.new[fileGroup].push(createFileObject(absPath, file.rel));
    },

    saveFiles: function() {
        for (let group of Object.keys(this.files.dist.new)) {
            for (let file of this.files.dist.new[group]) {
                if (file.changed) {
                    // hmm
                }
            }
        }
    },

    saveFile: async function(file, content) {
        if (this.config.options.hash) {
            file.base = `${file.name}${HASH_SEPARATOR}${file.hash}${file.ext}`;
        }
        const absPath = path.join(this.config.dist, file.rel, file.base);
        const fileGroup = Object.keys(FILES_GROUP_MAP).find((key) => FILES_GROUP_MAP[key].includes(file.ext)) || OTHER;
        this.distFiles[fileGroup].push(createFileObject(absPath, file.rel));
        await writeFile(absPath, content);
    },

}


function createFileObject(fullPath, relPath, isDir = false) {
    const fileObject = {
        ...path.parse(fullPath),
        full: fullPath,
        rel: relPath,
    };

    const hashSeparatorIndex = fileObject.name.lastIndexOf(HASH_SEPARATOR);
    if (hashSeparatorIndex >= 0) {
        fileObject.hash = fileObject.name.substring(hashSeparatorIndex + 1);
        fileObject.name = fileObject.name.substring(0, hashSeparatorIndex);
    }

    if (isDir) {
        fileObject.isDir = true;
        fileObject.content = [];
    }

    return fileObject;
}

function getFileHash(content, algorithm) {
    return crypto.createHash(algorithm).update(content).digest('hex');
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

async function resetDir(absPath) {
    try {
        await fs.rm(absPath, { recursive: true });
    } catch(e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }
    await fs.mkdir(absPath, { recursive: true });
}


// -----------------------------

// import Directory from '../files/Directory.js';

// export async function groupDirByFileType(absPath, fileTypeGroups, other = false, extLevel = 1) {
//     const directory = new Directory(absPath, '', fileType);
//     await directory.load();
//     return groupDirByFileTypeRec(directory, fileTypeGroups, other, extLevel);
// }

// function groupDirByFileTypeRec(directory, fileTypeGroups, other = false, extLevel = 1, fileGroups = {}) {
//     for (let group of Object.keys(fileTypeGroups)) {
//         if (!fileGroups.hasOwnProperty(group)) {
//             fileGroups[group] = [];
//         }
//     }

//     if (other && !fileGroups.hasOwnProperty(other)) {
//         fileGroups[other] = [];
//     }

//     for (let item of directory.dirents) {
//         if (item.isDir()) {
//             fileGroups = groupDirByFileTypeRec(item, fileTypeGroups, other, extLevel, fileGroups);
//         } else {
//             let matched = false;
//             const baseSections = item.base.split('.');

//             if (extLevel <= baseSections.length) {
//                 const ext = `.${baseSections[baseSections.length - extLevel]}`;
//                 for (let group of Object.keys(fileTypeGroups)) {
//                     if (fileTypeGroups[group].includes(ext)) {
//                         fileGroups[group].push(item);
//                         matched = true;
//                         break;
//                     }
//                 }
//             }
//             if (!matched && other) {
//                 fileGroups[other].push(item);
//             }
//         }
//     }

//     return fileGroups;
// }

// export default groupDirByFileType;
