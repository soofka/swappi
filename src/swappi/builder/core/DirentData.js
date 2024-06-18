import path from "path";
import crypto from "crypto";
import { getDirentObject, isInArray } from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

export class DirentData {
  #absDir = "";
  get absDir() {
    return this.#absDir;
  }
  set absDir(value = "") {
    this.#absDir = value;
  }
  #relDir = "";
  get relDir() {
    return this.#relDir;
  }
  set relDir(value = "") {
    this.#relDir = value;
  }
  #name = "";
  get name() {
    return this.#name;
  }
  set name(value = "") {
    this.#name = value;
  }
  #ext = "";
  get ext() {
    return this.#ext;
  }
  set ext(value = "") {
    this.#ext = value;
  }
  #content = "";
  get content() {
    return this.#content;
  }
  set content(value) {
    this.#content = value;
  }
  #contentEncoding = "";
  get contentEncoding() {
    return this.#contentEncoding;
  }
  set contentEncoding(value) {
    this.#contentEncoding = value;
  }
  #contentHash = "";
  get contentHash() {
    return this.#contentHash;
  }
  set contentHash(value = "") {
    this.#contentHash = value;
  }

  constructor(absPath, relDir = "") {
    this.init(absPath, relDir);
  }

  init(absPath, relDir) {
    if (absPath) {
      const obj = getDirentObject(absPath);
      this.#absDir = obj.dir;
      this.#name = obj.name;
      this.#ext = obj.ext;
      this.#contentHash = obj.contentHash;
    }
    if (relDir !== undefined) {
      this.#relDir = relDir;
    }
    return this;
  }

  resetContentHash(salt = "") {
    this.#contentHash = crypto
      .createHash(
        getConfig().hashOptions.algorithm,
        getConfig().hashOptions.algorithmOptions,
      )
      .update(`${this.#content}${salt}`)
      .digest("hex");
  }

  clone() {
    const clone = new DirentData();
    clone.absDir = this.#absDir;
    clone.relDir = this.#relDir;
    clone.name = this.#name;
    clone.ext = this.#ext;
    clone.content = this.#content;
    clone.contentEncoding = this.#contentEncoding;
    clone.contentHash = this.#contentHash;
    return clone;
  }

  isEqual(direntData, withContent = false) {
    return (
      this.#absDir === direntData.absDir &&
      this.#relDir === direntData.relDir &&
      this.#name === direntData.name &&
      this.#ext === direntData.ext &&
      (this.#contentHash !== "" && direntData.contentHash !== ""
        ? this.#contentHash === direntData.contentHash
        : true) &&
      (withContent
        ? (this.#content !== "" && direntData.content !== ""
            ? this.#content === direntData.content
            : true) && this.#contentEncoding === direntData.contentEncoding
        : true)
    );
  }

  serialize() {
    const obj = {};
    if (this.#absDir && this.#absDir !== "") {
      obj.absDir = this.#absDir;
    }
    if (this.#relDir && this.#relDir !== "") {
      obj.relDir = this.#relDir;
    }
    if (this.#name && this.#name !== "") {
      obj.name = this.#name;
    }
    if (this.#ext && this.#ext !== "") {
      obj.ext = this.#ext;
    }
    if (this.#contentEncoding && this.#contentEncoding !== "") {
      obj.contentEncoding = this.#contentEncoding;
    }
    if (this.#contentHash && this.#contentHash !== "") {
      obj.contentHash = this.#contentHash;
    }
    return obj;
  }

  deserialize({
    absDir = "",
    relDir = "",
    name = "",
    ext = "",
    contentHash = "",
    contentEncoding = "",
  }) {
    this.#absDir = absDir;
    this.#relDir = relDir;
    this.#name = name;
    this.#ext = ext;
    this.#contentHash = contentHash;
    this.#contentEncoding = contentEncoding;
    return this;
  }

  get full() {
    const hash =
      this.#contentHash &&
      getConfig().hash === true &&
      !isInArray(getConfig().hashOptions.exclude, (element) =>
        path.join(this.#absDir, `${this.#name}${this.#ext}`).endsWith(element),
      )
        ? `${getConfig().hashOptions.separator}${this.#contentHash}`
        : "";
    return `${this.#name}${hash}${this.#ext}`;
  }
  get abs() {
    return path.join(this.#absDir, this.full);
  }
  get rel() {
    return path.join(this.#relDir, this.full);
  }
}

export default DirentData;
