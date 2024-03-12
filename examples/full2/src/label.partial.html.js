const label = (data, dists, partialData) => {
  const lang = partialData.lang || data.langs[0];
  let value = partialData.id;
  const keys = value.split(".");
  let tempLabel = data.labels[lang];
  for (let i = 0; i < keys.length; i++) {
    if (tempLabel && tempLabel.hasOwnProperty(keys[i])) {
      tempLabel = tempLabel[keys[i]];

      if (i === keys.length - 1) {
        value = tempLabel;
      }
    } else {
      break;
    }
  }

  if (Array.isArray(value)) {
    value = value.join("");
  }

  return value;
};

export default label;
