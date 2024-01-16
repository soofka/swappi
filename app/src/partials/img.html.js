const img = (element, attributes, config, files) => {
    let picture = '<picture';
    for (let key of Object.keys(attributes)) {
        if (key !== 'name' && key !== 'src') {
            picture += ` ${key}="${attributes[key]}"`;
        }
    }
    picture += '>';

    for (let type of config.options.optimize.img.types) {
        picture += '<source srcet="';
        for (let widthIndex in config.options.optimize.img.widths) {
            const width = config.options.optimize.img.widths[widthIndex];
            const fileName = `${attributes.src.substring(0, attributes.src.lastIndexOf('.'))}-${width}.${type}`;
            const imgFile = files.img.find((file) => file.base === fileName);
            if (imgFile) {
                picture += `${imgFile.base} ${width}w`;
                if (widthIndex < config.options.optimize.img.widths.length - 1) {
                    picture += ', ';
                }
            }
        }
        picture += `" type="image/${type}">`
    }

    return picture + '</picture>';
}

export default img;
