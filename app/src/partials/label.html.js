const label = (element, attributes, config) => {
    let tempLabel = config.data.labels.en;
    let value = attributes['label-id'];
    const keys = value.split('.');

    for (let i = 0; i < keys.length; i++) {
        if (tempLabel.hasOwnProperty(keys[i])) {
            tempLabel = tempLabel[keys[i]];

            if (i === keys.length - 1) {
                value = tempLabel;
            }
        } else {
            break;
        }
    }

    if (Array.isArray(value)) {
        value = value.join('');
    }

    element.html(value);
    return element;
};

export default label;
