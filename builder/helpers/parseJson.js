import tryCatch from './tryCatch.js';
import { getLogger } from '../utils/index.js';

export async function parseJson(json) {
    return tryCatch(
        () => JSON.parse(json),
        (e) => getLogger().warn(8, `Failed to parse JSON ${json}`, e),
    );
}

export default parseJson;
