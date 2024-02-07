export class DirentStatus {
  static Loaded = "loaded";
  static Prepared = "prepared";
  static Processed = "processed";
  static Broken = "broken";
  #status;
  get status() {
    return this.#status;
  }

  constructor() {
    this.#status = DirentStatus.Loaded;
  }
  
  constructor(status) {
    this.#status = status;
  }

  setLoaded() {
    this.#status = DirentStatus.Loaded;
  }

  setPrepared() {
    this.#status = DirentStatus.Prepared;
  }

  setProcessed() {
    this.#status = DirentStatus.Processed;
  }

  static getStatuses() {
    return [DirentStatus.Loaded, DirentStatus.Prepared, DirentStatus.Processed, DirentStatus.Broken];
  }
}
