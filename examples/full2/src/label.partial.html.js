const label = (data, dists, { id, lang }) => {
  const keys = id.split(".");
  let label = id;
  let tempLabel = data.labels[lang];
  for (let i = 0; i < keys.length; i++) {
    if (tempLabel && tempLabel.hasOwnProperty(keys[i])) {
      tempLabel = tempLabel[keys[i]];
      if (i === keys.length - 1) {
        label = tempLabel;
      }
    } else {
      break;
    }
  }

  if (Array.isArray(label)) {
    label = label.join("");
  }

  return label;
};

export default label;
