import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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
            src: path.resolve('src'),
            dist: path.resolve('dist'),
            static: path.resolve(path.join('src','static')),
            partials: path.resolve(path.join('src','partials')),
            templates: path.resolve(path.join('src','tempaltes')),
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
            static: {},
            partials: {},
            templates: {},
            generated: {},
        },
        dist: {
            old: {},
            new: {},
        },
    },

    // srcFiles: {},
    // distFiles: {},
    // partialFiles: {},
    // templateFiles: {},

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

    initSrc: async function() {
        await this.initTemplates();
        await this.initPartials();
        await this.initStatics();
    },

    initTemplates: async function() {
        const dir = await readDirRec(this.config.paths.templates);
        this.files.src.templates = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER, 2);

        for (let group of Object.keys(FILES_GROUP_MAP)) {
            for (let template of this.files.src.templates[group]) {
                // is is cross-env?
                const module = await loadModule(template.full);
                if (typeof module === 'function') {
                    const resultContent = module(this.config.data);
                    const resultPath = path.join(this.config.paths.generated, template.rel, template.name);
                    await writeFile(resultPath, resultContent);
                } else if (typeof module === 'object') {
                    for (let key of Object.keys(module)) {
                        const resultContent = module[key](this.config.data);
                        const dotIndex = template.name.lastIndexOf('.');
                        const resultName = `${template.name.substring(0, dotIndex)}${key}${template.name.substring(dotIndex)}`;
                        const resultPath = path.join(this.config.paths.generated, template.rel, resultName);
                        await writeFile(resultPath, resultContent);
                    }
                }
            }
        }
    },

    initPartials: async function() {
        const dir = await readDirRec(this.config.paths.partials);
        this.files.src.partials = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER, 2);

        for (let group of Object.keys(FILES_GROUP_MAP)) {
            for (let partial of this.files.src.partials[group]) {
                if (!partial.module) {
                    partial.module = await loadModule(partial.full);
                }
            }
        }
    },

    initStatics: async function() {
        const dir = await readDirRec(this.config.src);
        this.files.src.static = groupDirByFileTypeRec(dir, FILES_GROUP_MAP, OTHER);
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
        for (let group of Object.keys(FILES_GROUP_MAP)) {
            this.files.dist.new[group] = [];
        }
    },

    parseImgFiles: async function() {
        const CURRENT = 'CURRENT';
        for (let file of this.files.src.static.img) {
            const srcFileContent = await readFile(file.full);
            file.hash = getFileHash(srcFileContent, HASH_ALGORITHM);

            const srcFileUnchanged = this.files.dist.old.img.some(
                (oldFile) => oldFile.name === file.name && oldFile.ext === file.ext && oldFile.hash === file.hash
            );

            for (let width of [CURRENT, ...this.config.options.optimize.img.widths]) {
                const isCurrentWidth = width === CURRENT;
                const distFileName = isCurrentWidth ? file.name : `${file.name}-${width}`;

                for (let type of [CURRENT, ...this.config.options.optimize.img.types]) {
                    const newFile = {...file};
                    newFile.name = distFileName;

                    const isCurrentType = type === CURRENT;
                    if (!isCurrentType) {
                        newFile.ext = `.${type}`;
                    }
                    newFile.base = `${newFile.name}${newFile.ext}`;

                    const distFileExists = this.files.dist.old.img.some(
                        (oldFile) => oldFile.name === newFile.name && oldFile.ext === newFile.ext
                    );

                    if (this.config.options.force || !srcFileUnchanged || !distFileExists) {
                        let newFileContent = '';
                        if (isCurrentWidth && isCurrentType) {
                            newFileContent = await readFile(newFile.full);
                        } else if (isCurrentWidth && !isCurrentType) {
                            newFileContent = await sharp(newFile.full)[type]().toBuffer();
                        } else if (!isCurrentWidth && isCurrentType) {
                            newFileContent = await sharp(newFile.full).resize(width).toBuffer();
                        } else if (!isCurrentWidth && !isCurrentType) {
                            newFileContent = await sharp(newFile.full).resize(width)[type]().toBuffer();
                        }

                        await this.saveFile(newFile, newFileContent);
                    }
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

    saveFile: async function(file, content) {
        if (this.config.options.hash) {
            file.hash = getFileHash(content, HASH_ALGORITHM);
            file.base = `${file.name}${HASH_SEPARATOR}${file.hash}${file.ext}`;
        }
        const absPath = path.join(this.config.dist, file.rel, file.base);
        const fileGroup = Object.keys(FILES_GROUP_MAP).find((key) => FILES_GROUP_MAP[key].includes(file.ext)) || OTHER;
        this.distFiles[fileGroup].push(createFileObject(absPath, file.rel));
        await writeFile(absPath, content);
    },

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

function isObject(obj){
    return obj && typeof obj === 'object';
}

function deepMerge(target, source) { 
    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    for (let key of Object.keys(source)) {
        const targetValue = target[key];
        const sourceValue = source[key];

        // if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        //     target[key] = targetValue.concat(sourceValue);
        // }
        target[key] = isObject(targetValue) && isObject(sourceValue)
            ? deepMerge(Object.assign({}, targetValue), sourceValue)
            : target[key] = sourceValue;
    }

    return target;
}