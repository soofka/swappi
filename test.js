// class Test {
//     #dupa;

//     constructor() {
//         this.#dupa = 'doopa';
//     }

//     get dupa() {
//         return this.#dupa;
//     }

//     set dupa(dupa) {
//         this.#dupa = 'dupa! ' + dupa;
//     }

//     get cycki() {
//         return this.#dupa + ' i cycki do tego';
//     }
// }

// const t = new Test();
// console.log(t.dupa);
// t.dupa = 'szyszki';
// console.log(t.dupa);
// console.log(t.cycki);
// t.cycki = 'hehe';

import fs from 'fs/promises';
import path from 'path';
const zzz = path.resolve('app/build.js');

let module = '';
let result = '';
try {
    module = await import(path.join('file:///', zzz));
    result = module.default();
} catch(e) {
    console.log(e);
}

console.log(module, result);