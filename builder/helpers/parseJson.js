export function parseJson(json) {
    let content;
    try {
        content = JSON.parse(json);
    } catch(e) {}
    return content;
}

export default parseJson;
