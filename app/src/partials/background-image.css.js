const backgroundImage = (cssDeclaration, config, files) => {
    const originalFileBase = cssDeclaration.value.split(':')[1];
    const originalFileName = originalFileBase.substring(0, originalFileBase.lastIndexOf('.'));
    
    let value = 'image-set(';
    for (let type of config.options.optimize.img.types) {
        for (let widthIndex in config.options.optimize.img.widths) {
            const width = config.options.optimize.img.widths[widthIndex];
            const newFileName = `${originalFileName}-${width}.${type}`;
            const imgFile = files.img.find((file) => file.base === newFileName);
            if (imgFile) {
                value += `url("${newFileName}") type("image/${type}") ${widthIndex + 1}x`
                if (widthIndex < config.options.optimize.img.widths.length - 1) {
                    value += ', ';
                }
            }
        }
    }

    cssDeclaration.property = 'background-image';
    cssDeclaration.value = value + ')';
    return cssDeclaration;
};

export default backgroundImage;
