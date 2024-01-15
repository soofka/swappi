import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';
import { minify as minifyHtml } from 'html-minifier';
import css from 'css';
import CleanCSS from 'clean-css';

export const build = (config) => builder.init(config);

const builder = {
    
    config: {},
    srcFiles: {},
    distFiles: {},
    partialFiles: {},
    templateFiles: {},
    filesGroupMap: {
        html: ['.html'],
        css: ['.css'],
        js: ['.js'],
        json: ['.json', '.webmanifest'],
        img: ['.png', '.jpg', '.jpeg'],
    },


    init: function(config) {
        // include config validation/default
        this.config = config;
        this.build();
    },

    build: async function() {
        await this.initDistDir();
        await this.initPartials();
        // console.log(this.partialFiles);
        await this.initTemplates();
        // console.log(this.templateFiles);
        await this.initSrcFiles();
        // console.log(this.srcFiles);
        await this.parseImgFiles();
        // console.log(this.distFiles);
        await this.parseCssFiles();
        // await this.parseJsFiles();
        // await this.parseJsonFiles();
        await this.parseHtmlFiles();
        // await this.parseOtherFiles();
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
        this.templateFiles = groupDirByFileTypeRec(dir, this.filesGroupMap, 2);

        for (let group of Object.keys(this.filesGroupMap)) {
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
        this.partialFiles = groupDirByFileTypeRec(dir, this.filesGroupMap, 2);

        for (let group of Object.keys(this.filesGroupMap)) {
            for (let partial of this.partialFiles[group]) {
                partial.module = await loadModule(partial.full);
            }
        }
    },

    initSrcFiles: async function() {
        const dir = await readDirRec(this.config.src);
        this.srcFiles = await groupDirByFileTypeRec(dir, this.filesGroupMap);
        this.distFiles = {};
    },

    parseImgFiles: async function() {
        const CURRENT = 'CURRENT';
        this.distFiles.img = [];

        for (let file of this.srcFiles.img) {
            for (let width of [CURRENT, ...this.config.options.optimize.img.widths]) {
                const isCurrentWidth = width === CURRENT;
                const distFileName = isCurrentWidth ? file.name : `${file.name}-${width}`;

                for (let type of [CURRENT, ...this.config.options.optimize.img.types]) {
                    const isCurrentType = type === CURRENT;
                    const distFileFullName = isCurrentType ? `${distFileName}${file.ext}` : `${distFileName}.${type}`;
                    const distFileAbsPath = this.getFileDistAbsPath(file, distFileFullName);

                    let parseFunction;
                    if (isCurrentWidth && isCurrentType) {
                        continue;
                    } else if (isCurrentWidth && !isCurrentType) {
                        parseFunction = async (srcPath) => await sharp(srcPath)[type]().toBuffer();
                    } else if (!isCurrentWidth && isCurrentType) {
                        parseFunction = async (srcPath) => await sharp(srcPath).resize(width).toBuffer();
                    } else if (!isCurrentWidth && !isCurrentType) {
                        parseFunction = async (srcPath) => await sharp(srcPath).resize(width)[type]().toBuffer();
                    }

                    const distFileContent = await parseFunction(file.full);
                    await writeFile(distFileAbsPath, distFileContent);
                    this.distFiles.img.push(createFileObject(distFileAbsPath, file.rel));
                }
            }
        }
    },

    parseHtmlFiles: async function () {
        for (let file of this.srcFiles.html) {
            const html = await readFile(file.full, { encoding: 'utf8' });
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

            await writeFile(this.getFileDistAbsPath(file), minifyHtml(qs.html(), this.config.options.optimize.html));
        }
    },
    
    parseCssFiles: async function() {
        const cssMinifier = new CleanCSS(this.config.options.optimize.css);
        for (let file of this.srcFiles.css) {
            const fileContent = await fs.readFile(file.full, 'utf8');
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

            await writeFile(this.getFileDistAbsPath(file), cssMinifier.minify(css.stringify(fileContentParsed)).styles);
        }
    },
    
    parseJsFiles: async function() {
        for (let file of this.files.js) {
            // await this.minifyFile(file);
        }
    },
    
    parseJsonFiles: async function() {
        // for (let file of this.files.json) {
        //     await this.parseFile(
        //         this.getFileSrcAbsPath(file),
        //         this.getFileDistAbsPath(file),
        //         async (srcPath) => {
        //             const fileContent = await fs.readFile(srcPath);
        //             return JSON.stringify(JSON.parse(fileContent));
        //         },
        //     );
        // }
    },
    
    parseOtherFiles: async function() {
        for (let file of this.files.other) {
            // await this.parseFile(
            //     this.getFileSrcAbsPath(file),
            //     this.getFileDistAbsPath(file),
            // );
        }
    },
    
    minifyFile: function(file) {
        // return this.parseFile(
        //     this.getFileSrcAbsPath(file),
        //     this.getFileDistAbsPath(file),
        //     async (srcPath) => {},//await minify(srcPath, this.config.options.minify),
        // );
    },

    getFileDistAbsPath: function(file, newFullName = undefined) {
        return path.join(this.config.dist, file.rel, newFullName ? newFullName : file.base);
    },

}

function groupDirByFileTypeRec(dir, fileTypeGroups, extLevel = 1, includeOther = true, fileGroups = {}) {
    for (let group of Object.keys(fileTypeGroups)) {
        if (!fileGroups.hasOwnProperty(group)) {
            fileGroups[group] = [];
        }
    }

    if (includeOther) {
        fileGroups.other = [];
    }

    for (let item of dir.content) {
        if (item.isDir) {
            fileGroups = groupDirByFileTypeRec(item, fileTypeGroups, extLevel, includeOther, fileGroups);
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
            if (!matched && includeOther) {
                fileGroups.other.push(item);
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

async function readFile(srcPath, options = {}) {
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