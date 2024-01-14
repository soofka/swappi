import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';
import { minify as htmlMinify } from 'html-minifier';

export const build = (config) => builder.init(config);

const builder = {
    
    config: {},
    files: {
        html: [],
        css: [],
        js: [],
        json: [],
        img: [],
        other: [],
    },
    imgMap: {},

    init: function(config) {
        // include config validation/default
        this.config = config;
        this.build();
    },

    build: async function() {
        await this.initDistDir();
        await this.initTemplates();
        await this.initSrcFiles();
        console.log(this.files);
        await this.parseImgFiles();
        console.log(this.imgMap);
        await this.parseHtmlFiles();
        // await this.parseCssFiles();
        // await this.parseJsFiles();
        // await this.parseJsonFiles();
        // await this.parseOtherFiles();
        // rewrite build to use path.parse?
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

    initSrcFiles: async function() {
        const dir = await readDirRec(this.config.src);
        this.files = await groupDirByFileTypeRec(dir, {
            html: ['.html'],
            css: ['.css'],
            js: ['.js'],
            json: ['.json', '.webmanifest'],
            img: ['.png', '.jpg', '.jpeg'],
        });
    },

    initTemplates: async function() {
        const dir = await readDirRec(this.config.templates);
        for (let template of dir.content) {
            // is is cross-env?
            const modulePath = path.join('file:///', template.absPath, `${template.name}${template.type}`);
            const module = await import(modulePath);
            const moduleDefault = module.default;

            if (typeof moduleDefault === 'function') {
                const resultContent = moduleDefault(this.config.data);
                const resultPath = path.join(this.config.templatesOutput, template.relPath, template.name);
                try {
                    await fs.mkdir(path.dirname(resultPath), { recursive: true });
                } catch(e) {
                    if (e !== 'EEXIST') {
                        throw e;
                    }
                }
                await fs.writeFile(resultPath, resultContent);
            } else if (typeof moduleDefault === 'object') {
                for (let key of Object.keys(moduleDefault)) {
                    const resultContent = moduleDefault[key](this.config.data);
                    const dotIndex = template.name.lastIndexOf('.');
                    const resultName = `${template.name.substring(0, dotIndex)}${key}${template.name.substring(dotIndex)}`;
                    const resultPath = path.join(this.config.templatesOutput, template.relPath, resultName);
                    try {
                        await fs.mkdir(path.dirname(resultPath), { recursive: true });
                    } catch(e) {
                        if (e !== 'EEXIST') {
                            throw e;
                        }
                    }
                    await fs.writeFile(resultPath, resultContent);
                }
            }
        }
    },

    parseImgFiles: async function() {
        const CURRENT = 'CURRENT';

        for (let file of this.files.img) {
            const srcFileRelPath = path.join(file.relPath, `${file.name}${file.type}`);

            let imageWidths = [CURRENT];
            if (this.config.options.resizeImages) {
                imageWidths = this.config.options.resizedImagesWidths;
            }

            let imageTypes = [CURRENT]; 
            if (this.config.options.optimizeImages) {
                imageTypes = this.config.options.optimizedImagesTypes;
            }
            
            const imgWidthVersions = [];
        
            for (let width of imageWidths) {
                const isCurrentWidth = width === CURRENT;
                const distFileName = isCurrentWidth ? file.name : `${file.name}-${width}`;

                const imgTypeVersions = {};

                for (let type of imageTypes) {
                    const isCurrentType = type === CURRENT;
                    const distFileFullName = isCurrentType ? `${distFileName}${file.type}` : `${distFileName}.${type}`;
                    const distFileRelPath = path.join(file.relPath, distFileFullName);

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

                    await this.parseFile(
                        this.getFileSrcAbsPath(file),
                        this.getFileDistAbsPath(file, distFileFullName),
                        parseFunction,
                    );

                    imgTypeVersions[type] = distFileRelPath;
                }
    
                imgWidthVersions.push(imgTypeVersions);
            }
    
            this.imgMap[srcFileRelPath] = imgWidthVersions;
        }
    },

    parseHtmlFiles: async function () {
        for (let file of this.files.html) {
            // substitute variables from config
            // replace imgs with responsive
            // prepopulate labels
            // set defaults to styling
            const html = await readFile(this.getFileSrcAbsPath(file), { encoding: 'utf8' });
            const qs = cheerio.load(html);

            for (let img of qs('img')) {
                for (let attr of img.attributes) {
                    if (attr.name === 'src' && Object.keys(this.imgMap).includes(attr.value)) {
                        const imgObject = this.imgMap[attr.value];
                        const imgElement = qs(img);
                        imgElement.replaceWith(() => {
                            let picture = '<picture>';
                            for (let type of this.config.options.optimizedImagesTypes) {
                                picture += '<source srcet="';
                                for (let widthIndex in this.config.options.resizedImagesWidths) {
                                    picture += `${imgObject[widthIndex][type]} `;
                                    picture += `${this.config.options.resizedImagesWidths[widthIndex]}w`;
                                    if (widthIndex < this.config.options.resizedImagesWidths.length - 1) {
                                        picture += ', ';
                                    }
                                }
                                picture += `" type="image/${type}">`
                            }
                            picture += '</picture>';
                            return picture;
                        });
                        //         <picture>
                        //         ${this.config.options.optimizedImagesTypes.map((type) => `
                        //             <source
                        //                 srcset="${this.config.options.resizedImagesWidths.map((width, index) => `
                        //                     ${imgObject[index][type]} ${width}w
                        //                 `)}"
                        //                 type="image/${type}"
                        //             >
                        //         `)}
                        //         <!-- img fallback to be added -->
                        //     </picture>
                        // `);
                    }
                }
                // console.log('image from', file.name, img.attributes);
            }

            // qs('title').text('PARSOWANY ' + file.name);

            await writeFile(
                this.getFileDistAbsPath(file),
                htmlMinify(qs.html(), this.config.options.minify.html),
            );
        }
    },
    
    parseCssFiles: async function() {
        for (let file of this.files.css) {
            // substitute variables from config
            // replace imgs with responsive
            await this.minifyFile(file);
        }
    },
    
    parseJsFiles: async function() {
        for (let file of this.files.js) {
            await this.minifyFile(file);
        }
    },
    
    parseJsonFiles: async function() {
        for (let file of this.files.json) {
            await this.parseFile(
                this.getFileSrcAbsPath(file),
                this.getFileDistAbsPath(file),
                async (srcPath) => {
                    const fileContent = await fs.readFile(srcPath);
                    return JSON.stringify(JSON.parse(fileContent));
                },
            );
        }
    },
    
    parseOtherFiles: async function() {
        for (let file of this.files.other) {
            await this.parseFile(
                this.getFileSrcAbsPath(file),
                this.getFileDistAbsPath(file),
            );
        }
    },
    
    minifyFile: function(file) {
        return this.parseFile(
            this.getFileSrcAbsPath(file),
            this.getFileDistAbsPath(file),
            async (srcPath) => {},//await minify(srcPath, this.config.options.minify),
        );
    },

    parseFile: function(srcAbsPath, distAbsPath, parseFunction) {
        return parseFile(srcAbsPath, distAbsPath, parseFunction, fs.copyFile);
    },

    getFileSrcAbsPath: function(file) {
        return path.join(file.absPath, `${file.name}${file.type}`);
    },

    getFileDistAbsPath: function(file, newFullName = undefined) {
        return path.join(this.config.dist, file.relPath, newFullName ? newFullName : `${file.name}${file.type}`);
    },

}

async function groupDirByFileTypeRec(dir, fileTypeGroups, includeOther = true, fileGroups = {}) {
    for (let item of dir.content) {
        if (item.isDir) {
            fileGroups = await groupDirByFileTypeRec(item, fileTypeGroups, includeOther, fileGroups);
        } else {
            let matched = false;
            for (let group of Object.keys(fileTypeGroups)) {
                if (!fileGroups.hasOwnProperty(group)) {
                    fileGroups[group] = [];
                }
                if (fileTypeGroups[group].includes(item.type)) {
                    matched = true;
                    fileGroups[group].push(item);
                }
            }
            if (!matched) {
                if (!fileGroups.hasOwnProperty('other')) {
                    fileGroups.other = [];
                }
                fileGroups.other.push(item);
            }
        }
    }

    return fileGroups;
}

async function readDirRec(rootDirAbsPath, currentDirRelPath = '') {
    const dirPath = path.join(rootDirAbsPath, currentDirRelPath);
    const dir = await fs.readdir(dirPath, { withFileTypes: true });
    const dirMap = {
        isDir: true,
        name: path.basename(dirPath),
        absPath: path.dirname(dirPath),
        relPath: currentDirRelPath,
        content: [],
    };

    for (let item of dir) {
        if (item.isFile()) {
            const ext = path.extname(item.name);
            dirMap.content.push({
                absPath: dirPath,
                relPath: currentDirRelPath,
                name: path.basename(item.name, ext),
                type: ext,
            });
        } else if (item.isDirectory()) {
            dirMap.content.push(await readDirRec(rootDirAbsPath, path.join(currentDirRelPath, item.name)));
        }
    }

    return dirMap;
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

async function parseFile(srcPath, distPath, parseFunction = fs.readFile) {
    try {
        await fs.stat(distPath);
    } catch(e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
        fs.mkdir(path.dirname(distPath), { recursive: true });
    }

    try {
        await fs.writeFile(distPath, await parseFunction(srcPath));
    } catch(e) {
        console.warn(`Failed to parse file ${srcPath}: ${e}`);
        console.warn(`Falling back to copying file to ${distPath}`);
        try {
            await fs.copyFile(srcPath, distPath);
        } catch(e) {
            console.warn(`Failed to copy file ${srcPath} to ${distPath}`);
        }
    }
}
