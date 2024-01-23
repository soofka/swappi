import fs from 'fs/promises';
import crypto from 'crypto';
import Dirent from './Dirent.js';

export class File extends Dirent {

    #content = ''; get content() { return this.#content }
    #contentHash = ''; get contentHash() { return this.#contentHash }

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
        this.isDir = false;
    }

    async load() {
        this.#content = await fs.readFile(this.src.abs, { encoding: 'utf8' });
        this.#contentHash = crypto.createHash('shake256', { outputLength: 8 }).update(this.#content).digest('hex');
    }

    async executeAndSave(config) {
        for (let distIndex in this.dist) {
            const dist = this.dist[distIndex];
            const content = await this.execute(dist, distIndex, config);
            await this.save(dist, distIndex, content, config);
        }
    }

    async execute(dist, index, config) {
        return this.content;
    }

    async save(dist, distIndex, content, config) {
        await fs.writeFile(dist.abs, content);
    }

    serialize(src = true, dist = true, content = true) {
        const obj = { ...super.serialize(src, dist), contentHash: this.#contentHash };

        if (content) {
            obj.content = this.#content;
        }

        return obj;
    }

}

export default File;

const obj = {"src":{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src","name":"partials","ext":"","rel":""},"dist":[{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\public","name":"generated","ext":"","rel":""}],"content":[
    {"src":{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\partials","name":"background-image.css","ext":".js","rel":""},"dist":[{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\public\\generated","name":"background-image","ext":".css","rel":""}],"contentHash":"8ac85d496e60be0076e6c0fcfe4262b716ac67e71aebdd6501cf6cf150e9fc4b"},
    {"src":{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\partials","name":"head.html","ext":".js","rel":""},"dist":[{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\public\\generated","name":"head","ext":".html","rel":""}],"contentHash":"460e901b5e2cf72695ead148f10bb76cdb5086c7044ab44c172e539a8d4d80bb"},
    {"src":{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\partials","name":"img.html","ext":".js","rel":""},"dist":[{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\public\\generated","name":"img","ext":".html","rel":""}],"contentHash":"2885e6eee9dd17f5de8f54ecdc94e8dd3b1435ac8902cd73454de368a940ac0b"},
    {"src":{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\partials","name":"label.html","ext":".js","rel":""},"dist":[{"dir":"C:\\Users\\panso\\Documents\\Code\\swn.ski\\app\\src\\public\\generated","name":"label","ext":".html","rel":""}],"contentHash":"c2b73aab7d7109f007af237ff2494820ee4909d0c05d5236bbe81079b98929c3"}]}